/**
 * Daily Stats Aggregation Function
 *
 * Aggregates all user activity for a specific day into a single stats record.
 * This removes the need for clients to calculate stats on every render.
 */
import { UserStats } from "../config/supabase";
/**
 * Aggregate daily stats for a user
 * Called by scheduled function or on-demand
 */
export declare function aggregateDailyStats(firebaseUid: string, date: string): Promise<UserStats>;
/**
 * HTTP Callable function for on-demand aggregation
 */
export declare const aggregateDailyStatsCallable: import("firebase-functions/v2/https").CallableFunction<any, Promise<{
    success: boolean;
    stats: UserStats;
}>>;
