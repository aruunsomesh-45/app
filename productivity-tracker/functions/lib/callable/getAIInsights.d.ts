/**
 * Callable Function: Get AI Insights
 *
 * HTTP callable function for the client to fetch AI-generated insights.
 * Insights are pre-generated and cached to reduce AI API costs.
 */
import { AIInsight } from "../config/supabase";
/**
 * Get AI insights for the authenticated user
 */
export declare const getAIInsights: import("firebase-functions/v2/https").CallableFunction<any, Promise<{
    success: boolean;
    insights: any[];
    insight?: undefined;
    cached?: undefined;
} | {
    success: boolean;
    insight: any;
    cached: boolean;
    insights?: undefined;
}>>;
/**
 * Get latest insight of each type (for dashboard display)
 */
export declare const getLatestInsights: import("firebase-functions/v2/https").CallableFunction<any, Promise<{
    success: boolean;
    insights: Record<string, AIInsight | null>;
}>>;
/**
 * Mark insight as read/dismissed
 */
export declare const dismissInsight: import("firebase-functions/v2/https").CallableFunction<any, Promise<{
    success: boolean;
}>>;
