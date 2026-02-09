import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import NanoBananaAI from './NanoBananaAI';

import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import Button from './ui/Button';
import Toast from './ui/Toast';

import {
    Bell, Target, ArrowRight,
    Dumbbell, Code, Brain, BookOpen, Cpu,
    Users, Briefcase, Fingerprint, Laptop, Sparkles, TrendingUp,
    Utensils, Zap, Wind, Timer,
    Activity, Heart, Moon, Footprints, Plus, XCircle, LayoutGrid, Link as LinkIcon, CheckSquare, Calculator, FileText
} from 'lucide-react';
import StepCalculator from './calculators/StepCalculator';
import SleepCalculator from './calculators/SleepCalculator';
import GoalAssistant from './GoalAssistant';
import GoalAssistantWidget from './GoalAssistantWidget';
import { useLifeTracker } from '../utils/lifeTrackerStore';
import { getVisibleSections, SECTION_REGISTRY, type InterestCategory, type PrimaryGoal } from '../utils/sectionRegistry';


interface Vital {
    label: string;
    value: string;
    icon: React.ElementType;
    color: string;
    bg: string;
}

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
    entries?: any[];
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





const STATIC_ROUTINES = [
    { id: 'static-board', title: 'Personal Board', icon: LayoutGrid, color: 'text-gray-800', bg: 'bg-gray-100', link: '/board', desc: 'Widgets', img: '/hero-image.png' },
    { id: 'static-workout', title: 'Workout', icon: Dumbbell, color: 'text-orange-500', bg: 'bg-orange-50', link: '/section/workout', desc: 'Active', img: '/images/section-workout.png' },
    { id: 'static-coding', title: 'Coding', icon: Code, color: 'text-blue-500', bg: 'bg-blue-50', link: '/section/coding', desc: '3 Projects', img: '/images/section-coding.jpg' },
    { id: 'static-meditation', title: 'Meditation', icon: Brain, color: 'text-purple-500', bg: 'bg-purple-50', link: '/section/meditation', desc: '10 min/day', img: '/images/section-meditation.jpg' },
    { id: 'static-notes', title: 'Insights & Notes', icon: FileText, color: 'text-violet-500', bg: 'bg-violet-50', link: '/section/notes', desc: 'Reflect', img: '/images/section-reading.jpg' },
    { id: 'static-breathwork', title: 'Breathwork', icon: Wind, color: 'text-rose-500', bg: 'bg-rose-50', link: '/section/meditation?type=breathing', desc: 'Active', img: '/images/section-breathwork.png' },
    { id: 'static-reading', title: 'Reading', icon: BookOpen, color: 'text-yellow-500', bg: 'bg-yellow-50', link: '/section/reading', desc: 'Chapter 4', img: '/images/section-reading.jpg' },
    { id: 'static-networking', title: 'Networking', icon: Users, color: 'text-pink-500', bg: 'bg-pink-50', link: '/section/networking', desc: '2 Sessions', img: '/images/section-teaching.jpg' },
    { id: 'static-ai', title: 'AI', icon: Cpu, color: 'text-teal-500', bg: 'bg-teal-50', link: '/section/ai', desc: 'Learning', img: '/images/section-ai.png' },
    { id: 'static-business', title: 'Business', icon: Briefcase, color: 'text-green-500', bg: 'bg-green-50', link: '/section/business', desc: 'Growth', img: '/images/section-business.jpg' },
    { id: 'static-branding', title: 'Personal Branding', icon: Fingerprint, color: 'text-indigo-500', bg: 'bg-indigo-50', link: '/section/branding', desc: 'Content', img: '/images/section-branding.png' },
    { id: 'static-freelancing', title: 'Freelancing', icon: Laptop, color: 'text-blue-600', bg: 'bg-blue-50', link: '/section/freelancing', desc: 'Active Gigs', img: '/images/section-freelancing.png' },
    { id: 'static-looksmaxing', title: 'Looksmaxing', icon: Sparkles, color: 'text-rose-500', bg: 'bg-rose-50', link: '/section/looksmaxing', desc: 'Routine', img: '/images/section-looksmaxing-new.png' },
    { id: 'static-market', title: 'Market', icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-50', link: '/section/market', desc: 'Analysis', img: '/images/section-market.png' },
    { id: 'static-financial-learning', title: 'Wealth Builder', icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-50', link: '/section/finance-learning', desc: 'Startup & Stocks', img: '/images/section-market.png' },
    { id: 'static-cooking', title: 'Cooking', icon: Utensils, color: 'text-red-500', bg: 'bg-red-50', link: '/section/cooking', desc: 'Recipes', img: '/images/section-cooking.png' },
    { id: 'static-kickboxing', title: 'Kickboxing', icon: Zap, color: 'text-orange-600', bg: 'bg-orange-50', link: '/workout/kickboxing', desc: 'Striking', img: '/images/section-kickboxing.png' },
    { id: 'static-mobility', title: 'Mobility Flow', icon: Wind, color: 'text-sky-500', bg: 'bg-sky-50', link: '/workout/mobility', desc: 'Flexibility', img: '/images/section-mobility.png' },
    { id: 'static-endurance', title: 'Endurance Run', icon: Timer, color: 'text-emerald-600', bg: 'bg-emerald-50', link: '/workout/endurance', desc: 'Cardio', img: '/images/track-run.png' },
    { id: 'static-powerlifting', title: 'Powerlifting', icon: Dumbbell, color: 'text-indigo-600', bg: 'bg-indigo-50', link: '/workout/powerlifting', desc: 'Strength', img: '/images/squat.png' },
    { id: 'static-plyometrics', title: 'Plyometrics', icon: Sparkles, color: 'text-amber-500', bg: 'bg-amber-50', link: '/workout/plyometrics', desc: 'Explosive', img: '/images/section-plyometrics.png' }
];

const VITALS_DEFAULT = [
    { label: 'Energy', value: 'High', icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-50' },
    { label: 'Sleep', value: '7.2h', icon: Moon, color: 'text-indigo-500', bg: 'bg-indigo-50' },
    { label: 'Steps', value: '8.4k', icon: Footprints, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: 'Focus', value: 'Deep', icon: Target, color: 'text-rose-500', bg: 'bg-rose-50' },
];

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated, isAdmin } = useAuth();
    const store = useLifeTracker();
    const {
        requestPermission,
        permissionGranted,
        notifyIncompleteAction,
        checkAndNotifyPendingTasks
    } = useNotifications();
    const [isNanoBananaOpen, setIsNanoBananaOpen] = useState(false);
    const [showWeeklyToast, setShowWeeklyToast] = useState(false);
    const [isGoalAssistantOpen, setIsGoalAssistantOpen] = useState(false);

    // Request notification permission on first visit
    useEffect(() => {
        if (isAuthenticated && !permissionGranted) {
            // Ask for permission after a short delay
            const timeout = setTimeout(() => {
                requestPermission();
            }, 3000);
            return () => clearTimeout(timeout);
        }
    }, [isAuthenticated, permissionGranted, requestPermission]);

    // Check for pending tasks when dashboard loads
    useEffect(() => {
        if (isAuthenticated && permissionGranted) {
            // Check for pending tasks after data loads
            const timeout = setTimeout(() => {
                checkAndNotifyPendingTasks();
            }, 5000);
            return () => clearTimeout(timeout);
        }
    }, [isAuthenticated, permissionGranted, checkAndNotifyPendingTasks]);

    // Check onboarding and notify if incomplete
    useEffect(() => {
        if (isAuthenticated && user) {
            const storeState = store.getState();
            const profile = storeState.userProfile;

            if (!profile?.onboardingCompleted && permissionGranted) {
                // Notify about incomplete onboarding after 10 seconds
                const timeout = setTimeout(() => {
                    notifyIncompleteAction(
                        'Complete Your Setup',
                        'Personalize your experience by completing the onboarding.',
                        '/onboarding'
                    );
                }, 10000);
                return () => clearTimeout(timeout);
            }
        }
    }, [isAuthenticated, user, store, permissionGranted, notifyIncompleteAction]);

    useEffect(() => {
        const checkWeeklyToast = () => {
            const now = new Date();
            // Check if it's Monday (1)
            const isMonday = now.getDay() === 1;

            // For testing/demo purposes, we can uncomment this to force it:
            // const isMonday = true; 

            if (isMonday) {
                const todayStr = now.toDateString();
                const lastShown = localStorage.getItem('lastWeeklyToast');
                if (lastShown !== todayStr) {
                    setShowWeeklyToast(true);
                    localStorage.setItem('lastWeeklyToast', todayStr);
                }
            }
        };
        checkWeeklyToast();
    }, []);


    // Get time-based greeting
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    // Get display name
    const getDisplayName = () => {
        if (!isAuthenticated || !user) return 'Guest';
        return user.displayName || user.email?.split('@')[0] || 'User';
    };

    const [routines, setRoutines] = useState<Routine[]>([]);
    const [vitals, setVitals] = useState<Vital[]>(VITALS_DEFAULT);
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



    // Planner Previews
    const [priorities] = useState<Priority[]>(() => JSON.parse(localStorage.getItem('planner_priorities') || '[]'));
    const [antiGoals] = useState<AntiGoal[]>(() => JSON.parse(localStorage.getItem('planner_anti_goals') || '[]'));

    // Focus Score State
    const [focusPeriod, setFocusPeriod] = useState<'Today' | 'Weekly' | 'Monthly'>('Today');

    const [focusData, setFocusData] = useState({
        Today: { score: 0, data: [65, 75, 84, 80, 72, 84] },
        Weekly: { score: 0, data: [70, 65, 80, 78, 85, 90, 78] },
        Monthly: { score: 0, data: [75, 80, 78, 85, 82, 88, 80, 75, 82] }
    });

    useEffect(() => {
        const calculateStats = () => {
            const state = store.getState();
            const today = new Date().toISOString().split('T')[0];

            // Calculate Today's Stats
            const dailyTasks = state?.dailyTasks || [];
            const todayTasks = dailyTasks.filter(t => t.date === today);
            const goalsCompleted = todayTasks.filter(t => t.completed).length;
            const totalGoals = todayTasks.length;

            const meditationSessions = state?.meditationSessions || [];
            const meditationMinutes = meditationSessions
                .filter((s: { date: string }) => s.date === today)
                .reduce((acc, s) => acc + (s.duration || 0), 0);

            const sectionLogs = state?.sectionLogs || [];
            const workouts = sectionLogs
                .filter((log: { sectionId: string; date: string }) => log.sectionId === 'workout' && log.date === today).length;

            // Simple Focus Score Calculation (0-100)
            let score = 0;
            // Goals: up to 40 points
            if (totalGoals > 0) score += (goalsCompleted / totalGoals) * 40;
            // Meditation: up to 20 points (20 mins = max)
            score += Math.min(meditationMinutes / 20, 1) * 20;
            // Workouts: up to 40 points (1 workout = max)
            score += Math.min(workouts, 1) * 40;

            const finalScore = Math.round(Math.min(score, 100));

            setFocusData(prev => ({
                ...prev,
                Today: {
                    score: finalScore,
                    data: [...prev.Today.data.slice(1), finalScore]
                }
            }));

            // Update Vitals based on real stats
            setVitals(prev => prev.map(v => {
                if (v.label === 'Focus') {
                    return { ...v, value: finalScore > 80 ? 'Deep' : finalScore > 50 ? 'Flow' : 'Low' };
                }
                if (v.label === 'Energy') {
                    return { ...v, value: workouts > 0 ? 'High' : 'Stable' };
                }
                return v;
            }));
        };

        calculateStats();
        // Subscribe to store updates
        const unsubscribe = store.subscribe(calculateStats);
        return () => unsubscribe();
    }, [store]);

    const currentFocus = focusData[focusPeriod];


    useEffect(() => {
        const loadCustomRoutines = () => {
            const customData = localStorage.getItem('customCategories');

            let mappedCustom: Routine[] = [];
            if (customData) {
                const parsed = JSON.parse(customData);
                mappedCustom = parsed.map((cat: { id: string; title: string; subtitle?: string; img?: string | null; type?: 'workout' | 'links' | 'checklist' | 'prd-generated'; displayType?: string; entries?: any[] }) => {
                    const key = `category_override_${cat.id}`;
                    const overrideStr = localStorage.getItem(key);
                    const override = overrideStr ? JSON.parse(overrideStr) : null;

                    let Icon = Dumbbell;
                    let desc = 'Custom Section';
                    let link = `/section/custom/${cat.id}`;
                    let defaultImg = null;

                    if (cat.type === 'prd-generated') {
                        // PRD-generated sections
                        Icon = Calculator;
                        desc = cat.displayType || 'AI Generated';
                        link = `/section/dynamic/${cat.id}`;
                        if (cat.displayType === 'tracker') defaultImg = '/images/section-workout.png';
                        else if (cat.displayType === 'calculator') defaultImg = '/images/section-calculator.png';
                        else if (cat.displayType === 'journal') defaultImg = '/images/section-journal.png';
                        else if (cat.displayType === 'steps') defaultImg = '/images/section-steps.png';
                        else defaultImg = '/images/section-ai.png';
                    } else if (cat.type === 'links') {
                        Icon = LinkIcon;
                        desc = 'Links';
                        defaultImg = '/images/section-links.png';
                    } else if (cat.type === 'checklist') {
                        Icon = CheckSquare;
                        desc = 'Tasks';
                        defaultImg = '/images/section-checklist.png';
                    } else {
                        // Default / Workout
                        Icon = Dumbbell;
                        desc = 'Workout';
                        defaultImg = '/images/section-workout.png';
                    }

                    return {
                        id: cat.id,
                        title: override?.title || cat.title,
                        icon: Icon,
                        color: 'text-indigo-500',
                        bg: 'bg-indigo-50',
                        link,
                        desc: cat.subtitle || desc,
                        img: override?.img || cat.img || defaultImg,
                        isCustom: true,
                        entries: cat.entries || []
                    };
                });
            }

            setRoutines(() => {
                const hidden = JSON.parse(localStorage.getItem('hiddenRoutines') || '[]');

                // Get user preferences for filtering
                const profile = store.state.userProfile;
                const interests: InterestCategory[] = (profile?.userInterests || []) as InterestCategory[];
                const goal: PrimaryGoal | null = (profile?.primaryGoal || null) as PrimaryGoal | null;
                const hasCompletedOnboarding = profile?.onboardingCompleted || false;

                let filteredStatic: Routine[];

                if (hasCompletedOnboarding && interests.length > 0) {
                    // Use section registry to get visible sections based on preferences
                    const visibleSections = getVisibleSections(interests, goal);
                    const visibleIds = visibleSections.map(s => s.id);

                    // Map visible sections to routines using STATIC_ROUTINES data
                    filteredStatic = STATIC_ROUTINES
                        .filter(r => {
                            // Map static routine IDs to section registry IDs
                            const sectionId = r.id.replace('static-', '');
                            return visibleIds.includes(sectionId) && !hidden.includes(r.id);
                        })
                        .map(r => {
                            const key = `category_override_${r.id}`;
                            const overrideStr = localStorage.getItem(key);
                            const override = overrideStr ? JSON.parse(overrideStr) : null;
                            return {
                                ...r,
                                title: override?.title || r.title,
                                img: override?.img || r.img
                            };
                        });

                    // Sort by priority goal matching
                    if (goal) {
                        filteredStatic.sort((a, b) => {
                            const sectionA = SECTION_REGISTRY.find(s => `static-${s.id}` === a.id);
                            const sectionB = SECTION_REGISTRY.find(s => `static-${s.id}` === b.id);
                            const aPriority = sectionA?.priorityGoal === goal ? 1 : 0;
                            const bPriority = sectionB?.priorityGoal === goal ? 1 : 0;
                            return bPriority - aPriority;
                        });
                    }
                } else {
                    // No onboarding completed - show all sections (legacy behavior)
                    filteredStatic = STATIC_ROUTINES.filter(r => !hidden.includes(r.id)).map(r => {
                        const key = `category_override_${r.id}`;
                        const overrideStr = localStorage.getItem(key);
                        const override = overrideStr ? JSON.parse(overrideStr) : null;
                        return {
                            ...r,
                            title: override?.title || r.title,
                            img: override?.img || r.img
                        };
                    });
                }

                return [...filteredStatic, ...mappedCustom];
            });

            // Calculate dynamic vitals from custom categories
            if (customData) {
                const categories = JSON.parse(customData);
                const today = new Date().toISOString().split('T')[0];

                // 1. Steps Tracker
                const stepTracker = categories.find((cat: any) =>
                    (cat.displayType === 'tracker' || cat.displayType === 'steps' || cat.title.toLowerCase().includes('step'))
                );
                if (stepTracker && stepTracker.entries) {
                    const todaySteps = stepTracker.entries
                        .filter((e: any) => e.timestamp && e.timestamp.startsWith(today))
                        .reduce((sum: number, e: any) => sum + (Number(e.steps) || 0), 0);
                    if (todaySteps > 0) {
                        setVitals(v => v.map(vital =>
                            vital.label === 'Steps'
                                ? { ...vital, value: todaySteps >= 1000 ? `${(todaySteps / 1000).toFixed(1)}k` : todaySteps.toString() }
                                : vital
                        ));
                    }
                }

                // 2. Water Tracker
                const waterTracker = categories.find((cat: any) =>
                    (cat.displayType === 'water' || cat.title.toLowerCase().includes('water'))
                );
                if (waterTracker && waterTracker.entries) {
                    const todayWater = waterTracker.entries
                        .filter((e: any) => e.timestamp && e.timestamp.startsWith(today))
                        .reduce((sum: number, e: any) => sum + (Number(e.intake) || 0), 0);
                    if (todayWater > 0) {
                        setVitals(v => v.map(vital =>
                            vital.label === 'Water'
                                ? { ...vital, value: `${(todayWater / 1000).toFixed(1)}L` }
                                : vital
                        ));
                    }
                }

                // 3. Calorie/Nutrition Tracker
                const calorieTracker = categories.find((cat: any) =>
                    (cat.displayType === 'calculator' || cat.displayType === 'nutrition' || cat.title.toLowerCase().includes('calorie'))
                );
                if (calorieTracker && calorieTracker.entries) {
                    const lastEntry = [...calorieTracker.entries].reverse().find((e: any) => e.targetCalories);
                    if (lastEntry) {
                        setVitals(v => v.map(vital =>
                            vital.label === 'Calories'
                                ? { ...vital, value: lastEntry.targetCalories.toString() }
                                : vital
                        ));
                    }
                }

                // 4. Reading Tracker
                const readingTracker = categories.find((cat: any) =>
                    (cat.displayType === 'reading' || cat.title.toLowerCase().includes('read'))
                );
                if (readingTracker && readingTracker.entries) {
                    const completed = readingTracker.entries.filter((e: any) => e.status === 'Completed').length;
                    if (completed > 0) {
                        setVitals(v => {
                            const hasReading = v.some(vital => vital.label === 'Books');
                            if (hasReading) {
                                return v.map(vital =>
                                    vital.label === 'Books' ? { ...vital, value: completed.toString() } : vital
                                );
                            } else {
                                return [...v, { icon: BookOpen, label: 'Books', value: completed.toString(), color: 'text-amber-500', bg: 'bg-amber-50' }];
                            }
                        });
                    }
                }
            }
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



    const handleAddRoutine = () => {
        navigate('/workout/categories/add');
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#111] pb-28 font-sans text-gray-900 dark:text-white transition-colors duration-500">
            {/* Nano Banana AI Chat Overlay */}
            <NanoBananaAI isOpen={isNanoBananaOpen} onClose={() => setIsNanoBananaOpen(false)} />

            {/* Header */}
            <header className="sticky top-0 z-40 px-6 py-4 flex justify-between items-center bg-[#FAFAFA]/90 dark:bg-[#111]/90 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-3">
                    <div>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{getGreeting()}</p>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-black leading-none tracking-tight">{getDisplayName()}</h1>
                            {isAdmin && (
                                <span className="text-[8px] font-bold uppercase tracking-wider bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-1.5 py-0.5 rounded-full">
                                    Admin
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex gap-2 items-center">
                    <button
                        onClick={() => navigate('/planner')}
                        className="p-2 rounded-full bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 hover:scale-105 transition-transform flex items-center justify-center"
                    >
                        <Target className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    </button>
                    <button
                        onClick={() => setIsNanoBananaOpen(true)}
                        className="p-2 rounded-full bg-[#FFE135] shadow-sm border border-[#FDD835] hover:scale-105 transition-transform flex items-center justify-center"
                    >
                        <span className="text-lg">🍌</span>
                    </button>
                    <button className="relative p-2 rounded-full bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 hover:scale-105 transition-transform">
                        <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-gray-800"></span>
                    </button>
                    {/* <UserMenu /> */}
                </div>
            </header>

            <main className="px-6 pt-6 space-y-8 max-w-md mx-auto">
                {/* Focus Score Card */}
                {/* Focus Score Card */}
                {/* Focus Score Card */}
                <section className="animate-in slide-in-from-bottom-4 duration-500">
                    <div className="relative overflow-hidden rounded-[1.5rem] bg-black text-white p-5 shadow-xl">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h2 className="text-xl font-black tracking-tighter leading-none">{focusPeriod === 'Today' ? "Today's" : focusPeriod} Focus</h2>
                                <p className="text-gray-400 text-[10px] font-bold mt-1 uppercase tracking-wide">Productivity Score</p>
                            </div>
                            <div className="flex bg-gray-900 rounded-full p-1 border border-gray-800 scale-90 origin-right">
                                {(['Today', 'Weekly', 'Monthly'] as const).map((period) => (
                                    <button
                                        key={period}
                                        onClick={() => setFocusPeriod(period)}
                                        className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all ${focusPeriod === period ? 'bg-white text-black' : 'text-gray-500 hover:text-white'}`}
                                    >
                                        {period}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-end justify-between gap-4">
                            <div className="flex flex-col">
                                <span className="text-5xl font-black tracking-tighter leading-none">{currentFocus.score}</span>
                                <span className="text-[10px] font-bold text-green-500 mt-1">Excellent Score</span>
                            </div>

                            {/* Bar Chart Visualization - Compact */}
                            <div className="h-12 flex items-end justify-between gap-1.5 w-1/2">
                                {currentFocus.data.map((h, i) => (
                                    <div key={i} className="flex flex-col items-center gap-1 w-full group">
                                        <div
                                            className={`w-full rounded-t-sm transition-all duration-500 ease-out ${i === currentFocus.data.length - 1 ? 'bg-white' : 'bg-gray-800 group-hover:bg-gray-700'}`}
                                            style={{ height: `${h}%` }}
                                        ></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Goal Assistant Widget */}
                <section>
                    <GoalAssistantWidget onClick={() => setIsGoalAssistantOpen(true)} />
                </section>

                {/* Calculators Grid */}
                <section className="grid grid-cols-2 gap-4">
                    <StepCalculator />
                    <SleepCalculator />
                </section>

                {/* Vitals Grid */}
                <section className="grid grid-cols-2 gap-4">
                    {vitals.map((vital, index) => (
                        <div key={index} className="bg-white dark:bg-[#252525] p-5 rounded-[2rem] border border-gray-100 dark:border-white/5 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-3">
                                <div className={`p-3 rounded-2xl ${vital.bg} ${vital.color}`}>
                                    <vital.icon className="w-5 h-5 fill-current" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{vital.label}</p>
                                    <p className="text-xl font-black text-gray-900 dark:text-white leading-none mt-0.5">{vital.value}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </section>

                {/* Life Areas - Minimal Horizontal Scroll */}
                <section>
                    <div className="flex justify-between items-center mb-3 px-1">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">Life Areas</h3>
                        <button
                            onClick={() => setIsEditingLifeAreas(!isEditingLifeAreas)}
                            className="text-gray-400 text-[10px] font-bold uppercase tracking-widest hover:text-gray-900 dark:hover:text-white transition-colors"
                        >
                            {isEditingLifeAreas ? 'Done' : 'Edit'}
                        </button>
                    </div>

                    {isEditingLifeAreas ? (
                        <div className="bg-white dark:bg-[#1A1A1A] rounded-[1.5rem] p-4 border border-gray-100 dark:border-gray-800 space-y-4">
                            {lifeAreas.map((area: LifeArea) => (
                                <div key={area.id} className="flex flex-col gap-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{area.id}</label>
                                        <span className="text-xs font-bold text-gray-900 dark:text-gray-100">{area.value}%</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="text"
                                            value={area.title}
                                            onChange={(e) => handleAreaUpdate(area.id, 'title', e.target.value)}
                                            className="flex-1 px-3 py-1.5 text-xs font-bold bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                                            placeholder="Area Name"
                                        />
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            value={area.value}
                                            onChange={(e) => handleAreaUpdate(area.id, 'value', parseInt(e.target.value))}
                                            className="w-24 accent-black dark:accent-white"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex space-x-3 overflow-x-auto pb-4 snap-x -mx-6 px-6 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                            {lifeAreas.map((area: LifeArea) => (
                                <div
                                    key={area.id}
                                    className="flex-shrink-0 snap-start bg-white dark:bg-[#1A1A1A] p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm min-w-[140px] flex flex-col items-start gap-3"
                                >
                                    <div className={`p-2 rounded-xl bg-gray-50 dark:bg-black/50 text-gray-900 dark:text-white`}>
                                        {area.id === 'physical' ? <Activity className="w-4 h-4" /> : area.id === 'life' ? <Heart className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-black text-gray-900 dark:text-white mb-1">{area.title}</h4>
                                        <div className="flex items-center gap-1.5">
                                            <div className={`w-1.5 h-1.5 rounded-full ${area.indicatorColor}`}></div>
                                            <span className="text-[10px] font-bold text-gray-400">{area.value}% Satisfaction</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Priorities & Anti-Goals Grid */}
                <section>
                    <motion.div
                        whileHover={{ scale: 1.01 }}
                        onClick={() => navigate('/planner')}
                        className="bg-white dark:bg-[#1A1A1A] border border-gray-100 dark:border-gray-800 shadow-sm p-6 flex flex-col group cursor-pointer relative overflow-hidden"
                        style={{ borderRadius: '1.5rem' }}
                    >
                        <div className="flex items-center justify-between mb-6 relative z-10">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gray-50 dark:bg-black rounded-2xl flex items-center justify-center text-gray-900 dark:text-white shadow-sm border border-gray-100 dark:border-gray-800">
                                    <Target className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-black text-gray-900 dark:text-white text-lg">Focus Planner</h3>
                                    <p className="text-gray-400 text-xs font-medium">Your Daily OS</p>
                                </div>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-black flex items-center justify-center text-gray-400 group-hover:bg-black group-hover:dark:bg-white group-hover:text-white group-hover:dark:text-black transition-all">
                                <ArrowRight className="w-4 h-4" />
                            </div>
                        </div>

                        {/* 4 Sections Stacked One-by-One */}
                        <div className="space-y-2 relative z-10">
                            {/* Priorities */}
                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-black/50 rounded-xl border border-gray-100 dark:border-gray-800/50">
                                <div className="flex items-center gap-3">
                                    <div className="p-1.5 bg-white dark:bg-[#1A1A1A] rounded-lg shadow-sm">
                                        <Target className="w-3.5 h-3.5 text-gray-900 dark:text-white" />
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Priorities</span>
                                </div>
                                <p className="text-xs font-black text-gray-900 dark:text-white">{priorities.filter(p => !p.done).length} Active</p>
                            </div>

                            {/* Anti-Goals */}
                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-black/50 rounded-xl border border-gray-100 dark:border-gray-800/50">
                                <div className="flex items-center gap-3">
                                    <div className="p-1.5 bg-white dark:bg-[#1A1A1A] rounded-lg shadow-sm">
                                        <XCircle className="w-3.5 h-3.5 text-gray-900 dark:text-white" />
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Anti-Goals</span>
                                </div>
                                <p className="text-xs font-black text-gray-900 dark:text-white">{antiGoals.length} Set</p>
                            </div>
                        </div>
                    </motion.div>
                </section>

                {/* Learning Hub - Featured Section */}
                <section>
                    <motion.div
                        whileHover={{ scale: 1.01 }}
                        onClick={() => navigate('/learning')}
                        className="bg-black text-white rounded-[1.5rem] p-6 relative overflow-hidden cursor-pointer"
                    >
                        <div className="relative z-10 flex flex-col h-full justify-between gap-6">
                            <div>
                                <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center text-white border border-white/20 mb-4">
                                    <Brain className="w-6 h-6" />
                                </div>
                                <h3 className="text-2xl font-black mb-2">Learning Hub</h3>
                                <p className="text-gray-400 text-sm max-w-[200px] leading-relaxed">
                                    Master any topic with AI mind maps and personalized podcasts.
                                </p>
                            </div>

                            <button className="self-start px-5 py-2.5 bg-white text-black rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-2 hover:bg-gray-200 transition-colors">
                                Start Learning <ArrowRight className="w-3 h-3" />
                            </button>
                        </div>
                    </motion.div>
                </section>


                {/* Categories Grid */}
                <section>
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">Quick Access</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        {routines.map((item, i) => (
                            <div
                                key={i}
                                onClick={() => navigate(item.link)}
                                className={`
                                    relative overflow-hidden p-4 group cursor-pointer
                                    bg-white dark:bg-[#1A1A1A] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden
                                     flex flex-col justify-end h-44
                                `}
                                style={{ borderRadius: '1.5rem', animationDelay: `${i * 0.03}s` }}
                            >
                                {item.img ? (
                                    <>
                                        <div className="absolute inset-0 z-0 bg-gray-50 dark:bg-gray-900 rounded-[1.5rem] overflow-hidden">
                                            <img
                                                src={item.img}
                                                alt=""
                                                className="w-full h-full transition-transform duration-700 group-hover:scale-105 object-cover"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                                        </div>
                                        <div className="relative z-10 w-full pt-2">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/10 shrink-0">
                                                    <item.icon className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-base text-white leading-tight drop-shadow-sm">
                                                        {item.title}
                                                    </h4>
                                                    <p className="text-[10px] font-bold text-white/90 mt-0.5">
                                                        {item.isCustom && item.entries ? `${item.entries.length} Entries` : (item.desc || 'View Section')}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="relative z-10 flex flex-col gap-3">
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-black flex items-center justify-center text-gray-900 dark:text-white shrink-0">
                                                    <item.icon className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-base text-gray-900 dark:text-white leading-tight">
                                                        {item.title}
                                                    </h4>
                                                    <p className="text-[10px] font-bold text-gray-400 mt-0.5">
                                                        {item.desc || 'View'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <Button
                        variant="primary"
                        fullWidth
                        size="lg"
                        className="rounded-2xl mt-4"
                        onClick={handleAddRoutine}
                        leftIcon={<Plus className="w-5 h-5" />}
                    >
                        Add Custom Section
                    </Button>
                </section>
            </main>

            <Toast
                isVisible={showWeeklyToast}
                onClose={() => setShowWeeklyToast(false)}
                message="📈 Weekly Recap is ready! Check your progress."
                type="success"
            />

            {/* Floating Action Button */}
            <div className="fixed bottom-28 right-6 z-[60]">
                <button
                    onClick={handleAddRoutine}
                    className="w-14 h-14 bg-black dark:bg-white text-white dark:text-black rounded-full shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
                >
                    <Plus className="w-6 h-6" />
                </button>
            </div>

            {/* Goal Assistant Modal */}
            <GoalAssistant
                isOpen={isGoalAssistantOpen}
                onClose={() => setIsGoalAssistantOpen(false)}
            />
        </div >
    );
};

export default Dashboard;
