
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Search, Sparkles, ExternalLink, Loader2, Globe
} from 'lucide-react';
import { searchGoogle, type GoogleSearchResult } from '../services/googleSearchService';
import { generateOpenAIContent } from '../services/openaiService';
import { motion, AnimatePresence } from 'framer-motion';

const AIGoogleSearch: React.FC = () => {
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<GoogleSearchResult[]>([]);
    const [aiSummary, setAiSummary] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [isSummarizing, setIsSummarizing] = useState(false);
    const [error, setError] = useState('');

    const handleSearch = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!query.trim()) return;

        setIsSearching(true);
        setResults([]);
        setAiSummary('');
        setError('');

        try {
            // 1. Fetch Google Results
            const searchResults = await searchGoogle(query);
            setResults(searchResults);

            if (searchResults.length > 0) {
                // 2. Generate AI Summary
                setIsSummarizing(true);
                const context = searchResults.slice(0, 5).map(r => `Title: ${r.title}\nSnippet: ${r.snippet}`).join('\n\n');

                const prompt = `
                You are an advanced AI research assistant. Synthesize the following search results for the query: "${query}".
                
                SEARCH RESULTS:
                ${context}
                
                Provide a helpful, direct answer or summary based on these results. Keep it concise (max 3-4 sentences). 
                If the results are technical, extract the key data points.
                Style: Professional, insightful, direct.
                `;

                const summary = await generateOpenAIContent(prompt);
                setAiSummary(summary);
            }
        } catch (err: unknown) {
            console.error("Search failed:", err);
            setError(err instanceof Error ? err.message : "An error occurred during search.");
        } finally {
            setIsSearching(false);
            setIsSummarizing(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F5F5F5] font-sans antialiased text-[#333333] flex justify-center ai-section">
            <div className="w-full max-w-md min-h-screen relative flex flex-col pb-10">
                {/* Header */}
                <header className="px-6 pt-12 pb-6 flex items-start justify-between sticky top-0 z-30 bg-[#F5F5F5]/90 backdrop-blur-md">
                    <div>
                        <button
                            onClick={() => navigate('/section/ai')}
                            className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm mb-6 text-[#333333] border border-[#CCCCCC] transition-all hover:bg-[#DDDDDD]"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <h1 className="text-4xl font-black tracking-tighter text-[#000000] mb-1 italic">Web Lens</h1>
                        <p className="text-[#847777] text-[10px] font-black uppercase tracking-[0.2em]">Live Intelligence</p>
                    </div>
                </header>

                {/* Search Input */}
                <div className="px-6 sticky top-[160px] z-20 -mt-2">
                    <form onSubmit={handleSearch} className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-[2rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Ask the web..."
                            className="w-full h-16 bg-white border border-[#CCCCCC] rounded-[2rem] pl-14 pr-6 text-lg font-medium shadow-sm transition-all focus:ring-4 focus:ring-[#847777]/10 focus:border-[#847777] outline-none placeholder:text-[#CCCCCC]"
                        />
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-[#847777]" />
                        <button
                            type="submit"
                            disabled={isSearching || !query.trim()}
                            className="absolute right-3 top-3 bottom-3 bg-[#333333] text-white px-5 rounded-3xl font-black uppercase tracking-widest text-[10px] hover:bg-[#000000] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Go'}
                        </button>
                    </form>
                </div>

                <div className="flex-1 px-6 mt-8 space-y-6">
                    {/* Error State */}
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-100 rounded-3xl text-red-500 text-xs font-bold text-center">
                            {error}
                        </div>
                    )}

                    {/* AI Summary Card */}
                    <AnimatePresence>
                        {(aiSummary || isSummarizing) && !error && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-gradient-to-br from-[#333333] to-[#1a1a1a] rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20"></div>

                                <div className="flex items-center gap-3 mb-4 relative z-10">
                                    <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm">
                                        <Sparkles className="w-4 h-4 text-white" />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#847777]">AI Synthesis</span>
                                </div>

                                <div className="relative z-10">
                                    {isSummarizing && !aiSummary ? (
                                        <div className="flex items-center gap-3 text-white/50">
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span className="text-sm font-medium italic">Reading sources...</span>
                                        </div>
                                    ) : (
                                        <p className="text-white/90 text-sm leading-relaxed font-medium">
                                            {aiSummary}
                                        </p>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Search Results */}
                    <div className="space-y-4">
                        {results.length > 0 && (
                            <div className="flex items-center gap-2 px-2 opacity-50">
                                <Globe className="w-3 h-3 text-[#333333]" />
                                <span className="text-[9px] font-black uppercase tracking-widest text-[#333333]">Sources ({results.length})</span>
                            </div>
                        )}

                        {results.map((result, idx) => (
                            <motion.a
                                key={idx}
                                href={result.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="block bg-white rounded-[2rem] p-6 border border-[#F0F0F0] hover:border-[#847777] hover:shadow-lg transition-all group"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        {result.pagemap?.cse_image?.[0]?.src ? (
                                            <img src={result.pagemap.cse_image[0].src} alt="" className="w-4 h-4 rounded-full object-cover" />
                                        ) : (
                                            <div className="w-4 h-4 rounded-full bg-[#F5F5F5] flex items-center justify-center text-[#847777]">
                                                <Globe className="w-2.5 h-2.5" />
                                            </div>
                                        )}
                                        <span className="text-[10px] text-[#847777] truncate font-medium">{result.displayLink || new URL(result.link).hostname}</span>
                                    </div>
                                    <ExternalLink className="w-3 h-3 text-[#CCCCCC] group-hover:text-[#333333] transition-colors" />
                                </div>

                                <h3 className="text-base font-bold text-[#1a1a1a] mb-2 leading-tight group-hover:text-blue-600 transition-colors" dangerouslySetInnerHTML={{ __html: result.title }}></h3>
                                <p className="text-xs text-[#666666] leading-relaxed line-clamp-2">{result.snippet}</p>
                            </motion.a>
                        ))}
                    </div>

                    {/* Empty State */}
                    {!isSearching && results.length === 0 && !error && (
                        <div className="flex flex-col items-center justify-center py-20 opacity-30">
                            <Search className="w-12 h-12 text-[#CCCCCC] mb-4" />
                            <p className="text-xs font-black uppercase tracking-widest text-[#CCCCCC]">Ready to Search</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AIGoogleSearch;
