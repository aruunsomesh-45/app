# Firebase Cloud Functions Documentation

## Overview

This directory contains Firebase Cloud Functions for the Zoku AI Productivity Tracker application. These functions handle:

- **Data Aggregation**: Daily, weekly, and monthly stats rollup
- **AI Insights**: Genkit-powered personalized recommendations
- **Triggers**: Real-time updates on data changes
- **Scheduled Tasks**: End-of-day and end-of-week processing

## Architecture

```
functions/
├── src/
│   ├── index.ts              # Main entry point, exports all functions
│   ├── config/
│   │   ├── supabase.ts       # Supabase client configuration
│   │   └── genkit.ts         # Genkit AI configuration
│   ├── aggregation/
│   │   ├── dailyStats.ts     # Daily stats aggregation
│   │   ├── weeklyStats.ts    # Weekly stats aggregation
│   │   └── monthlyStats.ts   # Monthly stats aggregation
│   ├── ai/
│   │   ├── dailySummary.ts   # Daily AI summary generation
│   │   ├── weeklyReview.ts   # Weekly AI review
│   │   └── goalBuddySuggestions.ts # Goal recommendations
│   ├── triggers/
│   │   ├── onSessionCreate.ts # Session creation triggers
│   │   └── onGoalUpdate.ts   # Goal update triggers
│   ├── callable/
│   │   ├── getAggregatedStats.ts # Stats API
│   │   └── getAIInsights.ts  # AI Insights API
│   └── scheduled/
│       ├── endOfDay.ts       # Daily scheduled tasks
│       └── endOfWeek.ts      # Weekly scheduled tasks
├── package.json
├── tsconfig.json
└── FUNCTIONS_README.md       # This file
```

## Setup

### Prerequisites

1. Node.js 20 or later
2. Firebase CLI installed globally: `npm install -g firebase-tools`
3. Logged into Firebase: `firebase login`

### Installation

```bash
cd functions
npm install
```

### Environment Secrets

Set the following secrets using Firebase CLI:

```bash
# Supabase credentials
firebase functions:secrets:set SUPABASE_URL
firebase functions:secrets:set SUPABASE_SERVICE_KEY

# Gemini API key (for AI features)
firebase functions:secrets:set GEMINI_API_KEY
```

## Development

### Build

```bash
npm run build
```

### Watch Mode

```bash
npm run build:watch
```

### Local Emulator

Run locally with the Firebase emulator:

```bash
# From project root
firebase emulators:start --only functions,firestore
```

## Function Reference

### Aggregation Functions

#### `aggregateDailyStatsCallable`
- **Type**: HTTPS Callable
- **Purpose**: Calculate daily stats for a user
- **Input**: `{ date?: string; firebaseUid?: string }`
- **Output**: `{ success: boolean; stats: DailyStats }`

#### `aggregateWeeklyStatsCallable`
- **Type**: HTTPS Callable
- **Purpose**: Roll up daily stats into weekly summaries
- **Input**: `{ weekStart?: string; weekEnd?: string }`
- **Output**: `{ success: boolean; stats: WeeklyStats }`

#### `aggregateMonthlyStatsCallable`
- **Type**: HTTPS Callable
- **Purpose**: Roll up weekly stats into monthly summaries
- **Input**: `{ month?: string }`
- **Output**: `{ success: boolean; stats: MonthlyStats }`

### AI Insight Functions

#### `generateDailySummaryCallable`
- **Type**: HTTPS Callable
- **Purpose**: Generate personalized daily summary using Genkit
- **Input**: `{ date?: string }`
- **Output**: `{ success: boolean; insight: AIInsight }`

#### `generateWeeklyReviewCallable`
- **Type**: HTTPS Callable
- **Purpose**: Generate weekly review with trends and suggestions
- **Input**: `{ weekStart?: string; weekEnd?: string }`
- **Output**: `{ success: boolean; insight: AIInsight }`

#### `generateGoalSuggestionsCallable`
- **Type**: HTTPS Callable
- **Purpose**: Generate goal-specific recommendations
- **Input**: `{ goalIds?: string[] }`
- **Output**: `{ success: boolean; insight: AIInsight }`

### Trigger Functions

#### `onSessionCreate`
- **Type**: Firestore Trigger (onCreate)
- **Path**: `sessions/{sessionId}`
- **Purpose**: Update real-time state when sessions are created

#### `onGoalComplete`
- **Type**: Firestore Trigger (onUpdate)
- **Path**: `goals/{goalId}`
- **Purpose**: Track goal completions and update streaks

#### `onGoalStalled`
- **Type**: Firestore Trigger (onUpdate)
- **Path**: `goals/{goalId}`
- **Purpose**: Detect stalled goals and trigger AI suggestions

### Scheduled Functions

#### `endOfDayProcessing`
- **Type**: Scheduled (Pub/Sub)
- **Schedule**: Every day at 11:30 PM UTC
- **Purpose**: Finalize daily stats, generate summaries, update streaks

#### `endOfWeekProcessing`
- **Type**: Scheduled (Pub/Sub)
- **Schedule**: Every Sunday at 11:30 PM UTC
- **Purpose**: Generate weekly/monthly reviews

### Callable API Functions

#### `getAggregatedStats`
- **Type**: HTTPS Callable
- **Purpose**: Fetch pre-aggregated stats for client
- **Input**: `{ type: 'daily' | 'weekly' | 'monthly'; date?: string; limit?: number }`

#### `getTodayStats`
- **Type**: HTTPS Callable
- **Purpose**: Get real-time today's stats from Firestore

#### `getComparativeStats`
- **Type**: HTTPS Callable
- **Purpose**: Get this-week-vs-last-week or month comparisons

#### `getAIInsights`
- **Type**: HTTPS Callable
- **Purpose**: Fetch or generate AI insights

#### `getLatestInsights`
- **Type**: HTTPS Callable
- **Purpose**: Get most recent insight of each type

#### `dismissInsight`
- **Type**: HTTPS Callable
- **Purpose**: Mark an insight as dismissed/expired

## Database Schema

### Supabase Tables

See `supabase/migrations/20260208_aggregated_stats.sql` for the full schema:

- `aggregated_daily_stats` - Daily user metrics
- `aggregated_weekly_stats` - Weekly rollups
- `aggregated_monthly_stats` - Monthly rollups
- `ai_insights` - Stored AI-generated content
- `user_streaks` - Active streak tracking
- `user_preferences` - Notification preferences
- `health_data` - Steps, sleep, etc.

### Firestore Collections

- `userState/{firebaseUid}` - Real-time user state
  - `lastActivity: Timestamp`
  - `lastActiveDate: string`
  - `currentStreak: number`
  - `goalStreak: number`
  - `todayStats: object`
  - `activeSession: object | null`

- `notifications/{notificationId}` - Real-time notifications
  - `firebaseUid: string`
  - `type: string`
  - `message: string`
  - `read: boolean`
  - `createdAt: Timestamp`

- `errorLogs/{logId}` - Client-side error logs
  - `message: string`
  - `severity: string`
  - `context: object`
  - `timestamp: Timestamp`

## Deployment

### Deploy All Functions

```bash
firebase deploy --only functions
```

### Deploy Specific Function

```bash
firebase deploy --only functions:aggregateDailyStatsCallable
```

### Deploy Function Group

```bash
firebase deploy --only functions:aggregation
```

## Cost Optimization

### AI Usage Limits

The Genkit configuration includes built-in cost controls:

- **Max Tokens**: 200 per request
- **Rate Limiting**: 10 requests per user per minute
- **Caching**: AI insights are cached and reused until expiration

### Execution Limits

All functions are configured with:

- **Memory**: 256MB (default)
- **Timeout**: 60 seconds (max 540 for AI functions)
- **Max Instances**: 10 (prevents runaway scaling)

## Monitoring

### View Logs

```bash
firebase functions:log
```

### View Specific Function Logs

```bash
firebase functions:log --only aggregateDailyStatsCallable
```

## Troubleshooting

### Common Issues

1. **Secret not found**
   ```
   Error: SUPABASE_URL is not defined
   ```
   Solution: Set the secret using `firebase functions:secrets:set SUPABASE_URL`

2. **Build errors**
   ```
   Cannot find module '@genkit-ai/googleai'
   ```
   Solution: Run `npm install` in the functions directory

3. **Emulator connection refused**
   Make sure the emulators are running and the client is configured to connect:
   ```typescript
   if (import.meta.env.DEV) {
     connectFunctionsEmulator(functions, "localhost", 5001);
   }
   ```

4. **Authentication errors**
   All callable functions require Firebase Auth. Ensure the user is authenticated before calling.

## Client Integration

See `src/services/cloudFunctionsApi.ts` for the typed client-side API.

```typescript
import { cloudFunctionsApi } from './services/cloudFunctionsApi';

// Get aggregated stats
const dailyStats = await cloudFunctionsApi.aggregation.getDailyStats();
const weeklyStats = await cloudFunctionsApi.aggregation.getWeeklyStats();

// Get AI insights
const insight = await cloudFunctionsApi.aiInsights.getInsight('daily_summary');
const suggestions = await cloudFunctionsApi.aiInsights.generateGoalSuggestions();
```

## Security

- All callable functions verify Firebase Auth tokens
- Supabase credentials use Firebase Secrets
- Firestore rules restrict access to user's own data
- AI prompts include safety settings (BLOCK_LOW_AND_ABOVE)
