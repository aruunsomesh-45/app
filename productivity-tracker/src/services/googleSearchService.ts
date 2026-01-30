
/**
 * Google Search Service
 * Handles communication with Google Custom Search JSON API.
 * Optimized for relevance and accuracy - behaves like Google Search.
 */

export interface GoogleSearchResult {
    title: string;
    link: string;
    snippet: string;
    pagemap?: {
        cse_image?: {
            src: string;
        }[];
        cse_thumbnail?: {
            src: string;
            width: string;
            height: string;
        }[];
        metatags?: {
            'og:image'?: string;
            'og:title'?: string;
            'og:description'?: string;
        }[];
    };
    displayLink?: string;
}

export interface GoogleSearchResponse {
    items?: GoogleSearchResult[];
    searchInformation?: {
        totalResults: string;
        formattedTotalResults: string;
        searchTime: number;
    };
}

export interface SearchOptions {
    num?: number;           // Number of results (1-10)
    start?: number;         // Start index for pagination
    dateRestrict?: string;  // e.g., 'd1' (past day), 'w1' (past week), 'm1' (past month)
    lr?: string;            // Language restrict (e.g., 'lang_en')
    safe?: 'active' | 'off';
    exactTerms?: string;    // Require exact phrase
    sort?: string;          // Sort by date: 'date'
}

/**
 * Search Google with enhanced options for relevance
 * @param query The search query
 * @param options Optional search parameters
 */
export async function searchGoogle(
    query: string,
    options: SearchOptions = {}
): Promise<GoogleSearchResult[]> {
    const apiKey = import.meta.env.VITE_GOOGLE_SEARCH_API_KEY;
    const cx = import.meta.env.VITE_GOOGLE_SEARCH_ENGINE_ID;

    if (!apiKey || !cx) {
        throw new Error("Google Search configuration missing. Please check VITE_GOOGLE_SEARCH_API_KEY and VITE_GOOGLE_SEARCH_ENGINE_ID in .env");
    }

    // Build URL with enhanced parameters for better relevance
    const params = new URLSearchParams({
        key: apiKey,
        cx: cx,
        q: query,
        num: String(options.num || 10),  // Get max 10 results
        safe: options.safe || 'off',
    });

    // Add optional parameters
    if (options.start) params.set('start', String(options.start));
    if (options.dateRestrict) params.set('dateRestrict', options.dateRestrict);
    if (options.lr) params.set('lr', options.lr);
    if (options.exactTerms) params.set('exactTerms', options.exactTerms);
    if (options.sort) params.set('sort', options.sort);

    try {
        const response = await fetch(
            `https://www.googleapis.com/customsearch/v1?${params.toString()}`
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || "Google Search API request failed");
        }

        const data: GoogleSearchResponse = await response.json();
        return data.items || [];
    } catch (error) {
        console.error("Google Search Service Error:", error);
        throw error;
    }
}

/**
 * Search specifically for a person (optimized for people search)
 */
export async function searchPerson(name: string): Promise<GoogleSearchResult[]> {
    // Search with exact name match for better person results
    return searchGoogle(name, {
        num: 10,
    });
}

/**
 * Search for recent news about a topic
 */
export async function searchRecentNews(query: string): Promise<GoogleSearchResult[]> {
    return searchGoogle(query, {
        num: 10,
        dateRestrict: 'w1',  // Past week for fresh news
        sort: 'date',
    });
}
