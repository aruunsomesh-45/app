/**
 * Daily Stats Aggregation Function
 * 
 * Aggregates all user activity for a specific day into a single stats record.
 * This removes the need for clients to calculate stats on every render.
 */

import { onCall, HttpsError } from "firebase-functions/v2/https";
import { getSupabaseClient, UserStats, SUPABASE_URL, SUPABASE_SERVICE_KEY } from "../config/supabase";

interface DailyStatsInput {
    firebaseUid: string;
    date: string; // YYYY-MM-DD format
}

/**
 * Calculate focus score based on various factors
 */
function calculateFocusScore(
    goalsCompleted: number,
    goalsTotal: number,
    meditationMinutes: number,
    sleepHours: number
): number {
    let score = 0;

    // Goal completion weight: 40%
    if (goalsTotal > 0) {
        score += (goalsCompleted / goalsTotal) * 40;
    }

    // Meditation weight: 20% (max at 20 minutes)
    score += Math.min(meditationMinutes / 20, 1) * 20;

    // Sleep weight: 40% (optimal 7-9 hours)
    if (sleepHours >= 7 && sleepHours <= 9) {
        score += 40;
    } else if (sleepHours >= 6 && sleepHours < 7) {
        score += 30;
    } else if (sleepHours > 9) {
        score += 35;
    } else {
        score += Math.max(0, sleepHours * 5);
    }

    return Math.round(Math.min(score, 100));
}

/**
 * Aggregate daily stats for a user
 * Called by scheduled function or on-demand
 */
export async function aggregateDailyStats(
    firebaseUid: string,
    date: string
): Promise<UserStats> {
    const supabase = getSupabaseClient();

    // Fetch all relevant data for the day
    const [
        meditationResult,
        readingResult,
        tasksResult,
        workoutsResult,
    ] = await Promise.all([
        supabase
            .from("meditation_sessions")
            .select("duration")
            .eq("firebase_uid", firebaseUid)
            .eq("date", date),
        supabase
            .from("reading_sessions")
            .select("pages_read")
            .eq("firebase_uid", firebaseUid)
            .eq("date", date),
        supabase
            .from("daily_tasks")
            .select("completed")
            .eq("firebase_uid", firebaseUid)
            .eq("date", date),
        supabase
            .from("workout_sessions")
            .select("id")
            .eq("firebase_uid", firebaseUid)
            .eq("date", date),
    ]);

    // Calculate aggregates
    const meditationMinutes = meditationResult.data?.reduce(
        (sum, s) => sum + (s.duration || 0),
        0
    ) || 0;

    const pagesRead = readingResult.data?.reduce(
        (sum, s) => sum + (s.pages_read || 0),
        0
    ) || 0;

    const tasks = tasksResult.data || [];
    const goalsTotal = tasks.length;
    const goalsCompleted = tasks.filter((t) => t.completed).length;

    const workoutsCompleted = workoutsResult.data?.length || 0;

    // Get sleep and steps from health data (if available)
    const { data: healthData } = await supabase
        .from("health_data")
        .select("sleep_hours, steps")
        .eq("firebase_uid", firebaseUid)
        .eq("date", date)
        .single();

    const sleepHours = healthData?.sleep_hours || 0;
    const steps = healthData?.steps || 0;

    // Calculate focus score
    const focusScore = calculateFocusScore(
        goalsCompleted,
        goalsTotal,
        meditationMinutes,
        sleepHours
    );

    // Get current streak
    const { data: streakData } = await supabase
        .from("user_streaks")
        .select("current_streak")
        .eq("firebase_uid", firebaseUid)
        .single();

    const streakDays = streakData?.current_streak || 0;

    // Create stats object
    const stats: UserStats = {
        firebase_uid: firebaseUid,
        date,
        focus_score: focusScore,
        sleep_hours: sleepHours,
        steps,
        workouts_completed: workoutsCompleted,
        pages_read: pagesRead,
        meditation_minutes: meditationMinutes,
        goals_completed: goalsCompleted,
        goals_total: goalsTotal,
        streak_days: streakDays,
        updated_at: new Date().toISOString(),
    };

    // Upsert to aggregated stats table
    const { error } = await supabase
        .from("aggregated_daily_stats")
        .upsert(stats, { onConflict: "firebase_uid,date" });

    if (error) {
        console.error("Error upserting daily stats:", error);
        throw new Error(`Failed to save daily stats: ${error.message}`);
    }

    return stats;
}

/**
 * HTTP Callable function for on-demand aggregation
 */
export const aggregateDailyStatsCallable = onCall({
    secrets: [SUPABASE_URL, SUPABASE_SERVICE_KEY],
}, async (request) => {
    if (!request.auth) {
        throw new HttpsError("unauthenticated", "User must be authenticated");
    }

    const { date } = request.data as DailyStatsInput;
    const firebaseUid = request.auth.uid;

    if (!date) {
        throw new HttpsError("invalid-argument", "Date is required");
    }

    try {
        const stats = await aggregateDailyStats(firebaseUid, date);
        return { success: true, stats };
    } catch (error) {
        console.error("Error in aggregateDailyStats:", error);
        throw new HttpsError("internal", "Failed to aggregate stats");
    }
});
