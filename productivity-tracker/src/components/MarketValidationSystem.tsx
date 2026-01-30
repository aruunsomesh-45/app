import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Target, Users, BarChart3, Scissors, Calendar,
    Plus, Trash2, AlertCircle, TrendingUp, TrendingDown,
    Minus, CheckCircle2, XCircle, Info, Lightbulb,
    ArrowRight
} from 'lucide-react';

interface MarketProblem {
    id: string;
    description: string;
    who: string;
    frequency: string;
    existingFailures: string;
}

interface CustomerPersona {
    id: string;
    role: string;
    context: string;
    constraints: string;
    pains: string[];
    outcomes: string[];
    triggers: string[];
    source: string;
}

interface TractionMetric {
    id: string;
    name: string;
    value: string;
    isVanity: boolean;
    trend: 'up' | 'down' | 'stable';
}

interface DecisionThresholds {
    kill: string;
    iterate: string;
    scale: string;
}

interface Milestone {
    id: string;
    week: number;
    goal: string;
    validationGoal: string;
    outcome: string;
    status: 'pending' | 'completed' | 'failed';
}

const MarketValidationSystem: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'problems' | 'personas' | 'metrics' | 'decisions' | 'timeline'>('problems');

    // Data States
    const [problems, setProblems] = useState<MarketProblem[]>(() => JSON.parse(localStorage.getItem('mkt_problems') || '[]'));
    const [personas, setPersonas] = useState<CustomerPersona[]>(() => JSON.parse(localStorage.getItem('mkt_personas') || '[]'));
    const [metrics, setMetrics] = useState<TractionMetric[]>(() => JSON.parse(localStorage.getItem('mkt_metrics') || '[]'));
    const [thresholds, setThresholds] = useState<DecisionThresholds>(() => JSON.parse(localStorage.getItem('mkt_thresholds') || '{ "kill": "", "iterate": "", "scale": "" }'));
    const [timeline, setTimeline] = useState<Milestone[]>(() => JSON.parse(localStorage.getItem('mkt_timeline') || '[]'));

    // Persist data
    useEffect(() => localStorage.setItem('mkt_problems', JSON.stringify(problems)), [problems]);
    useEffect(() => localStorage.setItem('mkt_personas', JSON.stringify(personas)), [personas]);
    useEffect(() => localStorage.setItem('mkt_metrics', JSON.stringify(metrics)), [metrics]);
    useEffect(() => localStorage.setItem('mkt_thresholds', JSON.stringify(thresholds)), [thresholds]);
    useEffect(() => localStorage.setItem('mkt_timeline', JSON.stringify(timeline)), [timeline]);

    const addProblem = () => {
        const newProblem: MarketProblem = {
            id: Date.now().toString(),
            description: '',
            who: '',
            frequency: '',
            existingFailures: ''
        };
        setProblems([...problems, newProblem]);
    };

    const addPersona = () => {
        const newPersona: CustomerPersona = {
            id: Date.now().toString(),
            role: '',
            context: '',
            constraints: '',
            pains: [],
            outcomes: [],
            triggers: [],
            source: ''
        };
        setPersonas([...personas, newPersona]);
    };

    const addMetric = () => {
        const newMetric: TractionMetric = {
            id: Date.now().toString(),
            name: '',
            value: '',
            isVanity: false,
            trend: 'stable'
        };
        setMetrics([...metrics, newMetric]);
    };

    const addMilestone = () => {
        const newMilestone: Milestone = {
            id: Date.now().toString(),
            week: timeline.length + 1,
            goal: '',
            validationGoal: '',
            outcome: '',
            status: 'pending'
        };
        setTimeline([...timeline, newMilestone]);
    };

    const updateProblem = (id: string, updates: Partial<MarketProblem>) => {
        setProblems(problems.map(p => p.id === id ? { ...p, ...updates } : p));
    };

    const updatePersona = (id: string, updates: Partial<CustomerPersona>) => {
        setPersonas(personas.map(p => p.id === id ? { ...p, ...updates } : p));
    };

    const updateMetric = (id: string, updates: Partial<TractionMetric>) => {
        setMetrics(metrics.map(m => m.id === id ? { ...m, ...updates } : m));
    };

    const updateMilestone = (id: string, updates: Partial<Milestone>) => {
        setTimeline(timeline.map(m => m.id === id ? { ...m, ...updates } : m));
    };

    return (
        <div className="bg-white dark:bg-gray-900 rounded-3xl overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-800 flex flex-col h-full">
            {/* Nav */}
            <div className="flex border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 p-2 overflow-x-auto">
                {[
                    { id: 'problems', label: 'Problems', icon: Target },
                    { id: 'personas', label: 'Personas', icon: Users },
                    { id: 'metrics', label: 'Metrics', icon: BarChart3 },
                    { id: 'decisions', label: 'Decisions', icon: Scissors },
                    { id: 'timeline', label: 'Timeline', icon: Calendar }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-white dark:bg-gray-800 text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                <AnimatePresence mode="wait">
                    {activeTab === 'problems' && (
                        <motion.div
                            key="problems"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-6"
                        >
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">Market Problem Statements</h2>
                                    <p className="text-sm text-gray-500">Define sharp, testable problems being solved.</p>
                                </div>
                                <button onClick={addProblem} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all">
                                    <Plus className="w-4 h-4" /> Add Problem
                                </button>
                            </div>

                            <div className="grid gap-6">
                                {problems.map((problem) => (
                                    <div key={problem.id} className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 group relative">
                                        <button
                                            onClick={() => setProblems(problems.filter(p => p.id !== problem.id))}
                                            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-xs font-bold uppercase text-gray-400 mb-1 block">The Problem</label>
                                                <textarea
                                                    value={problem.description}
                                                    onChange={(e) => updateProblem(problem.id, { description: e.target.value })}
                                                    placeholder="What exactly is the friction point?"
                                                    className="w-full bg-white dark:bg-gray-900 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                                                    rows={2}
                                                />
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-xs font-bold uppercase text-gray-400 mb-1 block">Who experiences it?</label>
                                                    <input
                                                        type="text"
                                                        value={problem.who}
                                                        onChange={(e) => updateProblem(problem.id, { who: e.target.value })}
                                                        placeholder="Target user segment"
                                                        className="w-full bg-white dark:bg-gray-900 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs font-bold uppercase text-gray-400 mb-1 block">How often / Why now?</label>
                                                    <input
                                                        type="text"
                                                        value={problem.frequency}
                                                        onChange={(e) => updateProblem(problem.id, { frequency: e.target.value })}
                                                        placeholder="Frequency and urgency"
                                                        className="w-full bg-white dark:bg-gray-900 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold uppercase text-gray-400 mb-1 block">Why do existing solutions fail?</label>
                                                <textarea
                                                    value={problem.existingFailures}
                                                    onChange={(e) => updateProblem(problem.id, { existingFailures: e.target.value })}
                                                    placeholder="The gap in the market..."
                                                    className="w-full bg-white dark:bg-gray-900 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                                                    rows={2}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {problems.length === 0 && (
                                    <div className="text-center py-12 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-3xl">
                                        <Target className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                                        <p className="text-gray-500">No problem statements yet. Start by defining what you're solving.</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'personas' && (
                        <motion.div
                            key="personas"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-6"
                        >
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">Customer Persona Mapping</h2>
                                    <p className="text-sm text-gray-500">Map roles, paints, outcomes, and triggers.</p>
                                </div>
                                <button onClick={addPersona} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all">
                                    <Plus className="w-4 h-4" /> Add Persona
                                </button>
                            </div>

                            <div className="grid gap-6">
                                {personas.map((persona) => (
                                    <div key={persona.id} className="bg-indigo-50/30 dark:bg-indigo-900/10 rounded-2xl p-6 border border-indigo-100/50 dark:border-indigo-900/20 group relative">
                                        <button
                                            onClick={() => setPersonas(personas.filter(p => p.id !== persona.id))}
                                            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="text-xs font-bold uppercase text-indigo-400 mb-1 block">Role & Identity</label>
                                                    <input
                                                        type="text"
                                                        value={persona.role}
                                                        onChange={(e) => updatePersona(persona.id, { role: e.target.value })}
                                                        placeholder="e.g. Early-stage Founder"
                                                        className="w-full bg-white dark:bg-gray-900 border-none rounded-xl p-3 text-sm outline-none"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs font-bold uppercase text-indigo-400 mb-1 block">Context & Constraints</label>
                                                    <textarea
                                                        value={persona.context}
                                                        onChange={(e) => updatePersona(persona.id, { context: e.target.value })}
                                                        placeholder="Work environment, time, budget..."
                                                        className="w-full bg-white dark:bg-gray-900 border-none rounded-xl p-3 text-sm outline-none shadow-sm"
                                                        rows={2}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs font-bold uppercase text-indigo-400 mb-1 block">Where do they look for solutions?</label>
                                                    <input
                                                        type="text"
                                                        value={persona.source}
                                                        onChange={(e) => updatePersona(persona.id, { source: e.target.value })}
                                                        placeholder="Google, Twitter, Niche Forums..."
                                                        className="w-full bg-white dark:bg-gray-900 border-none rounded-xl p-3 text-sm outline-none"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="text-xs font-bold uppercase text-indigo-400 mb-1 block">Pains, Outcomes & Triggers</label>
                                                    <div className="space-y-2">
                                                        <textarea
                                                            value={persona.pains.join('\n')}
                                                            onChange={(e) => updatePersona(persona.id, { pains: e.target.value.split('\n') })}
                                                            placeholder="Core Pains (one per line)"
                                                            className="w-full bg-white dark:bg-gray-900 border-none rounded-xl p-3 text-sm outline-none shadow-sm"
                                                            rows={2}
                                                        />
                                                        <textarea
                                                            value={persona.outcomes.join('\n')}
                                                            onChange={(e) => updatePersona(persona.id, { outcomes: e.target.value.split('\n') })}
                                                            placeholder="Desired Outcomes"
                                                            className="w-full bg-white dark:bg-gray-900 border-none rounded-xl p-3 text-sm outline-none shadow-sm"
                                                            rows={2}
                                                        />
                                                        <input
                                                            type="text"
                                                            value={persona.triggers.join(', ')}
                                                            onChange={(e) => updatePersona(persona.id, { triggers: e.target.value.split(',').map(s => s.trim()) })}
                                                            placeholder="Buying Triggers (comma separated)"
                                                            className="w-full bg-white dark:bg-gray-900 border-none rounded-xl p-3 text-sm outline-none"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'metrics' && (
                        <motion.div
                            key="metrics"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-6"
                        >
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">Traction Metrics</h2>
                                    <p className="text-sm text-gray-500">Track demand signals and separate vanity from reality.</p>
                                </div>
                                <button onClick={addMetric} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all">
                                    <Plus className="w-4 h-4" /> Add Metric
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {metrics.map((metric) => (
                                    <div key={metric.id} className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm relative group">
                                        <button
                                            onClick={() => setMetrics(metrics.filter(m => m.id !== metric.id))}
                                            className="absolute top-2 right-2 p-1 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                        <div className="space-y-3">
                                            <input
                                                type="text"
                                                value={metric.name}
                                                onChange={(e) => updateMetric(metric.id, { name: e.target.value })}
                                                placeholder="Metric Name"
                                                className="w-full font-bold text-gray-800 dark:text-white bg-transparent border-none p-0 focus:ring-0 outline-none"
                                            />
                                            <div className="flex items-end justify-between">
                                                <input
                                                    type="text"
                                                    value={metric.value}
                                                    onChange={(e) => updateMetric(metric.id, { value: e.target.value })}
                                                    placeholder="Value"
                                                    className="text-2xl font-black text-emerald-600 dark:text-emerald-400 bg-transparent border-none p-0 w-24 focus:ring-0 outline-none"
                                                />
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => updateMetric(metric.id, { trend: metric.trend === 'up' ? 'down' : metric.trend === 'down' ? 'stable' : 'up' })}
                                                        className={`p-1.5 rounded-lg ${metric.trend === 'up' ? 'bg-emerald-100 text-emerald-600' : metric.trend === 'down' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}
                                                    >
                                                        {metric.trend === 'up' ? <TrendingUp className="w-4 h-4" /> : metric.trend === 'down' ? <TrendingDown className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                            </div>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={metric.isVanity}
                                                    onChange={(e) => updateMetric(metric.id, { isVanity: e.target.checked })}
                                                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
                                                <span className={`text-xs font-bold ${metric.isVanity ? 'text-amber-500' : 'text-gray-400'}`}>
                                                    {metric.isVanity ? 'Vanity Metric' : 'Decision-Driving'}
                                                </span>
                                            </label>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'decisions' && (
                        <motion.div
                            key="decisions"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-8"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-red-50 dark:bg-red-900/10 rounded-2xl p-6 border border-red-100 dark:border-red-900/20">
                                    <div className="flex items-center gap-3 mb-4">
                                        <XCircle className="w-6 h-6 text-red-500" />
                                        <h3 className="font-bold text-red-900 dark:text-red-300">Kill Threshold</h3>
                                    </div>
                                    <textarea
                                        value={thresholds.kill}
                                        onChange={(e) => setThresholds({ ...thresholds, kill: e.target.value })}
                                        placeholder="When do we stop or pivot?"
                                        className="w-full bg-white dark:bg-gray-900 border-none rounded-xl p-3 text-sm text-red-900 dark:text-red-200 outline-none"
                                        rows={4}
                                    />
                                </div>
                                <div className="bg-amber-50 dark:bg-amber-900/10 rounded-2xl p-6 border border-amber-100 dark:border-amber-900/20">
                                    <div className="flex items-center gap-3 mb-4">
                                        <AlertCircle className="w-6 h-6 text-amber-500" />
                                        <h3 className="font-bold text-amber-900 dark:text-amber-300">Iterate Threshold</h3>
                                    </div>
                                    <textarea
                                        value={thresholds.iterate}
                                        onChange={(e) => setThresholds({ ...thresholds, iterate: e.target.value })}
                                        placeholder="What assumptions need fixing?"
                                        className="w-full bg-white dark:bg-gray-900 border-none rounded-xl p-3 text-sm text-amber-900 dark:text-amber-200 outline-none"
                                        rows={4}
                                    />
                                </div>
                                <div className="bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl p-6 border border-emerald-100 dark:border-emerald-900/20">
                                    <div className="flex items-center gap-3 mb-4">
                                        <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                                        <h3 className="font-bold text-emerald-900 dark:text-emerald-300">Scale Threshold</h3>
                                    </div>
                                    <textarea
                                        value={thresholds.scale}
                                        onChange={(e) => setThresholds({ ...thresholds, scale: e.target.value })}
                                        placeholder="When do we double down?"
                                        className="w-full bg-white dark:bg-gray-900 border-none rounded-xl p-3 text-sm text-emerald-900 dark:text-emerald-200 outline-none"
                                        rows={4}
                                    />
                                </div>
                            </div>

                            <div className="bg-gray-900 text-white rounded-3xl p-8 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 opacity-10">
                                    <Info className="w-32 h-32" />
                                </div>
                                <div className="relative z-10 max-w-2xl">
                                    <h3 className="text-2xl font-black mb-4 flex items-center gap-3">
                                        <Lightbulb className="w-8 h-8 text-yellow-400" />
                                        Base decisions on evidence, not attachment.
                                    </h3>
                                    <p className="text-gray-400 mb-6">Set explicit thresholds before you launch. This prevents emotional anchoring and helps you pivot faster.</p>
                                    <div className="flex gap-4">
                                        <button className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold flex items-center gap-2 transition-all">
                                            Run Rationality Check <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'timeline' && (
                        <motion.div
                            key="timeline"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-6"
                        >
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">Execution Timeline</h2>
                                    <p className="text-sm text-gray-500">Short, concrete milestones focused on validation.</p>
                                </div>
                                <button onClick={addMilestone} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all">
                                    <Plus className="w-4 h-4" /> Add Milestone
                                </button>
                            </div>

                            <div className="relative">
                                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-100 dark:bg-gray-800" />
                                <div className="space-y-8 relative">
                                    {timeline.map((milestone) => (
                                        <div key={milestone.id} className="flex gap-6 group">
                                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-black text-xl z-10 transition-all ${milestone.status === 'completed' ? 'bg-emerald-500 text-white' : milestone.status === 'failed' ? 'bg-red-500 text-white' : 'bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 text-gray-400'}`}>
                                                {milestone.week}
                                            </div>
                                            <div className="flex-1 bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm relative">
                                                <button
                                                    onClick={() => setTimeline(timeline.filter(m => m.id !== milestone.id))}
                                                    className="absolute top-4 right-4 p-2 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="space-y-4">
                                                        <div>
                                                            <label className="text-[10px] font-black uppercase text-gray-400 mb-1 block">Goals for Week {milestone.week}</label>
                                                            <textarea
                                                                value={milestone.goal}
                                                                onChange={(e) => updateMilestone(milestone.id, { goal: e.target.value })}
                                                                placeholder="Deliverables..."
                                                                className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                                                                rows={2}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-[10px] font-black uppercase text-gray-400 mb-1 block">Validation Goal</label>
                                                            <input
                                                                type="text"
                                                                value={milestone.validationGoal}
                                                                onChange={(e) => updateMilestone(milestone.id, { validationGoal: e.target.value })}
                                                                placeholder="Specific signal to look for..."
                                                                className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-4">
                                                        <div>
                                                            <label className="text-[10px] font-black uppercase text-gray-400 mb-1 block">Outcome / Review</label>
                                                            <textarea
                                                                value={milestone.outcome}
                                                                onChange={(e) => updateMilestone(milestone.id, { outcome: e.target.value })}
                                                                placeholder="What did we learn?"
                                                                className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none h-full"
                                                                rows={4}
                                                            />
                                                        </div>
                                                        <div className="flex gap-2">
                                                            {(['pending', 'completed', 'failed'] as const).map((s) => (
                                                                <button
                                                                    key={s}
                                                                    onClick={() => updateMilestone(milestone.id, { status: s })}
                                                                    className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${milestone.status === s ? (s === 'completed' ? 'bg-emerald-100 text-emerald-600' : s === 'failed' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600') : 'bg-transparent text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                                                                >
                                                                    {s}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default MarketValidationSystem;
