/**
 * Firestore Trigger: On Goal Update
 * 
 * Triggers when a goal status changes.
 * Detects goal completions and stalled goals.
 */

import { onDocumentUpdated, onDocumentCreated } from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";
import { generateGoalSuggestions } from "../ai/goalBuddySuggestions";
import { SUPABASE_URL, SUPABASE_SERVICE_KEY } from "../config/supabase";
import { GEMINI_API_KEY } from "../config/genkit";

import { sendUserPushNotification, NOTIFICATION_TEMPLATES } from "../utils/notifications";

const db = admin.firestore();

/**
 * Handle goal completion
 */
export const onGoalComplete = onDocumentUpdated({
    document: "goals/{goalId}",
    secrets: [SUPABASE_URL, SUPABASE_SERVICE_KEY, GEMINI_API_KEY],
}, async (event) => {
    const beforeData = event.data?.before?.data();
    const afterData = event.data?.after?.data();

    if (!beforeData || !afterData) return;

    const { firebaseUid } = afterData;
    if (!firebaseUid) return;

    // Check if goal was just completed
    if (!beforeData.completed && afterData.completed) {
        console.log(`Goal completed: ${afterData.title}`);

        try {
            // Update completion stats in Firestore
            const userStateRef = db.collection("userState").doc(firebaseUid);
            await userStateRef.set(
                {
                    [`todayStats.goalsCompleted`]: admin.firestore.FieldValue.increment(1),
                    lastGoalCompletion: admin.firestore.FieldValue.serverTimestamp(),
                },
                { merge: true }
            );

            // Check if all goals are completed
            const userState = await userStateRef.get();
            const stateData = userState.data();
            const goalsTotal = stateData?.todayStats?.goalsTotal || 0;
            const goalsCompleted = stateData?.todayStats?.goalsCompleted || 0;

            if (goalsTotal > 0 && goalsCompleted >= goalsTotal) {
                await sendUserPushNotification(firebaseUid, NOTIFICATION_TEMPLATES.ALL_COMPLETED());
            }

            // Check for streak celebration
            const currentStreak = stateData?.goalStreak || 0;

            // If this is a streak milestone, send push notification
            if ([3, 7, 14, 21, 30].includes(currentStreak + 1)) {
                await sendUserPushNotification(firebaseUid, NOTIFICATION_TEMPLATES.STREAK_MILESTONE(currentStreak + 1));

                // Also add to internal notifications
                await db.collection("notifications").add({
                    firebaseUid,
                    type: "streak_milestone",
                    message: `🔥 ${currentStreak + 1}-day streak!`,
                    read: false,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                });
            }
        } catch (error) {
            console.error("Error processing goal completion:", error);
        }
    }

    // Check if goal was reactivated (uncompleted)
    if (beforeData.completed && !afterData.completed) {
        console.log(`Goal reactivated: ${afterData.title}`);
        const userStateRef = db.collection("userState").doc(firebaseUid);
        await userStateRef.set(
            {
                [`todayStats.goalsCompleted`]: admin.firestore.FieldValue.increment(-1),
            },
            { merge: true }
        );
    }
});

/**
 * Handle new goal creation
 * Generates AI suggestions when goals are created
 */
export const onGoalCreate = onDocumentCreated({
    document: "goals/{goalId}",
    secrets: [SUPABASE_URL, SUPABASE_SERVICE_KEY, GEMINI_API_KEY],
}, async (event) => {
    const snapshot = event.data;
    if (!snapshot) return;

    const data = snapshot.data();
    const { firebaseUid, title } = data;

    if (!firebaseUid) return;

    console.log(`New goal created: ${title}`);

    try {
        // Update goal count in real-time state
        const userStateRef = db.collection("userState").doc(firebaseUid);
        await userStateRef.set(
            {
                [`todayStats.goalsTotal`]: admin.firestore.FieldValue.increment(1),
                lastGoalCreation: admin.firestore.FieldValue.serverTimestamp(),
            },
            { merge: true }
        );

        // Check if user has many incomplete goals (potential overload)
        const userState = await userStateRef.get();
        const stateData = userState.data();
        const goalsTotal = stateData?.todayStats?.goalsTotal || 0;
        const goalsCompleted = stateData?.todayStats?.goalsCompleted || 0;

        if (goalsTotal - goalsCompleted > 8) {
            // Send push notification for goal overload
            await sendUserPushNotification(firebaseUid, NOTIFICATION_TEMPLATES.GOAL_OVERLOAD());

            // Create internal notification
            await db.collection("notifications").add({
                firebaseUid,
                type: "goal_overload",
                message: "You have many open goals. Consider prioritizing a few key ones.",
                read: false,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
            });

            // Trigger Goal Buddy suggestions
            await generateGoalSuggestions(firebaseUid);
        }
    } catch (error) {
        console.error("Error processing new goal:", error);
    }
});

/**
 * Detect stalled goals (scheduled check in endOfDay.ts calls this)
 */
export async function checkStalledGoals(firebaseUid: string): Promise<void> {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

    // Query goals that haven't been updated in 3+ days
    const stalledGoalsSnapshot = await db
        .collection("goals")
        .where("firebaseUid", "==", firebaseUid)
        .where("completed", "==", false)
        .where("updatedAt", "<", threeDaysAgo)
        .get();

    if (stalledGoalsSnapshot.size > 0) {
        console.log(`Found ${stalledGoalsSnapshot.size} stalled goals for user ${firebaseUid}`);

        // Send push notification
        await sendUserPushNotification(firebaseUid, NOTIFICATION_TEMPLATES.STALLED_GOAL(stalledGoalsSnapshot.size));

        // Create internal notification 
        await db.collection("notifications").add({
            firebaseUid,
            type: "stalled_goals",
            message: `You have ${stalledGoalsSnapshot.size} goals that haven't been updated in a while. Need help breaking them down?`,
            read: false,
            metadata: {
                stalledGoalIds: stalledGoalsSnapshot.docs.map((d) => d.id),
            },
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Trigger Goal Buddy AI
        await generateGoalSuggestions(
            firebaseUid,
            stalledGoalsSnapshot.docs.map((d) => d.id)
        );
    }
}
