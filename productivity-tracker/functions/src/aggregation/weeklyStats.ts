/**
 * Weekly Stats Aggregation Function
 * 
 * Rolls up daily stats into weekly summaries.
 * Identifies best/worst days and calculates averages.
 */

import { onCall, HttpsError } from "firebase-functions/v2/https";
import { getSupabaseClient, WeeklyStats, SUPABASE_URL, SUPABASE_SERVICE_KEY } from "../config/supabase";

/**
 * Get the start and end of a week containing a given date
 */
function getWeekBounds(date: Date): { start: string; end: string } {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday start
    const weekStart = new Date(date);
    weekStart.setDate(diff);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    return {
        start: weekStart.toISOString().split("T")[0],
        end: weekEnd.toISOString().split("T")[0],
    };
}

/**
 * Aggregate weekly stats for a user
 */
export async function aggregateWeeklyStats(
    firebaseUid: string,
    weekStart: string,
    weekEnd: string
): Promise<WeeklyStats> {
    const supabase = getSupabaseClient();

    // Fetch all daily stats for the week
    const { data: dailyStats, error } = await supabase
        .from("aggregated_daily_stats")
        .select("*")
        .eq("firebase_uid", firebaseUid)
        .gte("date", weekStart)
        .lte("date", weekEnd)
        .order("date");

    if (error) {
        throw new Error(`Failed to fetch daily stats: ${error.message}`);
    }

    const stats = dailyStats || [];
    const daysWithData = stats.length;

    if (daysWithData === 0) {
        // Return empty stats if no data
        const emptyStats: WeeklyStats = {
            firebase_uid: firebaseUid,
            week_start: weekStart,
            week_end: weekEnd,
            avg_focus_score: 0,
            total_sleep_hours: 0,
            total_steps: 0,
            total_workouts: 0,
            total_pages_read: 0,
            total_meditation_minutes: 0,
            goal_completion_rate: 0,
            best_day: "",
            worst_day: "",
        };

        await supabase
            .from("aggregated_weekly_stats")
            .upsert(emptyStats, { onConflict: "firebase_uid,week_start" });

        return emptyStats;
    }

    // Calculate aggregates
    const totals = stats.reduce(
        (acc, day) => ({
            focusScore: acc.focusScore + (day.focus_score || 0),
            sleepHours: acc.sleepHours + (day.sleep_hours || 0),
            steps: acc.steps + (day.steps || 0),
            workouts: acc.workouts + (day.workouts_completed || 0),
            pagesRead: acc.pagesRead + (day.pages_read || 0),
            meditationMinutes: acc.meditationMinutes + (day.meditation_minutes || 0),
            goalsCompleted: acc.goalsCompleted + (day.goals_completed || 0),
            goalsTotal: acc.goalsTotal + (day.goals_total || 0),
        }),
        {
            focusScore: 0,
            sleepHours: 0,
            steps: 0,
            workouts: 0,
            pagesRead: 0,
            meditationMinutes: 0,
            goalsCompleted: 0,
            goalsTotal: 0,
        }
    );

    // Find best and worst days by focus score
    const sortedByFocus = [...stats].sort(
        (a, b) => (b.focus_score || 0) - (a.focus_score || 0)
    );
    const bestDay = sortedByFocus[0]?.date || "";
    const worstDay = sortedByFocus[sortedByFocus.length - 1]?.date || "";

    // Calculate goal completion rate
    const goalCompletionRate =
        totals.goalsTotal > 0
            ? Math.round((totals.goalsCompleted / totals.goalsTotal) * 100)
            : 0;

    const weeklyStats: WeeklyStats = {
        firebase_uid: firebaseUid,
        week_start: weekStart,
        week_end: weekEnd,
        avg_focus_score: Math.round(totals.focusScore / daysWithData),
        total_sleep_hours: Math.round(totals.sleepHours * 10) / 10,
        total_steps: totals.steps,
        total_workouts: totals.workouts,
        total_pages_read: totals.pagesRead,
        total_meditation_minutes: totals.meditationMinutes,
        goal_completion_rate: goalCompletionRate,
        best_day: bestDay,
        worst_day: worstDay,
    };

    // Upsert to weekly stats table
    const { error: upsertError } = await supabase
        .from("aggregated_weekly_stats")
        .upsert(weeklyStats, { onConflict: "firebase_uid,week_start" });

    if (upsertError) {
        throw new Error(`Failed to save weekly stats: ${upsertError.message}`);
    }

    return weeklyStats;
}

/**
 * HTTP Callable function for weekly aggregation
 */
export const aggregateWeeklyStatsCallable = onCall({
    secrets: [SUPABASE_URL, SUPABASE_SERVICE_KEY],
}, async (request) => {
    if (!request.auth) {
        throw new HttpsError("unauthenticated", "User must be authenticated");
    }

    const firebaseUid = request.auth.uid;
    const { weekStart, weekEnd } = request.data as { weekStart?: string; weekEnd?: string };

    // Default to current week if not specified
    const bounds = weekStart && weekEnd
        ? { start: weekStart, end: weekEnd }
        : getWeekBounds(new Date());

    try {
        const stats = await aggregateWeeklyStats(
            firebaseUid,
            bounds.start,
            bounds.end
        );
        return { success: true, stats };
    } catch (error) {
        console.error("Error in aggregateWeeklyStats:", error);
        throw new HttpsError("internal", "Failed to aggregate weekly stats");
    }
});
