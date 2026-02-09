import * as admin from "firebase-admin";

const db = admin.firestore();
const messaging = admin.messaging();

export interface NotificationPayload {
    title: string;
    body: string;
    data?: Record<string, string>;
}

/**
 * Notification Templates
 */
export const NOTIFICATION_TEMPLATES = {
    INCOMPLETE_PLAN: (activityName: string): NotificationPayload => ({
        title: "Action Required! 🍌",
        body: `You planned "${activityName}" but it's yet to be completed. Ready to crush it?`,
        data: { type: "incomplete_action", redirect: "/section/daily-tasks" }
    }),
    EMPTY_PLAN: (): NotificationPayload => ({
        title: "Fresh Start! 🌟",
        body: "You haven't planned anything for today. A quick plan helps you stay focused!",
        data: { type: "empty_plan", redirect: "/section/daily-tasks" }
    }),
    ALL_COMPLETED: (): NotificationPayload => ({
        title: "Mission Accomplished! 🏆",
        body: "Incredible! You've completed all your activities for today. Time to relax!",
        data: { type: "all_completed", redirect: "/dashboard" }
    }),
    STREAK_MILESTONE: (days: number): NotificationPayload => ({
        title: "You're on Fire! 🔥",
        body: `${days}-day streak! Your consistency is inspiring. Keep going!`,
        data: { type: "streak", redirect: "/profile" }
    }),
    GOAL_OVERLOAD: (): NotificationPayload => ({
        title: "Focus Check! 🎯",
        body: "You have many active goals. Focus on the top 3 to make real progress.",
        data: { type: "overload", redirect: "/goals" }
    }),
    STALLED_GOAL: (count: number): NotificationPayload => ({
        title: "Need a Hand? 👋",
        body: `You have ${count} goals that haven't moved in 3 days. Let's break them down.`,
        data: { type: "stalled", redirect: "/goals" }
    }),
    MORNING_BOOST: (topTask: string): NotificationPayload => ({
        title: "Today's Mission 🚀",
        body: `Your top priority is: ${topTask}. Let's make it happen!`,
        data: { type: "morning_boost", redirect: "/section/daily-tasks" }
    }),
    WEEKLY_REVIEW: (): NotificationPayload => ({
        title: "Weekly Stats are In! 📊",
        body: "Your weekly productivity review is ready. See how you performed!",
        data: { type: "weekly_review", redirect: "/section/weekly-stats" }
    })
};

/**
 * Send push notification to all devices for a specific user
 */
export async function sendUserPushNotification(
    userId: string,
    payload: NotificationPayload
): Promise<void> {
    try {
        // Fetch user's FCM tokens
        const tokensSnapshot = await db
            .collection("users")
            .doc(userId)
            .collection("fcm_tokens")
            .get();

        if (tokensSnapshot.empty) {
            console.log(`No FCM tokens found for user ${userId}`);
            return;
        }

        const tokens = tokensSnapshot.docs.map(doc => doc.data().token);

        // Prepare message with cross-platform specific configs
        const message: admin.messaging.MulticastMessage = {
            tokens: tokens,
            notification: {
                title: payload.title,
                body: payload.body,
            },
            data: payload.data, // This is crucial for app logic
            android: {
                priority: "high",
                notification: {
                    icon: "stock_ticker_update",
                    color: "#FFE135", // Banana Yellow
                    clickAction: "FLUTTER_NOTIFICATION_CLICK", // Standard for cross-platform apps
                    sound: "default",
                },
            },
            apns: {
                payload: {
                    aps: {
                        badge: 1,
                        sound: "default",
                        contentAvailable: true,
                    },
                },
            },
            webpush: {
                headers: {
                    Urgency: "high",
                },
                notification: {
                    icon: "/banana-icon.png",
                    badge: "/banana-icon.png",
                    click_action: payload.data?.redirect || "/",
                },
            },
        };

        // Send multicast message
        const response = await messaging.sendEachForMulticast(message);
        console.log(`Successfully sent ${response.successCount} notifications to user ${userId}`);

        // Cleanup invalid tokens
        if (response.failureCount > 0) {
            const failedTokens: string[] = [];
            response.responses.forEach((resp, idx) => {
                if (!resp.success) {
                    const error = resp.error;
                    if (error?.code === 'messaging/invalid-registration-token' ||
                        error?.code === 'messaging/registration-token-not-registered') {
                        failedTokens.push(tokens[idx]);
                    }
                }
            });

            if (failedTokens.length > 0) {
                console.log(`Cleaning up ${failedTokens.length} invalid tokens for user ${userId}`);
                const batch = db.batch();
                failedTokens.forEach(token => {
                    batch.delete(db.collection("users").doc(userId).collection("fcm_tokens").doc(token));
                });
                await batch.commit();
            }
        }
    } catch (error) {
        console.error(`Error sending push notification to user ${userId}:`, error);
    }
}
