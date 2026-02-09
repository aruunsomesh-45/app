/**
 * Firestore Trigger: On Session Create
 * 
 * Triggers when a new session is logged (workout, meditation, reading, etc.)
 * Updates real-time state in Firestore and triggers aggregation.
 */

import { onDocumentCreated } from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";
import { aggregateDailyStats } from "../aggregation/dailyStats";
import { SUPABASE_URL, SUPABASE_SERVICE_KEY } from "../config/supabase";

const db = admin.firestore();

/**
 * Handle new session creation
 * Updates streak counters and triggers re-aggregation
 */
export const onSessionCreate = onDocumentCreated({
    document: "sessions/{sessionId}",
    secrets: [SUPABASE_URL, SUPABASE_SERVICE_KEY],
}, async (event) => {
    const snapshot = event.data;
    if (!snapshot) {
        console.log("No data in session document");
        return;
    }

    const sessionData = snapshot.data();
    const { firebaseUid, type, date, duration } = sessionData;

    if (!firebaseUid || !type || !date) {
        console.error("Missing required fields in session data");
        return;
    }

    console.log(`New ${type} session created for user ${firebaseUid}`);

    try {
        // Update real-time state in Firestore
        const userStateRef = db.collection("userState").doc(firebaseUid);
        const userState = await userStateRef.get();

        const today = new Date().toISOString().split("T")[0];
        const updates: Record<string, unknown> = {
            lastActivity: admin.firestore.FieldValue.serverTimestamp(),
            [`todayStats.${type}Count`]: admin.firestore.FieldValue.increment(1),
        };

        if (duration) {
            updates[`todayStats.${type}Minutes`] = admin.firestore.FieldValue.increment(duration);
        }

        // Update streak if this is the first activity today
        if (!userState.exists || userState.data()?.lastActiveDate !== today) {
            const lastActiveDate = userState.data()?.lastActiveDate;
            const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
                .toISOString()
                .split("T")[0];

            if (lastActiveDate === yesterday) {
                // Continue streak
                updates.currentStreak = admin.firestore.FieldValue.increment(1);
            } else {
                // Reset streak
                updates.currentStreak = 1;
            }
            updates.lastActiveDate = today;
        }

        await userStateRef.set(updates, { merge: true });

        // Trigger daily stats re-aggregation
        await aggregateDailyStats(firebaseUid, date);

        console.log(`Updated state and stats for user ${firebaseUid}`);
    } catch (error) {
        console.error("Error processing session creation:", error);
        throw error;
    }
});

/**
 * Handle new workout session (specific to workout collection)
 */
export const onWorkoutSessionCreate = onDocumentCreated({
    document: "workoutSessions/{sessionId}",
    secrets: [SUPABASE_URL, SUPABASE_SERVICE_KEY],
}, async (event) => {
    const snapshot = event.data;
    if (!snapshot) return;

    const data = snapshot.data();
    const { firebaseUid, exercises, totalVolume } = data;

    if (!firebaseUid) return;

    const today = new Date().toISOString().split("T")[0];

    try {
        // Update Firestore real-time state
        const userStateRef = db.collection("userState").doc(firebaseUid);
        await userStateRef.set(
            {
                lastWorkout: admin.firestore.FieldValue.serverTimestamp(),
                [`todayStats.workoutVolume`]: admin.firestore.FieldValue.increment(totalVolume || 0),
                [`todayStats.exerciseCount`]: admin.firestore.FieldValue.increment(
                    exercises?.length || 0
                ),
            },
            { merge: true }
        );

        // Trigger daily aggregation
        await aggregateDailyStats(firebaseUid, today);
    } catch (error) {
        console.error("Error processing workout session:", error);
        throw error;
    }
});

/**
 * Handle meditation session completion
 */
export const onMeditationComplete = onDocumentCreated({
    document: "meditationSessions/{sessionId}",
    secrets: [SUPABASE_URL, SUPABASE_SERVICE_KEY],
}, async (event) => {
    const snapshot = event.data;
    if (!snapshot) return;

    const data = snapshot.data();
    const { firebaseUid, duration } = data;

    if (!firebaseUid || !duration) return;

    const today = new Date().toISOString().split("T")[0];

    try {
        const userStateRef = db.collection("userState").doc(firebaseUid);
        await userStateRef.set(
            {
                lastMeditation: admin.firestore.FieldValue.serverTimestamp(),
                [`todayStats.meditationMinutes`]: admin.firestore.FieldValue.increment(duration),
            },
            { merge: true }
        );

        await aggregateDailyStats(firebaseUid, today);
    } catch (error) {
        console.error("Error processing meditation session:", error);
        throw error;
    }
});
