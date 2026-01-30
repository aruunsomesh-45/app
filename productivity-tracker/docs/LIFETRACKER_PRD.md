# LifeTracker PRD
## Product Requirements Document v1.0

**Document Status:** Draft  
**Last Updated:** January 16, 2026  
**Author:** Development Team  
**Version:** 1.0.0

---

## Table of Contents
1. [Overview & Vision](#1-overview--vision)
2. [Goals & Success Metrics](#2-goals--success-metrics)
3. [User Personas & Scenarios](#3-user-personas--scenarios)
4. [MVP Scope](#4-mvp-scope)
5. [Feature Requirements](#5-feature-requirements)
6. [Out-of-Scope (Deferred Features)](#6-out-of-scope-deferred-features)
7. [Technical Architecture](#7-technical-architecture)
8. [Timeline & Roadmap](#8-timeline--roadmap)
9. [Design System](#9-design-system)
10. [Risks & Dependencies](#10-risks--dependencies)
11. [Appendix](#11-appendix)

---

## 1. Overview & Vision

### 1.1 Product Summary
**LifeTracker** is a Personal Life Operating System designed to help users systematically **Track → Reflect → Improve** across all dimensions of their life. It consolidates 10 interconnected life systems into a unified dashboard, enabling users to log activities, set intentions, measure progress, and cultivate lasting habits.

### 1.2 Core Philosophy
> *"What gets measured gets managed. What gets reflected upon gets transformed."*

LifeTracker is built on three pillars:
1. **Track** — Capture daily activities, metrics, and moments across life systems
2. **Reflect** — Journal insights, compare trends, and conduct weekly reviews
3. **Improve** — Set goals, build streaks, and receive data-driven nudges

### 1.3 Target Audience
- **Primary:** Self-motivated individuals (ages 18-40) seeking holistic life optimization
- **Secondary:** Knowledge workers, freelancers, and entrepreneurs managing complex routines
- **Tertiary:** Students and lifelong learners balancing academics, health, and personal development

### 1.4 Problem Statement
Modern productivity tools are fragmented. Users juggle separate apps for fitness, meditation, tasks, notes, and habits—leading to:
- Context switching fatigue
- Incomplete data (can't see how sleep affects workout performance)
- No unified "life dashboard" to answer: *"How am I really doing?"*

LifeTracker solves this by providing a single, interconnected system where all life data flows together.

---

## 2. Goals & Success Metrics

### 2.1 Business Goals
| Goal | Description |
|------|-------------|
| **Validate Core Concept** | Prove users want an integrated life-tracking system |
| **Achieve Daily Usage** | Users return daily to log and reflect |
| **Establish Habit Loops** | Users form streaks and maintain consistency |
| **Gather Feedback** | Collect qualitative insights for iteration |

### 2.2 Success Metrics (MVP)

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Daily Active Users (DAU)** | 70% of registered users | Analytics |
| **Log Completion Rate** | ≥1 log per user per day | Database |
| **Streak Retention** | 50% users maintain 7+ day streak | Feature analytics |
| **Session Duration** | 3-5 minutes average | Analytics |
| **Weekly Review Completion** | 40% users complete weekly review | Feature tracking |
| **NPS Score** | ≥40 | User surveys |

### 2.3 User Goals
- Answer: *"What should I focus on today?"*
- Answer: *"How am I doing this week?"*
- Build consistent daily habits
- See cross-system correlations (e.g., sleep → productivity)

---

## 3. User Personas & Scenarios

### 3.1 Primary Persona: Aarav (The Optimizer)

| Attribute | Details |
|-----------|---------|
| **Age** | 27 |
| **Occupation** | Software Developer (Remote) |
| **Goals** | Balance coding projects, fitness, and personal growth |
| **Pain Points** | Uses 6+ separate apps; loses motivation without visible progress |
| **Behavior** | Data-driven; loves dashboards and metrics |
| **Quote** | *"I want one place to see my entire life at a glance."* |

**Scenario: Aarav's Morning Routine**
1. Opens LifeTracker at 7:00 AM
2. Sees Dashboard question: *"What's your #1 focus today?"*
3. Reviews yesterday's workout log (completed 4/5 exercises)
4. Sets today's intentions: Finish feature sprint, 30min meditation, skip leg day (rest)
5. Checks weekly progress: On track for 5-day workout streak

### 3.2 Secondary Persona: Priya (The Journaler)

| Attribute | Details |
|-----------|---------|
| **Age** | 24 |
| **Occupation** | Graduate Student |
| **Goals** | Track study sessions, manage stress, build reading habit |
| **Pain Points** | Struggles to reflect; journals are unstructured |
| **Behavior** | Prefers guided prompts over blank pages |
| **Quote** | *"I want to understand patterns in my life, not just collect data."* |

**Scenario: Priya's Evening Reflection**
1. Opens LifeTracker at 9:00 PM
2. Logs 3-hour study session with focus score (7/10)
3. Prompted: *"How did your energy feel today?"*
4. Adds note: "Caffeine helped focus but disrupted afternoon clarity"
5. Views weekly insight: Study sessions are 20% longer when morning meditation is completed

---

## 4. MVP Scope

### 4.1 MVP Philosophy
> *Build the smallest version that delivers the core Track → Reflect → Improve loop.*

The MVP will:
- Launch with **3-5 life systems** (not all 10)
- Provide basic logging and reflection
- Show streak and progress indicators
- Validate user engagement patterns

### 4.2 MVP Feature Boundary

#### ✅ IN SCOPE (MVP v1.0)
| Category | Features |
|----------|----------|
| **Dashboard** | Daily focus question, weekly progress overview, streak counters |
| **Life Systems (3)** | Workout, Meditation, Reading |
| **Logging** | Quick-entry forms for each system with timestamps |
| **Notes & Reflection** | Linked notes per session, mood tags |
| **Tasks** | Daily to-do list segmented by life area |
| **Progress** | Streak counters, simple progress bars, weekly summary |
| **Settings** | Basic preferences, theme toggle |

#### ❌ OUT OF SCOPE (MVP)
See [Section 6](#6-out-of-scope-deferred-features) for deferred features.

### 4.3 MVP Life Systems Detail

| System | MVP Features | Metrics Tracked |
|--------|--------------|-----------------|
| **Workout** | Log exercises, sets, reps, weights; completion status | Streak, total sessions, exercises completed |
| **Meditation** | Log session duration, type, mood before/after | Streak, total minutes, mood delta |
| **Reading** | Log book title, pages read, key insights | Streak, pages this week, books in progress |

---

## 5. Feature Requirements

### 5.1 Dashboard (Home)

**Purpose:** Answer "What should I focus on today?" and "How am I doing?"

| Requirement ID | Feature | Description | Priority |
|----------------|---------|-------------|----------|
| DASH-001 | Daily Question Card | Shows contextual prompt based on time of day | P0 |
| DASH-002 | Today's Intentions | Display current day's set goals/tasks | P0 |
| DASH-003 | Active Streaks | Show streak counters for each active system | P0 |
| DASH-004 | Weekly Progress Ring | Visual progress toward weekly goals | P1 |
| DASH-005 | Quick Log Buttons | One-tap access to log for each system | P0 |
| DASH-006 | Recent Activity Feed | Last 5 logged activities | P1 |

**Acceptance Criteria:**
- [ ] Dashboard loads in <2 seconds
- [ ] Daily question changes based on morning/afternoon/evening
- [ ] Streak counters update in real-time after logging
- [ ] Quick log buttons navigate to respective system input screens

### 5.2 Workout System

**Purpose:** Track physical training with detail for progressive overload

| Requirement ID | Feature | Description | Priority |
|----------------|---------|-------------|----------|
| WRK-001 | Exercise Library | Pre-populated list of exercises by category | P0 |
| WRK-002 | Custom Exercises | User can create custom exercises | P1 |
| WRK-003 | Workout Logging | Log sets, reps, weight for each exercise | P0 |
| WRK-004 | Workout Templates | Save and reuse workout routines | P1 |
| WRK-005 | Session Notes | Add notes to workout session | P0 |
| WRK-006 | Progress History | View past workouts with performance trends | P1 |

**Acceptance Criteria:**
- [ ] User can log a full workout in <3 minutes
- [ ] Exercise autocomplete works with 100+ exercises
- [ ] Set completion can be marked individually
- [ ] Session is saved even if app is closed mid-workout

### 5.3 Meditation System

**Purpose:** Track mindfulness practice and correlate with mood

| Requirement ID | Feature | Description | Priority |
|----------------|---------|-------------|----------|
| MED-001 | Session Logging | Log duration, type (guided/unguided), location | P0 |
| MED-002 | Mood Capture | Pre/post session mood (1-5 scale + optional note) | P0 |
| MED-003 | Session Timer | Built-in timer with gentle completion sound | P1 |
| MED-004 | Streak Display | Consecutive days of meditation | P0 |
| MED-005 | Insights | Show mood improvement trends over time | P2 |

**Acceptance Criteria:**
- [ ] Mood capture appears automatically after timer ends
- [ ] Streak increments only once per calendar day
- [ ] User can log past meditation sessions (backdating)

### 5.4 Reading System

**Purpose:** Track reading progress and capture insights

| Requirement ID | Feature | Description | Priority |
|----------------|---------|-------------|----------|
| READ-001 | Book Library | Add books with title, author, total pages | P0 |
| READ-002 | Progress Logging | Log pages read per session | P0 |
| READ-003 | Reading Notes | Capture quotes, insights, reflections | P0 |
| READ-004 | Completion Status | Mark books as "reading" / "completed" | P0 |
| READ-005 | Reading Stats | Pages/week, books completed this year | P1 |

**Acceptance Criteria:**
- [ ] Progress bar shows % of book completed
- [ ] Notes are linked to specific page ranges
- [ ] Completed books move to archive view

### 5.5 Notes & Reflection

**Purpose:** Capture insights and enable the "Reflect" loop

| Requirement ID | Feature | Description | Priority |
|----------------|---------|-------------|----------|
| NOTE-001 | Quick Notes | Free-form text entry linked to system/date | P0 |
| NOTE-002 | Mood Tags | Attach mood/energy tags to notes | P1 |
| NOTE-003 | Session Links | Notes auto-link to logged sessions | P0 |
| NOTE-004 | Weekly Review Prompt | Guided reflection questions on Sunday | P1 |
| NOTE-005 | Search | Full-text search across all notes | P2 |

### 5.6 Task Management

**Purpose:** Manage daily intentions and weekly goals

| Requirement ID | Feature | Description | Priority |
|----------------|---------|-------------|----------|
| TASK-001 | Daily To-Do | Add/check-off tasks for today | P0 |
| TASK-002 | Task Categories | Group tasks by life area (Physical, Mental, Work) | P0 |
| TASK-003 | Weekly Goals | Set 3-5 goals for the week | P1 |
| TASK-004 | Carry-Over | Incomplete tasks auto-move to next day | P2 |
| TASK-005 | Task History | View completed tasks by date | P2 |

---

## 6. Out-of-Scope (Deferred Features)

The following are explicitly **NOT** part of MVP v1.0:

| Feature | Rationale | Target Version |
|---------|-----------|----------------|
| **All 10 Life Systems** | Start with 3 to validate; add others iteratively | v1.2+ |
| **AI-Powered Insights** | Requires significant data; add after baseline | v2.0 |
| **AI Prompt Library** | Complexity; focus on core logging first | v1.5 |
| **Looksmaxing Photo Tracking** | Privacy/storage concerns; defer | v2.0 |
| **Social/Community Features** | Multi-user complexity; solo-first | v2.0+ |
| **Multi-Device Sync** | Requires backend; local-first for MVP | v1.3 |
| **Wearable Integration** | API complexity; defer | v1.5 |
| **Advanced Analytics Dashboard** | Build after data accumulates | v1.5 |
| **Push Notifications** | Mobile-specific; web MVP first | v1.2 |
| **Voice Input** | Nice-to-have; not core | v2.0 |
| **Export/Import Data** | Add after storage is stable | v1.3 |

---

## 7. Technical Architecture

### 7.1 Tech Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Framework** | React 19 + TypeScript | Modern, type-safe, component-based |
| **Build Tool** | Vite | Fast development, optimized builds |
| **Styling** | Tailwind CSS | Utility-first, rapid iteration |
| **Animation** | Framer Motion + GSAP | Premium micro-interactions |
| **Scroll** | Lenis | Smooth native-feel scrolling |
| **Routing** | React Router v7 | Standard SPA navigation |
| **State** | Zustand (local) | Lightweight, persistent stores |
| **Backend** | Supabase (future) | Auth, database, real-time |
| **AI** | Google Gemini API | Notebook synthesis, AI features |

### 7.2 Data Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    LIFETRACKER DATA MODEL                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │   WORKOUT   │    │  MEDITATION │    │   READING   │     │
│  │   LOGS      │    │    LOGS     │    │    LOGS     │     │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘     │
│         │                  │                  │             │
│         └──────────────────┼──────────────────┘             │
│                            │                                │
│                   ┌────────▼────────┐                       │
│                   │  CENTRAL NOTES  │                       │
│                   │    SERVICE      │                       │
│                   └────────┬────────┘                       │
│                            │                                │
│                   ┌────────▼────────┐                       │
│                   │   AGGREGATION   │                       │
│                   │     ENGINE      │                       │
│                   └────────┬────────┘                       │
│                            │                                │
│                   ┌────────▼────────┐                       │
│                   │    DASHBOARD    │                       │
│                   │      VIEW       │                       │
│                   └─────────────────┘                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 7.3 Key Technical Requirements

| Requirement | Specification |
|-------------|---------------|
| **Performance** | Dashboard loads in <2s, interactions <100ms |
| **Offline** | Core logging works offline (future: sync) |
| **Data Persistence** | localStorage/IndexedDB for MVP |
| **Responsive** | Mobile-first, works 320px - 1440px+ |
| **Accessibility** | WCAG 2.1 AA compliance target |
| **Safe Areas** | Proper handling of notches/system bars |
| **Touch Targets** | Minimum 44x44px for all interactive elements |

---

## 8. Timeline & Roadmap

### 8.1 MVP Phases

```
PHASE 1: Foundation (Week 1-2)
├── Dashboard layout & navigation
├── Workout system (full implementation)
├── Basic task management
└── Local data persistence

PHASE 2: Expansion (Week 3-4)
├── Meditation system
├── Reading system
├── Notes & reflection
└── Streak tracking

PHASE 3: Polish (Week 5-6)
├── UX audit fixes (safe areas, scroll, touch targets)
├── Weekly review feature
├── Progress analytics
└── Performance optimization

PHASE 4: Launch Prep (Week 7)
├── Bug fixes & edge cases
├── User testing (5-10 users)
├── Documentation
└── Production deployment
```

### 8.2 Post-MVP Roadmap

| Version | Features | Timeline |
|---------|----------|----------|
| **v1.1** | Coding & Study systems | +2 weeks |
| **v1.2** | Push notifications, basic sync | +1 month |
| **v1.3** | Data export, additional systems | +2 months |
| **v1.5** | AI insights, wearable integration | +3 months |
| **v2.0** | Full 10 systems, advanced AI | +6 months |

---

## 9. Design System

### 9.1 Design Principles

1. **Calm Productivity** — Reduce visual noise; prioritize focus
2. **Delightful Feedback** — Every action has satisfying confirmation
3. **Progressive Disclosure** — Show complexity only when needed
4. **Consistency** — Reuse patterns across all systems
5. **Accessibility First** — Color, contrast, and interaction for all

### 9.2 Visual Language

| Element | Specification |
|---------|---------------|
| **Colors** | Light theme primary; dark mode supported |
| **Typography** | Inter/System fonts; clear hierarchy |
| **Spacing** | 4px base grid; consistent padding |
| **Radius** | Rounded corners (8px-24px); soft aesthetic |
| **Shadows** | Subtle depth; glassmorphism accents |
| **Motion** | Framer Motion spring physics; 200-400ms |

### 9.3 Component Library (Existing)

- [x] Dashboard layout
- [x] Workout logging screens
- [x] AI Notebook interface
- [x] AI Workflows canvas
- [x] Navigation components
- [ ] Meditation logging (to build)
- [ ] Reading logging (to build)
- [ ] Weekly review (to build)

---

## 10. Risks & Dependencies

### 10.1 Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Scope creep | High | High | Strict PRD adherence; weekly scope reviews |
| User engagement low | High | Medium | Early user testing; iterate on feedback |
| Technical debt | Medium | Medium | Code reviews; refactoring sprints |
| Performance issues | Medium | Low | Performance budget; Lighthouse audits |
| Data loss (local storage) | High | Low | IndexedDB with backup prompts |

### 10.2 Dependencies

| Dependency | Status | Owner |
|------------|--------|-------|
| React 19 stable | ✅ Available | - |
| Tailwind CSS 3.x | ✅ Installed | - |
| Supabase account | ⏳ Pending | Developer |
| Gemini API key | ✅ Configured | Developer |
| User testing participants | ⏳ Pending | Developer |

### 10.3 Assumptions

- Single-user system for MVP (no multi-tenancy)
- Web-first; mobile via PWA
- English language only for MVP
- Users have modern browsers (Chrome, Safari, Firefox)

---

## 11. Appendix

### 11.1 The 10 Life Systems (Full Vision)

| # | System | Description | MVP Status |
|---|--------|-------------|------------|
| 1 | **Workout** | Physical training & exercise | ✅ MVP |
| 2 | **Meditation** | Mindfulness & mental clarity | ✅ MVP |
| 3 | **Reading** | Books, articles, learning | ✅ MVP |
| 4 | **Coding** | Technical projects & skills | v1.1 |
| 5 | **Study** | Academic/professional learning | v1.1 |
| 6 | **Creativity** | Art, music, writing | v1.3 |
| 7 | **Social** | Relationships & networking | v1.5 |
| 8 | **Finance** | Budget & money tracking | v1.5 |
| 9 | **Health** | Sleep, nutrition, vitals | v1.5 |
| 10 | **Looksmaxing** | Appearance & style | v2.0 |

### 11.2 User Flow Diagram

```
┌─────────────┐
│   LAUNCH    │
└──────┬──────┘
       │
       ▼
┌─────────────┐     ┌─────────────┐
│  DASHBOARD  │◄───►│   QUICK     │
│  (Home)     │     │   LOG       │
└──────┬──────┘     └─────────────┘
       │
       ├──────────────┬──────────────┬──────────────┐
       ▼              ▼              ▼              ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│   WORKOUT   │ │  MEDITATION │ │   READING   │ │    TASKS    │
│   SYSTEM    │ │   SYSTEM    │ │   SYSTEM    │ │   MANAGER   │
└──────┬──────┘ └──────┬──────┘ └──────┬──────┘ └─────────────┘
       │               │               │
       └───────────────┴───────────────┘
                       │
                       ▼
              ┌─────────────┐
              │    NOTES    │
              │  & REFLECT  │
              └──────┬──────┘
                     │
                     ▼
              ┌─────────────┐
              │   WEEKLY    │
              │   REVIEW    │
              └─────────────┘
```

### 11.3 Glossary

| Term | Definition |
|------|------------|
| **Life System** | A category/domain of life (e.g., Workout, Reading) |
| **Log** | A single recorded entry/session |
| **Streak** | Consecutive days of activity in a system |
| **Reflection** | Notes or insights attached to logs |
| **Weekly Review** | Guided end-of-week assessment |
| **Focus Score** | Self-rated productivity/concentration metric |

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Jan 16, 2026 | Dev Team | Initial PRD draft |

---

*This is a living document. Update as requirements evolve.*
