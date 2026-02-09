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

import * as admin from "firebase-admin";

// Initialize Firebase Admin SDK
admin.initializeApp();

// Export aggregation functions
export * from "./aggregation/dailyStats";
export * from "./aggregation/weeklyStats";
export * from "./aggregation/monthlyStats";

// Export AI insight functions
export * from "./ai/dailySummary";
export * from "./ai/weeklyReview";
export * from "./ai/goalBuddySuggestions";
export * from "./ai/helloGenkit";
export * from "./ai/nanoBananaChat";
export * from "./ai/learningHubGenerate";
export * from "./ai/testPush";

// Export trigger functions
export * from "./triggers/onSessionCreate";
export * from "./triggers/onGoalUpdate";

// Export scheduled functions
export * from "./scheduled/endOfDay";
export * from "./scheduled/endOfWeek";

// Export HTTP callable functions
export * from "./callable/getAggregatedStats";
export * from "./callable/getAIInsights";
