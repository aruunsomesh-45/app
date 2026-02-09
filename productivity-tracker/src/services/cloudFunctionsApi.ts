/**
 * Cloud Functions API Service
 * 
 * Client-side service for calling Firebase Cloud Functions.
 * Provides typed wrappers for aggregation and AI insight functions.
 */

import { httpsCallable, type HttpsCallableResult } from "firebase/functions";
import { functions } from "../utils/firebaseConfig";

/**
 * Stats types returned from aggregation functions
 */
export interface DailyStats {
    date: string;
    focus_score: number;
    sleep_hours: number;
    steps: number;
    workouts_completed: number;
    pages_read: number;
    meditation_minutes: number;
    goals_completed: number;
    goals_total: number;
    streak_days: number;
}

export interface WeeklyStats {
    week_start: string;
    week_end: string;
    avg_focus_score: number;
    total_sleep_hours: number;
    total_steps: number;
    total_workouts: number;
    total_pages_read: number;
    total_meditation_minutes: number;
    goal_completion_rate: number;
    best_day: string;
    worst_day: string;
}

export interface MonthlyStats {
    month: string;
    avg_focus_score: number;
    total_workouts: number;
    total_pages_read: number;
    total_meditation_minutes: number;
    goal_completion_rate: number;
    longest_streak: number;
}

export interface AIInsight {
    id: string;
    type: "daily_summary" | "weekly_review" | "goal_suggestion";
    content: string;
    metadata?: Record<string, unknown>;
    created_at: string;
    expires_at?: string;
}

export interface TodayStats {
    goalsCompleted: number;
    goalsTotal: number;
    meditationMinutes: number;
    workoutVolume: number;
    currentStreak: number;
    lastActiveDate?: string;
}

/**
 * Callable function references
 */
const getAggregatedStatsFunc = httpsCallable(functions, "getAggregatedStats");
const getTodayStatsFunc = httpsCallable(functions, "getTodayStats");
const getComparativeStatsFunc = httpsCallable(functions, "getComparativeStats");
const getAIInsightsFunc = httpsCallable(functions, "getAIInsights");
const getLatestInsightsFunc = httpsCallable(functions, "getLatestInsights");
const dismissInsightFunc = httpsCallable(functions, "dismissInsight");
const aggregateDailyStatsFunc = httpsCallable(functions, "aggregateDailyStatsCallable");
const aggregateWeeklyStatsFunc = httpsCallable(functions, "aggregateWeeklyStatsCallable");
const generateDailySummaryFunc = httpsCallable(functions, "generateDailySummaryCallable");
const generateWeeklyReviewFunc = httpsCallable(functions, "generateWeeklyReviewCallable");
const generateGoalSuggestionsFunc = httpsCallable(functions, "generateGoalSuggestionsCallable");

/**
 * Helper to extract data from callable result
 */
function extractResult<T>(result: HttpsCallableResult<unknown>): T {
    const data = result.data as { success?: boolean; error?: string } & T;
    if (data.success === false) {
        throw new Error(data.error || "Unknown error");
    }
    return data;
}

/**
 * Aggregation API
 */
export const aggregationApi = {
    /**
     * Get daily stats for a specific date or recent days
     */
    async getDailyStats(date?: string, limit = 7): Promise<DailyStats | DailyStats[]> {
        const result = await getAggregatedStatsFunc({
            type: "daily",
            date,
            limit,
        });
        const data = extractResult<{ stats: DailyStats | DailyStats[] }>(result);
        return data.stats;
    },

    /**
     * Get weekly stats for a specific week or recent weeks
     */
    async getWeeklyStats(weekStart?: string, weekEnd?: string, limit = 4): Promise<WeeklyStats | WeeklyStats[]> {
        const result = await getAggregatedStatsFunc({
            type: "weekly",
            weekStart,
            weekEnd,
            limit,
        });
        const data = extractResult<{ stats: WeeklyStats | WeeklyStats[] }>(result);
        return data.stats;
    },

    /**
     * Get monthly stats for a specific month or recent months
     */
    async getMonthlyStats(month?: string, limit = 6): Promise<MonthlyStats | MonthlyStats[]> {
        const result = await getAggregatedStatsFunc({
            type: "monthly",
            date: month,
            limit,
        });
        const data = extractResult<{ stats: MonthlyStats | MonthlyStats[] }>(result);
        return data.stats;
    },

    /**
     * Get today's real-time stats from Firestore
     */
    async getTodayStats(): Promise<TodayStats> {
        const result = await getTodayStatsFunc({});
        const data = extractResult<{ stats: TodayStats }>(result);
        return data.stats;
    },

    /**
     * Get comparative stats (this week vs last week, etc.)
     */
    async getComparativeStats(type: "weekly" | "monthly"): Promise<{
        current: WeeklyStats | MonthlyStats | null;
        previous: WeeklyStats | MonthlyStats | null;
        changes: { focusScore: number; goalCompletionRate: number; workouts: number } | null;
    }> {
        const result = await getComparativeStatsFunc({ type });
        const data = extractResult<{
            comparison: {
                current: WeeklyStats | MonthlyStats | null;
                previous: WeeklyStats | MonthlyStats | null;
                changes: { focusScore: number; goalCompletionRate: number; workouts: number } | null;
            };
        }>(result);
        return data.comparison;
    },

    /**
     * Trigger manual aggregation for a specific date
     */
    async triggerDailyAggregation(date: string): Promise<DailyStats> {
        const result = await aggregateDailyStatsFunc({ date });
        const data = extractResult<{ stats: DailyStats }>(result);
        return data.stats;
    },

    /**
     * Trigger manual weekly aggregation
     */
    async triggerWeeklyAggregation(weekStart?: string, weekEnd?: string): Promise<WeeklyStats> {
        const result = await aggregateWeeklyStatsFunc({ weekStart, weekEnd });
        const data = extractResult<{ stats: WeeklyStats }>(result);
        return data.stats;
    },
};

/**
 * AI Insights API
 */
export const aiInsightsApi = {
    /**
     * Get AI insight of a specific type
     */
    async getInsight(
        type: "daily_summary" | "weekly_review" | "goal_suggestion",
        options?: { date?: string; weekStart?: string; weekEnd?: string; forceRefresh?: boolean }
    ): Promise<{ insight: AIInsight; cached: boolean }> {
        const result = await getAIInsightsFunc({
            type,
            ...options,
        });
        const data = extractResult<{ insight: AIInsight; cached: boolean }>(result);
        return { insight: data.insight, cached: data.cached };
    },

    /**
     * Get all recent insights
     */
    async getAllInsights(): Promise<AIInsight[]> {
        const result = await getAIInsightsFunc({ type: "all" });
        const data = extractResult<{ insights: AIInsight[] }>(result);
        return data.insights;
    },

    /**
     * Get latest insight of each type (for dashboard)
     */
    async getLatestInsights(): Promise<Record<string, AIInsight | null>> {
        const result = await getLatestInsightsFunc({});
        const data = extractResult<{ insights: Record<string, AIInsight | null> }>(result);
        return data.insights;
    },

    /**
     * Dismiss/expire an insight
     */
    async dismissInsight(insightId: string): Promise<void> {
        await dismissInsightFunc({ insightId });
    },

    /**
     * Generate a new daily summary
     */
    async generateDailySummary(date?: string): Promise<AIInsight> {
        const result = await generateDailySummaryFunc({ date });
        const data = extractResult<{ insight: AIInsight }>(result);
        return data.insight;
    },

    /**
     * Generate a new weekly review
     */
    async generateWeeklyReview(weekStart?: string, weekEnd?: string): Promise<AIInsight> {
        const result = await generateWeeklyReviewFunc({ weekStart, weekEnd });
        const data = extractResult<{ insight: AIInsight }>(result);
        return data.insight;
    },

    /**
     * Generate goal buddy suggestions
     */
    async generateGoalSuggestions(goalIds?: string[]): Promise<AIInsight> {
        const result = await generateGoalSuggestionsFunc({ goalIds });
        const data = extractResult<{ insight: AIInsight }>(result);
        return data.insight;
    },
};

/**
 * Combined API export
 */
export const cloudFunctionsApi = {
    aggregation: aggregationApi,
    aiInsights: aiInsightsApi,
};

export default cloudFunctionsApi;
