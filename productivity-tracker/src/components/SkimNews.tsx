
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Zap, Cpu, Briefcase, Palette, Rocket, TrendingUp,
    ArrowLeft, Settings, X, Plus, Check, Loader2, Sparkles,
    ExternalLink, ShieldAlert
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { searchNews, fetchTopHeadlines } from '../services/newsService';
import type { NewsArticle } from '../services/newsService';
import { useContentProtection } from '../contexts/ContentProtectionContext';

// ============================================
// DEFAULT TOPICS (Core 6)
// ============================================

const DEFAULT_TOPICS = [
    { id: 'startups', label: 'Startups', icon: Rocket, color: 'from-green-500 to-emerald-600' },
    { id: 'ai', label: 'AI', icon: Sparkles, color: 'from-purple-500 to-violet-600' },
    { id: 'tech', label: 'Technology', icon: Cpu, color: 'from-blue-500 to-cyan-600' },
    { id: 'business', label: 'Business', icon: Briefcase, color: 'from-amber-500 to-orange-600' },
    { id: 'design', label: 'Design', icon: Palette, color: 'from-pink-500 to-rose-600' },
    { id: 'future', label: 'Future Tech', icon: TrendingUp, color: 'from-indigo-500 to-blue-600' },
];

// ============================================
// MAIN COMPONENT
// ============================================

export default function SkimNews() {
    const navigate = useNavigate();
    const { logBlockedAttempt, checkKeywords, checkUrl } = useContentProtection();

    // State
    const [allTopics, setAllTopics] = useState(DEFAULT_TOPICS);
    const [activeTopicId, setActiveTopicId] = useState('startups');
    const [articles, setArticles] = useState<NewsArticle[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [error, setError] = useState<string | null>(null);

    // Customization State
    const [showCustomize, setShowCustomize] = useState(false);
    const [newTopicInput, setNewTopicInput] = useState('');
    const [customTopics, setCustomTopics] = useState<string[]>([]);

    // ... (useEffect for local storage and topics building remain same)
    // Load saved custom topics from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('skim-news-custom-topics');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setCustomTopics(parsed);
            } catch (e) {
                console.error('Failed to load custom topics:', e);
            }
        }
    }, []);

    // Build complete topics list (default + custom)
    useEffect(() => {
        const customTopicItems = customTopics.map((topic, idx) => ({
            id: `custom-${idx}`,
            label: topic,
            icon: Zap,
            color: 'from-gray-600 to-gray-700',
        }));
        setAllTopics([...DEFAULT_TOPICS, ...customTopicItems]);
    }, [customTopics]);

    // ... (useMemo for orderedTopics remains same)
    const orderedTopics = useMemo(() => {
        const activeIndex = allTopics.findIndex(t => t.id === activeTopicId);
        if (activeIndex === -1) return allTopics;

        // Reorder: active topic first, then loop through others
        return [
            ...allTopics.slice(activeIndex),
            ...allTopics.slice(0, activeIndex)
        ];
    }, [allTopics, activeTopicId]);


    // ============================================
    // LOAD NEWS FUNCTION
    // ============================================

    const loadNews = useCallback(async () => {
        setLoading(true);
        setArticles([]);
        setError(null);

        try {
            const activeTopic = allTopics.find(t => t.id === activeTopicId);
            const query = activeTopic?.label || 'technology';

            // Check if Topic Label is blocked (e.g. if custom topic was somehow added before block)
            const protectionResult = checkKeywords(query);
            if (protectionResult.blocked) {
                setError(`Topic blocked: ${protectionResult.reason}`);
                logBlockedAttempt(query, 'topic', protectionResult.reason);
                setLoading(false);
                return;
            }

            const results = await searchNews(query);

            if (results.length > 0) {
                setArticles(results.slice(0, 10));
            } else {
                const headlines = await fetchTopHeadlines('technology');
                setArticles(headlines.slice(0, 10));
            }
        } catch (error) {
            console.error('Failed to load news:', error);
            setError('Failed to load news');
        } finally {
            setLoading(false);
        }
    }, [activeTopicId, allTopics, checkKeywords, logBlockedAttempt]);

    // Load news when topic changes
    useEffect(() => {
        loadNews();
    }, [loadNews]);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        // Content Protection Check
        const protectionResult = checkKeywords(searchQuery);
        if (protectionResult.blocked) {
            setError(`Search blocked: ${protectionResult.reason}`);
            logBlockedAttempt(searchQuery, 'keyword', protectionResult.reason);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const results = await searchNews(searchQuery);
            setArticles(results.slice(0, 10));
        } catch (error) {
            console.error('Search failed:', error);
            setError('Search failed');
        } finally {
            setLoading(false);
        }
    };

    // ... (selectTopic remains same)
    const selectTopic = (topicId: string) => {
        setActiveTopicId(topicId);
        setSearchQuery('');
        setError(null);
    };

    // ============================================
    // CUSTOMIZATION HANDLERS
    // ============================================

    const addCustomTopic = () => {
        if (!newTopicInput.trim()) return;

        // Content Protection Check
        const protectionResult = checkKeywords(newTopicInput);
        if (protectionResult.blocked) {
            alert(`Topic blocked: ${protectionResult.reason}`); // Simple alert for modal
            logBlockedAttempt(newTopicInput, 'topic', protectionResult.reason);
            return;
        }

        if (customTopics.includes(newTopicInput.trim())) return;

        const updated = [...customTopics, newTopicInput.trim()];
        setCustomTopics(updated);
        localStorage.setItem('skim-news-custom-topics', JSON.stringify(updated));
        setNewTopicInput('');
    };

    const removeCustomTopic = (topic: string) => {
        const updated = customTopics.filter(t => t !== topic);
        setCustomTopics(updated);
        localStorage.setItem('skim-news-custom-topics', JSON.stringify(updated));

        if (activeTopicId.startsWith('custom-')) {
            setActiveTopicId('startups');
        }
    };

    const resetToDefault = () => {
        setCustomTopics([]);
        localStorage.removeItem('skim-news-custom-topics');
        setActiveTopicId('startups');
        setShowCustomize(false);
    };

    // Open external link
    const openArticle = (url: string) => {
        const protectionResult = checkUrl(url);
        if (protectionResult.blocked) {
            logBlockedAttempt(url, undefined, protectionResult.reason);
            alert(`Access Blocked: ${protectionResult.reason}`);
            return;
        }
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    // ============================================
    // RENDER
    // ============================================

    return (
        <div className="min-h-screen bg-white pb-24">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-white border-b border-gray-100">
                <div className="max-w-3xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => navigate(-1)}
                                className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-all"
                            >
                                <ArrowLeft className="w-4 h-4 text-gray-600" />
                            </button>
                            <h1 className="text-xl font-semibold text-gray-900">Skim News</h1>
                        </div>

                        {/* Customize Button */}
                        <button
                            onClick={() => setShowCustomize(true)}
                            className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 transition-all"
                        >
                            <Settings className="w-4 h-4" />
                            Customize
                        </button>
                    </div>

                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="relative mb-4">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                            <Search className="w-5 h-5" />
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search any topic..."
                            className="w-full h-12 pl-12 pr-24 bg-gray-50 border border-gray-200 rounded-full text-gray-800 placeholder:text-gray-400 text-base focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                        />
                        <button
                            type="submit"
                            className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-blue-500 text-white rounded-full text-sm font-medium hover:bg-blue-600 transition-all"
                        >
                            Search
                        </button>
                    </form>

                    {/* Topic Pills - Looping (Selected first) */}
                    <div className="flex flex-wrap gap-2">
                        {orderedTopics.map((topic) => {
                            const Icon = topic.icon;
                            const isActive = activeTopicId === topic.id;

                            return (
                                <button
                                    key={topic.id}
                                    onClick={() => selectTopic(topic.id)}
                                    className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-all ${isActive
                                        ? `bg-gradient-to-r ${topic.color} text-white shadow-md`
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    <Icon className="w-3.5 h-3.5" />
                                    {topic.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </header>

            {/* News Results - Single Column, Landscape Cards */}
            <div className="max-w-3xl mx-auto px-4 py-4">
                <AnimatePresence mode="wait">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-3" />
                            <p className="text-gray-500 text-sm">Loading news...</p>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <ShieldAlert className="w-12 h-12 text-red-500 mb-3" />
                            <h3 className="text-lg font-semibold text-gray-700 mb-1">Content Blocked</h3>
                            <p className="text-gray-500 text-sm">{error}</p>
                        </div>
                    ) : articles.length > 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="space-y-1"
                        >
                            <p className="text-xs text-gray-500 mb-4">
                                Showing <span className="font-medium">{articles.length}</span> results for "<span className="font-medium text-gray-700">{allTopics.find(t => t.id === activeTopicId)?.label || searchQuery}</span>"
                            </p>

                            {articles.map((article, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.03 }}
                                    onClick={() => openArticle(article.url)}
                                    className="group py-4 px-3 -mx-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-all"
                                >
                                    <div className="flex gap-4">
                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            {/* Source */}
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs text-green-700 font-medium truncate max-w-[200px]">
                                                    {article.source?.name || 'News'}
                                                </span>
                                                <span className="text-xs text-gray-400">•</span>
                                                <span className="text-xs text-gray-400">
                                                    {new Date(article.publishedAt).toLocaleDateString()}
                                                </span>
                                                <ExternalLink className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>

                                            {/* Title */}
                                            <h3 className="text-base sm:text-lg text-blue-700 group-hover:underline font-normal mb-1 line-clamp-2">
                                                {article.title}
                                            </h3>

                                            {/* Description */}
                                            <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                                                {article.description}
                                            </p>
                                        </div>

                                        {/* Thumbnail */}
                                        {article.urlToImage && (
                                            <div className="w-28 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                                                <img
                                                    src={article.urlToImage}
                                                    alt=""
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).style.display = 'none';
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                                <Search className="w-8 h-8 text-gray-300" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-700 mb-1">No news found</h3>
                            <p className="text-gray-500 text-sm">Try a different topic or search term</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>

            {/* ============================================ */}
            {/* CUSTOMIZE MODAL */}
            {/* ============================================ */}
            <AnimatePresence>
                {showCustomize && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center"
                        onClick={() => setShowCustomize(false)}
                    >
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-lg bg-white rounded-t-3xl max-h-[85vh] overflow-hidden"
                        >
                            {/* Modal Header */}
                            <div className="sticky top-0 bg-white px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Customize Topics</h2>
                                    <p className="text-sm text-gray-500">Add your own topics</p>
                                </div>
                                <button
                                    onClick={() => setShowCustomize(false)}
                                    className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-all"
                                >
                                    <X className="w-5 h-5 text-gray-600" />
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="p-6 overflow-y-auto max-h-[60vh]">
                                {/* Add New Topic */}
                                <div className="mb-6">
                                    <label className="text-sm font-semibold text-gray-700 mb-2 block">
                                        Add Custom Topic
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newTopicInput}
                                            onChange={(e) => setNewTopicInput(e.target.value)}
                                            placeholder="e.g., Crypto, Gaming, Space..."
                                            className="flex-1 h-12 px-4 bg-gray-100 rounded-xl text-gray-800 placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    addCustomTopic();
                                                }
                                            }}
                                        />
                                        <button
                                            onClick={addCustomTopic}
                                            disabled={!newTopicInput.trim()}
                                            className="w-12 h-12 bg-blue-500 text-white rounded-xl flex items-center justify-center hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <Plus className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Default Topics */}
                                <div className="mb-6">
                                    <label className="text-sm font-semibold text-gray-700 mb-2 block">
                                        Default Topics (6)
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {DEFAULT_TOPICS.map((topic) => {
                                            const Icon = topic.icon;
                                            return (
                                                <div
                                                    key={topic.id}
                                                    className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium bg-gradient-to-r ${topic.color} text-white`}
                                                >
                                                    <Icon className="w-4 h-4" />
                                                    {topic.label}
                                                    <Check className="w-3 h-3 opacity-60" />
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Custom Topics */}
                                {customTopics.length > 0 && (
                                    <div className="mb-6">
                                        <label className="text-sm font-semibold text-gray-700 mb-2 block">
                                            Your Custom Topics
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {customTopics.map((topic, idx) => (
                                                <div
                                                    key={idx}
                                                    className="flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium bg-gray-800 text-white"
                                                >
                                                    <Zap className="w-4 h-4" />
                                                    {topic}
                                                    <button
                                                        onClick={() => removeCustomTopic(topic)}
                                                        className="ml-1 w-5 h-5 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-all"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Reset Button */}
                                <button
                                    onClick={resetToDefault}
                                    className="w-full py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                >
                                    Reset to Default Topics
                                </button>
                            </div>

                            {/* Modal Footer */}
                            <div className="sticky bottom-0 bg-white px-6 py-4 border-t border-gray-100">
                                <button
                                    onClick={() => setShowCustomize(false)}
                                    className="w-full py-4 bg-gray-900 text-white rounded-2xl font-semibold hover:bg-gray-800 transition-all"
                                >
                                    Done
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
