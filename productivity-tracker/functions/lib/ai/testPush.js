"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testPushNotification = void 0;
const https_1 = require("firebase-functions/v2/https");
const notifications_1 = require("../utils/notifications");
exports.testPushNotification = (0, https_1.onCall)(async (request) => {
    const { auth } = request;
    if (!auth) {
        throw new https_1.HttpsError("unauthenticated", "User must be authenticated");
    }
    const { templateId, customPayload } = request.data;
    const userId = auth.uid;
    let payload;
    if (templateId && notifications_1.NOTIFICATION_TEMPLATES[templateId]) {
        // Handle templates that might need arguments
        const template = notifications_1.NOTIFICATION_TEMPLATES[templateId];
        if (typeof template === 'function') {
            if (templateId === 'INCOMPLETE_PLAN') {
                payload = template("Sample Task");
            }
            else if (templateId === 'STREAK_MILESTONE') {
                payload = template(7);
            }
            else if (templateId === 'STALLED_GOAL') {
                payload = template(3);
            }
            else if (templateId === 'MORNING_BOOST') {
                payload = template("Productivity Session");
            }
            else {
                payload = template();
            }
        }
        else {
            payload = template;
        }
    }
    else if (customPayload) {
        payload = customPayload;
    }
    else {
        payload = {
            title: "Test Notification 🍌",
            body: "This is a test notification from your backend. High five! ✋",
            data: { type: "test" }
        };
    }
    try {
        await (0, notifications_1.sendUserPushNotification)(userId, payload);
        return { success: true, message: "Notification sent successfully" };
    }
    catch (error) {
        console.error("Error in testPushNotification:", error);
        throw new https_1.HttpsError("internal", "Failed to send notification");
    }
});
//# sourceMappingURL=testPush.js.map