/**
 * Firestore Real-Time State Hooks
 * 
 * React hooks for subscribing to real-time Firestore state.
 * Uses Firestore for live tracker state, streak counters, 
 * and session-in-progress flags.
 */

import { useState, useEffect, useCallback } from "react";
import {
    doc,
    onSnapshot,
    setDoc,
    updateDoc,
    serverTimestamp,
    collection,
    query,
    where,
    orderBy,
    limit,
    Timestamp,
} from "firebase/firestore";
import { db } from "../utils/firebaseConfig";
import { useAuth } from "../contexts/AuthContext";

/**
 * User real-time state structure
 */
export interface UserRealtimeState {
    lastActivity: Timestamp | null;
    lastActiveDate: string | null;
    currentStreak: number;
    goalStreak: number;
    todayStats: {
        goalsCompleted: number;
        goalsTotal: number;
        meditationMinutes: number;
        workoutVolume: number;
        exerciseCount: number;
        sessionCount: number; // Generic count
    };
    activeSession: {
        type: string | null;
        startedAt: Timestamp | null;
        paused: boolean;
    } | null;
}

/**
 * Notification structure
 */
export interface RealtimeNotification {
    id: string;
    type: string;
    message: string;
    read: boolean;
    metadata?: Record<string, unknown>;
    createdAt: Timestamp;
}

const defaultState: UserRealtimeState = {
    lastActivity: null,
    lastActiveDate: null,
    currentStreak: 0,
    goalStreak: 0,
    todayStats: {
        goalsCompleted: 0,
        goalsTotal: 0,
        meditationMinutes: 0,
        workoutVolume: 0,
        exerciseCount: 0,
        sessionCount: 0,
    },
    activeSession: null,
};

/**
 * Hook for subscribing to user's real-time state
 */
export function useUserRealtimeState() {
    const { user } = useAuth();
    const [state, setState] = useState<UserRealtimeState>(defaultState);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!user?.uid) {
            setState(defaultState);
            setLoading(false);
            return;
        }

        const userStateRef = doc(db, "userState", user.uid);

        const unsubscribe = onSnapshot(
            userStateRef,
            (snapshot) => {
                if (snapshot.exists()) {
                    setState(snapshot.data() as UserRealtimeState);
                } else {
                    setState(defaultState);
                }
                setLoading(false);
                setError(null);
            },
            (err) => {
                console.error("Error subscribing to user state:", err);
                setError(err);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [user?.uid]);

    return { state, loading, error };
}

/**
 * Hook for managing active sessions
 */
export function useActiveSession() {
    const { user } = useAuth();
    const { state } = useUserRealtimeState();

    const startSession = useCallback(
        async (type: string) => {
            if (!user?.uid) return;

            const userStateRef = doc(db, "userState", user.uid);
            await updateDoc(userStateRef, {
                activeSession: {
                    type,
                    startedAt: serverTimestamp(),
                    paused: false,
                },
            });
        },
        [user?.uid]
    );

    const pauseSession = useCallback(async () => {
        if (!user?.uid || !state.activeSession) return;

        const userStateRef = doc(db, "userState", user.uid);
        await updateDoc(userStateRef, {
            "activeSession.paused": true,
        });
    }, [user?.uid, state.activeSession]);

    const resumeSession = useCallback(async () => {
        if (!user?.uid || !state.activeSession) return;

        const userStateRef = doc(db, "userState", user.uid);
        await updateDoc(userStateRef, {
            "activeSession.paused": false,
        });
    }, [user?.uid, state.activeSession]);

    const endSession = useCallback(async () => {
        if (!user?.uid) return;

        const userStateRef = doc(db, "userState", user.uid);
        await updateDoc(userStateRef, {
            activeSession: null,
        });
    }, [user?.uid]);

    return {
        activeSession: state.activeSession,
        isSessionActive: !!state.activeSession?.type,
        isPaused: state.activeSession?.paused || false,
        sessionType: state.activeSession?.type || null,
        startSession,
        pauseSession,
        resumeSession,
        endSession,
    };
}

/**
 * Hook for real-time streak tracking
 */
export function useStreak() {
    const { state, loading } = useUserRealtimeState();

    return {
        currentStreak: state.currentStreak,
        goalStreak: state.goalStreak,
        lastActiveDate: state.lastActiveDate,
        loading,
    };
}

/**
 * Hook for today's real-time stats
 */
export function useTodayStats() {
    const { state, loading } = useUserRealtimeState();

    const goalCompletionRate =
        state.todayStats.goalsTotal > 0
            ? Math.round(
                (state.todayStats.goalsCompleted / state.todayStats.goalsTotal) * 100
            )
            : 0;

    return {
        ...state.todayStats,
        goalCompletionRate,
        loading,
    };
}

/**
 * Hook for real-time notifications
 */
export function useRealtimeNotifications(maxCount = 10) {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<RealtimeNotification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user?.uid) {
            setNotifications([]);
            setUnreadCount(0);
            setLoading(false);
            return;
        }

        const notificationsRef = collection(db, "notifications");
        const q = query(
            notificationsRef,
            where("firebaseUid", "==", user.uid),
            orderBy("createdAt", "desc"),
            limit(maxCount)
        );

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const notifs = snapshot.docs.map((docSnap) => ({
                    id: docSnap.id,
                    ...docSnap.data(),
                })) as RealtimeNotification[];

                setNotifications(notifs);
                setUnreadCount(notifs.filter((n) => !n.read).length);
                setLoading(false);
            },
            (err) => {
                console.error("Error subscribing to notifications:", err);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [user?.uid, maxCount]);

    const markAsRead = useCallback(
        async (notificationId: string) => {
            if (!user?.uid) return;

            const notifRef = doc(db, "notifications", notificationId);
            await updateDoc(notifRef, { read: true });
        },
        [user?.uid]
    );

    const markAllAsRead = useCallback(async () => {
        if (!user?.uid) return;

        const unreadNotifs = notifications.filter((n) => !n.read);
        await Promise.all(
            unreadNotifs.map((n) => {
                const notifRef = doc(db, "notifications", n.id);
                return updateDoc(notifRef, { read: true });
            })
        );
    }, [user?.uid, notifications]);

    return {
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
    };
}

/**
 * Initialize user state in Firestore (call on first login)
 */
export async function initializeUserState(userId: string): Promise<void> {
    const userStateRef = doc(db, "userState", userId);
    const today = new Date().toISOString().split("T")[0];

    await setDoc(
        userStateRef,
        {
            lastActivity: serverTimestamp(),
            lastActiveDate: today,
            currentStreak: 1,
            goalStreak: 0,
            todayStats: {
                goalsCompleted: 0,
                goalsTotal: 0,
                meditationMinutes: 0,
                workoutVolume: 0,
                exerciseCount: 0,
                sessionCount: 0,
            },
            activeSession: null,
        },
        { merge: true }
    );
}

/**
 * Update user activity timestamp
 */
export async function updateUserActivity(userId: string): Promise<void> {
    const userStateRef = doc(db, "userState", userId);
    const today = new Date().toISOString().split("T")[0];

    await updateDoc(userStateRef, {
        lastActivity: serverTimestamp(),
        lastActiveDate: today,
    });
}
