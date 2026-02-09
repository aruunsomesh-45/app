import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getMessaging, isSupported as isMessagingSupported } from "firebase/messaging";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";
import { getAnalytics, isSupported as isAnalyticsSupported } from "firebase/analytics";
import { getPerformance } from "firebase/performance";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);

// Core services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);

// Messaging (only in browser environments with support)
export const messaging = typeof window !== 'undefined'
    ? await isMessagingSupported().then(supported => supported ? getMessaging(app) : null).catch(() => null)
    : null;

// Analytics (lazy-loaded, only in browser with support)
export let analytics: ReturnType<typeof getAnalytics> | null = null;
if (typeof window !== 'undefined') {
    isAnalyticsSupported().then(supported => {
        if (supported) {
            analytics = getAnalytics(app);
        }
    }).catch(() => {
        console.warn('Firebase Analytics not supported');
    });
}

// Performance Monitoring (lazy-loaded, only in browser)
export let performance: ReturnType<typeof getPerformance> | null = null;
if (typeof window !== 'undefined') {
    try {
        performance = getPerformance(app);
    } catch {
        console.warn('Firebase Performance Monitoring not supported');
    }
}

// Connect to emulator in development (optional)
if (import.meta.env.DEV && import.meta.env.VITE_USE_EMULATORS === 'true') {
    connectFunctionsEmulator(functions, 'localhost', 5001);
}

// Export the app instance for advanced use cases
export default app;
