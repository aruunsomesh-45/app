import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Edit2,
    Wrench,
    BookOpen,
    Workflow,
    Plus,
    User,
    Library,
    Sparkles,
    Layout,
    Bolt,
    Globe,
    Target,
    Activity,
    RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';
import NanoBananaAI from './NanoBananaAI';
import {
    aiInsightsApi,
    aggregationApi
} from '../services/cloudFunctionsApi';
import { toast } from 'react-hot-toast';

const AIDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [isNanoBananaOpen, setIsNanoBananaOpen] = useState(false);
    const [loadingAction, setLoadingAction] = useState<string | null>(null);
    const [generatedInsight, setGeneratedInsight] = useState<string | undefined>(undefined);

    const handleAction = async (action: string) => {
        setLoadingAction(action);
        setGeneratedInsight(undefined);
        try {
            let result;
            if (action === 'daily') {
                const today = new Date().toISOString().split('T')[0];
                await aggregationApi.triggerDailyAggregation(today);
                result = await aiInsightsApi.generateDailySummary(today);
                toast.success('Daily Summary Generated!');
            } else if (action === 'weekly') {
                result = await aiInsightsApi.generateWeeklyReview(); // Defaults to current week
                toast.success('Weekly Review Generated!');
            } else if (action === 'goals') {
                result = await aiInsightsApi.generateGoalSuggestions();
                toast.success('Goal Suggestions Ready!');
            }

            if (result && result.content) {
                setGeneratedInsight(result.content);
            }

            // Open chat to see results
            setIsNanoBananaOpen(true);
        } catch (error) {
            console.error(error);
            toast.error('Failed to generate. Try again.');
        } finally {
            setLoadingAction(null);
        }
    };

    const layers = [
        {
            id: 'search',
            title: 'SkimNews',
            layer: 'Layer 00',
            desc: 'Personalized News & Trends',
            icon: Globe,
            stats: 'Online',
            color: 'text-[#847777]',
            bg: 'bg-white',
            link: '/ai/news',
            span: 'col-span-2'
        },
        {
            id: 'prompts',
            title: 'Prompt Library',
            layer: 'Layer 01',
            desc: 'Reusable Intellectual Assets',
            icon: Edit2,
            stats: '24 Prompts',
            color: 'text-[#847777]',
            bg: 'bg-white',
            link: '/ai/prompts',
            span: 'col-span-1'
        },
        {
            id: 'tools',
            title: 'AI Tools Hub',
            layer: 'Layer 02',
            desc: 'Execution Capabilities',
            icon: Wrench,
            stats: '12 Active',
            color: 'text-[#847777]',
            bg: 'bg-white',
            link: '/ai/tools',
            span: 'col-span-1'
        },
        {
            id: 'notebook',
            title: 'Learning Hub',
            layer: 'Layer 03',
            desc: 'Neural Synthesis Engine',
            icon: BookOpen,
            stats: '8 Sources',
            color: 'text-[#847777]',
            bg: 'bg-white',
            link: '/ai/notebook',
            span: 'col-span-2'
        },
        {
            id: 'workflows',
            title: 'Workflow Logic',
            layer: 'Layer 04',
            desc: 'Sequence Automation & SOPs',
            icon: Workflow,
            stats: '5 Flows',
            color: 'text-[#847777]',
            bg: 'bg-white',
            link: '/ai/use-cases',
            span: 'col-span-2'
        }
    ];

    return (
        <div className="ai-section mt-10 min-h-screen bg-[#F5F5F5] font-sans antialiased text-[#333333] transition-colors duration-300 relative flex justify-center">
            {/* AI Modal */}
            <NanoBananaAI
                isOpen={isNanoBananaOpen}
                onClose={() => {
                    setIsNanoBananaOpen(false);
                    setGeneratedInsight(undefined);
                }}
                initialMessage={generatedInsight}
            />

            <div className="w-full max-w-md h-full min-h-screen bg-[#F5F5F5] relative flex flex-col pb-24">
                {/* Header */}
                <header className="px-6 pt-12 pb-8 flex justify-between items-start sticky top-0 bg-[#F5F5F5]/80 backdrop-blur-xl z-20">
                    <div>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm mb-6 text-[#333333] hover:bg-[#F5F5F5] transition border border-[#CCCCCC]"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <h1 className="text-4xl font-black tracking-tighter text-[#000000] mb-1 italic">AI-OS</h1>
                        <p className="text-[#847777] text-[10px] font-black tracking-[0.2em] uppercase opacity-80 italic">Neural Command Center</p>
                    </div>
                    <div className="flex gap-3 mt-16">
                        <button
                            onClick={() => navigate('/ai/wallet')}
                            className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-[#333333] border border-[#CCCCCC] hover:bg-[#F5F5F5] transition group"
                        >
                            <Library className="w-5 h-5 group-hover:text-[#847777] transition-colors" />
                        </button>
                        <button className="w-10 h-10 rounded-full bg-gradient-to-br from-[#847777] to-[#5a4f4f] text-white flex items-center justify-center shadow-lg shadow-[#847777]/30 border border-[#847777]">
                            <User className="w-5 h-5" />
                        </button>
                    </div>
                </header>

                {/* Efficiency Graph Card - Dark Graphite Style */}
                <div className="px-6 mb-8">
                    <div className="enhanced-card card-glow-accent card-animate-fade relative overflow-hidden group" style={{ borderRadius: '2.5rem', background: '#1A1A1A' }}>
                        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '15px 15px' }}></div>
                        <div className="absolute -right-4 -top-4 w-40 h-40 bg-[#847777]/10 rounded-full blur-3xl group-hover:bg-[#847777]/20 transition-all"></div>

                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-8">
                                <p className="text-[10px] font-black text-[#847777] uppercase tracking-[0.25em] italic">System Intelligence</p>
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#847777] animate-pulse"></div>
                                    <Sparkles className="w-4 h-4 text-[#847777]" />
                                </div>
                            </div>
                            <div className="flex gap-10 mb-6">
                                <div>
                                    <p className="text-[9px] font-black text-[#CCCCCC]/60 uppercase tracking-widest mb-1">Savings</p>
                                    <h4 className="text-3xl font-black text-[#F5F5F5] italic tracking-tighter">24.8h</h4>
                                </div>
                                <div className="w-[1px] h-12 bg-[#333333]"></div>
                                <div>
                                    <p className="text-[9px] font-black text-[#CCCCCC]/60 uppercase tracking-widest mb-1">Precision</p>
                                    <h4 className="text-3xl font-black text-[#847777] italic tracking-tighter">98%</h4>
                                </div>
                            </div>
                            <div className="w-full bg-[#333333] h-1.5 rounded-full overflow-hidden shadow-inner">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: '84%' }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                    className="bg-gradient-to-r from-[#847777] to-[#5a4f4f] h-full rounded-full shadow-[0_0_15px_rgba(132,119,119,0.6)]"
                                ></motion.div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Layer Matrix */}
                <main className="px-6 grid grid-cols-2 gap-5">
                    {layers.map(layer => (
                        <motion.div
                            key={layer.id}
                            whileHover={{ y: -5 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => navigate(layer.link)}
                            className={`${layer.span} group enhanced-card-mini card-interactive card-animate-scale relative overflow-hidden`}
                            style={{ borderRadius: '2.5rem', animationDelay: `${layers.indexOf(layer) * 0.05}s` }}
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div className={`w-14 h-14 rounded-2xl bg-[#F5F5F5] border border-[#CCCCCC] ${layer.color} flex items-center justify-center transition-all group-hover:bg-[#847777]/10 group-hover:scale-110 group-hover:border-[#847777]/30 duration-300`}>
                                    <layer.icon className="w-6 h-6" />
                                </div>
                                <div className="text-right">
                                    <p className="text-[8px] font-black text-[#CCCCCC] uppercase tracking-widest leading-none mb-1 group-hover:text-[#847777] transition-colors">{layer.layer}</p>
                                    <p className="text-[10px] font-black text-[#000000] uppercase tracking-tighter">{layer.stats}</p>
                                </div>
                            </div>

                            <h3 className="text-2xl font-black text-[#000000] italic tracking-tight mb-2 group-hover:text-[#847777] transition-colors leading-tight">{layer.title}</h3>
                            <p className="text-[10px] text-[#CCCCCC] font-black uppercase tracking-widest opacity-80 group-hover:text-[#333333] transition-colors">{layer.desc}</p>

                            {/* Suble hover indicator */}
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#847777] scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
                        </motion.div>
                    ))}
                </main>

            </div>

            {/* AI Control Panel */}
            <div className="px-6 mt-8">
                <h3 className="text-xs font-black text-[#847777] uppercase tracking-[0.2em] mb-4 pl-2">Neural Functions</h3>
                <div className="grid grid-cols-1 gap-4">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleAction('daily')}
                        disabled={!!loadingAction}
                        className="enhanced-card p-5 flex items-center justify-between group bg-white border border-gray-200 rounded-[1.5rem]"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-full bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition-colors">
                                <Activity className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                                <h4 className="font-bold text-gray-900">Daily Summary</h4>
                                <p className="text-[10px] uppercase tracking-wider text-gray-500">Aggregate & Analyze</p>
                            </div>
                        </div>
                        {loadingAction === 'daily' ? (
                            <RefreshCw className="w-5 h-5 text-gray-400 animate-spin" />
                        ) : (
                            <ArrowLeft className="w-5 h-5 text-gray-300 rotate-180 group-hover:text-blue-500 transition-colors" />
                        )}
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleAction('weekly')}
                        disabled={!!loadingAction}
                        className="enhanced-card p-5 flex items-center justify-between group bg-white border border-gray-200 rounded-[1.5rem]"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-full bg-purple-50 text-purple-600 group-hover:bg-purple-100 transition-colors">
                                <Layout className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                                <h4 className="font-bold text-gray-900">Weekly Review</h4>
                                <p className="text-[10px] uppercase tracking-wider text-gray-500">Deep Insights</p>
                            </div>
                        </div>
                        {loadingAction === 'weekly' ? (
                            <RefreshCw className="w-5 h-5 text-gray-400 animate-spin" />
                        ) : (
                            <ArrowLeft className="w-5 h-5 text-gray-300 rotate-180 group-hover:text-purple-500 transition-colors" />
                        )}
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleAction('goals')}
                        disabled={!!loadingAction}
                        className="enhanced-card p-5 flex items-center justify-between group bg-white border border-gray-200 rounded-[1.5rem]"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-full bg-amber-50 text-amber-600 group-hover:bg-amber-100 transition-colors">
                                <Target className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                                <h4 className="font-bold text-gray-900">Goal Buddy</h4>
                                <p className="text-[10px] uppercase tracking-wider text-gray-500">Unblock & Suggest</p>
                            </div>
                        </div>
                        {loadingAction === 'goals' ? (
                            <RefreshCw className="w-5 h-5 text-gray-400 animate-spin" />
                        ) : (
                            <ArrowLeft className="w-5 h-5 text-gray-300 rotate-180 group-hover:text-amber-500 transition-colors" />
                        )}
                    </motion.button>
                </div>
            </div>

            {/* Future Proofing Grid */}
            <div className="px-6 mt-8 grid grid-cols-2 gap-5">
                <div className="bg-transparent p-6 rounded-[2.5rem] border-2 border-dashed border-[#CCCCCC] flex flex-col items-center justify-center opacity-40 hover:opacity-100 hover:border-[#847777] hover:bg-white transition-all cursor-pointer group">
                    <Layout className="w-5 h-5 text-[#333333] mb-2 group-hover:text-[#847777] transition-colors" />
                    <p className="text-[9px] font-black text-[#333333] uppercase tracking-widest group-hover:text-[#847777]">Dashboard Config</p>
                </div>
                <div className="bg-transparent p-6 rounded-[2.5rem] border-2 border-dashed border-[#CCCCCC] flex flex-col items-center justify-center opacity-40 hover:opacity-100 hover:border-[#847777] hover:bg-white transition-all cursor-pointer group">
                    <Bolt className="w-5 h-5 text-[#333333] mb-2 group-hover:text-[#847777] transition-colors" />
                    <p className="text-[9px] font-black text-[#333333] uppercase tracking-widest group-hover:text-[#847777]">Automations</p>
                </div>
            </div>

            {/* Floating Command Button - Dior Accent (Scrollable) */}
            <div className="flex justify-center mt-8 mb-12 relative z-10">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsNanoBananaOpen(true)}
                    className="bg-gradient-to-r from-[#847777] to-[#5a4f4f] text-white px-8 py-5 rounded-full shadow-2xl shadow-[#847777]/40 flex items-center gap-4 group border border-[#847777]/50"
                >
                    <div className="bg-white/10 rounded-full w-8 h-8 flex items-center justify-center backdrop-blur-md border border-white/20">
                        <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
                    </div>
                    <span className="font-black uppercase tracking-[0.3em] text-[11px] italic">Command AI-OS</span>
                </motion.button>
            </div>

            <div className="h-28 w-full"></div>
        </div>
    );
};

export default AIDashboard;
