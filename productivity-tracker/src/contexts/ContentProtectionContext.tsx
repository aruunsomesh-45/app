import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type {
    ContentProtectionSettings,
    ProtectionLevel,
    BlockedAttempt,
    AccountabilityPartner,
} from '../types/contentProtection';
import { notifyAccountabilityPartner, checkUrl, checkKeywords } from '../services/contentFilter';

interface ContentProtectionContextType {
    settings: ContentProtectionSettings;
    updateProtectionLevel: (level: ProtectionLevel, pin?: string) => boolean;
    setPin: (newPin: string, oldPin?: string) => boolean;
    verifyPin: (pin: string) => boolean;
    toggleProtection: (enabled: boolean, pin?: string) => boolean;
    toggleVitalBlocking: (enabled: boolean, pin?: string) => boolean;
    checkUrl: (url: string, customBlockedDomains?: string[]) => { blocked: boolean; reason?: string };
    checkKeywords: (text: string, customKeywords?: string[]) => { blocked: boolean; reason?: string; matchedKeyword?: string };
    addCustomDomain: (domain: string) => void;
    removeCustomDomain: (domain: string) => void;
    addCustomKeyword: (keyword: string) => void;
    removeCustomKeyword: (keyword: string) => void;
    setAccountabilityPartner: (partner: AccountabilityPartner | undefined) => void;
    logBlockedAttempt: (url?: string, keyword?: string, reason?: string) => void;
    clearBlockHistory: () => void;
}

const ContentProtectionContext = createContext<ContentProtectionContextType | undefined>(
    undefined
);

const STORAGE_KEY = 'contentProtectionSettings';

const defaultSettings: ContentProtectionSettings = {
    enabled: false,
    protectionLevel: 'off',
    vitalBlockingEnabled: false,
    pin: undefined,
    customBlockedDomains: [],
    customBlockedKeywords: [],
    accountabilityPartner: undefined,
    blockHistory: [],
    lastModified: new Date(),
};

export function ContentProtectionProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<ContentProtectionSettings>(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                // Convert date strings back to Date objects
                parsed.lastModified = new Date(parsed.lastModified);
                parsed.blockHistory = parsed.blockHistory.map((attempt: any) => ({
                    ...attempt,
                    timestamp: new Date(attempt.timestamp),
                }));
                return parsed;
            } catch {
                return defaultSettings;
            }
        }
        return defaultSettings;
    });

    // Persist to localStorage whenever settings change
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    }, [settings]);

    const verifyPin = (pin: string): boolean => {
        if (!settings.pin) return true; // No PIN set
        return settings.pin === pin;
    };

    const setPin = (newPin: string, oldPin?: string): boolean => {
        // If PIN already exists, verify old PIN
        if (settings.pin && !verifyPin(oldPin || '')) {
            return false;
        }

        setSettings((prev) => ({
            ...prev,
            pin: newPin,
            lastModified: new Date(),
        }));
        return true;
    };

    const updateProtectionLevel = (level: ProtectionLevel, pin?: string): boolean => {
        // Require PIN if protection is being lowered or disabled
        if (settings.pin) {
            const currentLevelIndex = ['off', 'light', 'strong', 'strict'].indexOf(
                settings.protectionLevel
            );
            const newLevelIndex = ['off', 'light', 'strong', 'strict'].indexOf(level);

            if (newLevelIndex < currentLevelIndex) {
                if (!verifyPin(pin || '')) {
                    return false;
                }
            }
        }

        setSettings((prev) => ({
            ...prev,
            protectionLevel: level,
            enabled: level !== 'off',
            lastModified: new Date(),
        }));
        return true;
    };

    const toggleProtection = (enabled: boolean, pin?: string): boolean => {
        // Require PIN if disabling
        if (!enabled && settings.pin && !verifyPin(pin || '')) {
            return false;
        }

        setSettings((prev) => ({
            ...prev,
            enabled,
            protectionLevel: enabled ? prev.protectionLevel || 'light' : 'off',
            lastModified: new Date(),
        }));
        return true;
    };

    const toggleVitalBlocking = (enabled: boolean, pin?: string): boolean => {
        // Require PIN if disabling
        if (!enabled && settings.pin && !verifyPin(pin || '')) {
            return false;
        }

        setSettings((prev) => ({
            ...prev,
            vitalBlockingEnabled: enabled,
            lastModified: new Date(),
        }));
        return true;
    };

    const checkUrlBound = useCallback((url: string, customBlockedDomains?: string[]) => {
        return checkUrl(
            url,
            settings.protectionLevel,
            customBlockedDomains || settings.customBlockedDomains,
            settings.vitalBlockingEnabled
        );
    }, [settings.protectionLevel, settings.customBlockedDomains, settings.vitalBlockingEnabled]);

    const checkKeywordsBound = useCallback((text: string, customKeywords?: string[]) => {
        return checkKeywords(
            text,
            settings.protectionLevel,
            customKeywords || settings.customBlockedKeywords,
            settings.vitalBlockingEnabled
        );
    }, [settings.protectionLevel, settings.customBlockedKeywords, settings.vitalBlockingEnabled]);

    const addCustomDomain = (domain: string) => {
        setSettings((prev) => ({
            ...prev,
            customBlockedDomains: [...prev.customBlockedDomains, domain],
            lastModified: new Date(),
        }));
    };

    const removeCustomDomain = (domain: string) => {
        setSettings((prev) => ({
            ...prev,
            customBlockedDomains: prev.customBlockedDomains.filter((d) => d !== domain),
            lastModified: new Date(),
        }));
    };

    const addCustomKeyword = (keyword: string) => {
        setSettings((prev) => ({
            ...prev,
            customBlockedKeywords: [...prev.customBlockedKeywords, keyword],
            lastModified: new Date(),
        }));
    };

    const removeCustomKeyword = (keyword: string) => {
        setSettings((prev) => ({
            ...prev,
            customBlockedKeywords: prev.customBlockedKeywords.filter((k) => k !== keyword),
            lastModified: new Date(),
        }));
    };

    const setAccountabilityPartner = (partner: AccountabilityPartner | undefined) => {
        setSettings((prev) => ({
            ...prev,
            accountabilityPartner: partner,
            lastModified: new Date(),
        }));
    };

    const logBlockedAttempt = useCallback((url?: string, keyword?: string, reason?: string) => {
        const attempt: BlockedAttempt = {
            id: `${Date.now()}-${Math.random()}`,
            timestamp: new Date(),
            url,
            keyword,
            reason: reason || 'Content blocked by filter',
            protectionLevel: settings.protectionLevel,
        };

        setSettings((prev) => ({
            ...prev,
            blockHistory: [attempt, ...prev.blockHistory].slice(0, 100), // Keep last 100
            lastModified: new Date(),
        }));

        // Notify accountability partner if configured
        if (settings.accountabilityPartner?.notifyOnBlock) {
            notifyAccountabilityPartner(settings.accountabilityPartner.email, url, keyword);
        }
    }, [settings.protectionLevel, settings.accountabilityPartner]);

    const clearBlockHistory = () => {
        setSettings((prev) => ({
            ...prev,
            blockHistory: [],
            lastModified: new Date(),
        }));
    };

    const value: ContentProtectionContextType = {
        settings,
        updateProtectionLevel,
        setPin,
        verifyPin,
        toggleProtection,
        toggleVitalBlocking,
        checkUrl: checkUrlBound,
        checkKeywords: checkKeywordsBound,
        addCustomDomain,
        removeCustomDomain,
        addCustomKeyword,
        removeCustomKeyword,
        setAccountabilityPartner,
        logBlockedAttempt,
        clearBlockHistory,
    };

    return (
        <ContentProtectionContext.Provider value={value}>
            {children}
        </ContentProtectionContext.Provider>
    );
}

export function useContentProtection() {
    const context = useContext(ContentProtectionContext);
    if (context === undefined) {
        throw new Error('useContentProtection must be used within ContentProtectionProvider');
    }
    return context;
}
