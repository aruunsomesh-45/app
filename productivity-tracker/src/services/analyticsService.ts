/**
 * Firebase Analytics Service
 * 
 * Client-side analytics tracking for the Productivity Tracker app.
 * Uses Firebase Analytics for custom events and user properties.
 */

import { logEvent, setUserProperties, setUserId } from "firebase/analytics";
import { analytics } from "../utils/firebaseConfig";

/**
 * Custom event types for analytics tracking
 */
export const AnalyticsEvents = {
    // Authentication
    LOGIN: "login",
    LOGOUT: "logout",
    SIGNUP: "sign_up",

    // Navigation
    PAGE_VIEW: "page_view",
    SECTION_VIEW: "section_view",

    // Goals
    GOAL_CREATED: "goal_created",
    GOAL_COMPLETED: "goal_completed",
    GOAL_DELETED: "goal_deleted",

    // Sessions
    MEDITATION_START: "meditation_start",
    MEDITATION_COMPLETE: "meditation_complete",
    WORKOUT_START: "workout_start",
    WORKOUT_COMPLETE: "workout_complete",
    READING_SESSION: "reading_session",

    // Features
    AI_INSIGHT_VIEWED: "ai_insight_viewed",
    WEEKLY_REVIEW_VIEWED: "weekly_review_viewed",
    STREAK_MILESTONE: "streak_milestone",

    // Engagement
    NOTIFICATION_OPENED: "notification_opened",
    SHARE_INITIATED: "share_initiated",

    // Errors
    ERROR_OCCURRED: "error_occurred",
} as const;

export type AnalyticsEvent = (typeof AnalyticsEvents)[keyof typeof AnalyticsEvents];

/**
 * Log a custom event to Firebase Analytics
 */
export function logAnalyticsEvent(
    eventName: AnalyticsEvent,
    params?: Record<string, string | number | boolean>
): void {
    if (!analytics) {
        console.debug("Analytics not available");
        return;
    }

    try {
        // Cast to string for Firebase Analytics compatibility
        logEvent(analytics, eventName as string, params);
    } catch (error) {
        console.error("Failed to log analytics event:", error);
    }
}

/**
 * Set the current user ID for analytics
 */
export function setAnalyticsUserId(userId: string | null): void {
    if (!analytics) return;

    try {
        setUserId(analytics, userId);
    } catch (error) {
        console.error("Failed to set analytics user ID:", error);
    }
}

/**
 * Set user properties for analytics segmentation
 */
export function setAnalyticsUserProperties(
    properties: Record<string, string | null>
): void {
    if (!analytics) return;

    try {
        setUserProperties(analytics, properties);
    } catch (error) {
        console.error("Failed to set user properties:", error);
    }
}

/**
 * Log page view event
 */
export function logPageView(pageName: string, pageTitle?: string): void {
    logAnalyticsEvent(AnalyticsEvents.PAGE_VIEW, {
        page_path: pageName,
        page_title: pageTitle || pageName,
    });
}

/**
 * Log section view event
 */
export function logSectionView(sectionId: string, sectionName: string): void {
    logAnalyticsEvent(AnalyticsEvents.SECTION_VIEW, {
        section_id: sectionId,
        section_name: sectionName,
    });
}

/**
 * Log goal events
 */
export function logGoalEvent(
    action: "created" | "completed" | "deleted",
    goalData: { id: string; title?: string; priority?: string }
): void {
    const eventMap = {
        created: AnalyticsEvents.GOAL_CREATED,
        completed: AnalyticsEvents.GOAL_COMPLETED,
        deleted: AnalyticsEvents.GOAL_DELETED,
    };

    logAnalyticsEvent(eventMap[action], {
        goal_id: goalData.id,
        goal_title: goalData.title || "",
        goal_priority: goalData.priority || "normal",
    });
}

/**
 * Log session events (meditation, workout, reading)
 */
export function logSessionEvent(
    type: "meditation" | "workout" | "reading",
    action: "start" | "complete",
    duration?: number
): void {
    const eventMap = {
        meditation: {
            start: AnalyticsEvents.MEDITATION_START,
            complete: AnalyticsEvents.MEDITATION_COMPLETE,
        },
        workout: {
            start: AnalyticsEvents.WORKOUT_START,
            complete: AnalyticsEvents.WORKOUT_COMPLETE,
        },
        reading: {
            start: AnalyticsEvents.READING_SESSION,
            complete: AnalyticsEvents.READING_SESSION,
        },
    };

    logAnalyticsEvent(eventMap[type][action], {
        session_type: type,
        action,
        duration_minutes: duration || 0,
    });
}

/**
 * Log streak milestone
 */
export function logStreakMilestone(days: number): void {
    logAnalyticsEvent(AnalyticsEvents.STREAK_MILESTONE, {
        streak_days: days,
    });
}

/**
 * Log error event for tracking issues
 */
export function logErrorEvent(
    errorType: string,
    errorMessage: string,
    context?: string
): void {
    logAnalyticsEvent(AnalyticsEvents.ERROR_OCCURRED, {
        error_type: errorType,
        error_message: errorMessage.substring(0, 100), // Limit length
        error_context: context || "unknown",
    });
}
