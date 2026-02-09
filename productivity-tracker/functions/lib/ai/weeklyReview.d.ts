/**
 * Weekly Review AI Function
 *
 * Generates comprehensive weekly reviews with strengths, weaknesses, and suggestions.
 * Non-real-time: reviews are generated end-of-week and stored.
 */
import { AIInsight } from "../config/supabase";
/**
 * Generate a weekly review for a user
 */
export declare function generateWeeklyReview(firebaseUid: string, weekStart: string, weekEnd: string): Promise<AIInsight>;
/**
 * HTTP Callable function for generating weekly review
 */
export declare const generateWeeklyReviewCallable: import("firebase-functions/v2/https").CallableFunction<any, Promise<{
    success: boolean;
    insight: any;
    cached: boolean;
}>>;
