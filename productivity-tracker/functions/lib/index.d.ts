/**
 * Cloud Functions Entry Point
 *
 * This module exports all Cloud Functions for the Productivity Tracker app.
 * Functions are organized by purpose:
 * - Aggregation: Daily/Weekly/Monthly stats rollup
 * - AI Insights: Genkit-powered summaries and recommendations
 * - Triggers: Firestore document change handlers
 * - Scheduled: Cron-based periodic functions
 */
export * from "./aggregation/dailyStats";
export * from "./aggregation/weeklyStats";
export * from "./aggregation/monthlyStats";
export * from "./ai/dailySummary";
export * from "./ai/weeklyReview";
export * from "./ai/goalBuddySuggestions";
export * from "./triggers/onSessionCreate";
export * from "./triggers/onGoalUpdate";
export * from "./scheduled/endOfDay";
export * from "./scheduled/endOfWeek";
export * from "./callable/getAggregatedStats";
export * from "./callable/getAIInsights";
