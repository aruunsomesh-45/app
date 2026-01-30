
const NEWS_API_KEY = import.meta.env.VITE_NEWS_API_KEY;

export interface NewsArticle {
    title: string;
    description: string;
    url: string;
    urlToImage?: string;
    source: { name: string };
    publishedAt: string;
    content?: string;
}

export async function fetchTopHeadlines(category = 'technology'): Promise<NewsArticle[]> {
    if (!NEWS_API_KEY) {
        console.warn("News API Key missing");
        // Return empty array to allow component to handle empty state gracefully
        return [];
    }
    try {
        const res = await fetch(`https://newsapi.org/v2/top-headlines?country=us&category=${category}&apiKey=${NEWS_API_KEY}`);
        const data = await res.json();
        if (data.status === 'error') {
            console.warn("News API Error:", data.message);
            return [];
        }
        return data.articles || [];
    } catch (e) {
        console.error("News API Fetch Error:", e);
        return [];
    }
}

export async function searchNews(query: string): Promise<NewsArticle[]> {
    if (!NEWS_API_KEY) return [];
    try {
        // Sort by relevancy to get best matches
        const res = await fetch(`https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&sortBy=relevancy&apiKey=${NEWS_API_KEY}`);
        const data = await res.json();
        if (data.status === 'error') throw new Error(data.message);
        return data.articles || [];
    } catch (e) {
        console.error("News Search Error:", e);
        return [];
    }
}
