import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, TrendingUp, Rocket, BookOpen, Play, CheckCircle2,
    Lock, Award, Trophy, Flame, ChevronRight, Search,
    BarChart3, Target, DollarSign, Shield,
    PieChart, Zap, Clock, Volume2, Video, FileText,
    HelpCircle, X, Check, Moon, Sun, GraduationCap
} from 'lucide-react';
import { THEME_CLASSES, LUXURY_ANIMATIONS } from '../utils/theme';

// ================== TYPE DEFINITIONS ==================

interface Lesson {
    id: string;
    title: string;
    description: string;
    duration: string;
    type: 'text' | 'video' | 'audio';
    completed: boolean;
    locked: boolean;
}

interface Module {
    id: string;
    title: string;
    description: string;
    icon: React.ElementType;
    color: string;
    lessons: Lesson[];
    quizCompleted: boolean;
}

interface GlossaryTerm {
    term: string;
    definition: string;
    category: 'startup' | 'stocks';
}

interface Quiz {
    question: string;
    options: string[];
    correctIndex: number;
}

interface UserProgress {
    startupTrack: {
        completedLessons: string[];
        completedModules: string[];
        quizScores: { [moduleId: string]: number };
    };
    stockTrack: {
        completedLessons: string[];
        completedModules: string[];
        quizScores: { [moduleId: string]: number };
    };
    streak: number;
    lastActiveDate: string;
    badges: string[];
    totalXP: number;
}

// ================== INITIAL DATA ==================

const STARTUP_MODULES: Module[] = [
    {
        id: 'startup-intro',
        title: 'What is a Startup?',
        description: 'Learn the fundamentals of startups and entrepreneurship.',
        icon: Rocket,
        color: 'from-purple-500 to-indigo-600',
        quizCompleted: false,
        lessons: [
            { id: 's1-l1', title: 'Defining Startups', description: 'What makes a startup different from a small business?', duration: '3 min', type: 'video', completed: false, locked: false },
            { id: 's1-l2', title: 'Startup Ecosystem', description: 'VCs, accelerators, incubators explained.', duration: '4 min', type: 'text', completed: false, locked: true },
            { id: 's1-l3', title: 'Famous Success Stories', description: 'Learn from unicorns like Airbnb, Uber, Stripe.', duration: '5 min', type: 'audio', completed: false, locked: true },
        ]
    },
    {
        id: 'startup-mvp',
        title: 'MVP & Product-Market Fit',
        description: 'Build something people actually want.',
        icon: Target,
        color: 'from-orange-500 to-red-500',
        quizCompleted: false,
        lessons: [
            { id: 's2-l1', title: 'What is an MVP?', description: 'Minimum Viable Product explained.', duration: '3 min', type: 'video', completed: false, locked: false },
            { id: 's2-l2', title: 'Finding Product-Market Fit', description: 'The holy grail of startups.', duration: '4 min', type: 'text', completed: false, locked: true },
            { id: 's2-l3', title: 'Iterating Based on Feedback', description: 'Build, measure, learn.', duration: '3 min', type: 'audio', completed: false, locked: true },
        ]
    },
    {
        id: 'startup-funding',
        title: 'Funding & Pitching',
        description: 'Raise capital and pitch to investors.',
        icon: DollarSign,
        color: 'from-emerald-500 to-teal-600',
        quizCompleted: false,
        lessons: [
            { id: 's3-l1', title: 'Funding Stages', description: 'Pre-seed to Series A and beyond.', duration: '4 min', type: 'video', completed: false, locked: false },
            { id: 's3-l2', title: 'Creating a Pitch Deck', description: 'The 10-slide formula.', duration: '5 min', type: 'text', completed: false, locked: true },
            { id: 's3-l3', title: 'Talking to Investors', description: 'VC mindset and negotiation.', duration: '4 min', type: 'audio', completed: false, locked: true },
        ]
    },
    {
        id: 'startup-legal',
        title: 'Legal Structures & Team',
        description: 'Set up your company the right way.',
        icon: Shield,
        color: 'from-blue-500 to-cyan-500',
        quizCompleted: false,
        lessons: [
            { id: 's4-l1', title: 'Choosing a Legal Structure', description: 'LLC, C-Corp, and more.', duration: '3 min', type: 'video', completed: false, locked: false },
            { id: 's4-l2', title: 'Co-Founder Agreements', description: 'Avoid future conflicts.', duration: '4 min', type: 'text', completed: false, locked: true },
            { id: 's4-l3', title: 'Building Your Team', description: 'First hires and culture.', duration: '4 min', type: 'audio', completed: false, locked: true },
        ]
    }
];

const STOCK_MODULES: Module[] = [
    {
        id: 'stocks-intro',
        title: 'What are Stocks & Funds?',
        description: 'Understanding the basics of equity investing.',
        icon: BarChart3,
        color: 'from-green-500 to-emerald-600',
        quizCompleted: false,
        lessons: [
            { id: 'st1-l1', title: 'Stocks 101', description: 'What does owning a stock mean?', duration: '3 min', type: 'video', completed: false, locked: false },
            { id: 'st1-l2', title: 'Mutual Funds & ETFs', description: 'Diversified investing made simple.', duration: '4 min', type: 'text', completed: false, locked: true },
            { id: 'st1-l3', title: 'Index Funds', description: 'Why Warren Buffett recommends them.', duration: '3 min', type: 'audio', completed: false, locked: true },
        ]
    },
    {
        id: 'stocks-sip',
        title: 'SIPs & Diversification',
        description: 'Systematic investing for long-term wealth.',
        icon: PieChart,
        color: 'from-blue-500 to-indigo-600',
        quizCompleted: false,
        lessons: [
            { id: 'st2-l1', title: 'What is a SIP?', description: 'Systematic Investment Plans explained.', duration: '3 min', type: 'video', completed: false, locked: false },
            { id: 'st2-l2', title: 'Power of Compounding', description: 'How small amounts grow big.', duration: '4 min', type: 'text', completed: false, locked: true },
            { id: 'st2-l3', title: 'Portfolio Diversification', description: 'Dont put all eggs in one basket.', duration: '3 min', type: 'audio', completed: false, locked: true },
        ]
    },
    {
        id: 'stocks-technical',
        title: 'Technical Analysis',
        description: 'Read charts and understand patterns.',
        icon: TrendingUp,
        color: 'from-orange-500 to-amber-500',
        quizCompleted: false,
        lessons: [
            { id: 'st3-l1', title: 'Candlestick Patterns', description: 'Red vs green, wicks explained.', duration: '5 min', type: 'video', completed: false, locked: false },
            { id: 'st3-l2', title: 'Support & Resistance', description: 'Key price levels to watch.', duration: '4 min', type: 'text', completed: false, locked: true },
            { id: 'st3-l3', title: 'Trend Lines & Indicators', description: 'Moving averages, RSI, MACD.', duration: '5 min', type: 'audio', completed: false, locked: true },
        ]
    },
    {
        id: 'stocks-risk',
        title: 'Risk Management',
        description: 'Protect your capital and manage emotions.',
        icon: Shield,
        color: 'from-red-500 to-rose-600',
        quizCompleted: false,
        lessons: [
            { id: 'st4-l1', title: 'Understanding Risk', description: 'Different types of investment risk.', duration: '3 min', type: 'video', completed: false, locked: false },
            { id: 'st4-l2', title: 'Position Sizing', description: 'How much to invest per trade.', duration: '4 min', type: 'text', completed: false, locked: true },
            { id: 'st4-l3', title: 'Emotional Discipline', description: 'Fear and greed management.', duration: '4 min', type: 'audio', completed: false, locked: true },
        ]
    }
];

const GLOSSARY: GlossaryTerm[] = [
    { term: 'MVP', definition: 'Minimum Viable Product - the simplest version of a product that can be released to test a business hypothesis.', category: 'startup' },
    { term: 'Product-Market Fit', definition: 'When a product satisfies strong market demand.', category: 'startup' },
    { term: 'Unicorn', definition: 'A privately held startup valued at over $1 billion.', category: 'startup' },
    { term: 'Pitch Deck', definition: 'A presentation used to provide a brief overview of your business plan to investors.', category: 'startup' },
    { term: 'Equity', definition: 'Ownership stake in a company.', category: 'startup' },
    { term: 'VC (Venture Capital)', definition: 'Private equity financing provided to startups with high growth potential.', category: 'startup' },
    { term: 'IPO', definition: 'Initial Public Offering - when a private company offers shares to the public for the first time.', category: 'stocks' },
    { term: 'Bull Market', definition: 'A market condition where prices are rising or expected to rise.', category: 'stocks' },
    { term: 'Bear Market', definition: 'A market condition where prices are falling or expected to fall.', category: 'stocks' },
    { term: 'SIP', definition: 'Systematic Investment Plan - investing fixed amounts at regular intervals.', category: 'stocks' },
    { term: 'ETF', definition: 'Exchange-Traded Fund - a basket of securities that trades like a stock.', category: 'stocks' },
    { term: 'Dividend', definition: 'A portion of company earnings distributed to shareholders.', category: 'stocks' },
    { term: 'P/E Ratio', definition: 'Price-to-Earnings Ratio - stock price divided by earnings per share.', category: 'stocks' },
    { term: 'Market Cap', definition: 'Total market value of a companys outstanding shares.', category: 'stocks' },
];

const SAMPLE_QUIZZES: { [moduleId: string]: Quiz[] } = {
    'startup-intro': [
        { question: 'What differentiates a startup from a traditional small business?', options: ['Size of the company', 'Focus on scalable growth', 'Number of employees', 'Location'], correctIndex: 1 },
        { question: 'What is a unicorn in startup terminology?', options: ['A rare species', 'A startup valued at $1 billion+', 'A type of investor', 'A business model'], correctIndex: 1 },
        { question: 'What does VC stand for?', options: ['Virtual Currency', 'Venture Capital', 'Value Creation', 'Verified Company'], correctIndex: 1 },
    ],
    'stocks-intro': [
        { question: 'What does owning a stock represent?', options: ['A loan to the company', 'Ownership in the company', 'A bond', 'Insurance'], correctIndex: 1 },
        { question: 'What is an ETF?', options: ['Electronic Transfer Fund', 'Exchange-Traded Fund', 'Equity Trade Fee', 'Extended Time Frame'], correctIndex: 1 },
        { question: 'Why are index funds popular?', options: ['High risk', 'Low fees and diversification', 'Guaranteed returns', 'Short-term gains'], correctIndex: 1 },
    ],
};

const BADGES = [
    { id: 'first-lesson', name: 'First Step', description: 'Complete your first lesson', icon: '🎯' },
    { id: 'module-master', name: 'Module Master', description: 'Complete a full module', icon: '📚' },
    { id: 'quiz-ace', name: 'Quiz Ace', description: 'Score 100% on a quiz', icon: '🏆' },
    { id: 'streak-7', name: 'Week Warrior', description: 'Maintain a 7-day streak', icon: '🔥' },
    { id: 'dual-track', name: 'Dual Learner', description: 'Complete lessons in both tracks', icon: '⚡' },
];

// ================== MAIN COMPONENT ==================

const MarketSection: React.FC = () => {
    const navigate = useNavigate();
    const [activeTrack, setActiveTrack] = useState<'startup' | 'stocks'>('startup');
    const [activeTab, setActiveTab] = useState<'learn' | 'progress' | 'glossary' | 'achievements'>('learn');
    const [selectedModule, setSelectedModule] = useState<Module | null>(null);
    const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
    const [showQuiz, setShowQuiz] = useState(false);
    const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
    const [quizScore, setQuizScore] = useState(0);
    const [quizAnswered, setQuizAnswered] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showGlossaryTerm, setShowGlossaryTerm] = useState<GlossaryTerm | null>(null);
    const [isDarkMode, setIsDarkMode] = useState(() => document.documentElement.classList.contains('dark'));

    // User Progress State
    const [progress, setProgress] = useState<UserProgress>(() => {
        const saved = localStorage.getItem('market_section_progress');
        if (saved) return JSON.parse(saved);
        return {
            startupTrack: { completedLessons: [], completedModules: [], quizScores: {} },
            stockTrack: { completedLessons: [], completedModules: [], quizScores: {} },
            streak: 0,
            lastActiveDate: '',
            badges: [],
            totalXP: 0
        };
    });

    // Persist progress
    useEffect(() => {
        localStorage.setItem('market_section_progress', JSON.stringify(progress));
    }, [progress]);

    // Update streak on mount
    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        const lastActive = progress.lastActiveDate;

        if (lastActive !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];

            if (lastActive === yesterdayStr) {
                setProgress(prev => ({ ...prev, streak: prev.streak + 1, lastActiveDate: today }));
            } else if (lastActive !== today) {
                setProgress(prev => ({ ...prev, streak: 1, lastActiveDate: today }));
            }
        }
    }, []);

    const handleBack = () => navigate('/dashboard');

    const currentModules = activeTrack === 'startup' ? STARTUP_MODULES : STOCK_MODULES;
    const currentProgress = activeTrack === 'startup' ? progress.startupTrack : progress.stockTrack;

    const getModuleProgress = (module: Module) => {
        const completedCount = module.lessons.filter(l =>
            currentProgress.completedLessons.includes(l.id)
        ).length;
        return Math.round((completedCount / module.lessons.length) * 100);
    };

    const getTotalProgress = () => {
        const totalLessons = currentModules.reduce((acc, m) => acc + m.lessons.length, 0);
        const completedLessons = currentProgress.completedLessons.length;
        return Math.round((completedLessons / totalLessons) * 100);
    };

    const completeLesson = (lessonId: string) => {
        const trackKey = activeTrack === 'startup' ? 'startupTrack' : 'stockTrack';
        if (!progress[trackKey].completedLessons.includes(lessonId)) {
            const newProgress = { ...progress };
            newProgress[trackKey].completedLessons.push(lessonId);
            newProgress.totalXP += 10;

            // Check for first lesson badge
            if (newProgress[trackKey].completedLessons.length === 1 && !newProgress.badges.includes('first-lesson')) {
                newProgress.badges.push('first-lesson');
            }

            // Check for dual-track badge
            if (newProgress.startupTrack.completedLessons.length > 0 &&
                newProgress.stockTrack.completedLessons.length > 0 &&
                !newProgress.badges.includes('dual-track')) {
                newProgress.badges.push('dual-track');
            }

            setProgress(newProgress);
        }
        setSelectedLesson(null);
    };

    const handleQuizAnswer = (answerIndex: number) => {
        if (quizAnswered) return;

        const quizzes = SAMPLE_QUIZZES[selectedModule?.id || ''] || [];
        if (answerIndex === quizzes[currentQuizIndex].correctIndex) {
            setQuizScore(prev => prev + 1);
        }
        setQuizAnswered(true);

        setTimeout(() => {
            if (currentQuizIndex < quizzes.length - 1) {
                setCurrentQuizIndex(prev => prev + 1);
                setQuizAnswered(false);
            } else {
                // Quiz completed
                const trackKey = activeTrack === 'startup' ? 'startupTrack' : 'stockTrack';
                const finalScore = Math.round(((quizScore + (answerIndex === quizzes[currentQuizIndex].correctIndex ? 1 : 0)) / quizzes.length) * 100);

                const newProgress = { ...progress };
                newProgress[trackKey].quizScores[selectedModule?.id || ''] = finalScore;
                newProgress.totalXP += finalScore;

                // Check for quiz ace badge
                if (finalScore === 100 && !newProgress.badges.includes('quiz-ace')) {
                    newProgress.badges.push('quiz-ace');
                }

                // Check for module completion
                const module = currentModules.find(m => m.id === selectedModule?.id);
                if (module) {
                    const allLessonsCompleted = module.lessons.every(l =>
                        newProgress[trackKey].completedLessons.includes(l.id)
                    );
                    if (allLessonsCompleted && finalScore >= 70 && !newProgress[trackKey].completedModules.includes(module.id)) {
                        newProgress[trackKey].completedModules.push(module.id);
                        if (!newProgress.badges.includes('module-master')) {
                            newProgress.badges.push('module-master');
                        }
                    }
                }

                setProgress(newProgress);
                setShowQuiz(false);
                setCurrentQuizIndex(0);
                setQuizScore(0);
                setQuizAnswered(false);
            }
        }, 1500);
    };

    const filteredGlossary = GLOSSARY.filter(term =>
        term.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
        term.definition.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const toggleDarkMode = () => {
        document.documentElement.classList.toggle('dark');
        setIsDarkMode(!isDarkMode);
    };

    return (
        <div className={`min-h-screen ${THEME_CLASSES.BG_PRIMARY} pb-24 font-sans`}>
            {/* Header */}
            <header className="sticky top-0 z-40 px-6 py-5 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-xl border-b border-border-light dark:border-border-dark">
                <div className="flex items-center justify-between mb-5">
                    <button onClick={handleBack} className="p-2 -ml-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-all">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-xl font-black tracking-tight text-heading-light dark:text-text-dark">Learn & Grow</h1>
                    <button onClick={toggleDarkMode} className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-all">
                        {isDarkMode ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5" />}
                    </button>
                </div>

                {/* Track Selector */}
                <div className="flex gap-2 p-1.5 bg-surface-light dark:bg-surface-dark rounded-2xl border border-border-light dark:border-border-dark mb-4">
                    <button
                        onClick={() => setActiveTrack('startup')}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTrack === 'startup'
                            ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-500/25'
                            : 'text-subtext-light dark:text-subtext-dark hover:bg-black/5 dark:hover:bg-white/5'
                            }`}
                    >
                        <Rocket className="w-4 h-4" />
                        Startups
                    </button>
                    <button
                        onClick={() => setActiveTrack('stocks')}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTrack === 'stocks'
                            ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/25'
                            : 'text-subtext-light dark:text-subtext-dark hover:bg-black/5 dark:hover:bg-white/5'
                            }`}
                    >
                        <TrendingUp className="w-4 h-4" />
                        Stock Market
                    </button>
                </div>

                {/* Tab Navigation */}
                <div className="flex gap-1 overflow-x-auto no-scrollbar">
                    {[
                        { id: 'learn', label: 'Learn', icon: BookOpen },
                        { id: 'progress', label: 'Progress', icon: BarChart3 },
                        { id: 'glossary', label: 'Glossary', icon: HelpCircle },
                        { id: 'achievements', label: 'Badges', icon: Trophy },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as typeof activeTab)}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${activeTab === tab.id
                                ? 'bg-accent text-white shadow-glow'
                                : 'text-subtext-light dark:text-subtext-dark hover:bg-black/5 dark:hover:bg-white/5'
                                }`}
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
                        <motion.div
                            key="learn"
                            variants={LUXURY_ANIMATIONS.fadeIn}
                            initial="initial"
                            animate="animate"
                            exit="initial"
                            className="space-y-6"
                        >
                            {/* Stats Bar */}
                            <div className="grid grid-cols-3 gap-3">
                                <div className={`${THEME_CLASSES.CARD} p-4 text-center`}>
                                    <div className="flex items-center justify-center gap-1 mb-1">
                                        <Flame className="w-4 h-4 text-orange-500" />
                                        <span className="text-lg font-black text-heading-light dark:text-text-dark">{progress.streak}</span>
                                    </div>
                                    <p className="text-[9px] font-bold uppercase text-subtext-light dark:text-subtext-dark tracking-widest">Streak</p>
                                </div>
                                <div className={`${THEME_CLASSES.CARD} p-4 text-center`}>
                                    <div className="flex items-center justify-center gap-1 mb-1">
                                        <Zap className="w-4 h-4 text-yellow-500" />
                                        <span className="text-lg font-black text-heading-light dark:text-text-dark">{progress.totalXP}</span>
                                    </div>
                                    <p className="text-[9px] font-bold uppercase text-subtext-light dark:text-subtext-dark tracking-widest">XP</p>
                                </div>
                                <div className={`${THEME_CLASSES.CARD} p-4 text-center`}>
                                    <div className="flex items-center justify-center gap-1 mb-1">
                                        <GraduationCap className="w-4 h-4 text-accent" />
                                        <span className="text-lg font-black text-heading-light dark:text-text-dark">{getTotalProgress()}%</span>
                                    </div>
                                    <p className="text-[9px] font-bold uppercase text-subtext-light dark:text-subtext-dark tracking-widest">Complete</p>
                                </div>
                            </div>

                            {/* Module Cards */}
                            <div className="space-y-4">
                                {currentModules.map((module, index) => {
                                    const moduleProgress = getModuleProgress(module);
                                    const isCompleted = currentProgress.completedModules.includes(module.id);

                                    return (
                                        <motion.div
                                            key={module.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            onClick={() => setSelectedModule(module)}
                                            className={`${THEME_CLASSES.CARD} p-5 cursor-pointer group overflow-hidden relative`}
                                        >
                                            <div className={`absolute inset-0 bg-gradient-to-r ${module.color} opacity-5 group-hover:opacity-10 transition-opacity`} />

                                            <div className="relative z-10 flex items-start gap-4">
                                                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${module.color} flex items-center justify-center text-white shadow-lg`}>
                                                    <module.icon className="w-6 h-6" />
                                                </div>

                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="font-bold text-heading-light dark:text-text-dark">{module.title}</h3>
                                                        {isCompleted && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                                                    </div>
                                                    <p className="text-xs text-subtext-light dark:text-subtext-dark mb-3">{module.description}</p>

                                                    <div className="flex items-center gap-3">
                                                        <div className="flex-1 h-1.5 bg-border-light dark:bg-border-dark rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full bg-gradient-to-r ${module.color} transition-all duration-500`}
                                                                style={{ width: `${moduleProgress}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-[10px] font-bold text-accent">{moduleProgress}%</span>
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

                    {/* PROGRESS TAB */}
                    {activeTab === 'progress' && (
                        <motion.div
                            key="progress"
                            variants={LUXURY_ANIMATIONS.fadeIn}
                            initial="initial"
                            animate="animate"
                            exit="initial"
                            className="space-y-6"
                        >
                            {/* Overall Progress Card */}
                            <div className={`${THEME_CLASSES.CARD} p-6 relative overflow-hidden`}>
                                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 blur-3xl rounded-full" />
                                <div className="relative z-10">
                                    <h3 className="font-bold text-heading-light dark:text-text-dark mb-4">Your Learning Journey</h3>

                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div className="text-center p-4 bg-purple-500/10 rounded-2xl">
                                            <Rocket className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                                            <p className="text-2xl font-black text-purple-600">{progress.startupTrack.completedLessons.length}</p>
                                            <p className="text-[10px] font-bold text-subtext-light uppercase">Startup Lessons</p>
                                        </div>
                                        <div className="text-center p-4 bg-green-500/10 rounded-2xl">
                                            <TrendingUp className="w-6 h-6 text-green-500 mx-auto mb-2" />
                                            <p className="text-2xl font-black text-green-600">{progress.stockTrack.completedLessons.length}</p>
                                            <p className="text-[10px] font-bold text-subtext-light uppercase">Stock Lessons</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="font-medium">Total XP Earned</span>
                                            <span className="font-bold text-yellow-600">{progress.totalXP} XP</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="font-medium">Current Streak</span>
                                            <span className="font-bold text-orange-600">{progress.streak} days</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="font-medium">Badges Earned</span>
                                            <span className="font-bold text-accent">{progress.badges.length} / {BADGES.length}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Quiz Scores */}
                            <div className={`${THEME_CLASSES.CARD} p-6`}>
                                <h3 className="font-bold text-heading-light dark:text-text-dark mb-4">Quiz Scores</h3>
                                <div className="space-y-3">
                                    {Object.entries({ ...progress.startupTrack.quizScores, ...progress.stockTrack.quizScores }).map(([moduleId, score]) => {
                                        const module = [...STARTUP_MODULES, ...STOCK_MODULES].find(m => m.id === moduleId);
                                        if (!module) return null;
                                        return (
                                            <div key={moduleId} className="flex items-center justify-between p-3 bg-surface-light dark:bg-surface-dark rounded-xl">
                                                <span className="text-sm font-medium">{module.title}</span>
                                                <span className={`text-sm font-bold ${score >= 70 ? 'text-green-500' : 'text-red-500'}`}>
                                                    {score}%
                                                </span>
                                            </div>
                                        );
                                    })}
                                    {Object.keys({ ...progress.startupTrack.quizScores, ...progress.stockTrack.quizScores }).length === 0 && (
                                        <p className="text-center text-sm text-subtext-light py-4">No quizzes completed yet</p>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* GLOSSARY TAB */}
                    {activeTab === 'glossary' && (
                        <motion.div
                            key="glossary"
                            variants={LUXURY_ANIMATIONS.fadeIn}
                            initial="initial"
                            animate="animate"
                            exit="initial"
                            className="space-y-4"
                        >
                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-subtext-light" />
                                <input
                                    type="text"
                                    placeholder="Search terms..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className={`w-full pl-12 pr-4 py-4 ${THEME_CLASSES.INPUT} rounded-2xl`}
                                />
                            </div>

                            {/* Terms List */}
                            <div className="space-y-2">
                                {filteredGlossary.map((term, index) => (
                                    <motion.div
                                        key={term.term}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.03 }}
                                        onClick={() => setShowGlossaryTerm(term)}
                                        className={`${THEME_CLASSES.CARD} p-4 cursor-pointer flex items-center justify-between group`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase ${term.category === 'startup'
                                                ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
                                                : 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                                                }`}>
                                                {term.category}
                                            </span>
                                            <span className="font-bold text-heading-light dark:text-text-dark">{term.term}</span>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-subtext-light group-hover:translate-x-1 transition-transform" />
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* ACHIEVEMENTS TAB */}
                    {activeTab === 'achievements' && (
                        <motion.div
                            key="achievements"
                            variants={LUXURY_ANIMATIONS.fadeIn}
                            initial="initial"
                            animate="animate"
                            exit="initial"
                            className="space-y-4"
                        >
                            <div className="grid grid-cols-2 gap-4">
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
                                            <p className="text-[10px] text-subtext-light dark:text-subtext-dark">{badge.description}</p>
                                            {isEarned && (
                                                <div className="mt-2 flex items-center justify-center gap-1 text-green-500">
                                                    <CheckCircle2 className="w-3 h-3" />
                                                    <span className="text-[10px] font-bold">Earned</span>
                                                </div>
                                            )}
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Module Detail Modal */}
            <AnimatePresence>
                {selectedModule && !showQuiz && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm px-4 pb-4"
                        onClick={() => setSelectedModule(null)}
                    >
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-md bg-white dark:bg-surface-dark rounded-[2rem] max-h-[85vh] overflow-hidden"
                        >
                            {/* Module Header */}
                            <div className={`p-6 bg-gradient-to-r ${selectedModule.color} text-white relative`}>
                                <button
                                    onClick={() => setSelectedModule(null)}
                                    className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                                <selectedModule.icon className="w-10 h-10 mb-3" />
                                <h2 className="text-xl font-black mb-1">{selectedModule.title}</h2>
                                <p className="text-sm opacity-90">{selectedModule.description}</p>
                            </div>

                            {/* Lessons List */}
                            <div className="p-6 overflow-y-auto max-h-[50vh]">
                                <h3 className="text-xs font-black uppercase text-subtext-light dark:text-subtext-dark tracking-widest mb-4">Lessons</h3>
                                <div className="space-y-3">
                                    {selectedModule.lessons.map((lesson, index) => {
                                        const isCompleted = currentProgress.completedLessons.includes(lesson.id);
                                        const isLocked = index > 0 && !currentProgress.completedLessons.includes(selectedModule.lessons[index - 1].id);

                                        return (
                                            <div
                                                key={lesson.id}
                                                onClick={() => !isLocked && setSelectedLesson(lesson)}
                                                className={`p-4 rounded-2xl border transition-all ${isLocked
                                                    ? 'bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-700 opacity-50 cursor-not-allowed'
                                                    : 'bg-white dark:bg-surface-dark border-border-light dark:border-border-dark cursor-pointer hover:border-accent'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isCompleted
                                                        ? 'bg-green-100 dark:bg-green-900/30 text-green-500'
                                                        : isLocked
                                                            ? 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                                                            : 'bg-accent/10 text-accent'
                                                        }`}>
                                                        {isCompleted ? (
                                                            <CheckCircle2 className="w-5 h-5" />
                                                        ) : isLocked ? (
                                                            <Lock className="w-5 h-5" />
                                                        ) : lesson.type === 'video' ? (
                                                            <Video className="w-5 h-5" />
                                                        ) : lesson.type === 'audio' ? (
                                                            <Volume2 className="w-5 h-5" />
                                                        ) : (
                                                            <FileText className="w-5 h-5" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-bold text-sm text-heading-light dark:text-text-dark">{lesson.title}</h4>
                                                        <p className="text-[11px] text-subtext-light dark:text-subtext-dark">{lesson.description}</p>
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

                                {/* Take Quiz Button */}
                                {getModuleProgress(selectedModule) === 100 && SAMPLE_QUIZZES[selectedModule.id] && (
                                    <button
                                        onClick={() => setShowQuiz(true)}
                                        className={`w-full mt-6 py-4 rounded-2xl font-black flex items-center justify-center gap-2 ${THEME_CLASSES.BTN_PRIMARY}`}
                                    >
                                        <Award className="w-5 h-5" />
                                        Take Module Quiz
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {/* Lesson View Modal */}
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
                                <div className="p-3 rounded-xl bg-accent/10 text-accent">
                                    {selectedLesson.type === 'video' ? <Video className="w-6 h-6" /> :
                                        selectedLesson.type === 'audio' ? <Volume2 className="w-6 h-6" /> :
                                            <FileText className="w-6 h-6" />}
                                </div>
                                <div>
                                    <h2 className="text-lg font-black text-heading-light dark:text-text-dark">{selectedLesson.title}</h2>
                                    <p className="text-xs text-subtext-light">{selectedLesson.duration} • {selectedLesson.type} lesson</p>
                                </div>
                            </div>

                            {/* Simulated Content Area */}
                            <div className="mb-8 p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl min-h-[200px] flex items-center justify-center">
                                {selectedLesson.type === 'video' && (
                                    <div className="text-center">
                                        <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                                            <Play className="w-8 h-8 text-accent fill-accent" />
                                        </div>
                                        <p className="text-sm text-subtext-light">Video content would play here</p>
                                    </div>
                                )}
                                {selectedLesson.type === 'audio' && (
                                    <div className="text-center">
                                        <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                                            <Volume2 className="w-8 h-8 text-accent" />
                                        </div>
                                        <p className="text-sm text-subtext-light">Audio content would play here</p>
                                    </div>
                                )}
                                {selectedLesson.type === 'text' && (
                                    <div className="text-center">
                                        <FileText className="w-16 h-16 text-accent/30 mx-auto mb-4" />
                                        <p className="text-sm text-subtext-light">Interactive text content would display here with cards, highlights, and examples.</p>
                                    </div>
                                )}
                            </div>

                            <p className="text-sm text-subtext-light dark:text-subtext-dark mb-6">{selectedLesson.description}</p>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setSelectedLesson(null)}
                                    className="flex-1 py-4 font-bold text-subtext-light hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => completeLesson(selectedLesson.id)}
                                    className={`flex-1 py-4 rounded-xl font-black flex items-center justify-center gap-2 ${THEME_CLASSES.BTN_PRIMARY}`}
                                >
                                    <Check className="w-5 h-5" />
                                    Mark Complete
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {/* Quiz Modal */}
                {showQuiz && selectedModule && SAMPLE_QUIZZES[selectedModule.id] && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 backdrop-blur-xl px-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="w-full max-w-md bg-white dark:bg-surface-dark rounded-[2rem] p-8"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-black text-heading-light dark:text-text-dark">Module Quiz</h2>
                                <span className="text-sm font-bold text-accent">
                                    {currentQuizIndex + 1} / {SAMPLE_QUIZZES[selectedModule.id].length}
                                </span>
                            </div>

                            <div className="mb-8">
                                <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mb-6">
                                    <div
                                        className="h-full bg-accent transition-all duration-300"
                                        style={{ width: `${((currentQuizIndex + 1) / SAMPLE_QUIZZES[selectedModule.id].length) * 100}%` }}
                                    />
                                </div>

                                <h3 className="text-lg font-bold text-heading-light dark:text-text-dark mb-6">
                                    {SAMPLE_QUIZZES[selectedModule.id][currentQuizIndex].question}
                                </h3>

                                <div className="space-y-3">
                                    {SAMPLE_QUIZZES[selectedModule.id][currentQuizIndex].options.map((option, index) => {
                                        const isCorrect = index === SAMPLE_QUIZZES[selectedModule.id][currentQuizIndex].correctIndex;
                                        const showResult = quizAnswered;

                                        return (
                                            <button
                                                key={index}
                                                onClick={() => handleQuizAnswer(index)}
                                                disabled={quizAnswered}
                                                className={`w-full p-4 rounded-2xl text-left font-medium transition-all ${showResult
                                                    ? isCorrect
                                                        ? 'bg-green-100 dark:bg-green-900/30 border-2 border-green-500 text-green-700 dark:text-green-400'
                                                        : 'bg-red-50 dark:bg-red-900/20 border-2 border-gray-200 dark:border-gray-700 text-gray-500'
                                                    : 'bg-gray-50 dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 hover:border-accent'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${showResult && isCorrect
                                                        ? 'bg-green-500 text-white'
                                                        : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                                                        }`}>
                                                        {String.fromCharCode(65 + index)}
                                                    </span>
                                                    {option}
                                                    {showResult && isCorrect && <CheckCircle2 className="w-5 h-5 text-green-500 ml-auto" />}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <button
                                onClick={() => { setShowQuiz(false); setCurrentQuizIndex(0); setQuizScore(0); setQuizAnswered(false); }}
                                className="w-full py-3 text-sm font-bold text-subtext-light hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors"
                            >
                                Exit Quiz
                            </button>
                        </motion.div>
                    </motion.div>
                )}

                {/* Glossary Term Modal */}
                {showGlossaryTerm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowGlossaryTerm(null)}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.9 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-sm bg-white dark:bg-surface-dark rounded-[2rem] p-8"
                        >
                            <div className={`inline-block px-3 py-1 rounded-lg text-[10px] font-black uppercase mb-4 ${showGlossaryTerm.category === 'startup'
                                ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
                                : 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                                }`}>
                                {showGlossaryTerm.category}
                            </div>
                            <h2 className="text-2xl font-black text-heading-light dark:text-text-dark mb-4">{showGlossaryTerm.term}</h2>
                            <p className="text-sm text-subtext-light dark:text-subtext-dark leading-relaxed mb-6">{showGlossaryTerm.definition}</p>
                            <button
                                onClick={() => setShowGlossaryTerm(null)}
                                className={`w-full py-4 rounded-xl font-black ${THEME_CLASSES.BTN_PRIMARY}`}
                            >
                                Got it
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MarketSection;
