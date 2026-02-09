import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, ChevronDown, ChevronUp,
    Play, Pause, Volume2, VolumeX, Lightbulb, Network, Sparkles,
    Check, AlertCircle, Zap, Baby, GraduationCap, Award,
    MessageCircle, Link2, BookMarked, Headphones, Map,
    FileText, Layers, Target, Loader2, Plus, X, Trash2
} from 'lucide-react';


// ============================================
// TYPE DEFINITIONS
// ============================================

type DepthLevel = 'Simple' | 'Normal' | 'Deep';
type ContentType = 'summary' | 'mindmap' | 'podcast';

interface GeneratedContent {
    id: string;
    userInput: string;
    tldr: string;
    eli5: string;
    simple: string;
    normal: string;
    deep: string;
    analogy: string;
    realWorldExample: string;
    commonMistakes: string[];
    keyTakeaways: string[];
    relatedConcepts: string[];
    mindMap: MindMapNode;
    podcastScript: PodcastScript;
    timestamp: number;
}

interface MindMapNode {
    core: string;
    why: string;
    where: string;
    children: {
        concept: string;
        examples: string[];
        applications: string[];
    }[];
}

interface PodcastScript {
    beginner: string;
    normal: string;
    deep: string;
}

// ============================================
// MAIN COMPONENT
// ============================================

const STORAGE_KEY = 'learning-section-history';

const LearningSection: React.FC = () => {
    const navigate = useNavigate();
    const [userInput, setUserInput] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
    const [savedContent, setSavedContent] = useState<GeneratedContent[]>([]);
    const [showHistory, setShowHistory] = useState(false);
    const [depthLevel, setDepthLevel] = useState<DepthLevel>('Normal');
    const [activeTab, setActiveTab] = useState<ContentType>('summary');
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [showELI5, setShowELI5] = useState(false);
    const [expandedMindMapNodes, setExpandedMindMapNodes] = useState<number[]>([]);
    const [error, setError] = useState<string | null>(null);

    // Load saved history from localStorage on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) {
                    setSavedContent(parsed);
                }
            }
        } catch (e) {
            console.error('Failed to load learning history:', e);
        }
    }, []);

    // Save to localStorage whenever savedContent changes
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(savedContent));
        } catch (e) {
            console.error('Failed to save learning history:', e);
        }
    }, [savedContent]);

    const [speechSynthesis, setSpeechSynthesis] = useState<SpeechSynthesisUtterance | null>(null);

    const toggleMindMapNode = (index: number) => {
        setExpandedMindMapNodes(prev =>
            prev.includes(index)
                ? prev.filter(i => i !== index)
                : [...prev, index]
        );
    };

    const handlePodcastToggle = () => {
        if (!generatedContent) return;

        const getCurrentScript = () => {
            switch (depthLevel) {
                case 'Simple': return generatedContent.podcastScript.beginner;
                case 'Normal': return generatedContent.podcastScript.normal;
                case 'Deep': return generatedContent.podcastScript.deep;
            }
        };

        if (isPlaying) {
            // Stop speech
            window.speechSynthesis.cancel();
            setIsPlaying(false);
        } else {
            // Start speech
            const script = getCurrentScript();
            const utterance = new SpeechSynthesisUtterance(script);

            // Configure voice settings
            utterance.rate = 0.9; // Slightly slower for learning
            utterance.pitch = 1.0;
            utterance.volume = isMuted ? 0 : 1.0;

            // Handle speech events
            utterance.onstart = () => setIsPlaying(true);
            utterance.onend = () => setIsPlaying(false);
            utterance.onerror = () => {
                setIsPlaying(false);
                setError('Speech synthesis failed. Please try again.');
            };

            setSpeechSynthesis(utterance);
            window.speechSynthesis.speak(utterance);
        }
    };

    // Stop speech when component unmounts or tab changes
    React.useEffect(() => {
        return () => {
            window.speechSynthesis.cancel();
        };
    }, []);

    // Update volume when muted state changes
    React.useEffect(() => {
        if (speechSynthesis) {
            window.speechSynthesis.cancel();
            if (isPlaying) {
                setIsPlaying(false);
            }
        }
    }, [isMuted, speechSynthesis, isPlaying]);

    const getDepthColor = (level: DepthLevel) => {
        switch (level) {
            case 'Simple': return 'bg-green-500';
            case 'Normal': return 'bg-blue-500';
            case 'Deep': return 'bg-purple-600';
        }
    };

    // Calculate word count
    const getWordCount = (text: string): number => {
        return text.trim().split(/\s+/).length;
    };

    // Calculate reading time (average 200 words per minute)
    const getReadingTime = (text: string): string => {
        const words = getWordCount(text);
        const minutes = Math.ceil(words / 200);
        return `${minutes} min read`;
    };

    // Calculate listening time (average 150 words per minute for speech)
    const getListeningTime = (text: string): string => {
        const words = getWordCount(text);
        const minutes = Math.ceil(words / 150);
        if (minutes < 60) {
            return `${minutes} min`;
        } else {
            const hours = Math.floor(minutes / 60);
            const remainingMins = minutes % 60;
            return `${hours}h ${remainingMins}m`;
        }
    };

    const getCurrentSummary = () => {
        if (!generatedContent) return '';
        switch (depthLevel) {
            case 'Simple': return generatedContent.simple;
            case 'Normal': return generatedContent.normal;
            case 'Deep': return generatedContent.deep;
        }
    };

    const getCurrentPodcast = () => {
        if (!generatedContent) return '';
        switch (depthLevel) {
            case 'Simple': return generatedContent.podcastScript.beginner;
            case 'Normal': return generatedContent.podcastScript.normal;
            case 'Deep': return generatedContent.podcastScript.deep;
        }
    };

    const handleSummarize = async () => {
        if (!userInput.trim()) {
            setError('Please enter some content to learn about');
            return;
        }

        setIsGenerating(true);
        setError(null);

        try {
            // Use Firebase Cloud Function with Genkit AI
            const { getFunctions, httpsCallable } = await import('firebase/functions');
            const functions = getFunctions();
            const learningHubGenerate = httpsCallable(functions, 'learningHubGenerate');

            const result = await learningHubGenerate({
                userInput: userInput
            });

            const parsed = result.data as Omit<GeneratedContent, 'id' | 'userInput' | 'timestamp'>;

            const newContent: GeneratedContent = {
                id: Date.now().toString(),
                userInput: userInput,
                timestamp: Date.now(),
                ...parsed
            };

            setGeneratedContent(newContent);
            setSavedContent(prev => [newContent, ...prev]);
            setUserInput('');
            setIsGenerating(false);

        } catch (err) {
            console.error('Learning Hub Error:', err);

            const errorMessage = err instanceof Error ? err.message : String(err);

            if (errorMessage.includes('unauthenticated')) {
                setError('Please sign in to use the Learning Hub');
            } else if (errorMessage.includes('503') || errorMessage.includes('overloaded') || errorMessage.includes('resource-exhausted')) {
                setError('⚠️ AI service is currently busy. This is temporary!\n\n📝 What to do:\n1. Wait 2-3 minutes and try again\n2. Try a shorter or simpler topic\n3. The service will work again soon! 🙏');
            } else if (errorMessage.includes('JSON') || errorMessage.includes('parse')) {
                setError('Failed to process AI response. Please try a shorter or simpler topic.');
            } else {
                setError(errorMessage || 'Failed to generate learning content. Please try again.');
            }

            setIsGenerating(false);
        }
    };

    const loadSavedContent = (content: GeneratedContent) => {
        setGeneratedContent(content);
        setShowHistory(false);
    };

    const deleteSavedContent = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setSavedContent(prev => prev.filter(c => c.id !== id));
        if (generatedContent?.id === id) {
            setGeneratedContent(null);
        }
    };

    return (
        <div className="min-h-screen bg-white-smoke dark:bg-background-dark pb-20 font-sans">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
                <div className="max-w-md mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-700" />
                        </button>
                        <div className="flex items-center gap-2">

                            <h1 className="text-xl font-bold text-gray-900 dark:text-text-dark">Learning Hub</h1>
                        </div>
                        <button
                            onClick={() => setShowHistory(!showHistory)}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors relative"
                        >
                            <BookMarked className="w-5 h-5 text-gray-700" />
                            {savedContent.length > 0 && (
                                <span className="absolute top-1 right-1 w-4 h-4 bg-accent text-white-smoke text-xs rounded-full flex items-center justify-center">
                                    {savedContent.length}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* History Sidebar */}
            <AnimatePresence>
                {showHistory && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-30"
                        onClick={() => setShowHistory(false)}
                    >
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'tween' }}
                            className="absolute right-0 top-0 bottom-0 w-80 bg-white shadow-2xl overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-4 border-b border-gray-200 sticky top-0 bg-white">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-bold text-gray-900">Learning History</h2>
                                    <button
                                        onClick={() => setShowHistory(false)}
                                        className="p-2 hover:bg-gray-100 rounded-full"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                            <div className="p-4 space-y-3">
                                {savedContent.length === 0 ? (
                                    <p className="text-center text-gray-500 py-8">No saved content yet</p>
                                ) : (
                                    savedContent.map((content) => (
                                        <div
                                            key={content.id}
                                            onClick={() => loadSavedContent(content)}
                                            className="bg-gray-50 rounded-xl p-3 hover:bg-gray-100 cursor-pointer transition-colors group"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <p className="text-sm text-gray-800 font-medium line-clamp-2">
                                                        {content.userInput}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {new Date(content.timestamp).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={(e) => deleteSavedContent(content.id, e)}
                                                    className="p-1 hover:bg-red-100 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <Trash2 className="w-4 h-4 text-red-500" />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <div className="max-w-md mx-auto px-4 py-6">
                {!generatedContent ? (
                    /* Input Interface */
                    <div className="space-y-6">
                        {/* Input Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="enhanced-card card-glow-soft card-animate-fade overflow-hidden"
                            style={{ borderRadius: '1.5rem' }}
                        >
                            <div className="bg-slate-900 p-6">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-accent" />
                                    <h2 className="text-white-smoke font-black text-xl">What do you want to learn?</h2>
                                </div>
                                <p className="text-silver text-sm mt-1">
                                    Paste any text, article, or concept to generate AI-powered learning materials
                                </p>
                            </div>

                            <div className="p-6">
                                <textarea
                                    value={userInput}
                                    onChange={(e) => setUserInput(e.target.value)}
                                    placeholder="Paste your content here... 

Examples:
• Article about machine learning
• Marketing strategy document  
• Code snippet to understand
• Any topic you want to learn"
                                    className="w-full h-64 px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:border-purple-500 focus:bg-white focus:outline-none transition-all resize-none text-gray-800 placeholder:text-gray-400"
                                />

                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2"
                                    >
                                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                        <p className="text-sm text-red-800">{error}</p>
                                    </motion.div>
                                )}

                                <button
                                    onClick={handleSummarize}
                                    disabled={isGenerating || !userInput.trim()}
                                    className={`w-full mt-4 py-4 rounded-2xl font-bold text-white-smoke transition-all flex items-center justify-center gap-2 ${isGenerating || !userInput.trim()
                                        ? 'bg-gray-300 cursor-not-allowed'
                                        : 'bg-accent hover:shadow-glow hover:scale-105 active:scale-100'
                                        }`}
                                >
                                    {isGenerating ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Generating Learning Materials...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-5 h-5" />
                                            Summarize with AI
                                        </>
                                    )}
                                </button>

                                <p className="text-xs text-gray-500 text-center mt-3">
                                    AI will generate summaries, mind maps, and podcasts at all depth levels
                                </p>
                            </div>
                        </motion.div>

                        {/* Feature Cards */}
                        <div className="grid grid-cols-3 gap-3">
                            <motion.button
                                onClick={() => {
                                    if (generatedContent) {
                                        setActiveTab('summary');
                                    } else {
                                        alert('💡 Smart Summaries Feature:\n\n• TL;DR - Get the essence in 3 lines\n• ELI5 - Child-friendly explanations\n• 3 Depth Levels (Simple, Normal, Deep)\n• Analogies & Real-world examples\n• Common mistakes to avoid\n\nPaste content above and click "Summarize with AI" to try it!');
                                    }
                                }}
                                whileHover={{ scale: 1.05, y: -5 }}
                                whileTap={{ scale: 0.95 }}
                                className="enhanced-card-mini card-glow-soft card-interactive card-animate-scale text-center"
                                style={{ borderRadius: '1rem' }}
                            >
                                <FileText className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                                <p className="text-xs font-semibold text-gray-800">Smart Summaries</p>
                                <p className="text-[10px] text-gray-500 mt-1">TL;DR + ELI5</p>
                            </motion.button>
                            <motion.button
                                onClick={() => {
                                    if (generatedContent) {
                                        setActiveTab('mindmap');
                                    } else {
                                        alert('🗺️ Mind Maps Feature:\n\n• Visual concept breakdown\n• Core concept with sub-topics\n• Interactive expandable nodes\n• Examples & Applications\n• Why & Where context\n\nPaste content above and click "Summarize with AI" to generate your mind map!');
                                    }
                                }}
                                whileHover={{ scale: 1.05, y: -5 }}
                                whileTap={{ scale: 0.95 }}
                                className="enhanced-card-mini card-glow-soft card-interactive card-animate-scale card-animate-stagger-1 text-center"
                                style={{ borderRadius: '1rem' }}
                            >
                                <Network className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                                <p className="text-xs font-semibold text-gray-800">Mind Maps</p>
                                <p className="text-[10px] text-gray-500 mt-1">Visual Learning</p>
                            </motion.button>
                            <motion.button
                                onClick={() => {
                                    if (generatedContent) {
                                        setActiveTab('podcast');
                                    } else {
                                        alert('🎧 Podcasts Feature:\n\n• Audio-friendly scripts\n• 3 Modes (Beginner, Normal, Deep)\n• Conversational explanations\n• Perfect for learning on-the-go\n• Play/Pause controls\n\nPaste content above and click "Summarize with AI" to create your podcast!');
                                    }
                                }}
                                whileHover={{ scale: 1.05, y: -5 }}
                                whileTap={{ scale: 0.95 }}
                                className="enhanced-card-mini card-glow-soft card-interactive card-animate-scale card-animate-stagger-2 text-center"
                                style={{ borderRadius: '1rem' }}
                            >
                                <Headphones className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                                <p className="text-xs font-semibold text-gray-800">Podcasts</p>
                                <p className="text-[10px] text-gray-500 mt-1">Audio Learning</p>
                            </motion.button>
                        </div>
                    </div>
                ) : (
                    /* Generated Content Display */
                    <div>
                        {/* Back Button */}
                        <div className="mb-4 flex items-center justify-between">
                            <button
                                onClick={() => setGeneratedContent(null)}
                                className="flex items-center gap-2 text-purple-600 font-medium hover:gap-3 transition-all"
                            >
                                <Plus className="w-4 h-4 rotate-45" />
                                New Learning Session
                            </button>
                        </div>

                        {/* Content Header */}
                        <div className="enhanced-card px-4 py-5" style={{ borderRadius: '1.5rem 1.5rem 0 0', borderBottom: '1px solid rgba(221, 221, 221, 0.6)' }}>
                            <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider mb-2">
                                Learning Topic
                            </p>
                            <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                                {generatedContent.userInput}
                            </p>

                            {/* Depth Level Selector */}
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-xs text-gray-500 font-medium">Depth:</span>
                                {(['Simple', 'Normal', 'Deep'] as DepthLevel[]).map((level) => (
                                    <button
                                        key={level}
                                        onClick={() => setDepthLevel(level)}
                                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${depthLevel === level
                                            ? `${getDepthColor(level)} text-white shadow-md`
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                    >
                                        {level === 'Simple' && <Baby className="w-3 h-3 inline mr-1" />}
                                        {level === 'Normal' && <GraduationCap className="w-3 h-3 inline mr-1" />}
                                        {level === 'Deep' && <Award className="w-3 h-3 inline mr-1" />}
                                        {level}
                                    </button>
                                ))}
                            </div>

                            {/* Content Type Tabs */}
                            <div className="flex gap-2 border-b border-gray-200">
                                {(['summary', 'mindmap', 'podcast'] as ContentType[]).map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`pb-3 px-4 text-sm font-medium transition-all relative ${activeTab === tab
                                            ? 'text-purple-600'
                                            : 'text-gray-500 hover:text-gray-700'
                                            }`}
                                    >
                                        {tab === 'summary' && <FileText className="w-4 h-4 inline mr-1" />}
                                        {tab === 'mindmap' && <Network className="w-4 h-4 inline mr-1" />}
                                        {tab === 'podcast' && <Headphones className="w-4 h-4 inline mr-1" />}
                                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                        {activeTab === tab && (
                                            <motion.div
                                                layoutId="activeTab"
                                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600"
                                            />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Content Body */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="enhanced-card px-4 py-6"
                                style={{ borderRadius: '0 0 1.5rem 1.5rem', borderTop: 'none' }}
                            >
                                {/* SUMMARY TAB */}
                                {activeTab === 'summary' && (
                                    <div className="space-y-6">
                                        {/* TL;DR */}
                                        <div className="enhanced-card-mini card-glow-purple" style={{ borderRadius: '1rem', background: 'linear-gradient(to bottom right, rgb(250, 245, 255), rgb(239, 246, 255))' }}>
                                            <div className="flex items-center gap-2 mb-3">
                                                <Zap className="w-5 h-5 text-purple-600" />
                                                <h3 className="font-bold text-gray-900">TL;DR</h3>
                                            </div>
                                            <p className="text-gray-800 leading-relaxed">
                                                {generatedContent.tldr}
                                            </p>
                                        </div>

                                        {/* ELI5 Toggle */}
                                        <button
                                            onClick={() => setShowELI5(!showELI5)}
                                            className="enhanced-card-mini card-glow-green card-interactive"
                                            style={{ borderRadius: '1rem', background: 'linear-gradient(to right, rgb(240, 253, 244), rgb(236, 253, 245))' }}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Baby className="w-5 h-5 text-green-600" />
                                                    <span className="font-semibold text-gray-900">
                                                        Explain Like I'm 5
                                                    </span>
                                                </div>
                                                {showELI5 ? (
                                                    <ChevronUp className="w-5 h-5 text-gray-600" />
                                                ) : (
                                                    <ChevronDown className="w-5 h-5 text-gray-600" />
                                                )}
                                            </div>
                                        </button>

                                        <AnimatePresence>
                                            {showELI5 && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="enhanced-card-mini"
                                                    style={{ borderRadius: '1rem' }}
                                                >
                                                    <p className="text-gray-800 leading-relaxed text-base">
                                                        {generatedContent.eli5}
                                                    </p>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        {/* Depth-Based Content */}
                                        <div className="enhanced-card-mini" style={{ borderRadius: '1rem' }}>
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-2">
                                                    <Layers className="w-5 h-5 text-blue-600" />
                                                    <h3 className="font-bold text-gray-900">
                                                        {depthLevel} Explanation
                                                    </h3>
                                                </div>
                                                <div className="flex items-center gap-3 text-xs text-gray-500">
                                                    <span className="flex items-center gap-1">
                                                        <BookMarked className="w-3.5 h-3.5" />
                                                        {getWordCount(getCurrentSummary()).toLocaleString()} words
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Target className="w-3.5 h-3.5" />
                                                        {getReadingTime(getCurrentSummary())}
                                                    </span>
                                                </div>
                                            </div>
                                            <p className="text-gray-800 leading-relaxed whitespace-pre-line">
                                                {depthLevel === 'Simple' && generatedContent.simple}
                                                {depthLevel === 'Normal' && generatedContent.normal}
                                                {depthLevel === 'Deep' && generatedContent.deep}
                                            </p>
                                        </div>

                                        {/* Analogy */}
                                        <div className="enhanced-card-mini card-glow-yellow" style={{ borderRadius: '1rem', background: 'linear-gradient(to bottom right, rgb(254, 252, 232), rgb(255, 247, 237))' }}>
                                            <div className="flex items-center gap-2 mb-3">
                                                <Lightbulb className="w-5 h-5 text-orange-600" />
                                                <h3 className="font-bold text-gray-900">Simple Analogy</h3>
                                            </div>
                                            <p className="text-gray-800 leading-relaxed italic">
                                                "{generatedContent.analogy}"
                                            </p>
                                        </div>

                                        {/* Real World Example */}
                                        <div className="enhanced-card-mini card-glow-blue" style={{ borderRadius: '1rem' }}>
                                            <div className="flex items-center gap-2 mb-3">
                                                <Target className="w-5 h-5 text-blue-600" />
                                                <h3 className="font-bold text-gray-900">Real-World Use</h3>
                                            </div>
                                            <p className="text-gray-800 leading-relaxed">
                                                {generatedContent.realWorldExample}
                                            </p>
                                        </div>

                                        {/* Common Mistakes */}
                                        <div className="bg-red-50 rounded-2xl p-5 border border-red-200">
                                            <div className="flex items-center gap-2 mb-3">
                                                <AlertCircle className="w-5 h-5 text-red-600" />
                                                <h3 className="font-bold text-gray-900">Common Mistakes</h3>
                                            </div>
                                            <ul className="space-y-2">
                                                {generatedContent.commonMistakes.map((mistake, idx) => (
                                                    <li key={idx} className="flex items-start gap-2 text-gray-800">
                                                        <span className="text-red-500 mt-1">•</span>
                                                        <span>{mistake}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        {/* Key Takeaways */}
                                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-200">
                                            <div className="flex items-center gap-2 mb-3">
                                                <Check className="w-5 h-5 text-blue-600" />
                                                <h3 className="font-bold text-gray-900">Key Takeaways</h3>
                                            </div>
                                            <ul className="space-y-2">
                                                {generatedContent.keyTakeaways.map((takeaway, idx) => (
                                                    <li key={idx} className="flex items-start gap-2 text-gray-800">
                                                        <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-1" />
                                                        <span>{takeaway}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        {/* Related Concepts */}
                                        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
                                            <div className="flex items-center gap-2 mb-3">
                                                <Link2 className="w-5 h-5 text-purple-600" />
                                                <h3 className="font-bold text-gray-900">Related Concepts</h3>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {generatedContent.relatedConcepts.map((concept, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full text-sm font-medium border border-purple-200"
                                                    >
                                                        {concept}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* MIND MAP TAB */}
                                {activeTab === 'mindmap' && (
                                    <div className="space-y-6">
                                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-5 border border-purple-200">
                                            <div className="flex items-center gap-2 mb-4">
                                                <Map className="w-5 h-5 text-purple-600" />
                                                <h3 className="font-bold text-gray-900">Concept Map</h3>
                                            </div>

                                            {/* Core Concept */}
                                            <div className="bg-white rounded-xl p-4 shadow-md border-2 border-purple-500 mb-6">
                                                <h4 className="font-bold text-lg text-purple-900 text-center">
                                                    {generatedContent.mindMap.core}
                                                </h4>
                                            </div>

                                            {/* Why & Where */}
                                            <div className="grid grid-cols-1 gap-4 mb-6">
                                                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                                                    <h5 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                                                        <MessageCircle className="w-4 h-4" />
                                                        Why does it exist?
                                                    </h5>
                                                    <p className="text-blue-800 text-sm">
                                                        {generatedContent.mindMap.why}
                                                    </p>
                                                </div>
                                                <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                                                    <h5 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                                                        <Target className="w-4 h-4" />
                                                        Where is it used?
                                                    </h5>
                                                    <p className="text-green-800 text-sm">
                                                        {generatedContent.mindMap.where}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Sub-concepts */}
                                            <div className="space-y-3">
                                                {generatedContent.mindMap.children.map((child, idx) => (
                                                    <div key={idx} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                                        <button
                                                            onClick={() => toggleMindMapNode(idx)}
                                                            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                                                        >
                                                            <span className="font-semibold text-gray-900">
                                                                {child.concept}
                                                            </span>
                                                            {expandedMindMapNodes.includes(idx) ? (
                                                                <ChevronUp className="w-5 h-5 text-gray-600" />
                                                            ) : (
                                                                <ChevronDown className="w-5 h-5 text-gray-600" />
                                                            )}
                                                        </button>

                                                        <AnimatePresence>
                                                            {expandedMindMapNodes.includes(idx) && (
                                                                <motion.div
                                                                    initial={{ opacity: 0, height: 0 }}
                                                                    animate={{ opacity: 1, height: 'auto' }}
                                                                    exit={{ opacity: 0, height: 0 }}
                                                                    className="px-4 pb-4 space-y-3"
                                                                >
                                                                    <div>
                                                                        <h6 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                                                                            Examples
                                                                        </h6>
                                                                        <div className="flex flex-wrap gap-2">
                                                                            {child.examples.map((ex, i) => (
                                                                                <span
                                                                                    key={i}
                                                                                    className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs"
                                                                                >
                                                                                    {ex}
                                                                                </span>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                    <div>
                                                                        <h6 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                                                                            Applications
                                                                        </h6>
                                                                        <div className="flex flex-wrap gap-2">
                                                                            {child.applications.map((app, i) => (
                                                                                <span
                                                                                    key={i}
                                                                                    className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs"
                                                                                >
                                                                                    {app}
                                                                                </span>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* PODCAST TAB */}
                                {activeTab === 'podcast' && (
                                    <div className="space-y-6">
                                        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-200">
                                            <div className="flex items-center justify-between mb-6">
                                                <div className="flex items-center gap-2">
                                                    <Headphones className="w-6 h-6 text-indigo-600" />
                                                    <h3 className="font-bold text-gray-900">Audio Learning</h3>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => setIsMuted(!isMuted)}
                                                        className="p-2 hover:bg-white/50 rounded-full transition-colors"
                                                    >
                                                        {isMuted ? (
                                                            <VolumeX className="w-5 h-5 text-gray-600" />
                                                        ) : (
                                                            <Volume2 className="w-5 h-5 text-gray-600" />
                                                        )}
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Play/Pause Button */}
                                            <button
                                                onClick={handlePodcastToggle}
                                                className={`w-full p-6 rounded-xl shadow-lg transition-all mb-6 ${isPlaying
                                                    ? 'bg-gradient-to-r from-purple-600 to-pink-600'
                                                    : 'bg-gradient-to-r from-indigo-600 to-purple-600'
                                                    }`}
                                            >
                                                <div className="flex items-center justify-center gap-3">
                                                    {isPlaying ? (
                                                        <Pause className="w-8 h-8 text-white" />
                                                    ) : (
                                                        <Play className="w-8 h-8 text-white ml-1" />
                                                    )}
                                                    <span className="text-white font-bold text-lg">
                                                        {isPlaying ? 'Pause' : 'Start Listening'}
                                                    </span>
                                                </div>
                                            </button>

                                            {/* Script Content */}
                                            <div className="bg-white rounded-xl p-5 border border-gray-200">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`} />
                                                        <span className="text-sm font-medium text-gray-600">
                                                            {depthLevel} Mode Podcast
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-3 text-xs text-gray-500">
                                                        <span className="flex items-center gap-1">
                                                            <BookMarked className="w-3.5 h-3.5" />
                                                            {getWordCount(getCurrentPodcast()).toLocaleString()} words
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Headphones className="w-3.5 h-3.5" />
                                                            {getListeningTime(getCurrentPodcast())} listen
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                                                    <p className="text-gray-800 leading-relaxed whitespace-pre-line">
                                                        {depthLevel === 'Simple' && generatedContent.podcastScript.beginner}
                                                        {depthLevel === 'Normal' && generatedContent.podcastScript.normal}
                                                        {depthLevel === 'Deep' && generatedContent.podcastScript.deep}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Calm Learning Note */}
                                            <div className="mt-4 flex items-start gap-2 text-xs text-indigo-600">
                                                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                                <p>
                                                    Take your time. Learning is not a race. You can replay this as many times as you need.
                                                </p>
                                            </div>
                                        </div>

                                        {/* Understanding Check */}
                                        <div className="bg-white rounded-2xl p-5 border border-gray-200">
                                            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                                <MessageCircle className="w-5 h-5 text-purple-600" />
                                                Does this make sense?
                                            </h4>
                                            <div className="grid grid-cols-2 gap-2">
                                                <button className="p-3 bg-green-50 text-green-700 rounded-xl font-medium hover:bg-green-100 transition-colors border border-green-200">
                                                    Yes, got it!
                                                </button>
                                                <button className="p-3 bg-yellow-50 text-yellow-700 rounded-xl font-medium hover:bg-yellow-100 transition-colors border border-yellow-200">
                                                    Need simpler
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LearningSection;
