/**
 * Supabase API Service
 * Handles all data operations with Supabase database
 * All requests are authenticated using Firebase tokens
 */

import { supabase } from '../lib/supabase';
import { getCurrentFirebaseUid } from './authApi';

// ============================================
// Types
// ============================================

export interface MeditationSession {
    id?: string;
    date: string;
    duration: number;
    type: string;
    mood_before?: number;
    mood_after?: number;
    notes?: string;
    firebase_uid?: string;
    created_at?: string;
}

export interface Book {
    id?: string;
    title: string;
    author: string;
    isbn?: string;
    current_page?: number;
    total_pages?: number;
    status: 'to-read' | 'reading' | 'completed';
    cover_url?: string;
    notes?: string;
    rating?: number;
    firebase_uid?: string;
    created_at?: string;
    completed_at?: string;
}

export interface ReadingSession {
    id?: string;
    book_id: string;
    start_page: number;
    end_page: number;
    duration_minutes: number;
    date: string;
    notes?: string;
    firebase_uid?: string;
    created_at?: string;
}

export interface DailyTask {
    id?: string;
    title: string;
    description?: string;
    date: string;
    completed: boolean;
    priority?: 'low' | 'medium' | 'high';
    category?: string;
    due_time?: string;
    firebase_uid?: string;
    created_at?: string;
    completed_at?: string;
}

export interface LifeNote {
    id?: string;
    title: string;
    content: string;
    category?: string;
    tags?: string[];
    is_pinned?: boolean;
    firebase_uid?: string;
    created_at?: string;
    updated_at?: string;
}

export interface SectionLog {
    id?: string;
    section_name: string;
    action: string;
    duration_seconds?: number;
    metadata?: Record<string, unknown>;
    firebase_uid?: string;
    created_at?: string;
}

export interface FinancialLearningProgress {
    id?: string;
    current_track?: string;
    unlocked_modules?: string[];
    completed_lessons?: string[];
    quiz_scores?: Record<string, number>;
    total_xp?: number;
    streak?: number;
    last_active_date?: string;
    firebase_uid?: string;
    created_at?: string;
    updated_at?: string;
}

export interface UserProfileData {
    id?: string;
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
    updated_at?: string;
}

// ============================================
// Generic API Response Type
// ============================================

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}

// ============================================
// Helper: Get current user's Firebase UID
// ============================================

function requireAuth(): string {
    const uid = getCurrentFirebaseUid();
    if (!uid) {
        throw new Error('User not authenticated');
    }
    return uid;
}

// ============================================
// User Profile API
// ============================================

export async function getUserProfile(): Promise<ApiResponse<UserProfileData>> {
    try {
        const firebase_uid = requireAuth();

        const { data, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('firebase_uid', firebase_uid)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                // No profile found
                return { success: true, data: undefined };
            }
            throw error;
        }

        return { success: true, data };
    } catch (error) {
        console.error('Error fetching user profile:', error);
        return { success: false, error: String(error) };
    }
}

export async function updateUserProfile(updates: Partial<UserProfileData>): Promise<ApiResponse<UserProfileData>> {
    try {
        const firebase_uid = requireAuth();

        const { data, error } = await supabase
            .from('user_profiles')
            .update({
                ...updates,
                updated_at: new Date().toISOString(),
            })
            .eq('firebase_uid', firebase_uid)
            .select()
            .single();

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('Error updating user profile:', error);
        return { success: false, error: String(error) };
    }
}

export async function completeOnboarding(
    userInterests: string[],
    primaryGoal: string
): Promise<ApiResponse<UserProfileData>> {
    try {
        const firebase_uid = requireAuth();

        const { data, error } = await supabase
            .from('user_profiles')
            .update({
                user_interests: userInterests,
                primary_goal: primaryGoal,
                onboarding_completed: true,
                updated_at: new Date().toISOString(),
            })
            .eq('firebase_uid', firebase_uid)
            .select()
            .single();

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('Error completing onboarding:', error);
        return { success: false, error: String(error) };
    }
}

// ============================================
// Meditation Sessions API
// ============================================

export async function getMeditationSessions(): Promise<ApiResponse<MeditationSession[]>> {
    try {
        const firebase_uid = requireAuth();

        const { data, error } = await supabase
            .from('meditation_sessions')
            .select('*')
            .eq('firebase_uid', firebase_uid)
            .order('date', { ascending: false });

        if (error) throw error;
        return { success: true, data: data || [] };
    } catch (error) {
        console.error('Error fetching meditation sessions:', error);
        return { success: false, error: String(error) };
    }
}

export async function createMeditationSession(session: Omit<MeditationSession, 'id' | 'firebase_uid' | 'created_at'>): Promise<ApiResponse<MeditationSession>> {
    try {
        const firebase_uid = requireAuth();

        const { data, error } = await supabase
            .from('meditation_sessions')
            .insert({
                ...session,
                firebase_uid,
            })
            .select()
            .single();

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('Error creating meditation session:', error);
        return { success: false, error: String(error) };
    }
}

export async function deleteMeditationSession(id: string): Promise<ApiResponse<void>> {
    try {
        const firebase_uid = requireAuth();

        const { error } = await supabase
            .from('meditation_sessions')
            .delete()
            .eq('id', id)
            .eq('firebase_uid', firebase_uid);

        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error('Error deleting meditation session:', error);
        return { success: false, error: String(error) };
    }
}

// ============================================
// Books API
// ============================================

export async function getBooks(): Promise<ApiResponse<Book[]>> {
    try {
        const firebase_uid = requireAuth();

        const { data, error } = await supabase
            .from('books')
            .select('*')
            .eq('firebase_uid', firebase_uid)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return { success: true, data: data || [] };
    } catch (error) {
        console.error('Error fetching books:', error);
        return { success: false, error: String(error) };
    }
}

export async function createBook(book: Omit<Book, 'id' | 'firebase_uid' | 'created_at'>): Promise<ApiResponse<Book>> {
    try {
        const firebase_uid = requireAuth();

        const { data, error } = await supabase
            .from('books')
            .insert({
                ...book,
                firebase_uid,
            })
            .select()
            .single();

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('Error creating book:', error);
        return { success: false, error: String(error) };
    }
}

export async function updateBook(id: string, updates: Partial<Book>): Promise<ApiResponse<Book>> {
    try {
        const firebase_uid = requireAuth();

        const { data, error } = await supabase
            .from('books')
            .update(updates)
            .eq('id', id)
            .eq('firebase_uid', firebase_uid)
            .select()
            .single();

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('Error updating book:', error);
        return { success: false, error: String(error) };
    }
}

export async function deleteBook(id: string): Promise<ApiResponse<void>> {
    try {
        const firebase_uid = requireAuth();

        const { error } = await supabase
            .from('books')
            .delete()
            .eq('id', id)
            .eq('firebase_uid', firebase_uid);

        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error('Error deleting book:', error);
        return { success: false, error: String(error) };
    }
}

// ============================================
// Reading Sessions API
// ============================================

export async function getReadingSessions(bookId?: string): Promise<ApiResponse<ReadingSession[]>> {
    try {
        const firebase_uid = requireAuth();

        let query = supabase
            .from('reading_sessions')
            .select('*')
            .eq('firebase_uid', firebase_uid);

        if (bookId) {
            query = query.eq('book_id', bookId);
        }

        const { data, error } = await query.order('date', { ascending: false });

        if (error) throw error;
        return { success: true, data: data || [] };
    } catch (error) {
        console.error('Error fetching reading sessions:', error);
        return { success: false, error: String(error) };
    }
}

export async function createReadingSession(session: Omit<ReadingSession, 'id' | 'firebase_uid' | 'created_at'>): Promise<ApiResponse<ReadingSession>> {
    try {
        const firebase_uid = requireAuth();

        const { data, error } = await supabase
            .from('reading_sessions')
            .insert({
                ...session,
                firebase_uid,
            })
            .select()
            .single();

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('Error creating reading session:', error);
        return { success: false, error: String(error) };
    }
}

// ============================================
// Daily Tasks API
// ============================================

export async function getDailyTasks(date?: string): Promise<ApiResponse<DailyTask[]>> {
    try {
        const firebase_uid = requireAuth();

        let query = supabase
            .from('daily_tasks')
            .select('*')
            .eq('firebase_uid', firebase_uid);

        if (date) {
            query = query.eq('date', date);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;
        return { success: true, data: data || [] };
    } catch (error) {
        console.error('Error fetching daily tasks:', error);
        return { success: false, error: String(error) };
    }
}

export async function createDailyTask(task: Omit<DailyTask, 'id' | 'firebase_uid' | 'created_at'>): Promise<ApiResponse<DailyTask>> {
    try {
        const firebase_uid = requireAuth();

        const { data, error } = await supabase
            .from('daily_tasks')
            .insert({
                ...task,
                firebase_uid,
            })
            .select()
            .single();

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('Error creating daily task:', error);
        return { success: false, error: String(error) };
    }
}

export async function updateDailyTask(id: string, updates: Partial<DailyTask>): Promise<ApiResponse<DailyTask>> {
    try {
        const firebase_uid = requireAuth();

        const { data, error } = await supabase
            .from('daily_tasks')
            .update(updates)
            .eq('id', id)
            .eq('firebase_uid', firebase_uid)
            .select()
            .single();

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('Error updating daily task:', error);
        return { success: false, error: String(error) };
    }
}

export async function deleteDailyTask(id: string): Promise<ApiResponse<void>> {
    try {
        const firebase_uid = requireAuth();

        const { error } = await supabase
            .from('daily_tasks')
            .delete()
            .eq('id', id)
            .eq('firebase_uid', firebase_uid);

        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error('Error deleting daily task:', error);
        return { success: false, error: String(error) };
    }
}

// ============================================
// Life Notes API
// ============================================

export async function getLifeNotes(): Promise<ApiResponse<LifeNote[]>> {
    try {
        const firebase_uid = requireAuth();

        const { data, error } = await supabase
            .from('life_notes')
            .select('*')
            .eq('firebase_uid', firebase_uid)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return { success: true, data: data || [] };
    } catch (error) {
        console.error('Error fetching life notes:', error);
        return { success: false, error: String(error) };
    }
}

export async function createLifeNote(note: Omit<LifeNote, 'id' | 'firebase_uid' | 'created_at'>): Promise<ApiResponse<LifeNote>> {
    try {
        const firebase_uid = requireAuth();

        const { data, error } = await supabase
            .from('life_notes')
            .insert({
                ...note,
                firebase_uid,
            })
            .select()
            .single();

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('Error creating life note:', error);
        return { success: false, error: String(error) };
    }
}

export async function updateLifeNote(id: string, updates: Partial<LifeNote>): Promise<ApiResponse<LifeNote>> {
    try {
        const firebase_uid = requireAuth();

        const { data, error } = await supabase
            .from('life_notes')
            .update({
                ...updates,
                updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .eq('firebase_uid', firebase_uid)
            .select()
            .single();

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('Error updating life note:', error);
        return { success: false, error: String(error) };
    }
}

export async function deleteLifeNote(id: string): Promise<ApiResponse<void>> {
    try {
        const firebase_uid = requireAuth();

        const { error } = await supabase
            .from('life_notes')
            .delete()
            .eq('id', id)
            .eq('firebase_uid', firebase_uid);

        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error('Error deleting life note:', error);
        return { success: false, error: String(error) };
    }
}

// ============================================
// Section Logs API
// ============================================

export async function logSectionActivity(log: Omit<SectionLog, 'id' | 'firebase_uid' | 'created_at'>): Promise<ApiResponse<SectionLog>> {
    try {
        const firebase_uid = requireAuth();

        const { data, error } = await supabase
            .from('section_logs')
            .insert({
                ...log,
                firebase_uid,
            })
            .select()
            .single();

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('Error logging section activity:', error);
        return { success: false, error: String(error) };
    }
}

export async function getSectionLogs(sectionName?: string): Promise<ApiResponse<SectionLog[]>> {
    try {
        const firebase_uid = requireAuth();

        let query = supabase
            .from('section_logs')
            .select('*')
            .eq('firebase_uid', firebase_uid);

        if (sectionName) {
            query = query.eq('section_name', sectionName);
        }

        const { data, error } = await query.order('created_at', { ascending: false }).limit(100);

        if (error) throw error;
        return { success: true, data: data || [] };
    } catch (error) {
        console.error('Error fetching section logs:', error);
        return { success: false, error: String(error) };
    }
}

// ============================================
// Financial Learning Progress API
// ============================================

export async function getFinancialProgress(): Promise<ApiResponse<FinancialLearningProgress>> {
    try {
        const firebase_uid = requireAuth();

        const { data, error } = await supabase
            .from('financial_learning_progress')
            .select('*')
            .eq('firebase_uid', firebase_uid)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return { success: true, data: undefined };
            }
            throw error;
        }

        return { success: true, data };
    } catch (error) {
        console.error('Error fetching financial progress:', error);
        return { success: false, error: String(error) };
    }
}

export async function updateFinancialProgress(updates: Partial<FinancialLearningProgress>): Promise<ApiResponse<FinancialLearningProgress>> {
    try {
        const firebase_uid = requireAuth();

        // Upsert to handle both create and update
        const { data, error } = await supabase
            .from('financial_learning_progress')
            .upsert({
                firebase_uid,
                ...updates,
                updated_at: new Date().toISOString(),
            }, {
                onConflict: 'firebase_uid',
            })
            .select()
            .single();

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('Error updating financial progress:', error);
        return { success: false, error: String(error) };
    }
}

// ============================================
// Sync All Data (Batch fetch for initial load)
// ============================================

export interface AllUserData {
    profile?: UserProfileData;
    meditationSessions: MeditationSession[];
    books: Book[];
    readingSessions: ReadingSession[];
    dailyTasks: DailyTask[];
    lifeNotes: LifeNote[];
    financialProgress?: FinancialLearningProgress;
}

export async function fetchAllUserData(): Promise<ApiResponse<AllUserData>> {
    try {
        const firebase_uid = requireAuth();

        // Parallel fetch all data
        const [
            profileResult,
            meditationResult,
            booksResult,
            readingResult,
            tasksResult,
            notesResult,
            financialResult,
        ] = await Promise.all([
            supabase.from('user_profiles').select('*').eq('firebase_uid', firebase_uid).single(),
            supabase.from('meditation_sessions').select('*').eq('firebase_uid', firebase_uid).order('date', { ascending: false }),
            supabase.from('books').select('*').eq('firebase_uid', firebase_uid).order('created_at', { ascending: false }),
            supabase.from('reading_sessions').select('*').eq('firebase_uid', firebase_uid).order('date', { ascending: false }),
            supabase.from('daily_tasks').select('*').eq('firebase_uid', firebase_uid).order('created_at', { ascending: false }),
            supabase.from('life_notes').select('*').eq('firebase_uid', firebase_uid).order('created_at', { ascending: false }),
            supabase.from('financial_learning_progress').select('*').eq('firebase_uid', firebase_uid).single(),
        ]);

        const data: AllUserData = {
            profile: profileResult.error?.code === 'PGRST116' ? undefined : profileResult.data,
            meditationSessions: meditationResult.data || [],
            books: booksResult.data || [],
            readingSessions: readingResult.data || [],
            dailyTasks: tasksResult.data || [],
            lifeNotes: notesResult.data || [],
            financialProgress: financialResult.error?.code === 'PGRST116' ? undefined : financialResult.data,
        };

        return { success: true, data };
    } catch (error) {
        console.error('Error fetching all user data:', error);
        return { success: false, error: String(error) };
    }
}
