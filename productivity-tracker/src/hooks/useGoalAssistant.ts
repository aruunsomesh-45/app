/**
 * useGoalAssistant Hook
 * 
 * React hook for interacting with the Goal Assistant Service.
 * Provides reactive state and helper functions for goal management.
 */

import { useState, useEffect, useCallback } from 'react';
import goalAssistantService, {
    type PersonalGoal,
    type GoalCompletion,
    type GoalStreak,
    type AssistantMessage,
    type GoalCategory,
    type GoalFrequency
} from '../services/goalAssistantService';

export interface UseGoalAssistantReturn {
    // Goals
    goals: PersonalGoal[];
    activeGoals: PersonalGoal[];
    addGoal: (goal: Omit<PersonalGoal, 'id' | 'createdAt'>) => PersonalGoal;
    updateGoal: (id: string, updates: Partial<PersonalGoal>) => void;
    deleteGoal: (id: string) => void;
    getGoalById: (id: string) => PersonalGoal | undefined;

    // Completions
    completeGoal: (goalId: string, note?: string, mood?: GoalCompletion['mood']) => void;
    isGoalCompletedToday: (goalId: string) => boolean;
    getCompletionsForGoal: (goalId: string, days?: number) => GoalCompletion[];
    todaysCompletions: GoalCompletion[];

    // Streaks
    getStreak: (goalId: string) => GoalStreak | undefined;

    // Messages
    messages: AssistantMessage[];
    unreadMessages: AssistantMessage[];
    markMessageAsRead: (id: string) => void;
    markAllMessagesAsRead: () => void;
    sendEncouragement: () => void;
    generateTestMessages: () => void;

    // Stats
    stats: {
        totalGoals: number;
        activeGoals: number;
        completedToday: number;
        pendingToday: number;
        averageCompletionRate: number;
    };
    getCompletionRate: (goalId: string, days?: number) => number;

    // Helpers
    todaysGoals: PersonalGoal[];
    pendingGoals: PersonalGoal[];
}

export function useGoalAssistant(): UseGoalAssistantReturn {
    const [, forceUpdate] = useState({});

    // Subscribe to service updates
    useEffect(() => {
        const unsubscribe = goalAssistantService.subscribe(() => {
            forceUpdate({});
        });
        return unsubscribe;
    }, []);

    // Goals
    const goals = goalAssistantService.getGoals();
    const activeGoals = goalAssistantService.getActiveGoals();

    const addGoal = useCallback((goal: Omit<PersonalGoal, 'id' | 'createdAt'>) => {
        return goalAssistantService.addGoal(goal);
    }, []);

    const updateGoal = useCallback((id: string, updates: Partial<PersonalGoal>) => {
        goalAssistantService.updateGoal(id, updates);
    }, []);

    const deleteGoal = useCallback((id: string) => {
        goalAssistantService.deleteGoal(id);
    }, []);

    const getGoalById = useCallback((id: string) => {
        return goalAssistantService.getGoalById(id);
    }, []);

    // Completions
    const completeGoal = useCallback((goalId: string, note?: string, mood?: GoalCompletion['mood']) => {
        goalAssistantService.completeGoal(goalId, note, mood);
    }, []);

    const isGoalCompletedToday = useCallback((goalId: string) => {
        return goalAssistantService.isGoalCompletedToday(goalId);
    }, []);

    const getCompletionsForGoal = useCallback((goalId: string, days: number = 30) => {
        return goalAssistantService.getCompletionsForGoal(goalId, days);
    }, []);

    const todaysCompletions = goalAssistantService.getTodaysCompletions();

    // Streaks
    const getStreak = useCallback((goalId: string) => {
        return goalAssistantService.getStreak(goalId);
    }, []);

    // Messages
    const messages = goalAssistantService.getMessages();
    const unreadMessages = goalAssistantService.getUnreadMessages();

    const markMessageAsRead = useCallback((id: string) => {
        goalAssistantService.markMessageAsRead(id);
    }, []);

    const markAllMessagesAsRead = useCallback(() => {
        goalAssistantService.markAllMessagesAsRead();
    }, []);

    const sendEncouragement = useCallback(() => {
        goalAssistantService.sendEncouragement();
    }, []);

    const generateTestMessages = useCallback(() => {
        goalAssistantService.generateTestMessages();
    }, []);

    // Stats
    const stats = goalAssistantService.getOverallStats();

    const getCompletionRate = useCallback((goalId: string, days: number = 7) => {
        return goalAssistantService.getCompletionRate(goalId, days);
    }, []);

    // Computed: Today's goals (should be done today)
    const todaysGoals = activeGoals.filter(goal => {
        const today = new Date().getDay();
        switch (goal.frequency) {
            case 'daily':
                return true;
            case 'weekly':
                return today === 1;
            case 'custom':
                return goal.customDays?.includes(today) || false;
            default:
                return false;
        }
    });

    // Computed: Pending goals (should be done today but not completed)
    const pendingGoals = todaysGoals.filter(goal => !isGoalCompletedToday(goal.id));

    return {
        // Goals
        goals,
        activeGoals,
        addGoal,
        updateGoal,
        deleteGoal,
        getGoalById,

        // Completions
        completeGoal,
        isGoalCompletedToday,
        getCompletionsForGoal,
        todaysCompletions,

        // Streaks
        getStreak,

        // Messages
        messages,
        unreadMessages,
        markMessageAsRead,
        markAllMessagesAsRead,
        sendEncouragement,
        generateTestMessages,

        // Stats
        stats,
        getCompletionRate,

        // Helpers
        todaysGoals,
        pendingGoals
    };
}

// Export types for convenience
export type {
    PersonalGoal,
    GoalCompletion,
    GoalStreak,
    AssistantMessage,
    GoalCategory,
    GoalFrequency
};

export default useGoalAssistant;
