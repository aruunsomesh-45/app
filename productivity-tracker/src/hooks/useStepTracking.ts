/**
 * useStepTracking Hook
 * 
 * React hook for accessing the automatic step tracking service.
 * Provides real-time step counts and tracking controls.
 */

import { useState, useEffect, useCallback } from 'react';
import stepTrackingService, { type StepTrackingState } from '../services/stepTrackingService';

export interface UseStepTrackingReturn {
    // Current state
    isTracking: boolean;
    isSupported: boolean;
    todaySteps: number;
    todayDistance: number; // in meters
    todayCalories: number;
    history: StepTrackingState['history'];

    // Weekly stats
    weeklyStats: {
        totalSteps: number;
        avgSteps: number;
        totalDistance: number;
        totalCalories: number;
    };

    // Actions
    startTracking: () => Promise<boolean>;
    stopTracking: () => void;
    addStepsManually: (count: number) => void;

    // Utilities
    formatSteps: (steps: number) => string;
    formatDistance: (meters: number) => string;
}

export function useStepTracking(): UseStepTrackingReturn {
    const [state, setState] = useState<StepTrackingState>(stepTrackingService.getState());
    const [isSupported] = useState(stepTrackingService.isSupported());

    useEffect(() => {
        // Subscribe to state changes
        const unsubscribe = stepTrackingService.subscribe(setState);

        // Auto-start tracking if supported (on mobile devices)
        if (isSupported && !state.isTracking) {
            stepTrackingService.startTracking().catch(console.error);
        }

        return unsubscribe;
    }, [isSupported]);

    const startTracking = useCallback(async () => {
        return stepTrackingService.startTracking();
    }, []);

    const stopTracking = useCallback(() => {
        stepTrackingService.stopTracking();
    }, []);

    const addStepsManually = useCallback((count: number) => {
        stepTrackingService.addSteps(count);
    }, []);

    const formatSteps = useCallback((steps: number): string => {
        if (steps >= 10000) {
            return `${(steps / 1000).toFixed(1)}k`;
        } else if (steps >= 1000) {
            return `${(steps / 1000).toFixed(1)}k`;
        }
        return steps.toString();
    }, []);

    const formatDistance = useCallback((meters: number): string => {
        if (meters >= 1000) {
            return `${(meters / 1000).toFixed(2)} km`;
        }
        return `${Math.round(meters)} m`;
    }, []);

    const weeklyStats = stepTrackingService.getWeeklySummary();

    return {
        isTracking: state.isTracking,
        isSupported,
        todaySteps: state.todaySteps,
        todayDistance: state.todayDistance,
        todayCalories: state.todayCalories,
        history: state.history,
        weeklyStats,
        startTracking,
        stopTracking,
        addStepsManually,
        formatSteps,
        formatDistance
    };
}

export default useStepTracking;
