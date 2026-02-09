/**
 * Scheduled Function: End of Day
 * 
 * Runs at the end of each day to:
 * - Finalize daily stats
 * - Generate daily summaries
 * - Check for stalled goals
 * - Update streak counters
 */

import { onSchedule } from "firebase-functions/v2/scheduler";
import * as admin from "firebase-admin";
import { aggregateDailyStats } from "../aggregation/dailyStats";
import { generateDailySummary } from "../ai/dailySummary";
import { checkStalledGoals } from "../triggers/onGoalUpdate";
import { getSupabaseClient, SUPABASE_URL, SUPABASE_SERVICE_KEY } from "../config/supabase";
import { GEMINI_API_KEY } from "../config/genkit";
import { sendUserPushNotification, NOTIFICATION_TEMPLATES } from "../utils/notifications";

const db = admin.firestore();

/**
 * End of day processing - runs at 11:30 PM daily
 */
export const endOfDayProcessing = onSchedule({
    schedule: "30 23 * * *",
    timeZone: "UTC",
    secrets: [SUPABASE_URL, SUPABASE_SERVICE_KEY, GEMINI_API_KEY],
}, async () => {
    const todayStr = new Date().toISOString().split("T")[0];
    console.log(`Running end-of-day processing for ${todayStr}`);

    try {
        const activeUsersSnapshot = await db
            .collection("userState")
            .where("lastActiveDate", "==", todayStr)
            .get();

        const processPromises = activeUsersSnapshot.docs.map(async (userDoc: admin.firestore.QueryDocumentSnapshot) => {
            const firebaseUid = userDoc.id;
            try {
                await aggregateDailyStats(firebaseUid, todayStr);
                await generateDailySummary(firebaseUid, todayStr);
                await checkStalledGoals(firebaseUid);

                // Notify about daily summary being ready
                await sendUserPushNotification(firebaseUid, NOTIFICATION_TEMPLATES.WEEKLY_REVIEW());

                const userState = userDoc.data();
                const currentStreak = userState?.currentStreak || 0;

                const supabase = getSupabaseClient();
                await supabase.from("user_streaks").upsert(
                    {
                        firebase_uid: firebaseUid,
                        current_streak: currentStreak,
                        last_active_date: todayStr,
                        updated_at: new Date().toISOString(),
                    },
                    { onConflict: "firebase_uid" }
                );

                await userDoc.ref.update({
                    todayStats: {},
                });
            } catch (error) {
                console.error(`Error processing user ${firebaseUid}:`, error);
            }
        });

        await Promise.allSettled(processPromises);
    } catch (error) {
        console.error("Error in end-of-day processing:", error);
    }
});

/**
 * Morning check - runs at 8 AM
 */
export const morningCheck = onSchedule({
    schedule: "0 8 * * *",
    timeZone: "UTC",
    secrets: [SUPABASE_URL, SUPABASE_SERVICE_KEY],
}, async () => {
    try {
        const supabase = getSupabaseClient();
        const { data: users } = await supabase
            .from("user_preferences")
            .select("firebase_uid")
            .eq("morning_notification", true);

        if (!users) return;

        for (const user of users) {
            const topTaskSnapshot = await db.collection("goals")
                .where("firebaseUid", "==", user.firebase_uid)
                .where("completed", "==", false)
                .limit(1)
                .get();

            const topTask = topTaskSnapshot.empty ? "Setting your priorities" : topTaskSnapshot.docs[0].data().title;
            await sendUserPushNotification(user.firebase_uid, NOTIFICATION_TEMPLATES.MORNING_BOOST(topTask));
        }
    } catch (error) {
        console.error("Error in morning check:", error);
    }
});

/**
 * Daily Nudge - Mid-day check (2 PM) for empty plans or incomplete tasks
 */
export const dailyNudge = onSchedule({
    schedule: "0 14 * * *",
    timeZone: "UTC",
    secrets: [SUPABASE_URL, SUPABASE_SERVICE_KEY],
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
                await sendUserPushNotification(userId, NOTIFICATION_TEMPLATES.EMPTY_PLAN());
            } else if (goalsCompleted < goalsTotal) {
                const incompleteGoalSnapshot = await db.collection("goals")
                    .where("firebaseUid", "==", userId)
                    .where("completed", "==", false)
                    .limit(1)
                    .get();

                if (!incompleteGoalSnapshot.empty) {
                    const goalTitle = incompleteGoalSnapshot.docs[0].data().title;
                    await sendUserPushNotification(userId, NOTIFICATION_TEMPLATES.INCOMPLETE_PLAN(goalTitle));
                }
            }
        }
    } catch (error) {
        console.error("Error in daily nudge:", error);
    }
});
