"use strict";
/**
 * Scheduled Function: End of Week
 *
 * Runs at the end of each week to:
 * - Generate weekly stats
 * - Generate weekly review
 * - Identify trends and patterns
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.endOfMonthProcessing = exports.endOfWeekProcessing = void 0;
const scheduler_1 = require("firebase-functions/v2/scheduler");
const admin = __importStar(require("firebase-admin"));
const weeklyStats_1 = require("../aggregation/weeklyStats");
const monthlyStats_1 = require("../aggregation/monthlyStats");
const weeklyReview_1 = require("../ai/weeklyReview");
const supabase_1 = require("../config/supabase");
const genkit_1 = require("../config/genkit");
const db = admin.firestore();
/**
 * Get week bounds for a given date
 */
function getWeekBounds(date) {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
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
 * End of week processing - runs every Sunday at 9 PM
 */
exports.endOfWeekProcessing = (0, scheduler_1.onSchedule)({
    schedule: "0 21 * * 0", // 9:00 PM UTC every Sunday
    timeZone: "UTC",
    secrets: [supabase_1.SUPABASE_URL, supabase_1.SUPABASE_SERVICE_KEY, genkit_1.GEMINI_API_KEY],
}, async () => {
    const now = new Date();
    const weekBounds = getWeekBounds(now);
    console.log(`Running end-of-week processing for ${weekBounds.start} to ${weekBounds.end}`);
    try {
        const supabase = (0, supabase_1.getSupabaseClient)();
        // Get all users who had activity this week
        const { data: activeUsers, error } = await supabase
            .from("aggregated_daily_stats")
            .select("firebase_uid")
            .gte("date", weekBounds.start)
            .lte("date", weekBounds.end);
        if (error) {
            console.error("Failed to fetch active users:", error);
            return;
        }
        // Get unique user IDs
        const uniqueUsers = [...new Set(activeUsers?.map((u) => u.firebase_uid) || [])];
        console.log(`Processing ${uniqueUsers.length} users for weekly review`);
        // Process each user
        const processPromises = uniqueUsers.map(async (firebaseUid) => {
            try {
                // 1. Generate weekly stats
                const weeklyStats = await (0, weeklyStats_1.aggregateWeeklyStats)(firebaseUid, weekBounds.start, weekBounds.end);
                // 2. Generate weekly AI review
                await (0, weeklyReview_1.generateWeeklyReview)(firebaseUid, weekBounds.start, weekBounds.end);
                // 3. Create notification for weekly review
                await db.collection("notifications").add({
                    firebaseUid,
                    type: "weekly_review",
                    message: "Your weekly review is ready! See how you did this week.",
                    read: false,
                    metadata: {
                        avgFocusScore: weeklyStats.avg_focus_score,
                        goalCompletionRate: weeklyStats.goal_completion_rate,
                    },
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                });
                console.log(`Completed weekly processing for user ${firebaseUid}`);
            }
            catch (error) {
                console.error(`Error processing user ${firebaseUid}:`, error);
            }
        });
        await Promise.allSettled(processPromises);
        console.log("End-of-week processing completed");
    }
    catch (error) {
        console.error("Error in end-of-week processing:", error);
        throw error;
    }
});
/**
 * End of month processing - runs on the 1st of each month at 6 AM
 */
exports.endOfMonthProcessing = (0, scheduler_1.onSchedule)({
    schedule: "0 6 1 * *", // 6:00 AM UTC on the 1st of each month
    timeZone: "UTC",
    secrets: [supabase_1.SUPABASE_URL, supabase_1.SUPABASE_SERVICE_KEY],
}, async () => {
    // Get last month
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const monthStr = lastMonth.toISOString().slice(0, 7); // YYYY-MM format
    console.log(`Running end-of-month processing for ${monthStr}`);
    try {
        const supabase = (0, supabase_1.getSupabaseClient)();
        // Get all users who had activity last month
        const monthStart = `${monthStr}-01`;
        const monthEnd = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0)
            .toISOString()
            .split("T")[0];
        const { data: activeUsers, error } = await supabase
            .from("aggregated_daily_stats")
            .select("firebase_uid")
            .gte("date", monthStart)
            .lte("date", monthEnd);
        if (error) {
            console.error("Failed to fetch active users:", error);
            return;
        }
        const uniqueUsers = [...new Set(activeUsers?.map((u) => u.firebase_uid) || [])];
        console.log(`Processing ${uniqueUsers.length} users for monthly review`);
        // Process each user
        const processPromises = uniqueUsers.map(async (firebaseUid) => {
            try {
                // Generate monthly stats
                const monthlyStats = await (0, monthlyStats_1.aggregateMonthlyStats)(firebaseUid, monthStr);
                // Create monthly recap notification
                await db.collection("notifications").add({
                    firebaseUid,
                    type: "monthly_recap",
                    message: `Your ${lastMonth.toLocaleDateString("en-US", { month: "long" })} recap is ready!`,
                    read: false,
                    metadata: {
                        avgFocusScore: monthlyStats.avg_focus_score,
                        totalWorkouts: monthlyStats.total_workouts,
                        longestStreak: monthlyStats.longest_streak,
                    },
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                });
                console.log(`Completed monthly processing for user ${firebaseUid}`);
            }
            catch (error) {
                console.error(`Error processing user ${firebaseUid}:`, error);
            }
        });
        await Promise.allSettled(processPromises);
        console.log("End-of-month processing completed");
    }
    catch (error) {
        console.error("Error in end-of-month processing:", error);
        throw error;
    }
});
//# sourceMappingURL=endOfWeek.js.map