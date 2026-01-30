import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    ChevronLeft, Plus, Check, Trash2, XCircle,
    Calendar, Target, StickyNote, AlertCircle,
    Save, MoreHorizontal, Home
} from 'lucide-react';

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

interface WeeklyGoal {
    id: string;
    text: string;
    progress: number;
    total: number;
    schedule: string;
}

// -- Helper Components --
const PlannerCard: React.FC<{ title: string; subtitle?: string; icon: React.ElementType; children: React.ReactNode; colorClass: string }> = ({ title, subtitle, icon: Icon, children, colorClass }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col"
    >
        <div className={`px-6 py-5 border-b border-slate-100 flex justify-between items-center ${colorClass}`}>
            <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-xl shadow-sm">
                    <Icon className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="font-bold text-slate-800">{title}</h3>
                    {subtitle && <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">{subtitle}</p>}
                </div>
            </div>
            <button className="p-2 hover:bg-white/50 rounded-lg transition-colors">
                <MoreHorizontal className="w-5 h-5 text-slate-400" />
            </button>
        </div>
        <div className="p-6 flex-1">
            {children}
        </div>
    </motion.div>
);

const PlannerPage: React.FC = () => {
    const navigate = useNavigate();

    // -- State Management --
    const [priorities, setPriorities] = useState<Priority[]>(() => {
        const saved = localStorage.getItem('planner_priorities');
        return saved ? JSON.parse(saved) : [
            { id: '1', text: 'Morning Reflection', tag: 'Personal', color: 'bg-orange-100 text-orange-600', done: true },
            { id: '2', text: 'Finish UI Design', tag: 'Work', color: 'bg-blue-100 text-blue-600', done: false },
            { id: '3', text: 'Deep Work: Coding (2h)', tag: 'Dev', color: 'bg-purple-100 text-purple-600', done: false }
        ];
    });

    const [antiGoals, setAntiGoals] = useState<AntiGoal[]>(() => {
        const saved = localStorage.getItem('planner_anti_goals');
        return saved ? JSON.parse(saved) : [
            { id: '1', text: 'No social media before 12PM' },
            { id: '2', text: "Don't skip stretching" }
        ];
    });

    const [notes, setNotes] = useState<DailyNote[]>(() => {
        const saved = localStorage.getItem('planner_notes');
        return saved ? JSON.parse(saved) : [
            { id: '1', text: 'Review quarterly goals', completed: false, type: 'general' },
            { id: '2', text: 'Prepare for meeting', completed: true, type: 'meeting' },
        ];
    });

    const [weeklyGoals, setWeeklyGoals] = useState<WeeklyGoal[]>(() => {
        const saved = localStorage.getItem('planner_weekly_goals');
        return saved ? JSON.parse(saved) : [
            { id: '1', text: 'Record Podcast Episode', progress: 0, total: 1, schedule: 'Once weekly' },
            { id: '2', text: 'Weekend Outing', progress: 0, total: 1, schedule: 'Once weekly' },
            { id: '3', text: 'Daily Workout', progress: 3, total: 5, schedule: '5x weekly' }
        ];
    });

    const [autosaving, setAutosaving] = useState(false);

    // -- Persistence --
    useEffect(() => {
        localStorage.setItem('planner_priorities', JSON.stringify(priorities));
        localStorage.setItem('planner_anti_goals', JSON.stringify(antiGoals));
        localStorage.setItem('planner_notes', JSON.stringify(notes));
        localStorage.setItem('planner_weekly_goals', JSON.stringify(weeklyGoals));

        // Show autosave indicator asynchronously to avoid set-state-in-effect warning
        const showTimeout = setTimeout(() => setAutosaving(true), 0);
        const hideTimeout = setTimeout(() => setAutosaving(false), 800);
        return () => {
            clearTimeout(showTimeout);
            clearTimeout(hideTimeout);
        };
    }, [priorities, antiGoals, notes, weeklyGoals]);

    return (
        <div className="min-h-screen bg-slate-50 pb-32">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4">
                <div className="max-w-4xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors"
                        >
                            <ChevronLeft className="w-6 h-6 text-slate-600" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-black text-slate-900">Planner</h1>
                            <p className="text-sm text-slate-500 font-medium tracking-tight">Organize your day: do less, do better.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <AnimatePresence>
                            {autosaving && (
                                <motion.div
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1.5 rounded-full"
                                >
                                    <Save className="w-3 h-3" />
                                    Saving...
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-8">
                <div className="space-y-6">

                    {/* 1. Priorities */}
                    <PlannerCard
                        title="Priorities"
                        subtitle="Daily Must-Do"
                        icon={Target}
                        colorClass="bg-orange-50/50"
                    >
                        <div className="space-y-4">
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Plus className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        id="priority-input"
                                        type="text"
                                        placeholder="Add a priority..."
                                        className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                const val = (e.target as HTMLInputElement).value;
                                                if (val.trim()) {
                                                    setPriorities([...priorities, {
                                                        id: Date.now().toString(),
                                                        text: val,
                                                        tag: 'General',
                                                        color: 'bg-slate-100 text-slate-600',
                                                        done: false
                                                    }]);
                                                    (e.target as HTMLInputElement).value = '';
                                                }
                                            }
                                        }}
                                    />
                                </div>
                                <button
                                    onClick={() => {
                                        const input = document.getElementById('priority-input') as HTMLInputElement;
                                        if (input.value.trim()) {
                                            setPriorities([...priorities, {
                                                id: Date.now().toString(),
                                                text: input.value,
                                                tag: 'General',
                                                color: 'bg-slate-100 text-slate-600',
                                                done: false
                                            }]);
                                            input.value = '';
                                        }
                                    }}
                                    className="px-4 bg-orange-500 text-white rounded-xl font-bold text-sm hover:bg-orange-600 transition-colors"
                                >
                                    Add
                                </button>
                            </div>

                            <div className="space-y-2">
                                <AnimatePresence mode="popLayout">
                                    {priorities.map((task) => (
                                        <motion.div
                                            key={task.id}
                                            layout
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl group"
                                        >
                                            <button
                                                onClick={() => setPriorities(priorities.map(p => p.id === task.id ? { ...p, done: !p.done } : p))}
                                                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${task.done ? 'bg-orange-500 border-orange-500' : 'border-slate-200'}`}
                                            >
                                                {task.done && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                                            </button>
                                            <div className="flex-1">
                                                <input
                                                    type="text"
                                                    value={task.text}
                                                    onChange={(e) => setPriorities(priorities.map(p => p.id === task.id ? { ...p, text: e.target.value } : p))}
                                                    className={`w-full bg-transparent border-none focus:ring-0 p-0 text-sm font-bold ${task.done ? 'text-slate-400 line-through' : 'text-slate-700'}`}
                                                />
                                                <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${task.color} mt-1 inline-block`}>
                                                    {task.tag}
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => setPriorities(priorities.filter(p => p.id !== task.id))}
                                                className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-red-500 transition-all"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                            <div className="pt-2 border-t border-slate-50 flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <span>Focus Count: {priorities.length}</span>
                                <span>{priorities.filter(p => p.done).length} Complete</span>
                            </div>
                        </div>
                    </PlannerCard>

                    {/* 2. Anti-Goals */}
                    <PlannerCard
                        title="Anti-Goals"
                        subtitle="Avoid Today"
                        icon={XCircle}
                        colorClass="bg-red-50/50"
                    >
                        <div className="space-y-4">
                            <button
                                onClick={() => setAntiGoals([...antiGoals, { id: Date.now().toString(), text: '' }])}
                                className="w-full py-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-bold flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
                            >
                                <Plus className="w-4 h-4" /> Add Anti-Goal
                            </button>

                            <div className="space-y-3">
                                <AnimatePresence mode="popLayout">
                                    {antiGoals.map((goal) => (
                                        <motion.div
                                            key={goal.id}
                                            layout
                                            initial={{ opacity: 0, x: 10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            className="p-4 bg-white border border-red-50 rounded-xl group shadow-sm shadow-red-500/5"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center shrink-0">
                                                    <AlertCircle className="w-4 h-4 text-red-600" />
                                                </div>
                                                <input
                                                    autoFocus={goal.text === ''}
                                                    type="text"
                                                    value={goal.text}
                                                    placeholder="What to avoid?"
                                                    onChange={(e) => setAntiGoals(antiGoals.map(a => a.id === goal.id ? { ...a, text: e.target.value } : a))}
                                                    className="flex-1 bg-transparent border-none focus:ring-0 p-0 text-sm font-bold text-red-900 placeholder:text-red-200"
                                                />
                                                <button
                                                    onClick={() => setAntiGoals(antiGoals.filter(a => a.id !== goal.id))}
                                                    className="opacity-0 group-hover:opacity-100 p-2 text-red-200 hover:text-red-500 transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <div className="mt-3 pl-11">
                                                <textarea
                                                    placeholder="Why avoid this today? (The cost of distraction...)"
                                                    value={goal.why || ''}
                                                    onChange={(e) => setAntiGoals(antiGoals.map(a => a.id === goal.id ? { ...a, why: e.target.value } : a))}
                                                    className="w-full bg-slate-50 border-none focus:ring-0 rounded-lg p-2 text-xs text-red-800/60 placeholder:text-red-200/50 resize-none h-16 transition-all"
                                                />
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                            <p className="text-[10px] font-bold text-slate-400 text-center uppercase tracking-widest mt-4">“Avoiding is productivity.”</p>
                        </div>
                    </PlannerCard>

                    {/* 3. Daily Notes */}
                    <PlannerCard
                        title="Daily Notes"
                        subtitle="Quick Reflections"
                        icon={StickyNote}
                        colorClass="bg-yellow-50/50"
                    >
                        <div className="space-y-4">
                            <div className="flex gap-2">
                                {(['general', 'meeting', 'reminder', 'reflection'] as const).map(type => (
                                    <button
                                        key={type}
                                        onClick={() => setNotes([...notes, { id: Date.now().toString(), text: '', completed: false, type }])}
                                        className="flex-1 py-1.5 rounded-lg border border-slate-200 text-[9px] font-black uppercase tracking-wider text-slate-500 hover:bg-slate-50 transition-all bg-white"
                                    >
                                        + {type}
                                    </button>
                                ))}
                            </div>

                            <div className="space-y-3">
                                <AnimatePresence mode="popLayout">
                                    {notes.map((note) => (
                                        <motion.div
                                            key={note.id}
                                            layout
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            className="p-4 bg-white border border-yellow-100/50 rounded-xl group relative shadow-sm"
                                        >
                                            <div className="flex items-start gap-4">
                                                <div
                                                    onClick={() => setNotes(notes.map(n => n.id === note.id ? { ...n, completed: !n.completed } : n))}
                                                    className={`mt-1 w-5 h-5 rounded-md border-2 shrink-0 transition-colors shadow-sm flex items-center justify-center cursor-pointer ${note.completed ? 'bg-yellow-400 border-yellow-400' : 'border-slate-200 bg-white'}`}
                                                >
                                                    {note.completed && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                                                </div>
                                                <div className="flex-1">
                                                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-yellow-600 mb-1 block">
                                                        {note.type}
                                                    </span>
                                                    <textarea
                                                        autoFocus={note.text === ''}
                                                        value={note.text}
                                                        onChange={(e) => setNotes(notes.map(n => n.id === note.id ? { ...n, text: e.target.value } : n))}
                                                        placeholder="Write something..."
                                                        className={`w-full bg-transparent border-none focus:ring-0 p-0 text-sm leading-relaxed text-slate-700 placeholder:text-slate-300 resize-none h-auto min-h-[40px] focus:min-h-[80px] transition-all ${note.completed ? 'opacity-40 line-through' : ''}`}
                                                        style={{ height: 'auto' }}
                                                    />
                                                </div>
                                                <button
                                                    onClick={() => setNotes(notes.filter(n => n.id !== note.id))}
                                                    className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-300 hover:text-red-500 transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </div>
                    </PlannerCard>

                    {/* 4. Weekly Goals */}
                    <PlannerCard
                        title="Weekly Goals"
                        subtitle="Habits & Milestones"
                        icon={Calendar}
                        colorClass="bg-emerald-50/50"
                    >
                        <div className="space-y-4">
                            <button
                                onClick={() => setWeeklyGoals([...weeklyGoals, { id: Date.now().toString(), text: '', progress: 0, total: 1, schedule: 'Once weekly' }])}
                                className="w-full py-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-600 text-sm font-bold flex items-center justify-center gap-2 hover:bg-emerald-100 transition-colors"
                            >
                                <Plus className="w-4 h-4" /> Add Goal
                            </button>

                            <div className="space-y-3">
                                <AnimatePresence mode="popLayout">
                                    {weeklyGoals.map((goal) => (
                                        <motion.div
                                            key={goal.id}
                                            layout
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.8 }}
                                            className="p-4 bg-white border border-emerald-50 rounded-2xl group shadow-sm overflow-hidden relative"
                                        >
                                            {/* Progress Bar Background */}
                                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-50">
                                                <motion.div
                                                    className="h-full bg-emerald-500"
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${(goal.progress / goal.total) * 100}%` }}
                                                />
                                            </div>

                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex-1">
                                                    <input
                                                        autoFocus={goal.text === ''}
                                                        type="text"
                                                        value={goal.text}
                                                        placeholder="Goal description..."
                                                        onChange={(e) => setWeeklyGoals(weeklyGoals.map(g => g.id === goal.id ? { ...g, text: e.target.value } : g))}
                                                        className="w-full bg-transparent border-none focus:ring-0 p-0 text-sm font-bold text-slate-800 placeholder:text-slate-300"
                                                    />
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <input
                                                            type="text"
                                                            value={goal.schedule}
                                                            onChange={(e) => setWeeklyGoals(weeklyGoals.map(g => g.id === goal.id ? { ...g, schedule: e.target.value } : g))}
                                                            className="text-[9px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded focus:outline-none"
                                                        />
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => setWeeklyGoals(weeklyGoals.filter(g => g.id !== goal.id))}
                                                    className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-300 hover:text-red-500 transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Progress</h4>
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        onClick={() => setWeeklyGoals(weeklyGoals.map(g => g.id === goal.id ? { ...g, progress: Math.max(0, g.progress - 1) } : g))}
                                                        className="w-6 h-6 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all"
                                                    >
                                                        -
                                                    </button>
                                                    <span className="text-xs font-black text-slate-900 w-8 text-center">{goal.progress} / {goal.total}</span>
                                                    <button
                                                        onClick={() => setWeeklyGoals(weeklyGoals.map(g => g.id === goal.id ? { ...g, progress: Math.min(g.total, g.progress + 1) } : g))}
                                                        className="w-6 h-6 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 hover:bg-emerald-100 transition-all"
                                                    >
                                                        +
                                                    </button>
                                                    <input
                                                        type="number"
                                                        value={goal.total}
                                                        onChange={(e) => setWeeklyGoals(weeklyGoals.map(g => g.id === goal.id ? { ...g, total: parseInt(e.target.value) || 1 } : g))}
                                                        className="w-10 text-center text-xs font-bold text-slate-400 bg-transparent border-b border-slate-100 focus:outline-none focus:border-emerald-500"
                                                    />
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </div>
                    </PlannerCard>

                </div>
            </main>

            {/* Bottom Floating Nav Shortcut */}
            <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="bg-black text-white px-8 py-4 rounded-full shadow-2xl flex items-center gap-3 hover:scale-105 active:scale-95 transition-all group"
                >
                    <Home className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                    <span className="font-black text-sm uppercase tracking-widest">Back to Dashboard</span>
                </button>
            </div>
        </div>
    );
};

export default PlannerPage;
