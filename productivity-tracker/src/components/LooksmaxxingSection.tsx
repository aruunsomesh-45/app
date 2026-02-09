import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Sparkles, Apple, Dumbbell, Zap, Smile, Heart,
    BookOpen, Trophy, CheckCircle2, Lock, ChevronRight, Flame,
    X, Clock, Video, FileText, Award, Moon, Sun, Target,
    Footprints, Wind, Hand, Utensils, Play
} from 'lucide-react';
import { THEME_CLASSES, LUXURY_ANIMATIONS } from '../utils/theme';

// Types
interface Lesson { id: string; title: string; description: string; duration: string; type: 'text' | 'video'; completed: boolean; }
interface Module { id: string; title: string; description: string; icon: React.ElementType; color: string; lessons: Lesson[]; }
interface HabitEntry { date: string; habits: { [key: string]: boolean }; }
interface UserProgress { completedLessons: string[]; completedModules: string[]; quizScores: { [id: string]: number }; streak: number; lastActiveDate: string; badges: string[]; totalXP: number; habits: HabitEntry[]; }

// Five Pillars Data
const PILLARS: Module[] = [
    {
        id: 'diet', title: 'Diet & Nutrition', description: '100% clean eating - red meat, fruit, eggs, raw dairy',
        icon: Apple, color: 'from-green-500 to-emerald-600',
        lessons: [
            { id: 'd1', title: 'Core Philosophy', description: 'Health is Looks - why clean eating transforms appearance', duration: '5 min', type: 'text', completed: false },
            { id: 'd2', title: 'Allowed Foods', description: 'Red meat, fruit, eggs, honey, raw A2 dairy explained', duration: '6 min', type: 'video', completed: false },
            { id: 'd3', title: 'Foods to Avoid', description: 'Seed oils, processed foods, and why they damage you', duration: '5 min', type: 'text', completed: false },
            { id: 'd4', title: 'Cooking Guidelines', description: 'Cast iron, tallow, proper preparation methods', duration: '4 min', type: 'video', completed: false },
            { id: 'd5', title: 'Advanced: Organ Meats', description: 'Liver, bone broth, and nutrient density', duration: '5 min', type: 'text', completed: false },
            { id: 'd6', title: 'Meal Timing', description: 'When to eat for optimal hormones and energy', duration: '4 min', type: 'text', completed: false },
        ]
    },
    {
        id: 'fitness', title: 'Fitness & Movement', description: 'Natural movement patterns - walking, sprinting, sports',
        icon: Dumbbell, color: 'from-orange-500 to-red-500',
        lessons: [
            { id: 'f1', title: 'Movement Philosophy', description: 'Why natural movement beats gym routines', duration: '4 min', type: 'text', completed: false },
            { id: 'f2', title: 'Daily Walking', description: '10,000+ steps - the foundation of fitness', duration: '3 min', type: 'video', completed: false },
            { id: 'f3', title: 'Sprint Protocol', description: '10-second all-out sprints, proper recovery', duration: '5 min', type: 'video', completed: false },
            { id: 'f4', title: 'Recreational Sports', description: 'Basketball, swimming, climbing for fun fitness', duration: '4 min', type: 'text', completed: false },
            { id: 'f5', title: 'Avoid Long Cardio', description: 'Why marathon running ages you', duration: '3 min', type: 'text', completed: false },
        ]
    },
    {
        id: 'hormones', title: 'Hormone Optimization', description: 'Avoid endocrine disruptors, optimize thyroid',
        icon: Zap, color: 'from-purple-500 to-violet-600',
        lessons: [
            { id: 'h1', title: 'Endocrine Disruptors', description: 'Fragrances, plastics, polyester - hidden dangers', duration: '5 min', type: 'text', completed: false },
            { id: 'h2', title: 'Thyroid Health', description: 'The master gland for metabolism and appearance', duration: '6 min', type: 'video', completed: false },
            { id: 'h3', title: 'Sleep Optimization', description: 'Dark room, cool temp, consistent schedule', duration: '4 min', type: 'text', completed: false },
            { id: 'h4', title: 'Sunlight Exposure', description: 'Morning sun for circadian rhythm and vitamin D', duration: '4 min', type: 'text', completed: false },
        ]
    },
    {
        id: 'facial', title: 'Facial Techniques', description: 'Mewing, thumb pulling, chin tucking for structure',
        icon: Smile, color: 'from-blue-500 to-cyan-500',
        lessons: [
            { id: 'fc1', title: 'Proper Tongue Posture', description: 'Mewing basics - tongue on palate 24/7', duration: '5 min', type: 'video', completed: false },
            { id: 'fc2', title: 'Thumb Pulling', description: 'Palate expansion technique for wider face', duration: '6 min', type: 'video', completed: false },
            { id: 'fc3', title: 'Chin Tucking', description: 'Correct forward head posture', duration: '4 min', type: 'video', completed: false },
            { id: 'fc4', title: 'Chewing Practice', description: 'Hard chewing for masseter development', duration: '4 min', type: 'text', completed: false },
        ]
    },
    {
        id: 'habits', title: 'Myofunctional Habits', description: 'Breathing, posture, swallowing patterns',
        icon: Heart, color: 'from-pink-500 to-rose-500',
        lessons: [
            { id: 'hb1', title: 'Nasal Breathing', description: 'Mouth closed 24/7, even during exercise', duration: '4 min', type: 'text', completed: false },
            { id: 'hb2', title: 'Proper Swallowing', description: 'Tongue-driven swallow without facial muscles', duration: '5 min', type: 'video', completed: false },
            { id: 'hb3', title: 'Posture Correction', description: 'Shoulders back, chin tucked, spine aligned', duration: '5 min', type: 'video', completed: false },
            { id: 'hb4', title: 'Lip Seal', description: 'Maintaining closed lips at rest', duration: '3 min', type: 'text', completed: false },
        ]
    }
];

const DAILY_HABITS = [
    { id: 'steps', label: '10K Steps', icon: Footprints },
    { id: 'sprint', label: 'Sprint Session', icon: Zap },
    { id: 'thumbpull', label: 'Thumb Pulling', icon: Hand },
    { id: 'chewing', label: 'Hard Chewing', icon: Utensils },
    { id: 'cleaneating', label: 'Clean Eating', icon: Apple },
    { id: 'nasalbreath', label: 'Nasal Breathing', icon: Wind },
];

const BADGES = [
    { id: 'first-lesson', name: 'First Step', description: 'Complete your first lesson', icon: '🎯' },
    { id: 'pillar-master', name: 'Pillar Master', description: 'Complete a full pillar', icon: '🏛️' },
    { id: 'streak-7', name: 'Week Warrior', description: '7-day streak', icon: '🔥' },
    { id: 'habit-king', name: 'Habit King', description: 'Complete all daily habits', icon: '👑' },
    { id: 'all-pillars', name: 'Ascended', description: 'Complete all 5 pillars', icon: '⭐' },
    { id: 'xp-500', name: 'Dedicated', description: 'Earn 500 XP', icon: '💎' },
];

const LooksmaxxingSection: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'learn' | 'habits' | 'progress' | 'badges'>('learn');
    const [selectedPillar, setSelectedPillar] = useState<Module | null>(null);
    const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
    const [isDarkMode, setIsDarkMode] = useState(() => document.documentElement.classList.contains('dark'));

    const [progress, setProgress] = useState<UserProgress>(() => {
        const saved = localStorage.getItem('looksmaxxing_progress');
        if (saved) return JSON.parse(saved);
        return { completedLessons: [], completedModules: [], quizScores: {}, streak: 0, lastActiveDate: '', badges: [], totalXP: 0, habits: [] };
    });

    useEffect(() => { localStorage.setItem('looksmaxxing_progress', JSON.stringify(progress)); }, [progress]);

    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        if (progress.lastActiveDate !== today) {
            const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];
            setProgress(prev => ({
                ...prev,
                streak: prev.lastActiveDate === yesterdayStr ? prev.streak + 1 : 1,
                lastActiveDate: today
            }));
        }
    }, []);

    const getPillarProgress = (pillar: Module) => {
        const completed = pillar.lessons.filter(l => progress.completedLessons.includes(l.id)).length;
        return Math.round((completed / pillar.lessons.length) * 100);
    };

    const getTotalProgress = () => {
        const total = PILLARS.reduce((acc, p) => acc + p.lessons.length, 0);
        return Math.round((progress.completedLessons.length / total) * 100);
    };

    const completeLesson = (lessonId: string) => {
        if (!progress.completedLessons.includes(lessonId)) {
            const newProgress = { ...progress };
            newProgress.completedLessons.push(lessonId);
            newProgress.totalXP += 15;

            if (newProgress.completedLessons.length === 1 && !newProgress.badges.includes('first-lesson')) {
                newProgress.badges.push('first-lesson');
            }
            if (newProgress.totalXP >= 500 && !newProgress.badges.includes('xp-500')) {
                newProgress.badges.push('xp-500');
            }

            // Check pillar completion
            PILLARS.forEach(pillar => {
                const allDone = pillar.lessons.every(l => newProgress.completedLessons.includes(l.id));
                if (allDone && !newProgress.completedModules.includes(pillar.id)) {
                    newProgress.completedModules.push(pillar.id);
                    if (!newProgress.badges.includes('pillar-master')) newProgress.badges.push('pillar-master');
                }
            });

            if (newProgress.completedModules.length === 5 && !newProgress.badges.includes('all-pillars')) {
                newProgress.badges.push('all-pillars');
            }

            setProgress(newProgress);
        }
        setSelectedLesson(null);
    };

    const toggleHabit = (habitId: string) => {
        const today = new Date().toISOString().split('T')[0];
        const newProgress = { ...progress };
        let todayEntry = newProgress.habits.find(h => h.date === today);

        if (!todayEntry) {
            todayEntry = { date: today, habits: {} };
            newProgress.habits.push(todayEntry);
        }

        todayEntry.habits[habitId] = !todayEntry.habits[habitId];

        // Check if all habits completed
        const allDone = DAILY_HABITS.every(h => todayEntry!.habits[h.id]);
        if (allDone && !newProgress.badges.includes('habit-king')) {
            newProgress.badges.push('habit-king');
            newProgress.totalXP += 50;
        }

        setProgress(newProgress);
    };

    const getTodayHabits = () => {
        const today = new Date().toISOString().split('T')[0];
        return progress.habits.find(h => h.date === today)?.habits || {};
    };

    const toggleDarkMode = () => {
        document.documentElement.classList.toggle('dark');
        setIsDarkMode(!isDarkMode);
    };

    return (
        <div className={`min-h-screen ${THEME_CLASSES.BG_PRIMARY} pb-24 font-sans`}>
            {/* Header */}
            <header className="sticky top-0 z-40 px-6 py-5 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-xl border-b border-border-light dark:border-border-dark">
                <div className="flex items-center justify-between mb-4">
                    <button onClick={() => navigate('/dashboard')} className="p-2 -ml-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-all">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-6 h-6 text-rose-500" />
                        <h1 className="text-xl font-black tracking-tight text-heading-light dark:text-text-dark">Looksmaxxing</h1>
                    </div>
                    <button onClick={toggleDarkMode} className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-all">
                        {isDarkMode ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5" />}
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 overflow-x-auto no-scrollbar">
                    {[
                        { id: 'learn', label: 'Learn', icon: BookOpen },
                        { id: 'habits', label: 'Daily', icon: Target },
                        { id: 'progress', label: 'Progress', icon: Trophy },
                        { id: 'badges', label: 'Badges', icon: Award },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as typeof activeTab)}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${activeTab === tab.id
                                ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg'
                                : 'text-subtext-light dark:text-subtext-dark hover:bg-black/5 dark:hover:bg-white/5'}`}
                        >
                            <tab.icon className="w-3.5 h-3.5" />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </header>

            <main className="px-6 py-6 max-w-lg mx-auto">
                <AnimatePresence mode="wait">
                    {/* LEARN TAB */}
                    {activeTab === 'learn' && (
                        <motion.div key="learn" variants={LUXURY_ANIMATIONS.fadeIn} initial="initial" animate="animate" exit="initial" className="space-y-6">
                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-3">
                                <div className={`${THEME_CLASSES.CARD} p-4 text-center`}>
                                    <div className="flex items-center justify-center gap-1 mb-1">
                                        <Flame className="w-4 h-4 text-orange-500" />
                                        <span className="text-lg font-black text-heading-light dark:text-text-dark">{progress.streak}</span>
                                    </div>
                                    <p className="text-[9px] font-bold uppercase text-subtext-light tracking-widest">Streak</p>
                                </div>
                                <div className={`${THEME_CLASSES.CARD} p-4 text-center`}>
                                    <div className="flex items-center justify-center gap-1 mb-1">
                                        <Zap className="w-4 h-4 text-yellow-500" />
                                        <span className="text-lg font-black text-heading-light dark:text-text-dark">{progress.totalXP}</span>
                                    </div>
                                    <p className="text-[9px] font-bold uppercase text-subtext-light tracking-widest">XP</p>
                                </div>
                                <div className={`${THEME_CLASSES.CARD} p-4 text-center`}>
                                    <div className="flex items-center justify-center gap-1 mb-1">
                                        <Sparkles className="w-4 h-4 text-rose-500" />
                                        <span className="text-lg font-black text-heading-light dark:text-text-dark">{getTotalProgress()}%</span>
                                    </div>
                                    <p className="text-[9px] font-bold uppercase text-subtext-light tracking-widest">Complete</p>
                                </div>
                            </div>

                            {/* Pillars */}
                            <div className="space-y-4">
                                {PILLARS.map((pillar, index) => {
                                    const pillarProgress = getPillarProgress(pillar);
                                    const isCompleted = progress.completedModules.includes(pillar.id);
                                    return (
                                        <motion.div
                                            key={pillar.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            onClick={() => setSelectedPillar(pillar)}
                                            className={`${THEME_CLASSES.CARD} p-5 cursor-pointer group overflow-hidden relative`}
                                        >
                                            <div className={`absolute inset-0 bg-gradient-to-r ${pillar.color} opacity-5 group-hover:opacity-10 transition-opacity`} />
                                            <div className="relative z-10 flex items-start gap-4">
                                                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${pillar.color} flex items-center justify-center text-white shadow-lg`}>
                                                    <pillar.icon className="w-6 h-6" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="font-bold text-heading-light dark:text-text-dark">{pillar.title}</h3>
                                                        {isCompleted && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                                                    </div>
                                                    <p className="text-xs text-subtext-light dark:text-subtext-dark mb-3">{pillar.description}</p>
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex-1 h-1.5 bg-border-light dark:bg-border-dark rounded-full overflow-hidden">
                                                            <div className={`h-full bg-gradient-to-r ${pillar.color} transition-all duration-500`} style={{ width: `${pillarProgress}%` }} />
                                                        </div>
                                                        <span className="text-[10px] font-bold text-rose-500">{pillarProgress}%</span>
                                                    </div>
                                                </div>
                                                <ChevronRight className="w-5 h-5 text-subtext-light group-hover:translate-x-1 transition-transform" />
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}

                    {/* HABITS TAB */}
                    {activeTab === 'habits' && (
                        <motion.div key="habits" variants={LUXURY_ANIMATIONS.fadeIn} initial="initial" animate="animate" exit="initial" className="space-y-6">
                            <div className={`${THEME_CLASSES.CARD} p-6`}>
                                <h3 className="font-bold text-heading-light dark:text-text-dark mb-4 flex items-center gap-2">
                                    <Target className="w-5 h-5 text-rose-500" />
                                    Daily Habits
                                </h3>
                                <div className="space-y-3">
                                    {DAILY_HABITS.map(habit => {
                                        const isChecked = getTodayHabits()[habit.id] || false;
                                        return (
                                            <div
                                                key={habit.id}
                                                onClick={() => toggleHabit(habit.id)}
                                                className={`flex items-center gap-4 p-4 rounded-2xl border cursor-pointer transition-all ${isChecked
                                                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                                                    : 'bg-white dark:bg-surface-dark border-border-light dark:border-border-dark hover:border-rose-300'}`}
                                            >
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isChecked ? 'bg-green-500 text-white' : 'bg-rose-100 dark:bg-rose-900/30 text-rose-500'}`}>
                                                    {isChecked ? <CheckCircle2 className="w-5 h-5" /> : <habit.icon className="w-5 h-5" />}
                                                </div>
                                                <span className={`font-medium flex-1 ${isChecked ? 'text-green-700 dark:text-green-400 line-through' : 'text-heading-light dark:text-text-dark'}`}>
                                                    {habit.label}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                                <p className="text-xs text-subtext-light text-center mt-4">
                                    {Object.values(getTodayHabits()).filter(Boolean).length} / {DAILY_HABITS.length} completed today
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {/* PROGRESS TAB */}
                    {activeTab === 'progress' && (
                        <motion.div key="progress" variants={LUXURY_ANIMATIONS.fadeIn} initial="initial" animate="animate" exit="initial" className="space-y-6">
                            <div className={`${THEME_CLASSES.CARD} p-6`}>
                                <h3 className="font-bold text-heading-light dark:text-text-dark mb-4">Your Journey</h3>
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    {PILLARS.map(pillar => (
                                        <div key={pillar.id} className={`p-4 rounded-2xl bg-gradient-to-br ${pillar.color} bg-opacity-10`}>
                                            <pillar.icon className="w-6 h-6 text-white mb-2" />
                                            <p className="text-2xl font-black text-white">{getPillarProgress(pillar)}%</p>
                                            <p className="text-[10px] font-bold text-white/80 uppercase">{pillar.title.split(' ')[0]}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm"><span>Total XP</span><span className="font-bold text-yellow-600">{progress.totalXP} XP</span></div>
                                    <div className="flex justify-between text-sm"><span>Streak</span><span className="font-bold text-orange-600">{progress.streak} days</span></div>
                                    <div className="flex justify-between text-sm"><span>Lessons</span><span className="font-bold text-rose-600">{progress.completedLessons.length} completed</span></div>
                                    <div className="flex justify-between text-sm"><span>Badges</span><span className="font-bold text-purple-600">{progress.badges.length} / {BADGES.length}</span></div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* BADGES TAB */}
                    {activeTab === 'badges' && (
                        <motion.div key="badges" variants={LUXURY_ANIMATIONS.fadeIn} initial="initial" animate="animate" exit="initial" className="grid grid-cols-2 gap-4">
                            {BADGES.map((badge, index) => {
                                const isEarned = progress.badges.includes(badge.id);
                                return (
                                    <motion.div
                                        key={badge.id}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: index * 0.1 }}
                                        className={`${THEME_CLASSES.CARD} p-5 text-center ${!isEarned && 'opacity-50'}`}
                                    >
                                        <div className={`text-4xl mb-3 ${!isEarned && 'grayscale'}`}>{badge.icon}</div>
                                        <h4 className="font-bold text-sm text-heading-light dark:text-text-dark mb-1">{badge.name}</h4>
                                        <p className="text-[10px] text-subtext-light">{badge.description}</p>
                                        {isEarned && (
                                            <div className="mt-2 flex items-center justify-center gap-1 text-green-500">
                                                <CheckCircle2 className="w-3 h-3" />
                                                <span className="text-[10px] font-bold">Earned</span>
                                            </div>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Pillar Modal */}
            <AnimatePresence>
                {selectedPillar && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm px-4 pb-4"
                        onClick={() => setSelectedPillar(null)}
                    >
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-md bg-white dark:bg-surface-dark rounded-[2rem] max-h-[85vh] overflow-hidden"
                        >
                            <div className={`p-6 bg-gradient-to-r ${selectedPillar.color} text-white relative`}>
                                <button onClick={() => setSelectedPillar(null)} className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30">
                                    <X className="w-4 h-4" />
                                </button>
                                <selectedPillar.icon className="w-10 h-10 mb-3" />
                                <h2 className="text-xl font-black mb-1">{selectedPillar.title}</h2>
                                <p className="text-sm opacity-90">{selectedPillar.description}</p>
                            </div>
                            <div className="p-6 overflow-y-auto max-h-[50vh]">
                                <h3 className="text-xs font-black uppercase text-subtext-light tracking-widest mb-4">Lessons</h3>
                                <div className="space-y-3">
                                    {selectedPillar.lessons.map((lesson, index) => {
                                        const isCompleted = progress.completedLessons.includes(lesson.id);
                                        const isLocked = index > 0 && !progress.completedLessons.includes(selectedPillar.lessons[index - 1].id);
                                        return (
                                            <div
                                                key={lesson.id}
                                                onClick={() => !isLocked && setSelectedLesson(lesson)}
                                                className={`p-4 rounded-2xl border transition-all ${isLocked
                                                    ? 'bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-700 opacity-50 cursor-not-allowed'
                                                    : 'bg-white dark:bg-surface-dark border-border-light dark:border-border-dark cursor-pointer hover:border-rose-300'}`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isCompleted ? 'bg-green-100 text-green-500' : isLocked ? 'bg-gray-100 text-gray-400' : 'bg-rose-100 text-rose-500'}`}>
                                                        {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : isLocked ? <Lock className="w-5 h-5" /> : lesson.type === 'video' ? <Video className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-bold text-sm text-heading-light dark:text-text-dark">{lesson.title}</h4>
                                                        <p className="text-[11px] text-subtext-light">{lesson.description}</p>
                                                    </div>
                                                    <div className="flex items-center gap-1 text-[10px] font-bold text-subtext-light">
                                                        <Clock className="w-3 h-3" />
                                                        {lesson.duration}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {/* Lesson Modal */}
                {selectedLesson && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-xl px-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="w-full max-w-md bg-white dark:bg-surface-dark rounded-[2rem] p-8"
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 rounded-xl bg-rose-100 dark:bg-rose-900/30 text-rose-500">
                                    {selectedLesson.type === 'video' ? <Video className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                                </div>
                                <div>
                                    <h2 className="text-lg font-black text-heading-light dark:text-text-dark">{selectedLesson.title}</h2>
                                    <p className="text-xs text-subtext-light">{selectedLesson.duration} • {selectedLesson.type}</p>
                                </div>
                            </div>
                            <div className="mb-8 p-6 bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 rounded-2xl min-h-[200px] flex items-center justify-center">
                                <div className="text-center">
                                    <div className="w-16 h-16 rounded-full bg-rose-500/20 flex items-center justify-center mx-auto mb-4">
                                        <Play className="w-8 h-8 text-rose-500" />
                                    </div>
                                    <p className="text-sm text-subtext-light">{selectedLesson.description}</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => setSelectedLesson(null)} className="flex-1 py-4 rounded-2xl font-bold border border-border-light dark:border-border-dark">
                                    Close
                                </button>
                                <button onClick={() => completeLesson(selectedLesson.id)} className="flex-1 py-4 rounded-2xl font-bold bg-gradient-to-r from-rose-500 to-pink-500 text-white flex items-center justify-center gap-2">
                                    <CheckCircle2 className="w-5 h-5" />
                                    Complete
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default LooksmaxxingSection;
