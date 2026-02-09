/**
 * GoalAssistant Component
 * 
 * An AI-powered personal goal & reminder assistant with a friendly,
 * supportive buddy-like interface. Features goal tracking, gentle reminders,
 * and encouraging messages.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Target, Plus, X, Check, Clock, Sparkles,
    MessageSquare, Flame, Bell,
    BookOpen, Dumbbell, Brain, Heart, Music,
    Pencil, Trash2, TrendingUp, Award
} from 'lucide-react';
import { useGoalAssistant, type PersonalGoal, type GoalCategory, type GoalFrequency } from '../hooks/useGoalAssistant';

interface GoalAssistantProps {
    isOpen: boolean;
    onClose: () => void;
}

const CATEGORY_CONFIG: Record<GoalCategory, { icon: React.ElementType; color: string; bg: string }> = {
    health: { icon: Heart, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-900/20' },
    productivity: { icon: Target, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    learning: { icon: BookOpen, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    mindfulness: { icon: Brain, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
    fitness: { icon: Dumbbell, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
    creative: { icon: Music, color: 'text-pink-500', bg: 'bg-pink-50 dark:bg-pink-900/20' },
    social: { icon: MessageSquare, color: 'text-teal-500', bg: 'bg-teal-50 dark:bg-teal-900/20' },
    custom: { icon: Sparkles, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/20' }
};

const FREQUENCY_LABELS: Record<GoalFrequency, string> = {
    daily: 'Every Day',
    weekly: 'Once a Week',
    custom: 'Custom Days'
};

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const GoalAssistant: React.FC<GoalAssistantProps> = ({ isOpen, onClose }) => {
    const {
        activeGoals,
        todaysGoals,
        pendingGoals,
        messages,
        unreadMessages,
        stats,
        addGoal,
        deleteGoal,
        completeGoal,
        isGoalCompletedToday,
        getStreak,
        getCompletionRate,
        markAllMessagesAsRead,
        generateTestMessages
    } = useGoalAssistant();

    const [activeTab, setActiveTab] = useState<'today' | 'goals' | 'messages'>('today');
    const [showAddGoal, setShowAddGoal] = useState(false);
    const [_editingGoal, setEditingGoal] = useState<PersonalGoal | null>(null);
    const [selectedGoalForComplete, setSelectedGoalForComplete] = useState<string | null>(null);
    const [completionNote, setCompletionNote] = useState('');
    const [completionMood, setCompletionMood] = useState<'great' | 'good' | 'okay' | 'tough'>('good');

    // New goal form state
    const [newGoal, setNewGoal] = useState({
        title: '',
        description: '',
        category: 'productivity' as GoalCategory,
        frequency: 'daily' as GoalFrequency,
        customDays: [] as number[],
        scheduledTime: '09:00',
        reminderEnabled: true,
        reminderMinutesBefore: 15,
        isReflective: false,
        isActive: true
    });

    // Mark messages as read when viewing messages tab
    useEffect(() => {
        if (activeTab === 'messages' && unreadMessages.length > 0) {
            markAllMessagesAsRead();
        }
    }, [activeTab, unreadMessages.length, markAllMessagesAsRead]);

    const handleAddGoal = () => {
        if (!newGoal.title.trim()) return;

        addGoal({
            ...newGoal,
            customDays: newGoal.frequency === 'custom' ? newGoal.customDays : undefined
        });

        // Reset form
        setNewGoal({
            title: '',
            description: '',
            category: 'productivity',
            frequency: 'daily',
            customDays: [],
            scheduledTime: '09:00',
            reminderEnabled: true,
            reminderMinutesBefore: 15,
            isReflective: false,
            isActive: true
        });
        setShowAddGoal(false);
    };

    const handleCompleteGoal = (goalId: string) => {
        completeGoal(goalId, completionNote || undefined, completionMood);
        setSelectedGoalForComplete(null);
        setCompletionNote('');
        setCompletionMood('good');
    };

    const toggleCustomDay = (day: number) => {
        setNewGoal(prev => ({
            ...prev,
            customDays: prev.customDays.includes(day)
                ? prev.customDays.filter(d => d !== day)
                : [...prev.customDays, day]
        }));
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning! ☀️';
        if (hour < 17) return 'Good afternoon! 🌤️';
        return 'Good evening! 🌙';
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full max-w-md bg-white dark:bg-[#1A1A1A] rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl max-h-[85vh] overflow-hidden flex flex-col"
                >
                    {/* Header */}
                    <div className="relative p-6 pb-4 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                        >
                            <X className="w-5 h-5 text-white" />
                        </button>

                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                <span className="text-3xl">🎯</span>
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-white">Goal Buddy</h2>
                                <p className="text-white/80 text-sm">{getGreeting()}</p>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="flex gap-4">
                            <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                                <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest">Today</p>
                                <p className="text-2xl font-black text-white">{stats.completedToday}/{todaysGoals.length}</p>
                            </div>
                            <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                                <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest">Rate</p>
                                <p className="text-2xl font-black text-white">{stats.averageCompletionRate}%</p>
                            </div>
                            <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                                <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest">Active</p>
                                <p className="text-2xl font-black text-white">{stats.activeGoals}</p>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-gray-100 dark:border-gray-800 px-6">
                        {(['today', 'goals', 'messages'] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`flex-1 py-3 text-sm font-bold uppercase tracking-wide transition-colors relative ${activeTab === tab
                                    ? 'text-indigo-600 dark:text-indigo-400'
                                    : 'text-gray-400 hover:text-gray-600'
                                    }`}
                            >
                                {tab === 'messages' && unreadMessages.length > 0 && (
                                    <span className="absolute top-2 right-1/4 w-2 h-2 bg-red-500 rounded-full" />
                                )}
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                {activeTab === tab && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500"
                                    />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6">
                        <AnimatePresence mode="wait">
                            {/* TODAY TAB */}
                            {activeTab === 'today' && (
                                <motion.div
                                    key="today"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="space-y-4"
                                >
                                    {todaysGoals.length === 0 ? (
                                        <div className="text-center py-12">
                                            <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                                                <Target className="w-10 h-10 text-gray-400" />
                                            </div>
                                            <h3 className="font-bold text-gray-900 dark:text-white mb-2">No goals for today</h3>
                                            <p className="text-sm text-gray-500 mb-4">Add some goals to get started!</p>
                                            <button
                                                onClick={() => { setActiveTab('goals'); setShowAddGoal(true); }}
                                                className="px-6 py-3 bg-indigo-500 text-white rounded-xl font-bold hover:bg-indigo-600 transition-colors"
                                            >
                                                Add Your First Goal
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            {pendingGoals.length > 0 && (
                                                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 mb-4">
                                                    <p className="text-sm text-amber-700 dark:text-amber-300">
                                                        <span className="font-bold">{pendingGoals.length}</span> goal{pendingGoals.length > 1 ? 's' : ''} waiting for you. No pressure — take it one step at a time! 💪
                                                    </p>
                                                </div>
                                            )}

                                            {todaysGoals.map((goal) => {
                                                const config = CATEGORY_CONFIG[goal.category];
                                                const Icon = config.icon;
                                                const completed = isGoalCompletedToday(goal.id);
                                                const streak = getStreak(goal.id);

                                                return (
                                                    <motion.div
                                                        key={goal.id}
                                                        layout
                                                        className={`relative overflow-hidden rounded-2xl border ${completed
                                                            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                                                            : 'bg-white dark:bg-[#252525] border-gray-100 dark:border-gray-800'
                                                            } p-4`}
                                                    >
                                                        <div className="flex items-start gap-4">
                                                            <div className={`p-3 rounded-xl ${completed ? 'bg-green-100 dark:bg-green-900/40' : config.bg}`}>
                                                                {completed ? (
                                                                    <Check className="w-6 h-6 text-green-600 dark:text-green-400" />
                                                                ) : (
                                                                    <Icon className={`w-6 h-6 ${config.color}`} />
                                                                )}
                                                            </div>
                                                            <div className="flex-1">
                                                                <h4 className={`font-bold ${completed ? 'text-green-700 dark:text-green-300 line-through' : 'text-gray-900 dark:text-white'}`}>
                                                                    {goal.title}
                                                                </h4>
                                                                <div className="flex items-center gap-3 mt-1">
                                                                    {goal.scheduledTime && (
                                                                        <span className="text-xs text-gray-400 flex items-center gap-1">
                                                                            <Clock className="w-3 h-3" />
                                                                            {goal.scheduledTime}
                                                                        </span>
                                                                    )}
                                                                    {streak && streak.currentStreak > 0 && (
                                                                        <span className="text-xs text-orange-500 font-bold flex items-center gap-1">
                                                                            <Flame className="w-3 h-3" />
                                                                            {streak.currentStreak} day{streak.currentStreak > 1 ? 's' : ''}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            {!completed && (
                                                                <button
                                                                    onClick={() => setSelectedGoalForComplete(goal.id)}
                                                                    className="p-2 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-200 transition-colors"
                                                                >
                                                                    <Check className="w-5 h-5" />
                                                                </button>
                                                            )}
                                                        </div>

                                                        {/* Completion Modal */}
                                                        <AnimatePresence>
                                                            {selectedGoalForComplete === goal.id && (
                                                                <motion.div
                                                                    initial={{ opacity: 0, height: 0 }}
                                                                    animate={{ opacity: 1, height: 'auto' }}
                                                                    exit={{ opacity: 0, height: 0 }}
                                                                    className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700"
                                                                >
                                                                    <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">How are you feeling? 💭</p>
                                                                    <div className="flex gap-2 mb-3">
                                                                        {(['great', 'good', 'okay', 'tough'] as const).map((mood) => (
                                                                            <button
                                                                                key={mood}
                                                                                onClick={() => setCompletionMood(mood)}
                                                                                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors ${completionMood === mood
                                                                                    ? 'bg-indigo-500 text-white'
                                                                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                                                                                    }`}
                                                                            >
                                                                                {mood === 'great' && '🌟'}
                                                                                {mood === 'good' && '😊'}
                                                                                {mood === 'okay' && '😐'}
                                                                                {mood === 'tough' && '😔'}
                                                                            </button>
                                                                        ))}
                                                                    </div>
                                                                    <input
                                                                        type="text"
                                                                        placeholder="Quick note (optional)"
                                                                        value={completionNote}
                                                                        onChange={(e) => setCompletionNote(e.target.value)}
                                                                        className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                                    />
                                                                    <div className="flex gap-2">
                                                                        <button
                                                                            onClick={() => setSelectedGoalForComplete(null)}
                                                                            className="flex-1 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-200 transition-colors"
                                                                        >
                                                                            Cancel
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleCompleteGoal(goal.id)}
                                                                            className="flex-1 py-2 rounded-lg bg-green-500 text-white font-bold hover:bg-green-600 transition-colors"
                                                                        >
                                                                            Complete! 🎉
                                                                        </button>
                                                                    </div>
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </motion.div>
                                                );
                                            })}
                                        </>
                                    )}
                                </motion.div>
                            )}

                            {/* GOALS TAB */}
                            {activeTab === 'goals' && (
                                <motion.div
                                    key="goals"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="space-y-4"
                                >
                                    {/* Add Goal Button */}
                                    <button
                                        onClick={() => setShowAddGoal(true)}
                                        className="w-full p-4 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-center gap-2 text-gray-500 hover:border-indigo-400 hover:text-indigo-500 transition-colors"
                                    >
                                        <Plus className="w-5 h-5" />
                                        <span className="font-bold">Add New Goal</span>
                                    </button>

                                    {/* Goals List */}
                                    {activeGoals.map((goal) => {
                                        const config = CATEGORY_CONFIG[goal.category];
                                        const Icon = config.icon;
                                        const streak = getStreak(goal.id);
                                        const rate = getCompletionRate(goal.id, 7);

                                        return (
                                            <motion.div
                                                key={goal.id}
                                                layout
                                                className="bg-white dark:bg-[#252525] rounded-2xl border border-gray-100 dark:border-gray-800 p-4"
                                            >
                                                <div className="flex items-start gap-4">
                                                    <div className={`p-3 rounded-xl ${config.bg}`}>
                                                        <Icon className={`w-6 h-6 ${config.color}`} />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-bold text-gray-900 dark:text-white">{goal.title}</h4>
                                                        <p className="text-xs text-gray-400 mt-0.5">
                                                            {FREQUENCY_LABELS[goal.frequency]}
                                                            {goal.scheduledTime && ` • ${goal.scheduledTime}`}
                                                        </p>
                                                        <div className="flex items-center gap-4 mt-2">
                                                            <div className="flex items-center gap-1">
                                                                <TrendingUp className="w-3 h-3 text-green-500" />
                                                                <span className="text-xs font-bold text-gray-600 dark:text-gray-400">{rate}%</span>
                                                            </div>
                                                            {streak && streak.currentStreak > 0 && (
                                                                <div className="flex items-center gap-1">
                                                                    <Flame className="w-3 h-3 text-orange-500" />
                                                                    <span className="text-xs font-bold text-gray-600 dark:text-gray-400">{streak.currentStreak} days</span>
                                                                </div>
                                                            )}
                                                            {streak && streak.longestStreak > 0 && (
                                                                <div className="flex items-center gap-1">
                                                                    <Award className="w-3 h-3 text-purple-500" />
                                                                    <span className="text-xs font-bold text-gray-600 dark:text-gray-400">Best: {streak.longestStreak}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-1">
                                                        <button
                                                            onClick={() => setEditingGoal(goal)}
                                                            className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                                        >
                                                            <Pencil className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => deleteGoal(goal.id)}
                                                            className="p-2 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 transition-colors"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}

                                    {activeGoals.length === 0 && !showAddGoal && (
                                        <div className="text-center py-8 text-gray-500">
                                            <p>No active goals yet. Add one to get started!</p>
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {/* MESSAGES TAB */}
                            {activeTab === 'messages' && (
                                <motion.div
                                    key="messages"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="space-y-3"
                                >
                                    {messages.length === 0 ? (
                                        <div className="text-center py-12 text-gray-500">
                                            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                            <p>No messages yet. Complete goals to hear from me! 💬</p>
                                            <button
                                                onClick={() => generateTestMessages()}
                                                className="mt-4 px-4 py-2 bg-indigo-500 text-white rounded-xl font-bold text-sm hover:bg-indigo-600 transition-colors"
                                            >
                                                🧪 Generate Test Messages
                                            </button>
                                        </div>
                                    ) : (
                                        messages.map((msg) => (
                                            <motion.div
                                                key={msg.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className={`p-4 rounded-2xl ${msg.type === 'acknowledgment' || msg.type === 'streak-celebration'
                                                    ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                                                    : msg.type === 'reminder'
                                                        ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                                                        : msg.type === 'gentle-nudge'
                                                            ? 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800'
                                                            : 'bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700'
                                                    }`}
                                            >
                                                <p className="text-sm text-gray-700 dark:text-gray-200">{msg.message}</p>
                                                <p className="text-[10px] text-gray-400 mt-2">
                                                    {new Date(msg.timestamp).toLocaleString()}
                                                </p>
                                            </motion.div>
                                        ))
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Add Goal Modal */}
                    <AnimatePresence>
                        {showAddGoal && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-end justify-center"
                                onClick={() => setShowAddGoal(false)}
                            >
                                <motion.div
                                    initial={{ y: '100%' }}
                                    animate={{ y: 0 }}
                                    exit={{ y: '100%' }}
                                    transition={{ type: 'spring', damping: 25 }}
                                    onClick={(e) => e.stopPropagation()}
                                    className="w-full bg-white dark:bg-[#1A1A1A] rounded-t-[2rem] p-6 max-h-[80vh] overflow-y-auto"
                                >
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-xl font-black text-gray-900 dark:text-white">Add New Goal</h3>
                                        <button
                                            onClick={() => setShowAddGoal(false)}
                                            className="p-2 rounded-full bg-gray-100 dark:bg-gray-800"
                                        >
                                            <X className="w-5 h-5 text-gray-500" />
                                        </button>
                                    </div>

                                    <div className="space-y-5">
                                        {/* Title */}
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">What's your goal?</label>
                                            <input
                                                type="text"
                                                value={newGoal.title}
                                                onChange={(e) => setNewGoal(prev => ({ ...prev, title: e.target.value }))}
                                                placeholder="e.g., Meditate for 10 minutes"
                                                className="w-full mt-2 px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            />
                                        </div>

                                        {/* Category */}
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Category</label>
                                            <div className="grid grid-cols-4 gap-2 mt-2">
                                                {(Object.keys(CATEGORY_CONFIG) as GoalCategory[]).map((cat) => {
                                                    const config = CATEGORY_CONFIG[cat];
                                                    const Icon = config.icon;
                                                    return (
                                                        <button
                                                            key={cat}
                                                            onClick={() => setNewGoal(prev => ({ ...prev, category: cat }))}
                                                            className={`p-3 rounded-xl flex flex-col items-center gap-1 transition-colors ${newGoal.category === cat
                                                                ? 'bg-indigo-100 dark:bg-indigo-900/40 ring-2 ring-indigo-500'
                                                                : 'bg-gray-100 dark:bg-gray-800'
                                                                }`}
                                                        >
                                                            <Icon className={`w-5 h-5 ${config.color}`} />
                                                            <span className="text-[10px] font-bold text-gray-600 dark:text-gray-300 capitalize">{cat}</span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Frequency */}
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Frequency</label>
                                            <div className="flex gap-2 mt-2">
                                                {(['daily', 'weekly', 'custom'] as GoalFrequency[]).map((freq) => (
                                                    <button
                                                        key={freq}
                                                        onClick={() => setNewGoal(prev => ({ ...prev, frequency: freq }))}
                                                        className={`flex-1 py-3 rounded-xl font-bold text-sm transition-colors ${newGoal.frequency === freq
                                                            ? 'bg-indigo-500 text-white'
                                                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                                                            }`}
                                                    >
                                                        {FREQUENCY_LABELS[freq]}
                                                    </button>
                                                ))}
                                            </div>

                                            {/* Custom Days */}
                                            {newGoal.frequency === 'custom' && (
                                                <div className="flex gap-1 mt-3">
                                                    {DAY_NAMES.map((day, i) => (
                                                        <button
                                                            key={day}
                                                            onClick={() => toggleCustomDay(i)}
                                                            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${newGoal.customDays.includes(i)
                                                                ? 'bg-indigo-500 text-white'
                                                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                                                                }`}
                                                        >
                                                            {day}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Scheduled Time */}
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Scheduled Time</label>
                                            <input
                                                type="time"
                                                value={newGoal.scheduledTime}
                                                onChange={(e) => setNewGoal(prev => ({ ...prev, scheduledTime: e.target.value }))}
                                                className="w-full mt-2 px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            />
                                        </div>

                                        {/* Reminder Toggle */}
                                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                                            <div className="flex items-center gap-3">
                                                <Bell className="w-5 h-5 text-indigo-500" />
                                                <div>
                                                    <p className="font-bold text-gray-900 dark:text-white text-sm">Reminders</p>
                                                    <p className="text-xs text-gray-500">{newGoal.reminderMinutesBefore} min before</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setNewGoal(prev => ({ ...prev, reminderEnabled: !prev.reminderEnabled }))}
                                                className={`w-12 h-7 rounded-full transition-colors relative ${newGoal.reminderEnabled ? 'bg-indigo-500' : 'bg-gray-300 dark:bg-gray-600'
                                                    }`}
                                            >
                                                <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all shadow-sm ${newGoal.reminderEnabled ? 'left-6' : 'left-1'
                                                    }`} />
                                            </button>
                                        </div>

                                        {/* Reflective Goal Toggle */}
                                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                                            <div className="flex items-center gap-3">
                                                <Pencil className="w-5 h-5 text-purple-500" />
                                                <div>
                                                    <p className="font-bold text-gray-900 dark:text-white text-sm">Low-effort Goal</p>
                                                    <p className="text-xs text-gray-500">Like journaling or reflection</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setNewGoal(prev => ({ ...prev, isReflective: !prev.isReflective }))}
                                                className={`w-12 h-7 rounded-full transition-colors relative ${newGoal.isReflective ? 'bg-purple-500' : 'bg-gray-300 dark:bg-gray-600'
                                                    }`}
                                            >
                                                <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all shadow-sm ${newGoal.isReflective ? 'left-6' : 'left-1'
                                                    }`} />
                                            </button>
                                        </div>

                                        {/* Submit Button */}
                                        <button
                                            onClick={handleAddGoal}
                                            disabled={!newGoal.title.trim()}
                                            className="w-full py-4 bg-indigo-500 text-white rounded-2xl font-bold shadow-lg shadow-indigo-500/30 hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Add Goal 🎯
                                        </button>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default GoalAssistant;
