import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Wallet,
    ExternalLink, Trash2,
    Lock, Briefcase, TrendingUp, Zap, Loader2,
    Workflow, Bot, Shield, Cpu
} from 'lucide-react';
import {
    fetchPrompts,
    fetchTools,
    fetchCommercialPacks,
    fetchWorkflows,
    fetchAgents,
    deleteNotionPage
} from '../services/notionService';
import { motion, AnimatePresence } from 'framer-motion';

interface WalletPrompt {
    id: string;
    title: string;
    category: string;
    tags: string[];
    isFavorite?: boolean;
    [key: string]: string | number | boolean | string[] | undefined | unknown;
}

interface WalletTool {
    id: string;
    name: string;
    category: string;
    link: string;
    desc: string;
    icon?: string;
    color?: string;
    isPremium?: boolean;
}

interface WalletPack {
    id: string;
    name: string;
    revenuePotential: string;
    assets: number;
    efficiency: number;
}

interface WalletWorkflow {
    id: string;
    name: string;
    frequency: string;
    goal: string;
}

interface WalletAgent {
    id: string;
    name: string;
    role: string;
}

const AIWallet: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'prompts' | 'tools' | 'commercial' | 'workflows' | 'agents'>('prompts');

    const [prompts, setPrompts] = useState<WalletPrompt[]>([]);
    const [tools, setTools] = useState<WalletTool[]>([]);
    const [commercialPacks, setCommercialPacks] = useState<WalletPack[]>([]);
    const [workflows, setWorkflows] = useState<WalletWorkflow[]>([]);
    const [agents, setAgents] = useState<WalletAgent[]>([]);
    const [loading, setLoading] = useState(true);

    const loadAllData = async () => {
        setLoading(true);
        try {
            const [promptsData, toolsData, packsData, workflowsData, agentsData] = await Promise.all([
                fetchPrompts(),
                fetchTools(),
                fetchCommercialPacks(),
                fetchWorkflows(),
                fetchAgents()
            ]) as [WalletPrompt[], WalletTool[], WalletPack[], WalletWorkflow[], WalletAgent[]];

            // Fix: If there are favorites, show favorites. If not, show all.
            const favorites = promptsData.filter(p => p.isFavorite);
            setPrompts(favorites.length > 0 ? favorites : promptsData);

            setTools(toolsData);
            setCommercialPacks(packsData);
            setWorkflows(workflowsData);
            setAgents(agentsData);
        } catch (error) {
            console.error("Failed to load wallet data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAllData();
    }, []);

    const handleRemoveAsset = async (id: string, type: string) => {
        const message = `Remove this ${type} from your personal vault?`;
        if (!window.confirm(message)) return;

        try {
            await deleteNotionPage(id);
            await loadAllData();
        } catch (error) {
            console.error(`Failed to remove ${type}`, error);
            alert(`Failed to remove ${type}. Please try again.`);
        }
    };

    // Calculate Dashboard Metrics
    const totalAssets = prompts.length + tools.length + commercialPacks.length + workflows.length + agents.length;
    // Simple mock calculation for time recapped based on assets
    const timeRecapped = (totalAssets * 0.5).toFixed(1);

    return (
        <div className="min-h-screen bg-[#F5F5F5] font-sans antialiased text-[#333333] transition-colors duration-300 flex justify-center ai-section">
            <div className="w-full max-w-md h-full min-h-screen bg-[#F5F5F5] relative flex flex-col pb-32">
                {/* Header */}
                <header className="px-6 pt-12 pb-8 sticky top-0 bg-[#F5F5F5]/90 backdrop-blur-md z-20">
                    <button
                        onClick={() => navigate('/section/ai')}
                        className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm mb-6 text-[#333333] hover:bg-[#F5F5F5] transition border border-[#CCCCCC]"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-14 h-14 rounded-[1.5rem] bg-gradient-to-br from-[#847777] to-[#5a4f4f] flex items-center justify-center shadow-xl shadow-[#847777]/30 border border-[#847777]">
                            <Wallet className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black tracking-tighter text-[#000000] italic leading-none">Personal Vault</h1>
                            <p className="text-[#847777] text-[10px] font-black uppercase tracking-[0.2em] mt-1 italic">High-Value Asset Center</p>
                        </div>
                    </div>
                </header>


                {/* Dashboard Metrics */}
                <div className="px-6 mb-8">
                    <div className="bg-[#1A1A1A] rounded-[2.5rem] p-7 shadow-2xl relative overflow-hidden border border-[#333333]">
                        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-6">
                                <p className="text-[10px] font-black text-[#847777] uppercase tracking-[0.2em]">Efficiency Intelligence</p>
                                <Zap className="w-5 h-5 text-[#847777] fill-[#847777] animate-pulse" />
                            </div>
                            <div className="flex gap-8 mb-8">
                                <div>
                                    <p className="text-[9px] font-black text-[#CCCCCC]/60 uppercase tracking-widest mb-1">Time Saved</p>
                                    <h4 className="text-3xl font-black text-white italic">{timeRecapped}h</h4>
                                </div>
                                <div className="w-[1px] h-12 bg-[#333333]"></div>
                                <div>
                                    <p className="text-[9px] font-black text-[#CCCCCC]/60 uppercase tracking-widest mb-1">Vault Status</p>
                                    <h4 className="text-3xl font-black text-[#847777] italic">Elite</h4>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                                    <p className="text-[14px] font-black text-white">{prompts.length}</p>
                                    <p className="text-[8px] font-black text-[#CCCCCC]/40 uppercase tracking-widest">Prompts</p>
                                </div>
                                <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                                    <p className="text-[14px] font-black text-white">{workflows.length}</p>
                                    <p className="text-[8px] font-black text-[#CCCCCC]/40 uppercase tracking-widest">Flows</p>
                                </div>
                                <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                                    <p className="text-[14px] font-black text-white">{agents.length}</p>
                                    <p className="text-[8px] font-black text-[#CCCCCC]/40 uppercase tracking-widest">Agents</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs - Scrollable */}
                <div className="px-6 mb-6">
                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                        {([
                            { id: 'prompts', label: 'Prompts' },
                            { id: 'tools', label: 'Tools' },
                            { id: 'commercial', label: 'Packs' },
                            { id: 'workflows', label: 'Flows' },
                            { id: 'agents', label: 'Agents' }
                        ] as const).map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-shrink-0 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${activeTab === tab.id
                                    ? 'bg-[#1A1A1A] text-white border-[#333333] shadow-lg'
                                    : 'bg-white text-[#CCCCCC] border-[#CCCCCC] hover:text-[#333333] hover:border-[#847777]'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>


                {/* Content Area */}
                <main className="px-6 flex-1 space-y-6">
                    <AnimatePresence mode="wait">
                        {loading ? (
                            <motion.div
                                key="loading"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col items-center justify-center p-20"
                            >
                                <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-4" />
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Synchronizing Vault Assets...</p>
                            </motion.div>
                        ) : (
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                                className="space-y-4"
                            >
                                {activeTab === 'prompts' && (prompts.length === 0 ? (
                                    <div className="text-center py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-[#CCCCCC]">
                                        <Zap className="w-10 h-10 text-[#CCCCCC] mx-auto mb-4" />
                                        <p className="text-xs font-black text-[#CCCCCC] uppercase tracking-widest">No Priority Prompts</p>
                                    </div>
                                ) : (
                                    prompts.map((prompt, index) => (
                                        <div key={prompt.id} className={`enhanced-card card-interactive card-glow-accent card-animate-fade card-animate-stagger-${Math.min(index + 1, 6)} group relative overflow-hidden`} style={{ borderRadius: '2.5rem', padding: '1.75rem' }}>
                                            <div className="flex justify-between items-start mb-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-[#F5F5F5] border border-[#CCCCCC] flex items-center justify-center text-[#847777]">
                                                        <Cpu className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-xl font-black text-[#000000] italic tracking-tight group-hover:text-[#847777] transition-colors">{prompt.title}</h3>
                                                        <p className="text-[10px] font-black text-[#CCCCCC] uppercase tracking-widest">{prompt.category}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleRemoveAsset(prompt.id, 'prompt')}
                                                    className="p-2 bg-[#F5F5F5] border border-[#CCCCCC] rounded-lg text-[#CCCCCC] hover:text-rose-500 hover:bg-rose-50 transition-all opacity-0 group-hover:opacity-100"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <div className="flex flex-wrap gap-2 mb-6">
                                                {prompt.tags.map((tag: string) => (
                                                    <span key={tag} className="px-3 py-1 bg-[#DDDDDD] rounded-full text-[9px] font-black text-[#333333] uppercase tracking-widest group-hover:bg-[#847777]/10 group-hover:text-[#847777] transition-colors">#{tag}</span>
                                                ))}
                                            </div>
                                            <div className="flex items-center justify-between pt-5 border-t border-[#F5F5F5]">
                                                <span className="flex items-center gap-2 text-[9px] font-black text-[#847777] uppercase tracking-widest">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-[#847777] animate-pulse"></div>
                                                    Vault Verified
                                                </span>
                                                <button className="text-[10px] font-black text-[#333333] uppercase tracking-widest hover:text-[#847777] transition-colors flex items-center gap-1.5">Copy Pattern →</button>
                                            </div>
                                        </div>
                                    ))
                                ))}


                                {activeTab === 'workflows' && (workflows.length === 0 ? (
                                    <div className="text-center py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-[#CCCCCC]">
                                        <Workflow className="w-10 h-10 text-[#CCCCCC] mx-auto mb-4" />
                                        <p className="text-xs font-black text-[#CCCCCC] uppercase tracking-widest">No Sequences Mapped</p>
                                    </div>
                                ) : (
                                    workflows.map((wf, index) => (
                                        <div key={wf.id} className={`enhanced-card card-interactive card-glow-purple card-animate-fade card-animate-stagger-${Math.min(index + 1, 6)} group relative overflow-hidden`} style={{ borderRadius: '2.5rem', padding: '1.75rem' }}>
                                            <div className="flex justify-between items-start mb-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 rounded-2xl bg-[#F5F5F5] border border-[#CCCCCC] flex items-center justify-center text-[#333333]">
                                                        <Workflow className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-xl font-black text-[#000000] italic tracking-tight group-hover:text-[#847777] transition-colors">{wf.name}</h3>
                                                        <p className="text-[10px] font-black text-[#CCCCCC] uppercase tracking-widest">{wf.frequency}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleRemoveAsset(wf.id, 'workflow')}
                                                    className="p-2 bg-[#F5F5F5] border border-[#CCCCCC] rounded-lg text-[#CCCCCC] hover:text-rose-500 hover:bg-rose-50 transition-all opacity-0 group-hover:opacity-100"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <p className="text-[11px] font-black text-[#333333] italic leading-relaxed mb-6 border-l-2 border-[#847777] pl-4 opacity-80">{wf.goal}</p>
                                            <button className="w-full py-4 bg-[#DDDDDD] text-[#333333] rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#1A1A1A] hover:text-white transition-all">Launch Sequence</button>
                                        </div>
                                    ))
                                ))}


                                {activeTab === 'agents' && (agents.length === 0 ? (
                                    <div className="text-center py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-[#CCCCCC]">
                                        <Bot className="w-10 h-10 text-[#CCCCCC] mx-auto mb-4" />
                                        <p className="text-xs font-black text-[#CCCCCC] uppercase tracking-widest">No Active Units</p>
                                    </div>
                                ) : (
                                    agents.map((agent, index) => (
                                        <div key={agent.id} className={`enhanced-card card-interactive card-glow-green card-animate-fade card-animate-stagger-${Math.min(index + 1, 6)} group relative overflow-hidden`} style={{ borderRadius: '2.5rem', padding: '1.75rem' }}>
                                            <div className="flex justify-between items-start mb-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 rounded-2xl bg-[#F5F5F5] border border-[#CCCCCC] flex items-center justify-center text-[#847777]">
                                                        <Bot className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-xl font-black text-[#000000] italic tracking-tight group-hover:text-[#847777] transition-colors">{agent.name}</h3>
                                                        <p className="text-[10px] font-black text-[#CCCCCC] uppercase tracking-widest">{agent.role}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleRemoveAsset(agent.id, 'agent')}
                                                    className="p-2 bg-[#F5F5F5] border border-[#CCCCCC] rounded-lg text-[#CCCCCC] hover:text-rose-500 hover:bg-rose-50 transition-all opacity-0 group-hover:opacity-100"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <div className="flex items-center gap-4 text-[10px] font-black text-[#333333] uppercase tracking-widest mb-6 border-b border-[#F5F5F5] pb-6 opacity-60">
                                                <div className="flex items-center gap-1.5 text-[#847777]">
                                                    <Shield className="w-3.5 h-3.5" /> High Precision
                                                </div>
                                                <div className="w-1.5 h-1.5 rounded-full bg-[#CCCCCC]"></div>
                                                <div className="flex items-center gap-1.5 text-[#333333]">
                                                    <Cpu className="w-3.5 h-3.5" /> Core Unit
                                                </div>
                                            </div>
                                            <button className="w-full py-4 bg-[#1A1A1A] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#847777] transition-all shadow-xl shadow-[#1A1A1A]/20">Waken Unit</button>
                                        </div>
                                    ))
                                ))}


                                {activeTab === 'commercial' && (commercialPacks.length === 0 ? (
                                    <div className="text-center py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-[#CCCCCC]">
                                        <Briefcase className="w-10 h-10 text-[#CCCCCC] mx-auto mb-4" />
                                        <p className="text-xs font-black text-[#CCCCCC] uppercase tracking-widest">No Commercial Assets</p>
                                    </div>
                                ) : (
                                    commercialPacks.map((pack, index) => (
                                        <div key={pack.id} className={`enhanced-card card-interactive card-glow-yellow card-animate-fade card-animate-stagger-${Math.min(index + 1, 6)} group relative overflow-hidden`} style={{ borderRadius: '2.5rem', padding: '1.75rem' }}>
                                            <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-[#847777]"></div>
                                            <div className="flex justify-between items-start mb-6">
                                                <div className="w-12 h-12 rounded-2xl bg-[#F5F5F5] border border-[#CCCCCC] flex items-center justify-center text-[#847777]">
                                                    <Briefcase className="w-6 h-6" />
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="flex flex-col items-end">
                                                        <p className="text-[10px] font-black text-[#847777] uppercase tracking-tighter italic">{pack.revenuePotential}</p>
                                                        <p className="text-[8px] font-black text-[#CCCCCC] uppercase tracking-widest">Value</p>
                                                    </div>
                                                    <button
                                                        onClick={() => handleRemoveAsset(pack.id, 'pack')}
                                                        className="p-2 bg-[#F5F5F5] border border-[#CCCCCC] rounded-lg text-[#CCCCCC] hover:text-rose-500 hover:bg-rose-50 transition-all opacity-0 group-hover:opacity-100"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                            <h4 className="text-xl font-black text-[#000000] italic tracking-tight mb-4 group-hover:text-[#847777] transition-colors">{pack.name}</h4>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <span className="text-[10px] font-black text-[#333333] uppercase tracking-widest opacity-60">{pack.assets} Units</span>
                                                    <span className="text-[10px] font-black text-[#847777] uppercase tracking-widest">{pack.efficiency} SOPs</span>
                                                </div>
                                                <button className="px-4 py-2 bg-[#F5F5F5] border border-[#CCCCCC] text-[#333333] rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-[#847777] hover:text-white transition-all">Access</button>
                                            </div>
                                        </div>
                                    ))
                                ))}


                                {activeTab === 'tools' && (tools.length === 0 ? (
                                    <div className="text-center py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-[#CCCCCC]">
                                        <TrendingUp className="w-10 h-10 text-[#CCCCCC] mx-auto mb-4" />
                                        <p className="text-xs font-black text-[#CCCCCC] uppercase tracking-widest">No Tools Detected</p>
                                    </div>
                                ) : (
                                    tools.map((tool, index) => (
                                        <div key={tool.id} className={`enhanced-card card-interactive card-glow-blue card-animate-fade card-animate-stagger-${Math.min(index + 1, 6)} flex items-center justify-between group`} style={{ borderRadius: '2.5rem', padding: '1.5rem' }}>
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 rounded-2xl bg-[#F5F5F5] border border-[#CCCCCC] flex items-center justify-center group-hover:bg-[#847777]/10 transition-colors">
                                                    <TrendingUp className="w-6 h-6 text-[#847777]" />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-black text-[#000000] italic tracking-tight leading-tight group-hover:text-[#847777] transition-colors">{tool.name}</h3>
                                                    <p className="text-[10px] text-[#CCCCCC] font-black uppercase tracking-widest">{tool.category}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleRemoveAsset(tool.id, 'tool')}
                                                    className="p-3 text-[#CCCCCC] hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                                <a
                                                    href={tool.link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-4 bg-white text-[#CCCCCC] hover:text-[#847777] hover:bg-[#F5F5F5] rounded-2xl shadow-sm transition-all border border-[#CCCCCC]"
                                                >
                                                    <ExternalLink className="w-5 h-5" />
                                                </a>
                                            </div>
                                        </div>
                                    ))
                                ))}

                            </motion.div>
                        )}
                    </AnimatePresence>
                </main>

                {/* Footer Protected SOP Creation */}
                <div className="fixed bottom-8 left-0 right-0 px-6 flex justify-center z-30 pointer-events-none">
                    <button className="pointer-events-auto bg-[#1A1A1A] text-white flex items-center justify-center px-12 py-5 rounded-full shadow-2xl hover:scale-105 transition-all group border border-[#333333]">
                        <Lock className="w-5 h-5 mr-3 text-[#847777] group-hover:scale-110 transition-transform" />
                        <span className="font-black uppercase tracking-[0.2em] text-[11px] italic">Build Protected SOP</span>
                    </button>
                </div>
            </div>
        </div>

    );
};

export default AIWallet;
