/**
 * Goal Assistant Service
 * 
 * A supportive, non-judgmental accountability buddy that helps users
 * track their personal goals with gentle reminders and encouragement.
 */

export type GoalFrequency = 'daily' | 'weekly' | 'custom';
export type GoalCategory = 'health' | 'productivity' | 'learning' | 'mindfulness' | 'fitness' | 'creative' | 'social' | 'custom';

export interface PersonalGoal {
    id: string;
    title: string;
    description?: string;
    category: GoalCategory;
    frequency: GoalFrequency;
    customDays?: number[]; // 0-6 for Sunday-Saturday
    scheduledTime?: string; // HH:MM format
    reminderEnabled: boolean;
    reminderMinutesBefore: number;
    isReflective: boolean; // Low-effort goals like journaling
    createdAt: string;
    isActive: boolean;
}

export interface GoalCompletion {
    id: string;
    goalId: string;
    completedAt: string;
    note?: string;
    mood?: 'great' | 'good' | 'okay' | 'tough';
}

export interface GoalStreak {
    goalId: string;
    currentStreak: number;
    longestStreak: number;
    lastCompletedDate: string | null;
}

export interface AssistantMessage {
    id: string;
    type: 'reminder' | 'encouragement' | 'acknowledgment' | 'gentle-nudge' | 'streak-celebration';
    message: string;
    goalId?: string;
    timestamp: string;
    read: boolean;
}

// Notification templates - Calm, buddy-like tone for push notifications
// Short, clear, self-contained messages that work at a glance

const REMINDER_TEMPLATES = {
    morning: [
        "Hey — {goal} is on your plan today.",
        "{goal} is there when you're ready.",
        "Just a heads up: {goal} is on the list today."
    ],
    afternoon: [
        "{goal} is still there if you want it.",
        "Quick reminder about {goal} — no rush.",
        "{goal} on your radar for today."
    ],
    evening: [
        "Still time for {goal} if it works for you.",
        "{goal} is there if tonight feels right.",
        "Evening check-in: {goal} is still an option."
    ]
};

// Time-based reminder templates
const SCHEDULED_REMINDER_TEMPLATES = [
    "⏰ It's {time} — this was your planned {goal} time.",
    "This is your moment for {goal}.",
    "{time} — your {goal} window."
];

// Completed goal acknowledgments - brief, no overpraise
const ACKNOWLEDGMENT_TEMPLATES = [
    "{goal} done today 💪 Nice work.",
    "You showed up for {goal} — that counts.",
    "{goal} ✓ Another one in the books.",
    "{goal} complete. Solid.",
    "Done with {goal}. Nice."
];

// Streak acknowledgments - simple and warm
const STREAK_TEMPLATES = {
    small: [ // 3-7 days
        "{streak} days of {goal}. Momentum building.",
        "{goal} — {streak} day streak going."
    ],
    medium: [ // 7-14 days
        "{streak} days on {goal}. It's becoming routine.",
        "{goal} streak: {streak} days strong."
    ],
    large: [ // 14+ days
        "{streak} days of {goal}. This is you now.",
        "{goal} — {streak} day habit. Respect."
    ]
};

// Incomplete goal nudges - gentle, encourage small effort
const INCOMPLETE_GOAL_TEMPLATES = [
    "You planned {goal} today 📘 Even a few minutes is fine.",
    "Just a reminder about {goal} — light effort works.",
    "{goal} is still on the plan. Small steps count.",
    "Hey — {goal} is there if you get a moment."
];

// Multiple incomplete goals
const MULTIPLE_GOALS_TEMPLATES = [
    "Quick check-in 🙂 {goals} are still on today's plan.",
    "A few things left today: {goals}. No pressure."
];

// End-of-day messages - normalize missed days, no disappointment
const END_OF_DAY_TEMPLATES = {
    allComplete: [
        "Today's goals done. Rest up.",
        "Everything checked off. Nice day.",
        "You did what you set out to do today ✓"
    ],
    someIncomplete: [
        "Looks like today filled up — totally okay. Tomorrow's a clean slate.",
        "No worries about today. We try again tomorrow.",
        "Busy day. That happens. Fresh start tomorrow.",
        "Today didn't go as planned — that's fine. Tomorrow's waiting."
    ]
};

// General encouragement - calm check-ins
const ENCOURAGEMENT_TEMPLATES = [
    "Hey — how are things going today?",
    "Just checking in 🙂",
    "Small steps. That's the whole thing.",
    "Progress looks different every day."
];

// Reflective/low-effort goal templates
const REFLECTIVE_GOAL_TEMPLATES = [
    "Time for {goal} — even a few minutes count.",
    "{goal} doesn't need to be perfect today.",
    "Quick {goal}? Whatever feels right."
];

class GoalAssistantService {
    private goals: PersonalGoal[] = [];
    private completions: GoalCompletion[] = [];
    private streaks: Map<string, GoalStreak> = new Map();
    private messages: AssistantMessage[] = [];
    private checkInterval: any = null;
    private listeners: Set<() => void> = new Set();

    constructor() {
        this.loadData();
        this.startMonitoring();
    }

    private loadData(): void {
        try {
            const goalsData = localStorage.getItem('goal_assistant_goals');
            const completionsData = localStorage.getItem('goal_assistant_completions');
            const messagesData = localStorage.getItem('goal_assistant_messages');

            if (goalsData) this.goals = JSON.parse(goalsData);
            if (completionsData) this.completions = JSON.parse(completionsData);
            if (messagesData) this.messages = JSON.parse(messagesData);

            // Calculate streaks
            this.calculateAllStreaks();
        } catch (error) {
            console.error('Error loading goal assistant data:', error);
        }
    }

    private saveData(): void {
        try {
            localStorage.setItem('goal_assistant_goals', JSON.stringify(this.goals));
            localStorage.setItem('goal_assistant_completions', JSON.stringify(this.completions));
            localStorage.setItem('goal_assistant_messages', JSON.stringify(this.messages));
        } catch (error) {
            console.error('Error saving goal assistant data:', error);
        }
    }

    private notify(): void {
        this.listeners.forEach(listener => listener());
    }

    subscribe(listener: () => void): () => void {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    // ==================== GOAL MANAGEMENT ====================

    addGoal(goal: Omit<PersonalGoal, 'id' | 'createdAt'>): PersonalGoal {
        const newGoal: PersonalGoal = {
            ...goal,
            id: `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date().toISOString()
        };
        this.goals.push(newGoal);
        this.streaks.set(newGoal.id, {
            goalId: newGoal.id,
            currentStreak: 0,
            longestStreak: 0,
            lastCompletedDate: null
        });
        this.saveData();
        this.notify();

        // Welcome message for new goal
        this.addMessage({
            type: 'encouragement',
            message: `New goal added: "${newGoal.title}"! 🎯 I'll be here to support you. Let's do this together!`,
            goalId: newGoal.id
        });

        return newGoal;
    }

    updateGoal(id: string, updates: Partial<PersonalGoal>): void {
        const index = this.goals.findIndex(g => g.id === id);
        if (index !== -1) {
            this.goals[index] = { ...this.goals[index], ...updates };
            this.saveData();
            this.notify();
        }
    }

    deleteGoal(id: string): void {
        this.goals = this.goals.filter(g => g.id !== id);
        this.completions = this.completions.filter(c => c.goalId !== id);
        this.streaks.delete(id);
        this.saveData();
        this.notify();
    }

    getGoals(): PersonalGoal[] {
        return [...this.goals];
    }

    getActiveGoals(): PersonalGoal[] {
        return this.goals.filter(g => g.isActive);
    }

    getGoalById(id: string): PersonalGoal | undefined {
        return this.goals.find(g => g.id === id);
    }

    // ==================== COMPLETION TRACKING ====================

    completeGoal(goalId: string, note?: string, mood?: GoalCompletion['mood']): void {
        const goal = this.getGoalById(goalId);
        if (!goal) return;

        const completion: GoalCompletion = {
            id: `completion_${Date.now()}`,
            goalId,
            completedAt: new Date().toISOString(),
            note,
            mood
        };

        this.completions.push(completion);
        this.updateStreak(goalId);
        this.saveData();
        this.notify();

        // Send acknowledgment
        const streak = this.getStreak(goalId);
        if (streak && streak.currentStreak > 2) {
            this.sendStreakCelebration(goal, streak.currentStreak);
        } else {
            this.sendAcknowledgment(goal);
        }
    }

    isGoalCompletedToday(goalId: string): boolean {
        const today = new Date().toDateString();
        return this.completions.some(c =>
            c.goalId === goalId &&
            new Date(c.completedAt).toDateString() === today
        );
    }

    getCompletionsForGoal(goalId: string, days: number = 30): GoalCompletion[] {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);

        return this.completions
            .filter(c => c.goalId === goalId && new Date(c.completedAt) >= cutoff)
            .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
    }

    getTodaysCompletions(): GoalCompletion[] {
        const today = new Date().toDateString();
        return this.completions.filter(c =>
            new Date(c.completedAt).toDateString() === today
        );
    }

    // ==================== STREAK MANAGEMENT ====================

    private updateStreak(goalId: string): void {
        const today = new Date().toDateString();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toDateString();

        let streak = this.streaks.get(goalId);
        if (!streak) {
            streak = {
                goalId,
                currentStreak: 0,
                longestStreak: 0,
                lastCompletedDate: null
            };
        }

        if (streak.lastCompletedDate === today) {
            // Already completed today
            return;
        }

        if (streak.lastCompletedDate === yesterdayStr) {
            // Continuing streak
            streak.currentStreak += 1;
        } else {
            // Starting new streak
            streak.currentStreak = 1;
        }

        streak.lastCompletedDate = today;
        streak.longestStreak = Math.max(streak.longestStreak, streak.currentStreak);

        this.streaks.set(goalId, streak);
    }

    private calculateAllStreaks(): void {
        this.goals.forEach(goal => {
            const completions = this.getCompletionsForGoal(goal.id, 365);
            if (completions.length === 0) {
                this.streaks.set(goal.id, {
                    goalId: goal.id,
                    currentStreak: 0,
                    longestStreak: 0,
                    lastCompletedDate: null
                });
                return;
            }

            // Calculate current streak
            let currentStreak = 0;
            let longestStreak = 0;
            let tempStreak = 0;
            let lastDate: Date | null = null;

            // Sort completions by date (newest first)
            const sortedDates = [...new Set(
                completions.map(c => new Date(c.completedAt).toDateString())
            )].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

            const today = new Date().toDateString();
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);

            // Check if streak is current
            if (sortedDates[0] === today || sortedDates[0] === yesterday.toDateString()) {
                for (const dateStr of sortedDates) {
                    const date = new Date(dateStr);
                    if (lastDate === null) {
                        tempStreak = 1;
                    } else {
                        const diff = (lastDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
                        if (diff === 1) {
                            tempStreak++;
                        } else {
                            break;
                        }
                    }
                    lastDate = date;
                }
                currentStreak = tempStreak;
            }

            // Calculate longest streak
            tempStreak = 0;
            lastDate = null;
            for (const dateStr of sortedDates) {
                const date = new Date(dateStr);
                if (lastDate === null) {
                    tempStreak = 1;
                } else {
                    const diff = (lastDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
                    if (diff === 1) {
                        tempStreak++;
                    } else {
                        longestStreak = Math.max(longestStreak, tempStreak);
                        tempStreak = 1;
                    }
                }
                lastDate = date;
            }
            longestStreak = Math.max(longestStreak, tempStreak);

            this.streaks.set(goal.id, {
                goalId: goal.id,
                currentStreak,
                longestStreak,
                lastCompletedDate: sortedDates[0] || null
            });
        });
    }

    getStreak(goalId: string): GoalStreak | undefined {
        return this.streaks.get(goalId);
    }

    // ==================== MESSAGING SYSTEM ====================

    private addMessage(params: Omit<AssistantMessage, 'id' | 'timestamp' | 'read'>): void {
        const message: AssistantMessage = {
            ...params,
            id: `msg_${Date.now()}`,
            timestamp: new Date().toISOString(),
            read: false
        };
        this.messages.unshift(message);

        // Keep only last 50 messages
        if (this.messages.length > 50) {
            this.messages = this.messages.slice(0, 50);
        }

        this.saveData();
        this.notify();
    }

    private getRandomTemplate(templates: string[]): string {
        return templates[Math.floor(Math.random() * templates.length)];
    }

    private formatMessage(template: string, goal: PersonalGoal, streak?: number): string {
        return template
            .replace(/{goal}/g, goal.title)
            .replace(/{streak}/g, String(streak || 0));
    }

    sendReminder(goal: PersonalGoal): void {
        const hour = new Date().getHours();
        let templates: string[];

        if (goal.isReflective) {
            templates = REFLECTIVE_GOAL_TEMPLATES;
        } else if (hour < 12) {
            templates = REMINDER_TEMPLATES.morning;
        } else if (hour < 17) {
            templates = REMINDER_TEMPLATES.afternoon;
        } else {
            templates = REMINDER_TEMPLATES.evening;
        }

        const message = this.formatMessage(this.getRandomTemplate(templates), goal);

        this.addMessage({
            type: 'reminder',
            message,
            goalId: goal.id
        });

        this.triggerNotification(goal.title, message);
    }

    // Sends a scheduled-time specific reminder
    sendScheduledReminder(goal: PersonalGoal): void {
        const template = this.getRandomTemplate(SCHEDULED_REMINDER_TEMPLATES);
        const message = template
            .replace(/{goal}/g, goal.title)
            .replace(/{time}/g, goal.scheduledTime || '');

        this.addMessage({
            type: 'reminder',
            message,
            goalId: goal.id
        });

        this.triggerNotification(goal.title, message);
    }

    private sendAcknowledgment(goal: PersonalGoal): void {
        const message = this.formatMessage(
            this.getRandomTemplate(ACKNOWLEDGMENT_TEMPLATES),
            goal
        );

        this.addMessage({
            type: 'acknowledgment',
            message,
            goalId: goal.id
        });

        this.triggerNotification('Done ✓', message);
    }

    private sendStreakCelebration(goal: PersonalGoal, streak: number): void {
        let templates: string[];
        if (streak >= 14) {
            templates = STREAK_TEMPLATES.large;
        } else if (streak >= 7) {
            templates = STREAK_TEMPLATES.medium;
        } else {
            templates = STREAK_TEMPLATES.small;
        }

        const message = this.formatMessage(this.getRandomTemplate(templates), goal, streak);

        this.addMessage({
            type: 'streak-celebration',
            message,
            goalId: goal.id
        });

        this.triggerNotification('Streak', message);
    }

    sendEndOfDayNudge(): void {
        const incompleteGoals = this.getActiveGoals().filter(goal => {
            if (!this.shouldGoalBeCompletedToday(goal)) return false;
            return !this.isGoalCompletedToday(goal.id);
        });

        if (incompleteGoals.length === 0) {
            // All goals complete - brief acknowledgment
            const message = this.getRandomTemplate(END_OF_DAY_TEMPLATES.allComplete);
            this.addMessage({
                type: 'acknowledgment',
                message
            });
            this.triggerNotification('Goals Complete', message);
            return;
        }

        // Some goals incomplete - normalize and encourage tomorrow
        if (incompleteGoals.length === 1) {
            const goal = incompleteGoals[0];
            const message = this.formatMessage(
                this.getRandomTemplate(INCOMPLETE_GOAL_TEMPLATES),
                goal
            );
            this.addMessage({
                type: 'gentle-nudge',
                message,
                goalId: goal.id
            });
            this.triggerNotification(goal.title, message);
        } else {
            // Multiple incomplete goals
            const goalNames = incompleteGoals.slice(0, 3).map(g => g.title).join(' and ');
            const template = this.getRandomTemplate(MULTIPLE_GOALS_TEMPLATES);
            const message = template.replace(/{goals}/g, goalNames);

            this.addMessage({
                type: 'gentle-nudge',
                message
            });
            this.triggerNotification('Check-in', message);
        }
    }

    sendEncouragement(): void {
        const message = this.getRandomTemplate(ENCOURAGEMENT_TEMPLATES);
        this.addMessage({
            type: 'encouragement',
            message
        });
    }

    getMessages(limit: number = 20): AssistantMessage[] {
        return this.messages.slice(0, limit);
    }

    getUnreadMessages(): AssistantMessage[] {
        return this.messages.filter(m => !m.read);
    }

    markMessageAsRead(id: string): void {
        const message = this.messages.find(m => m.id === id);
        if (message) {
            message.read = true;
            this.saveData();
            this.notify();
        }
    }

    markAllMessagesAsRead(): void {
        this.messages.forEach(m => m.read = true);
        this.saveData();
        this.notify();
    }

    // Test method to generate dummy messages for testing
    generateTestMessages(): void {
        const testMessages: Omit<AssistantMessage, 'id' | 'timestamp' | 'read'>[] = [
            {
                type: 'reminder',
                message: "Hey — Morning meditation is on your plan today."
            },
            {
                type: 'acknowledgment',
                message: "Morning meditation done today 💪 Nice work."
            },
            {
                type: 'streak-celebration',
                message: "5 days of Morning meditation. Momentum building."
            },
            {
                type: 'gentle-nudge',
                message: "Looks like today filled up — totally okay. Tomorrow's a clean slate."
            },
            {
                type: 'encouragement',
                message: "Just checking in 🙂"
            },
            {
                type: 'reminder',
                message: "⏰ It's 3:00 PM — this was your planned Exercise time."
            },
            {
                type: 'acknowledgment',
                message: "Done with Drink water. Nice."
            },
            {
                type: 'streak-celebration',
                message: "14 days of Journaling. This is you now."
            }
        ];

        testMessages.forEach((msg, index) => {
            setTimeout(() => {
                this.addMessage(msg);
            }, index * 100);
        });
    }

    // ==================== SCHEDULING & MONITORING ====================

    private shouldGoalBeCompletedToday(goal: PersonalGoal): boolean {
        if (!goal.isActive) return false;

        const today = new Date().getDay(); // 0-6

        switch (goal.frequency) {
            case 'daily':
                return true;
            case 'weekly':
                // Default to Monday (1) for weekly goals
                return today === 1;
            case 'custom':
                return goal.customDays?.includes(today) || false;
            default:
                return false;
        }
    }

    private startMonitoring(): void {
        // Check every minute for scheduled reminders
        this.checkInterval = setInterval(() => {
            this.checkReminders();
        }, 60000);

        // Initial check
        this.checkReminders();

        // Schedule end-of-day check at 9 PM
        this.scheduleEndOfDayCheck();
    }

    private checkReminders(): void {
        const now = new Date();
        const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

        this.getActiveGoals().forEach(goal => {
            if (!goal.reminderEnabled || !goal.scheduledTime) return;
            if (!this.shouldGoalBeCompletedToday(goal)) return;
            if (this.isGoalCompletedToday(goal.id)) return;

            // Calculate reminder time (before scheduled)
            const [schedH, schedM] = goal.scheduledTime.split(':').map(Number);
            const reminderMinutes = (schedH * 60 + schedM) - goal.reminderMinutesBefore;
            const reminderTime = `${Math.floor(reminderMinutes / 60).toString().padStart(2, '0')}:${(reminderMinutes % 60).toString().padStart(2, '0')}`;

            // Send advance reminder (general time-of-day message)
            if (currentTime === reminderTime) {
                this.sendReminder(goal);
            }

            // At exact scheduled time, use time-specific message
            if (currentTime === goal.scheduledTime) {
                this.sendScheduledReminder(goal);
            }
        });
    }

    private scheduleEndOfDayCheck(): void {
        const now = new Date();
        const endOfDay = new Date();
        endOfDay.setHours(21, 0, 0, 0); // 9 PM

        if (now > endOfDay) {
            // Already past 9 PM, schedule for tomorrow
            endOfDay.setDate(endOfDay.getDate() + 1);
        }

        const msUntilEndOfDay = endOfDay.getTime() - now.getTime();

        setTimeout(() => {
            this.sendEndOfDayNudge();
            // Reschedule for next day
            this.scheduleEndOfDayCheck();
        }, msUntilEndOfDay);
    }

    private triggerNotification(title: string, body: string): void {
        if (!("Notification" in window)) return;

        if (Notification.permission === "granted") {
            new Notification(title, { body, icon: '/icon-192x192.png' });
        } else if (Notification.permission !== "denied") {
            Notification.requestPermission().then(permission => {
                if (permission === "granted") {
                    new Notification(title, { body, icon: '/icon-192x192.png' });
                }
            });
        }
    }

    stopMonitoring(): void {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }
    }

    // ==================== STATISTICS ====================

    getCompletionRate(goalId: string, days: number = 7): number {
        const goal = this.getGoalById(goalId);
        if (!goal) return 0;

        let expectedDays = 0;
        let completedDays = 0;

        for (let i = 0; i < days; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dayOfWeek = date.getDay();

            const shouldComplete =
                goal.frequency === 'daily' ||
                (goal.frequency === 'weekly' && dayOfWeek === 1) ||
                (goal.frequency === 'custom' && goal.customDays?.includes(dayOfWeek));

            if (shouldComplete) {
                expectedDays++;
                const dateStr = date.toDateString();
                const completed = this.completions.some(c =>
                    c.goalId === goalId && new Date(c.completedAt).toDateString() === dateStr
                );
                if (completed) completedDays++;
            }
        }

        return expectedDays > 0 ? Math.round((completedDays / expectedDays) * 100) : 0;
    }

    getOverallStats(): {
        totalGoals: number;
        activeGoals: number;
        completedToday: number;
        pendingToday: number;
        averageCompletionRate: number;
    } {
        const activeGoals = this.getActiveGoals();
        const todaysCompletions = this.getTodaysCompletions();

        const pendingToday = activeGoals.filter(goal => {
            if (!this.shouldGoalBeCompletedToday(goal)) return false;
            return !this.isGoalCompletedToday(goal.id);
        }).length;

        const completionRates = activeGoals.map(g => this.getCompletionRate(g.id, 7));
        const averageCompletionRate = completionRates.length > 0
            ? Math.round(completionRates.reduce((a, b) => a + b, 0) / completionRates.length)
            : 0;

        return {
            totalGoals: this.goals.length,
            activeGoals: activeGoals.length,
            completedToday: todaysCompletions.length,
            pendingToday,
            averageCompletionRate
        };
    }
}

// Singleton instance
export const goalAssistantService = new GoalAssistantService();
export default goalAssistantService;
