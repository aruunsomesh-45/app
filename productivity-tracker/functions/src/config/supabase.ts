/**
 * Supabase Client Configuration for Cloud Functions
 * 
 * This module initializes the Supabase client for server-side operations.
 * Uses service role key for full database access.
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { defineSecret } from "firebase-functions/params";

// Define secrets (set via Firebase CLI: firebase functions:secrets:set)
export const SUPABASE_URL = defineSecret("SUPABASE_URL");
export const SUPABASE_SERVICE_KEY = defineSecret("SUPABASE_SERVICE_KEY");

let supabaseClient: SupabaseClient | null = null;

/**
 * Get Supabase client instance
 * Uses singleton pattern to reuse connections
 */
export function getSupabaseClient(): SupabaseClient {
    if (!supabaseClient) {
        const url = SUPABASE_URL.value();
        const key = SUPABASE_SERVICE_KEY.value();

        if (!url || !key) {
            throw new Error("Supabase credentials not configured");
        }

        supabaseClient = createClient(url, key, {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        });
    }
    return supabaseClient;
}

/**
 * Database table types for type safety
 */
export interface UserStats {
    id?: string;
    firebase_uid: string;
    date: string;
    focus_score: number;
    sleep_hours: number;
    steps: number;
    workouts_completed: number;
    pages_read: number;
    meditation_minutes: number;
    goals_completed: number;
    goals_total: number;
    streak_days: number;
    created_at?: string;
    updated_at?: string;
}

export interface WeeklyStats {
    id?: string;
    firebase_uid: string;
    week_start: string;
    week_end: string;
    avg_focus_score: number;
    total_sleep_hours: number;
    total_steps: number;
    total_workouts: number;
    total_pages_read: number;
    total_meditation_minutes: number;
    goal_completion_rate: number;
    best_day: string;
    worst_day: string;
    created_at?: string;
}

export interface MonthlyStats {
    id?: string;
    firebase_uid: string;
    month: string; // YYYY-MM format
    avg_focus_score: number;
    total_workouts: number;
    total_pages_read: number;
    total_meditation_minutes: number;
    goal_completion_rate: number;
    longest_streak: number;
    created_at?: string;
}

export interface AIInsight {
    id?: string;
    firebase_uid: string;
    type: "daily_summary" | "weekly_review" | "goal_suggestion";
    content: string;
    metadata?: Record<string, unknown>;
    created_at?: string;
    expires_at?: string;
}
