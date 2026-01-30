import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import NanoBananaAI from './NanoBananaAI';
import { THEME_CLASSES } from '../utils/theme';

import {
    Bell, Bolt, Target, ArrowRight,
    Dumbbell, Code, Brain, BookOpen, Cpu,
    Users, Briefcase, Fingerprint, Laptop, Sparkles, TrendingUp,
    Utensils, Zap, Wind, Timer, MoreVertical,
    Activity, Heart, Upload, BookPlus, FolderPlus,
    Flame, Footprints, Plus, Trash2, XCircle, StickyNote, Calendar, LayoutGrid
} from 'lucide-react';

interface Routine {
    id: string;
    title: string;
    icon: React.ElementType;
    color: string;
    bg: string;
    link: string;
    desc: string;
    img?: string | null;
    isCustom?: boolean;
}

interface LifeArea {
    id: string;
    title: string;
    color: string;
    indicatorColor: string;
    value: number;
}

interface Priority {
    id: string;
    text: string;
    tag: string;
    color: string;
    done: boolean;
}

interface AntiGoal {
    id: string;
    text: string;
    why?: string;
}

interface DailyNote {
    id: string;
    text: string;
    completed: boolean;
    type: 'general' | 'meeting' | 'reminder' | 'reflection';
}

const LifeAreaPill: React.FC<{ icon: React.ElementType, title: string, color: string, indicator?: React.ReactNode }> = ({ icon: Icon, title, color, indicator }) => (
    <div className="snap-start shrink-0 flex items-center gap-2 pl-3 pr-4 py-2 bg-surface-light dark:bg-surface-dark rounded-full border border-border-light dark:border-border-dark shadow-soft whitespace-nowrap cursor-pointer hover:shadow-elegant transition-all duration-300">
        <Icon className={`w-5 h-5 ${color}`} />
        <span className="text-sm font-medium text-text-light dark:text-text-dark">{title}</span>
        {indicator}
    </div>
);

const STATIC_ROUTINES = [
    { id: 'static-board', title: 'Personal Board', icon: LayoutGrid, color: 'text-gray-800', bg: 'bg-gray-100', link: '/board', desc: 'Widgets', img: '/hero-image.png' },
    { id: 'static-workout', title: 'Workout', icon: Dumbbell, color: 'text-orange-500', bg: 'bg-orange-50', link: '/section/workout', desc: 'Active', img: '/images/section-workout.png' },
    { id: 'static-coding', title: 'Coding', icon: Code, color: 'text-blue-500', bg: 'bg-blue-50', link: '/section/coding', desc: '3 Projects', img: '/images/section-coding.jpg' },
    { id: 'static-meditation', title: 'Meditation', icon: Brain, color: 'text-purple-500', bg: 'bg-purple-50', link: '/section/meditation', desc: '10 min/day', img: '/images/section-meditation.jpg' },
    { id: 'static-breathwork', title: 'Breathwork', icon: Wind, color: 'text-rose-500', bg: 'bg-rose-50', link: '/section/meditation?type=breathing', desc: 'Active' },
    { id: 'static-reading', title: 'Reading', icon: BookOpen, color: 'text-yellow-500', bg: 'bg-yellow-50', link: '/section/reading', desc: 'Chapter 4', img: '/images/section-reading.jpg' },
    { id: 'static-networking', title: 'Networking', icon: Users, color: 'text-pink-500', bg: 'bg-pink-50', link: '/section/networking', desc: '2 Sessions', img: '/images/section-teaching.jpg' },
    { id: 'static-ai', title: 'AI', icon: Cpu, color: 'text-teal-500', bg: 'bg-teal-50', link: '/section/ai', desc: 'Learning', img: '/images/section-ai.png' },
    { id: 'static-business', title: 'Business', icon: Briefcase, color: 'text-green-500', bg: 'bg-green-50', link: '/section/business', desc: 'Growth', img: '/images/section-business.jpg' },
    { id: 'static-branding', title: 'Personal Branding', icon: Fingerprint, color: 'text-indigo-500', bg: 'bg-indigo-50', link: '/section/branding', desc: 'Content', img: '/images/section-branding.png' },
    { id: 'static-freelancing', title: 'Freelancing', icon: Laptop, color: 'text-blue-600', bg: 'bg-blue-50', link: '/section/freelancing', desc: 'Active Gigs', img: '/images/section-freelancing.png' },
    { id: 'static-looksmaxing', title: 'Looksmaxing', icon: Sparkles, color: 'text-rose-500', bg: 'bg-rose-50', link: '/section/looksmaxing', desc: 'Routine', img: '/images/section-looksmaxing-new.png' },
    { id: 'static-market', title: 'Market', icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-50', link: '/section/market', desc: 'Analysis', img: '/images/section-market.png' },
    { id: 'static-cooking', title: 'Cooking', icon: Utensils, color: 'text-red-500', bg: 'bg-red-50', link: '/section/cooking', desc: 'Recipes', img: '/images/section-cooking.png' },
    { id: 'static-kickboxing', title: 'Kickboxing', icon: Zap, color: 'text-orange-600', bg: 'bg-orange-50', link: '/workout/kickboxing', desc: 'Striking' },
    { id: 'static-mobility', title: 'Mobility Flow', icon: Wind, color: 'text-sky-500', bg: 'bg-sky-50', link: '/workout/mobility', desc: 'Flexibility' },
    { id: 'static-endurance', title: 'Endurance Run', icon: Timer, color: 'text-emerald-600', bg: 'bg-emerald-50', link: '/workout/endurance', desc: 'Cardio' },
    { id: 'static-powerlifting', title: 'Powerlifting', icon: Dumbbell, color: 'text-indigo-600', bg: 'bg-indigo-50', link: '/workout/powerlifting', desc: 'Strength' },
    { id: 'static-plyometrics', title: 'Plyometrics', icon: Sparkles, color: 'text-amber-500', bg: 'bg-amber-50', link: '/workout/plyometrics', desc: 'Explosive' }
];

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const [isNanoBananaOpen, setIsNanoBananaOpen] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [routines, setRoutines] = useState<Routine[]>(STATIC_ROUTINES);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isEditingLifeAreas, setIsEditingLifeAreas] = useState(false);
    const [lifeAreas, setLifeAreas] = useState<LifeArea[]>(() => {
        const saved = localStorage.getItem('dashboard_life_areas');
        if (saved) return JSON.parse(saved);
        return [
            { id: 'life', title: 'Life', color: 'text-rosy-granite', indicatorColor: 'bg-rosy-granite', value: 85 },
            { id: 'mindless', title: 'Mindless', color: 'text-silver', indicatorColor: 'bg-silver', value: 20 },
            { id: 'physical', title: 'Physical', color: 'text-graphite', indicatorColor: 'bg-graphite', value: 70 }
        ];
    });

    useEffect(() => {
        localStorage.setItem('dashboard_life_areas', JSON.stringify(lifeAreas));
    }, [lifeAreas]);

    const handleAreaUpdate = (id: string, field: string, value: string | number) => {
        setLifeAreas((prev: LifeArea[]) => prev.map((area: LifeArea) => area.id === id ? { ...area, [field]: value } : area));
    };

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const [steps, setSteps] = useState(8432);
    const stepGoal = 10000;
    const [streak, setStreak] = useState(12);

    // Planner Previews
    const [priorities] = useState<Priority[]>(() => JSON.parse(localStorage.getItem('planner_priorities') || '[]'));
    const [antiGoals] = useState<AntiGoal[]>(() => JSON.parse(localStorage.getItem('planner_anti_goals') || '[]'));
    const [notes] = useState<DailyNote[]>(() => JSON.parse(localStorage.getItem('planner_notes') || '[]'));
    const [weeklyGoals] = useState<string[]>(() => JSON.parse(localStorage.getItem('planner_weekly_goals') || '[]'));

    useEffect(() => {
        const loadCustomRoutines = () => {
            const hidden = JSON.parse(localStorage.getItem('hiddenRoutines') || '[]');
            const customData = localStorage.getItem('customCategories');

            let mappedCustom: Routine[] = [];
            if (customData) {
                const parsed = JSON.parse(customData);
                mappedCustom = parsed.map((cat: { id: string; title: string; subtitle?: string; img?: string | null }) => {
                    const key = `category_override_${cat.id}`;
                    const overrideStr = localStorage.getItem(key);
                    const override = overrideStr ? JSON.parse(overrideStr) : null;

                    return {
                        id: cat.id,
                        title: override?.title || cat.title,
                        icon: Dumbbell,
                        color: 'text-indigo-500',
                        bg: 'bg-indigo-50',
                        link: `/section/custom/${cat.id}`,
                        desc: cat.subtitle || 'Custom Workout',
                        img: override?.img || cat.img,
                        isCustom: true
                    };
                });
            }

            setRoutines(() => {
                const visibleStatic = STATIC_ROUTINES.filter(r => !hidden.includes(r.id)).map(r => {
                    const key = `category_override_${r.id}`;
                    const overrideStr = localStorage.getItem(key);
                    const override = overrideStr ? JSON.parse(overrideStr) : null;

                    return {
                        ...r,
                        title: override?.title || r.title,
                        img: override?.img || r.img
                    };
                });
                return [...visibleStatic, ...mappedCustom];
            });
        };

        loadCustomRoutines();
        // Listen for updates
        window.addEventListener('storage', loadCustomRoutines);
        window.addEventListener('routinesUpdated', loadCustomRoutines);
        return () => {
            window.removeEventListener('storage', loadCustomRoutines);
            window.removeEventListener('routinesUpdated', loadCustomRoutines);
        };
    }, []);

    const handleDeleteRoutine = (e: React.MouseEvent, id: string, isCustom: boolean) => {
        e.stopPropagation();
        if (isCustom) {
            const customData = localStorage.getItem('customCategories');
            if (customData) {
                const parsed = JSON.parse(customData);
                const updated = parsed.filter((c: { id: string }) => c.id !== id);
                localStorage.setItem('customCategories', JSON.stringify(updated));
                window.dispatchEvent(new Event('routinesUpdated'));
            }
        } else {
            const hidden = JSON.parse(localStorage.getItem('hiddenRoutines') || '[]');
            localStorage.setItem('hiddenRoutines', JSON.stringify([...hidden, id]));
            window.dispatchEvent(new Event('routinesUpdated'));
        }
        setDeletingId(null);
    };

    const handleAddRoutine = () => {
        navigate('/workout/categories/add');
    };

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark pb-28 font-sans transition-colors duration-500">
            {/* Nano Banana AI Chat Overlay */}
            <NanoBananaAI isOpen={isNanoBananaOpen} onClose={() => setIsNanoBananaOpen(false)} />

            {/* Header */}
            <header className="sticky top-0 z-40 px-6 py-4 flex justify-between items-center bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-md border-b border-border-light dark:border-border-dark">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-accent shadow-glow">
                        <img
                            alt="User"
                            className="w-full h-full object-cover"
                            src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop"
                        />
                    </div>
                    <div>
                        <p className="text-xs text-subtext-light dark:text-subtext-dark font-medium uppercase tracking-wider">Good Morning, {new Date().getHours() < 12 ? '☀️' : '🌙'}</p>
                        <h1 className="text-lg font-bold leading-none text-heading-light dark:text-text-dark">Arun</h1>
                        <p className="text-[10px] text-accent font-bold mt-1 flex items-center gap-1">
                            {currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                            <span className="w-1 h-1 rounded-full bg-silver"></span>
                            {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => navigate('/planner')}
                        className="p-2 rounded-full bg-slate-50 shadow-soft border border-slate-200 hover:scale-105 transition-transform flex items-center justify-center"
                    >
                        <Target className="w-5 h-5 text-slate-600" />
                    </button>
                    <button
                        onClick={() => setIsNanoBananaOpen(true)}
                        className="p-2 rounded-full bg-[#FFE135] shadow-soft border border-[#FDD835] hover:scale-105 transition-transform flex items-center justify-center"
                    >
                        <span className="text-lg">🍌</span>
                    </button>
                    <button className="relative p-2 rounded-full bg-surface-light dark:bg-surface-dark shadow-soft border border-border-light dark:border-border-dark hover:scale-105 transition-transform">
                        <Bell className="w-5 h-5 text-text-light dark:text-subtext-dark" />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-accent rounded-full border border-surface-light dark:border-surface-dark"></span>
                    </button>
                </div>
            </header>

            <main className="px-6 pt-6 space-y-8 max-w-md mx-auto">
                {/* Focus Score Card */}
                <section className="animate-fade-in relative overflow-hidden rounded-2xl bg-gradient-to-br from-graphite via-carbon-black to-graphite text-white-smoke shadow-luxury p-6">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-accent/20 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent/15 blur-3xl rounded-full translate-y-1/2 -translate-x-1/2"></div>

                    <div className="relative z-10 flex justify-between items-start">
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight text-white-smoke">Today's Focus</h2>
                            <p className="text-silver text-sm mt-1">Focus on what truly matters.</p>

                            <div className="mt-6">
                                <div className="flex items-end gap-2 mb-2">
                                    <span className="text-4xl font-bold text-accent">84%</span>
                                    <span className="text-sm text-silver mb-1">Focus Score</span>
                                </div>
                                <div className="w-full bg-white-smoke/10 rounded-full h-2">
                                    <div className="bg-accent h-2 rounded-full transition-all duration-700" style={{ width: '84%' }}></div>
                                </div>
                            </div>
                        </div>
                        <div className="p-3 bg-white-smoke/5 rounded-xl border border-white-smoke/10 backdrop-blur-sm">
                            <Bolt className="text-accent w-8 h-8 fill-current" />
                        </div>
                    </div>
                </section>

                {/* Vitals: Streak & Steps */}
                <section className="grid grid-cols-2 gap-4">
                    {/* Streaks Calculator Card */}
                    <div className="enhanced-card-mini card-glow-orange card-interactive card-animate-scale relative overflow-hidden group" style={{ borderRadius: '2rem' }}>
                        <div className="absolute -top-6 -right-6 w-20 h-20 bg-accent/10 blur-2xl rounded-full"></div>
                        <div className="relative z-10 flex flex-col h-full">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-2 bg-accent/10 rounded-xl">
                                    <Flame className="w-5 h-5 text-accent fill-accent animate-pulse" />
                                </div>
                                <button
                                    onClick={() => setStreak(prev => prev + 1)}
                                    className="w-7 h-7 rounded-full bg-accent text-white-smoke flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-elegant"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                </button>
                            </div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-black text-heading-light dark:text-text-dark">{streak}</span>
                                <span className="text-xs font-bold text-subtext-light dark:text-subtext-dark">Days</span>
                            </div>
                            <p className="text-[10px] font-black text-subtext-light dark:text-subtext-dark uppercase tracking-widest mt-1 mb-3">Goal: 30</p>

                            <div className="flex gap-1 mt-auto">
                                {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                                    <div key={d} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${d <= (streak % 7 || 7) ? 'bg-accent shadow-glow' : 'bg-border-light dark:bg-border-dark'}`}></div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Steps Calculator Card */}
                    <div className="enhanced-card-mini card-glow-accent card-interactive card-animate-scale card-animate-stagger-1 relative overflow-hidden group" style={{ borderRadius: '2rem' }}>
                        <div className="absolute -top-6 -right-6 w-20 h-20 bg-accent/10 blur-2xl rounded-full"></div>
                        <div className="relative z-10 flex flex-col h-full">
                            <div className="flex items-center justify-between mb-2">
                                <div className="p-2 bg-accent/10 rounded-xl">
                                    <Footprints className="w-5 h-5 text-accent" />
                                </div>
                                <button
                                    onClick={() => setSteps(prev => prev + 1000)}
                                    className="w-7 h-7 rounded-full bg-accent text-white-smoke flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-elegant"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                </button>
                            </div>

                            <div className="mt-1">
                                <span className="text-2xl font-black text-heading-light dark:text-text-dark">{steps.toLocaleString()}</span>
                                <div className="w-full bg-border-light dark:bg-border-dark h-2 rounded-full mt-2 overflow-hidden">
                                    <div
                                        className="h-full bg-accent rounded-full transition-all duration-1000"
                                        style={{ width: `${Math.min(100, (steps / stepGoal) * 100)}%` }}
                                    ></div>
                                </div>
                                <div className="flex justify-between items-center mt-2">
                                    <p className="text-[10px] font-black text-subtext-light dark:text-subtext-dark uppercase tracking-widest">
                                        Goal: {stepGoal.toLocaleString()}
                                    </p>
                                    <span className="text-[10px] font-black text-accent uppercase tracking-widest">
                                        {Math.round((steps / stepGoal) * 100)}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Life Areas Scroll */}
                <section>
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">Life Areas</h3>
                        <button
                            onClick={() => setIsEditingLifeAreas(!isEditingLifeAreas)}
                            className="text-primary text-xs font-semibold hover:text-accent transition-colors"
                        >
                            {isEditingLifeAreas ? 'Done' : 'Edit'}
                        </button>
                    </div>

                    {isEditingLifeAreas ? (
                        <div className="space-y-3 bg-surface-light dark:bg-surface-dark p-4 rounded-2xl border border-border-light dark:border-border-dark shadow-soft">
                            {lifeAreas.map((area: LifeArea) => (
                                <div key={area.id} className="flex flex-col gap-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[10px] font-bold text-subtext-light dark:text-subtext-dark uppercase tracking-widest">{area.id}</label>
                                        <span className="text-xs font-bold text-accent">{area.value}%</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="text"
                                            value={area.title}
                                            onChange={(e) => handleAreaUpdate(area.id, 'title', e.target.value)}
                                            className="flex-1 px-3 py-1.5 text-sm bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-lg focus:outline-none focus:border-accent"
                                            placeholder="Area Name"
                                        />
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            value={area.value}
                                            onChange={(e) => handleAreaUpdate(area.id, 'value', parseInt(e.target.value))}
                                            className="w-24 accent-accent"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex space-x-3 overflow-x-auto pb-2 snap-x -mx-6 px-6 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                            {lifeAreas.map((area: LifeArea) => (
                                <LifeAreaPill
                                    key={area.id}
                                    icon={area.id === 'physical' ? Activity : area.id === 'life' ? Heart : Sparkles}
                                    title={area.title}
                                    color={area.color}
                                    indicator={
                                        <div className="flex items-center gap-1.5 ml-2">
                                            <div className={`w-1.5 h-1.5 rounded-full ${area.indicatorColor}`}></div>
                                            <span className="text-[10px] font-bold text-subtext-light dark:text-subtext-dark">{area.value}%</span>
                                        </div>
                                    }
                                />
                            ))}
                        </div>
                    )}
                </section>

                {/* Priorities & Anti-Goals Grid */}
                <section className="space-y-4">
                    {/* Planner Quick Link with Detailed Sections */}
                    <section>
                        <motion.div
                            whileHover={{ scale: 1.01 }}
                            onClick={() => navigate('/planner')}
                            className="enhanced-card card-interactive bg-white border border-slate-200 shadow-sm p-6 flex flex-col group cursor-pointer"
                            style={{ borderRadius: '1.5rem' }}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500 shadow-sm shadow-orange-200">
                                        <Target className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-slate-900 text-lg">Focus Planner</h3>
                                        <p className="text-slate-500 text-xs font-medium">Your daily execution OS</p>
                                    </div>
                                </div>
                                <div className="w-10 h-10 rounded-full border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-black group-hover:text-white group-hover:border-black transition-all">
                                    <ArrowRight className="w-5 h-5" />
                                </div>
                            </div>

                            {/* 4 Sections Stacked One-by-One */}
                            <div className="space-y-3">
                                {/* Priorities */}
                                <div className="flex items-center gap-3 p-3 bg-orange-50/30 rounded-2xl border border-orange-100/50">
                                    <div className="p-2 bg-white rounded-xl shadow-sm">
                                        <Target className="w-4 h-4 text-orange-600" />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Priorities</p>
                                        <p className="text-sm font-black text-slate-900">{priorities.filter(p => !p.done).length} Active</p>
                                    </div>
                                </div>

                                {/* Anti-Goals */}
                                <div className="flex items-center gap-3 p-3 bg-red-50/30 rounded-2xl border border-red-100/50">
                                    <div className="p-2 bg-white rounded-xl shadow-sm">
                                        <XCircle className="w-4 h-4 text-red-600" />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Anti-Goals</p>
                                        <p className="text-sm font-black text-slate-900">{antiGoals.length} Set</p>
                                    </div>
                                </div>

                                {/* Daily Notes */}
                                <div className="flex items-center gap-3 p-3 bg-yellow-50/30 rounded-2xl border border-yellow-100/50">
                                    <div className="p-2 bg-white rounded-xl shadow-sm">
                                        <StickyNote className="w-4 h-4 text-yellow-600" />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Daily Notes</p>
                                        <p className="text-sm font-black text-slate-900">{notes.length} Logs</p>
                                    </div>
                                </div>

                                {/* Weekly Goals */}
                                <div className="flex items-center gap-3 p-3 bg-emerald-50/30 rounded-2xl border border-emerald-100/50">
                                    <div className="p-2 bg-white rounded-xl shadow-sm">
                                        <Calendar className="w-4 h-4 text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Weekly</p>
                                        <p className="text-sm font-black text-slate-900">{weeklyGoals.length} Goals</p>
                                    </div>
                                </div>
                            </div>

                            {/* Footer Indicator */}
                            <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Click to expand details</span>
                                <div className="flex -space-x-2">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="w-5 h-5 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[8px] font-bold text-slate-400">
                                            {i}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </section>
                </section>

                {/* Learning Hub - Featured Section */}
                <section>
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        onClick={() => navigate('/learning')}
                        className="enhanced-card card-glow-soft card-interactive card-animate-scale card-animate-stagger-4 relative overflow-hidden bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark"
                        style={{ borderRadius: '1.5rem' }}
                    >
                        {/* Subtle Background Elements */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-accent/10 transition-colors duration-700"></div>

                        <div className="relative z-10 p-6 flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-surface-light dark:bg-surface-dark rounded-2xl flex items-center justify-center text-accent shadow-soft border border-border-light dark:border-border-dark mb-4">
                                <Brain className="w-8 h-8" />
                            </div>

                            <h3 className="text-heading-light dark:text-text-dark font-black text-2xl mb-2">Learning Hub</h3>
                            <p className="text-subtext-light dark:text-subtext-dark text-sm leading-relaxed mb-6 max-w-xs">
                                Master any topic with AI-generated mind maps, summaries, and personalized podcasts.
                            </p>

                            <div className="flex gap-2 mb-6">
                                <span className="px-3 py-1 bg-surface-light dark:bg-surface-dark text-subtext-light dark:text-subtext-dark rounded-full text-[10px] font-bold uppercase tracking-wider border border-border-light dark:border-border-dark">
                                    AI Powered
                                </span>
                                <span className="px-3 py-1 bg-surface-light dark:bg-surface-dark text-subtext-light dark:text-subtext-dark rounded-full text-[10px] font-bold uppercase tracking-wider border border-border-light dark:border-border-dark">
                                    Mind Maps
                                </span>
                                <span className="px-3 py-1 bg-surface-light dark:bg-surface-dark text-subtext-light dark:text-subtext-dark rounded-full text-[10px] font-bold uppercase tracking-wider border border-border-light dark:border-border-dark">
                                    Deep Learning
                                </span>
                            </div>

                            <button className="group relative px-8 py-3 bg-accent text-white-smoke rounded-xl font-bold flex items-center gap-2 hover:shadow-glow transition-all active:scale-95">
                                <span>Start Learning</span>
                                <motion.div
                                    animate={{ x: [0, 5, 0] }}
                                    transition={{ repeat: Infinity, duration: 1.5 }}
                                >
                                    →
                                </motion.div>
                            </button>
                        </div>
                    </motion.div>
                </section>


                {/* Categories Grid */}
                <section>
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">Category Status</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        {routines.map((item, i) => {

                            return (
                                <div
                                    key={i}
                                    onClick={() => navigate(item.link)}
                                    className={`
                                        enhanced-card-mini card-interactive card-animate-scale
                                        relative overflow-hidden p-4 transition-all duration-300 group cursor-pointer
                                        ${item.img ? 'h-40' : 'h-auto card-glow-accent'}
                                    `}
                                    style={{ borderRadius: '1.5rem', animationDelay: `${i * 0.03}s` }}
                                >
                                    {item.img && (
                                        <>
                                            <img
                                                src={item.img}
                                                alt={item.title}
                                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
                                        </>
                                    )}

                                    <div className="relative z-10 flex flex-col h-full justify-between">
                                        <div className="flex justify-between items-start">
                                            <div className={`
                                                w-10 h-10 rounded-xl flex items-center justify-center 
                                                ${item.img ? 'bg-white/20 backdrop-blur-md text-white' : `${item.bg} ${item.color}`}
                                            `}>
                                                <item.icon className="w-5 h-5" />
                                            </div>

                                            <div className="relative">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setDeletingId(deletingId === item.id ? null : item.id);
                                                    }}
                                                    className={`p-1.5 rounded-full transition-all duration-300 ${item.img ? 'hover:bg-white/20 text-white' : 'hover:bg-gray-100 text-gray-400'}`}
                                                >
                                                    <MoreVertical className="w-5 h-5" />
                                                </button>

                                                {deletingId === item.id && (
                                                    <button
                                                        onClick={(e) => handleDeleteRoutine(e, item.id, !!item.isCustom)}
                                                        className="absolute right-0 top-10 bg-red-600 text-white text-[10px] font-bold px-3 py-2 rounded-lg shadow-xl flex items-center gap-1 z-50 animate-in fade-in zoom-in-95 duration-200 min-w-[80px]"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" /> Delete
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Quick Actions for Reading - Center View */}
                                        {item.id === 'static-reading' && (
                                            <div className="flex justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0 scale-90 group-hover:scale-100">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate('/section/reading/library', { state: { openModal: 'book' } });
                                                    }}
                                                    className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-lg border border-white/30 text-white flex items-center justify-center hover:bg-white/40 hover:scale-110 active:scale-95 transition-all shadow-luxury"
                                                    title="Add Book"
                                                >
                                                    <BookPlus className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate('/section/reading/library', { state: { openModal: 'folder' } });
                                                    }}
                                                    className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-lg border border-white/30 text-white flex items-center justify-center hover:bg-white/40 hover:scale-110 active:scale-95 transition-all shadow-luxury"
                                                    title="New Folder"
                                                >
                                                    <FolderPlus className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate('/section/reading/library', { state: { openModal: 'pdf' } });
                                                    }}
                                                    className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-lg border border-white/30 text-white flex items-center justify-center hover:bg-white/40 hover:scale-110 active:scale-95 transition-all shadow-luxury"
                                                    title="Upload PDF"
                                                >
                                                    <Upload className="w-5 h-5" />
                                                </button>
                                            </div>
                                        )}

                                        {item.id !== 'static-reading' && (
                                            <div>
                                                <h4 className={`font-bold text-lg leading-tight ${item.img ? 'text-white' : 'text-gray-900'}`}>
                                                    {item.title}
                                                </h4>
                                                <p className={`text-xs font-medium mt-1 ${item.img ? 'text-gray-300' : 'text-gray-500'}`}>
                                                    {item.desc}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <button
                        onClick={handleAddRoutine}
                        className={`w-full py-4 rounded-2xl shadow-soft border border-border-light dark:border-border-dark font-bold transition-all flex items-center justify-center gap-2 group ${THEME_CLASSES.BTN_SECONDARY}`}
                    >
                        <div className="w-8 h-8 rounded-full bg-border-light dark:bg-border-dark flex items-center justify-center group-hover:bg-accent/10 transition-colors">
                            <span className="material-icons-round text-xl">+</span>
                        </div>
                        Add New Routine
                    </button>
                </section>
            </main>

            {/* Floating Action Button */}
            <div className="fixed bottom-28 right-6 z-[60]">
                <button
                    onClick={handleAddRoutine}
                    className="w-14 h-14 bg-accent text-white-smoke rounded-full shadow-luxury hover:shadow-glow flex items-center justify-center hover:scale-110 active:scale-95 transition-all outline-none"
                >
                    <Plus className="w-6 h-6 text-white-smoke" />
                </button>
            </div>
        </div >
    );
};

export default Dashboard;
