import type { ProtectionLevel } from '../types/contentProtection';

// Common blocklists by category
const ADULT_DOMAINS = [
    'pornhub.com',
    'xvideos.com',
    'xnxx.com',
    'redtube.com',
    'youporn.com',
    'xhamster.com',
    'brazzers.com',
    'chaturbate.com',
    'adultfriendfinder.com',
    'livejasmin.com',
    'cam4.com',
    'myfreecams.com',
    'spankbang.com',
    'youjizz.com',
    'tube8.com',
    'beeg.com',
    'sunporno.com',
    'eporner.com',
    'motherless.com',
    'redwap.com',
    'xtube.com',
    'cliphunter.com',
    'hclips.com',
    'xmoov.com',
    'kpopporno.com',
    'alohatube.com',
    'exporntoons.net',
    '4tube.com',
    'porn.com',
    'hentai.com',
    // Add more as needed
];

const DATING_DOMAINS = [
    'tinder.com',
    'bumble.com',
    'match.com',
    'okcupid.com',
    'hinge.co',
    'grindr.com',
    'happn.com',
    'plentyoffish.com',
    'pof.com',
    'zoosk.com',
    'eharmony.com',
];

const GAMBLING_DOMAINS = [
    'bet365.com',
    'draftkings.com',
    'fanduel.com',
    'pokerstars.com',
    'bovada.lv',
    'betway.com',
    'williamhill.com',
    '888casino.com',
    'betfair.com',
    'ladbrokes.com',
];

const PROXY_VPN_DOMAINS = [
    'hidemyass.com',
    'nordvpn.com',
    'expressvpn.com',
    'protonvpn.com',
    'surfshark.com',
    'cyberghostvpn.com',
    'privateinternetaccess.com',
    'hotspotshield.com',
    'tunnelbear.com',
];

const GAMING_DOMAINS = [
    'twitch.tv',
    'steam.com',
    'epicgames.com',
    'roblox.com',
    'discord.com',
    'discord.gg',
    'battle.net',
    'minecraft.net',
    'fortnite.com',
];

const STREAMING_DOMAINS = [
    'netflix.com',
    'hulu.com',
    'disneyplus.com',
    'primevideo.com',
    'hbodude.com',
    'hbomax.com',
    'max.com',
    'crunchyroll.com',
    'funimation.com',
];

const SOCIAL_MEDIA_DOMAINS = [
    'facebook.com',
    'instagram.com',
    'twitter.com',
    'x.com',
    'tiktok.com',
    'snapchat.com',
    'reddit.com',
    'pinterest.com',
    'linkedin.com',
    'tumblr.com',
];

// Keyword lists by protection level
const LIGHT_KEYWORDS = [
    'porn',
    'xxx',
    'sex',
    'nude',
    'naked',
    'nsfw',
    'erotic',
];

const STRONG_KEYWORDS = [
    ...LIGHT_KEYWORDS,
    'escort',
    'hookup',
    'dating',
    'onlyfans',
    'strip club',
    'stripper',
    'cam show',
];

const STRICT_KEYWORDS = [
    ...STRONG_KEYWORDS,
    'hot singles',
    'meet now',
    'cam girl',
    'live chat',
    'gambling',
    'betting',
    'casino',
];

/**
 * Get blocklist domains based on protection level
 */
export function getBlocklistByLevel(level: ProtectionLevel): string[] {
    switch (level) {
        case 'off':
            return [];
        case 'light':
            return [...ADULT_DOMAINS];
        case 'strong':
            return [
                ...ADULT_DOMAINS,
                ...DATING_DOMAINS,
                ...GAMBLING_DOMAINS,
                ...PROXY_VPN_DOMAINS,
            ];
        case 'strict':
            return [
                ...ADULT_DOMAINS,
                ...DATING_DOMAINS,
                ...GAMBLING_DOMAINS,
                ...PROXY_VPN_DOMAINS,
                ...GAMING_DOMAINS,
                ...STREAMING_DOMAINS,
                ...SOCIAL_MEDIA_DOMAINS,
            ];
        default:
            return [];
    }
}

/**
 * Get keyword blocklist based on protection level
 */
export function getKeywordsByLevel(level: ProtectionLevel): string[] {
    switch (level) {
        case 'off':
            return [];
        case 'light':
            return LIGHT_KEYWORDS;
        case 'strong':
            return STRONG_KEYWORDS;
        case 'strict':
            return STRICT_KEYWORDS;
        default:
            return [];
    }
}

/**
 * Check if a URL should be blocked
 */
export function checkUrl(
    url: string,
    level: ProtectionLevel,
    customBlockedDomains: string[] = [],
    vitalBlockingEnabled: boolean = false
): { blocked: boolean; reason?: string } {
    try {
        const urlObj = new URL(url);
        const hostname = urlObj.hostname.replace('www.', '');
        const fullUrlLower = url.toLowerCase();

        // 1. Vital Blocking Check (Master override for Adult content and X/Twitter)
        if (vitalBlockingEnabled) {
            const vitalDomains = [...ADULT_DOMAINS, 'twitter.com', 'x.com', 't.co', 'x.co'];
            for (const domain of vitalDomains) {
                if (hostname.includes(domain) || domain.includes(hostname)) {
                    return {
                        blocked: true,
                        reason: `Content blocked by Vital Protection (Adult/X-Twitter Restriction)`,
                    };
                }
            }
        }

        // 2. Check Domains from specific level
        const blocklist = [...getBlocklistByLevel(level), ...customBlockedDomains];

        for (const domain of blocklist) {
            if (hostname.includes(domain) || domain.includes(hostname)) {
                return {
                    blocked: true,
                    reason: `Domain "${domain}" is blocked at ${level} protection level`,
                };
            }
        }

        // 3. Check Keywords in the URL path/query (Enhanced Protection)
        if (level !== 'off' || vitalBlockingEnabled) {
            // If vital blocking is on, we always check at least light keywords for safety
            const keywords = vitalBlockingEnabled && level === 'off'
                ? getKeywordsByLevel('light')
                : getKeywordsByLevel(level);

            for (const keyword of keywords) {
                if (fullUrlLower.includes(keyword.toLowerCase())) {
                    return {
                        blocked: true,
                        reason: `URL contains blocked keyword: "${keyword}"`,
                    };
                }
            }
        }

        return { blocked: false };
    } catch {
        const lowerUrl = url.toLowerCase();

        // Vital Check even for invalid URL strings
        if (vitalBlockingEnabled) {
            const vitalDomains = [...ADULT_DOMAINS, 'twitter.com', 'x.com', 't.co', 'x.co'];
            for (const domain of vitalDomains) {
                if (lowerUrl.includes(domain)) {
                    return {
                        blocked: true,
                        reason: `Vital Protection: Blocked domain "${domain}" detected`,
                    };
                }
            }
        }

        const blocklist = [...getBlocklistByLevel(level), ...customBlockedDomains];
        for (const domain of blocklist) {
            if (lowerUrl.includes(domain)) {
                return {
                    blocked: true,
                    reason: `Text contains blocked domain: "${domain}"`,
                };
            }
        }

        return { blocked: false };
    }
}

/**
 * Check if text contains blocked keywords
 */
export function checkKeywords(
    text: string,
    level: ProtectionLevel,
    customKeywords: string[] = [],
    vitalBlockingEnabled: boolean = false
): { blocked: boolean; reason?: string; matchedKeyword?: string } {
    // If vital blocking is on, we always check at least light keywords even if level is 'off'
    const baseLevel = vitalBlockingEnabled && level === 'off' ? 'light' : level;
    const keywords = [...getKeywordsByLevel(baseLevel), ...customKeywords];
    const lowerText = text.toLowerCase();

    for (const keyword of keywords) {
        if (lowerText.includes(keyword.toLowerCase())) {
            return {
                blocked: true,
                reason: `Content contains blocked keyword: "${keyword}"`,
                matchedKeyword: keyword,
            };
        }
    }

    return { blocked: false };
}

/**
 * Simulate sending notification to accountability partner
 */
export function notifyAccountabilityPartner(
    partnerEmail: string,
    blockedUrl?: string,
    blockedKeyword?: string
): void {
    // In a real implementation, this would send an email via backend API
    console.log(`[Accountability Alert] Notification sent to ${partnerEmail}`);
    console.log('Blocked content:', blockedUrl || blockedKeyword);

    // For now, just log to console
    // TODO: Implement actual email notification via backend service
}
