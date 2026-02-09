import { auth, db } from '../utils/firebaseConfig';
import {
    signOut,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup,
    type User,
} from "firebase/auth";
import {
    doc,
    setDoc,
    getDoc,
    updateDoc,
    collection,
    getDocs,
    query,
    orderBy,
    serverTimestamp,
    Timestamp
} from "firebase/firestore";
import type { UserProfile, UserRole, UserListItem } from '../types/auth';

// Collection name for users
const USERS_COLLECTION = 'users';

export const authService = {
    /**
     * Create or update user profile in Firestore
     */
    async createUserProfile(user: User, role: UserRole = 'user'): Promise<UserProfile> {
        const userRef = doc(db, USERS_COLLECTION, user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            // Update last login time for existing user
            await updateDoc(userRef, {
                lastLoginAt: serverTimestamp(),
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
                phoneNumber: user.phoneNumber
            });
            const updatedSnap = await getDoc(userRef);
            const data = updatedSnap.data()!;
            return {
                uid: user.uid,
                email: data.email,
                displayName: data.displayName,
                photoURL: data.photoURL,
                phoneNumber: data.phoneNumber,
                role: data.role,
                createdAt: data.createdAt?.toDate() || new Date(),
                lastLoginAt: new Date(),
                isActive: data.isActive ?? true
            };
        } else {
            // Create new user profile
            const newProfile: Omit<UserProfile, 'createdAt' | 'lastLoginAt'> & { createdAt: unknown; lastLoginAt: unknown } = {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
                phoneNumber: user.phoneNumber,
                role: role, // Default role is 'user'
                createdAt: serverTimestamp(),
                lastLoginAt: serverTimestamp(),
                isActive: true
            };
            await setDoc(userRef, newProfile);
            return {
                ...newProfile,
                createdAt: new Date(),
                lastLoginAt: new Date()
            };
        }
    },

    /**
     * Get user profile from Firestore
     */
    async getUserProfile(uid: string): Promise<UserProfile | null> {
        try {
            const userRef = doc(db, USERS_COLLECTION, uid);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
                const data = userSnap.data();
                return {
                    uid: data.uid,
                    email: data.email,
                    displayName: data.displayName,
                    photoURL: data.photoURL,
                    phoneNumber: data.phoneNumber,
                    role: data.role || 'user',
                    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt),
                    lastLoginAt: data.lastLoginAt instanceof Timestamp ? data.lastLoginAt.toDate() : new Date(data.lastLoginAt),
                    isActive: data.isActive ?? true
                };
            }
            return null;
        } catch (error: unknown) {
            console.error('Error getting user profile:', error);
            return null;
        }
    },

    /**
     * Sign out the current user
     */
    async authSignOut() {
        try {
            await signOut(auth);
            return { error: null };
        } catch (error: unknown) {
            return { error };
        }
    },

    /**
     * Get the current authenticated user
     */
    getCurrentUser(): User | null {
        return auth.currentUser;
    },

    /**
     * Sign in with Google OAuth
     */
    async signInWithGoogle() {
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const profile = await this.createUserProfile(result.user);
            return { user: result.user, profile, error: null };
        } catch (error: unknown) {
            return { user: null, profile: null, error };
        }
    },

    /**
     * Subscribe to auth state changes
     */
    onAuthStateChange(callback: (user: User | null) => void) {
        return onAuthStateChanged(auth, (user) => {
            callback(user);
        });
    },

    /**
     * Get all users (Admin only)
     */
    async getAllUsers(): Promise<UserListItem[]> {
        try {
            const usersRef = collection(db, USERS_COLLECTION);
            const q = query(usersRef, orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(q);

            const users: UserListItem[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                users.push({
                    uid: data.uid,
                    email: data.email,
                    displayName: data.displayName,
                    role: data.role || 'user',
                    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt),
                    lastLoginAt: data.lastLoginAt instanceof Timestamp ? data.lastLoginAt.toDate() : new Date(data.lastLoginAt),
                    isActive: data.isActive ?? true
                });
            });
            return users;
        } catch (error: unknown) {
            console.error('Error fetching users:', error);
            return [];
        }
    },

    /**
     * Update user role (Admin only)
     */
    async updateUserRole(uid: string, newRole: UserRole): Promise<boolean> {
        try {
            const userRef = doc(db, USERS_COLLECTION, uid);
            await updateDoc(userRef, { role: newRole });
            return true;
        } catch (error: unknown) {
            console.error('Error updating user role:', error);
            return false;
        }
    },

    /**
     * Toggle user active status (Admin only)
     */
    async toggleUserStatus(uid: string, isActive: boolean): Promise<boolean> {
        try {
            const userRef = doc(db, USERS_COLLECTION, uid);
            await updateDoc(userRef, { isActive });
            return true;
        } catch (error: unknown) {
            console.error('Error toggling user status:', error);
            return false;
        }
    }
};
