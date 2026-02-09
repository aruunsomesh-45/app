/**
 * useActionNotification - A hook for triggering immediate notifications
 * when a user tries to perform an action but has incomplete prerequisites.
 * 
 * Usage:
 * const { checkAndNotify, notifyIfIncomplete } = useActionNotification();
 * 
 * // In a button click handler:
 * const handleStartWorkout = () => {
 *   if (!userProfile.fitnessGoalSet) {
 *     notifyIfIncomplete('Start Workout', 'Please set your fitness goals first.', '/profile');
 *     return;
 *   }
 *   // Proceed with workout
 * };
 */

import { useCallback } from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import { useLifeTracker } from '../utils/lifeTrackerStore';

interface ActionCheck {
    condition: boolean;
    actionName: string;
    reason: string;
    redirectPath?: string;
}

export const useActionNotification = () => {
    const {
        notifyIncompleteAction,
        notifySuccess,
        notifyError,
        notifyReminder,
        permissionGranted,
        requestPermission
    } = useNotifications();
    const store = useLifeTracker();

    // Ensure permissions are granted
    const ensurePermissions = useCallback(async () => {
        if (!permissionGranted) {
            await requestPermission();
        }
    }, [permissionGranted, requestPermission]);

    // Notify if a condition is not met
    const notifyIfIncomplete = useCallback((
        actionName: string,
        reason: string,
        redirectPath?: string
    ) => {
        console.log(`🔔 Triggering incomplete action notification: ${actionName}`);
        notifyIncompleteAction(actionName, reason, redirectPath);
    }, [notifyIncompleteAction]);

    // Check multiple conditions and notify for the first failing one
    const checkAndNotify = useCallback((checks: ActionCheck[]): boolean => {
        for (const check of checks) {
            if (!check.condition) {
                notifyIncompleteAction(check.actionName, check.reason, check.redirectPath);
                return false; // Return false if any check fails
            }
        }
        return true; // All checks passed
    }, [notifyIncompleteAction]);

    // Common checks
    const checkProfileComplete = useCallback((): boolean => {
        const state = store.getState();
        const profile = state.userProfile;

        if (!profile?.firstName || !profile?.email) {
            notifyIncompleteAction(
                'Complete Profile',
                'Please complete your profile to access this feature.',
                '/profile'
            );
            return false;
        }
        return true;
    }, [store, notifyIncompleteAction]);

    const checkOnboardingComplete = useCallback((): boolean => {
        const state = store.getState();
        const profile = state.userProfile;

        if (!profile?.onboardingCompleted) {
            notifyIncompleteAction(
                'Complete Setup',
                'Please complete the onboarding to access this feature.',
                '/onboarding'
            );
            return false;
        }
        return true;
    }, [store, notifyIncompleteAction]);

    const checkDailyGoalSet = useCallback((): boolean => {
        const state = store.getState();
        const profile = state.userProfile;

        if (!profile?.primaryGoal) {
            notifyIncompleteAction(
                'Set Daily Goal',
                'Please set your primary goal to track progress.',
                '/onboarding'
            );
            return false;
        }
        return true;
    }, [store, notifyIncompleteAction]);

    // Notify action completed successfully
    const notifyActionComplete = useCallback((actionName: string, message?: string) => {
        notifySuccess(
            `${actionName} Complete`,
            message || `You've successfully completed ${actionName.toLowerCase()}.`
        );
    }, [notifySuccess]);

    // Notify action failed
    const notifyActionFailed = useCallback((actionName: string, error?: string) => {
        notifyError(
            `${actionName} Failed`,
            error || `Something went wrong. Please try again.`
        );
    }, [notifyError]);

    // Send a reminder notification
    const sendReminder = useCallback((title: string, message: string) => {
        notifyReminder(title, message);
    }, [notifyReminder]);

    return {
        ensurePermissions,
        notifyIfIncomplete,
        checkAndNotify,
        checkProfileComplete,
        checkOnboardingComplete,
        checkDailyGoalSet,
        notifyActionComplete,
        notifyActionFailed,
        sendReminder,
        permissionGranted
    };
};

export default useActionNotification;
