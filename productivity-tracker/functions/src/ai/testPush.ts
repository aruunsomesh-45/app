import { onCall, HttpsError } from "firebase-functions/v2/https";
import { sendUserPushNotification, NOTIFICATION_TEMPLATES, NotificationPayload } from "../utils/notifications";

export const testPushNotification = onCall(async (request) => {
    const { auth } = request;
    if (!auth) {
        throw new HttpsError("unauthenticated", "User must be authenticated");
    }

    const { templateId, customPayload } = request.data as {
        templateId?: keyof typeof NOTIFICATION_TEMPLATES;
        customPayload?: NotificationPayload;
    };

    const userId = auth.uid;
    let payload: NotificationPayload;

    if (templateId && NOTIFICATION_TEMPLATES[templateId]) {
        // Handle templates that might need arguments
        const template = NOTIFICATION_TEMPLATES[templateId];
        if (typeof template === 'function') {
            if (templateId === 'INCOMPLETE_PLAN') {
                payload = (template as any)("Sample Task");
            } else if (templateId === 'STREAK_MILESTONE') {
                payload = (template as any)(7);
            } else if (templateId === 'STALLED_GOAL') {
                payload = (template as any)(3);
            } else if (templateId === 'MORNING_BOOST') {
                payload = (template as any)("Productivity Session");
            } else {
                payload = (template as any)();
            }
        } else {
            payload = template as unknown as NotificationPayload;
        }
    } else if (customPayload) {
        payload = customPayload;
    } else {
        payload = {
            title: "Test Notification 🍌",
            body: "This is a test notification from your backend. High five! ✋",
            data: { type: "test" }
        };
    }

    try {
        await sendUserPushNotification(userId, payload);
        return { success: true, message: "Notification sent successfully" };
    } catch (error) {
        console.error("Error in testPushNotification:", error);
        throw new HttpsError("internal", "Failed to send notification");
    }
});
