import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Trash2, X,
    Youtube, Globe, FileText,
    ArrowLeft, Search, Plus, ChevronRight, MessageCircle,
    Sparkles
} from 'lucide-react';
import { generateOpenAIContent } from '../services/openaiService';
import { useContentProtection } from '../contexts/ContentProtectionContext';
import { checkUrl } from '../services/contentFilter';

const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

interface LearningSource {
    id: number;
    title: string;
    type: 'video' | 'article' | 'doc';
    icon: React.ElementType;
    summary: string;
    date: string;
    url: string;
    userNotes: string;
    thumbnail: string | null;
    concepts: string[];
}

const AINotebook: React.FC = () => {
    const navigate = useNavigate();
    const { settings, logBlockedAttempt } = useContentProtection();
    const [isAddingSource, setIsAddingSource] = useState(false);
    const [playingVideoId, setPlayingVideoId] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Form State
    const [sourceTitle, setSourceTitle] = useState('');
    const [sourceLink, setSourceLink] = useState('');
    const [sourceText, setSourceText] = useState('');
    const [sourceNotes, setSourceNotes] = useState('');
    const [sourceConcepts, setSourceConcepts] = useState('');
    const [isEnriching, setIsEnriching] = useState(false);

    const [sources, setSources] = useState<LearningSource[]>([]);

    const handleAddSource = () => {
        if (!sourceTitle || (!sourceText && !sourceLink)) {
            alert("Please provide at least a title and some content or a link.");
            return;
        }

        // Content Protection Check
        if (sourceLink && settings.protectionLevel !== 'off') {
            const protectionResult = checkUrl(sourceLink, settings.protectionLevel, settings.customBlockedDomains);
            if (protectionResult.blocked) {
                alert(`Access Blocked: ${protectionResult.reason}`);
                logBlockedAttempt(sourceLink, undefined, protectionResult.reason);
                return;
            }
        }

        const youtubeId = getYouTubeId(sourceLink);
        const newId = Date.now();
        const newSource: LearningSource = {
            id: newId,
            title: sourceTitle,
            type: youtubeId ? 'video' : (sourceLink ? 'article' : 'doc'),
            icon: youtubeId ? Youtube : (sourceLink ? Globe : FileText),
            summary: sourceNotes || sourceText.substring(0, 100) + '...',
            date: 'Just now',
            url: sourceLink,
            userNotes: sourceNotes,
            thumbnail: youtubeId ? `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg` : null,
            concepts: sourceConcepts.split(',').map(c => c.trim()).filter(c => c !== '')
        };

        setSources([newSource, ...sources]);
        setIsAddingSource(false);

        // Clear form
        setSourceTitle('');
        setSourceLink('');
        setSourceText('');
        setSourceNotes('');
        setSourceConcepts('');
    };

    const handleAIEnrich = async () => {
        if (!sourceText.trim()) {
            alert("Please paste some content first to use AI Enrichment.");
            return;
        }

        setIsEnriching(true);
        try {
            const prompt = `Analyze the following content and provide:
            1. A concise, catchy title (max 6 words).
            2. A 2-sentence executive summary.
            3. Key concepts (3-5 keywords, comma-separated).
            
            CONTENT:
            ${sourceText.substring(0, 3000)}
            
            Return ONLY a JSON object with: "title", "summary", "concepts".`;

            const response = await generateOpenAIContent(prompt);
            const cleanedResponse = response?.replace(/```json|```/g, '').trim();
            const data = JSON.parse(cleanedResponse || '{}');

            if (data.title) setSourceTitle(data.title);
            if (data.summary) setSourceNotes(data.summary);
            if (data.concepts) setSourceConcepts(data.concepts);
        } catch (error) {
            console.error("AI Enrich Error:", error);
            alert("AI Enrichment failed. Please check your API key.");
        } finally {
            setIsEnriching(false);
        }
    };

    const handleDeleteSource = (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm("Are you sure you want to delete this source?")) {
            setSources(sources.filter(s => s.id !== id));
            if (playingVideoId === id) setPlayingVideoId(null);
        }
    };

    return (
        <div className="ai-section min-h-screen bg-[#F5F5F5] font-sans antialiased text-[#333333] flex justify-center">
            <div className="w-full max-w-2xl min-h-screen bg-[#F5F5F5] relative flex flex-col pb-24">
                {/* Sticky Header */}
                <div className="sticky top-0 z-30 bg-[#F5F5F5]/90 backdrop-blur-md border-b border-[#CCCCCC]/50">
                    <header className="px-6 pt-12 pb-6 flex flex-col gap-6">
                        <div className="flex justify-between items-start">
                            <button
                                onClick={() => navigate('/section/ai')}
                                className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-[#333333] border border-[#CCCCCC] hover:bg-[#DDDDDD] transition-all"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <div className="text-right">
                                <h1 className="text-4xl font-black tracking-tighter text-[#000000] italic mb-1">Notebook</h1>
                                <p className="text-[#CCCCCC] text-[10px] font-black uppercase tracking-[0.2em]">Learning Library</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3 border border-[#CCCCCC] shadow-sm transition-all focus-within:ring-2 focus-within:ring-[#847777]/20 focus-within:border-[#847777]">
                            <Search className="w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search your library..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="flex-1 bg-transparent border-none text-sm font-medium outline-none placeholder:text-gray-400"
                            />
                        </div>
                    </header>
                </div>

                <main className="px-6 flex-1">
                    <div className="space-y-6">
                        {/* Input CTA */}
                        <div
                            onClick={() => setIsAddingSource(true)}
                            className="bg-white p-4 rounded-[2rem] border-2 border-dashed border-[#CCCCCC] mb-8 flex items-center gap-3 cursor-pointer hover:border-[#847777] transition-all group"
                        >
                            <div className="flex-1 px-4 text-[#CCCCCC] text-xs font-bold uppercase tracking-widest group-hover:text-[#847777]">
                                Add YouTube Video or Document...
                            </div>
                            <div className="bg-gradient-to-r from-[#847777] to-[#5a4f4f] text-white p-3 rounded-2xl shadow-lg shadow-[#847777]/30 group-hover:scale-105 transition-transform">
                                <Plus className="w-5 h-5" />
                            </div>
                        </div>

                        {/* Source List */}
                        {sources.filter(s =>
                            s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            s.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            s.concepts.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()))
                        ).length === 0 && (
                                <div className="text-center py-12 text-gray-400">
                                    <p className="text-sm font-medium">No results found for "{searchQuery}".</p>
                                </div>
                            )}
                        {sources
                            .filter(s =>
                                s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                s.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                s.concepts.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()))
                            )
                            .map(source => (
                                <div
                                    key={source.id}
                                    className="group bg-white rounded-[2.5rem] p-7 shadow-sm border border-[#CCCCCC] transition-all relative overflow-hidden hover:border-[#847777]"
                                >
                                    <button
                                        onClick={(e) => handleDeleteSource(source.id, e)}
                                        className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center text-gray-600 hover:bg-rose-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                                        title="Delete Source"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>

                                    {source.thumbnail ? (
                                        <div
                                            className="h-48 -mx-7 -mt-7 mb-6 relative overflow-hidden group-hover:opacity-95 transition-all group/thumb bg-black cursor-pointer"
                                            onClick={() => {
                                                if (!source.url) return;

                                                // Content Protection Check
                                                if (settings.protectionLevel !== 'off') {
                                                    const protectionResult = checkUrl(source.url, settings.protectionLevel, settings.customBlockedDomains);
                                                    if (protectionResult.blocked) {
                                                        alert(`Access Blocked: ${protectionResult.reason}`);
                                                        logBlockedAttempt(source.url, undefined, protectionResult.reason);
                                                        return;
                                                    }
                                                }

                                                if (source.url.includes('youtube.com') || source.url.includes('youtu.be')) {
                                                    setPlayingVideoId(source.id);
                                                } else {
                                                    window.open(source.url, '_blank');
                                                }
                                            }}
                                        >
                                            {playingVideoId === source.id ? (
                                                <iframe
                                                    width="100%"
                                                    height="100%"
                                                    src={`https://www.youtube.com/embed/${getYouTubeId(source.url)}?autoplay=1`}
                                                    title={source.title}
                                                    frameBorder="0"
                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                    allowFullScreen
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <>
                                                    <img src={source.thumbnail} alt={source.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-opacity">
                                                        <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/40 shadow-2xl scale-75 group-hover/thumb:scale-100 transition-transform duration-300">
                                                            <Youtube className="w-8 h-8 fill-white" />
                                                        </div>
                                                    </div>
                                                    <div className="absolute top-4 left-4 bg-[#847777] text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1 shadow-lg shadow-[#847777]/20">
                                                        <Youtube className="w-3 h-3" /> Watch Now
                                                    </div>
                                                    <div className="absolute bottom-4 left-7 text-[10px] font-black text-white/95 uppercase tracking-widest">
                                                        {source.date}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="w-12 h-12 rounded-2xl bg-[#DDDDDD] flex items-center justify-center text-[#333333] group-hover:bg-[#847777]/20 group-hover:text-[#847777] transition-colors">
                                                <source.icon className="w-6 h-6" />
                                            </div>
                                            <div className="text-[10px] font-black text-[#CCCCCC] uppercase tracking-widest mt-2">{source.date}</div>
                                        </div>
                                    )}
                                    <h3 className="text-xl font-black text-[#000000] mb-3 leading-tight group-hover:text-[#847777] transition-colors italic tracking-tight">{source.title}</h3>
                                    <p className="text-sm text-gray-500 font-medium mb-6 line-clamp-2 leading-relaxed">
                                        {source.summary}
                                    </p>
                                    {source.concepts.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mb-6">
                                            {source.concepts.map((concept: string) => (
                                                <span key={concept} className="px-3 py-1 bg-[#DDDDDD] rounded-lg text-[9px] font-bold text-[#333333] uppercase tracking-widest transition-colors group-hover:bg-[#847777]/20 group-hover:text-[#847777]">
                                                    {concept}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                    {source.url && (
                                        <button
                                            onClick={() => {
                                                if (settings.protectionLevel !== 'off') {
                                                    const protectionResult = checkUrl(source.url, settings.protectionLevel, settings.customBlockedDomains);
                                                    if (protectionResult.blocked) {
                                                        alert(`Access Blocked: ${protectionResult.reason}`);
                                                        logBlockedAttempt(source.url, undefined, protectionResult.reason);
                                                        return;
                                                    }
                                                }
                                                window.open(source.url, '_blank');
                                            }}
                                            className="w-full py-4 bg-[#DDDDDD] text-[#000000] rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#847777] hover:text-white transition-all flex items-center justify-center gap-2"
                                        >
                                            Open Source <ChevronRight className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                    </div>
                </main>

                {/* Modal for Adding Source */}
                <AnimatePresence>
                    {isAddingSource && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsAddingSource(false)}
                                className="absolute inset-0 bg-[#333333]/60 backdrop-blur-xl"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 30 }}
                                className="bg-white w-full max-w-[440px] rounded-[3rem] shadow-[0_35px_70px_-15px_rgba(0,0,0,0.15)] border border-[#CCCCCC] relative z-[110] overflow-hidden flex flex-col max-h-[90vh]"
                            >
                                {/* Modal Header */}
                                <div className="px-8 pt-10 pb-6 flex justify-between items-start sticky top-0 bg-white/80 backdrop-blur-md z-10 border-b border-[#CCCCCC]/30 mb-8">
                                    <div>
                                        <h2 className="text-[#000000] text-3xl font-black tracking-tighter mb-1 italic">New Source</h2>
                                        <p className="text-[#847777] text-[10px] font-black uppercase tracking-[0.2em] italic opacity-80">Layer 3: Knowledge Library</p>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Sparkles className="w-5 h-5 text-indigo-500" />
                                            <button
                                                onClick={handleAIEnrich}
                                                disabled={isEnriching || !sourceText.trim()}
                                                className="text-[10px] font-black uppercase text-indigo-500 tracking-widest hover:text-indigo-700 disabled:opacity-30"
                                            >
                                                {isEnriching ? 'Synthesizing...' : 'AI Enrich'}
                                            </button>
                                        </div>
                                        <button
                                            onClick={() => setIsAddingSource(false)}
                                            className="w-10 h-10 rounded-full bg-white border border-[#CCCCCC] flex items-center justify-center text-[#333333] hover:bg-[#F5F5F5] transition-all shadow-sm"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto px-8 pb-32 no-scrollbar space-y-8">
                                    <div className="flex flex-col gap-2.5">
                                        <label className="text-[#333333] text-[11px] font-black uppercase tracking-widest px-1 opacity-60">
                                            Title
                                        </label>
                                        <input
                                            value={sourceTitle}
                                            onChange={(e) => setSourceTitle(e.target.value)}
                                            className="w-full h-14 bg-[#F5F5F5] border border-[#CCCCCC] rounded-2xl px-5 text-[#1A1A1A] placeholder:text-[#CCCCCC] placeholder:text-sm focus:ring-2 focus:ring-[#847777] focus:border-transparent transition-all text-sm font-medium outline-none italic"
                                            placeholder="e.g. Deep Learning Paper Summary"
                                            type="text"
                                        />
                                    </div>

                                    <div className="flex flex-col gap-2.5">
                                        <label className="text-[#333333] text-[11px] font-black uppercase tracking-widest px-1 opacity-60">
                                            Link (Optional)
                                        </label>
                                        <div className="relative group">
                                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#CCCCCC] transition-colors group-focus-within:text-[#847777]">
                                                <Globe className="w-4 h-4" />
                                            </div>
                                            <input
                                                value={sourceLink}
                                                onChange={(e) => setSourceLink(e.target.value)}
                                                className="w-full h-14 bg-[#F5F5F5] border border-[#CCCCCC] rounded-2xl pl-12 pr-5 text-[#1A1A1A] placeholder:text-[#CCCCCC] placeholder:text-sm focus:ring-2 focus:ring-[#847777] focus:border-transparent transition-all text-sm font-medium outline-none italic"
                                                placeholder="https://..."
                                                type="url"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2.5">
                                        <label className="text-[#333333] text-[11px] font-black uppercase tracking-widest px-1 opacity-60">
                                            Content / Transcript
                                        </label>
                                        <textarea
                                            value={sourceText}
                                            onChange={(e) => setSourceText(e.target.value)}
                                            className="w-full min-h-[120px] bg-[#F5F5F5] border border-[#CCCCCC] rounded-2xl p-5 text-[#1A1A1A] placeholder:text-[#CCCCCC] placeholder:text-sm focus:ring-2 focus:ring-[#847777] focus:border-transparent transition-all text-sm leading-relaxed resize-none font-medium outline-none italic"
                                            placeholder="Paste content here..."
                                        />
                                    </div>

                                    <div className="flex flex-col gap-2.5">
                                        <label className="text-[#333333] text-[11px] font-black uppercase tracking-widest px-1 opacity-60">
                                            Concepts (comma separated)
                                        </label>
                                        <input
                                            value={sourceConcepts}
                                            onChange={(e) => setSourceConcepts(e.target.value)}
                                            className="w-full h-14 bg-[#F5F5F5] border border-[#CCCCCC] rounded-2xl px-5 text-[#1A1A1A] placeholder:text-[#CCCCCC] placeholder:text-sm focus:ring-2 focus:ring-[#847777] focus:border-transparent transition-all text-sm font-medium outline-none italic"
                                            placeholder="e.g. AI, Math, Physics"
                                            type="text"
                                        />
                                    </div>

                                    <div className="flex flex-col gap-2.5">
                                        <label className="text-[#333333] text-[11px] font-black uppercase tracking-widest px-1 opacity-60">
                                            Personal Notes
                                        </label>
                                        <div className="relative group">
                                            <div className="absolute left-5 top-5 text-[#CCCCCC] transition-colors group-focus-within:text-[#847777]">
                                                <MessageCircle className="w-4 h-4" />
                                            </div>
                                            <textarea
                                                value={sourceNotes}
                                                onChange={(e) => setSourceNotes(e.target.value)}
                                                className="w-full min-h-[120px] bg-[#F5F5F5] border border-[#CCCCCC] rounded-2xl pt-5 pb-5 pl-12 pr-5 text-[#1A1A1A] placeholder:text-[#CCCCCC] placeholder:text-sm focus:ring-2 focus:ring-[#847777] focus:border-transparent transition-all text-sm leading-relaxed resize-none font-medium outline-none italic"
                                                placeholder="What did you learn?"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Fixed Footer - Clean Design */}
                                <div className="sticky bottom-0 left-0 right-0 p-6 bg-white border-t border-[#CCCCCC]/30 z-20">
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={() => setIsAddingSource(false)}
                                            className="flex-1 bg-[#DDDDDD] text-[#333333] rounded-2xl py-4 px-6 font-black text-[10px] uppercase tracking-widest hover:bg-[#CCCCCC] transition-all active:scale-[0.98]"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleAddSource}
                                            disabled={!sourceTitle || (!sourceText && !sourceLink)}
                                            className="flex-1 bg-gradient-to-r from-[#847777] to-[#5a4f4f] text-white rounded-2xl py-4 px-6 font-black text-[10px] uppercase tracking-widest shadow-lg shadow-[#847777]/20 transition-all active:scale-[0.98] disabled:opacity-40 disabled:grayscale hover:opacity-90"
                                        >
                                            Initialize Knowledge
                                        </button>
                                    </div>
                                </div>

                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default AINotebook;
