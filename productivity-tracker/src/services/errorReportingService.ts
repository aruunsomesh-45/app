/**
 * Error Reporting Service
 * 
 * Client-side error tracking and reporting.
 * Note: Firebase Crashlytics is not available for web apps.
 * We use a combination of:
 * - Analytics error events for tracking
 * - Firestore for error logging
 * - Console logging for development
 */

import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../utils/firebaseConfig";
import { logErrorEvent } from "./analyticsService";

/**
 * Error severity levels
 */
export const ErrorSeverity = {
    DEBUG: "debug",
    INFO: "info",
    WARNING: "warning",
    ERROR: "error",
    FATAL: "fatal",
} as const;

export type ErrorSeverity = (typeof ErrorSeverity)[keyof typeof ErrorSeverity];

/**
 * Error context for better debugging
 */
export interface ErrorContext {
    component?: string;
    action?: string;
    userId?: string;
    metadata?: Record<string, unknown>;
}

/**
 * Error record structure
 */
interface ErrorRecord {
    message: string;
    stack?: string;
    severity: ErrorSeverity;
    context: ErrorContext;
    timestamp: unknown;
    userAgent: string;
    url: string;
}

/**
 * Report an error to our tracking systems
 */
export async function reportError(
    error: Error | string,
    severity: ErrorSeverity = ErrorSeverity.ERROR,
    context: ErrorContext = {}
): Promise<void> {
    const errorMessage = typeof error === "string" ? error : error.message;
    const errorStack = typeof error === "string" ? undefined : error.stack;

    // Log to console in development
    if (import.meta.env.DEV) {
        console.error(`[${severity.toUpperCase()}]`, errorMessage, context);
        if (errorStack) {
            console.error(errorStack);
        }
    }

    // Log to analytics
    logErrorEvent(severity, errorMessage, context.component);

    // Store in Firestore for persistence (only for ERROR and FATAL)
    if (severity === ErrorSeverity.ERROR || severity === ErrorSeverity.FATAL) {
        try {
            const errorRecord: ErrorRecord = {
                message: errorMessage,
                stack: errorStack,
                severity,
                context,
                timestamp: serverTimestamp(),
                userAgent: navigator.userAgent,
                url: window.location.href,
            };

            await addDoc(collection(db, "errorLogs"), errorRecord);
        } catch (logError) {
            console.error("Failed to log error to Firestore:", logError);
        }
    }
}

/**
 * Setup global error handlers
 */
export function setupGlobalErrorHandlers(userId?: string): void {
    // Handle unhandled promise rejections
    window.addEventListener("unhandledrejection", (event) => {
        reportError(
            event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
            ErrorSeverity.ERROR,
            {
                component: "global",
                action: "unhandledRejection",
                userId,
            }
        );
    });

    // Handle runtime errors
    window.addEventListener("error", (event) => {
        reportError(event.error || new Error(event.message), ErrorSeverity.ERROR, {
            component: "global",
            action: "runtimeError",
            userId,
            metadata: {
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
            },
        });
    });
}

/**
 * Create an error boundary helper
 */
export function createErrorBoundaryHandler(componentName: string, userId?: string) {
    return (error: Error, errorInfo: { componentStack?: string }) => {
        reportError(error, ErrorSeverity.FATAL, {
            component: componentName,
            action: "componentCrash",
            userId,
            metadata: {
                componentStack: errorInfo.componentStack,
            },
        });
    };
}

/**
 * Wrap an async function with error reporting
 */
export function withErrorReporting<T extends unknown[], R>(
    fn: (...args: T) => Promise<R>,
    context: ErrorContext
): (...args: T) => Promise<R> {
    return async (...args: T): Promise<R> => {
        try {
            return await fn(...args);
        } catch (error) {
            await reportError(
                error instanceof Error ? error : new Error(String(error)),
                ErrorSeverity.ERROR,
                context
            );
            throw error;
        }
    };
}

/**
 * Log a warning (less severe than error)
 */
export function logWarning(message: string, context: ErrorContext = {}): void {
    reportError(message, ErrorSeverity.WARNING, context);
}

/**
 * Log an info message for debugging
 */
export function logInfo(message: string, context: ErrorContext = {}): void {
    if (import.meta.env.DEV) {
        reportError(message, ErrorSeverity.INFO, context);
    }
}
