/**
 * GoalAssistantWidget
 * 
 * A compact dashboard widget showing today's goal progress
 * that opens the full Goal Assistant modal when clicked.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Target, Flame, ChevronRight, CheckCircle2, CircleDashed } from 'lucide-react';
import { useGoalAssistant } from '../hooks/useGoalAssistant';

interface GoalAssistantWidgetProps {
    onClick: () => void;
}

const GoalAssistantWidget: React.FC<GoalAssistantWidgetProps> = ({ onClick }) => {
    const { todaysGoals, pendingGoals, stats, unreadMessages, getStreak } = useGoalAssistant();

    const completedCount = stats.completedToday;
    const totalCount = todaysGoals.length;
    const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    // Get streak info from first goal with a streak
    const topStreak = todaysGoals
        .map(g => getStreak(g.id))
        .filter(s => s && s.currentStreak > 0)
        .sort((a, b) => (b?.currentStreak || 0) - (a?.currentStreak || 0))[0];

    return (
        <motion.div
            onClick={onClick}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="relative bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-[2rem] p-5 cursor-pointer shadow-lg shadow-indigo-500/20 overflow-hidden"
        >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full blur-2xl" />
            </div>

            {/* Unread Badge */}
            {unreadMessages.length > 0 && (
                <div className="absolute top-3 right-3 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-[10px] font-bold text-white">{unreadMessages.length}</span>
                </div>
            )}

            <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                            <Target className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-white">Goal Buddy</h3>
                            <p className="text-[10px] text-white/70 font-medium">Your accountability partner</p>
                        </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-white/50" />
                </div>

                {/* Progress Ring */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {/* Circular Progress */}
                        <div className="relative w-16 h-16">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle
                                    cx="32"
                                    cy="32"
                                    r="28"
                                    stroke="rgba(255,255,255,0.2)"
                                    strokeWidth="6"
                                    fill="none"
                                />
                                <circle
                                    cx="32"
                                    cy="32"
                                    r="28"
                                    stroke="white"
                                    strokeWidth="6"
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeDasharray={`${progress * 1.76} 176`}
                                    className="transition-all duration-500"
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-lg font-black text-white">{progress}%</span>
                            </div>
                        </div>

                        {/* Stats */}
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <CheckCircle2 className="w-4 h-4 text-white/80" />
                                <span className="text-sm font-bold text-white">{completedCount}</span>
                                <span className="text-xs text-white/60">done</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CircleDashed className="w-4 h-4 text-white/80" />
                                <span className="text-sm font-bold text-white">{pendingGoals.length}</span>
                                <span className="text-xs text-white/60">pending</span>
                            </div>
                        </div>
                    </div>

                    {/* Streak Badge */}
                    {topStreak && topStreak.currentStreak > 0 && (
                        <div className="bg-white/20 backdrop-blur-sm rounded-xl px-3 py-2 flex items-center gap-2">
                            <Flame className="w-4 h-4 text-orange-300" />
                            <span className="text-sm font-black text-white">{topStreak.currentStreak}</span>
                        </div>
                    )}
                </div>

                {/* Motivational Message */}
                {totalCount === 0 ? (
                    <p className="text-xs text-white/80 mt-4 bg-white/10 rounded-lg px-3 py-2">
                        ✨ Tap to add your first goal!
                    </p>
                ) : completedCount === totalCount ? (
                    <p className="text-xs text-white/80 mt-4 bg-white/10 rounded-lg px-3 py-2">
                        🎉 All done! You're amazing!
                    </p>
                ) : pendingGoals.length === 1 ? (
                    <p className="text-xs text-white/80 mt-4 bg-white/10 rounded-lg px-3 py-2">
                        💪 One more to go! You've got this!
                    </p>
                ) : null}
            </div>
        </motion.div>
    );
};

export default GoalAssistantWidget;
