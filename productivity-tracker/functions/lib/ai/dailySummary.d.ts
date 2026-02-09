/**
 * Daily Summary AI Function
 *
 * Generates personalized daily summaries using Genkit + Gemini.
 * Non-real-time: summaries are generated and stored for later display.
 */
import { AIInsight } from "../config/supabase";
/**
 * Generate a daily summary for a user
 */
export declare function generateDailySummary(firebaseUid: string, date: string): Promise<AIInsight>;
/**
 * HTTP Callable function for generating daily summary
 */
export declare const generateDailySummaryCallable: import("firebase-functions/v2/https").CallableFunction<any, Promise<{
    success: boolean;
    insight: any;
    cached: boolean;
}>>;
