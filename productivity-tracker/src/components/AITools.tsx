import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Search, Heart, Plus, BadgeCheck,
    ExternalLink, Sparkles, Zap, Target, Loader2, X, Trash2, ChevronDown
} from 'lucide-react';
import NanoBananaAI from './NanoBananaAI';
import { fetchTools, createTool, deleteNotionPage } from '../services/notionService';
import { motion, AnimatePresence } from 'framer-motion';

interface ToolAsset {
    id: string;
    name: string;
    category: string;
    link: string;
    desc: string;
    pricing: string;
    icon?: string;
    color?: string;
    isPremium?: boolean;
}

const AITools: React.FC = () => {
    const navigate = useNavigate();
    const [isNanoBananaOpen, setIsNanoBananaOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
    const [isPricingDropdownOpen, setIsPricingDropdownOpen] = useState(false);

    const categories = [
        'All', 'Marketing', 'Sales', 'Design', 'UI Design',
        'UI Components', 'UI Libraries', 'Development', 'AI Agents',
        'AI Models / LLMs', 'Research AI', 'Prompt Tools', 'Website Builders',
        'App Builders', 'Backend / Database', 'SEO Tools', 'Video Tools',
        '3D Tools', 'Inspiration / Galleries'
    ];

    const [tools, setTools] = useState<ToolAsset[]>([]);
    const [loading, setLoading] = useState(true);

    const [isAddingTool, setIsAddingTool] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Close dropdowns on click-away
    useEffect(() => {
        const handleClickAway = () => {
            setIsCategoryDropdownOpen(false);
            setIsPricingDropdownOpen(false);
        };
        if (isCategoryDropdownOpen || isPricingDropdownOpen) {
            window.addEventListener('click', handleClickAway);
        }
        return () => window.removeEventListener('click', handleClickAway);
    }, [isCategoryDropdownOpen, isPricingDropdownOpen]);

    // Lock body scroll when modal is open
    useEffect(() => {
        if (isAddingTool) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isAddingTool]);

    // Form state
    const [newToolName, setNewToolName] = useState('');
    const [newToolCategory, setNewToolCategory] = useState('Productivity');
    const [newToolLink, setNewToolLink] = useState('');
    const [newToolDesc, setNewToolDesc] = useState('');
    const [newToolPricing, setNewToolPricing] = useState('Free');

    const loadTools = async () => {
        setLoading(true);
        try {
            const data = await fetchTools();
            setTools(data);
        } catch (error) {
            console.error("Failed to load tools", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTools();
    }, []);

    const handleSaveTool = async () => {
        if (!newToolName || !newToolLink) return;

        setIsSaving(true);
        try {
            await createTool({
                name: newToolName,
                category: newToolCategory,
                link: newToolLink,
                desc: newToolDesc,
                pricing: newToolPricing
            });
            setIsAddingTool(false);
            setNewToolName('');
            setNewToolLink('');
            setNewToolDesc('');
            await loadTools();
            alert("Success! Tool added to your library.");
        } catch (error: unknown) {
            const err = error as Error;
            console.error("Failed to save tool:", err); // Keep console.error for debugging
            alert(`Link Error: ${err.message}`); // Use the new alert message
        } finally {
            setIsSaving(false);
        }
    };

    const handleRemoveTool = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (!window.confirm("Archive this tool? It will be removed from your toolkit hub.")) return;
        try {
            await deleteNotionPage(id);
            await loadTools();
        } catch (error) {
            console.error("Failed to delete tool", error);
            alert("Terminal Error: Could not remove tool from Notion Hub.");
        }
    };

    const filteredTools = selectedCategory === 'All'
        ? tools
        : tools.filter((t: ToolAsset) => t.category === selectedCategory);

    return (
        <div className="ai-section min-h-screen bg-[#F5F5F5] font-sans antialiased text-[#333333] flex justify-center">
            <NanoBananaAI isOpen={isNanoBananaOpen} onClose={() => setIsNanoBananaOpen(false)} />

            <div className="w-full max-w-md min-h-screen relative pb-32">
                {/* Sticky Header & Filters Group */}
                <div className="sticky top-0 z-30 bg-[#F5F5F5]/90 backdrop-blur-md pb-4 pt-4 -mt-4">
                    <header className="pt-12 px-6 pb-6 flex justify-between items-start">
                        <div>
                            <button
                                onClick={() => navigate(-1)}
                                className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm mb-6 text-[#333333] border border-[#CCCCCC] hover:bg-[#DDDDDD] transition"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <h1 className="text-4xl font-black tracking-tighter text-[#000000] mb-1 italic">Toolkit</h1>
                            <p className="text-[#CCCCCC] text-[10px] font-black uppercase tracking-[0.2em]">Efficiency Stack</p>
                        </div>
                        <div className="flex gap-3 mt-16">
                            <button className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-[#333333] border border-[#CCCCCC] hover:bg-[#DDDDDD] transition">
                                <Search className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => navigate('/ai/wallet')}
                                className="w-10 h-10 rounded-full bg-[#847777] text-white flex items-center justify-center shadow-lg shadow-[#847777]/30"
                            >
                                <Heart className="w-5 h-5" />
                            </button>
                        </div>
                    </header>

                    {/* Filters */}
                    <div className="px-6 relative group">
                        <div
                            className="flex space-x-3 overflow-x-auto no-scrollbar pb-2 mask-fade-edges scroll-smooth"
                        >
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`flex-shrink-0 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedCategory === cat
                                        ? 'bg-gradient-to-r from-[#847777] to-[#5a4f4f] text-white shadow-lg shadow-[#847777]/30'
                                        : 'bg-white border border-[#CCCCCC] text-[#CCCCCC] hover:text-[#333333] hover:border-[#847777]'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Tool Grid */}
                <div className="px-6 grid grid-cols-1 gap-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center p-12 opacity-50">
                            <Loader2 className="w-8 h-8 animate-spin text-[#847777] mb-2" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-[#CCCCCC]">Loading Toolkit...</p>
                        </div>
                    ) : filteredTools.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-[#CCCCCC] rounded-[2.5rem] opacity-50">
                            <p className="text-[10px] font-black uppercase tracking-widest text-[#CCCCCC]">No tools found</p>
                        </div>
                    ) : (
                        filteredTools.map((tool: ToolAsset) => (
                            <div
                                key={tool.id}
                                className="enhanced-card card-interactive relative group overflow-hidden"
                                onClick={() => window.open(tool.link, '_blank')}
                                style={{ borderRadius: '2.5rem' }}
                            >
                                <div className="flex items-center gap-5 relative z-10">
                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center overflow-hidden shadow-inner ${tool.color} p-3`}>
                                        {/* Use a default icon or the one from Notion if available */}
                                        {tool.icon ? (
                                            <img src={tool.icon} alt={tool.name} className="w-full h-full object-contain filter brightness-0 invert opacity-90" />
                                        ) : (
                                            <Zap className="w-8 h-8 text-white opacity-90" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="text-xl font-black text-[#000000] italic tracking-tight">{tool.name}</h3>
                                            {tool.isPremium && (
                                                <div className="px-2 py-0.5 bg-[#847777]/10 rounded-lg">
                                                    <BadgeCheck className="w-3 h-3 text-[#847777] fill-[#847777]" />
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-xs text-[#CCCCCC] font-medium line-clamp-1">{tool.desc}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={(e) => handleRemoveTool(e, tool.id)}
                                            className="p-3 bg-[#DDDDDD] rounded-2xl text-[#CCCCCC] hover:text-red-500 hover:bg-red-50 transition-all z-20"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                        <div className="p-3 bg-[#DDDDDD] rounded-2xl text-[#333333] group-hover:bg-[#847777] group-hover:text-white transition-all">
                                            <ExternalLink className="w-5 h-5" />
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 flex items-center gap-6 border-t border-[#DDDDDD] pt-6">
                                    <div className="flex items-center gap-2">
                                        <Zap className="w-3.5 h-3.5 text-[#847777]" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-[#CCCCCC]">12 Prompts</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Target className="w-3.5 h-3.5 text-[#847777]" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-[#CCCCCC]">4 Active SOPs</span>
                                    </div>
                                </div>

                                <div className="absolute right-0 top-0 w-32 h-32 bg-[#DDDDDD] rounded-bl-full -mr-16 -mt-16 -z-10 group-hover:bg-[#847777]/20 transition-colors"></div>
                            </div>
                        ))
                    )}

                    {/* Placeholder for expansion */}
                    <div
                        onClick={() => setIsAddingTool(true)}
                        className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-[#CCCCCC] rounded-[2.5rem] opacity-40 hover:opacity-100 hover:border-[#847777] transition-all cursor-pointer"
                    >
                        <Plus className="w-8 h-8 text-[#333333] mb-2" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-[#333333]">Submit New Tool</p>
                    </div>
                </div>

                {/* Submit Tool Modal - Register Tech */}
                <AnimatePresence>
                    {isAddingTool && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsAddingTool(false)}
                                className="absolute inset-0 bg-[#333333]/60 backdrop-blur-xl"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 30 }}
                                className="relative w-full max-w-[400px] bg-white rounded-[2.5rem] shadow-2xl max-h-[90vh] overflow-y-auto border border-slate-100 z-10"
                            >
                                {/* Header */}
                                <div className="pt-10 px-8 pb-6 flex justify-between items-start">
                                    <div>
                                        <h1 className="text-3xl font-extrabold italic text-[#000000] tracking-tight">Register Tech</h1>
                                        <p className="text-[10px] font-bold text-[#847777] tracking-[0.15em] mt-1 uppercase">LAYER 3: COGNITIVE INTEGRATION</p>
                                    </div>
                                    <button
                                        onClick={() => setIsAddingTool(false)}
                                        className="w-10 h-10 rounded-full bg-[#F5F5F5] flex items-center justify-center text-[#333333] hover:bg-[#DDDDDD] transition-colors border border-[#CCCCCC]"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Content - All scrollable together */}
                                <div className="px-8 space-y-6 pb-4">
                                    {/* Tool Name */}
                                    <div className="space-y-3">
                                        <label className="block text-[11px] font-bold text-[#CCCCCC] tracking-widest italic uppercase">TOOL SIGNATURE (IDENTITY)</label>
                                        <input
                                            type="text"
                                            value={newToolName}
                                            onChange={(e) => setNewToolName(e.target.value)}
                                            className="w-full bg-[#F5F5F5] border border-[#CCCCCC] rounded-2xl py-4 px-6 text-[#1a1a1a] focus:ring-2 focus:ring-[#847777] transition-all placeholder:text-[#CCCCCC] placeholder:font-medium text-sm font-medium outline-none shadow-inner"
                                            placeholder="e.g. Perplexity AI"
                                        />
                                    </div>

                                    {/* Sector & Pricing */}
                                    <div className="flex gap-4">
                                        <div className="flex-1 space-y-3 relative">
                                            <label className="block text-[11px] font-bold text-[#CCCCCC] tracking-widest italic uppercase">Sector</label>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setIsCategoryDropdownOpen(!isCategoryDropdownOpen); }}
                                                className="w-full bg-[#F5F5F5] border border-[#CCCCCC] rounded-2xl py-4 px-6 pr-10 text-[#000000] font-black uppercase tracking-widest text-left text-[10px] focus:ring-2 focus:ring-[#847777] transition-all flex justify-between items-center group shadow-inner"
                                            >
                                                <span className="truncate">{newToolCategory}</span>
                                                <ChevronDown className="w-4 h-4 text-[#847777] absolute right-4 group-hover:rotate-180 transition-transform" />
                                            </button>
                                            {isCategoryDropdownOpen && (
                                                <div
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#CCCCCC] rounded-2xl shadow-2xl z-50 max-h-48 overflow-y-auto no-scrollbar"
                                                >
                                                    {categories.filter(c => c !== 'All').map(c => (
                                                        <button
                                                            key={c}
                                                            onClick={() => { setNewToolCategory(c); setIsCategoryDropdownOpen(false); }}
                                                            className="w-full px-4 py-3 text-left text-[9px] font-black uppercase tracking-widest text-[#CCCCCC] hover:bg-[#F5F5F5] hover:text-[#847777] border-b border-[#F5F5F5] last:border-0 transition-colors"
                                                        >
                                                            {c}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 space-y-3 relative">
                                            <label className="block text-[11px] font-bold text-[#CCCCCC] tracking-widest italic uppercase">Pricing</label>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setIsPricingDropdownOpen(!isPricingDropdownOpen); }}
                                                className="w-full bg-[#F5F5F5] border border-[#CCCCCC] rounded-2xl py-4 px-6 pr-10 text-[#000000] font-black uppercase tracking-widest text-left text-[10px] focus:ring-2 focus:ring-[#847777] transition-all flex justify-between items-center group shadow-inner"
                                            >
                                                <span>{newToolPricing}</span>
                                                <ChevronDown className="w-4 h-4 text-[#847777] absolute right-4 group-hover:rotate-180 transition-transform" />
                                            </button>
                                            {isPricingDropdownOpen && (
                                                <div
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#CCCCCC] rounded-2xl shadow-2xl z-50 no-scrollbar"
                                                >
                                                    {['Free', 'Freemium', 'Paid'].map(p => (
                                                        <button
                                                            key={p}
                                                            onClick={() => { setNewToolPricing(p); setIsPricingDropdownOpen(false); }}
                                                            className="w-full px-4 py-3 text-left text-[9px] font-black uppercase tracking-widest text-[#CCCCCC] hover:bg-[#F5F5F5] hover:text-[#847777] border-b border-[#F5F5F5] last:border-0 transition-colors"
                                                        >
                                                            {p}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Deployment Link */}
                                    <div className="space-y-3">
                                        <label className="block text-[11px] font-bold text-[#CCCCCC] tracking-widest italic uppercase">Deployment Link</label>
                                        <input
                                            type="url"
                                            value={newToolLink}
                                            onChange={(e) => setNewToolLink(e.target.value)}
                                            className="w-full bg-[#F5F5F5] border border-[#CCCCCC] rounded-2xl py-4 px-6 text-[#1a1a1a] focus:ring-2 focus:ring-[#847777] transition-all placeholder:text-[#CCCCCC] text-sm font-medium outline-none shadow-inner"
                                            placeholder="https://..."
                                        />
                                    </div>

                                    {/* Core Utility - Dark Card */}
                                    <div className="bg-[#1A1A1A] rounded-[2rem] p-8 relative overflow-hidden shadow-xl border border-white/5">
                                        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#847777]/10 blur-[80px] rounded-full"></div>
                                        <div className="flex items-center gap-2 mb-5">
                                            <Zap className="w-5 h-5 text-[#847777]" />
                                            <span className="text-[10px] font-black text-[#847777] tracking-[0.2em] uppercase">Core Utility</span>
                                        </div>
                                        <textarea
                                            value={newToolDesc}
                                            onChange={(e) => setNewToolDesc(e.target.value)}
                                            className="w-full bg-transparent border-none p-0 focus:ring-0 text-[#F5F5F5] placeholder:text-[#333333] text-base leading-relaxed resize-none min-h-[140px] outline-none italic"
                                            placeholder="What does this technology achieve?"
                                        />
                                    </div>
                                </div>

                                {/* Footer Buttons - Scrollable with content */}
                                <div className="px-8 pt-4 pb-6 space-y-3">
                                    <button
                                        onClick={handleSaveTool}
                                        disabled={isSaving || !newToolName || !newToolLink}
                                        className="w-full bg-gradient-to-r from-[#847777] to-[#5a4f4f] text-white font-black py-5 rounded-full shadow-xl shadow-[#847777]/30 hover:opacity-90 transition-all text-base uppercase tracking-widest disabled:opacity-40 disabled:grayscale flex items-center justify-center gap-2 border border-[#847777]"
                                    >
                                        {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                                        {isSaving ? 'Registering...' : 'Register'}
                                    </button>
                                    <button
                                        onClick={() => setIsAddingTool(false)}
                                        className="w-full text-[#CCCCCC] font-black py-3 text-center hover:text-[#333333] transition-colors text-[10px] uppercase tracking-[0.2em] italic"
                                    >
                                        Cancel
                                    </button>
                                </div>

                                {/* Bottom Indicator */}
                                <div className="h-6 flex items-center justify-center">
                                    <div className="w-32 h-1 bg-slate-200 rounded-full"></div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>


                {/* Integrated Command Bar */}
                <div className="mt-12 mb-20 px-6">
                    <div className="bg-[#333333] backdrop-blur-2xl border border-[#1A1A1A] p-1.5 sm:p-2 rounded-[2rem] flex items-center justify-between shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                        <button
                            onClick={() => setIsNanoBananaOpen(true)}
                            className="flex-1 flex items-center gap-3 pl-2 sm:pl-4 pr-6 py-2 sm:py-3 rounded-full hover:bg-white/5 transition-all text-white group"
                        >
                            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#847777] flex-shrink-0 flex items-center justify-center shadow-lg shadow-[#847777]/20 active:scale-95 transition-transform">
                                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                            </div>
                            <div className="flex flex-col items-start overflow-hidden text-left">
                                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.15em] whitespace-nowrap overflow-hidden text-ellipsis">Command AI Agent</span>
                                <span className="text-[7px] font-bold text-[#847777] uppercase tracking-widest">Nano Banana AI 1.0</span>
                            </div>
                        </button>
                        <div className="w-[1px] h-8 bg-[#1A1A1A] mx-1 flex-shrink-0"></div>
                        <button
                            onClick={() => setIsAddingTool(true)}
                            className="p-3 sm:p-4 text-white hover:text-[#847777] active:scale-90 transition-all flex-shrink-0"
                        >
                            <Plus className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>

    );
};

export default AITools;
