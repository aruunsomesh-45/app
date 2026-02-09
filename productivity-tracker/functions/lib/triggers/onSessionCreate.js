"use strict";
/**
 * Firestore Trigger: On Session Create
 *
 * Triggers when a new session is logged (workout, meditation, reading, etc.)
 * Updates real-time state in Firestore and triggers aggregation.
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
exports.onMeditationComplete = exports.onWorkoutSessionCreate = exports.onSessionCreate = void 0;
const firestore_1 = require("firebase-functions/v2/firestore");
const admin = __importStar(require("firebase-admin"));
const dailyStats_1 = require("../aggregation/dailyStats");
const supabase_1 = require("../config/supabase");
const db = admin.firestore();
/**
 * Handle new session creation
 * Updates streak counters and triggers re-aggregation
 */
exports.onSessionCreate = (0, firestore_1.onDocumentCreated)({
    document: "sessions/{sessionId}",
    secrets: [supabase_1.SUPABASE_URL, supabase_1.SUPABASE_SERVICE_KEY],
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
        const updates = {
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
            }
            else {
                // Reset streak
                updates.currentStreak = 1;
            }
            updates.lastActiveDate = today;
        }
        await userStateRef.set(updates, { merge: true });
        // Trigger daily stats re-aggregation
        await (0, dailyStats_1.aggregateDailyStats)(firebaseUid, date);
        console.log(`Updated state and stats for user ${firebaseUid}`);
    }
    catch (error) {
        console.error("Error processing session creation:", error);
        throw error;
    }
});
/**
 * Handle new workout session (specific to workout collection)
 */
exports.onWorkoutSessionCreate = (0, firestore_1.onDocumentCreated)({
    document: "workoutSessions/{sessionId}",
    secrets: [supabase_1.SUPABASE_URL, supabase_1.SUPABASE_SERVICE_KEY],
}, async (event) => {
    const snapshot = event.data;
    if (!snapshot)
        return;
    const data = snapshot.data();
    const { firebaseUid, exercises, totalVolume } = data;
    if (!firebaseUid)
        return;
    const today = new Date().toISOString().split("T")[0];
    try {
        // Update Firestore real-time state
        const userStateRef = db.collection("userState").doc(firebaseUid);
        await userStateRef.set({
            lastWorkout: admin.firestore.FieldValue.serverTimestamp(),
            [`todayStats.workoutVolume`]: admin.firestore.FieldValue.increment(totalVolume || 0),
            [`todayStats.exerciseCount`]: admin.firestore.FieldValue.increment(exercises?.length || 0),
        }, { merge: true });
        // Trigger daily aggregation
        await (0, dailyStats_1.aggregateDailyStats)(firebaseUid, today);
    }
    catch (error) {
        console.error("Error processing workout session:", error);
        throw error;
    }
});
/**
 * Handle meditation session completion
 */
exports.onMeditationComplete = (0, firestore_1.onDocumentCreated)({
    document: "meditationSessions/{sessionId}",
    secrets: [supabase_1.SUPABASE_URL, supabase_1.SUPABASE_SERVICE_KEY],
}, async (event) => {
    const snapshot = event.data;
    if (!snapshot)
        return;
    const data = snapshot.data();
    const { firebaseUid, duration } = data;
    if (!firebaseUid || !duration)
        return;
    const today = new Date().toISOString().split("T")[0];
    try {
        const userStateRef = db.collection("userState").doc(firebaseUid);
        await userStateRef.set({
            lastMeditation: admin.firestore.FieldValue.serverTimestamp(),
            [`todayStats.meditationMinutes`]: admin.firestore.FieldValue.increment(duration),
        }, { merge: true });
        await (0, dailyStats_1.aggregateDailyStats)(firebaseUid, today);
    }
    catch (error) {
        console.error("Error processing meditation session:", error);
        throw error;
    }
});
//# sourceMappingURL=onSessionCreate.js.map