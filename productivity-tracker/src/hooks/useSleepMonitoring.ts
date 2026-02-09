/**
 * useSleepMonitoring Hook
 * 
 * React hook for accessing the sleep monitoring service.
 * Provides sleep schedule management and tracking controls.
 */

import { useState, useEffect, useCallback } from 'react';
import sleepMonitoringService from '../services/sleepMonitoringService';
import type {
    SleepMonitoringState,
    SleepSchedule,
    SleepRecord
} from '../services/sleepMonitoringService';

export interface UseSleepMonitoringReturn {
    // Current state
    schedule: SleepSchedule;
    isMonitoring: boolean;
    isSleeping: boolean;
    currentSleepStart: string | null;
    todayRecord: SleepRecord | null;
    history: SleepRecord[];

    // Statistics
    stats: SleepMonitoringState['stats'];

    // Actions
    updateSchedule: (schedule: Partial<SleepSchedule>) => void;
    startSleep: () => void;
    endSleep: () => SleepRecord | null;
    logSleepManually: (sleepTime: string, wakeTime: string) => SleepRecord;

    // Utilities
    getRecommendedBedtimes: (wakeTime: string) => { time: string; cycles: number; hours: number }[];
    formatDuration: (hours: number) => string;
    getQualityColor: (quality: SleepRecord['quality']) => string;
    getQualityLabel: (quality: SleepRecord['quality']) => string;
}

export function useSleepMonitoring(): UseSleepMonitoringReturn {
    const [state, setState] = useState<SleepMonitoringState>(sleepMonitoringService.getState());

    useEffect(() => {
        // Subscribe to state changes
        const unsubscribe = sleepMonitoringService.subscribe(setState);
        return unsubscribe;
    }, []);

    const updateSchedule = useCallback((schedule: Partial<SleepSchedule>) => {
        sleepMonitoringService.updateSchedule(schedule);
    }, []);

    const startSleep = useCallback(() => {
        sleepMonitoringService.startSleepSession();
    }, []);

    const endSleep = useCallback(() => {
        return sleepMonitoringService.endSleepSession();
    }, []);

    const logSleepManually = useCallback((sleepTime: string, wakeTime: string) => {
        return sleepMonitoringService.logSleepManually(sleepTime, wakeTime);
    }, []);

    const getRecommendedBedtimes = useCallback((wakeTime: string) => {
        return sleepMonitoringService.getRecommendedBedtimes(wakeTime);
    }, []);

    const formatDuration = useCallback((hours: number): string => {
        const h = Math.floor(hours);
        const m = Math.round((hours - h) * 60);
        if (m === 0) return `${h}h`;
        return `${h}h ${m}m`;
    }, []);

    const getQualityColor = useCallback((quality: SleepRecord['quality']): string => {
        switch (quality) {
            case 'excellent': return 'text-green-500';
            case 'good': return 'text-blue-500';
            case 'fair': return 'text-yellow-500';
            case 'poor': return 'text-red-500';
            default: return 'text-gray-500';
        }
    }, []);

    const getQualityLabel = useCallback((quality: SleepRecord['quality']): string => {
        switch (quality) {
            case 'excellent': return 'Excellent';
            case 'good': return 'Good';
            case 'fair': return 'Fair';
            case 'poor': return 'Poor';
            default: return 'Unknown';
        }
    }, []);

    return {
        schedule: state.schedule,
        isMonitoring: state.isMonitoring,
        isSleeping: state.isSleeping,
        currentSleepStart: state.currentSleepStart,
        todayRecord: state.todayRecord,
        history: state.history,
        stats: state.stats,
        updateSchedule,
        startSleep,
        endSleep,
        logSleepManually,
        getRecommendedBedtimes,
        formatDuration,
        getQualityColor,
        getQualityLabel
    };
}

export default useSleepMonitoring;
