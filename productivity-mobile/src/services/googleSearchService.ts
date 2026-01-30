
/**
 * Google Search Service - Mobile
 */
export interface GoogleSearchResult {
    title: string;
    link: string;
    snippet: string;
    displayLink?: string;
    pagemap?: {
        cse_image?: { src: string }[];
    };
}

export async function searchGoogle(query: string): Promise<GoogleSearchResult[]> {
    const apiKey = process.env.EXPO_PUBLIC_GOOGLE_SEARCH_API_KEY;
    const cx = process.env.EXPO_PUBLIC_GOOGLE_SEARCH_ENGINE_ID;

    if (!apiKey || !cx) {
        console.warn("Google Search keys missing");
        return [];
    }

    try {
        const response = await fetch(
            `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(query)}`
        );
        const data = await response.json();
        return data.items || [];
    } catch (error) {
        console.error("Google Search Error:", error);
        return [];
    }
}
