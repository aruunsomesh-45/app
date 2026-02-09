/**
 * Firestore Trigger: On Session Create
 *
 * Triggers when a new session is logged (workout, meditation, reading, etc.)
 * Updates real-time state in Firestore and triggers aggregation.
 */
/**
 * Handle new session creation
 * Updates streak counters and triggers re-aggregation
 */
export declare const onSessionCreate: import("firebase-functions/v2/core").CloudFunction<import("firebase-functions/v2/firestore").FirestoreEvent<import("firebase-functions/v2/firestore").QueryDocumentSnapshot | undefined, {
    sessionId: string;
}>>;
/**
 * Handle new workout session (specific to workout collection)
 */
export declare const onWorkoutSessionCreate: import("firebase-functions/v2/core").CloudFunction<import("firebase-functions/v2/firestore").FirestoreEvent<import("firebase-functions/v2/firestore").QueryDocumentSnapshot | undefined, {
    sessionId: string;
}>>;
/**
 * Handle meditation session completion
 */
export declare const onMeditationComplete: import("firebase-functions/v2/core").CloudFunction<import("firebase-functions/v2/firestore").FirestoreEvent<import("firebase-functions/v2/firestore").QueryDocumentSnapshot | undefined, {
    sessionId: string;
}>>;
