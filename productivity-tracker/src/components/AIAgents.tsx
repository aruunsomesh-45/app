import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Cpu, Zap, Plus, Search,
    X, Loader2, Trash2, ChevronRight,
    Brain, Shield, Globe, Terminal, Bot
} from 'lucide-react';
import { fetchAgents, createAgent, deleteNotionPage } from '../services/notionService';
import { motion, AnimatePresence } from 'framer-motion';

interface Agent {
    id: string;
    name: string;
    role: string;
    objective: string;
    instructions: string;
    status?: string;
}

const AIAgents: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('Storage');
    const [agents, setAgents] = useState<Agent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddingAgent, setIsAddingAgent] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Form state
    const [name, setName] = useState('');
    const [role, setRole] = useState('');
    const [objective, setObjective] = useState('');
    const [instructions, setInstructions] = useState('');

    useEffect(() => {
        const loadAgents = async () => {
            try {
                const data = await fetchAgents();
                setAgents(data);
            } catch (error) {
                console.error('Failed to load agents:', error);
            } finally {
                setIsLoading(false);
            }
        };
        loadAgents();
    }, []);

    const handleSaveAgent = async () => {
        if (!name || !role || !objective) return;

        setIsSaving(true);
        try {
            const newAgentData = await createAgent({
                name,
                role,
                objective,
                instructions
            });

            // Format the new agent for local state
            const newAgent: Agent = {
                id: newAgentData.id,
                name,
                role,
                objective,
                instructions,
                status: 'Active'
            };

            setAgents([...agents, newAgent]);
            setIsAddingAgent(false);
            // Reset form
            setName('');
            setRole('');
            setObjective('');
            setInstructions('');
        } catch (error) {
            console.error('Failed to create agent:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleRemoveAgent = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to decommission this agent?')) {
            try {
                await deleteNotionPage(id);
                setAgents(agents.filter(a => a.id !== id));
            } catch (error) {
                console.error('Failed to delete agent:', error);
            }
        }
    };

    const getAgentIcon = (role: string) => {
        const lowerRole = role.toLowerCase();
        if (lowerRole.includes('logic') || lowerRole.includes('code') || lowerRole.includes('terminal')) return <Terminal className="w-8 h-8" />;
        if (lowerRole.includes('brain') || lowerRole.includes('think') || lowerRole.includes('research')) return <Brain className="w-8 h-8" />;
        if (lowerRole.includes('shield') || lowerRole.includes('security') || lowerRole.includes('protect')) return <Shield className="w-8 h-8" />;
        if (lowerRole.includes('globe') || lowerRole.includes('network') || lowerRole.includes('world')) return <Globe className="w-8 h-8" />;
        if (lowerRole.includes('bot') || lowerRole.includes('assistant')) return <Bot className="w-8 h-8" />;
        return <Cpu className="w-8 h-8" />;
    };

    return (
        <div className="ai-section min-h-screen bg-[#F5F5F5] font-sans antialiased text-[#333333] transition-colors duration-300 relative flex justify-center">
            <div className="w-full max-w-md h-full min-h-screen bg-[#F5F5F5] relative flex flex-col pb-24">
                {/* Header */}
                <header className="px-6 pt-12 pb-8 flex justify-between items-start sticky top-0 bg-[#F5F5F5]/80 backdrop-blur-xl z-20">
                    <div>
                        <button
                            onClick={() => navigate('/ai')}
                            className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm mb-6 text-[#333333] hover:bg-[#F5F5F5] transition border border-[#CCCCCC]"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <h1 className="text-4xl font-black tracking-tighter text-[#000000] mb-1 italic">Agents</h1>
                        <p className="text-[#847777] text-[10px] font-black tracking-[0.2em] uppercase opacity-80 italic">Neural Delegation Units</p>
                    </div>
                </header>

                {/* Tabs */}
                <div className="px-6 mb-8 flex gap-2 sticky top-[180px] bg-[#F5F5F5]/80 backdrop-blur-md py-4 z-10 transition-all">
                    {['Storage', 'Learning'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 border-2 ${activeTab === tab
                                ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-xl'
                                : 'bg-white text-[#847777] border-[#CCCCCC] hover:border-[#847777]'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <main className="px-6 space-y-6">
                    {activeTab === 'Storage' ? (
                        isLoading ? (
                            <div className="flex flex-col items-center justify-center py-20 opacity-30">
                                <div className="w-12 h-12 border-4 border-[#847777] border-t-transparent rounded-full animate-spin mb-4"></div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-[#847777]">Accessing Directory...</p>
                            </div>
                        ) : (
                            <div className="grid gap-6">
                                {agents.map((agent, index) => (
                                    <motion.div
                                        key={agent.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="enhanced-card card-interactive card-glow-green relative group overflow-hidden"
                                        style={{ borderRadius: '2.5rem', padding: '1.75rem' }}
                                    >
                                        <div className="flex items-start justify-between mb-6">
                                            <div className="flex items-center gap-5">
                                                <div className="w-16 h-16 rounded-2xl bg-[#F5F5F5] border border-[#CCCCCC] flex items-center justify-center text-[#847777] group-hover:bg-[#847777]/10 group-hover:scale-110 group-hover:border-[#847777]/30 transition-all duration-500">
                                                    {getAgentIcon(agent.role)}
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-black text-[#000000] italic tracking-tight group-hover:text-[#847777] transition-colors">{agent.name}</h3>
                                                    <p className="text-[10px] font-black text-[#CCCCCC] uppercase tracking-widest group-hover:text-[#333333] transition-colors">{agent.role}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={(e) => handleRemoveAgent(e, agent.id)}
                                                className="w-10 h-10 rounded-full bg-[#F5F5F5] flex items-center justify-center text-[#CCCCCC] hover:bg-red-50 hover:text-red-500 transition-all border border-[#CCCCCC]"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <div className="space-y-4 mb-6">
                                            <div className="p-4 bg-[#F5F5F5] rounded-2xl border border-[#CCCCCC]/30">
                                                <p className="text-[10px] font-black text-[#847777] uppercase tracking-widest mb-1 italic">Primary Objective</p>
                                                <p className="text-xs text-[#333333] leading-relaxed line-clamp-2">{agent.objective}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-6 border-t border-[#F5F5F5]">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-[#847777] animate-pulse"></div>
                                                <span className="text-[9px] font-black text-[#847777] uppercase tracking-[0.2em]">{agent.status || 'Active'}</span>
                                            </div>
                                            <button className="flex items-center gap-2 text-[10px] font-black text-[#333333] uppercase tracking-widest group-hover:text-[#847777] transition-colors">
                                                <span>Deploy Unit</span>
                                                <ChevronRight className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#847777]/5 to-transparent rounded-bl-full pointer-events-none group-hover:from-[#847777]/10 transition-all duration-700"></div>
                                    </motion.div>
                                ))}

                                <div
                                    onClick={() => setIsAddingAgent(true)}
                                    className="p-12 border-2 border-dashed border-[#CCCCCC] rounded-[2.5rem] flex flex-col items-center justify-center text-[#CCCCCC] hover:border-[#847777] hover:bg-white hover:text-[#847777] transition-all cursor-pointer group"
                                >
                                    <div className="w-16 h-16 rounded-full bg-[#F5F5F5] flex items-center justify-center mb-4 group-hover:bg-[#847777]/10 group-hover:scale-110 transition-all duration-500">
                                        <Plus className="w-8 h-8" />
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] italic">Incubate New Unit</p>
                                </div>
                            </div>
                        )
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] border border-[#CCCCCC] border-dashed">
                            <div className="w-16 h-16 rounded-full bg-[#F5F5F5] flex items-center justify-center mb-4 text-[#847777]">
                                <Brain className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-black text-[#000000] italic mb-2">Knowledge Core</h3>
                            <p className="text-[10px] font-black text-[#847777] uppercase tracking-[0.2em] text-center max-w-[200px]">Agent learning simulations and dataset integration module.</p>
                        </div>
                    )}

                    {/* Scan Network moved into scrollable flow to avoid navbar overlap */}
                    <div className="flex justify-center py-8">
                        <button className="bg-white text-[#333333] flex items-center justify-center px-10 py-5 rounded-full shadow-lg hover:shadow-[#847777]/20 active:scale-95 transition-all group border border-[#CCCCCC]">
                            <Search className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform text-[#847777]" />
                            <span className="font-black uppercase tracking-widest text-[11px] tracking-[0.15em]">Scan Network</span>
                        </button>
                    </div>
                </main>

                {/* Adding Agent Modal */}
                <AnimatePresence>
                    {isAddingAgent && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => !isSaving && setIsAddingAgent(false)}
                                className="absolute inset-0 bg-[#333333]/60 backdrop-blur-xl"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 30 }}
                                className="relative w-full max-w-[440px] bg-white rounded-[2.5rem] p-8 shadow-[0_35px_70px_-15px_rgba(0,0,0,0.1)] flex flex-col gap-8 overflow-y-auto max-h-[90vh] no-scrollbar border border-gray-100 z-10"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex flex-col">
                                        <h2 className="text-3xl font-black italic tracking-tighter text-[#000000]">Incubate Unit</h2>
                                        <p className="text-[10px] font-black uppercase text-[#847777] tracking-[0.2em] mt-1">Layer 5: Neural Integration</p>
                                    </div>
                                    <button
                                        onClick={() => setIsAddingAgent(false)}
                                        className="bg-[#F5F5F5] hover:bg-[#DDDDDD] text-[#333333] rounded-full w-10 h-10 transition-colors flex items-center justify-center border border-[#CCCCCC]"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="space-y-8">
                                    <div className="flex flex-col gap-3">
                                        <label className="text-[#CCCCCC] text-[11px] font-bold tracking-wider px-2 uppercase italic">Unit Designation (Identity)</label>
                                        <input
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="e.g. Research Sentinel V1"
                                            className="w-full h-14 bg-[#F5F5F5] border border-[#CCCCCC] rounded-full px-6 text-[#1A1A1A] placeholder:text-[#CCCCCC] text-sm font-medium outline-none shadow-inner focus:ring-2 focus:ring-[#847777] focus:border-transparent transition-all"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[#CCCCCC] text-[11px] font-bold tracking-wider px-2 uppercase italic">Operational Role</label>
                                            <input
                                                value={role}
                                                onChange={(e) => setRole(e.target.value)}
                                                placeholder="e.g. Lead Researcher"
                                                className="w-full h-12 bg-[#F5F5F5] border border-[#CCCCCC] rounded-2xl px-4 text-[10px] font-black uppercase tracking-widest text-[#1A1A1A] shadow-inner focus:ring-2 focus:ring-[#847777] focus:border-transparent outline-none transition-all"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[#CCCCCC] text-[11px] font-bold tracking-wider px-2 uppercase italic">Status</label>
                                            <div className="h-12 bg-[#F5F5F5] border border-[#CCCCCC] rounded-2xl flex items-center px-4">
                                                <span className="text-[9px] font-black text-[#847777] uppercase tracking-tighter italic">Ready for Sync</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-3">
                                        <label className="text-[#CCCCCC] text-[11px] font-bold tracking-wider px-2 uppercase italic">Core Objective</label>
                                        <input
                                            value={objective}
                                            onChange={(e) => setObjective(e.target.value)}
                                            placeholder="Primary prime directive..."
                                            className="w-full h-14 bg-[#F5F5F5] border border-[#CCCCCC] rounded-full px-6 text-[#1A1A1A] placeholder:text-[#CCCCCC] text-sm font-medium outline-none shadow-inner focus:ring-2 focus:ring-[#847777] focus:border-transparent transition-all"
                                        />
                                    </div>

                                    <div className="bg-[#1A1A1A] rounded-[2.5rem] p-8 flex flex-col gap-4 relative overflow-hidden border border-white/5 shadow-2xl">
                                        <div className="flex items-center gap-3 mb-2">
                                            <Zap className="w-4 h-4 text-[#847777] animate-pulse" />
                                            <h3 className="text-[#847777] text-[10px] font-black tracking-[0.25em] uppercase">Neural Logic Core</h3>
                                        </div>
                                        <textarea
                                            value={instructions}
                                            onChange={(e) => setInstructions(e.target.value)}
                                            rows={5}
                                            placeholder="Detailed behavioral constraints..."
                                            className="w-full bg-transparent border-none focus:ring-0 text-[#F5F5F5] placeholder:text-[#333333] text-sm leading-relaxed resize-none no-scrollbar min-h-[120px]"
                                        />
                                    </div>

                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => setIsAddingAgent(false)}
                                            className="flex-1 h-16 bg-[#F5F5F5] hover:bg-[#DDDDDD] text-[#333333] rounded-full font-black text-xs uppercase tracking-widest border border-[#CCCCCC] transition-all"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSaveAgent}
                                            disabled={isSaving || !name || !role || !objective}
                                            className="flex-[2] h-16 bg-gradient-to-r from-[#847777] to-[#5a4f4f] text-white rounded-full font-black text-[12px] uppercase tracking-widest shadow-xl shadow-[#847777]/30 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Cpu className="w-5 h-5" />}
                                            {isSaving ? 'Synchronizing...' : 'Initialize Unit'}
                                        </button>
                                    </div>
                                </div>
                                <div className="text-center w-full px-4 pt-4 border-t border-[#F5F5F5] mt-4">
                                    <p className="text-[#CCCCCC] text-[8px] font-black tracking-widest uppercase opacity-40 flex items-center justify-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#847777] animate-pulse" />
                                        SYNCED WITH NEURAL NETWORK
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

export default AIAgents;
