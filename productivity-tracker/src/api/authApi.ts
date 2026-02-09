/**
 * Authentication API Service
 * Bridges Firebase Auth with Supabase database
 */

import { auth } from '../utils/firebaseConfig';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

export interface AuthBridgeResponse {
    success: boolean;
    user?: {
        firebase_uid: string;
        email?: string;
        display_name?: string;
        photo_url?: string;
        profile_id?: string;
    };
    error?: string;
}

export interface UserProfile {
    id: string;
    firebase_uid: string;
    email?: string;
    display_name?: string;
    photo_url?: string;
    provider?: string;
    first_name?: string;
    last_name?: string;
    title?: string;
    bio?: string;
    user_interests?: string[];
    primary_goal?: string;
    onboarding_completed?: boolean;
    preferences?: {
        theme?: string;
        notifications?: boolean;
    };
    created_at?: string;
    last_login_at?: string;
}

/**
 * Get the current Firebase ID token
 */
export async function getFirebaseToken(): Promise<string | null> {
    const currentUser = auth.currentUser;
    if (!currentUser) {
        return null;
    }
    try {
        return await currentUser.getIdToken();
    } catch (error) {
        console.error('Error getting Firebase token:', error);
        return null;
    }
}

/**
 * Authenticate with the Supabase Edge Function using Firebase token
 * This syncs the Firebase user to Supabase and returns profile info
 */
export async function authenticateWithSupabase(): Promise<AuthBridgeResponse> {
    const token = await getFirebaseToken();

    if (!token) {
        return { success: false, error: 'No Firebase token available' };
    }

    try {
        const response = await fetch(`${SUPABASE_URL}/functions/v1/firebase-auth-bridge`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            return { success: false, error: errorData.error || 'Authentication failed' };
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error authenticating with Supabase:', error);
        return { success: false, error: 'Network error during authentication' };
    }
}

/**
 * Create headers with Firebase auth token for API requests
 */
export async function getAuthHeaders(): Promise<HeadersInit | null> {
    const token = await getFirebaseToken();

    if (!token) {
        return null;
    }

    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
    };
}

/**
 * Get current Firebase UID (for direct use without API call)
 */
export function getCurrentFirebaseUid(): string | null {
    return auth.currentUser?.uid || null;
}
