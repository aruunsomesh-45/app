/**
 * Weekly Stats Aggregation Function
 *
 * Rolls up daily stats into weekly summaries.
 * Identifies best/worst days and calculates averages.
 */
import { WeeklyStats } from "../config/supabase";
/**
 * Aggregate weekly stats for a user
 */
export declare function aggregateWeeklyStats(firebaseUid: string, weekStart: string, weekEnd: string): Promise<WeeklyStats>;
/**
 * HTTP Callable function for weekly aggregation
 */
export declare const aggregateWeeklyStatsCallable: import("firebase-functions/v2/https").CallableFunction<any, Promise<{
    success: boolean;
    stats: WeeklyStats;
}>>;
