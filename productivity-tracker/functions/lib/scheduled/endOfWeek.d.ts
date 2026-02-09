/**
 * Scheduled Function: End of Week
 *
 * Runs at the end of each week to:
 * - Generate weekly stats
 * - Generate weekly review
 * - Identify trends and patterns
 */
/**
 * End of week processing - runs every Sunday at 9 PM
 */
export declare const endOfWeekProcessing: import("firebase-functions/v2/scheduler").ScheduleFunction;
/**
 * End of month processing - runs on the 1st of each month at 6 AM
 */
export declare const endOfMonthProcessing: import("firebase-functions/v2/scheduler").ScheduleFunction;
