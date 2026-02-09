# Zoku AI Productivity Tracker - Enhancement Implementation Plan

## Quick Reference Checklist

Use this document to track progress on the recommended enhancements.

---

## ✅ COMPLETED: Firebase Cloud Functions Setup

### Backend Infrastructure (DONE)
- [x] **Cloud Functions Directory Structure**
  - [x] `functions/src/index.ts` - Main entry point
  - [x] `functions/src/config/supabase.ts` - Supabase client
  - [x] `functions/src/config/genkit.ts` - Genkit AI configuration

### Aggregation Functions (DONE)
- [x] `functions/src/aggregation/dailyStats.ts` - Daily metrics
- [x] `functions/src/aggregation/weeklyStats.ts` - Weekly rollups
- [x] `functions/src/aggregation/monthlyStats.ts` - Monthly rollups

### AI Insight Functions (DONE)
- [x] `functions/src/ai/dailySummary.ts` - Daily AI summaries
- [x] `functions/src/ai/weeklyReview.ts` - Weekly AI reviews
- [x] `functions/src/ai/goalBuddySuggestions.ts` - Goal recommendations

### Trigger Functions (DONE)
- [x] `functions/src/triggers/onSessionCreate.ts` - Session triggers
- [x] `functions/src/triggers/onGoalUpdate.ts` - Goal triggers

### Scheduled Functions (DONE)
- [x] `functions/src/scheduled/endOfDay.ts` - End of day processing
- [x] `functions/src/scheduled/endOfWeek.ts` - End of week processing

### Callable API Functions (DONE)
- [x] `functions/src/callable/getAggregatedStats.ts` - Stats API
- [x] `functions/src/callable/getAIInsights.ts` - Insights API

### Client-Side Services (DONE)
- [x] `src/services/analyticsService.ts` - Firebase Analytics
- [x] `src/services/performanceService.ts` - Performance Monitoring
- [x] `src/services/cloudFunctionsApi.ts` - Cloud Functions API
- [x] `src/services/errorReportingService.ts` - Error Tracking
- [x] `src/hooks/useRealtimeState.ts` - Firestore hooks

### Database Migrations (DONE)
- [x] `supabase/migrations/20260208_aggregated_stats.sql` - Stats tables

### Configuration (DONE)
- [x] `firebase.json` - Updated with functions config
- [x] `functions/package.json` - Dependencies
- [x] `functions/tsconfig.json` - TypeScript config
- [x] `functions/FUNCTIONS_README.md` - Documentation

---

## Phase 1: Quick Wins (Target: 1-2 days each)

### 1.1 Populate Empty States
- [ ] **Analytics Tab** (`Stats.tsx`)
  - [ ] Connect charts to Cloud Functions aggregated data
  - [ ] Add weekly/monthly trend lines using `cloudFunctionsApi`
  - [ ] Create fallback content for new users
- [ ] **Empty Section Cards**
  - [ ] Add "Get Started" prompts
  - [ ] Include sample data or onboarding hints
- **Estimated Time:** 4-6 hours
- **Priority:** HIGH

### 1.2 Fix Financial Learning Pipeline
- [ ] Initialize `financial_learning_progress` row on first access
- [ ] Update `loadFromSupabase()` in `lifeTrackerStore.ts` to handle empty state gracefully
- [ ] Add UI feedback for loading states
- **Estimated Time:** 2-3 hours
- **Priority:** HIGH

### 1.3 Enhance Notifications with Context
- [x] Add notification preferences (implemented in `user_preferences` table)
- [ ] Implement "Do Not Disturb" schedule in Profile settings
- [ ] Add notification history view using Firestore `notifications` collection
- **Estimated Time:** 4-6 hours
- **Priority:** MEDIUM

---

## Phase 2: High-Impact Features (Target: 3-5 days each)

### 2.1 Upgrade Home to Daily Command Center
**File:** `Dashboard.tsx`

- [ ] **Today's Agenda Widget**
  - [ ] Use `useTodayStats()` hook for real-time data
  - [ ] Quick complete/reschedule actions
- [x] **AI Daily Summary** (Backend implemented)
  - [x] Backend: `generateDailySummaryCallable`
  - [ ] Frontend: Display AI summary widget
- [ ] **Quick Action Buttons**
  - [ ] Log meditation session
  - [ ] Add reading session
  - [ ] Quick note
- [ ] **Visual Refresh**
  - [ ] Reorganize layout for "command center" feel
  - [ ] Add progress rings/charts
- **Estimated Time:** 3-4 days
- **Priority:** HIGH

### 2.2 Improve Analytics with Insights
**Files:** `Stats.tsx`, `cloudFunctionsApi.ts`

- [x] **Real Data Connection** (Backend implemented)
  - [x] Backend aggregation functions
  - [ ] Frontend: Connect `Stats.tsx` to `aggregationApi`
- [x] **Trend Analysis** (Backend implemented)
  - [x] Week-over-week comparison in `getComparativeStats`
  - [ ] Frontend: Display comparison charts
- [x] **Actionable Recommendations** (Backend implemented)
  - [x] AI-generated suggestions in `goalBuddySuggestions`
  - [ ] Frontend: Display recommendations widget
- **Estimated Time:** 2-3 days (frontend only)
- **Priority:** HIGH

### 2.3 Add Weekly Reflection Loops
**Files:** `WeeklyReview.tsx` (new)

- [x] **Weekly Review Logic** (Backend implemented)
  - [x] `generateWeeklyReviewCallable`
  - [x] `endOfWeekProcessing` scheduled function
- [ ] **Sunday Review UI**
  - [ ] Notification trigger on Sunday evening
  - [ ] Review modal with week summary
- [ ] **Progress Comparison UI**
  - [ ] Use `getComparativeStats` for week vs week
  - [ ] Goal completion rate display
- **Estimated Time:** 2-3 days (frontend only)
- **Priority:** MEDIUM

---

## Phase 3: Advanced Features (Target: 1-2 weeks each)

### 3.1 Strengthen Goal Buddy Intelligence
**Files:** `goalAssistantService.ts`, Cloud Functions

- [x] **Pattern Learning** (Backend infrastructure ready)
  - [x] `onGoalUpdate` trigger tracks completions
  - [ ] Frontend: Display learned patterns
- [x] **Adaptive Timing** (Backend ready)
  - [x] Streak tracking in `user_streaks` table
  - [ ] Frontend: Display optimal timing suggestions
- [x] **Difficulty Adjustment** (Backend ready)
  - [x] `goalBuddySuggestions` analyzes completion rates
  - [ ] Frontend: Display suggestions
- **Estimated Time:** 3-5 days (frontend integration)
- **Priority:** MEDIUM

### 3.2 Progressive Section Activation
**Files:** `sectionRegistry.ts`, `OnboardingFlow.tsx` (new)

- [ ] **Onboarding Flow**
  - [ ] Multi-step onboarding for new users
  - [ ] Interest selection with section preview
- [ ] **Progressive Reveal**
  - [ ] Start with 3-4 core sections
  - [ ] Unlock more based on usage
- [ ] **Achievement Unlocks**
  - [ ] Gamify section access
  - [ ] Badge system for milestones
- **Estimated Time:** 1 week
- **Priority:** LOW

### 3.3 Error Handling & Observability
**Files:** `errorReportingService.ts` (done), `ErrorBoundary.tsx` (new)

- [x] **Error Reporting Service** (DONE)
  - [x] `errorReportingService.ts` created
  - [x] Global error handlers
  - [x] Firestore error logging
- [ ] **Error Boundaries**
  - [ ] Wrap major routes/sections
  - [ ] Graceful fallback UI
- [ ] **Admin Dashboard** (optional)
  - [ ] Health metrics overview
  - [ ] User activity summary
- **Estimated Time:** 3-5 days (error boundaries)
- **Priority:** LOW

### 3.4 Offline Support & App Resilience
**Files:** `service-worker.js`, `manifest.json`

- [ ] **Service Worker**
  - [ ] Cache static assets
  - [ ] Implement stale-while-revalidate strategy
- [ ] **Offline Queue**
  - [ ] Queue data changes when offline
  - [ ] Sync when connection restored
- [ ] **PWA Features**
  - [ ] Install prompt
  - [ ] App icon and splash screen
- **Estimated Time:** 1-2 weeks
- **Priority:** LOW

---

## Bug Fixes

### High Priority
- [ ] **Analytics Tab Empty** - Connect to Cloud Functions data
- [ ] **406 Error Console Noise** - Initialize financial progress on first access

### Medium Priority
- [ ] **Placeholder Images** - Replace with actual assets or generate
- [ ] **Mobile Navigation** - Improve hamburger menu UX

### Low Priority
- [ ] **Console Warnings** - Clean up unused imports
- [ ] **Accessibility** - Add ARIA labels to interactive elements

---

## Next Steps

### Immediate (This Sprint)
1. Run `npm install` in `functions/` directory (DONE)
2. Run Supabase migration for aggregated stats tables (DONE)
3. Set Firebase secrets for Supabase and Gemini API keys (See FUNCTIONS_DEPLOY.md)
4. Test Cloud Functions with emulators (Requires Java)
5. Deploy Cloud Functions to Firebase (See FUNCTIONS_DEPLOY.md)

### Short-Term (Next Sprint)
1. Connect Dashboard to `useTodayStats()` hook
2. Connect Stats page to `aggregationApi`
3. Add AI insights display to Dashboard
4. Create Weekly Review modal

### Medium-Term
1. Add Error Boundaries
2. Implement offline support
3. Progressive section activation

---

## Notes

### How to Use This Document
1. Check off items as you complete them
2. Add notes or blockers in the margins
3. Adjust priorities based on user feedback
4. Update estimated times based on actual completion

### Key Files Reference
| Feature | Primary Files |
|---------|---------------|
| Dashboard | `Dashboard.tsx`, `useRealtimeState.ts`, `cloudFunctionsApi.ts` |
| Stats | `Stats.tsx`, `cloudFunctionsApi.ts` |
| Notifications | `NotificationContext.tsx`, `goalAssistantService.ts` |
| Auth | `AuthContext.tsx`, `firebaseConfig.ts` |
| Cloud Functions | `functions/src/*` |
| Error Tracking | `errorReportingService.ts` |

---

*Last Updated: February 8, 2026*
