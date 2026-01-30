
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Zap, DollarSign, Package, ExternalLink, ArrowLeft, Plus, Target, Users,
    MessageSquare, Lightbulb,
    Shield, X, Globe,
    ChevronRight, Loader2, TrendingUp, Sparkles,
    Send, BarChart3
} from 'lucide-react';
import { THEME_CLASSES, LUXURY_ANIMATIONS } from '../utils/theme';
import { fetchCommercialPacks } from '../services/notionService';
import { useLifeTracker } from '../utils/lifeTrackerStore';
import type {
    BrandingContentItem,
    BrandingPositioning,
    AudienceIntelligence,
    Platform,
    ExpertisePillar
} from '../utils/lifeTrackerStore';

// Interface for internal UI components (reusing store types)
interface CommercialPack {
    id: string;
    name: string;
    assets: number;
    revenuePotential: string;
    efficiency: string;
}

// 15 Core Principles for reuse
const CORE_PRINCIPLES = [
    "Clear audience specificity",
    "One strong idea per content piece",
    "Clarity over cleverness",
    "Emotional hook strength",
    "Contrarian or curiosity-driven framing",
    "Fast pacing over production quality",
    "Pattern interrupts every 3–5 seconds",
    "Calm authority over hype",
    "Storytelling or example anchoring",
    "Specificity and proof signals",
    "Relatability and shared pain",
    "Teaching over flexing",
    "Consistent format and repetition",
    "Strong ending that drives next action",
    "Trust-based lead alignment"
];

const BrandingSection: React.FC = () => {
    const navigate = useNavigate();
    const store = useLifeTracker();
    const { branding } = store.getState();
    const { positioning, audienceIntelligence, contentItems, platforms } = branding;

    const [activeTab, setActiveTab] = useState<'foundation' | 'platforms' | 'content' | 'reflection' | 'benchmarking' | 'viral_library'>('foundation');

    // UI States
    const [isAddPillarOpen, setIsAddPillarOpen] = useState(false);
    const [isAddPlatformOpen, setIsAddPlatformOpen] = useState(false);
    const [isAddContentOpen, setIsAddContentOpen] = useState(false);
    const [selectedContent, setSelectedContent] = useState<BrandingContentItem | null>(null);
    const [reflections, setReflections] = useState<Record<string, string>>(() => {
        const stored = localStorage.getItem('branding_reflections');
        return stored ? JSON.parse(stored) : {};
    });

    // Benchmarking State (Local for comparison UI)
    const [comparisonResult, setComparisonResult] = useState<string>(() => localStorage.getItem('branding_comparison_result') || '');
    const [isComparing, setIsComparing] = useState(false);
    const [contentA, setContentA] = useState(() => localStorage.getItem('branding_content_a') || '');
    const [contentB, setContentB] = useState(() => localStorage.getItem('branding_content_b') || '');

    // Viral Library (Commercial Packs)
    const [commercialPacks, setCommercialPacks] = useState<CommercialPack[]>([]);
    const [isLoadingPacks, setIsLoadingPacks] = useState(false);

    useEffect(() => {
        const loadPacks = async () => {
            setIsLoadingPacks(true);
            try {
                const packs = await fetchCommercialPacks();
                setCommercialPacks(packs);
            } catch (err) {
                console.error("Failed to load packs:", err);
            } finally {
                setIsLoadingPacks(false);
            }
        };
        loadPacks();
    }, []);

    useEffect(() => {
        localStorage.setItem('branding_reflections', JSON.stringify(reflections));
    }, [reflections]);





    // Handlers
    const handleBack = () => navigate('/dashboard');

    const updatePositioning = (updates: Partial<BrandingPositioning>) => {
        store.updateBrandingPositioning(updates);
    };

    const updateAudience = (updates: Partial<AudienceIntelligence>) => {
        store.updateAudienceIntelligence(updates);
    };

    const addPillar = (text: string) => {
        store.addCoreTheme(text);
    };

    const deletePillar = (id: string) => {
        store.deleteCoreTheme(id);
    };

    const addPlatform = (platform: Omit<Platform, 'id'>) => {
        store.addPlatform(platform);
        setIsAddPlatformOpen(false);
    };

    const deletePlatform = (id: string) => {
        store.deletePlatform(id);
    };

    const addContent = (item: Omit<BrandingContentItem, 'id' | 'createdAt' | 'status'>) => {
        store.addBrandingContent(item);
        setIsAddContentOpen(false);
    };

    const updateContentStatus = (id: string, status: BrandingContentItem['status']) => {
        store.updateBrandingContent(id, { status });
    };

    const runStrategicAnalysis = async (item: BrandingContentItem) => {
        try {
            const systemPrompt = `You are a World-Class Personal Branding & Authority Strategist.
Your role is to deconstruct content using the Authority-Building System.
You focus on turning content into "Teaching Assets" that build extreme trust and authority.

STRATEGIC CONTEXT:
User positioning: ${positioning.knownFor || 'General Authority'}
Core Themes: ${positioning.coreThemes.map(p => p.text).join(', ') || 'Not specified'}
What they are NOT: ${positioning.antiThemes.join(', ') || 'Not specified'}
Target Audience: ${audienceIntelligence.topSegments.join(', ') || 'General'}
Recurring Pain Points: ${audienceIntelligence.recurringPainPoints.join(', ') || 'Not specified'}

Analyze the content based on the following 15 Core Principles:
${CORE_PRINCIPLES.map((p, i) => `${i + 1}. ${p}`).join('\n')}

CLASSIFICATION RULES:
- Classify Intent as: Authority, Trust, Relatability, Teaching, or Lead Generation.
- Evaluate Conversion Path: Newsletter, Lead, Teaching Asset, or None.

OUTPUT FORMAT (STRICTLY FOLLOW):
SECTION A — Executive Summary
- Overall Authority Score (0–100)
- Virality Potential (0–100)
- Content Classification [Authority/Trust/Relatability/Teaching/Lead Gen]
- Conversion Path Alignment [Score 0-100]
- Biggest Strategic Opportunity (1 sentence)

SECTION B — Structural Deconstruction
- The Hook: [Does it interrupt the pattern? Analysis]
- The Authority Signal: [Where is the proof/expertise? Analysis]
- The Teaching Bridge: [How does it solve a pain point? Analysis]
- The CTA / Path: [Is the conversion path clear?]

SECTION C — 15-Point Principle Audit
[Detailed evaluation for each principle with Status and Action]

SECTION D — Authority Upgrades
[Specific edits to increase "Known For" association]

SECTION E — Strategic Implementation Checklist`;

            const userPrompt = `CONTENT TO ANALYZE:
Title: ${item.title}
Body: ${item.body}
Intent: ${item.intent}
Conversion Path: ${item.conversionPath}

ANALYSIS GOAL:
- Maximize Authority association
- Ensure alignment with "Known For" (${positioning.knownFor})
- Verify if it solves a recurring pain point: ${audienceIntelligence.recurringPainPoints.slice(0, 3).join(', ')}`;

            const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
            const response = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    model: "gpt-4o",
                    messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: userPrompt }
                    ],
                    temperature: 0.7,
                }),
            });

            if (!response.ok) throw new Error("API call failed");
            const data = await response.json();
            const analysis = data.choices[0].message.content;

            store.updateBrandingContent(item.id, { analysis });

            return analysis;
        } catch (error) {
            console.error(error);
            alert("Failed to run analysis. Check API key.");
        }
    };

    const runComparisonAnalysis = async () => {
        if (!contentA || !contentB) return;
        setIsComparing(true);
        try {
            const systemPrompt = `You are a World-Class Content Strategist. Your goal is to perform a deep comparative analysis between two pieces of content using the "15 Core Virality & Authority Principles".

15 Core Principles:
${CORE_PRINCIPLES.map((p, i) => `${i + 1}. ${p}`).join('\n')}

OUTPUT FORMAT (STRICTLY FOLLOW):
SECTION A — High-Level Strategy Contrast: Provide a clear table-style contrast of the core strategy.
SECTION B — Principle-by-Principle Comparison: Compare both pieces across all 15 principles.
SECTION C — Strategic Gaps: Identify exactly where Content B wins and why.
SECTION D — Replication Without Copying: Extract the underlying structural patterns of Content B for use in Content A.
SECTION E — Personalized Upgrade Plan: 5-step actionable plan to upgrade Content A.

Focus on strategy, structure, positioning, and intent. Avoid surface-level style only.`;

            const userPrompt = `CONTENT A (User Content):
---
${contentA}
---

CONTENT B (Creator Content):
---
${contentB}
---

Perform the Strategic Comparison.`;

            const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-4o',
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: userPrompt }
                    ],
                    temperature: 0.7
                })
            });

            if (!response.ok) throw new Error("API call failed");
            const data = await response.json();
            const result = data.choices[0].message.content;
            setComparisonResult(result);
        } catch (error) {
            console.error('Comparison error:', error);
            alert("Failed to run comparison analysis.");
        } finally {
            setIsComparing(false);
        }
    };



    return (
        <div className={`min-h-screen ${THEME_CLASSES.BG_PRIMARY} pb-24 font-sans`}>
            {/* Header */}
            <header className="sticky top-0 z-30 px-6 py-6 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-border-light dark:border-border-dark">
                <div className="flex items-center justify-between mb-6">
                    <button onClick={handleBack} className="p-2 -ml-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-all">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-xl font-black tracking-tight text-heading-light dark:text-text-dark">Identity OS</h1>
                    <div className="w-10"></div>
                </div>

                <div className="flex gap-1 p-1 bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark overflow-x-auto no-scrollbar">
                    {(['foundation', 'platforms', 'content', 'reflection', 'benchmarking', 'viral_library'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-none px-4 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${activeTab === tab
                                ? 'bg-accent text-white-smoke shadow-glow'
                                : 'text-subtext-light dark:text-subtext-dark hover:bg-black/5 dark:hover:bg-white/5'
                                }`}
                        >
                            {tab === 'viral_library' ? 'Viral Library' : tab}
                        </button>
                    ))}
                </div>
            </header>

            <main className="px-6 py-8 pb-20 max-w-lg mx-auto">
                <AnimatePresence mode="wait">
                    {activeTab === 'foundation' && (
                        <motion.div
                            key="foundation"
                            variants={LUXURY_ANIMATIONS.fadeIn}
                            initial="initial"
                            animate="animate"
                            exit="initial"
                            className="space-y-8"
                        >
                            <section className="space-y-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Target className="w-4 h-4 text-accent" />
                                    <h2 className="text-[10px] font-black uppercase tracking-widest text-subtext-light dark:text-subtext-dark">Strategic Positioning</h2>
                                </div>
                                <textarea
                                    value={positioning.knownFor}
                                    onChange={e => updatePositioning({ knownFor: e.target.value })}
                                    placeholder="Who are you and what problem do you solve?"
                                    className={`w-full h-32 p-5 text-sm ${THEME_CLASSES.INPUT} resize-none`}
                                />
                                <div className="flex items-center gap-2 mt-6">
                                    <Users className="w-4 h-4 text-accent" />
                                    <h2 className="text-[10px] font-black uppercase tracking-widest text-subtext-light dark:text-subtext-dark">Target Audience</h2>
                                </div>
                                <textarea
                                    value={audienceIntelligence.topSegments.join(', ')}
                                    onChange={e => updateAudience({ topSegments: e.target.value.split(',').map(s => s.trim()) })}
                                    placeholder="Describe your ideal client/follower..."
                                    className={`w-full h-32 p-5 text-sm ${THEME_CLASSES.INPUT} resize-none`}
                                />
                                <div className="flex items-center gap-2 mt-6">
                                    <MessageSquare className="w-4 h-4 text-accent" />
                                    <h2 className="text-[10px] font-black uppercase tracking-widest text-subtext-light dark:text-subtext-dark">Primary Intent</h2>
                                </div>
                                <textarea
                                    value={positioning.intent}
                                    onChange={e => updatePositioning({ intent: e.target.value })}
                                    placeholder="What is the #1 goal of your content? (e.g., Get inbound calls, Build newsletter list)"
                                    className={`w-full h-32 p-5 text-sm ${THEME_CLASSES.INPUT} resize-none`}
                                />
                            </section>

                            <section className="pt-4">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xs font-black uppercase tracking-widest text-subtext-light dark:text-subtext-dark">Expertise Pillars</h2>
                                    <button onClick={() => setIsAddPillarOpen(true)} className="p-2 bg-accent/10 text-accent rounded-lg">
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {positioning.coreThemes.map(pillar => (
                                        <div key={pillar.id} className="group relative">
                                            <span className="px-4 py-2 bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl text-xs font-bold flex items-center gap-2">
                                                {pillar.text}
                                                <button onClick={() => deletePillar(pillar.id)} className="opacity-0 group-hover:opacity-100 transition-opacity ml-1">
                                                    <X className="w-3 h-3 text-red-500" />
                                                </button>
                                            </span>
                                        </div>
                                    ))}
                                    {positioning.coreThemes.length === 0 && <p className="text-xs text-subtext-light italic">No pillars added yet.</p>}
                                </div>
                            </section>
                        </motion.div>
                    )}

                    {activeTab === 'platforms' && (
                        <motion.div
                            key="platforms"
                            variants={LUXURY_ANIMATIONS.fadeIn}
                            initial="initial"
                            animate="animate"
                            exit="initial"
                            className="space-y-6"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xs font-black uppercase tracking-widest text-subtext-light dark:text-subtext-dark">Distribution Channels</h2>
                                <button onClick={() => setIsAddPlatformOpen(true)} className="p-3 bg-accent text-white-smoke rounded-xl shadow-glow active:scale-95 transition-all">
                                    <Plus className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="grid gap-4">
                                {platforms.map(platform => (
                                    <div key={platform.id} className={`${THEME_CLASSES.CARD} p-5 relative group`}>
                                        <button onClick={() => deletePlatform(platform.id)} className="absolute top-4 right-4 p-2 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:bg-red-50 rounded-lg">
                                            <X className="w-4 h-4" />
                                        </button>
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="p-2 bg-accent/10 rounded-lg">
                                                <Globe className="w-5 h-5 text-accent" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-heading-light dark:text-text-dark">{platform.name}</h3>
                                                <p className="text-[10px] font-black uppercase text-accent tracking-widest">{platform.frequency}</p>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-[10px] text-subtext-light font-bold">Main Format</span>
                                                <span className="text-xs font-bold">{platform.format}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-[10px] text-subtext-light font-bold">Target Goal</span>
                                                <span className="text-xs font-bold text-accent">{platform.goal}</span>
                                            </div>
                                            <div className="pt-2">
                                                <div className="flex justify-between mb-1">
                                                    <span className="text-[9px] font-black uppercase text-subtext-light">Commitment Level</span>
                                                    <span className="text-[9px] font-black text-accent">{platform.effort}/5</span>
                                                </div>
                                                <div className="h-1 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                                                    <div className="h-full bg-accent" style={{ width: `${(platform.effort / 5) * 100}%` }}></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'content' && (
                        <motion.div
                            key="content"
                            variants={LUXURY_ANIMATIONS.fadeIn}
                            initial="initial"
                            animate="animate"
                            exit="initial"
                            className="space-y-6"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xs font-black uppercase tracking-widest text-subtext-light dark:text-subtext-dark">Content System</h2>
                                <button onClick={() => setIsAddContentOpen(true)} className="p-3 bg-accent text-white-smoke rounded-xl shadow-glow active:scale-95 transition-all">
                                    <Plus className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                {contentItems.map(item => (
                                    <div
                                        key={item.id}
                                        className={`${THEME_CLASSES.CARD} p-5 cursor-pointer`}
                                        onClick={() => setSelectedContent(item)}
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <h3 className="font-bold text-heading-light dark:text-text-dark">{item.title}</h3>
                                            <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${item.status === 'published' ? 'bg-green-100 text-green-600' :
                                                item.status === 'draft' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                {item.status}
                                            </span>
                                        </div>
                                        <p className="text-xs text-subtext-light line-clamp-2 mb-4">
                                            {item.body || 'No content yet...'}
                                        </p>
                                        <div className="flex items-center justify-between pt-3 border-t border-border-light dark:border-border-dark">
                                            <div className="flex gap-2">
                                                {item.platformIds.map(pid => (
                                                    <span key={pid} className="text-[10px] font-bold text-accent">
                                                        #{platforms.find(p => p.id === pid)?.name}
                                                    </span>
                                                ))}
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-subtext-light" />
                                        </div>
                                    </div>
                                ))}
                                {contentItems.length === 0 && (
                                    <div className="text-center py-20 bg-surface-light dark:bg-surface-dark rounded-3xl border border-dashed border-border-light dark:border-border-dark">
                                        <Lightbulb className="w-10 h-10 text-accent/20 mx-auto mb-4" />
                                        <p className="text-sm font-bold text-subtext-light dark:text-subtext-dark">Idea bank is empty.</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}



                    {activeTab === 'reflection' && (
                        <motion.div
                            key="reflection"
                            variants={LUXURY_ANIMATIONS.fadeIn}
                            initial="initial"
                            animate="animate"
                            exit="initial"
                            className="space-y-8"
                        >
                            <section className={`${THEME_CLASSES.CARD} p-6 bg-gradient-to-br from-accent/5 to-transparent`}>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-accent rounded-lg text-white">
                                        <Shield className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-heading-light dark:text-text-dark">Alignment Check</h3>
                                        <p className="text-[10px] font-black text-accent uppercase tracking-widest">Weekly Reflection</p>
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    {[
                                        { id: 'alignment', q: "Does my current output reflect my core pillars?" },
                                        { id: 'sustainability', q: "Is my posting frequency sustainable for my mental health?" },
                                        { id: 'audience', q: "Am I speaking to my defined audience or chasing vanity?" }
                                    ].map((item) => (
                                        <div key={item.id} className="space-y-3">
                                            <p className="text-xs font-bold leading-relaxed italic text-subtext-light dark:text-subtext-dark">
                                                "{item.q}"
                                            </p>
                                            <textarea
                                                value={reflections[item.id] || ''}
                                                onChange={e => setReflections(prev => ({ ...prev, [item.id]: e.target.value }))}
                                                placeholder="Reflect here..."
                                                className={`w-full h-24 p-4 text-xs ${THEME_CLASSES.INPUT} resize-none`}
                                            />
                                        </div>
                                    ))}
                                    <div className="pt-4 border-t border-border-light dark:border-border-dark">
                                        <p className="text-[10px] font-black uppercase text-accent mb-4 tracking-widest">Quarterly Energy Assessment</p>
                                        <div className="flex justify-between items-center bg-surface-light dark:bg-surface-dark p-4 rounded-xl border border-border-light dark:border-border-dark">
                                            <span className="text-xs font-bold">Sustainability Score</span>
                                            <div className="flex gap-1">
                                                {[1, 2, 3, 4, 5].map(score => (
                                                    <button
                                                        key={score}
                                                        onClick={() => setReflections(prev => ({ ...prev, sustainability_score: score.toString() }))}
                                                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${reflections.sustainability_score === score.toString() ? 'bg-accent text-white' : 'bg-black/5 text-subtext-light'}`}
                                                    >
                                                        {score}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            const blob = new Blob([JSON.stringify(reflections, null, 2)], { type: 'application/json' });
                                            const url = URL.createObjectURL(blob);
                                            const a = document.createElement('a');
                                            a.href = url;
                                            a.download = `Branding_Reflection_${new Date().toISOString().split('T')[0]}.json`;
                                            a.click();
                                        }}
                                        className={`w-full py-4 rounded-xl font-black ${THEME_CLASSES.BTN_PRIMARY}`}
                                    >
                                        Export Mastery Journal
                                    </button>
                                </div>
                            </section>
                        </motion.div>
                    )}

                    {activeTab === 'benchmarking' && (
                        <motion.div
                            key="benchmarking"
                            variants={LUXURY_ANIMATIONS.fadeIn}
                            initial="initial"
                            animate="animate"
                            exit="initial"
                            className="space-y-8"
                        >
                            <header className="space-y-2">
                                <h2 className="text-2xl font-black text-heading-light dark:text-text-dark tracking-tight">Strategic Benchmarking</h2>
                                <p className="text-xs text-subtext-light dark:text-subtext-dark font-medium uppercase tracking-[0.2em] opacity-50">Compare Content Efficiency</p>
                            </header>

                            <div className="grid gap-6">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-accent px-2">Content A (Your Draft)</label>
                                    <textarea
                                        value={contentA}
                                        onChange={(e) => setContentA(e.target.value)}
                                        placeholder="Paste your content text or script here..."
                                        className="w-full h-40 p-6 bg-black/5 dark:bg-white/5 border border-border-light dark:border-border-dark rounded-3xl text-sm placeholder:opacity-20 focus:border-accent transition-all outline-none resize-none leading-relaxed"
                                    />
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-subtext-light dark:text-subtext-dark px-2">Content B (Benchmark)</label>
                                    <textarea
                                        value={contentB}
                                        onChange={(e) => setContentB(e.target.value)}
                                        placeholder="Paste the creator's high-performing content here..."
                                        className="w-full h-40 p-6 bg-black/5 dark:bg-white/5 border border-border-light dark:border-border-dark rounded-3xl text-sm placeholder:opacity-20 focus:border-accent transition-all outline-none resize-none leading-relaxed"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-center py-4">
                                <button
                                    onClick={runComparisonAnalysis}
                                    disabled={isComparing || !contentA || !contentB}
                                    className={`px-12 py-5 rounded-full font-black text-xs uppercase tracking-widest flex items-center gap-3 transition-all ${isComparing ? 'bg-accent/20 text-accent cursor-wait' : 'bg-accent text-white shadow-glow hover:scale-105 active:scale-95'
                                        }`}
                                >
                                    {isComparing ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Running Comparative Audit...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-4 h-4" />
                                            Run Strategic Comparison
                                        </>
                                    )}
                                </button>
                            </div>

                            {comparisonResult && !isComparing && (
                                <div className="mt-12 space-y-8">
                                    <h3 className="text-xs font-black uppercase tracking-widest text-accent flex items-center gap-2 px-2">
                                        <Shield className="w-3 h-3" /> Comparison Report
                                    </h3>
                                    <StrategicReport analysis={comparisonResult} />
                                </div>
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'viral_library' && (
                        <motion.div
                            key="viral_library"
                            variants={LUXURY_ANIMATIONS.fadeIn}
                            initial="initial"
                            animate="animate"
                            exit="initial"
                            className="space-y-8"
                        >
                            <header className="space-y-2">
                                <h2 className="text-2xl font-black text-heading-light dark:text-text-dark tracking-tight">Viral Library</h2>
                                <p className="text-xs text-subtext-light dark:text-subtext-dark font-medium uppercase tracking-[0.2em] opacity-50">High-Impact Commercial Assets</p>
                            </header>

                            {isLoadingPacks ? (
                                <div className="flex flex-col items-center justify-center py-20 gap-4">
                                    <Loader2 className="w-8 h-8 text-accent animate-spin" />
                                    <p className="text-xs font-black uppercase tracking-widest text-accent">Syncing with Notion...</p>
                                </div>
                            ) : (
                                <div className="grid gap-6">
                                    {commercialPacks.length > 0 ? (
                                        commercialPacks.map((pack) => (
                                            <div key={pack.id} className={`${THEME_CLASSES.CARD} p-6 relative group overflow-hidden`}>
                                                <div className="absolute top-0 left-0 w-1 h-full bg-accent" />
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <h3 className="font-black text-lg text-heading-light dark:text-text-dark">{pack.name}</h3>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <Package className="w-3 h-3 text-accent" />
                                                            <span className="text-[10px] font-bold text-subtext-light uppercase tracking-wider">{pack.assets} Assets</span>
                                                        </div>
                                                    </div>
                                                    <div className="p-2 bg-accent/10 rounded-lg text-accent">
                                                        <Zap className="w-5 h-5" />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4 mt-6">
                                                    <div className="p-3 bg-black/5 dark:bg-white/5 rounded-2xl border border-border-light dark:border-border-dark">
                                                        <div className="flex items-center gap-1.5 mb-1">
                                                            <DollarSign className="w-3 h-3 text-green-500" />
                                                            <span className="text-[8px] font-black uppercase tracking-widest opacity-50">Potential</span>
                                                        </div>
                                                        <p className="font-black text-sm text-green-600 dark:text-green-400">{pack.revenuePotential}</p>
                                                    </div>
                                                    <div className="p-3 bg-black/5 dark:bg-white/5 rounded-2xl border border-border-light dark:border-border-dark">
                                                        <div className="flex items-center gap-1.5 mb-1">
                                                            <TrendingUp className="w-3 h-3 text-accent" />
                                                            <span className="text-[8px] font-black uppercase tracking-widest opacity-50">Efficiency</span>
                                                        </div>
                                                        <p className="font-black text-sm text-accent">{pack.efficiency}</p>
                                                    </div>
                                                </div>

                                                <button className="w-full mt-6 py-4 rounded-xl border border-accent/20 text-accent font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-accent hover:text-white transition-all group-hover:shadow-glow">
                                                    <ExternalLink className="w-3 h-3" />
                                                    Explore Strategy Pack
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-20 bg-surface-light dark:bg-surface-dark rounded-[2.5rem] border border-dashed border-border-light dark:border-border-dark">
                                            <Package className="w-12 h-12 text-accent/20 mx-auto mb-4" />
                                            <p className="text-sm font-bold text-subtext-light dark:text-subtext-dark mb-2">No Commercial Packs Found</p>
                                            <p className="text-[10pt] text-subtext-light/60 max-w-[200px] mx-auto italic">
                                                Add items to your "Commercial Packs" database in Notion to see them here.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Modals */}
            <AnimatePresence>
                {isAddPillarOpen && (
                    <SimpleInputModal
                        title="New Expertise Pillar"
                        placeholder="e.g., Modular Design, AI Systems"
                        onClose={() => setIsAddPillarOpen(false)}
                        onSave={(val) => { addPillar(val); setIsAddPillarOpen(false); }}
                    />
                )}
                {isAddPlatformOpen && (
                    <PlatformModal
                        onClose={() => setIsAddPlatformOpen(false)}
                        onSave={addPlatform}
                    />
                )}
                {isAddContentOpen && (
                    <ContentModal
                        platforms={platforms}
                        pillars={positioning.coreThemes}
                        onClose={() => setIsAddContentOpen(false)}
                        onSave={addContent}
                    />
                )}
                {selectedContent && (
                    <ContentDetailModal
                        item={selectedContent}
                        platforms={platforms}
                        onClose={() => setSelectedContent(null)}
                        onStatusUpdate={updateContentStatus}
                        onAnalyze={runStrategicAnalysis}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

// Sub-components
const SimpleInputModal: React.FC<{ title: string, placeholder: string, onClose: () => void, onSave: (val: string) => void }> = ({ title, placeholder, onClose, onSave }) => {
    const [value, setValue] = useState('');
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="w-full max-w-sm bg-white dark:bg-surface-dark rounded-[2.5rem] p-8">
                <h2 className="text-xl font-black mb-6">{title}</h2>
                <input value={value} onChange={e => setValue(e.target.value)} type="text" placeholder={placeholder} className={`w-full p-4 mb-6 ${THEME_CLASSES.INPUT}`} onKeyDown={e => e.key === 'Enter' && onSave(value)} />
                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 py-4 font-bold text-subtext-light">Cancel</button>
                    <button onClick={() => onSave(value)} className={`flex-2 px-8 py-4 rounded-xl font-black ${THEME_CLASSES.BTN_PRIMARY}`}>Save</button>
                </div>
            </motion.div>
        </motion.div>
    );
};

const PlatformModal: React.FC<{ onClose: () => void, onSave: (p: Omit<Platform, 'id'>) => void }> = ({ onClose, onSave }) => {
    const [name, setName] = useState('');
    const [goal, setGoal] = useState('');
    const [format, setFormat] = useState('');
    const [frequency, setFrequency] = useState('');
    const [effort, setEffort] = useState(3);

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm px-4 pb-10">
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="w-full max-w-md bg-white dark:bg-surface-dark rounded-[2.5rem] p-8 shadow-luxury">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-black">Strategic Intent</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5"><X /></button>
                </div>
                <div className="space-y-5">
                    <input value={name} onChange={e => setName(e.target.value)} placeholder="Platform (e.g. LinkedIn, Twitter)" className={`w-full p-4 ${THEME_CLASSES.INPUT}`} />
                    <input value={goal} onChange={e => setGoal(e.target.value)} placeholder="Primary Goal (e.g. Inbound Gigs)" className={`w-full p-4 ${THEME_CLASSES.INPUT}`} />
                    <div className="grid grid-cols-2 gap-3">
                        <input value={format} onChange={e => setFormat(e.target.value)} placeholder="Main Format" className={`w-full p-4 ${THEME_CLASSES.INPUT}`} />
                        <input value={frequency} onChange={e => setFrequency(e.target.value)} placeholder="Posting Freq" className={`w-full p-4 ${THEME_CLASSES.INPUT}`} />
                    </div>
                    <div>
                        <label className="text-[10px] font-black uppercase text-subtext-light mb-2 block">Effort Committed: {effort}/5</label>
                        <input type="range" min="1" max="5" value={effort} onChange={e => setEffort(parseInt(e.target.value))} className="w-full accent-accent" />
                    </div>
                    <button onClick={() => onSave({ name, goal, format, frequency, effort })} className={`w-full py-5 mt-4 rounded-2xl font-black ${THEME_CLASSES.BTN_PRIMARY}`}>Link Platform</button>
                </div>
            </motion.div>
        </motion.div>
    );
};

const ContentModal: React.FC<{ platforms: Platform[], pillars: ExpertisePillar[], onClose: () => void, onSave: (c: Omit<BrandingContentItem, 'id' | 'createdAt' | 'status'>) => void }> = ({ platforms, pillars, onClose, onSave }) => {
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
    const [selectedPillar, setSelectedPillar] = useState<string>('');
    const [intent, setIntent] = useState<'Authority' | 'Trust' | 'Relatability' | 'Teaching' | 'Lead Generation'>('Authority');
    const [conversionPath, setConversionPath] = useState<'Newsletter' | 'Lead' | 'Teaching Asset' | 'None'>('None');

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="w-full max-w-md h-[90vh] bg-white dark:bg-surface-dark rounded-t-[3rem] p-8 flex flex-col">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-black">New Idea</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5"><X /></button>
                </div>
                <div className="flex-1 space-y-6 overflow-y-auto no-scrollbar">
                    <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Headline or Hook" className={`w-full p-4 ${THEME_CLASSES.INPUT}`} />
                    <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Expand the thought here..." className={`w-full h-48 p-4 ${THEME_CLASSES.INPUT} resize-none`} />

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-black uppercase text-subtext-light mb-2 block">Intent</label>
                            <select value={intent} onChange={e => setIntent(e.target.value as BrandingContentItem['intent'])} className={`w-full p-3 text-xs ${THEME_CLASSES.INPUT}`}>
                                <option value="Authority">Authority Building</option>
                                <option value="Trust">Trust Building</option>
                                <option value="Relatability">Relatability</option>
                                <option value="Teaching">Education/Teaching</option>
                                <option value="Lead Generation">Lead Generation</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase text-subtext-light mb-2 block">Link to Asset</label>
                            <select value={conversionPath} onChange={e => setConversionPath(e.target.value as BrandingContentItem['conversionPath'])} className={`w-full p-3 text-xs ${THEME_CLASSES.INPUT}`}>
                                <option value="None">No direct conversion</option>
                                <option value="Newsletter">Newsletter Signup</option>
                                <option value="Lead">Lead Magnet / DM</option>
                                <option value="Teaching Asset">Free Teaching Asset</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] font-black uppercase text-subtext-light mb-3 block">Associate Pillar</label>
                        <div className="flex flex-wrap gap-2">
                            {pillars.map(p => (
                                <button key={p.id} onClick={() => setSelectedPillar(p.id)} className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${selectedPillar === p.id ? 'bg-accent text-white' : 'bg-black/5 dark:bg-white/5 text-subtext-light'}`}>{p.text}</button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] font-black uppercase text-subtext-light mb-3 block">Target Platforms</label>
                        <div className="flex flex-wrap gap-2">
                            {platforms.map(p => (
                                <button
                                    key={p.id}
                                    onClick={() => setSelectedPlatforms(prev => prev.includes(p.id) ? prev.filter(pi => pi !== p.id) : [...prev, p.id])}
                                    className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${selectedPlatforms.includes(p.id) ? 'bg-accent text-white' : 'bg-black/5 dark:bg-white/5 text-subtext-light'}`}
                                >
                                    {p.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                <button onClick={() => onSave({ title, body, platformIds: selectedPlatforms, pillarId: selectedPillar, intent, conversionPath })} className={`w-full py-5 mt-8 rounded-2xl font-black ${THEME_CLASSES.BTN_PRIMARY}`}>Capture Idea</button>
            </motion.div>
        </motion.div>
    );
};

const ContentDetailModal: React.FC<{
    item: BrandingContentItem,
    platforms: Platform[],
    onClose: () => void,
    onStatusUpdate: (id: string, s: BrandingContentItem['status']) => void,
    onAnalyze: (item: BrandingContentItem) => Promise<string | undefined>
}> = ({ item, platforms, onClose, onStatusUpdate, onAnalyze }) => {
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const handleAnalyze = async () => {
        setIsAnalyzing(true);
        await onAnalyze(item);
        setIsAnalyzing(false);
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-xl px-4 py-8">
            <div className="w-full max-w-sm h-full flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex gap-2">
                        {item.platformIds.map((pid: string) => (
                            <span key={pid} className="px-3 py-1 bg-white/10 border border-white/20 rounded-full text-[10px] font-black text-white-smoke uppercase">
                                {platforms.find(p => p.id === pid)?.name}
                            </span>
                        ))}
                    </div>
                    <button onClick={onClose} className="text-white-smoke p-2"><X /></button>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar space-y-6 pb-12">
                    <div className="flex justify-between items-start">
                        <h2 className="text-2xl font-black text-white-smoke leading-tight">{item.title}</h2>
                        <button
                            onClick={handleAnalyze}
                            disabled={isAnalyzing}
                            className={`flex-none p-4 rounded-2xl transition-all ${isAnalyzing ? 'bg-accent/50 animate-pulse' : 'bg-accent shadow-glow'} text-white`}
                        >
                            {isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                        </button>
                    </div>

                    <div className="p-6 bg-white/5 border border-white/10 rounded-[2rem] text-silver text-sm leading-relaxed whitespace-pre-wrap">
                        {item.body || "No content provided."}
                    </div>

                    {(item.analysis || isAnalyzing) && (
                        <div className="space-y-8">
                            <h3 className="text-xs font-black uppercase tracking-widest text-accent flex items-center gap-2">
                                <Shield className="w-3 h-3" /> Strategic Audit Result
                            </h3>
                            {isAnalyzing ? (
                                <div className="p-6 bg-accent/5 border border-accent/20 rounded-[2.5rem] space-y-4">
                                    <div className="h-4 bg-accent/10 rounded w-3/4 animate-pulse"></div>
                                    <div className="h-4 bg-accent/10 rounded w-full animate-pulse"></div>
                                    <div className="h-4 bg-accent/10 rounded w-5/6 animate-pulse"></div>
                                </div>
                            ) : (
                                <StrategicReport analysis={item.analysis || ''} />
                            )}
                        </div>
                    )}
                </div>

                <div className="space-y-3 mt-4 pt-4 border-t border-white/10">
                    {item.status !== 'published' && (
                        <button onClick={() => { onStatusUpdate(item.id, 'published'); onClose(); }} className="w-full py-5 bg-green-500 text-white rounded-2xl font-black shadow-glow-green flex items-center justify-center gap-3">
                            <Send className="w-5 h-5" /> Mark as Published
                        </button>
                    )}
                    {item.status === 'idea' && (
                        <button onClick={() => { onStatusUpdate(item.id, 'draft'); onClose(); }} className="w-full py-5 bg-blue-500 text-white rounded-2xl font-black shadow-glow-blue">
                            Move to Drafts
                        </button>
                    )}
                    <button onClick={onClose} className="w-full py-5 bg-white/10 text-white-smoke rounded-2xl font-bold">Close View</button>
                </div>
            </div>
        </motion.div>
    );
};

const StrategicReport: React.FC<{ analysis: string }> = ({ analysis }) => {
    // Regex to split by "SECTION [A-E] — " but keep the title
    const sectionParts = analysis.split(/(?=SECTION [A-E] — )/).filter(Boolean);

    if (sectionParts.length < 5) return (
        <div className="text-[11px] text-white-smoke/80 font-medium leading-relaxed whitespace-pre-wrap p-6 bg-white/5 rounded-2xl">
            {analysis}
        </div>
    );

    const renderSection = (raw: string, index: number) => {
        const lines = raw.split('\n');
        const headerMatch = lines[0].match(/SECTION ([A-E]) — (.*)/);
        const title = headerMatch ? headerMatch[2] : `Section ${String.fromCharCode(65 + index)}`;
        const content = lines.slice(1).join('\n').trim();

        // Custom styling for specific sections based on content appearance
        if (index === 0) { // Section A
            return (
                <motion.div key={index} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 bg-accent/5 border border-accent/20 rounded-[2.5rem] relative overflow-hidden">
                    <div className="absolute -top-4 -right-4 opacity-5"><BarChart3 className="w-24 h-24" /></div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-accent mb-4">A — {title}</h4>
                    <div className="space-y-4 text-xs text-white-smoke/90 leading-relaxed whitespace-pre-wrap">
                        {content}
                    </div>
                </motion.div>
            );
        }

        if (content.match(/^\d+\./m)) { // Look for numbered lists for Principles
            return (
                <div key={index} className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-subtext-dark px-2">{String.fromCharCode(65 + index)} — {title}</h4>
                    <div className="space-y-3">
                        {content.split('\n').filter(l => l.match(/^\d+\./)).map((line, i) => (
                            <div key={i} className="flex gap-4 p-5 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/[0.07] transition-colors">
                                <span className="flex-none w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center text-[10px] font-black text-accent">{line.match(/^\d+/)?.[0]}</span>
                                <div className="space-y-1">
                                    <p className="text-[11px] font-bold text-white-smoke">{line.replace(/^\d+\.\s*/, '')}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        // Default Section Style (D, E, etc)
        const colors = ['text-blue-400', 'text-green-400', 'text-purple-400'];
        const bgs = ['bg-blue-500/5 border-blue-500/10', 'bg-green-500/5 border-green-500/10', 'bg-purple-500/5 border-purple-500/10'];
        const colorClass = colors[(index - 1) % colors.length];
        const bgClass = bgs[(index - 1) % bgs.length];

        return (
            <div key={index} className={`p-6 ${bgClass} rounded-[2.5rem]`}>
                <h4 className={`text-[10px] font-black uppercase tracking-widest ${colorClass} mb-4`}>{String.fromCharCode(65 + index)} — {title}</h4>
                <div className="text-[11px] text-white-smoke/80 leading-relaxed whitespace-pre-wrap">{content}</div>
            </div>
        );
    };

    return (
        <div className="space-y-10 pb-10">
            {sectionParts.map((section, idx) => renderSection(section, idx))}
        </div>
    );
};

export default BrandingSection;
