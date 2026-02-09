import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Search, X, Loader2,
    AlertCircle, TrendingUp, ExternalLink
} from 'lucide-react';
import { performWebSearch } from '../services/webSearchService';
import type { SearchResult } from '../services/webSearchService';
import { useContentProtection } from '../contexts/ContentProtectionContext';
import { checkUrl, checkKeywords } from '../services/contentFilter';

// ============================================
// MAIN COMPONENT - Google-like Search
// ============================================

const SearchDirectory: React.FC = () => {
    const navigate = useNavigate();
    const { settings, logBlockedAttempt } = useContentProtection();

    // State
    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // ============================================
    // SEARCH FUNCTION - Like Google
    // ============================================

    const performSearch = useCallback(async (query: string) => {
        if (!query.trim()) return;

        // Content Protection Check - Keywords
        if (settings.protectionLevel !== 'off') {
            const keywordResult = checkKeywords(query, settings.protectionLevel, settings.customBlockedKeywords);
            if (keywordResult.blocked) {
                alert(`Search Blocked: ${keywordResult.reason}`);
                logBlockedAttempt(undefined, query, keywordResult.reason);
                return;
            }
        }

        setIsLoading(true);
        setError(null);
        setHasSearched(true);

        try {
            // Perform unified web search (Google + Wikipedia + News)
            const searchResults = await performWebSearch(query);
            setResults(searchResults);

            if (searchResults.length === 0) {
                setError(`No results found for "${query}". Try different keywords.`);
            }
        } catch (err: unknown) {
            console.error('Search error:', err);
            const errorMessage = err instanceof Error ? err.message : 'Search failed. Please try again.';
            setError(errorMessage);
            setResults([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Handle form submit
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        performSearch(searchQuery);
    };

    // Handle Enter key
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            performSearch(searchQuery);
        }
    };

    // Open external link
    const openExternalLink = (url: string) => {
        if (settings.protectionLevel !== 'off') {
            const protectionResult = checkUrl(url, settings.protectionLevel, settings.customBlockedDomains);
            if (protectionResult.blocked) {
                alert(`Access Blocked: ${protectionResult.reason}`);
                logBlockedAttempt(url, undefined, protectionResult.reason);
                return;
            }
        }
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    // Clear search
    const clearSearch = () => {
        setSearchQuery('');
        setResults([]);
        setHasSearched(false);
        setError(null);
    };

    // Popular searches
    const suggestedSearches = [
        'Elon Musk',
        'Sundar Pichai',
        'Sam Altman',
        'Bill Gates',
        'Mark Zuckerberg',
        'Tim Cook',
        'OpenAI',
        'Tesla'
    ];

    // ============================================
    // RENDER
    // ============================================

    return (
        <div className="min-h-screen bg-white">
            <div className="w-full max-w-3xl mx-auto px-4 pb-24">

                {/* ===== HEADER ===== */}
                <header className="pt-6 pb-4 sticky top-0 bg-white z-30 border-b border-gray-100">
                    <div className="flex items-center gap-3 mb-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-all"
                        >
                            <ArrowLeft className="w-4 h-4 text-gray-600" />
                        </button>
                        <h1 className="text-xl font-semibold text-gray-900">Search</h1>
                    </div>

                    {/* ===== SEARCH BAR ===== */}
                    <form onSubmit={handleSearch} className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                            <Search className="w-5 h-5" />
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Search for people, companies, topics..."
                            autoFocus
                            className="w-full h-12 pl-12 pr-28 bg-gray-50 border border-gray-200 rounded-full text-gray-800 placeholder:text-gray-400 text-base focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={clearSearch}
                                    className="p-2 text-gray-400 hover:text-gray-600 transition-all"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                            <button
                                type="submit"
                                disabled={!searchQuery.trim() || isLoading}
                                className="px-4 py-2 bg-blue-500 text-white rounded-full text-sm font-medium hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <>
                                        <Search className="w-3.5 h-3.5" />
                                        Search
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </header>

                {/* ===== SUGGESTED SEARCHES ===== */}
                {!hasSearched && (
                    <div className="py-6">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" />
                            Popular Searches
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {suggestedSearches.map(term => (
                                <button
                                    key={term}
                                    onClick={() => {
                                        setSearchQuery(term);
                                        performSearch(term);
                                    }}
                                    className="px-4 py-2 bg-gray-100 rounded-full text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all"
                                >
                                    {term}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* ===== LOADING ===== */}
                {isLoading && (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-3" />
                        <p className="text-gray-500 text-sm">Searching the web...</p>
                    </div>
                )}

                {/* ===== ERROR STATE ===== */}
                {error && !isLoading && (
                    <div className="flex flex-col items-center justify-center py-16 px-6">
                        <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center mb-3">
                            <AlertCircle className="w-6 h-6 text-orange-500" />
                        </div>
                        <h3 className="text-base font-medium text-gray-700 mb-1">Search Error</h3>
                        <p className="text-gray-500 text-sm text-center max-w-md mb-4">{error}</p>
                        <button
                            onClick={() => performSearch(searchQuery)}
                            className="px-5 py-2.5 bg-blue-500 text-white rounded-full text-sm font-medium hover:bg-blue-600 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {/* ===== SEARCH RESULTS ===== */}
                {!isLoading && !error && results.length > 0 && (
                    <div className="py-4">
                        <p className="text-xs text-gray-500 mb-4">
                            Found <span className="font-medium">{results.length}</span> results for "<span className="font-medium text-gray-700">{searchQuery}</span>"
                        </p>

                        <div className="space-y-1">
                            {results.map((result, index) => (
                                <div
                                    key={`${result.url}-${index}`}
                                    onClick={() => openExternalLink(result.url)}
                                    className="group py-4 px-3 -mx-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-all"
                                >
                                    <div className="flex gap-4">
                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            {/* Source */}
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs text-green-700 truncate max-w-[250px]">
                                                    {result.source}
                                                </span>
                                                <ExternalLink className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>

                                            {/* Title */}
                                            <h3 className="text-base sm:text-lg text-blue-700 group-hover:underline font-normal mb-1 line-clamp-2">
                                                {result.title}
                                            </h3>

                                            {/* Snippet */}
                                            <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                                                {result.snippet}
                                            </p>
                                        </div>

                                        {/* Thumbnail */}
                                        {result.image && (
                                            <div className="w-28 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                                                <img
                                                    src={result.image}
                                                    alt=""
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).style.display = 'none';
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ===== NO RESULTS ===== */}
                {!isLoading && !error && hasSearched && results.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 px-6">
                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                            <Search className="w-6 h-6 text-gray-400" />
                        </div>
                        <h3 className="text-base font-medium text-gray-700 mb-1">No results found</h3>
                        <p className="text-gray-500 text-sm text-center max-w-md mb-4">
                            Try searching with different keywords
                        </p>

                        <div className="flex flex-wrap gap-2 justify-center">
                            {suggestedSearches.slice(0, 4).map(term => (
                                <button
                                    key={term}
                                    onClick={() => {
                                        setSearchQuery(term);
                                        performSearch(term);
                                    }}
                                    className="px-3 py-1.5 bg-gray-100 rounded-full text-xs font-medium text-gray-600 hover:bg-gray-200 transition-all"
                                >
                                    {term}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchDirectory;
