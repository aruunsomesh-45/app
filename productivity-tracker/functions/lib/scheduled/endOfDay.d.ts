/**
 * Scheduled Function: End of Day
 *
 * Runs at the end of each day to:
 * - Finalize daily stats
 * - Generate daily summaries
 * - Check for stalled goals
 * - Update streak counters
 */
/**
 * End of day processing - runs at 11:30 PM daily in user's timezone
 * For simplicity, we batch process all users at 11:30 PM UTC
 * A more sophisticated approach would use user-specific timezones
 */
export declare const endOfDayProcessing: import("firebase-functions/v2/scheduler").ScheduleFunction;
/**
 * Morning check - runs at 8 AM to send morning motivation
 */
export declare const morningCheck: import("firebase-functions/v2/scheduler").ScheduleFunction;
