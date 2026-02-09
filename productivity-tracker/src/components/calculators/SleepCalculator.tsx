import React, { useState, useEffect } from 'react';
import { Moon, AlarmClock, Bed, Sunrise, Zap, X, Brain, ChevronRight, Bell, Settings } from 'lucide-react';
import { useSleepMonitoring } from '../../hooks/useSleepMonitoring';
import { motion, AnimatePresence } from 'framer-motion';

const SleepCalculator: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'tracker' | 'schedule' | 'calculator'>('tracker');
    const [calcWakeTime, setCalcWakeTime] = useState('07:00');

    // Local state for schedule (to avoid constant re-renders during editing)
    const [localSchedule, setLocalSchedule] = useState({
        sleepTime: '23:00',
        wakeTime: '07:00',
        enabled: true,
        bedReminder: true,
        wakeUpAlarm: true
    });

    const {
        isSleeping: isTracking,
        todayRecord,
        stats,
        schedule,
        updateSchedule,
        startSleep,
        endSleep: wakeUp,
        getRecommendedBedtimes,
        formatDuration
    } = useSleepMonitoring();

    // Sync local schedule with global state on open
    useEffect(() => {
        if (isOpen) {
            setLocalSchedule({
                sleepTime: schedule.sleepTime,
                wakeTime: schedule.wakeTime,
                enabled: schedule.enabled,
                bedReminder: schedule.bedReminder ?? true,
                wakeUpAlarm: schedule.wakeUpAlarm ?? true
            });
        }
    }, [isOpen, schedule]);

    const handleSaveSchedule = () => {
        updateSchedule(localSchedule);
        // Optional: show a toast or feedback
    };

    const lastNightDuration = todayRecord?.durationHours;
    const averageDuration = stats?.averageDuration;
    const sleepStreak = stats?.streak || 0;

    const getQualityScore = (q: string | undefined) => {
        if (!q) return 0;
        switch (q) {
            case 'excellent': return 100;
            case 'good': return 80;
            case 'fair': return 60;
            case 'poor': return 40;
            default: return 0;
        }
    };
    const sleepQuality = getQualityScore(todayRecord?.quality);

    const recommendedBedtimes = getRecommendedBedtimes(calcWakeTime);

    // Variants for animations
    const cardVariants = {
        hidden: { opacity: 0, y: 20, scale: 0.95 },
        visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring' as const, stiffness: 300, damping: 30 } },
        exit: { opacity: 0, y: 20, scale: 0.95 }
    };

    return (
        <>
            <div className="h-44 w-full">
                {!isOpen && (
                    <motion.button
                        layoutId="sleep-calculator-card"
                        onClick={() => setIsOpen(true)}
                        className="w-full h-full bg-white dark:bg-[#1A1A1A] rounded-[2rem] p-6 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between group relative overflow-hidden text-left hover:shadow-xl transition-all duration-300"
                    >
                        {/* Decorative Background */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-bl-[4rem] group-hover:bg-indigo-500/20 transition-colors duration-500" />
                        <div className="absolute bottom-[-10%] left-[-10%] w-24 h-24 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition-colors" />

                        <div className="flex justify-between items-start w-full relative z-10">
                            <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                                <Moon className="w-5 h-5 fill-current" />
                            </div>
                            {isTracking && (
                                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold uppercase tracking-wider shadow-sm">
                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                                    Sleeping
                                </div>
                            )}
                        </div>

                        <div className="relative z-10">
                            <div className="mb-4">
                                <span className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter block leading-none mb-1">
                                    {isTracking ? 'Zzz...' : (lastNightDuration ? formatDuration(lastNightDuration) : '--h --m')}
                                </span>
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                    {isTracking ? 'Active Session' : 'Last Night'}
                                    <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                                </span>
                            </div>

                            <div className="flex items-center gap-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800/50 px-2 py-1 rounded-lg">
                                    <Zap className="w-3 h-3 text-yellow-500 fill-current" />
                                    {sleepStreak} Day Streak
                                </div>
                                <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800/50 px-2 py-1 rounded-lg">
                                    <Brain className="w-3 h-3 text-purple-500 fill-current" />
                                    {sleepQuality}% Quality
                                </div>
                            </div>
                        </div>
                    </motion.button>
                )}
            </div>

            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 dark:bg-black/80 backdrop-blur-md">
                        <motion.div
                            layoutId="sleep-calculator-card"
                            variants={cardVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-md bg-white dark:bg-[#1A1A1A] rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 relative"
                        >
                            {/* Header */}
                            <div className="p-6 pb-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
                                <div>
                                    <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                                        Sleep Tech <span className="text-indigo-500 text-sm font-bold bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded-md">PRO</span>
                                    </h2>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Recovery & Cycle Optimization</p>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                                >
                                    <X className="w-5 h-5 text-gray-500 group-hover:text-gray-900 dark:group-hover:text-white transition-colors" />
                                </button>
                            </div>

                            {/* Tabs */}
                            <div className="px-6 pt-2 pb-0">
                                <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1.5 rounded-2xl">
                                    {[
                                        { id: 'tracker', icon: Moon, label: 'Tracker' },
                                        { id: 'schedule', icon: AlarmClock, label: 'Schedule' },
                                        { id: 'calculator', icon: Sunrise, label: 'Calculator' }
                                    ].map((tab) => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id as any)}
                                            className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${activeTab === tab.id
                                                ? 'bg-white dark:bg-[#252525] text-indigo-600 dark:text-indigo-400 shadow-md transform scale-[1.02]'
                                                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                                }`}
                                        >
                                            <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'fill-current' : ''}`} />
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="p-6 h-[400px] overflow-y-auto no-scrollbar">
                                <AnimatePresence mode="wait">
                                    {activeTab === 'tracker' && (
                                        <motion.div
                                            key="tracker"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                            className="space-y-6"
                                        >
                                            {/* Main Status Circle */}
                                            <div className="flex justify-center py-4 relative">
                                                {/* Outer Glow */}
                                                <div className={`absolute inset-0 bg-gradient-to-b ${isTracking ? 'from-indigo-500/20 to-purple-500/20' : 'from-gray-200/20 to-gray-200/10'} rounded-full blur-3xl`} />

                                                <div className="w-48 h-48 rounded-full bg-gradient-to-br from-[#F5F5F7] to-[#E8E8E8] dark:from-[#2A2A2A] dark:to-[#1A1A1A] flex items-center justify-center shadow-[inset_0_-8px_12px_rgba(0,0,0,0.1),0_20px_40px_rgba(0,0,0,0.2)] dark:shadow-[inset_0_-8px_12px_rgba(0,0,0,0.3),0_20px_40px_rgba(0,0,0,0.5)] relative z-10 border border-white/50 dark:border-white/5">
                                                    <div className="absolute inset-4 rounded-full border-4 border-indigo-500/10 border-t-indigo-500 animate-[spin_8s_linear_infinite]" />
                                                    <div className="text-center relative z-20">
                                                        <Moon className={`w-8 h-8 mx-auto mb-2 text-indigo-500 ${isTracking ? 'animate-pulse' : ''}`} />
                                                        <span className="text-4xl font-black tracking-tighter block text-gray-900 dark:text-white">
                                                            {isTracking ? 'Active' : (lastNightDuration ? formatDuration(lastNightDuration) : '--:--')}
                                                        </span>
                                                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-1 block">
                                                            {isTracking ? 'Monitoring Sleep' : 'Total Duration'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Stats Grid */}
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="bg-gray-50 dark:bg-[#252525] p-5 rounded-3xl border border-gray-100 dark:border-white/5">
                                                    <div className="flex items-center gap-2 mb-2 text-gray-400 text-[10px] font-bold uppercase tracking-wider">
                                                        <Zap className="w-3 h-3 text-yellow-500" /> Quality
                                                    </div>
                                                    <p className="text-2xl font-black text-gray-900 dark:text-white">
                                                        {sleepQuality}<span className="text-sm text-gray-400 ml-1 font-bold">%</span>
                                                    </p>
                                                </div>
                                                <div className="bg-gray-50 dark:bg-[#252525] p-5 rounded-3xl border border-gray-100 dark:border-white/5">
                                                    <div className="flex items-center gap-2 mb-2 text-gray-400 text-[10px] font-bold uppercase tracking-wider">
                                                        <Brain className="w-3 h-3 text-purple-500" /> Average
                                                    </div>
                                                    <p className="text-2xl font-black text-gray-900 dark:text-white">
                                                        {averageDuration ? formatDuration(averageDuration) : '--h'}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Action Button */}
                                            <button
                                                onClick={isTracking ? wakeUp : startSleep}
                                                className={`w-full py-5 rounded-2xl flex items-center justify-center gap-3 text-sm font-bold text-white transition-all shadow-xl hover:scale-[1.02] active:scale-[0.98] ${isTracking
                                                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500 shadow-orange-500/20'
                                                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 shadow-indigo-500/30'
                                                    }`}
                                            >
                                                {isTracking ? <Sunrise className="w-5 h-5" /> : <Bed className="w-5 h-5" />}
                                                {isTracking ? 'WAKE UP' : 'GO TO SLEEP'}
                                            </button>
                                        </motion.div>
                                    )}

                                    {activeTab === 'schedule' && (
                                        <motion.div
                                            key="schedule"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="space-y-6"
                                        >
                                            <div className="bg-indigo-50 dark:bg-indigo-500/10 p-5 rounded-3xl border border-indigo-100 dark:border-indigo-500/20">
                                                <div className="flex items-start gap-3">
                                                    <div className="p-2.5 bg-white dark:bg-indigo-500/20 rounded-xl shadow-sm text-indigo-600 dark:text-indigo-400">
                                                        <Settings className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-gray-900 dark:text-white text-base">Sleep Schedule</h3>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                                                            Set your target sleep and wake times. We'll remind you to wind down.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                {/* Toggles */}
                                                <div className="flex justify-between items-center bg-gray-50 dark:bg-[#252525] p-5 rounded-3xl border border-gray-100 dark:border-white/5">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`p-2 rounded-full ${localSchedule.bedReminder ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-200 text-gray-500'}`}>
                                                            <Moon className="w-4 h-4" />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-bold text-gray-900 dark:text-white">Bed Reminder</span>
                                                            <span className="text-[10px] text-gray-500 uppercase tracking-wide">30 min before</span>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => setLocalSchedule(s => ({ ...s, bedReminder: !s.bedReminder }))}
                                                        className={`w-12 h-7 rounded-full transition-colors relative ${localSchedule.bedReminder ? 'bg-indigo-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                                                    >
                                                        <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all shadow-sm ${localSchedule.bedReminder ? 'left-6' : 'left-1'}`} />
                                                    </button>
                                                </div>

                                                <div className="flex justify-between items-center bg-gray-50 dark:bg-[#252525] p-5 rounded-3xl border border-gray-100 dark:border-white/5">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`p-2 rounded-full ${localSchedule.wakeUpAlarm ? 'bg-orange-100 text-orange-600' : 'bg-gray-200 text-gray-500'}`}>
                                                            <Bell className="w-4 h-4" />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-bold text-gray-900 dark:text-white">Wake Up Alarm</span>
                                                            <span className="text-[10px] text-gray-500 uppercase tracking-wide">Smart Wake</span>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => setLocalSchedule(s => ({ ...s, wakeUpAlarm: !s.wakeUpAlarm }))}
                                                        className={`w-12 h-7 rounded-full transition-colors relative ${localSchedule.wakeUpAlarm ? 'bg-orange-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                                                    >
                                                        <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all shadow-sm ${localSchedule.wakeUpAlarm ? 'left-6' : 'left-1'}`} />
                                                    </button>
                                                </div>

                                                {/* Time Pickers */}
                                                <div className="grid grid-cols-2 gap-4 mt-4">
                                                    <div className="bg-gray-50 dark:bg-[#252525] p-4 rounded-3xl border border-gray-100 dark:border-white/5">
                                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Sleep Time</label>
                                                        <input
                                                            type="time"
                                                            value={localSchedule.sleepTime}
                                                            onChange={(e) => setLocalSchedule(s => ({ ...s, sleepTime: e.target.value }))}
                                                            className="w-full bg-transparent text-xl font-black text-gray-900 dark:text-white focus:outline-none"
                                                        />
                                                    </div>
                                                    <div className="bg-gray-50 dark:bg-[#252525] p-4 rounded-3xl border border-gray-100 dark:border-white/5">
                                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Wake Time</label>
                                                        <input
                                                            type="time"
                                                            value={localSchedule.wakeTime}
                                                            onChange={(e) => setLocalSchedule(s => ({ ...s, wakeTime: e.target.value }))}
                                                            className="w-full bg-transparent text-xl font-black text-gray-900 dark:text-white focus:outline-none"
                                                        />
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={handleSaveSchedule}
                                                    className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-bold mt-4 shadow-lg hover:shadow-xl transition-all active:scale-95"
                                                >
                                                    Save Settings
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}

                                    {activeTab === 'calculator' && (
                                        <motion.div
                                            key="calculator"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="space-y-6"
                                        >
                                            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-3xl text-white shadow-lg shadow-indigo-500/20">
                                                <label className="text-xs font-bold text-indigo-100 uppercase tracking-widest flex items-center gap-2 mb-3">
                                                    <Sunrise className="w-4 h-4" /> I want to wake up at
                                                </label>
                                                <div className="flex items-center gap-4">
                                                    <input
                                                        type="time"
                                                        value={calcWakeTime}
                                                        onChange={(e) => setCalcWakeTime(e.target.value)}
                                                        className="bg-white/10 text-5xl font-black text-white focus:outline-none rounded-xl px-2 py-1 w-full backdrop-blur-sm border border-white/20"
                                                    />
                                                </div>
                                                <p className="text-xs text-indigo-100 mt-4 leading-relaxed opacity-80">
                                                    Cycles are calculated typically around 90 minutes. Waking up at the end of a cycle makes you feel refreshed.
                                                </p>
                                            </div>

                                            <div className="space-y-3">
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">Best times to fall asleep</p>
                                                {recommendedBedtimes.map((rec, i) => (
                                                    <motion.div
                                                        key={i}
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: i * 0.1 }}
                                                        className={`flex items-center justify-between p-4 rounded-2xl transition-all border ${rec.cycles === 5 || rec.cycles === 6
                                                            ? 'bg-white dark:bg-[#252525] border-indigo-500 shadow-lg shadow-indigo-500/10 scale-[1.02] ring-1 ring-indigo-500/20'
                                                            : 'bg-gray-50 dark:bg-[#202020] border-transparent text-gray-500'
                                                            }`}
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${rec.cycles >= 5 ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400' : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                                                                }`}>
                                                                {rec.cycles}
                                                            </div>
                                                            <div>
                                                                <span className={`text-xl font-black block ${rec.cycles >= 5 ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-900 dark:text-gray-300'}`}>
                                                                    {rec.time}
                                                                </span>
                                                                <span className="text-[10px] font-bold opacity-60 uppercase tracking-wide">Cycles</span>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className="text-xs font-bold opacity-80 block">{formatDuration(rec.hours)}</span>
                                                            <span className="text-[10px] uppercase font-bold tracking-wider opacity-60">Sleep</span>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};

export default SleepCalculator;
