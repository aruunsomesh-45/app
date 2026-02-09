import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { auth } from '../utils/firebaseConfig';
import {
    signOut,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup,
    getAdditionalUserInfo,
    type User
} from 'firebase/auth';
import type { UserProfile, AuthState } from '../types/auth';
import { authenticateWithSupabase } from '../api/authApi';
import { lifeTrackerStore } from '../utils/lifeTrackerStore';
import { authService } from '../services/authService';

interface AuthContextType extends AuthState {
    logout: () => Promise<void>;
    loginWithGoogle: () => Promise<{ success: boolean; isNewUser?: boolean; error?: string }>;
    loginWithDemo: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
    refreshUser: () => void;
    supabaseSynced: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

// Sync Firebase user to Supabase via Edge Function
const syncToSupabase = async (): Promise<boolean> => {
    try {
        const result = await authenticateWithSupabase();
        if (result.success) {
            console.log('✅ User synced to Supabase:', result.user?.firebase_uid);
            return true;
        } else {
            console.error('❌ Failed to sync to Supabase:', result.error);
            return false;
        }
    } catch (error) {
        console.error('❌ Error syncing to Supabase:', error);
        return false;
    }
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [supabaseSynced, setSupabaseSynced] = useState(false);

    useEffect(() => {
        // Subscribe to auth state changes
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
            if (firebaseUser) {
                // Fetch or create profile from Firestore
                const profile = await authService.createUserProfile(firebaseUser);
                setUser(profile);

                // Set Firebase UID on the store for cloud sync
                await lifeTrackerStore.setFirebaseUid(firebaseUser.uid);

                // Sync to Supabase in background (don't block UI)
                syncToSupabase().then(synced => {
                    setSupabaseSynced(synced);
                });
            } else {
                setUser(null);
                setSupabaseSynced(false);
                // Clear Firebase UID from store
                await lifeTrackerStore.setFirebaseUid(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const logout = async () => {
        try {
            await signOut(auth);
            setUser(null);
            setSupabaseSynced(false);
            // Clear Firebase UID from store on logout
            await lifeTrackerStore.setFirebaseUid(null);
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const loginWithGoogle = async () => {
        try {
            const provider = new GoogleAuthProvider();
            provider.setCustomParameters({
                prompt: 'select_account'
            });

            const result = await signInWithPopup(auth, provider);
            const additionalInfo = getAdditionalUserInfo(result);
            const isNewUser = additionalInfo?.isNewUser;

            if (result.user) {
                // Profile is already handled by onAuthStateChanged, 
                // but we can ensure it's set here too for immediate feedback
                const profile = await authService.createUserProfile(result.user);
                setUser(profile);

                // Sync to Supabase after login
                const synced = await syncToSupabase();
                setSupabaseSynced(synced);

                return { success: true, isNewUser };
            }

            return { success: false, error: 'No user returned from Google sign-in' };
        } catch (error: unknown) {
            console.error('Google sign-in error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Google sign-in failed';
            return { success: false, error: errorMessage };
        }
    };

    const loginWithDemo = async (username: string, password: string) => {
        if (username === 'ARUN' && password === '123') {
            const demoProfile: UserProfile = {
                uid: 'demo-user-id',
                email: 'demo@example.com',
                displayName: 'ARUN (Demo)',
                photoURL: null,
                phoneNumber: null,
                role: 'admin',
                isActive: true,
                createdAt: new Date(),
                lastLoginAt: new Date(),
            };
            setUser(demoProfile);
            await lifeTrackerStore.setFirebaseUid(demoProfile.uid);
            setSupabaseSynced(false); // No supabase sync for demo
            return { success: true };
        }
        return { success: false, error: 'Invalid credentials' };
    };

    const refreshUser = async () => {
        const currentUser = auth.currentUser;
        if (currentUser) {
            const profile = await authService.getUserProfile(currentUser.uid);
            if (profile) {
                setUser(profile);
            }
        }
    };

    const value: AuthContextType = {
        user,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        logout,
        loginWithGoogle,
        loginWithDemo,
        refreshUser,
        supabaseSynced
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
