export type ProtectionLevel = 'off' | 'light' | 'strong' | 'strict';

export interface AccountabilityPartner {
    email: string;
    notifyOnBlock: boolean;
    dailyReport: boolean;
    weeklyReport: boolean;
}

export interface BlockedAttempt {
    id: string;
    timestamp: Date;
    url?: string;
    keyword?: string;
    reason: string;
    protectionLevel: ProtectionLevel;
}

export interface ContentProtectionSettings {
    enabled: boolean;
    protectionLevel: ProtectionLevel;
    vitalBlockingEnabled: boolean;
    pin?: string;
    customBlockedDomains: string[];
    customBlockedKeywords: string[];
    accountabilityPartner?: AccountabilityPartner;
    blockHistory: BlockedAttempt[];
    lastModified: Date;
}

export interface ProtectionLevelConfig {
    name: string;
    description: string;
    features: string[];
    blockedCategories: string[];
}

export const PROTECTION_LEVELS: Record<ProtectionLevel, ProtectionLevelConfig> = {
    off: {
        name: 'Off',
        description: 'No content filtering active',
        features: [],
        blockedCategories: [],
    },
    light: {
        name: 'Light Protection',
        description: 'Basic filtering for common adult content',
        features: [
            'Block known adult websites',
            'Basic keyword filtering',
            'Warning prompts',
        ],
        blockedCategories: ['adult', 'explicit'],
    },
    strong: {
        name: 'Strong Protection',
        description: 'Enhanced filtering with social media restrictions',
        features: [
            'All Light features',
            'Social media time limits',
            'Enhanced keyword filtering',
            'Block proxy/VPN sites',
        ],
        blockedCategories: ['adult', 'explicit', 'dating', 'gambling', 'proxy'],
    },
    strict: {
        name: 'Strict Protection',
        description: 'Maximum protection with comprehensive filtering',
        features: [
            'All Strong features',
            'Strict keyword filtering',
            'Image content analysis',
            'Block gaming/streaming sites',
            'Accountability reporting',
        ],
        blockedCategories: [
            'adult',
            'explicit',
            'dating',
            'gambling',
            'proxy',
            'gaming',
            'streaming',
            'social-media',
        ],
    },
};
