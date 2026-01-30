
/**
 * News Service - Mobile
 */
const API_KEY = process.env.EXPO_PUBLIC_NEWS_API_KEY;
const BASE_URL = 'https://newsapi.org/v2';

export interface NewsArticle {
    title: string;
    description: string;
    url: string;
    urlToImage?: string;
    publishedAt: string;
    source: {
        id?: string;
        name: string;
    };
}

export async function fetchTopHeadlines(category: string = 'technology'): Promise<NewsArticle[]> {
    if (!API_KEY) {
        console.warn('News API Key is missing');
        return [];
    }
    try {
        const response = await fetch(`${BASE_URL}/top-headlines?country=us&category=${category}&apiKey=${API_KEY}`);
        const data = await response.json();
        return data.articles || [];
    } catch (error) {
        console.error('Error fetching news:', error);
        return [];
    }
}

export async function searchNews(query: string): Promise<NewsArticle[]> {
    if (!API_KEY) return [];
    try {
        const response = await fetch(`${BASE_URL}/everything?q=${encodeURIComponent(query)}&apiKey=${API_KEY}`);
        const data = await response.json();
        return data.articles || [];
    } catch (error) {
        console.error('Error searching news:', error);
        return [];
    }
}
