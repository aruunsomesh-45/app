import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Code2, Layout,
    ArrowLeft, Plus, Play,
    Bug, ExternalLink,
    CheckCircle2, Circle, Clock, ChevronRight,
    Flame, Network, Search,
    Book, Youtube,
    User, X, Edit2, Terminal,
    Cpu, Sparkles, AlertCircle, Award, Target, TrendingUp,
    ListChecks, RefreshCw
} from 'lucide-react';
import { useLifeTracker, LifeTrackerStore } from '../utils/lifeTrackerStore';
import type {
    CodingLearningPath,
    DSAProblem,
    CodingProject,
    DebugLog,
    VideoResource,
    CSNote,
    SkillMastery
} from '../utils/lifeTrackerStore';
import type { LucideIcon } from 'lucide-react';

// --- Custom Icons ---
const MapIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 7l6-3 6 3 6-3v13l-6 3-6-3-6 3V7z" />
        <path d="M9 4v13" />
        <path d="M15 7v13" />
    </svg>
);

const generateId = () => Math.random().toString(36).substring(2, 9);

// --- QUICK SKILLS BAR ---
const QuickSkillsBar: React.FC<{ store: LifeTrackerStore }> = ({ store }) => {
    const state = store.getState();
    const skills = state.skillMastery;

    if (skills.length === 0) return null;

    return (
        <div className="px-5 py-2.5 border-t border-border-light dark:border-border-dark flex items-center gap-3 overflow-x-auto no-scrollbar bg-white-smoke/30 dark:bg-black/10">
            <div className="flex items-center gap-1.5 min-w-fit">
                <Target className="w-3 h-3 text-accent" />
                <span className="text-[8px] font-black text-accent uppercase tracking-widest whitespace-nowrap">Core Mastery:</span>
            </div>
            <div className="flex gap-2.5">
                {skills.slice(0, 5).map(skill => (
                    <motion.div
                        key={skill.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-2 px-3 py-1 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl whitespace-nowrap shadow-soft"
                    >
                        <span className="text-[9px] font-black text-heading-light dark:text-text-dark uppercase tracking-tight">{skill.name}</span>
                        <div className="flex gap-0.5">
                            {[1, 2, 3].map(i => (
                                <div
                                    key={i}
                                    className={`w-1 h-1 rounded-full ${i <= Math.ceil((skill.depthRating / 5) * 3) ? 'bg-accent shadow-glow' : 'bg-silver/20'}`}
                                />
                            ))}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

// --- SKILL BADGE COMPONENT ---
const SkillBadge: React.FC<{ name: string; store: LifeTrackerStore }> = ({ name, store }) => {
    const skills = store.getState().skillMastery;
    // Try to match by name or part of name
    const skill = skills.find(s =>
        s.name.toLowerCase() === name.toLowerCase() ||
        name.toLowerCase().includes(s.name.toLowerCase()) ||
        s.name.toLowerCase().includes(name.toLowerCase())
    );

    if (!skill) return null;

    return (
        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-accent/5 border border-accent/20 rounded-lg group">
            <Award className="w-2.5 h-2.5 text-accent" />
            <span className="text-[8px] font-black text-accent uppercase tracking-widest">{skill.name} {skill.depthRating}/5</span>
        </div>
    );
};

// --- Types for local state ---
type SectionId = 'paths' | 'dsa' | 'videos' | 'projects' | 'notes' | 'mastery';

interface ContentFormData {
    title: string;
    content: string;
    url: string;
    domain: string;
    difficulty: 'easy' | 'medium' | 'hard';
    category: 'DSA' | 'CS Core' | 'System Design';
    status: string;
    techStack: string[];
}

const CodingSection: React.FC = () => {
    const navigate = useNavigate();
    const store = useLifeTracker();
    const state = store.getState();
    const codingStats = store.getCodingStats();
    const profile = state.userProfile;

    const [activeTab, setActiveTab] = useState<SectionId>('paths');
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [addType, setAddType] = useState<SectionId | 'log' | 'concept' | 'journal' | null>(null);

    const tabs: { id: SectionId; label: string; icon: React.FC<React.SVGProps<SVGSVGElement>> }[] = [
        { id: 'paths', label: 'Learning', icon: MapIcon },
        { id: 'dsa', label: 'Problems', icon: Code2 },
        { id: 'videos', label: 'Library', icon: Play },
        { id: 'projects', label: 'Projects', icon: Layout },
        { id: 'mastery', label: 'Mastery', icon: Award },
        { id: 'notes', label: 'Knowledge', icon: Bug }
    ];

    const containerVariants = {
        hidden: { opacity: 0, x: 10 },
        visible: {
            opacity: 1,
            x: 0,
            transition: { duration: 0.3, staggerChildren: 0.1 }
        },
        exit: { opacity: 0, x: -10, transition: { duration: 0.2 } }
    };

    return (
        <div className="min-h-screen bg-white-smoke dark:bg-background-dark pb-32 transition-colors duration-500">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-surface-light/80 dark:bg-surface-dark/80 backdrop-blur-md border-b border-border-light dark:border-border-dark">
                <div className="px-5 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-heading-light dark:text-text-dark" />
                        </button>
                        <div>
                            <h1 className="text-xl font-black text-heading-light dark:text-text-dark tracking-tight">Coding</h1>
                            <p className="text-[10px] font-bold text-accent uppercase tracking-widest">Developer OS</p>
                        </div>
                    </div>

                    {/* Profile Card */}
                    <button
                        onClick={() => setIsProfileModalOpen(true)}
                        className="flex items-center gap-2 bg-surface-light dark:bg-surface-dark p-1 pr-3 rounded-full border border-border-light dark:border-border-dark shadow-soft hover:shadow-glow transition-all active:scale-95"
                    >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-silver flex items-center justify-center text-white overflow-hidden">
                            {profile.avatar ? <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" /> : <User className="w-4 h-4" />}
                        </div>
                        <div className="flex flex-col items-start">
                            <span className="text-[10px] font-black leading-none text-heading-light dark:text-text-dark">{profile.firstName}</span>
                            <div className="flex items-center gap-0.5 mt-0.5">
                                <Flame className="w-2.5 h-2.5 text-orange-500 fill-orange-500" />
                                <span className="text-[8px] font-bold text-gray-400 dark:text-subtext-dark">{codingStats.streak} streak</span>
                            </div>
                        </div>
                    </button>
                </div>

                {/* Tab Navigation (Horizontal Carousel) */}
                <div className="px-5 pb-2 flex gap-4 overflow-x-auto no-scrollbar scroll-smooth mask-fade-edges">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex flex-col items-center gap-1 flex-1 min-w-[70px] pb-2 transition-all relative ${activeTab === tab.id
                                ? 'text-accent'
                                : 'text-subtext-light dark:text-subtext-dark'
                                }`}
                        >
                            <tab.icon className="w-5 h-5" />
                            <span className="text-[10px] font-bold uppercase tracking-wider text-center whitespace-nowrap">{tab.label}</span>
                            {activeTab === tab.id && (
                                <motion.div
                                    layoutId="underline"
                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-full"
                                />
                            )}
                        </button>
                    ))}
                </div>
                <QuickSkillsBar store={store} />
            </header>

            <main className="max-w-md mx-auto px-5 py-6">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                    >
                        {activeTab === 'paths' && <LearningPathsSection store={store} onAdd={() => setAddType('paths')} />}
                        {activeTab === 'dsa' && <ProblemSolvingSection store={store} onAdd={() => setAddType('dsa')} />}
                        {activeTab === 'videos' && <VideoLibrarySection store={store} onAdd={() => setAddType('videos')} />}
                        {activeTab === 'projects' && <ProjectsVaultSection store={store} onAdd={() => setAddType('projects')} />}
                        {activeTab === 'mastery' && <MasteryTrackingSection store={store} onAdd={() => setAddType('mastery')} />}
                        {activeTab === 'notes' && <KnowledgeBaseSection store={store} onAddConcept={() => setAddType('concept')} onAddLog={() => setAddType('log')} onAddJournal={() => setAddType('journal')} />}
                    </motion.div>
                </AnimatePresence>
            </main>

            <AnimatePresence>
                {addType && (
                    <AddContentOverlay
                        type={addType}
                        onClose={() => setAddType(null)}
                        store={store}
                        activePathId={state.codingLearningPaths[0]?.id}
                    />
                )}
            </AnimatePresence>

            {/* Profile Modal */}
            <AnimatePresence>
                {isProfileModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center px-5">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsProfileModalOpen(false)}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-surface-light dark:bg-surface-dark w-full max-w-xs rounded-4xl overflow-hidden shadow-luxury relative z-10 p-7"
                        >
                            <div className="flex justify-between items-start mb-6">
                                <h3 className="font-black text-lg tracking-tight text-heading-light dark:text-text-dark">Identity</h3>
                                <button onClick={() => setIsProfileModalOpen(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="flex flex-col items-center text-center mb-8">
                                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-accent to-silver mb-4 flex items-center justify-center text-white shadow-glow relative">
                                    <User className="w-12 h-12" />
                                    <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 border-4 border-white dark:border-surface-dark rounded-full" />
                                </div>
                                <h4 className="font-black text-2xl text-heading-light dark:text-text-dark">{profile.firstName}</h4>
                                <p className="text-[10px] text-accent font-black uppercase tracking-widest mt-1">Personal Developer OS</p>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-8">
                                <div className="bg-white-smoke dark:bg-background-dark p-5 rounded-3xl border border-border-light dark:border-border-dark text-center">
                                    <p className="text-2xl font-black text-accent">{codingStats.streak}</p>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Streak</p>
                                </div>
                                <div className="bg-white-smoke dark:bg-background-dark p-5 rounded-3xl border border-border-light dark:border-border-dark text-center">
                                    <p className="text-2xl font-black text-accent">{state.dsaProblems.filter(p => p.status === 'solved').length}</p>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Growth</p>
                                </div>
                            </div>

                            <button className="w-full py-4 bg-accent text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-elegant hover:shadow-luxury transition-all">
                                Update Core Systems
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

// --- SECTION 1: LEARNING PATHS ---
function LearningPathsSection({ store, onAdd }: { store: LifeTrackerStore; onAdd: () => void }) {
    const state = store.getState();
    const paths: CodingLearningPath[] = state.codingLearningPaths;
    const [selectedPathId, setSelectedPathId] = useState(paths[0]?.id || 'fs');
    const [addingTopicToWeek, setAddingTopicToWeek] = useState<string | null>(null);
    const [newTopicBuffer, setNewTopicBuffer] = useState('');

    const activePath = paths.find(p => p.id === selectedPathId);

    return (
        <div className="space-y-6">
            {/* Domain Selector */}
            <div className="flex gap-2 p-1.5 bg-surface-light dark:bg-surface-dark rounded-3xl border border-border-light dark:border-border-dark shadow-soft">
                {paths.map(path => (
                    <button
                        key={path.id}
                        onClick={() => setSelectedPathId(path.id)}
                        className={`flex-1 py-3 px-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${selectedPathId === path.id
                            ? 'bg-accent text-white shadow-glow'
                            : 'text-subtext-light dark:text-subtext-dark hover:text-accent'
                            }`}
                    >
                        {path.title}
                    </button>
                ))}
            </div>

            {/* Weekly Planner */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-[#847777]/60 ml-2">Weekly Planner</h3>
                    <button
                        onClick={onAdd}
                        className="flex items-center gap-1.5 px-4 py-2 bg-accent/10 text-accent rounded-full text-[10px] font-black uppercase tracking-widest border border-accent/20 hover:bg-accent/20 transition-all"
                    >
                        <Plus className="w-3.5 h-3.5" /> Add Week
                    </button>
                </div>

                {(!activePath || activePath.weeks.length === 0) ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-16 text-center bg-surface-light dark:bg-surface-dark rounded-4xl border border-dashed border-border-light dark:border-border-dark">
                        <MapIcon className="w-12 h-12 text-silver mx-auto mb-4 opacity-30" />
                        <p className="text-sm font-bold text-subtext-light dark:text-subtext-dark">Domain silence.</p>
                        <p className="text-[10px] uppercase tracking-widest mt-2 text-silver">Map your path.</p>
                    </motion.div>
                ) : (
                    <div className="space-y-4">
                        {activePath.weeks.map((week, idx) => (
                            <motion.div
                                key={week.id}
                                layout
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="bg-surface-light dark:bg-surface-dark p-6 rounded-4xl border border-border-light dark:border-border-dark shadow-soft group hover:border-accent/40 transition-all"
                            >
                                <div className="flex items-start justify-between mb-5">
                                    <div>
                                        <h4 className="font-black text-lg text-heading-light dark:text-text-dark tracking-tight leading-none mb-1">Week {week.weekNumber}</h4>
                                        <p className="text-[10px] font-bold text-accent uppercase tracking-widest">{week.weekRange}</p>
                                    </div>
                                    <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${week.status === 'completed' ? 'bg-green-100 text-green-600' :
                                        week.status === 'in-progress' ? 'bg-blue-100 text-blue-600' : 'bg-white-smoke dark:bg-background-dark text-silver shadow-inner'
                                        }`}>
                                        {week.status}
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    {/* Focus Area */}
                                    <div className="bg-white-smoke/50 dark:bg-background-dark/50 p-3 rounded-2xl border border-border-light dark:border-border-dark">
                                        <p className="text-[9px] font-black text-accent uppercase tracking-widest mb-1.5 flex items-center gap-1">
                                            <Sparkles className="w-3 h-3" /> Core Focus
                                        </p>
                                        <textarea
                                            className="w-full bg-transparent text-[11px] font-medium leading-relaxed text-subtext-light dark:text-subtext-dark focus:outline-none min-h-[40px] resize-none"
                                            placeholder="What is the primary goal this week?"
                                            defaultValue={week.weekRange}
                                            onBlur={(e) => store.updateCodingLearningWeek(selectedPathId, week.id, { weekRange: e.target.value })}
                                        />
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {week.topics.map((topic, tIdx) => (
                                            <span key={tIdx} className="group/topic px-3 py-1.5 bg-white-smoke dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl text-[10px] font-bold text-heading-light dark:text-text-dark flex items-center gap-2">
                                                {topic}
                                                <button
                                                    onClick={() => store.updateCodingLearningWeek(selectedPathId, week.id, {
                                                        topics: week.topics.filter((_, i) => i !== tIdx)
                                                    })}
                                                    className="opacity-0 group-hover/topic:opacity-100 transition-opacity hover:text-rose-500"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </span>
                                        ))}
                                        <div className="flex items-center gap-2">
                                            {addingTopicToWeek === week.id ? (
                                                <div className="flex gap-2 items-center bg-white-smoke dark:bg-background-dark p-1 pr-2 rounded-xl border border-accent/30 animate-in fade-in slide-in-from-left-2 duration-300">
                                                    <input
                                                        autoFocus
                                                        type="text"
                                                        value={newTopicBuffer}
                                                        onChange={(e) => setNewTopicBuffer(e.target.value)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter' && newTopicBuffer.trim()) {
                                                                store.updateCodingLearningWeek(selectedPathId, week.id, { topics: [...week.topics, newTopicBuffer.trim()] });
                                                                setAddingTopicToWeek(null);
                                                                setNewTopicBuffer('');
                                                            }
                                                            if (e.key === 'Escape') setAddingTopicToWeek(null);
                                                        }}
                                                        placeholder="Focus Area..."
                                                        className="bg-transparent text-[10px] font-bold px-2 py-1 focus:outline-none w-24 text-heading-light dark:text-text-dark"
                                                    />
                                                    <button onClick={() => setAddingTopicToWeek(null)} className="text-silver hover:text-rose-500">
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => setAddingTopicToWeek(week.id)}
                                                    className="px-4 py-2 bg-accent/5 border border-dashed border-accent/30 rounded-xl text-[10px] font-black uppercase text-accent hover:bg-accent/10 transition-all flex items-center gap-1.5 shadow-sm"
                                                >
                                                    <Plus className="w-3.5 h-3.5" /> Add Topic
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-6 pt-5 border-t border-border-light dark:border-border-dark flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => store.updateCodingLearningWeek(selectedPathId, week.id, { status: week.status === 'completed' ? 'pending' : week.status === 'in-progress' ? 'completed' : 'in-progress' })}
                                            className="flex items-center gap-2"
                                        >
                                            <div className={`w-2 h-2 rounded-full ${week.status === 'completed' ? 'bg-green-500' : week.status === 'in-progress' ? 'bg-blue-500 animate-pulse' : 'bg-silver'}`} />
                                            <span className="text-[10px] font-black text-silver uppercase tracking-widest">{week.status || 'Planned'}</span>
                                        </button>
                                    </div>
                                    {addingTopicToWeek === `edit-desc-${week.id}` ? (
                                        <div className="flex gap-2 items-center bg-white-smoke dark:bg-background-dark p-1 pr-2 rounded-xl border border-accent/30 animate-in fade-in slide-in-from-right-2 duration-300">
                                            <input
                                                autoFocus
                                                type="text"
                                                value={newTopicBuffer}
                                                onChange={(e) => setNewTopicBuffer(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' && newTopicBuffer.trim()) {
                                                        store.updateCodingLearningWeek(selectedPathId, week.id, { weekRange: newTopicBuffer.trim() });
                                                        setAddingTopicToWeek(null);
                                                        setNewTopicBuffer('');
                                                    }
                                                    if (e.key === 'Escape') setAddingTopicToWeek(null);
                                                }}
                                                className="bg-transparent text-[10px] font-bold px-2 py-1 focus:outline-none w-32 text-accent"
                                            />
                                            <button onClick={() => setAddingTopicToWeek(null)} className="text-silver hover:text-rose-500">
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => {
                                                setAddingTopicToWeek(`edit-desc-${week.id}`);
                                                setNewTopicBuffer(week.weekRange);
                                            }}
                                            className="text-[10px] font-black text-accent uppercase tracking-widest flex items-center gap-1 group-hover:gap-2 transition-all"
                                        >
                                            Edit Details <ChevronRight className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// --- SECTION 2: PROBLEM SOLVING & SYSTEM DESIGN ---
function ProblemSolvingSection({ store, onAdd }: { store: LifeTrackerStore; onAdd: () => void }) {
    const state = store.getState();
    const problems: DSAProblem[] = state.dsaProblems;
    const [selectedCategory, setSelectedCategory] = useState<'DSA' | 'CS Core' | 'System Design'>('DSA');
    const [expandedProblemId, setExpandedProblemId] = useState<string | null>(null);

    const categories = [
        { id: 'DSA', label: 'Algorithms', icon: Code2, desc: 'Interview Patterns' },
        { id: 'CS Core', label: 'Core Systems', icon: Cpu, desc: 'The Foundations' },
        { id: 'System Design', label: 'Architecture', icon: Network, desc: 'Scale & Design' }
    ];

    const filteredProblems = problems.filter(p => p.category === selectedCategory);

    return (
        <div className="space-y-8">
            {/* Category Grid */}
            <div className="grid grid-cols-3 gap-3">
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id as 'DSA' | 'CS Core' | 'System Design')}
                        className={`p-5 rounded-4xl border transition-all text-left flex flex-col justify-between h-36 ${selectedCategory === cat.id
                            ? 'bg-surface-light dark:bg-surface-dark border-accent shadow-luxury ring-1 ring-accent/20'
                            : 'bg-surface-light dark:bg-surface-dark border-border-light dark:border-border-dark opacity-60'
                            }`}
                    >
                        <cat.icon className={`w-7 h-7 ${selectedCategory === cat.id ? 'text-accent' : 'text-silver'}`} />
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-heading-light dark:text-text-dark">{cat.label}</p>
                            <p className="text-[8px] text-silver font-bold mt-1 leading-tight">{cat.desc}</p>
                        </div>
                    </button>
                ))}
            </div>

            {/* List */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-[#847777]/60">Structured Problems</h3>
                    <button
                        onClick={onAdd}
                        className="p-2.5 bg-accent/10 text-accent rounded-2xl hover:bg-accent/20 transition-all border border-accent/10"
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                </div>

                {filteredProblems.length === 0 ? (
                    <div className="p-16 text-center bg-surface-light dark:bg-surface-dark rounded-4xl border border-border-light dark:border-border-dark">
                        <Terminal className="w-12 h-12 text-silver mx-auto mb-4 opacity-20" />
                        <p className="text-[10px] font-bold text-silver uppercase tracking-widest italic">Analysis required.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredProblems.map((prob) => {
                            const isExpanded = expandedProblemId === prob.id;
                            return (
                                <motion.div
                                    key={prob.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className={`bg-surface-light dark:bg-surface-dark rounded-3xl border transition-all overflow-hidden ${isExpanded ? 'border-accent shadow-luxury ring-1 ring-accent/10' : 'border-border-light dark:border-border-dark'
                                        }`}
                                >
                                    <div className="p-5 flex items-center justify-between cursor-pointer" onClick={() => setExpandedProblemId(isExpanded ? null : prob.id)}>
                                        <div className="flex items-center gap-4">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    store.updateDSAProblem(prob.id, { status: prob.status === 'solved' ? 'review' : 'solved' });
                                                }}
                                                className={`transition-all ${prob.status === 'solved' ? 'text-green-500 scale-110' : 'text-silver hover:text-accent'}`}
                                            >
                                                {prob.status === 'solved' ? <CheckCircle2 className="w-6 h-6 shadow-glow rounded-full" /> : <Circle className="w-6 h-6" />}
                                            </button>
                                            <div>
                                                <h4 className={`text-sm font-black tracking-tight text-heading-light dark:text-text-dark ${prob.status === 'solved' ? 'opacity-40' : ''}`}>{prob.title}</h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md ${prob.difficulty === 'easy' ? 'bg-green-100 text-green-600' :
                                                        prob.difficulty === 'medium' ? 'bg-orange-100 text-orange-600' : 'bg-red-100 text-red-600'
                                                        }`}>
                                                        {prob.difficulty}
                                                    </span>
                                                    <span className="text-[8px] text-silver font-bold uppercase tracking-widest">{selectedCategory}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <ChevronRight className={`w-4 h-4 text-silver transition-transform duration-300 ${isExpanded ? 'rotate-90 text-accent' : ''}`} />
                                    </div>

                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="border-t border-border-light dark:border-border-dark bg-white-smoke/30 dark:bg-background-dark/30 p-5 px-6 space-y-5"
                                            >
                                                <div className="space-y-2">
                                                    <p className="text-[9px] font-black text-accent uppercase tracking-widest flex items-center gap-1.5">
                                                        <Edit2 className="w-3 h-3" /> Critical Notes
                                                    </p>
                                                    <textarea
                                                        className="w-full bg-transparent text-[11px] font-medium leading-relaxed text-subtext-light dark:text-subtext-dark focus:outline-none min-h-[60px] resize-none"
                                                        placeholder="Thinking process & patterns..."
                                                        defaultValue={prob.notes}
                                                        onBlur={(e) => store.updateDSAProblem(prob.id, { notes: e.target.value })}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <p className="text-[9px] font-black text-rose-500/60 uppercase tracking-widest flex items-center gap-1.5">
                                                        <AlertCircle className="w-3 h-3" /> Mistakes & Learnings
                                                    </p>
                                                    <textarea
                                                        className="w-full bg-transparent text-[11px] font-medium leading-relaxed text-subtext-light dark:text-subtext-dark focus:outline-none min-h-[60px] resize-none"
                                                        placeholder="What went wrong? What did you discover?"
                                                        defaultValue={prob.learnings}
                                                        onBlur={(e) => store.updateDSAProblem(prob.id, { learnings: e.target.value })}
                                                    />
                                                </div>
                                                <div className="pt-2 flex justify-end">
                                                    <button className="text-[9px] font-black text-accent uppercase tracking-widest border-b border-accent pb-0.5">
                                                        Lock Observation
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

// --- SECTION 3: VIDEO RESOURCE LIBRARY ---
function VideoLibrarySection({ store, onAdd }: { store: LifeTrackerStore; onAdd: () => void }) {
    const state = store.getState();
    const videos: VideoResource[] = state.videoResources;
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');
    const [refiningVideoId, setRefiningVideoId] = useState<string | null>(null);
    const [refiningBuffer, setRefiningBuffer] = useState('');
    const scrollRef = React.useRef<HTMLDivElement>(null);

    const scrollFilters = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            // Paging: Scroll by roughly 4 items width (each ~120px + gap)
            const scrollAmount = 480;
            scrollRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
        }
    };

    const filters = ['All', 'Full Stack', 'Data Science', 'DevOps', 'DSA', 'Core CS', 'System Design', 'ML', 'AI', 'Agents', 'Neural Networks'];

    const getYoutubeID = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const filteredVideos = videos.filter(v => {
        const matchesFilter = activeFilter === 'All' || v.domain === activeFilter;
        const matchesSearch = v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (v.description || '').toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    return (
        <div className="space-y-8">
            {/* Search & Filter */}
            <div className="space-y-6">
                <div className="relative group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-silver group-focus-within:text-accent transition-all duration-300" />
                    <input
                        type="text"
                        placeholder="Search Intel & Archives..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-6 py-4 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-2xl text-sm font-bold placeholder:text-silver/50 focus:outline-none focus:ring-2 focus:ring-accent/10 transition-all shadow-soft"
                    />
                </div>
                <div className="relative group/carousel">
                    {/* Carousel Nav */}
                    <button
                        onClick={() => scrollFilters('left')}
                        className="absolute -left-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-full shadow-luxury opacity-0 group-hover/carousel:opacity-100 transition-opacity"
                    >
                        <ArrowLeft className="w-4 h-4 text-accent" />
                    </button>
                    <button
                        onClick={() => scrollFilters('right')}
                        className="absolute -right-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-full shadow-luxury opacity-0 group-hover/carousel:opacity-100 transition-opacity"
                    >
                        <ChevronRight className="w-4 h-4 text-accent" />
                    </button>

                    <div ref={scrollRef} className="flex gap-3 overflow-x-auto no-scrollbar pb-4 scroll-smooth px-1 mask-fade-edges">
                        {filters.map(filter => (
                            <button
                                key={filter}
                                onClick={() => setActiveFilter(filter)}
                                className={`px-8 py-4.5 rounded-[22px] text-[11px] font-black uppercase tracking-[0.1em] whitespace-nowrap transition-all border-2 ${activeFilter === filter
                                    ? 'bg-accent text-white border-accent shadow-[0_10px_30px_rgba(var(--accent-rgb),0.3)] scale-105 z-10'
                                    : 'bg-surface-light dark:bg-surface-dark text-silver border-border-light dark:border-border-dark hover:border-accent/30 hover:bg-accent/5'
                                    }`}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-5">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-[#847777]/60">Categorized Intel</h3>
                    <button
                        onClick={onAdd}
                        className="p-2 bg-accent/10 text-accent rounded-2xl hover:bg-accent/20 transition-all border border-accent/10"
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                </div>

                {filteredVideos.length === 0 ? (
                    <div className="p-20 text-center">
                        <Youtube className="w-12 h-12 text-silver mx-auto mb-5 opacity-20" />
                        <p className="text-[10px] font-black text-silver uppercase tracking-widest">Library empty.</p>
                    </div>
                ) : (
                    filteredVideos.map(video => {
                        const thumbId = getYoutubeID(video.url);
                        return (
                            <motion.div
                                key={video.id}
                                layout
                                className="bg-surface-light dark:bg-surface-dark rounded-4xl overflow-hidden border border-border-light dark:border-border-dark shadow-soft group hover:shadow-luxury transition-all"
                            >
                                <div className="aspect-video bg-background-dark/80 flex items-center justify-center relative shadow-inner overflow-hidden">
                                    {thumbId ? (
                                        <img
                                            src={`https://img.youtube.com/vi/${thumbId}/maxresdefault.jpg`}
                                            alt={video.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                            onError={(e) => { (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${thumbId}/0.jpg`; }}
                                        />
                                    ) : (
                                        <Play className="w-12 h-12 text-white/30 group-hover:scale-110 group-hover:text-accent/60 transition-all duration-500" />
                                    )}
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                                    <div className="absolute top-5 left-5">
                                        <span className="px-3 py-1.5 bg-black/60 backdrop-blur-md text-white text-[9px] font-black uppercase rounded-xl border border-white/10 tracking-widest">
                                            {video.domain}
                                        </span>
                                    </div>
                                    <div className="absolute bottom-5 right-5 p-3 bg-accent rounded-2xl opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 shadow-glow">
                                        <Play className="w-5 h-5 text-white fill-current" />
                                    </div>
                                </div>
                                <div className="p-6">
                                    <h4 className="font-black text-xl text-heading-light dark:text-text-dark mb-2 leading-tight tracking-tight">{video.title}</h4>
                                    <div className="flex items-center gap-2 mb-4">
                                        <Youtube className="w-3.5 h-3.5 text-rose-500" />
                                        <span className="text-[10px] font-mono text-silver truncate max-w-[200px]">{video.url}</span>
                                    </div>
                                    <p className="text-xs text-silver line-clamp-2 mb-6 font-medium leading-relaxed">
                                        {video.description}
                                    </p>
                                    <div className="grid grid-cols-2 gap-3">
                                        {refiningVideoId === video.id ? (
                                            <div className="col-span-1 flex gap-2 items-center bg-white-smoke dark:bg-background-dark p-1 pr-2 rounded-2xl border border-accent/30 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                                <input
                                                    autoFocus
                                                    type="text"
                                                    value={refiningBuffer}
                                                    onChange={(e) => setRefiningBuffer(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' && refiningBuffer.trim()) {
                                                            store.addVideoResource({ ...video, description: refiningBuffer.trim() });
                                                            setRefiningVideoId(null);
                                                            setRefiningBuffer('');
                                                        }
                                                        if (e.key === 'Escape') setRefiningVideoId(null);
                                                    }}
                                                    className="bg-transparent text-[10px] font-bold px-3 py-3 focus:outline-none w-full text-accent"
                                                />
                                                <button onClick={() => setRefiningVideoId(null)} className="text-silver hover:text-rose-500 p-2">
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => {
                                                    setRefiningVideoId(video.id);
                                                    setRefiningBuffer(video.description || '');
                                                }}
                                                className="py-4 bg-white-smoke dark:bg-background-dark border border-border-light dark:border-border-dark text-silver rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-accent transition-all relative overflow-hidden group/edit"
                                            >
                                                <span className="relative z-10">Refine Intel</span>
                                                <div className="absolute inset-0 bg-accent translate-y-full group-hover/edit:translate-y-0 transition-transform duration-300 opacity-5" />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => video.url && window.open(video.url, '_blank')}
                                            className="py-4 bg-white-smoke dark:bg-background-dark border border-border-light dark:border-border-dark text-accent rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-elegant hover:shadow-luxury transition-all flex items-center justify-center gap-2"
                                        >
                                            Launch <ExternalLink className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })
                )}
            </div>
        </div>
    );
}


// --- SECTION 4: PROJECTS & VAULT ---
function ProjectsVaultSection({ store, onAdd }: { store: LifeTrackerStore; onAdd: () => void }) {
    const state = store.getState();
    const projects: CodingProject[] = state.codingProjects;

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between px-2">
                <div>
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-[#847777]/60">Execution Lab</h3>
                    <p className="text-[9px] text-silver font-bold uppercase tracking-widest mt-1">Materialize Thoughts</p>
                </div>
                <button
                    onClick={onAdd}
                    className="flex items-center gap-2.5 px-6 py-3 bg-accent text-white rounded-3xl text-[10px] font-black uppercase tracking-widest shadow-glow hover:scale-105 active:scale-95 transition-all"
                >
                    <Plus className="w-4 h-4" /> Add Project
                </button>
            </div>

            <div className="space-y-5">
                {projects.length === 0 ? (
                    <div className="p-16 text-center bg-surface-light dark:bg-surface-dark rounded-4xl border border-dashed border-border-light dark:border-border-dark">
                        <Layout className="w-12 h-12 text-silver mx-auto mb-4 opacity-20" />
                        <p className="text-[10px] font-black text-silver uppercase tracking-widest">Lab Inactive.</p>
                    </div>
                ) : (
                    projects.map(project => (
                        <div key={project.id} className="bg-surface-light dark:bg-surface-dark rounded-4xl border border-border-light dark:border-border-dark shadow-soft overflow-hidden group hover:border-accent/40 transition-all">
                            <div className="p-7">
                                <div className="flex items-start justify-between mb-6">
                                    <div>
                                        <h4 className="font-black text-2xl text-heading-light dark:text-text-dark tracking-tighter leading-none mb-2">{project.title}</h4>
                                        <div className={`inline-flex px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${project.status === 'completed' ? 'bg-green-100 text-green-600' :
                                            project.status === 'in-progress' ? 'bg-blue-100 text-blue-600' : 'bg-white-smoke dark:bg-background-dark text-silver shadow-inner'
                                            }`}>
                                            {project.status}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 p-2 bg-white-smoke dark:bg-background-dark rounded-xl">
                                        <Clock className="w-3.5 h-3.5 text-accent" />
                                        <span className="text-[9px] font-black text-accent uppercase tracking-widest">Active</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6 mb-8">
                                    <div className="space-y-1.5">
                                        <p className="text-[9px] font-black text-silver uppercase tracking-widest">Core Objective</p>
                                        <p className="text-[11px] font-medium leading-relaxed text-subtext-light dark:text-subtext-dark line-clamp-2">{project.objective}</p>
                                    </div>
                                    <div className="space-y-1.5">
                                        <p className="text-[9px] font-black text-silver uppercase tracking-widest">Tech Stack</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {project.techStack.length === 0 ? (
                                                <button
                                                    onClick={() => {
                                                        const tech = prompt('Add Tech (e.g. React, Node):');
                                                        if (tech) store.updateCodingProject(project.id, { techStack: [...project.techStack, tech] });
                                                    }}
                                                    className="text-[10px] text-accent font-black uppercase tracking-widest border border-dashed border-accent/20 px-2 py-1 rounded-lg"
                                                >
                                                    + Tech
                                                </button>
                                            ) : (
                                                project.techStack.map(t => (
                                                    <span key={t} className="px-2 py-1 bg-accent/5 border border-accent/10 rounded-lg text-[9px] font-black text-accent tracking-widest">{t}</span>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 mb-8">
                                    <button
                                        onClick={() => {
                                            const newGoal = prompt('Update Objective:', project.objective);
                                            if (newGoal) store.updateCodingProject(project.id, { objective: newGoal });
                                        }}
                                        className="py-3.5 bg-white-smoke dark:bg-background-dark border border-border-light dark:border-border-dark rounded-2xl text-[9px] font-black uppercase tracking-widest hover:border-accent transition-all"
                                    >
                                        Edit Objective
                                    </button>
                                    <button
                                        onClick={() => {
                                            const status = prompt('Set Status (planning, in-progress, completed):', project.status);
                                            if (status) store.updateCodingProject(project.id, { status: status as 'planning' | 'in-progress' | 'completed' });
                                        }}
                                        className="py-3.5 bg-white-smoke dark:bg-background-dark border border-border-light dark:border-border-dark rounded-2xl text-[9px] font-black uppercase tracking-widest hover:border-accent transition-all"
                                    >
                                        Update Status
                                    </button>
                                </div>

                                <div className="pt-6 border-t border-border-light dark:border-border-dark">
                                    <div className="space-y-4">
                                        <div className="p-5 bg-white-smoke/50 dark:bg-background-dark/50 rounded-3xl border border-border-light dark:border-border-dark group-hover:border-accent/10 transition-all">
                                            <p className="text-[9px] font-black text-accent uppercase tracking-widest mb-2 flex items-center gap-2">
                                                <Sparkles className="w-4 h-4" /> Learned Essence
                                            </p>
                                            <p className="text-[11px] text-silver font-medium leading-relaxed italic">
                                                {project.notes?.learnings || 'Scanning for insights...'}
                                            </p>
                                        </div>
                                    </div>
                                    <button className="w-full mt-6 flex items-center justify-center gap-2 text-[10px] font-black text-silver uppercase tracking-widest hover:text-accent transition-all group-hover:translate-x-1 duration-500">
                                        Detailed Vessel Logs <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

// --- SECTION 5: KNOWLEDGE BASE ---
function KnowledgeBaseSection({ store, onAddConcept, onAddLog, onAddJournal }: { store: LifeTrackerStore; onAddConcept: () => void; onAddLog: () => void; onAddJournal: () => void }) {
    const state = store.getState();
    const [selectedType, setSelectedType] = useState<'Concept' | 'Debug' | 'Daily'>('Concept');

    const types: { id: 'Concept' | 'Debug' | 'Daily'; icon: LucideIcon; label: string; desc: string }[] = [
        { id: 'Concept', icon: Book, label: 'Vault', desc: 'Conceptual Core' },
        { id: 'Debug', icon: Bug, label: 'Logs', desc: 'Anomalies & Fixes' },
        { id: 'Daily', icon: Edit2, label: 'Journal', desc: 'Flow State Logs' }
    ];

    const logs = state.debugLogs;
    const notes = state.csNotes;

    return (
        <div className="space-y-8">
            {/* Minimal Search Bar */}
            <div className="relative group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-silver group-focus-within:text-accent transition-all duration-300" />
                <input
                    type="text"
                    placeholder="Search Knowledge Base / Logs / Daily..."
                    className="w-full pl-12 pr-6 py-4 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-2xl text-sm font-bold placeholder:text-silver/50 focus:outline-none focus:ring-2 focus:ring-accent/10 transition-all shadow-soft"
                />
            </div>

            {/* Sidebar-like Type Tabs */}
            <div className="flex gap-3">
                {types.map(t => (
                    <button
                        key={t.id}
                        onClick={() => setSelectedType(t.id)}
                        className={`flex-1 p-5 rounded-4xl border transition-all text-center flex flex-col items-center gap-3 ${selectedType === t.id
                            ? 'bg-surface-light dark:bg-surface-dark border-accent shadow-luxury ring-1 ring-accent/10'
                            : 'bg-surface-light dark:bg-surface-dark border-border-light dark:border-border-dark opacity-60'
                            }`}
                    >
                        <t.icon className={`w-6 h-6 ${selectedType === t.id ? 'text-accent' : 'text-silver'}`} />
                        <div>
                            <span className="text-[9px] font-black uppercase tracking-widest text-heading-light dark:text-text-dark leading-none">{t.label}</span>
                            <p className="text-[7px] text-silver font-bold uppercase mt-1 tracking-tighter line-clamp-1">{t.desc}</p>
                        </div>
                    </button>
                ))}
            </div>

            <div className="space-y-5">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-[#847777]/60">{selectedType} Stream</h3>
                    <button
                        onClick={() => {
                            if (selectedType === 'Debug') onAddLog();
                            else if (selectedType === 'Concept') onAddConcept();
                            else onAddJournal();
                        }}
                        className="p-2.5 bg-accent/10 text-accent rounded-2xl hover:bg-accent/20 transition-all border border-accent/10"
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                </div>

                <AnimatePresence mode="wait">
                    {selectedType === 'Debug' ? (
                        <motion.div
                            key="debug"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            className="space-y-4"
                        >
                            {logs.length === 0 ? (
                                <div className="p-16 text-center text-silver font-black text-[10px] uppercase tracking-widest italic opacity-40">System Stable.</div>
                            ) : (
                                logs.map((log: DebugLog) => (
                                    <div
                                        key={log.id}
                                        className="bg-background-dark p-6 rounded-4xl border border-white/5 shadow-luxury group"
                                    >
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.5)]" />
                                            <span className="text-[9px] font-black text-white/30 uppercase tracking-widest font-mono">{log.date}</span>
                                        </div>
                                        <h4 className="text-white font-black text-lg mb-4 tracking-tight leading-tight group-hover:text-accent transition-colors">{log.issue}</h4>
                                        <div className="bg-white/5 p-5 rounded-3xl border border-white/5 shadow-inner">
                                            <div className="flex items-center gap-2 mb-2.5">
                                                <span className="text-[9px] font-black text-accent uppercase tracking-widest">Protocol Solution</span>
                                            </div>
                                            <p className="text-[11px] text-gray-400 font-medium leading-relaxed font-mono">
                                                {log.solution}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="notes"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            className="space-y-5"
                        >
                            {notes.length === 0 ? (
                                <div className="p-20 text-center text-silver font-black text-[10px] uppercase tracking-widest italic opacity-40">Frequency Clear.</div>
                            ) : (
                                notes.map((note: CSNote) => (
                                    <div key={note.id} className="bg-surface-light dark:bg-surface-dark p-6 rounded-4xl border border-border-light dark:border-border-dark shadow-soft group hover:border-accent/40 transition-all">
                                        <h4 className="font-black text-xl text-heading-light dark:text-text-dark mb-3 tracking-tighter">{note.title}</h4>
                                        <p className="text-xs text-silver leading-loose font-medium line-clamp-4 italic mb-5">
                                            {note.content}
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {note.tags.map((tag: string) => (
                                                <span key={tag} className="px-3 py-1 bg-white-smoke dark:bg-background-dark border border-border-light dark:border-border-dark rounded-lg text-[9px] font-black text-accent uppercase tracking-widest">
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            )}

                            {/* Rich Text Editor Mockup */}
                            <div className="p-10 border-2 border-dashed border-border-light dark:border-border-dark rounded-4xl flex items-center justify-center group hover:border-accent transition-all cursor-pointer">
                                <div className="text-center group-hover:scale-105 transition-transform">
                                    <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center text-accent mx-auto mb-3">
                                        <Edit2 className="w-6 h-6" />
                                    </div>
                                    <p className="text-[10px] font-black text-silver uppercase tracking-widest">Open Knowledge Editor</p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

// --- SECTION 6: SKILL MASTERY & READINESS ---
function MasteryTrackingSection({ store, onAdd }: { store: LifeTrackerStore; onAdd: () => void }) {
    const state = store.getState();
    const skills = state.skillMastery;
    const [expandedSkillId, setExpandedSkillId] = useState<string | null>(null);

    const getDepthColor = (rating: number) => {
        if (rating <= 2) return 'text-rose-500';
        if (rating <= 4) return 'text-accent';
        return 'text-green-500';
    };

    const getReadinessLabel = (level: SkillMastery['readiness']) => {
        switch (level) {
            case 'not-ready': return { text: 'Not Ready', color: 'bg-silver/10 text-silver border-silver/20' };
            case 'can-explain': return { text: 'Can Explain', color: 'bg-accent/10 text-accent border-accent/20' };
            case 'can-defend': return { text: 'Can Defend', color: 'bg-green-100 text-green-600 border-green-200' };
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between px-2">
                <div>
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-[#847777]/60">Mastery Hub</h3>
                    <p className="text-[9px] text-silver font-bold uppercase tracking-widest mt-1">True Skill Depth</p>
                </div>
                <button
                    onClick={onAdd}
                    className="flex items-center gap-2.5 px-6 py-3 bg-accent text-white rounded-3xl text-[10px] font-black uppercase tracking-widest shadow-glow hover:scale-105 active:scale-95 transition-all"
                >
                    <Plus className="w-4 h-4" /> Add Skill
                </button>
            </div>

            <div className="space-y-4">
                {skills.length === 0 ? (
                    <div className="p-16 text-center bg-surface-light dark:bg-surface-dark rounded-4xl border border-dashed border-border-light dark:border-border-dark">
                        <Award className="w-12 h-12 text-silver mx-auto mb-4 opacity-20" />
                        <p className="text-[10px] font-black text-silver uppercase tracking-widest">No skills tracked yet.</p>
                    </div>
                ) : (
                    skills.map((skill) => {
                        const isExpanded = expandedSkillId === skill.id;
                        const readiness = getReadinessLabel(skill.readiness);

                        return (
                            <motion.div
                                key={skill.id}
                                layout
                                className={`bg-surface-light dark:bg-surface-dark rounded-4xl border transition-all overflow-hidden ${isExpanded ? 'border-accent shadow-luxury ring-1 ring-accent/10' : 'border-border-light dark:border-border-dark'}`}
                            >
                                <div className="p-6 cursor-pointer" onClick={() => setExpandedSkillId(isExpanded ? null : skill.id)}>
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-accent/5 rounded-2xl">
                                                <Target className="w-6 h-6 text-accent" />
                                            </div>
                                            <div>
                                                <h4 className={`font-black text-lg tracking-tight leading-none mb-1.5 ${getDepthColor(skill.depthRating)}`}>
                                                    {skill.name}
                                                </h4>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[9px] font-bold text-silver uppercase tracking-widest">{skill.category}</span>
                                                    <div className="flex items-center gap-0.5">
                                                        {[1, 2, 3, 4, 5].map((s) => (
                                                            <div key={s} className={`w-1.5 h-1.5 rounded-full ${s <= skill.depthRating ? 'bg-accent shadow-glow' : 'bg-silver/20'}`} />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className={`px-3 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest border ${readiness.color}`}>
                                            {readiness.text}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between mt-6">
                                        <div className="flex items-center gap-6">
                                            <div className="flex flex-col">
                                                <span className="text-[8px] font-bold text-silver uppercase tracking-widest leading-none mb-1">Projects</span>
                                                <span className="text-xs font-black text-heading-light dark:text-text-dark">{skill.linkedProjects.length}</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[8px] font-bold text-silver uppercase tracking-widest leading-none mb-1">Errors</span>
                                                <span className="text-xs font-black text-rose-500">{skill.errorPatterns.length}</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[8px] font-bold text-silver uppercase tracking-widest leading-none mb-1">Next Revision</span>
                                                <span className="text-xs font-black text-accent">{new Date(skill.nextRevision).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        <ChevronRight className={`w-4 h-4 text-silver transition-transform duration-300 ${isExpanded ? 'rotate-90 text-accent' : ''}`} />
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="border-t border-border-light dark:border-border-dark bg-white-smoke/20 dark:bg-background-dark/20 p-7 space-y-8"
                                        >
                                            {/* Depth & Readiness Controls */}
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="p-4 bg-surface-light dark:bg-surface-dark rounded-3xl border border-border-light dark:border-border-dark">
                                                    <p className="text-[9px] font-black text-accent uppercase tracking-widest mb-3 flex items-center gap-2">
                                                        <TrendingUp className="w-3 h-3" /> Skill Depth (1-5)
                                                    </p>
                                                    <div className="flex items-center justify-between">
                                                        {[1, 2, 3, 4, 5].map((val) => (
                                                            <button
                                                                key={val}
                                                                onClick={() => store.updateSkillMastery(skill.id, { depthRating: val })}
                                                                className={`w-8 h-8 rounded-full text-[10px] font-black transition-all ${skill.depthRating === val
                                                                    ? 'bg-accent text-white shadow-glow'
                                                                    : 'bg-white-smoke dark:bg-background-dark text-silver hover:text-accent'
                                                                    }`}
                                                            >
                                                                {val}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="p-4 bg-surface-light dark:bg-surface-dark rounded-3xl border border-border-light dark:border-border-dark">
                                                    <p className="text-[9px] font-black text-accent uppercase tracking-widest mb-3 flex items-center gap-2">
                                                        <ListChecks className="w-3 h-3" /> Readiness
                                                    </p>
                                                    <select
                                                        value={skill.readiness}
                                                        onChange={(e) => store.updateSkillMastery(skill.id, { readiness: e.target.value as any })}
                                                        className="w-full bg-white-smoke dark:bg-background-dark text-[10px] font-bold py-2 px-3 rounded-xl border-none focus:ring-1 focus:ring-accent"
                                                    >
                                                        <option value="not-ready">Not Ready</option>
                                                        <option value="can-explain">Can Explain</option>
                                                        <option value="can-defend">Can Defend</option>
                                                    </select>
                                                </div>
                                            </div>

                                            {/* Mini-Project Mapping */}
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-[9px] font-black text-accent uppercase tracking-widest flex items-center gap-2">
                                                        <Layout className="w-3 h-3" /> Application Projects
                                                    </p>
                                                    <button
                                                        onClick={() => {
                                                            const pTitle = prompt('Project Title:');
                                                            if (pTitle) {
                                                                store.updateSkillMastery(skill.id, {
                                                                    linkedProjects: [...skill.linkedProjects, { projectId: generateId(), projectTitle: pTitle, depth: 'toy' }]
                                                                });
                                                            }
                                                        }}
                                                        className="text-[8px] font-black text-accent uppercase tracking-tight"
                                                    >
                                                        + Map Project
                                                    </button>
                                                </div>
                                                <div className="space-y-2">
                                                    {skill.linkedProjects.map((proj, idx) => (
                                                        <div key={idx} className="flex items-center justify-between bg-white-smoke font-mono dark:bg-background-dark/50 p-3 rounded-2xl border border-border-light dark:border-border-dark">
                                                            <span className="text-[10px] font-bold text-heading-light dark:text-text-dark">{proj.projectTitle}</span>
                                                            <div className="flex gap-2">
                                                                {['toy', 'partial', 'production'].map((d) => (
                                                                    <button
                                                                        key={d}
                                                                        onClick={() => {
                                                                            const updated = [...skill.linkedProjects];
                                                                            updated[idx].depth = d as any;
                                                                            store.updateSkillMastery(skill.id, { linkedProjects: updated });
                                                                        }}
                                                                        className={`px-2 py-1 rounded-lg text-[7px] font-black uppercase tracking-tighter border transition-all ${proj.depth === d
                                                                            ? 'bg-accent/10 border-accent text-accent'
                                                                            : 'border-border-light dark:border-border-dark text-silver opacity-40'}`}
                                                                    >
                                                                        {d}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Error Pattern Tracker */}
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-[9px] font-black text-rose-500/60 uppercase tracking-widest flex items-center gap-2">
                                                        <Bug className="w-3 h-3" /> Repeated Error Patterns
                                                    </p>
                                                    <button
                                                        onClick={() => {
                                                            const desc = prompt('Error Description:');
                                                            if (desc) store.addErrorPatternToSkill(skill.id, { description: desc });
                                                        }}
                                                        className="text-[8px] font-black text-rose-500 uppercase tracking-tight"
                                                    >
                                                        + Log Pattern
                                                    </button>
                                                </div>
                                                <div className="space-y-2">
                                                    {skill.errorPatterns.map((err) => (
                                                        <div key={err.id} className="p-4 bg-rose-50 dark:bg-rose-900/10 rounded-2xl border border-rose-100 dark:border-rose-900/20">
                                                            <div className="flex justify-between items-start mb-2">
                                                                <p className="text-[10px] font-bold text-rose-700 dark:text-rose-400 leading-relaxed">{err.description}</p>
                                                                <span className="px-2 py-0.5 bg-rose-200 text-rose-800 rounded-md text-[8px] font-black">x{err.frequency}</span>
                                                            </div>
                                                            <p className="text-[8px] text-rose-600/60 font-medium">Last seen: {new Date(err.lastOccurred).toLocaleDateString()}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Revision Controls */}
                                            <div className="pt-4 border-t border-border-light dark:border-border-dark flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <RefreshCw className="w-3.5 h-3.5 text-accent animate-spin-slow" />
                                                    <span className="text-[9px] font-black text-silver uppercase tracking-widest">Spaced Revision</span>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => {
                                                            const next = new Date();
                                                            next.setDate(next.getDate() + 7);
                                                            store.updateSkillMastery(skill.id, {
                                                                lastRevised: new Date().toISOString(),
                                                                nextRevision: next.toISOString(),
                                                                revisionHistory: [...skill.revisionHistory, new Date().toISOString()]
                                                            });
                                                        }}
                                                        className="px-4 py-2 bg-accent text-white rounded-xl text-[8px] font-black uppercase tracking-widest shadow-glow"
                                                    >
                                                        Mark Revised
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })
                )}
            </div>
        </div>
    );
}

// --- ADD CONTENT OVERLAY ---
function AddContentOverlay({
    type,
    onClose,
    store,
    activePathId
}: {
    type: SectionId | 'log' | 'concept' | 'journal' | 'mastery';
    onClose: () => void;
    store: LifeTrackerStore;
    activePathId?: string;
}) {
    const [formData, setFormData] = useState<ContentFormData>({
        title: '',
        content: '',
        url: '',
        domain: 'Full Stack',
        difficulty: 'medium',
        category: 'DSA',
        status: 'pending',
        techStack: []
    });

    const handleSubmit = () => {
        if (!formData.title && type !== 'paths') {
            alert('Title is required');
            return;
        }

        switch (type) {
            case 'paths': {
                if (!activePathId) return;
                const path = store.getState().codingLearningPaths.find((p: CodingLearningPath) => p.id === activePathId);
                store.addCodingLearningWeek(activePathId, {
                    weekNumber: (path?.weeks.length || 0) + 1,
                    weekRange: formData.title || `Week ${(path?.weeks.length || 0) + 1}`,
                    topics: formData.techStack,
                    resources: [],
                    status: 'pending'
                });
                break;
            }
            case 'dsa':
                store.addDSAProblem({
                    title: formData.title,
                    difficulty: formData.difficulty,
                    category: formData.category,
                    status: 'review',
                    notes: formData.content
                });
                break;
            case 'videos':
                store.addVideoResource({
                    title: formData.title,
                    description: formData.content,
                    url: formData.url,
                    domain: formData.domain,
                    tags: formData.techStack
                });
                break;
            case 'projects':
                store.addCodingProject({
                    title: formData.title,
                    objective: formData.content,
                    techStack: formData.techStack,
                    description: '',
                    outcomes: [],
                    links: [],
                    status: 'planning'
                });
                break;
            case 'concept':
                store.addCSNote({
                    title: formData.title,
                    content: formData.content,
                    category: 'CS Core',
                    tags: ['concept', ...formData.techStack]
                });
                break;
            case 'log':
                store.addDebugLog({
                    issue: formData.title,
                    solution: formData.content,
                    tags: ['bug', ...formData.techStack]
                });
                break;
            case 'journal':
                store.addCSNote({
                    title: formData.title,
                    content: formData.content,
                    category: 'System Design',
                    tags: ['journal', ...formData.techStack]
                });
                break;
            case 'mastery': {
                const next = new Date();
                next.setDate(next.getDate() + 7); // Default to 1 week revision
                store.addSkillMastery({
                    name: formData.title,
                    category: formData.category,
                    depthRating: 1,
                    linkedProjects: [],
                    readiness: 'not-ready',
                    lastRevised: new Date().toISOString(),
                    nextRevision: next.toISOString(),
                    revisionHistory: [],
                    errorPatterns: []
                });
                break;
            }
        }
        onClose();
    };

    const getTitle = () => {
        switch (type) {
            case 'paths': return 'New Sprint';
            case 'dsa': return 'New Logic Challenge';
            case 'videos': return 'Library Intel';
            case 'projects': return 'New Build Vessel';
            case 'concept': return 'Core Concept';
            case 'log': return 'Anomaly Fix';
            case 'journal': return 'Flow Insight';
            case 'mastery': return 'New Skill Mastery';
            default: return 'Add Content';
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-5">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/60 backdrop-blur-xl"
            />
            <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                className="bg-surface-light dark:bg-surface-dark w-full max-w-lg h-[90vh] sm:h-auto sm:max-h-[85vh] rounded-t-[40px] sm:rounded-4xl overflow-hidden shadow-luxury relative z-10 flex flex-col"
            >
                {/* Modal Header */}
                <div className="px-8 pt-8 pb-4 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-black tracking-tight text-heading-light dark:text-text-dark">{getTitle()}</h2>
                        <p className="text-[10px] font-bold text-accent uppercase tracking-widest mt-1">Materialize your progress</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Form Content */}
                <div className="flex-1 overflow-y-auto px-8 py-6 space-y-8 no-scrollbar">
                    {/* Primary Input */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-silver uppercase tracking-widest ml-1">
                            {type === 'paths' ? 'Week Reference / Title' : 'Identity / Title'}
                        </label>
                        <input
                            autoFocus
                            type="text"
                            placeholder={type === 'paths' ? "e.g. Frontend Mastery" : "Universal handle..."}
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full bg-white-smoke dark:bg-background-dark border border-border-light dark:border-border-dark rounded-3xl px-6 py-4.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all"
                        />
                    </div>

                    {/* YouTube URL for Videos */}
                    {type === 'videos' && (
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-rose-500 uppercase tracking-widest ml-1">Video Stream URL (YouTube)</label>
                            <div className="relative group/input">
                                <Youtube className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-silver group-focus-within/input:text-rose-500 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="https://youtube.com/watch?v=..."
                                    value={formData.url}
                                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                                    className="w-full pl-12 pr-6 py-4 bg-white-smoke dark:bg-background-dark border border-border-light dark:border-border-dark rounded-3xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                                />
                            </div>
                        </div>
                    )}

                    {/* Content / Objective */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-silver uppercase tracking-widest ml-1">Essence / Description</label>
                        <textarea
                            placeholder="Architectural details, goals, or core logic..."
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            className="w-full bg-white-smoke dark:bg-background-dark border border-border-light dark:border-border-dark rounded-3xl px-6 py-4.5 text-sm font-medium min-h-[140px] focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all resize-none"
                        />
                    </div>

                    {/* Selectors based on Type */}
                    <div className="grid grid-cols-2 gap-4">
                        {type === 'dsa' && (
                            <>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-silver uppercase tracking-widest ml-1">Difficulty</label>
                                    <select
                                        value={formData.difficulty}
                                        onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as 'easy' | 'medium' | 'hard' })}
                                        className="w-full bg-white-smoke dark:bg-background-dark border border-border-light dark:border-border-dark rounded-2xl px-4 py-3 text-[10px] font-bold uppercase tracking-widest focus:outline-none appearance-none cursor-pointer"
                                    >
                                        <option value="easy">Easy</option>
                                        <option value="medium">Medium</option>
                                        <option value="hard">Hard</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-silver uppercase tracking-widest ml-1">Focus</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value as 'DSA' | 'CS Core' | 'System Design' })}
                                        className="w-full bg-white-smoke dark:bg-background-dark border border-border-light dark:border-border-dark rounded-2xl px-4 py-3 text-[10px] font-bold uppercase tracking-widest focus:outline-none appearance-none cursor-pointer"
                                    >
                                        <option value="DSA">DSA</option>
                                        <option value="CS Core">CS Core</option>
                                        <option value="System Design">Architecture</option>
                                    </select>
                                </div>
                            </>
                        )}

                        {type === 'videos' && (
                            <div className="col-span-2 space-y-2">
                                <label className="text-[10px] font-black text-silver uppercase tracking-widest ml-1">Domain</label>
                                <div className="flex gap-2 flex-wrap">
                                    {['Full Stack', 'Data Science', 'DevOps', 'DSA', 'Core CS', 'ML', 'AI', 'Agents', 'Neural Networks'].map(d => (
                                        <button
                                            key={d}
                                            onClick={() => setFormData({ ...formData, domain: d })}
                                            className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${formData.domain === d ? 'bg-accent text-white border-accent shadow-glow' : 'bg-background-dark text-silver border-border-light dark:border-border-dark'}`}
                                        >
                                            {d}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Tech Stack / Topics Tag System */}
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-silver uppercase tracking-widest ml-1">Stacks & Tags</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                placeholder="Add Tag..."
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        const val = (e.target as HTMLInputElement).value;
                                        if (val) {
                                            setFormData({ ...formData, techStack: [...formData.techStack, val] });
                                            (e.target as HTMLInputElement).value = '';
                                        }
                                    }
                                }}
                                className="flex-1 bg-white-smoke dark:bg-background-dark border border-border-light dark:border-border-dark rounded-2xl px-5 py-3 text-[10px] font-bold focus:outline-none"
                            />
                            <button className="p-3 bg-accent text-white rounded-2xl"><Plus className="w-4 h-4" /></button>
                        </div>
                        <div className="flex flex-wrap gap-2 min-h-[40px]">
                            {formData.techStack.map((tag: string, i: number) => (
                                <span key={i} className="px-3 py-1.5 bg-accent/10 border border-accent/20 text-accent rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                                    {tag}
                                    <X className="w-3 h-3 cursor-pointer" onClick={() => setFormData({ ...formData, techStack: formData.techStack.filter((_: string, idx: number) => idx !== i) })} />
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-8 pt-4 border-t border-border-light dark:border-border-dark flex gap-4">
                    <button
                        onClick={onClose}
                        className="flex-1 py-5 bg-white-smoke dark:bg-background-dark text-silver rounded-2xl text-[10px] font-black uppercase tracking-widest hover:text-heading-light transition-all"
                    >
                        Abort
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="flex-[2] py-5 bg-accent text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-elegant hover:shadow-glow transition-all active:scale-[0.98]"
                    >
                        Initialize Entry
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

export default CodingSection;
