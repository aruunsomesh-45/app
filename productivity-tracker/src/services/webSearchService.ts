
/**
 * Web Search Service
 * Multi-provider search with fallback support.
 * Uses Google Custom Search as primary, DuckDuckGo as fallback.
 */

export interface SearchResult {
    title: string;
    url: string;
    snippet: string;
    image?: string;
    source: string;
}

interface GoogleSearchItem {
    title: string;
    link: string;
    snippet: string;
    pagemap?: {
        cse_image?: { src: string }[];
        cse_thumbnail?: { src: string }[];
    };
    displayLink?: string;
}

interface NewsArticle {
    title: string;
    url: string;
    description?: string;
    content?: string;
    urlToImage?: string;
    source?: { name: string };
}

interface WikipediaSearchItem {
    title: string;
    snippet: string;
}

// ============================================
// PRIMARY: Google Custom Search
// ============================================

export async function searchWithGoogle(query: string): Promise<SearchResult[]> {
    const apiKey = import.meta.env.VITE_GOOGLE_SEARCH_API_KEY;
    const cx = import.meta.env.VITE_GOOGLE_SEARCH_ENGINE_ID;

    if (!apiKey || !cx) {
        throw new Error("Google Search not configured");
    }

    const params = new URLSearchParams({
        key: apiKey,
        cx: cx,
        q: query,
        num: '10',
    });

    const response = await fetch(
        `https://www.googleapis.com/customsearch/v1?${params.toString()}`
    );

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "Google Search failed");
    }

    const data = await response.json();

    return (data.items || []).map((item: GoogleSearchItem) => ({
        title: item.title,
        url: item.link,
        snippet: item.snippet,
        image: item.pagemap?.cse_image?.[0]?.src || item.pagemap?.cse_thumbnail?.[0]?.src,
        source: item.displayLink || new URL(item.link).hostname,
    }));
}

// ============================================
// FALLBACK: SerpApi (Free tier - more reliable)
// ============================================

export async function searchWithSerpApi(query: string): Promise<SearchResult[]> {
    // Using a public Serper API endpoint for fallback
    // This is a reliable fallback that provides Google-like results

    try {
        // Use the News API as an alternative for person searches
        const newsApiKey = import.meta.env.VITE_NEWS_API_KEY;

        if (!newsApiKey) {
            throw new Error("No fallback API available");
        }

        const response = await fetch(
            `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&sortBy=relevancy&pageSize=10&apiKey=${newsApiKey}`
        );

        if (!response.ok) {
            throw new Error("News API request failed");
        }

        const data = await response.json();

        if (data.status !== 'ok' || !data.articles) {
            throw new Error(data.message || "No results");
        }

        return data.articles.map((article: NewsArticle) => ({
            title: article.title,
            url: article.url,
            snippet: article.description || article.content || '',
            image: article.urlToImage,
            source: article.source?.name || 'News',
        }));
    } catch (error) {
        console.error("Fallback search failed:", error);
        throw error;
    }
}

// ============================================
// WIKIPEDIA API for Person/Entity Search
// ============================================

export async function searchWikipedia(query: string): Promise<SearchResult[]> {
    try {
        const response = await fetch(
            `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*&srlimit=5`
        );

        if (!response.ok) {
            throw new Error("Wikipedia search failed");
        }

        const data = await response.json();
        const results = data.query?.search || [];

        return results.map((item: WikipediaSearchItem) => ({
            title: item.title,
            url: `https://en.wikipedia.org/wiki/${encodeURIComponent(item.title.replace(/ /g, '_'))}`,
            snippet: item.snippet.replace(/<[^>]*>/g, ''), // Remove HTML tags
            image: undefined, // Wikipedia API doesn't return images in search
            source: 'Wikipedia',
        }));
    } catch (error) {
        console.error("Wikipedia search failed:", error);
        return [];
    }
}

// ============================================
// UNIFIED SEARCH FUNCTION
// ============================================

export async function performWebSearch(query: string): Promise<SearchResult[]> {
    const results: SearchResult[] = [];

    // Try multiple sources in parallel for comprehensive results
    const [googleResults, wikiResults, newsResults] = await Promise.allSettled([
        searchWithGoogle(query),
        searchWikipedia(query),
        searchWithSerpApi(query),
    ]);

    // Add Wikipedia results first (most authoritative for people/entities)
    if (wikiResults.status === 'fulfilled' && wikiResults.value.length > 0) {
        results.push(...wikiResults.value.slice(0, 2)); // Top 2 Wikipedia results
    }

    // Add Google results (primary)
    if (googleResults.status === 'fulfilled' && googleResults.value.length > 0) {
        // Filter out duplicates based on URL
        const existingUrls = new Set(results.map(r => r.url));
        const unique = googleResults.value.filter(r => !existingUrls.has(r.url));
        results.push(...unique);
    }

    // Add News results as supplement
    if (newsResults.status === 'fulfilled' && newsResults.value.length > 0) {
        const existingUrls = new Set(results.map(r => r.url));
        const unique = newsResults.value.filter(r => !existingUrls.has(r.url));
        results.push(...unique.slice(0, 5)); // Add up to 5 news results
    }

    // If all failed, throw error
    if (results.length === 0) {
        if (googleResults.status === 'rejected') {
            throw new Error(googleResults.reason?.message || "Search failed");
        }
        if (newsResults.status === 'rejected') {
            throw new Error(newsResults.reason?.message || "Search failed");
        }
        throw new Error("No results found");
    }

    return results;
}
