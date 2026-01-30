import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Search, Plus, Zap, Loader2, X, Trash2,
    Star, Copy, ChevronDown, Wand2
} from 'lucide-react';
import { fetchPrompts, createPrompt, deleteNotionPage } from '../services/notionService';
import { motion, AnimatePresence } from 'framer-motion';

interface PromptAsset {
    id: string;
    title: string;
    category: string;
    desc: string;
    content: string;
    variables: string[];
    tags: string[];
}

const AIPromptLibrary: React.FC = () => {
    const navigate = useNavigate();
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedPrompt, setSelectedPrompt] = useState<PromptAsset | null>(null);
    const [isAddingPrompt, setIsAddingPrompt] = useState(false);

    // Form State
    const [newPromptTitle, setNewPromptTitle] = useState('');
    const [newPromptCategory, setNewPromptCategory] = useState('Productivity');
    const [newPromptPurpose, setNewPromptPurpose] = useState('');
    const [newPromptContent, setNewPromptContent] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const [prompts, setPrompts] = useState<PromptAsset[]>([]);
    const [loading, setLoading] = useState(true);
    const [customCategoryName, setCustomCategoryName] = useState('');
    const [showCustomInput, setShowCustomInput] = useState(false);

    // Derived Categories
    const [dynamicCategories, setDynamicCategories] = useState<string[]>(['All', 'Productivity', 'Development', 'Marketing', 'Animations', '3D']);

    useEffect(() => {
        if (isAddingPrompt) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isAddingPrompt]);

    useEffect(() => {
        loadPrompts();
    }, []);

    const loadPrompts = async () => {
        setLoading(true);
        try {
            const data = await fetchPrompts();
            setPrompts(data);

            // Update dynamic categories based on actual data
            const existingCats = Array.from(new Set(data.map((p: PromptAsset) => p.category))).filter(Boolean);
            const baseCats = ['All', 'Productivity', 'Development', 'Marketing', 'Animations', '3D'];
            const merged = Array.from(new Set([...baseCats, ...existingCats as string[]]));
            setDynamicCategories(merged);
        } catch (error) {
            console.error("Failed to load prompts", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSavePrompt = async () => {
        if (!newPromptTitle || !newPromptContent) return;
        const finalCategory = showCustomInput ? customCategoryName : newPromptCategory;
        if (!finalCategory) {
            alert("Please provide a category");
            return;
        }

        setIsSaving(true);
        try {
            await createPrompt({
                title: newPromptTitle,
                category: finalCategory,
                purpose: newPromptPurpose,
                content: newPromptContent,
                tags: ['User Created']
            });
            // Reset and reload
            setIsAddingPrompt(false);
            setNewPromptTitle('');
            setNewPromptPurpose('');
            setNewPromptContent('');
            setCustomCategoryName('');
            setShowCustomInput(false);
            await loadPrompts();
            alert("Success! Prompt saved to your AI Wallet.");
        } catch (error: unknown) {
            const err = error as Error;
            console.error("Critical Failure in handleSavePrompt:", err);
            alert(`Neural Link Error: ${err.message} `);
        } finally {
            setIsSaving(false);
        }
    };

    const formatVariables = () => {
        if (!newPromptContent) return;
        // Convert any [VAR] to {{VAR}} as requested for high precision
        const formatted = newPromptContent.replace(/\[(.*?)\]/g, '{{$1}}');
        setNewPromptContent(formatted);
    };

    const handleDeletePrompt = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (!window.confirm("Restore to archive? This asset will be moved out of your active library.")) return;
        try {
            await deleteNotionPage(id);
            await loadPrompts();
        } catch (error) {
            console.error("Failed to delete prompt", error);
            alert("Terminal Error: Could not archive from Notion. See console for details.");
        }
    };

    const filteredPrompts = selectedCategory === 'All'
        ? prompts
        : prompts.filter(p => p.category === selectedCategory);

    return (
        <div className="ai-section min-h-screen bg-[#F5F5F5] text-[#333333] font-sans antialiased transition-colors duration-300 flex justify-center">
            <div className="w-full max-w-md min-h-screen relative flex flex-col pb-24">
                {/* Sticky Header & Categories Group */}
                <div className="sticky top-0 z-30 bg-[#F5F5F5]/90 backdrop-blur-md pb-4 pt-4 -mt-4">
                    <header className="px-6 pt-12 pb-4">
                        <div className="flex justify-between items-center mb-6">
                            <button
                                onClick={() => navigate(-1)}
                                className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm border border-[#CCCCCC] text-[#333333] hover:bg-[#DDDDDD] transition"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <div className="flex space-x-3">
                                <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm border border-[#CCCCCC] text-[#333333] hover:bg-[#DDDDDD] transition">
                                    <Search className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => navigate('/ai/wallet')}
                                    className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-r from-[#847777] to-[#5a4f4f] shadow-lg shadow-[#847777]/30 text-white border border-[#847777]"
                                >
                                    <Star className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <h1 className="text-4xl font-black tracking-tighter mb-1 italic text-[#000000]">Vault</h1>
                            <span className="text-[10px] font-black text-[#847777] uppercase tracking-widest italic opacity-80">OS v2</span>
                        </div>
                        <p className="text-[#847777] text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Prompt Operating System</p>
                    </header>

                    {/* Categories */}
                    <div className="px-6">
                        <div className="flex space-x-4 overflow-x-auto no-scrollbar pb-4 border-b border-[#CCCCCC]">
                            {dynamicCategories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`flex-1 px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap min-w-[100px] ${selectedCategory === cat
                                        ? 'bg-gradient-to-r from-[#847777] to-[#5a4f4f] text-white shadow-lg shadow-[#847777]/30'
                                        : 'bg-white border border-[#CCCCCC] text-[#333333]/40 hover:text-[#333333] hover:border-[#847777]'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Prompt Cards */}
                <main className="flex-1 px-6 space-y-4">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center p-12 opacity-50">
                            <Loader2 className="w-8 h-8 animate-spin text-[#847777] mb-2" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-[#CCCCCC]">Syncing with Notion...</p>
                        </div>
                    ) : filteredPrompts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-[#CCCCCC] rounded-[2.5rem] opacity-50">
                            <p className="text-[10px] font-black uppercase tracking-widest text-[#CCCCCC]">No prompts found</p>
                        </div>
                    ) : (
                        filteredPrompts.map((prompt, index) => (
                            <div
                                key={prompt.id}
                                onClick={() => setSelectedPrompt(prompt)}
                                className={`enhanced-card card-interactive relative group overflow-hidden card-animate-fade card-animate-stagger-${Math.min(index + 1, 6)}`}
                                style={{ borderRadius: '2.5rem' }}
                            >
                                <div className="absolute top-0 right-0 w-24 h-24 bg-[#F5F5F5] rounded-bl-full -mr-4 -mt-4 opacity-50 group-hover:bg-[#847777]/10 transition-colors border-l border-b border-[#CCCCCC]/30"></div>

                                <div className="flex justify-between items-start mb-4 relative z-10">
                                    <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.1em] border ${prompt.category === 'Development' ? 'bg-[#F5F5F5] text-[#333333] border-[#CCCCCC]' :
                                        prompt.category === 'Marketing' ? 'bg-[#F5F5F5] text-[#847777] border-[#847777]/30' :
                                            'bg-[#F5F5F5] text-[#333333] border-[#CCCCCC]'
                                        } `}>
                                        {prompt.category}
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={(e) => handleDeletePrompt(e, prompt.id)}
                                            className="p-2 bg-[#F5F5F5] border border-[#CCCCCC] rounded-xl text-[#CCCCCC] hover:text-red-500 hover:border-red-100 transition-all"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(prompt.content); alert('Copied!'); }}
                                            className="p-2 bg-[#F5F5F5] border border-[#CCCCCC] rounded-xl text-[#333333] hover:text-[#847777] hover:border-[#847777] transition-colors"
                                        >
                                            <Copy className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <h3 className="text-xl font-black text-[#000000] mb-2 leading-tight pr-8 italic tracking-tight group-hover:text-[#847777] transition-colors">{prompt.title}</h3>
                                <p className="text-xs text-[#CCCCCC] mb-4 line-clamp-2 leading-relaxed">{prompt.desc}</p>

                                <div className="flex items-center gap-4 pt-4 border-t border-[#F5F5F5] overflow-x-auto no-scrollbar">
                                    {prompt.tags.map((tag: string) => (
                                        <span key={tag} className="text-[10px] font-bold text-[#CCCCCC] uppercase tracking-widest shrink-0 border border-[#CCCCCC]/20 px-2 py-0.5 rounded-md italic">#{tag}</span>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </main>

                {/* Detail View / Modal */}
                <AnimatePresence>
                    {selectedPrompt && (
                        <div className="fixed inset-0 z-[60] flex items-end justify-center px-4 pb-4 bg-[#333333]/60 backdrop-blur-sm">
                            <motion.div
                                initial={{ y: '100%' }}
                                animate={{ y: 0 }}
                                exit={{ y: '100%' }}
                                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                className="w-full max-w-md bg-white rounded-[3rem] p-8 shadow-2xl relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-[#F5F5F5] rounded-bl-full -mr-8 -mt-8 opacity-50 border-l border-b border-[#CCCCCC]/30 pointer-events-none"></div>

                                <div className="flex justify-between items-start mb-8 relative z-10">
                                    <div className="p-3 bg-[#F5F5F5] border border-[#CCCCCC] rounded-2xl">
                                        <Zap className="w-6 h-6 text-[#847777]" />
                                    </div>
                                    <button
                                        onClick={() => setSelectedPrompt(null)}
                                        className="p-2 bg-[#F5F5F5] border border-[#CCCCCC] rounded-full text-[#333333] hover:text-[#000000] transition"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <h2 className="text-3xl font-black text-[#000000] mb-2 italic tracking-tighter">{selectedPrompt.title}</h2>
                                <div className="flex gap-2 mb-6">
                                    {selectedPrompt.tags.map((t: string) => (
                                        <span key={t} className="px-2 py-1 bg-[#F5F5F5] border border-[#CCCCCC] rounded-lg text-[9px] font-black uppercase text-[#333333] tracking-widest">{t}</span>
                                    ))}
                                </div>

                                <div className="bg-[#F5F5F5] rounded-3xl p-6 mb-8 border border-[#CCCCCC]">
                                    <p className="text-sm font-medium text-[#333333] leading-relaxed mb-4 italic">"{selectedPrompt.content}"</p>
                                    <div className="pt-4 border-t border-[#CCCCCC]">
                                        <p className="text-[10px] font-black text-[#CCCCCC] uppercase tracking-widest mb-3 italic">Variables Identified:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedPrompt.variables.map((v: string) => (
                                                <code key={v} className="bg-white px-2 py-1 rounded-lg border border-[#CCCCCC] text-[#847777] text-[10px] font-black">{v}</code>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 relative z-10">
                                    <button
                                        onClick={() => { navigator.clipboard.writeText(selectedPrompt.content); alert('Copied!'); }}
                                        className="flex-1 py-4 bg-gradient-to-r from-[#847777] to-[#5a4f4f] text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-[#847777]/30 flex items-center justify-center gap-2 border border-[#847777]"
                                    >
                                        <Copy className="w-4 h-4" /> Copy Prompt
                                    </button>
                                    <button
                                        onClick={() => navigate('/ai/wallet')}
                                        className="flex-1 py-4 border border-[#CCCCCC] text-[#333333] rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-[#F5F5F5] transition-colors"
                                    >
                                        <Star className="w-4 h-4" /> Open Wallet
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* New Asset Button moved into scrollable flow */}
                <div className="flex justify-center py-12">
                    <button
                        onClick={() => setIsAddingPrompt(true)}
                        className="bg-gradient-to-r from-[#847777] to-[#5a4f4f] text-white px-8 py-4 rounded-full shadow-2xl shadow-[#847777]/30 flex items-center gap-3 active:scale-95 transition-all group border border-[#847777]"
                    >
                        <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                        <span className="font-black uppercase tracking-widest text-[11px] tracking-[0.1em]">New Asset Incubator</span>
                    </button>
                </div>

                {/* Asset Incubator Modal - Premium Transformation */}
                <AnimatePresence>
                    {isAddingPrompt && (
                        <div className="fixed inset-0 z-[100] overflow-y-auto bg-[#333333]/60 backdrop-blur-sm flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 30 }}
                                className="relative w-full max-w-[440px] bg-white rounded-[2.5rem] p-8 shadow-2xl flex flex-col gap-10 border border-[#CCCCCC] z-10 max-h-[90vh] overflow-y-auto no-scrollbar"
                            >
                                {/* Header */}
                                <div className="flex justify-between items-start">
                                    <div className="flex flex-col">
                                        <h1 className="text-[#000000] text-3xl font-black tracking-tighter italic">
                                            Asset Incubator
                                        </h1>
                                        <p className="text-[#847777] text-[10px] font-black tracking-[0.2em] mt-1 uppercase italic opacity-80">
                                            Layer 1: Prompt Engineering
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setIsAddingPrompt(false)}
                                        className="bg-[#F5F5F5] hover:bg-[#DDDDDD] text-[#333333] rounded-full w-10 h-10 transition-colors flex items-center justify-center border border-[#CCCCCC]"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Form Fields */}
                                <div className="space-y-8">
                                    <div className="flex flex-col gap-3">
                                        <label className="text-[#CCCCCC] text-[11px] font-bold tracking-wider px-2 uppercase italic">Asset Identity (Title)</label>
                                        <input
                                            value={newPromptTitle}
                                            onChange={(e) => setNewPromptTitle(e.target.value)}
                                            className="w-full h-16 bg-[#F5F5F5] border border-[#CCCCCC] rounded-full px-8 text-[#1A1A1A] placeholder:text-[#CCCCCC] focus:ring-2 focus:ring-[#847777] focus:border-transparent transition-all text-base font-medium outline-none shadow-inner"
                                            placeholder="e.g., NEURAL ARCHITECT V1"
                                            type="text"
                                        />
                                    </div>

                                    <div className="flex flex-row gap-4">
                                        <div className="flex flex-col gap-3 flex-1">
                                            <label className="text-[#CCCCCC] text-[11px] font-bold tracking-wider px-2 uppercase italic">Sector</label>
                                            <div className="relative cursor-pointer group">
                                                <select
                                                    value={newPromptCategory}
                                                    onChange={(e) => setNewPromptCategory(e.target.value)}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                >
                                                    {dynamicCategories.filter(c => c !== 'All').map(c => (
                                                        <option key={c} value={c}>{c}</option>
                                                    ))}
                                                </select>
                                                <input
                                                    className="w-full h-16 bg-[#F5F5F5] border border-[#CCCCCC] rounded-full px-8 text-[#1A1A1A] text-[12px] font-black uppercase tracking-widest cursor-pointer focus:ring-0 outline-none"
                                                    readOnly
                                                    type="text"
                                                    value={newPromptCategory}
                                                />
                                                <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-[#CCCCCC] w-5 h-5 pointer-events-none group-hover:text-[#847777] transition-colors" />
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-3 flex-1">
                                            <label className="text-[#CCCCCC] text-[11px] font-bold tracking-wider px-2 uppercase italic">Utility</label>
                                            <div className="relative">
                                                <input
                                                    value={newPromptPurpose}
                                                    onChange={(e) => setNewPromptPurpose(e.target.value)}
                                                    className="w-full h-16 bg-[#F5F5F5] border border-[#CCCCCC] rounded-full px-8 text-[#1A1A1A] text-sm focus:ring-2 focus:ring-[#847777] focus:border-transparent outline-none shadow-inner transition-all"
                                                    placeholder="Focus Objective"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Neural Logic Core */}
                                <div className="bg-[#1A1A1A] rounded-[40px] p-8 flex flex-col gap-5 relative overflow-hidden border border-white/5 shadow-2xl">
                                    <div className="flex justify-between items-center relative z-10">
                                        <h3 className="text-[#847777] text-[10px] font-black tracking-[0.25em] uppercase">Neural Logic Core</h3>
                                        <Zap className="w-5 h-5 text-[#847777]/60" />
                                    </div>
                                    <div className="relative z-10">
                                        <textarea
                                            value={newPromptContent}
                                            onChange={(e) => setNewPromptContent(e.target.value)}
                                            className="w-full min-h-[320px] bg-transparent border-none focus:ring-0 text-[#F5F5F5] placeholder:text-[#333333] placeholder:text-[11px] text-base leading-relaxed resize-none no-scrollbar p-0 outline-none italic"
                                            placeholder="Paste RAW prompt logic here..."
                                            spellCheck={false}
                                        />
                                    </div>
                                    <div className="pt-2 flex justify-start relative z-10">
                                        <button
                                            onClick={formatVariables}
                                            className="group flex items-center gap-3 px-8 py-3 bg-[#847777]/10 hover:bg-[#847777]/20 rounded-full transition-all border border-[#847777]/20 active:scale-95"
                                        >
                                            <span className="text-[#847777] text-[11px] font-black tracking-widest uppercase">Atomic Format {"{{ }}"}</span>
                                            <Wand2 className="w-4 h-4 text-[#847777] group-hover:translate-x-0.5 transition-transform" />
                                        </button>
                                    </div>
                                </div>

                                {/* Footer & Actions */}
                                <div className="flex flex-col items-center gap-4 w-full">
                                    <button
                                        onClick={handleSavePrompt}
                                        disabled={isSaving || !newPromptTitle || !newPromptContent}
                                        className="w-full h-18 py-5 bg-gradient-to-r from-[#847777] to-[#5a4f4f] text-white rounded-full font-black text-xl shadow-lg shadow-[#847777]/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2 group/btn relative overflow-hidden disabled:opacity-50 disabled:grayscale border border-[#847777]"
                                    >
                                        {isSaving ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Initialize Sequence'}
                                    </button>
                                    <button
                                        onClick={() => setIsAddingPrompt(false)}
                                        className="w-full h-18 py-5 bg-[#F5F5F5] hover:bg-[#DDDDDD] text-[#333333] rounded-full font-black text-lg transition-all active:scale-[0.98] flex items-center justify-center border border-[#CCCCCC]"
                                    >
                                        Cancel
                                    </button>
                                    <p className="text-center text-[#CCCCCC] text-[8px] font-black tracking-[0.2em] uppercase mt-2 opacity-60">
                                        SECURE HANDSHAKE: END-TO-END ENCRYPTION ENABLED
                                    </p>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default AIPromptLibrary;
