"use strict";
/**
 * Scheduled Function: End of Day
 *
 * Runs at the end of each day to:
 * - Finalize daily stats
 * - Generate daily summaries
 * - Check for stalled goals
 * - Update streak counters
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
exports.dailyNudge = exports.morningCheck = exports.endOfDayProcessing = void 0;
const scheduler_1 = require("firebase-functions/v2/scheduler");
const admin = __importStar(require("firebase-admin"));
const dailyStats_1 = require("../aggregation/dailyStats");
const dailySummary_1 = require("../ai/dailySummary");
const onGoalUpdate_1 = require("../triggers/onGoalUpdate");
const supabase_1 = require("../config/supabase");
const genkit_1 = require("../config/genkit");
const notifications_1 = require("../utils/notifications");
const db = admin.firestore();
/**
 * End of day processing - runs at 11:30 PM daily
 */
exports.endOfDayProcessing = (0, scheduler_1.onSchedule)({
    schedule: "30 23 * * *",
    timeZone: "UTC",
    secrets: [supabase_1.SUPABASE_URL, supabase_1.SUPABASE_SERVICE_KEY, genkit_1.GEMINI_API_KEY],
}, async () => {
    const todayStr = new Date().toISOString().split("T")[0];
    console.log(`Running end-of-day processing for ${todayStr}`);
    try {
        const activeUsersSnapshot = await db
            .collection("userState")
            .where("lastActiveDate", "==", todayStr)
            .get();
        const processPromises = activeUsersSnapshot.docs.map(async (userDoc) => {
            const firebaseUid = userDoc.id;
            try {
                await (0, dailyStats_1.aggregateDailyStats)(firebaseUid, todayStr);
                await (0, dailySummary_1.generateDailySummary)(firebaseUid, todayStr);
                await (0, onGoalUpdate_1.checkStalledGoals)(firebaseUid);
                // Notify about daily summary being ready
                await (0, notifications_1.sendUserPushNotification)(firebaseUid, notifications_1.NOTIFICATION_TEMPLATES.WEEKLY_REVIEW());
                const userState = userDoc.data();
                const currentStreak = userState?.currentStreak || 0;
                const supabase = (0, supabase_1.getSupabaseClient)();
                await supabase.from("user_streaks").upsert({
                    firebase_uid: firebaseUid,
                    current_streak: currentStreak,
                    last_active_date: todayStr,
                    updated_at: new Date().toISOString(),
                }, { onConflict: "firebase_uid" });
                await userDoc.ref.update({
                    todayStats: {},
                });
            }
            catch (error) {
                console.error(`Error processing user ${firebaseUid}:`, error);
            }
        });
        await Promise.allSettled(processPromises);
    }
    catch (error) {
        console.error("Error in end-of-day processing:", error);
    }
});
/**
 * Morning check - runs at 8 AM
 */
exports.morningCheck = (0, scheduler_1.onSchedule)({
    schedule: "0 8 * * *",
    timeZone: "UTC",
    secrets: [supabase_1.SUPABASE_URL, supabase_1.SUPABASE_SERVICE_KEY],
}, async () => {
    try {
        const supabase = (0, supabase_1.getSupabaseClient)();
        const { data: users } = await supabase
            .from("user_preferences")
            .select("firebase_uid")
            .eq("morning_notification", true);
        if (!users)
            return;
        for (const user of users) {
            const topTaskSnapshot = await db.collection("goals")
                .where("firebaseUid", "==", user.firebase_uid)
                .where("completed", "==", false)
                .limit(1)
                .get();
            const topTask = topTaskSnapshot.empty ? "Setting your priorities" : topTaskSnapshot.docs[0].data().title;
            await (0, notifications_1.sendUserPushNotification)(user.firebase_uid, notifications_1.NOTIFICATION_TEMPLATES.MORNING_BOOST(topTask));
        }
    }
    catch (error) {
        console.error("Error in morning check:", error);
    }
});
/**
 * Daily Nudge - Mid-day check (2 PM) for empty plans or incomplete tasks
 */
exports.dailyNudge = (0, scheduler_1.onSchedule)({
    schedule: "0 14 * * *",
    timeZone: "UTC",
    secrets: [supabase_1.SUPABASE_URL, supabase_1.SUPABASE_SERVICE_KEY],
}, async () => {
    console.log("Running daily nudge check...");
    try {
        const usersSnapshot = await db.collection("userState").get();
        for (const userDoc of usersSnapshot.docs) {
            const userId = userDoc.id;
            const stats = userDoc.data()?.todayStats || {};
            const goalsTotal = stats.goalsTotal || 0;
            const goalsCompleted = stats.goalsCompleted || 0;
            if (goalsTotal === 0) {
                await (0, notifications_1.sendUserPushNotification)(userId, notifications_1.NOTIFICATION_TEMPLATES.EMPTY_PLAN());
            }
            else if (goalsCompleted < goalsTotal) {
                const incompleteGoalSnapshot = await db.collection("goals")
                    .where("firebaseUid", "==", userId)
                    .where("completed", "==", false)
                    .limit(1)
                    .get();
                if (!incompleteGoalSnapshot.empty) {
                    const goalTitle = incompleteGoalSnapshot.docs[0].data().title;
                    await (0, notifications_1.sendUserPushNotification)(userId, notifications_1.NOTIFICATION_TEMPLATES.INCOMPLETE_PLAN(goalTitle));
                }
            }
        }
    }
    catch (error) {
        console.error("Error in daily nudge:", error);
    }
});
//# sourceMappingURL=endOfDay.js.map