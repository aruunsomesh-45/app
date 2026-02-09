/**
 * Monthly Stats Aggregation Function
 * 
 * Rolls up weekly stats into monthly summaries.
 * Calculates long-term trends and achievements.
 */

import { onCall, HttpsError } from "firebase-functions/v2/https";
import { getSupabaseClient, MonthlyStats, SUPABASE_URL, SUPABASE_SERVICE_KEY } from "../config/supabase";

/**
 * Get month bounds for a given date
 */
function getMonthBounds(date: Date): { start: string; end: string; month: string } {
    const year = date.getFullYear();
    const month = date.getMonth();

    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0);

    return {
        start: monthStart.toISOString().split("T")[0],
        end: monthEnd.toISOString().split("T")[0],
        month: `${year}-${String(month + 1).padStart(2, "0")}`,
    };
}

/**
 * Aggregate monthly stats for a user
 */
export async function aggregateMonthlyStats(
    firebaseUid: string,
    monthStr: string // YYYY-MM format
): Promise<MonthlyStats> {
    const supabase = getSupabaseClient();

    // Parse month string
    const [year, month] = monthStr.split("-").map(Number);
    const date = new Date(year, month - 1, 1);
    const bounds = getMonthBounds(date);

    // Fetch all daily stats for the month
    const { data: dailyStats, error } = await supabase
        .from("aggregated_daily_stats")
        .select("*")
        .eq("firebase_uid", firebaseUid)
        .gte("date", bounds.start)
        .lte("date", bounds.end);

    if (error) {
        throw new Error(`Failed to fetch daily stats: ${error.message}`);
    }

    const stats = dailyStats || [];
    const daysWithData = stats.length;

    if (daysWithData === 0) {
        const emptyStats: MonthlyStats = {
            firebase_uid: firebaseUid,
            month: monthStr,
            avg_focus_score: 0,
            total_workouts: 0,
            total_pages_read: 0,
            total_meditation_minutes: 0,
            goal_completion_rate: 0,
            longest_streak: 0,
        };

        await supabase
            .from("aggregated_monthly_stats")
            .upsert(emptyStats, { onConflict: "firebase_uid,month" });

        return emptyStats;
    }

    // Calculate aggregates
    const totals = stats.reduce(
        (acc, day) => ({
            focusScore: acc.focusScore + (day.focus_score || 0),
            workouts: acc.workouts + (day.workouts_completed || 0),
            pagesRead: acc.pagesRead + (day.pages_read || 0),
            meditationMinutes: acc.meditationMinutes + (day.meditation_minutes || 0),
            goalsCompleted: acc.goalsCompleted + (day.goals_completed || 0),
            goalsTotal: acc.goalsTotal + (day.goals_total || 0),
        }),
        {
            focusScore: 0,
            workouts: 0,
            pagesRead: 0,
            meditationMinutes: 0,
            goalsCompleted: 0,
            goalsTotal: 0,
        }
    );

    // Calculate longest streak in the month
    let longestStreak = 0;
    let currentStreak = 0;

    // Sort by date and check for consecutive days with activity
    const sortedStats = [...stats].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    for (const day of sortedStats) {
        if (day.goals_completed > 0 || day.workouts_completed > 0) {
            currentStreak++;
            longestStreak = Math.max(longestStreak, currentStreak);
        } else {
            currentStreak = 0;
        }
    }

    const goalCompletionRate =
        totals.goalsTotal > 0
            ? Math.round((totals.goalsCompleted / totals.goalsTotal) * 100)
            : 0;

    const monthlyStats: MonthlyStats = {
        firebase_uid: firebaseUid,
        month: monthStr,
        avg_focus_score: Math.round(totals.focusScore / daysWithData),
        total_workouts: totals.workouts,
        total_pages_read: totals.pagesRead,
        total_meditation_minutes: totals.meditationMinutes,
        goal_completion_rate: goalCompletionRate,
        longest_streak: longestStreak,
    };

    // Upsert to monthly stats table
    const { error: upsertError } = await supabase
        .from("aggregated_monthly_stats")
        .upsert(monthlyStats, { onConflict: "firebase_uid,month" });

    if (upsertError) {
        throw new Error(`Failed to save monthly stats: ${upsertError.message}`);
    }

    return monthlyStats;
}

/**
 * HTTP Callable function for monthly aggregation
 */
export const aggregateMonthlyStatsCallable = onCall({
    secrets: [SUPABASE_URL, SUPABASE_SERVICE_KEY],
}, async (request) => {
    if (!request.auth) {
        throw new HttpsError("unauthenticated", "User must be authenticated");
    }

    const firebaseUid = request.auth.uid;
    const { month } = request.data as { month?: string };

    // Default to current month if not specified
    const targetMonth = month || getMonthBounds(new Date()).month;

    try {
        const stats = await aggregateMonthlyStats(firebaseUid, targetMonth);
        return { success: true, stats };
    } catch (error) {
        console.error("Error in aggregateMonthlyStats:", error);
        throw new HttpsError("internal", "Failed to aggregate monthly stats");
    }
});
