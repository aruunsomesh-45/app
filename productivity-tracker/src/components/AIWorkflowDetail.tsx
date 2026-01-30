import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Edit2, MoreHorizontal,
    Copy, Sparkles, Zap, Target, Clock,
    ExternalLink
} from 'lucide-react';

const AIWorkflowDetail: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#F5F5F5] text-[#333333] font-sans antialiased flex justify-center ai-section">
            <div className="w-full max-w-md min-h-screen relative flex flex-col pb-32">
                {/* Header */}
                <header className="pt-12 px-6 pb-8 flex justify-between items-start sticky top-0 bg-[#F5F5F5]/90 backdrop-blur-md z-20">
                    <div>
                        <button
                            onClick={() => navigate(-1)}
                            className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm mb-6 text-[#333333] border border-[#CCCCCC] hover:bg-[#DDDDDD] transition-all"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <h1 className="text-4xl font-black tracking-tighter text-[#000000] mb-1 italic">Blueprint</h1>
                        <p className="text-[#847777] text-[10px] font-black uppercase tracking-[0.2em]">Operational SOP</p>
                    </div>
                    <div className="flex gap-3 mt-16">
                        <button className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-[#333333] border border-[#CCCCCC] hover:bg-[#DDDDDD] transition-all">
                            <Edit2 className="w-5 h-5" />
                        </button>
                        <button className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-[#333333] border border-[#CCCCCC] hover:bg-[#DDDDDD] transition-all">
                            <MoreHorizontal className="w-5 h-5" />
                        </button>
                    </div>
                </header>

                <main className="flex-1 px-6 space-y-8">
                    {/* Title Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <span className="px-3 py-1 bg-[#DDDDDD] text-[#847777] rounded-full text-[9px] font-black uppercase tracking-widest border border-[#CCCCCC]">Revenue Ops</span>
                            <span className="px-3 py-1 bg-[#333333] text-[#F5F5F5] rounded-full text-[9px] font-black uppercase tracking-widest border border-[#1A1A1A]">High Impact</span>
                        </div>
                        <h2 className="text-3xl font-black text-[#000000] italic tracking-tight leading-tight">
                            Enterprise SaaS<br />Market Engine
                        </h2>
                        <p className="text-[#333333] text-sm font-medium leading-relaxed opacity-80">
                            A high-precision workflow designed to identify, analyze, and generate specialized positioning for SaaS products in the AI sector.
                        </p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="enhanced-card card-interactive card-glow-blue" style={{ borderRadius: '2rem', padding: '1.25rem' }}>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-[#F5F5F5] text-[#847777] rounded-xl border border-[#CCCCCC]">
                                    <Clock className="w-4 h-4" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-[#CCCCCC]">Total Time</span>
                            </div>
                            <h4 className="text-2xl font-black italic text-[#333333]">14h <span className="text-[10px] font-medium text-[#CCCCCC]">/ session</span></h4>
                        </div>
                        <div className="enhanced-card card-interactive card-glow-purple" style={{ borderRadius: '2rem', padding: '1.25rem' }}>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-[#F5F5F5] text-[#847777] rounded-xl border border-[#CCCCCC]">
                                    <Sparkles className="w-4 h-4" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-[#CCCCCC]">Precision</span>
                            </div>
                            <h4 className="text-2xl font-black italic text-[#847777]">98% <span className="text-[10px] font-medium text-[#CCCCCC] uppercase tracking-widest">Rate</span></h4>
                        </div>
                    </div>

                    {/* Tools Required */}
                    <section className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-[#CCCCCC]">Stack Integration</h3>
                            <button className="text-[10px] font-black flex items-center gap-1.5 text-[#847777] uppercase tracking-widest hover:text-[#333333] transition-colors">Connect All <ExternalLink className="w-3 h-3" /></button>
                        </div>
                        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                            {[
                                { name: 'Perplexity', icon: Zap, color: 'text-[#333333]', bg: 'bg-[#F5F5F5]', border: 'border-[#CCCCCC]' },
                                { name: 'Claude Opus', icon: Sparkles, color: 'text-[#847777]', bg: 'bg-white', border: 'border-[#CCCCCC]' },
                                { name: 'Midjourney', icon: Target, color: 'text-[#333333]', bg: 'bg-[#DDDDDD]', border: 'border-[#CCCCCC]' }
                            ].map((tool, i) => (
                                <div key={i} className={`flex-shrink-0 flex items-center gap-3 px-4 py-3 ${tool.bg} border ${tool.border} rounded-2xl shadow-sm hover:border-[#847777] transition-all cursor-pointer`}>
                                    <tool.icon className={`w-4 h-4 ${tool.color}`} />
                                    <span className="text-xs font-black italic text-[#333333]">{tool.name}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Step Timeline */}
                    <section className="space-y-6">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-[#CCCCCC]">Phase Architecture</h3>
                        <div className="space-y-8 relative pl-6">
                            <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-[#CCCCCC]"></div>

                            {[
                                { title: 'Market Saturation Audit', desc: 'Execute Perplexity research to map existing competitor positioning.', prompt: 'Identify all SaaS products in the [Sector] with a focus on [Metric]...' },
                                { title: 'Persona Psychographics', desc: 'Synthesize raw research into detailed buyer intent profiles.', prompt: 'Act as a world-class market theorist. Analyze [Data] for [ICP]...' },
                                { title: 'Asset Generation', desc: 'Produce high-fidelity visuals and copy for the specified target.', prompt: 'Generate 12 high-converting hooks for [Product] based on [Persona]...' }
                            ].map((step, i) => (
                                <div key={i} className="relative">
                                    <div className="absolute -left-[24px] top-1 w-4 h-4 rounded-full bg-white border-2 border-[#847777] flex items-center justify-center">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#847777]"></div>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="text-xl font-black italic tracking-tight text-[#000000]">{step.title}</h4>
                                            <p className="text-sm text-[#333333] font-medium leading-relaxed opacity-70">{step.desc}</p>
                                        </div>
                                        <div className="bg-[#333333] rounded-[1.5rem] p-5 relative group overflow-hidden border border-[#1A1A1A] shadow-xl">
                                            <div className="flex justify-between items-center mb-4">
                                                <span className="text-[9px] font-black uppercase tracking-widest text-[#CCCCCC]/50">System Prompt v2.1</span>
                                                <button className="p-2 text-[#CCCCCC] hover:text-white transition-colors bg-white/5 rounded-lg border border-white/10">
                                                    <Copy className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <p className="text-[11px] font-mono text-[#F5F5F5] line-clamp-2 italic opacity-90">"{step.prompt}"</p>
                                            <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-[#847777] to-[#5a4f4f] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </main>

                <div className="fixed bottom-8 left-0 right-0 px-6 flex justify-center z-30">
                    <button className="w-full bg-gradient-to-r from-[#847777] to-[#5a4f4f] text-white flex items-center justify-center py-5 rounded-full shadow-2xl hover:opacity-90 transition-all group font-black uppercase tracking-widest text-xs border border-[#847777]">
                        <Zap className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform fill-white" />
                        Execute Fully Managed Session
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AIWorkflowDetail;
