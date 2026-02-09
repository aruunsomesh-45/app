import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { messaging, db } from '../utils/firebaseConfig';
import { useLifeTracker } from '../utils/lifeTrackerStore';
import { useAuth } from './AuthContext';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

// Notification types for different scenarios
export type NotificationType =
    | 'info'
    | 'success'
    | 'warning'
    | 'error'
    | 'incomplete_action'
    | 'reminder'
    | 'achievement';

interface NotificationOptions {
    type?: NotificationType;
    icon?: string;
    tag?: string;
    requireInteraction?: boolean;
    actions?: Array<{ action: string; title: string; }>;
    data?: Record<string, unknown>;
}

interface NotificationContextType {
    token: string | null;
    permissionGranted: boolean;
    requestPermission: () => Promise<void>;
    sendLocalNotification: (title: string, body: string, options?: NotificationOptions) => void;
    notifyIncompleteAction: (actionName: string, reason: string, redirectPath?: string) => void;
    notifyReminder: (title: string, message: string) => void;
    notifySuccess: (title: string, message: string) => void;
    notifyError: (title: string, message: string) => void;
    checkAndNotifyPendingTasks: () => void;
    checkAndNotifyOnboarding: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [token, setToken] = useState<string | null>(null);
    const [permissionGranted, setPermissionGranted] = useState<boolean>(
        typeof Notification !== 'undefined' && Notification.permission === 'granted'
    );
    const store = useLifeTracker();
    const { user } = useAuth();

    // Listen for incoming FCM messages
    useEffect(() => {
        if (messaging) {
            onMessage(messaging, (payload) => {
                console.log('📬 FCM Message received:', payload);
                if (payload.notification) {
                    sendLocalNotification(
                        payload.notification.title || 'Notification',
                        payload.notification.body || '',
                        { type: 'info' }
                    );
                }
            });
        }
    }, []);

    // Request notification permission
    const requestPermission = async () => {
        try {
            if (!("Notification" in window)) {
                console.log("This browser does not support desktop notifications");
                return;
            }

            const permission = await Notification.requestPermission();
            setPermissionGranted(permission === 'granted');

            if (permission === 'granted') {
                console.log('🔔 Notification permission granted.');

                if (messaging) {
                    const currentToken = await getToken(messaging, {
                        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
                    });

                    if (currentToken) {
                        setToken(currentToken);
                        console.log('🔑 FCM Token:', currentToken);

                        // Save token to Firestore if user is authenticated
                        if (user) {
                            try {
                                await setDoc(doc(db, 'users', user.uid, 'fcm_tokens', currentToken), {
                                    token: currentToken,
                                    platform: 'web',
                                    lastUpdated: serverTimestamp()
                                }, { merge: true });
                                console.log('✅ FCM token saved to Firestore');
                            } catch (err) {
                                console.error('❌ Error saving FCM token to Firestore:', err);
                            }
                        }
                    } else {
                        console.log('No registration token available.');
                    }
                }
            } else {
                console.log('❌ Notification permission denied.');
            }
        } catch (error) {
            console.error('Error requesting notification permission:', error);
        }
    };

    // Core notification sending function
    const sendLocalNotification = useCallback((
        title: string,
        body: string,
        options?: NotificationOptions
    ) => {
        if (!("Notification" in window)) {
            console.log("This browser does not support desktop notifications");
            return;
        }

        if (Notification.permission !== "granted") {
            console.log("Notification permission not granted. Requesting...");
            requestPermission();
            return;
        }

        // Get icon based on notification type
        const getIcon = () => {
            switch (options?.type) {
                case 'success': return '✅';
                case 'warning': return '⚠️';
                case 'error': return '❌';
                case 'incomplete_action': return '🔔';
                case 'reminder': return '⏰';
                case 'achievement': return '🏆';
                default: return '📌';
            }
        };

        try {
            const notification = new Notification(`${getIcon()} ${title}`, {
                body,
                icon: options?.icon || '/icon-192x192.png',
                tag: options?.tag || `notification-${Date.now()}`,
                requireInteraction: options?.requireInteraction ?? false,
                ...options?.data && { data: options.data }
            });

            // Handle notification click
            notification.onclick = (event) => {
                event.preventDefault();
                window.focus();
                if (options?.data?.redirectPath) {
                    window.location.href = options.data.redirectPath as string;
                }
                notification.close();
            };

            console.log(`📣 Notification sent: ${title}`);
        } catch (error) {
            console.error('Error sending notification:', error);
        }
    }, []);

    // Notify about incomplete action - IMMEDIATE notification
    const notifyIncompleteAction = useCallback((
        actionName: string,
        reason: string,
        redirectPath?: string
    ) => {
        console.log(`🔔 Incomplete action notification: ${actionName} - ${reason}`);

        sendLocalNotification(
            `Action Required: ${actionName}`,
            reason,
            {
                type: 'incomplete_action',
                requireInteraction: true,
                tag: `incomplete-${actionName.toLowerCase().replace(/\s+/g, '-')}`,
                data: redirectPath ? { redirectPath } : undefined
            }
        );
    }, [sendLocalNotification]);

    // Notify reminder
    const notifyReminder = useCallback((title: string, message: string) => {
        sendLocalNotification(title, message, { type: 'reminder' });
    }, [sendLocalNotification]);

    // Notify success
    const notifySuccess = useCallback((title: string, message: string) => {
        sendLocalNotification(title, message, { type: 'success' });
    }, [sendLocalNotification]);

    // Notify error
    const notifyError = useCallback((title: string, message: string) => {
        sendLocalNotification(title, message, { type: 'error', requireInteraction: true });
    }, [sendLocalNotification]);

    // Check and notify pending tasks
    const checkAndNotifyPendingTasks = useCallback(() => {
        const storeState = store.getState();
        const today = new Date().toISOString().split('T')[0];
        const pendingTasks = storeState.dailyTasks.filter(
            task => task.date === today && !task.completed
        );

        if (pendingTasks.length > 0) {
            notifyIncompleteAction(
                "Unfinished Tasks",
                `You have ${pendingTasks.length} pending task${pendingTasks.length > 1 ? 's' : ''} for today.`,
                '/section/daily-tasks'
            );
        }
    }, [store, notifyIncompleteAction]);

    // Check and notify incomplete onboarding
    const checkAndNotifyOnboarding = useCallback(() => {
        const storeState = store.getState();
        const profile = storeState.userProfile;

        if (!profile?.onboardingCompleted) {
            notifyIncompleteAction(
                "Complete Your Profile",
                "Finish setting up your profile to get personalized recommendations.",
                '/onboarding'
            );
        }
    }, [store, notifyIncompleteAction]);

    // Auto-check for pending tasks periodically
    useEffect(() => {
        // Initial check after 1 minute
        const initialTimeout = setTimeout(() => {
            if (document.visibilityState === 'visible' && permissionGranted) {
                checkAndNotifyPendingTasks();
            }
        }, 60 * 1000);

        // Then check every 30 minutes
        const interval = setInterval(() => {
            if (document.visibilityState === 'visible' && permissionGranted) {
                checkAndNotifyPendingTasks();
            }
        }, 30 * 60 * 1000);

        return () => {
            clearTimeout(initialTimeout);
            clearInterval(interval);
        };
    }, [store, permissionGranted, checkAndNotifyPendingTasks]);

    // Check onboarding status when user logs in
    useEffect(() => {
        if (user && permissionGranted) {
            // Delay to allow data loading
            const timeout = setTimeout(() => {
                checkAndNotifyOnboarding();
            }, 5000);

            return () => clearTimeout(timeout);
        }
    }, [user, permissionGranted, checkAndNotifyOnboarding]);

    return (
        <NotificationContext.Provider value={{
            token,
            permissionGranted,
            requestPermission,
            sendLocalNotification,
            notifyIncompleteAction,
            notifyReminder,
            notifySuccess,
            notifyError,
            checkAndNotifyPendingTasks,
            checkAndNotifyOnboarding
        }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};
