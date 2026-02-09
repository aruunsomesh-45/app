import React, { useState } from 'react';
import { Footprints, Play, Pause, X, ChevronRight, Flame, MapPin } from 'lucide-react';
import { useStepTracking } from '../../hooks/useStepTracking';
import { motion, AnimatePresence } from 'framer-motion';

const StepCalculator: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'tracker' | 'calculator'>('tracker');

    // Calculator States
    const [calcDistance, setCalcDistance] = useState('');
    const [calculatedSteps, setCalculatedSteps] = useState<number | null>(null);
    const [manualStepsInput, setManualStepsInput] = useState('');

    const {
        isTracking,
        isSupported,
        todaySteps,
        todayDistance,
        todayCalories,
        startTracking,
        stopTracking,
        formatSteps,
        formatDistance,
        addStepsManually
    } = useStepTracking();

    const STEP_GOAL = 10000;
    const progress = Math.min((todaySteps / STEP_GOAL) * 100, 100);

    const calculateSteps = () => {
        const dist = parseFloat(calcDistance);
        if (!isNaN(dist)) {
            // Average step length is ~0.762 meters (approx 1312 steps per km)
            const steps = Math.round(dist * 1312.34);
            setCalculatedSteps(steps);
        }
    };

    const handleManualAdd = () => {
        const steps = parseInt(manualStepsInput);
        if (!isNaN(steps) && steps > 0) {
            addStepsManually(steps);
            setManualStepsInput('');
        }
    };

    return (
        <>
            <div className="h-44 w-full">
                {!isOpen && (
                    <motion.button
                        layoutId="step-calculator-card"
                        onClick={() => setIsOpen(true)}
                        className="w-full h-full bg-white dark:bg-[#1A1A1A] rounded-[2rem] p-5 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between group relative overflow-hidden text-left hover:shadow-md transition-shadow cursor-zoom-in"
                    >
                        {/* Background Progress Ring (Decorative) */}
                        <div className="absolute right-[-20%] bottom-[-20%] w-32 h-32 rounded-full border-[12px] border-orange-500/10 dark:border-orange-500/5 group-hover:scale-110 transition-transform duration-500" />

                        <div className="flex justify-between items-start w-full">
                            <div className="p-2.5 rounded-xl bg-orange-50 dark:bg-orange-500/10 text-orange-500">
                                <Footprints className="w-5 h-5" />
                            </div>
                            {isTracking && (
                                <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 text-[10px] font-bold uppercase tracking-wider">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                    Live
                                </div>
                            )}
                        </div>

                        <div>
                            <div className="flex items-baseline gap-1 mb-1">
                                <span className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                                    {formatSteps(todaySteps)}
                                </span>
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                    / {formatSteps(STEP_GOAL)}
                                </span>
                            </div>

                            {/* Progress Bar */}
                            <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mb-2">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    className="h-full bg-orange-500 rounded-full"
                                />
                            </div>

                            <div className="flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                <div className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {formatDistance(todayDistance)}
                                </div>
                                <div className="flex items-center gap-1">
                                    <Flame className="w-3 h-3" />
                                    {todayCalories} cal
                                </div>
                            </div>
                        </div>
                    </motion.button>
                )}
            </div>

            <AnimatePresence>
                {isOpen && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/20 dark:bg-black/50 backdrop-blur-sm"
                        onClick={() => setIsOpen(false)}
                    >
                        <motion.div
                            layoutId="step-calculator-card"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-sm bg-white dark:bg-[#1A1A1A] rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 cursor-default"
                        >
                            {/* Header */}
                            <div className="p-6 pb-2 flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Step Tracker</h2>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Daily Activity & Stats</p>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            {/* Tabs */}
                            <div className="px-6 pt-4 flex gap-2">
                                <button
                                    onClick={() => setActiveTab('tracker')}
                                    className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${activeTab === 'tracker'
                                        ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                                        : 'bg-gray-50 dark:bg-gray-800 text-gray-400 hover:bg-gray-100'
                                        }`}
                                >
                                    Tracker
                                </button>
                                <button
                                    onClick={() => setActiveTab('calculator')}
                                    className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${activeTab === 'calculator'
                                        ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                                        : 'bg-gray-50 dark:bg-gray-800 text-gray-400 hover:bg-gray-100'
                                        }`}
                                >
                                    Calculator
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                {activeTab === 'tracker' ? (
                                    <div className="space-y-6">
                                        {/* Main Stats */}
                                        <div className="text-center py-6 relative">
                                            {/* Circular Progress (Simplified representation) */}
                                            <div className="w-48 h-48 mx-auto rounded-full border-[16px] border-gray-100 dark:border-gray-800 flex items-center justify-center relative">
                                                <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                                                    <circle
                                                        cx="96"
                                                        cy="96"
                                                        r="88" // 96 - 8 (half border)
                                                        stroke="currentColor"
                                                        strokeWidth="16"
                                                        fill="transparent"
                                                        className="text-orange-500"
                                                        strokeDasharray={2 * Math.PI * 88}
                                                        strokeDashoffset={(2 * Math.PI * 88) * (1 - progress / 100)}
                                                        strokeLinecap="round"
                                                    />
                                                </svg>
                                                <div className="flex flex-col items-center">
                                                    <Footprints className="w-6 h-6 text-orange-500 mb-2" />
                                                    <span className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter">
                                                        {formatSteps(todaySteps)}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                                                        Goal: {formatSteps(STEP_GOAL)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Stats Configuration */}
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl">
                                                <div className="flex items-center gap-2 mb-1 text-gray-400 text-[10px] font-bold uppercase tracking-wider">
                                                    <MapPin className="w-3 h-3" /> Distance
                                                </div>
                                                <p className="text-xl font-black text-gray-900 dark:text-white">
                                                    {formatDistance(todayDistance)}
                                                </p>
                                            </div>
                                            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl">
                                                <div className="flex items-center gap-2 mb-1 text-gray-400 text-[10px] font-bold uppercase tracking-wider">
                                                    <Flame className="w-3 h-3" /> Calories
                                                </div>
                                                <p className="text-xl font-black text-gray-900 dark:text-white">
                                                    {todayCalories} <span className="text-sm font-bold text-gray-400">kcal</span>
                                                </p>
                                            </div>
                                        </div>

                                        {/* Controls */}
                                        <div className="space-y-3">
                                            {isSupported ? (
                                                <div className="flex gap-3">
                                                    <button
                                                        onClick={isTracking ? stopTracking : startTracking}
                                                        className={`flex-1 py-4 rounded-xl flex items-center justify-center gap-2 text-sm font-bold text-white transition-all ${isTracking
                                                            ? 'bg-gray-900 dark:bg-gray-700 hover:bg-black dark:hover:bg-gray-600'
                                                            : 'bg-orange-500 hover:bg-orange-600 shadow-xl shadow-orange-500/20'
                                                            }`}
                                                    >
                                                        {isTracking ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                                        {isTracking ? 'Pause Tracking' : 'Start Tracking'}
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="p-4 bg-orange-50 dark:bg-orange-500/10 rounded-xl border border-orange-100 dark:border-orange-500/20">
                                                    <p className="text-xs text-orange-600 dark:text-orange-400 mb-3 font-medium">
                                                        Device sensors not available. Add steps manually:
                                                    </p>
                                                    <div className="flex gap-2">
                                                        <input
                                                            type="number"
                                                            value={manualStepsInput}
                                                            onChange={(e) => setManualStepsInput(e.target.value)}
                                                            placeholder="Steps..."
                                                            className="flex-1 bg-white dark:bg-black/50 rounded-lg px-3 py-2 text-sm outline-none border border-transparent focus:border-orange-500 transition-colors"
                                                        />
                                                        <button
                                                            onClick={handleManualAdd}
                                                            className="px-4 py-2 bg-orange-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-orange-600 transition-colors"
                                                        >
                                                            Add
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {/* Calculator Input */}
                                        <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-800">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5 mb-3">
                                                <MapPin className="w-3 h-3" /> Distance (km)
                                            </label>
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="number"
                                                    value={calcDistance}
                                                    onChange={(e) => setCalcDistance(e.target.value)}
                                                    placeholder="Ex: 5.5"
                                                    className="w-full bg-transparent text-3xl font-black text-gray-900 dark:text-white placeholder-gray-300 focus:outline-none"
                                                />
                                                <button
                                                    onClick={calculateSteps}
                                                    className="p-3 bg-orange-500 text-white rounded-xl shadow-lg shadow-orange-500/20 hover:scale-105 transition-transform"
                                                >
                                                    <ChevronRight className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Result */}
                                        {calculatedSteps !== null && (
                                            <div className="p-6 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-xl shadow-orange-500/20 animate-in fade-in slide-in-from-bottom-4">
                                                <div className="flex items-center justify-between mb-2 opacity-80">
                                                    <span className="text-[10px] font-bold uppercase tracking-widest">Estimated Activity</span>
                                                    <Footprints className="w-4 h-4" />
                                                </div>
                                                <p className="text-4xl font-black tracking-tight">
                                                    {formatSteps(calculatedSteps)}
                                                </p>
                                                <p className="text-xs font-bold mt-1 opacity-80">Steps</p>

                                                <div className="mt-4 pt-4 border-t border-white/20 grid grid-cols-2 gap-4">
                                                    <div>
                                                        <span className="text-[10px] font-bold opacity-70 uppercase tracking-wider block mb-0.5">Time</span>
                                                        <span className="text-lg font-black">~{Math.round(calculatedSteps / 100)}m</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-[10px] font-bold opacity-70 uppercase tracking-wider block mb-0.5">Burn</span>
                                                        <span className="text-lg font-black">~{Math.round(calculatedSteps * 0.04)}cal</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};

export default StepCalculator;
