import React, { useState } from 'react';

import { Activity, Calendar } from 'lucide-react';

const StatsCard = ({ title, value, subtext }: { title: string, value: string, subtext: string }) => (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-2">
        <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">{title}</h3>
        <p className="text-2xl font-black text-gray-900">{value}</p>
        <p className="text-xs text-gray-400 font-medium">{subtext}</p>
    </div>
);

const Stats: React.FC = () => {

    const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'monthly'>('daily');

    const renderContent = () => {
        switch (activeTab) {
            case 'daily':
                return (
                    <div className="grid grid-cols-2 gap-4">
                        <StatsCard title="Workouts" value="2" subtext="Sessions completed" />
                        <StatsCard title="Duration" value="90m" subtext="Total time" />
                        <div className="col-span-2 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-4">Today's Focus</h3>
                            <div className="h-32 flex items-end justify-between px-2 gap-2">
                                {/* Pseudochart */}
                                {[40, 70, 50, 90, 60, 80].map((h, i) => (
                                    <div key={i} className="w-full bg-black/5 rounded-t-md relative group">
                                        <div style={{ height: `${h}%` }} className="absolute bottom-0 w-full bg-black rounded-t-md transition-all hover:bg-[#b4f835]"></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            case 'weekly':
                return (
                    <div className="flex flex-col gap-4">
                        <div className="bg-black text-white p-6 rounded-3xl shadow-lg relative overflow-hidden">
                            <div className="relative z-10">
                                <h3 className="text-white/60 text-xs font-bold uppercase tracking-wider">Weekly Volume</h3>
                                <p className="text-4xl font-black mt-2">12,450 <span className="text-lg font-medium text-white/50">lbs</span></p>
                            </div>
                            <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-gradient-to-l from-[#b4f835]/20 to-transparent"></div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <StatsCard title="Frequency" value="5" subtext="Days active" />
                            <StatsCard title="Best Streak" value="6" subtext="Days in a row" />
                        </div>
                    </div>
                );
            case 'monthly':
                return (
                    <div className="flex flex-col gap-4">
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-gray-900 font-black text-lg">Activity Log</h3>
                                <Calendar className="w-5 h-5 text-gray-400" />
                            </div>
                            <div className="grid grid-cols-7 gap-2">
                                {Array.from({ length: 30 }).map((_, i) => (
                                    <div key={i} className={`aspect-square rounded-lg flex items-center justify-center text-[10px] font-bold ${[1, 5, 8, 12, 15, 20, 22, 25, 28].includes(i) ? 'bg-[#b4f835] text-black' : 'bg-gray-50 text-gray-300'}`}>
                                        {i + 1}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <StatsCard title="Total Workouts" value="24" subtext="This month" />
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-[#F8F9FA] pb-24 font-sans">
            <header className="sticky top-0 z-40 bg-[#F8F9FA]/80 backdrop-blur-xl border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                <h1 className="text-2xl font-black text-[#1a1a1a] tracking-tight">Statistics</h1>
                <button className="bg-white p-2 rounded-full border border-gray-100 shadow-sm">
                    <Activity className="w-5 h-5 text-black" />
                </button>
            </header>

            <div className="px-6 py-4">
                <div className="flex p-1 bg-white rounded-2xl border border-gray-100 shadow-sm mb-6">
                    {(['daily', 'weekly', 'monthly'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${activeTab === tab ? 'bg-black text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {renderContent()}
            </div>
        </div>
    );
};

export default Stats;
