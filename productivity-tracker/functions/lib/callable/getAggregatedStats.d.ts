/**
 * Callable Function: Get Aggregated Stats
 *
 * HTTP callable function for the client to fetch pre-aggregated stats.
 * Reduces client-side computation and database queries.
 */
/**
 * Get aggregated stats for the authenticated user
 */
export declare const getAggregatedStats: import("firebase-functions/v2/https").CallableFunction<any, Promise<{
    success: boolean;
    stats: any;
}>>;
/**
 * Get today's real-time stats from Firestore
 * This is for live updates, not historical data
 */
export declare const getTodayStats: import("firebase-functions/v2/https").CallableFunction<any, Promise<{
    success: boolean;
    stats: any;
}>>;
/**
 * Get comparative stats (this week vs last week, this month vs last month)
 */
export declare const getComparativeStats: import("firebase-functions/v2/https").CallableFunction<any, Promise<{
    success: boolean;
    comparison: {
        current: any;
        previous: any;
        changes: {
            focusScore: number;
            goalCompletionRate: number;
            workouts: number;
        } | null;
    };
}>>;
