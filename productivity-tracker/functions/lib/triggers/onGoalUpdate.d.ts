/**
 * Firestore Trigger: On Goal Update
 *
 * Triggers when a goal status changes.
 * Detects goal completions and stalled goals.
 */
/**
 * Handle goal completion
 */
export declare const onGoalComplete: import("firebase-functions/v2/core").CloudFunction<import("firebase-functions/v2/firestore").FirestoreEvent<import("firebase-functions/v2/firestore").Change<import("firebase-functions/v2/firestore").QueryDocumentSnapshot> | undefined, {
    goalId: string;
}>>;
/**
 * Handle new goal creation
 * Generates AI suggestions when goals are created
 */
export declare const onGoalCreate: import("firebase-functions/v2/core").CloudFunction<import("firebase-functions/v2/firestore").FirestoreEvent<import("firebase-functions/v2/firestore").QueryDocumentSnapshot | undefined, {
    goalId: string;
}>>;
/**
 * Detect stalled goals (scheduled check in endOfDay.ts calls this)
 */
export declare function checkStalledGoals(firebaseUid: string): Promise<void>;
