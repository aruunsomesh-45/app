import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Plus, Check, Trash2, X,
    Dumbbell, Brain, Briefcase, Heart,
    Target, Sparkles
} from 'lucide-react';
import { useLifeTracker } from '../utils/lifeTrackerStore';
import type { DailyTask, WeeklyGoal } from '../utils/lifeTrackerStore';

const TASK_CATEGORIES = [
    { id: 'physical', label: 'Physical', icon: Dumbbell, color: 'bg-orange-500', lightColor: 'bg-orange-100', textColor: 'text-orange-600' },
    { id: 'mental', label: 'Mental', icon: Brain, color: 'bg-purple-500', lightColor: 'bg-purple-100', textColor: 'text-purple-600' },
    { id: 'work', label: 'Work', icon: Briefcase, color: 'bg-blue-500', lightColor: 'bg-blue-100', textColor: 'text-blue-600' },
    { id: 'personal', label: 'Personal', icon: Heart, color: 'bg-pink-500', lightColor: 'bg-pink-100', textColor: 'text-pink-600' },
] as const;

const TaskManager: React.FC = () => {
    const navigate = useNavigate();
    const store = useLifeTracker();
    const todayTasks = store.getTodayTasks();
    const weeklyGoals = store.getCurrentWeekGoals();

    // Modal States
    const [showAddTaskModal, setShowAddTaskModal] = useState(false);
    const [showAddGoalModal, setShowAddGoalModal] = useState(false);

    // Add Task Form
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<'physical' | 'mental' | 'work' | 'personal'>('work');

    // Add Goal Form
    const [newGoalTitle, setNewGoalTitle] = useState('');
    const goalSystemId = 'general';

    const handleAddTask = () => {
        if (!newTaskTitle.trim()) return;

        store.addDailyTask({
            title: newTaskTitle.trim(),
            category: selectedCategory,
            date: new Date().toISOString().split('T')[0],
        });

        setNewTaskTitle('');
        setShowAddTaskModal(false);
    };

    const handleAddGoal = () => {
        if (!newGoalTitle.trim()) return;

        store.addWeeklyGoal({
            title: newGoalTitle.trim(),
            systemId: goalSystemId,
        });

        setNewGoalTitle('');
        setShowAddGoalModal(false);
    };

    const completedTasks = todayTasks.filter(t => t.completed);
    const pendingTasks = todayTasks.filter(t => !t.completed);
    const completionRate = todayTasks.length > 0
        ? Math.round((completedTasks.length / todayTasks.length) * 100)
        : 0;

    // Group tasks by category
    const tasksByCategory = TASK_CATEGORIES.map(cat => ({
        ...cat,
        tasks: todayTasks.filter(t => t.category === cat.id),
    }));

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-indigo-50 pb-24">
            {/* Header */}
            <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-100">
                <div className="px-5 py-4 flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-700" />
                    </button>
                    <div className="flex-1">
                        <h1 className="text-xl font-bold text-gray-900">Today's Tasks</h1>
                        <p className="text-xs text-gray-500">
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                        </p>
                    </div>
                    <button
                        onClick={() => setShowAddTaskModal(true)}
                        className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shadow-lg"
                    >
                        <Plus className="w-5 h-5 text-white" />
                    </button>
                </div>
            </div>

            {/* Progress Overview */}
            <div className="px-5 py-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 shadow-xl"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-blue-100 text-sm">Today's Progress</p>
                            <p className="text-3xl font-bold text-white mt-1">
                                {completedTasks.length}/{todayTasks.length}
                            </p>
                        </div>
                        <div className="relative w-20 h-20">
                            <svg className="w-20 h-20 -rotate-90">
                                <circle
                                    cx="40"
                                    cy="40"
                                    r="32"
                                    fill="none"
                                    stroke="rgba(255,255,255,0.2)"
                                    strokeWidth="8"
                                />
                                <motion.circle
                                    cx="40"
                                    cy="40"
                                    r="32"
                                    fill="none"
                                    stroke="white"
                                    strokeWidth="8"
                                    strokeLinecap="round"
                                    initial={{ strokeDasharray: '0 201' }}
                                    animate={{ strokeDasharray: `${completionRate * 2.01} 201` }}
                                    transition={{ duration: 0.8, ease: 'easeOut' }}
                                />
                            </svg>
                            <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-white">
                                {completionRate}%
                            </span>
                        </div>
                    </div>

                    {/* Category Pills */}
                    <div className="flex gap-2 flex-wrap">
                        {TASK_CATEGORIES.map((cat) => {
                            const count = tasksByCategory.find(c => c.id === cat.id)?.tasks.length || 0;
                            const Icon = cat.icon;
                            return (
                                <div
                                    key={cat.id}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 rounded-full"
                                >
                                    <Icon className="w-3.5 h-3.5 text-white" />
                                    <span className="text-xs text-white font-medium">{count}</span>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>
            </div>

            {/* Task List */}
            <div className="px-5 py-2">
                {todayTasks.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-white rounded-2xl p-8 text-center border border-dashed border-gray-200"
                    >
                        <Target className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p className="text-gray-500 mb-4">No tasks for today</p>
                        <button
                            onClick={() => setShowAddTaskModal(true)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium"
                        >
                            Add Your First Task
                        </button>
                    </motion.div>
                ) : (
                    <div className="space-y-4">
                        {/* Pending Tasks */}
                        {pendingTasks.length > 0 && (
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 mb-3">To Do ({pendingTasks.length})</h3>
                                <div className="space-y-2">
                                    {pendingTasks.map((task: DailyTask, index: number) => {
                                        const catInfo = TASK_CATEGORIES.find(c => c.id === task.category);
                                        const CatIcon = catInfo?.icon || Target;

                                        return (
                                            <motion.div
                                                key={task.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.03 }}
                                                layout
                                                className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3"
                                            >
                                                <button
                                                    onClick={() => store.toggleTask(task.id)}
                                                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${catInfo ? `border-${task.category === 'physical' ? 'orange' : task.category === 'mental' ? 'purple' : task.category === 'work' ? 'blue' : 'pink'}-500` : 'border-gray-300'
                                                        }`}
                                                />
                                                <div className="flex-1">
                                                    <p className="font-medium text-gray-900">{task.title}</p>
                                                </div>
                                                <div className={`px-2 py-1 rounded-md ${catInfo?.lightColor}`}>
                                                    <CatIcon className={`w-4 h-4 ${catInfo?.textColor}`} />
                                                </div>
                                                <button
                                                    onClick={() => store.deleteTask(task.id)}
                                                    className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center"
                                                >
                                                    <Trash2 className="w-4 h-4 text-gray-400" />
                                                </button>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Completed Tasks */}
                        {completedTasks.length > 0 && (
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 mb-3">Completed ({completedTasks.length})</h3>
                                <div className="space-y-2">
                                    {completedTasks.map((task: DailyTask, index: number) => {
                                        return (
                                            <motion.div
                                                key={task.id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: index * 0.03 }}
                                                layout
                                                className="bg-gray-50 rounded-xl p-4 flex items-center gap-3"
                                            >
                                                <button
                                                    onClick={() => store.toggleTask(task.id)}
                                                    className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center"
                                                >
                                                    <Check className="w-4 h-4 text-white" />
                                                </button>
                                                <p className="flex-1 text-gray-500 line-through">{task.title}</p>
                                                <button
                                                    onClick={() => store.deleteTask(task.id)}
                                                    className="w-8 h-8 rounded-full hover:bg-gray-200 flex items-center justify-center"
                                                >
                                                    <Trash2 className="w-4 h-4 text-gray-400" />
                                                </button>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Weekly Goals */}
            <div className="px-5 py-4">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Weekly Goals</h2>
                    <button
                        onClick={() => setShowAddGoalModal(true)}
                        className="text-sm text-blue-600 font-medium flex items-center gap-1"
                    >
                        <Plus className="w-4 h-4" /> Add Goal
                    </button>
                </div>

                {weeklyGoals.length === 0 ? (
                    <div className="bg-white rounded-xl p-6 text-center border border-dashed border-gray-200">
                        <Sparkles className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm text-gray-500">No weekly goals set</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {weeklyGoals.map((goal: WeeklyGoal, index: number) => (
                            <motion.div
                                key={goal.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <p className="font-medium text-gray-900">{goal.title}</p>
                                    {goal.completed && (
                                        <span className="px-2 py-1 bg-green-100 text-green-600 text-xs font-medium rounded-full">
                                            Done!
                                        </span>
                                    )}
                                </div>
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${goal.progress}%` }}
                                        transition={{ duration: 0.5 }}
                                        className={`h-full rounded-full ${goal.completed
                                            ? 'bg-green-500'
                                            : 'bg-gradient-to-r from-blue-500 to-indigo-500'
                                            }`}
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-2">{goal.progress}% complete</p>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add Task Modal */}
            <AnimatePresence>
                {showAddTaskModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end justify-center"
                        onClick={() => setShowAddTaskModal(false)}
                    >
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-md bg-white rounded-t-3xl p-6"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-gray-900">Add Task</h3>
                                <button
                                    onClick={() => setShowAddTaskModal(false)}
                                    className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
                                >
                                    <X className="w-4 h-4 text-gray-600" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-2 block">Task</label>
                                    <input
                                        type="text"
                                        value={newTaskTitle}
                                        onChange={(e) => setNewTaskTitle(e.target.value)}
                                        placeholder="What do you need to do?"
                                        className="w-full p-4 bg-gray-50 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        autoFocus
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-2 block">Category</label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {TASK_CATEGORIES.map((cat) => {
                                            const Icon = cat.icon;
                                            return (
                                                <button
                                                    key={cat.id}
                                                    onClick={() => setSelectedCategory(cat.id)}
                                                    className={`p-3 rounded-xl flex flex-col items-center gap-2 transition-all ${selectedCategory === cat.id
                                                        ? `${cat.color} text-white shadow-lg`
                                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                        }`}
                                                >
                                                    <Icon className="w-5 h-5" />
                                                    <span className="text-xs font-medium">{cat.label}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleAddTask}
                                disabled={!newTaskTitle.trim()}
                                className="w-full mt-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg disabled:opacity-50"
                            >
                                Add Task
                            </motion.button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Add Goal Modal */}
            <AnimatePresence>
                {showAddGoalModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end justify-center"
                        onClick={() => setShowAddGoalModal(false)}
                    >
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-md bg-white rounded-t-3xl p-6"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-gray-900">Add Weekly Goal</h3>
                                <button
                                    onClick={() => setShowAddGoalModal(false)}
                                    className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
                                >
                                    <X className="w-4 h-4 text-gray-600" />
                                </button>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-2 block">Goal</label>
                                <input
                                    type="text"
                                    value={newGoalTitle}
                                    onChange={(e) => setNewGoalTitle(e.target.value)}
                                    placeholder="e.g., Read 100 pages, Meditate 5 days..."
                                    className="w-full p-4 bg-gray-50 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    autoFocus
                                />
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleAddGoal}
                                disabled={!newGoalTitle.trim()}
                                className="w-full mt-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg disabled:opacity-50"
                            >
                                Add Goal
                            </motion.button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TaskManager;
