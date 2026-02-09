/**
 * Firebase Performance Monitoring Service
 * 
 * Client-side performance tracking for the Productivity Tracker app.
 * Tracks page loads, network requests, and custom traces.
 */

import { trace as createTrace, type PerformanceTrace } from "firebase/performance";
import { performance } from "../utils/firebaseConfig";

/**
 * Custom trace names for the app
 */
export const TraceNames = {
    // Page loads
    PAGE_LOAD_DASHBOARD: "page_load_dashboard",
    PAGE_LOAD_STATS: "page_load_stats",
    PAGE_LOAD_PROFILE: "page_load_profile",

    // Data operations
    FETCH_USER_DATA: "fetch_user_data",
    SYNC_TO_CLOUD: "sync_to_cloud",
    FETCH_AI_INSIGHTS: "fetch_ai_insights",

    // Sessions
    MEDITATION_SESSION: "meditation_session",
    WORKOUT_SESSION: "workout_session",

    // AI operations
    AI_SUMMARY_GENERATION: "ai_summary_generation",
    AI_GOAL_SUGGESTIONS: "ai_goal_suggestions",
} as const;

export type TraceName = (typeof TraceNames)[keyof typeof TraceNames];

/**
 * Active traces map for managing ongoing traces
 */
const activeTraces = new Map<string, PerformanceTrace>();

/**
 * Start a custom performance trace
 */
export function startTrace(traceName: TraceName, attributes?: Record<string, string>): string {
    if (!performance) {
        console.debug("Performance monitoring not available");
        return "";
    }

    try {
        const traceId = `${traceName}_${Date.now()}`;
        const trace = createTrace(performance, traceName);

        // Set custom attributes
        if (attributes) {
            Object.entries(attributes).forEach(([key, value]) => {
                trace.putAttribute(key, value);
            });
        }

        trace.start();
        activeTraces.set(traceId, trace);
        return traceId;
    } catch (error) {
        console.error("Failed to start trace:", error);
        return "";
    }
}

/**
 * Stop a custom performance trace
 */
export function stopTrace(traceId: string, metrics?: Record<string, number>): void {
    if (!traceId || !activeTraces.has(traceId)) {
        return;
    }

    try {
        const trace = activeTraces.get(traceId)!;

        // Add custom metrics
        if (metrics) {
            Object.entries(metrics).forEach(([key, value]) => {
                trace.putMetric(key, value);
            });
        }

        trace.stop();
        activeTraces.delete(traceId);
    } catch (error) {
        console.error("Failed to stop trace:", error);
        activeTraces.delete(traceId);
    }
}

/**
 * Increment a metric on an active trace
 */
export function incrementTraceMetric(traceId: string, metricName: string, value = 1): void {
    if (!traceId || !activeTraces.has(traceId)) {
        return;
    }

    try {
        const trace = activeTraces.get(traceId)!;
        trace.incrementMetric(metricName, value);
    } catch (error) {
        console.error("Failed to increment trace metric:", error);
    }
}

/**
 * Add an attribute to an active trace
 */
export function addTraceAttribute(traceId: string, name: string, value: string): void {
    if (!traceId || !activeTraces.has(traceId)) {
        return;
    }

    try {
        const trace = activeTraces.get(traceId)!;
        trace.putAttribute(name, value);
    } catch (error) {
        console.error("Failed to add trace attribute:", error);
    }
}

/**
 * Measure an async operation's performance
 */
export async function measureAsync<T>(
    traceName: TraceName,
    operation: () => Promise<T>,
    attributes?: Record<string, string>
): Promise<T> {
    const traceId = startTrace(traceName, attributes);

    try {
        const result = await operation();
        stopTrace(traceId, { success: 1 });
        return result;
    } catch (error) {
        stopTrace(traceId, { success: 0, error: 1 });
        throw error;
    }
}

/**
 * Create a hook-like function for measuring component mount times
 * Usage: const { markReady } = usePerformanceTrace('page_load_dashboard')
 */
export function createComponentTrace(traceName: TraceName) {
    const traceId = startTrace(traceName);

    return {
        markReady: () => stopTrace(traceId),
        addAttribute: (name: string, value: string) => addTraceAttribute(traceId, name, value),
        incrementMetric: (name: string, value = 1) => incrementTraceMetric(traceId, name, value),
        cancel: () => activeTraces.delete(traceId),
    };
}
