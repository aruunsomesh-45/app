"use strict";
/**
 * Callable Function: Get Aggregated Stats
 *
 * HTTP callable function for the client to fetch pre-aggregated stats.
 * Reduces client-side computation and database queries.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getComparativeStats = exports.getTodayStats = exports.getAggregatedStats = void 0;
const https_1 = require("firebase-functions/v2/https");
const supabase_1 = require("../config/supabase");
const dailyStats_1 = require("../aggregation/dailyStats");
/**
 * Get aggregated stats for the authenticated user
 */
exports.getAggregatedStats = (0, https_1.onCall)({
    secrets: [supabase_1.SUPABASE_URL, supabase_1.SUPABASE_SERVICE_KEY],
}, async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError("unauthenticated", "User must be authenticated");
    }
    const firebaseUid = request.auth.uid;
    const { type, date, weekStart, weekEnd, limit = 7 } = request.data;
    if (!type) {
        throw new https_1.HttpsError("invalid-argument", "Stats type is required");
    }
    const supabase = (0, supabase_1.getSupabaseClient)();
    try {
        switch (type) {
            case "daily": {
                if (date) {
                    // Get specific day
                    const { data, error } = await supabase
                        .from("aggregated_daily_stats")
                        .select("*")
                        .eq("firebase_uid", firebaseUid)
                        .eq("date", date)
                        .single();
                    if (error && error.code !== "PGRST116") {
                        throw new Error(error.message);
                    }
                    return { success: true, stats: data || null };
                }
                else {
                    // Get recent days
                    const { data, error } = await supabase
                        .from("aggregated_daily_stats")
                        .select("*")
                        .eq("firebase_uid", firebaseUid)
                        .order("date", { ascending: false })
                        .limit(limit);
                    if (error) {
                        throw new Error(error.message);
                    }
                    return { success: true, stats: data || [] };
                }
            }
            case "weekly": {
                if (weekStart && weekEnd) {
                    // Get specific week
                    const { data, error } = await supabase
                        .from("aggregated_weekly_stats")
                        .select("*")
                        .eq("firebase_uid", firebaseUid)
                        .eq("week_start", weekStart)
                        .single();
                    if (error && error.code !== "PGRST116") {
                        throw new Error(error.message);
                    }
                    return { success: true, stats: data || null };
                }
                else {
                    // Get recent weeks
                    const { data, error } = await supabase
                        .from("aggregated_weekly_stats")
                        .select("*")
                        .eq("firebase_uid", firebaseUid)
                        .order("week_start", { ascending: false })
                        .limit(limit);
                    if (error) {
                        throw new Error(error.message);
                    }
                    return { success: true, stats: data || [] };
                }
            }
            case "monthly": {
                if (date) {
                    // Get specific month (date should be YYYY-MM)
                    const { data, error } = await supabase
                        .from("aggregated_monthly_stats")
                        .select("*")
                        .eq("firebase_uid", firebaseUid)
                        .eq("month", date)
                        .single();
                    if (error && error.code !== "PGRST116") {
                        throw new Error(error.message);
                    }
                    return { success: true, stats: data || null };
                }
                else {
                    // Get recent months
                    const { data, error } = await supabase
                        .from("aggregated_monthly_stats")
                        .select("*")
                        .eq("firebase_uid", firebaseUid)
                        .order("month", { ascending: false })
                        .limit(limit);
                    if (error) {
                        throw new Error(error.message);
                    }
                    return { success: true, stats: data || [] };
                }
            }
            default:
                throw new https_1.HttpsError("invalid-argument", "Invalid stats type");
        }
    }
    catch (error) {
        console.error("Error fetching aggregated stats:", error);
        throw new https_1.HttpsError("internal", "Failed to fetch stats");
    }
});
/**
 * Get today's real-time stats from Supabase
 * Uses the same aggregation logic as the daily summary for consistency
 */
exports.getTodayStats = (0, https_1.onCall)({
    secrets: [supabase_1.SUPABASE_URL, supabase_1.SUPABASE_SERVICE_KEY],
}, async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError("unauthenticated", "User must be authenticated");
    }
    const firebaseUid = request.auth.uid;
    const today = new Date().toISOString().split("T")[0];
    try {
        // Reuse the aggregation logic to get real-time stats from raw tables
        const stats = await (0, dailyStats_1.aggregateDailyStats)(firebaseUid, today);
        return {
            success: true,
            stats: {
                goalsCompleted: stats.goals_completed,
                goalsTotal: stats.goals_total,
                meditationMinutes: stats.meditation_minutes,
                workoutVolume: stats.workouts_completed, // Mapping 'workouts' to 'workoutVolume' for compatibility
                currentStreak: 0, // Streak calculation might need separate logic or be added to aggregation
                pagesRead: stats.pages_read,
                sleepHours: stats.sleep_hours,
                focusScore: stats.focus_score
            },
        };
    }
    catch (error) {
        console.error("Error fetching today's stats:", error);
        throw new https_1.HttpsError("internal", "Failed to fetch today's stats");
    }
});
/**
 * Get comparative stats (this week vs last week, this month vs last month)
 */
exports.getComparativeStats = (0, https_1.onCall)({
    secrets: [supabase_1.SUPABASE_URL, supabase_1.SUPABASE_SERVICE_KEY],
}, async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError("unauthenticated", "User must be authenticated");
    }
    const firebaseUid = request.auth.uid;
    const { type } = request.data;
    const supabase = (0, supabase_1.getSupabaseClient)();
    try {
        if (type === "weekly") {
            // Get last 2 weeks
            const { data, error } = await supabase
                .from("aggregated_weekly_stats")
                .select("*")
                .eq("firebase_uid", firebaseUid)
                .order("week_start", { ascending: false })
                .limit(2);
            if (error) {
                throw new Error(error.message);
            }
            const [thisWeek, lastWeek] = data || [];
            return {
                success: true,
                comparison: {
                    current: thisWeek || null,
                    previous: lastWeek || null,
                    changes: thisWeek && lastWeek ? {
                        focusScore: thisWeek.avg_focus_score - lastWeek.avg_focus_score,
                        goalCompletionRate: thisWeek.goal_completion_rate - lastWeek.goal_completion_rate,
                        workouts: thisWeek.total_workouts - lastWeek.total_workouts,
                    } : null,
                },
            };
        }
        else {
            // Get last 2 months
            const { data, error } = await supabase
                .from("aggregated_monthly_stats")
                .select("*")
                .eq("firebase_uid", firebaseUid)
                .order("month", { ascending: false })
                .limit(2);
            if (error) {
                throw new Error(error.message);
            }
            const [thisMonth, lastMonth] = data || [];
            return {
                success: true,
                comparison: {
                    current: thisMonth || null,
                    previous: lastMonth || null,
                    changes: thisMonth && lastMonth ? {
                        focusScore: thisMonth.avg_focus_score - lastMonth.avg_focus_score,
                        goalCompletionRate: thisMonth.goal_completion_rate - lastMonth.goal_completion_rate,
                        workouts: thisMonth.total_workouts - lastMonth.total_workouts,
                    } : null,
                },
            };
        }
    }
    catch (error) {
        console.error("Error fetching comparative stats:", error);
        throw new https_1.HttpsError("internal", "Failed to fetch comparative stats");
    }
});
//# sourceMappingURL=getAggregatedStats.js.map