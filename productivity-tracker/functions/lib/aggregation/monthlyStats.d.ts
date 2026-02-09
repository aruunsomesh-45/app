/**
 * Monthly Stats Aggregation Function
 *
 * Rolls up weekly stats into monthly summaries.
 * Calculates long-term trends and achievements.
 */
import { MonthlyStats } from "../config/supabase";
/**
 * Aggregate monthly stats for a user
 */
export declare function aggregateMonthlyStats(firebaseUid: string, monthStr: string): Promise<MonthlyStats>;
/**
 * HTTP Callable function for monthly aggregation
 */
export declare const aggregateMonthlyStatsCallable: import("firebase-functions/v2/https").CallableFunction<any, Promise<{
    success: boolean;
    stats: MonthlyStats;
}>>;
