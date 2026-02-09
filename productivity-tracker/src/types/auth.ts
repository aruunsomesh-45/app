// User role types for role-based access control
export type UserRole = 'user' | 'admin';

// User profile stored in Firestore
export interface UserProfile {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    phoneNumber: string | null;
    role: UserRole;
    createdAt: Date;
    lastLoginAt: Date;
    isActive: boolean;
}

// Auth context state
export interface AuthState {
    user: UserProfile | null;
    loading: boolean;
    isAuthenticated: boolean;
    isAdmin: boolean;
}

// User for admin list view
export interface UserListItem {
    uid: string;
    email: string | null;
    displayName: string | null;
    role: UserRole;
    createdAt: Date;
    lastLoginAt: Date;
    isActive: boolean;
}
