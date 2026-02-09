/**
 * Goal Buddy AI Suggestions
 *
 * Analyzes goals and progress to provide smart suggestions.
 * Detects stalled goals and suggests breakdowns.
 */
import { AIInsight } from "../config/supabase";
/**
 * Generate goal suggestions for a user
 */
export declare function generateGoalSuggestions(firebaseUid: string, goalIds?: string[]): Promise<AIInsight>;
/**
 * HTTP Callable function for generating goal suggestions
 */
export declare const generateGoalSuggestionsCallable: import("firebase-functions/v2/https").CallableFunction<any, Promise<{
    success: boolean;
    insight: any;
    cached: boolean;
}>>;
