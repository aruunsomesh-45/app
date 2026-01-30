import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ChevronLeft, Search, MoreHorizontal, Palette,
    ChevronRight, Plus, Zap, TrendingUp, Clock,
    Layout, Briefcase, Sparkles
} from 'lucide-react';

const AIUseCases: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('All');

    const tabs = ['All', 'Revenue', 'Efficiency', 'Creative'];

    const useCases = [
        {
            id: 1,
            title: 'SaaS Launch SOP',
            category: 'Revenue',
            impact: 'High',
            timeSaved: '14h',
            icon: Briefcase,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
            stats: 'Used 24 times'
        },
        {
            id: 2,
            title: 'Content Engine 2.0',
            category: 'Efficiency',
            impact: 'Medium',
            timeSaved: '8h',
            icon: Zap,
            color: 'text-orange-600',
            bg: 'bg-orange-50',
            stats: 'Used 89 times'
        },
        {
            id: 3,
            title: 'Brand Identity Vault',
            category: 'Creative',
            impact: 'High',
            timeSaved: '22h',
            icon: Palette,
            color: 'text-purple-600',
            bg: 'bg-purple-50',
            stats: 'Used 12 times'
        }
    ];

    const filteredUseCases = activeTab === 'All'
        ? useCases
        : useCases.filter(u => u.category === activeTab);

    return (
        <div className="min-h-screen bg-[#F8F9FA] text-[#18181b] font-sans antialiased flex justify-center">
            <div className="w-full max-w-md min-h-screen relative flex flex-col pb-32">
                {/* Header */}
                <header className="pt-12 px-6 pb-8 flex justify-between items-start sticky top-0 bg-[#F8F9FA]/90 backdrop-blur-md z-20">
                    <div>
                        <button
                            onClick={() => navigate(-1)}
                            className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm mb-6 text-gray-600 border border-gray-100"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <h1 className="text-4xl font-black tracking-tighter text-gray-900 mb-1 italic">Workflows</h1>
                        <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">Business SOPs</p>
                    </div>
                    <div className="flex gap-3 mt-16">
                        <button className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-gray-600 border border-gray-100">
                            <Search className="w-5 h-5" />
                        </button>
                        <button className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-gray-600 border border-gray-100">
                            <Layout className="w-5 h-5" />
                        </button>
                    </div>
                </header>

                {/* Tabs */}
                <div className="px-6 mb-8">
                    <div className="flex space-x-3 overflow-x-auto no-scrollbar pb-2 mask-fade-edges">
                        {tabs.map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`flex-shrink-0 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100'
                                    : 'bg-white border border-gray-100 text-gray-400 hover:text-gray-600'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                <main className="flex-1 px-6 space-y-6">
                    {filteredUseCases.map(uc => (
                        <div
                            key={uc.id}
                            className="group bg-white rounded-[2.5rem] p-6 shadow-sm border border-gray-100 transition-all hover:shadow-md cursor-pointer overflow-hidden relative"
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${uc.bg} ${uc.color}`}>
                                    <uc.icon className="w-6 h-6" />
                                </div>
                                <div className="flex gap-2">
                                    <div className="px-3 py-1 bg-green-50 rounded-full text-[9px] font-black uppercase tracking-widest text-green-600 flex items-center gap-1">
                                        <TrendingUp className="w-3 h-3" /> {uc.impact} Impact
                                    </div>
                                    <button className="p-2 text-gray-300 hover:text-gray-900 transition-colors">
                                        <MoreHorizontal className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            <h3 className="text-2xl font-black text-gray-900 italic tracking-tight mb-2 group-hover:text-indigo-600 transition-colors">{uc.title}</h3>
                            <div className="flex items-center gap-4 text-gray-400 text-[10px] font-black uppercase tracking-widest mb-6 border-b border-gray-50 pb-6">
                                <div className="flex items-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5" /> {uc.timeSaved} Saved
                                </div>
                                <div className="w-1.5 h-1.5 rounded-full bg-gray-200"></div>
                                <div className="flex items-center gap-1.5">
                                    <Sparkles className="w-3.5 h-3.5" /> High Precision
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{uc.stats}</p>
                                <button className="bg-gray-50 text-gray-900 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all flex items-center gap-2">
                                    Execute <ChevronRight className="w-3 h-3" />
                                </button>
                            </div>

                            {/* Accent line */}
                            <div className={`absolute top-0 right-0 w-1 h-24 ${uc.category === 'Revenue' ? 'bg-blue-500' : uc.category === 'Efficiency' ? 'bg-orange-500' : 'bg-purple-500'}`}></div>
                        </div>
                    ))}

                    <div className="p-12 border-2 border-dashed border-gray-200 rounded-[2.5rem] flex flex-col items-center justify-center opacity-40">
                        <Plus className="w-8 h-8 text-gray-400 mb-3" />
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Build Custom SOP</p>
                    </div>

                    {/* Instant Execution moved into scrollable flow to avoid navbar overlap */}
                    <div className="flex justify-center py-8">
                        <button className="bg-[#18181b] text-white flex items-center justify-center px-8 py-4 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all group border border-zinc-700">
                            <Zap className="w-5 h-5 mr-3 group-hover:rotate-90 transition-transform duration-300 fill-white" />
                            <span className="font-black uppercase tracking-widest text-xs tracking-[0.1em]">Instant Execution</span>
                        </button>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AIUseCases;
