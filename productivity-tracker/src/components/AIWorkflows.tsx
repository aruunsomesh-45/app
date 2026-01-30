import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Palette,
    ChevronRight, Plus, Zap, Clock,
    Layout, Briefcase, Workflow, GitBranch,
    Loader2
} from 'lucide-react';
import { fetchWorkflows } from '../services/notionService';
import { motion, AnimatePresence } from 'framer-motion';
import AICanvas from './AICanvas';

interface WorkflowAsset {
    id: string;
    name: string;
    goal: string;
    steps: string;
    frequency: string;
    category?: string;
    status?: string;
}

const AIWorkflows: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('All');
    const [viewMode, setViewMode] = useState<'list' | 'canvas'>('list');
    const [workflows, setWorkflows] = useState<WorkflowAsset[]>([]);
    const [tabGroupIndex, setTabGroupIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    const allTabs = ['All', 'Revenue', 'Efficiency', 'Creative', 'Automation', 'Strategy', 'Content', 'Social'];

    const visibleTabs = allTabs.slice(tabGroupIndex * 4, (tabGroupIndex * 4) + 4);

    const handleTabClick = (tab: string, index: number) => {
        setActiveTab(tab);
        // "Loop" logic: If the 4th visible item (index 3) is clicked, advance the carousel
        if (index === 3) {
            setTabGroupIndex(prev => (prev + 1) * 4 < allTabs.length ? prev + 1 : 0);
        }
    };

    const loadWorkflows = async () => {
        setIsLoading(true);
        try {
            const data = await fetchWorkflows();
            setWorkflows(data);
        } catch (error) {
            console.error("Failed to load workflows:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadWorkflows();
    }, []);



    const getWorkflowIcon = (category: string) => {
        switch (category) {
            case 'Revenue': return Briefcase;
            case 'Efficiency': return Zap;
            case 'Creative': return Palette;
            default: return Workflow;
        }
    };

    const getWorkflowColor = (category: string) => {
        switch (category) {
            case 'Revenue': return 'text-[#847777] bg-[#F5F5F5] border border-[#847777]/20';
            case 'Efficiency': return 'text-[#333333] bg-[#F5F5F5] border border-[#333333]/10';
            case 'Creative': return 'text-[#847777] bg-[#F5F5F5] border border-[#847777]/10';
            default: return 'text-[#CCCCCC] bg-[#F5F5F5] border border-[#CCCCCC]/20';
        }
    };

    const filteredWorkflows = activeTab === 'All'
        ? workflows
        : workflows.filter((w: WorkflowAsset) => w.category === activeTab || activeTab === 'All');

    const isCanvas = viewMode === 'canvas';
    const isList = viewMode === 'list';

    // Full Screen Canvas Mode
    if (isCanvas) {
        return (
            <div className="fixed inset-0 z-50 bg-[#F5F5F5]">
                <AICanvas onExit={() => setViewMode('list')} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F5F5F5] text-[#333333] font-sans antialiased flex justify-center ai-section">
            <div className="w-full max-w-md min-h-screen relative flex flex-col pb-32">
                {/* Sticky Header, Mode Selector & Tabs Group */}
                <div className="sticky top-0 z-30 bg-[#F5F5F5]/90 backdrop-blur-md pb-4 pt-4 -mt-4">
                    {/* Header */}
                    {/* Header */}
                    <header className="pt-12 px-6 pb-6 flex justify-between items-start">
                        <div>
                            <button
                                onClick={() => navigate('/section/ai')}
                                className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm mb-6 text-[#333333] border border-[#CCCCCC] transition-all hover:bg-[#DDDDDD]"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <h1 className="text-4xl font-black tracking-tighter text-[#000000] mb-1 italic">Workflows</h1>
                            <p className="text-[#847777] text-[10px] font-black uppercase tracking-[0.2em]">Execution Logic Layer</p>
                        </div>
                        <div className="flex gap-3 mt-16">
                            <button
                                onClick={() => setViewMode('canvas')}
                                className="w-10 h-10 rounded-full bg-[#847777] flex items-center justify-center shadow-sm text-white border border-[#847777] transition-all hover:bg-[#5a4f4f] hover:scale-105"
                                title="Enter Design Mode"
                            >
                                <Plus className="w-5 h-5" />
                            </button>
                        </div>
                    </header>

                    {/* Mode Selector */}
                    <div className="px-6 mb-4 flex gap-4">
                        <div
                            onClick={() => setViewMode('list')}
                            className={`flex-1 p-4 rounded-3xl border shadow-sm flex items-center gap-3 transition-all cursor-pointer ${isList ? 'bg-white border-[#847777]' : 'bg-white/50 border-[#CCCCCC] opacity-60'}`}
                        >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isList ? 'bg-[#DDDDDD] text-[#847777]' : 'bg-[#F5F5F5] text-[#CCCCCC]'}`}>
                                <Layout className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[8px] font-black text-[#847777] uppercase tracking-widest">View Mode</p>
                                <h4 className="text-[10px] font-black uppercase text-[#000000] font-mono">List View</h4>
                            </div>
                        </div>
                        <div
                            onClick={() => setViewMode('canvas')}
                            className={`flex-1 p-4 rounded-3xl border shadow-sm flex items-center gap-3 transition-all cursor-pointer ${isCanvas ? 'bg-white border-[#847777]' : 'bg-white/50 border-[#CCCCCC] opacity-50 hover:opacity-70'}`}
                        >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isCanvas ? 'bg-[#DDDDDD] text-[#847777]' : 'bg-[#F5F5F5] text-[#CCCCCC]'}`}>
                                <GitBranch className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[8px] font-black text-[#847777] uppercase tracking-widest">Design Mode</p>
                                <h4 className="text-[10px] font-black uppercase text-[#000000] font-mono italic">Canvas</h4>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="px-6">
                        <div className="flex space-x-3 overflow-x-hidden pb-2 mask-fade-edges relative">
                            <AnimatePresence mode='wait'>
                                <motion.div
                                    key={tabGroupIndex}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="flex space-x-3 w-full"
                                >
                                    {visibleTabs.map((tab, idx) => (
                                        <button
                                            key={tab}
                                            onClick={() => handleTabClick(tab, idx)}
                                            className={`flex-1 px-3 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab
                                                ? 'bg-gradient-to-r from-[#847777] to-[#5a4f4f] text-white shadow-lg shadow-[#847777]/30'
                                                : 'bg-white border border-[#CCCCCC] text-[#CCCCCC] hover:text-[#333333] hover:border-[#847777]'
                                                }`}
                                        >
                                            {tab}
                                        </button>
                                    ))}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                        {/* Carousel Indicators for feedback */}
                        <div className="flex justify-center gap-1 mt-1 mb-2">
                            {Array.from({ length: Math.ceil(allTabs.length / 4) }).map((_, idx) => (
                                <div key={idx} className={`h-1 rounded-full transition-all ${idx === tabGroupIndex ? 'w-4 bg-[#847777]' : 'w-1 bg-[#CCCCCC]'}`} />
                            ))}
                        </div>
                    </div>
                </div>

                <main className="flex-1 px-6 space-y-6">
                    {/* List View - Original Workflow Cards */}
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 className="w-8 h-8 text-[#847777] animate-spin" />
                            <p className="mt-4 text-[10px] font-black text-[#CCCCCC] uppercase tracking-widest">Synchronizing Pulse...</p>
                        </div>
                    ) : (
                        <>
                            {filteredWorkflows.length === 0 && (
                                <div className="text-center py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-[#CCCCCC] p-8">
                                    <Workflow className="w-10 h-10 text-[#CCCCCC] mx-auto mb-4" />
                                    <p className="text-sm font-bold text-[#CCCCCC]">No active workflows detected.</p>
                                    <button
                                        onClick={() => setViewMode('canvas')}
                                        className="mt-4 text-[10px] font-black text-[#847777] uppercase tracking-widest transition-colors hover:text-[#5a4f4f]"
                                    >
                                        Architect First Flow
                                    </button>
                                </div>
                            )}
                            {filteredWorkflows.map((wf: WorkflowAsset) => {
                                const Icon = getWorkflowIcon(wf.category || 'Efficiency');
                                const colorClass = getWorkflowColor(wf.category || 'Efficiency');
                                return (
                                    <motion.div
                                        key={wf.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        onClick={() => navigate('/ai/workflow/detail')}
                                        className="group bg-white rounded-[2.5rem] p-7 shadow-sm border border-[#CCCCCC] transition-all hover:shadow-md hover:border-[#847777] cursor-pointer overflow-hidden relative"
                                    >
                                        <div className="flex justify-between items-start mb-6">
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${colorClass}`}>
                                                <Icon className="w-6 h-6" />
                                            </div>
                                            <div className="flex gap-2">
                                                <div className="px-3 py-1 bg-[#333333] rounded-full text-[9px] font-black uppercase tracking-widest text-[#847777] flex items-center gap-1">
                                                    {wf.status || 'Active'}
                                                </div>
                                            </div>
                                        </div>

                                        <h3 className="text-2xl font-black text-[#000000] italic tracking-tight mb-2 group-hover:text-[#847777] transition-colors leading-tight">{wf.name}</h3>
                                        <div className="flex items-center gap-4 text-[#CCCCCC] text-[10px] font-black uppercase tracking-widest mb-6 border-b border-[#F5F5F5] pb-6">
                                            <div className="flex items-center gap-1.5 text-[#847777]">
                                                <Clock className="w-3.5 h-3.5" /> {wf.frequency}
                                            </div>
                                            <div className="w-1.5 h-1.5 rounded-full bg-[#CCCCCC]"></div>
                                            <div className="flex items-center gap-1.5 text-[#333333]">
                                                <Workflow className="w-3.5 h-3.5" /> Sequential
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <p className="text-[10px] font-black text-[#CCCCCC] uppercase tracking-widest truncate max-w-[150px]">{wf.goal}</p>
                                            <button className="bg-white border border-[#CCCCCC] text-[#333333] px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-[#847777] hover:text-[#847777] transition-all flex items-center gap-2 shadow-sm">
                                                Launch Flow <ChevronRight className="w-3 h-3" />
                                            </button>
                                        </div>

                                        {/* Accent line */}
                                        <div className={`absolute top-0 right-0 w-1.5 h-24 ${wf.category === 'Revenue' ? 'bg-[#847777]' : wf.category === 'Efficiency' ? 'bg-[#333333]' : 'bg-[#CCCCCC]'}`}></div>
                                    </motion.div>
                                );
                            })}

                            <div
                                onClick={() => setViewMode('canvas')}
                                className="p-12 border-2 border-dashed border-[#CCCCCC] rounded-[2.5rem] flex flex-col items-center justify-center opacity-40 hover:opacity-100 transition-opacity cursor-pointer group"
                            >
                                <Plus className="w-8 h-8 text-[#CCCCCC] mb-3 group-hover:text-[#847777] transition-colors" />
                                <p className="text-[10px] font-black text-[#CCCCCC] uppercase tracking-[0.2em] group-hover:text-[#847777]">Architect Workflow</p>
                            </div>

                            {/* Manual Override - Added bottom margin to prevent nav overlap */}
                            <div className="flex justify-center py-8 mb-24 z-20 relative">
                                <button className="bg-[#333333] text-white flex items-center justify-center px-10 py-5 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all group border border-[#1A1A1A]">
                                    <Zap className="w-5 h-5 mr-3 group-hover:rotate-90 transition-transform duration-300 fill-white" />
                                    <span className="font-black uppercase tracking-widest text-[11px] tracking-[0.15em]">Manual Override</span>
                                </button>
                            </div>
                        </>
                    )}
                </main>

                {/* Adding Workflow Modal */}

            </div>
        </div >
    );
};

export default AIWorkflows;
