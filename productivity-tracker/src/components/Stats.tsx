import React, { useState } from 'react';
import {
    Moon, Sun, Bell, User,
    Brain, Zap, CheckCircle2, Clock
} from 'lucide-react';
import { useLifeTracker } from '../utils/lifeTrackerStore';

// --- Components ---

const StatCard = ({ label, value, progress, icon: Icon }: { label: string, value: string, progress: number, icon?: any }) => (
    <div className={`p-5 rounded-[1.5rem] flex flex-col justify-between h-36 relative overflow-hidden transition-all duration-300 group hover:scale-[1.02] ${label === 'Focus Hours' ? 'bg-black text-white' : 'bg-white text-gray-900 border border-gray-100 shadow-sm'}`}>
        <div className="flex justify-between items-start">
            <div>
                <h3 className={`text-4xl font-bold tracking-tight mb-1 ${label === 'Focus Hours' ? 'text-white' : 'text-gray-900'}`}>{value}</h3>
                <p className={`text-xs font-medium ${label === 'Focus Hours' ? 'text-gray-400' : 'text-gray-500'}`}>{label}</p>
            </div>
            {Icon && <Icon className={`w-5 h-5 ${label === 'Focus Hours' ? 'text-gray-400' : 'text-gray-400'}`} />}
        </div>

        <div className="w-full">
            <div className="flex justify-between text-[10px] font-medium mb-1 opacity-60">
                <span>0%</span>
                <span>{progress}%</span>
            </div>
            <div className={`h-1.5 w-full rounded-full ${label === 'Focus Hours' ? 'bg-gray-800' : 'bg-gray-100'}`}>
                <div
                    className={`h-full rounded-full ${label === 'Focus Hours' ? 'bg-white' : 'bg-black'} opacity-80`}
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
        </div>
    </div>
);

const ChartToggle = () => (
    <div className="flex items-center bg-gray-100 rounded-full p-1">
        {['Monthly', 'Weekly', 'Today'].map((t) => (
            <button
                key={t}
                className={`text-[10px] font-bold px-3 py-1.5 rounded-full transition-all ${t === 'Weekly' ? 'bg-black text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
            >
                {t}
            </button>
        ))}
    </div>
);

const BarChartMock = () => (
    <div className="h-40 flex items-end justify-between gap-3 px-2 mt-6">
        {[30, 65, 45, 80, 55, 70, 40].map((h, i) => (
            <div key={i} className="flex flex-col items-center gap-2 w-full group cursor-pointer">
                <div
                    className={`w-full max-w-[12px] rounded-full transition-all duration-300 ${i === 3 ? 'bg-black' : 'bg-gray-200 group-hover:bg-gray-300'}`}
                    style={{ height: `${h}%` }}
                ></div>
                <span className="text-[10px] text-gray-400 font-bold">{['S', 'M', 'T', 'W', 'T', 'F', 'S'][i]}</span>
            </div>
        ))}
    </div>
);

const AreaChartMock = () => (
    <div className="h-48 relative mt-4 group">
        <svg viewBox="0 0 100 50" className="w-full h-full overflow-visible" preserveAspectRatio="none">
            {/* Grid lines */}
            <line x1="0" y1="10" x2="100" y2="10" stroke="#f3f4f6" strokeWidth="0.5" />
            <line x1="0" y1="25" x2="100" y2="25" stroke="#f3f4f6" strokeWidth="0.5" />
            <line x1="0" y1="40" x2="100" y2="40" stroke="#f3f4f6" strokeWidth="0.5" />

            {/* Area Path */}
            <path
                d="M0,50 L0,35 Q20,32 30,38 T60,20 T100,10 V50 Z"
                fill="url(#gradient)"
                className="transition-all duration-500"
            />
            {/* Line Path */}
            <path
                d="M0,35 Q20,32 30,38 T60,20 T100,10"
                fill="none"
                stroke="black"
                strokeWidth="0.8"
                vectorEffect="non-scaling-stroke"
            />

            <defs>
                <linearGradient id="gradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#000" stopOpacity="0.1" />
                    <stop offset="100%" stopColor="#000" stopOpacity="0" />
                </linearGradient>
            </defs>

            {/* Active Point */}
            <circle cx="100" cy="10" r="1.5" fill="white" stroke="black" strokeWidth="0.5" />
        </svg>

        {/* Y-Axis Labels */}
        <div className="absolute top-0 left-0 h-full flex flex-col justify-between text-[8px] text-gray-400 font-bold pointer-events-none -translate-x-4">
            <span>20k</span>
            <span>15k</span>
            <span>10k</span>
            <span>0</span>
        </div>
    </div>
);


// --- Helper Components Removed ---


const Stats: React.FC = () => {
    const [activeTab, setActiveTab] = useState('Overview');
    const [isDarkMode, setIsDarkMode] = useState(false);

    const store = useLifeTracker();
    const state = store.getState();
    const overview = store.getDashboardStats();
    const { userProfile, dailyTasks } = state;

    // Calculate metrics
    // Using meditation minutes as a proxy for focus for now since other modules don't track raw time
    const totalFocusMinutes = overview.meditation.weekMinutes;
    const totalFocusHours = (totalFocusMinutes / 60).toFixed(1);

    // Calculate progress for life score (assuming 100 max)
    const lifeScoreProgress = Math.min(overview.lifeScore, 100);

    // Calculate task completion rate
    const taskCompletionRate = overview.tasks.total > 0
        ? Math.round((overview.tasks.completed / overview.tasks.total) * 100)
        : 0;

    const statsCards = [
        { label: 'Focus Hours', value: totalFocusHours, progress: Math.round(Math.min((totalFocusMinutes / (8 * 60)) * 100, 100)), icon: Clock },
        { label: 'Tasks Done', value: overview.tasks.completed.toString(), progress: taskCompletionRate, icon: CheckCircle2 },
        { label: 'Life Score', value: overview.lifeScore.toString(), progress: lifeScoreProgress, icon: Zap },
        { label: 'Active Streaks', value: overview.activeStreaks.length.toString(), progress: Math.round((overview.activeStreaks.length / 3) * 100), icon: Brain },
    ];

    return (
        <div className={`min-h-screen pb-24 font-sans transition-colors duration-500 ${isDarkMode ? 'bg-[#111] text-white' : 'bg-[#FAFAFA] text-gray-900'}`}>

            {/* Header */}
            <header className={`sticky top-0 z-40 px-6 py-4 flex items-center justify-between backdrop-blur-xl ${isDarkMode ? 'bg-[#111]/90 border-gray-800' : 'bg-[#FAFAFA]/90 border-gray-100'} border-b`}>
                <div className="flex items-center gap-2">
                    <User className="w-8 h-8 p-1.5 bg-gray-200 rounded-full text-gray-600" />
                    <div>
                        <h1 className="text-lg font-bold leading-tight">Analytics</h1>
                        <p className="text-[10px] font-semibold text-gray-400">Welcome back, {userProfile.firstName || 'User'}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsDarkMode(!isDarkMode)}
                        className={`p-2 rounded-full transition-colors ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-600 shadow-sm border border-gray-100'}`}
                    >
                        {isDarkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                    </button>
                    <button className={`p-2 rounded-full transition-colors ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-600 shadow-sm border border-gray-100'}`}>
                        <Bell className="w-4 h-4" />
                    </button>
                </div>
            </header>

            {/* Inner Content Tabs with Segmented Control vibe */}
            <div className="px-6 py-4">
                <div className={`flex p-1 rounded-2xl mb-6 ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100 shadow-sm border'}`}>
                    {['Overview', 'Analytics', 'Wallets', 'Review'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all duration-300 ${activeTab === tab ? (isDarkMode ? 'bg-gray-800 text-white' : 'bg-black text-white shadow-lg shadow-black/20') : 'text-gray-400'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {activeTab === 'Overview' && (
                    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 fade-in">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-3">
                            {statsCards.map((stat, i) => (
                                <StatCard key={i} {...stat} />
                            ))}
                        </div>

                        {/* Revenue Chart */}
                        <div className={`p-5 rounded-[1.5rem] ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border border-gray-100 shadow-sm'}`}>
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-bold text-sm">Productivity Trend</h3>
                                <ChartToggle />
                            </div>
                            <AreaChartMock />
                        </div>

                        {/* Order List */}
                        <div className={`p-5 rounded-[1.5rem] ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border border-gray-100 shadow-sm'}`}>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-sm">Today's Tasks</h3>
                                <div className="text-xs font-bold text-gray-400">{dailyTasks.length} tasks</div>
                            </div>
                            <div className="flex flex-col gap-1">
                                {dailyTasks.length > 0 ? dailyTasks.slice(0, 5).map(task => (
                                    <div key={task.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 rounded-xl px-2 transition-colors -mx-2">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${task.completed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                                                <CheckCircle2 className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <h4 className={`text-sm font-bold ${task.completed ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{task.title}</h4>
                                                <p className="text-[10px] text-gray-400 font-medium">{task.category}</p>
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center py-6 text-gray-400 text-xs italic">No tasks for today yet.</div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'Analytics' && (
                    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 fade-in">
                        {/* Chart: Orders */}
                        <div className={`p-5 rounded-[1.5rem] ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border border-gray-100 shadow-sm'}`}>
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="font-bold text-sm">Life Score History</h3>
                                    <div className="flex items-center gap-4 mt-2">
                                        <div>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase">Total Score</p>
                                            <p className="text-xl font-black">{overview.lifeScore}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase">Avg. Score</p>
                                            <p className="text-xl font-black">--</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <ChartToggle />
                                    <div className="p-1 px-2 bg-green-50 text-green-600 rounded-lg text-[10px] font-bold">+12% vs last week</div>
                                </div>
                            </div>
                            <AreaChartMock /> {/* Reusing area chart for now as visual placeholder, distinct from Bar */}
                        </div>

                        <div className={`p-5 rounded-[1.5rem] ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border border-gray-100 shadow-sm'}`}>
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-bold text-sm">Activity Frequency</h3>
                                <ChartToggle />
                            </div>
                            <BarChartMock />
                        </div>


                        {/* Trending Items */}
                        <div className={`p-5 rounded-[1.5rem] ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border border-gray-100 shadow-sm'}`}>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-sm">Active Streaks</h3>
                                <div className="bg-gray-100 rounded-lg p-1">
                                    <Zap className="w-4 h-4 text-gray-500" />
                                </div>
                            </div>
                            <div className="flex flex-col gap-1">
                                {overview.activeStreaks.length > 0 ? overview.activeStreaks.map((streak: any, i: number) => (
                                    <div key={i} className="flex items-center justify-between py-4 border-b border-gray-50 last:border-0">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
                                                <Zap className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-gray-900">{streak.name}</h4>
                                                <p className="text-[10px] text-gray-400 font-medium">Consistent Habit</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-sm">{streak.count} Days</div>
                                            <div className="text-[10px] font-bold text-green-500 flex items-center justify-end gap-0.5">
                                                Keep it up!
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center py-6 text-gray-400 text-xs italic">No active streaks. Start building one today!</div>
                                )}

                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Simulated Inner Navigation (Visual Only, since we have main app nav) 
                User requested "Bottom navigation bar". 
                The main app has one. I added inner tabs at TOP for this section to be distinct.
            */}
        </div>
    );
};

export default Stats;
