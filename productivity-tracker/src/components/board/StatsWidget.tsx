
import React from 'react';
import { Activity } from 'lucide-react';

const StatsWidget: React.FC = () => {
    return (
        <div className="bg-white/90 dark:bg-[#252525]/90 backdrop-blur-md rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-[#333] h-full flex flex-col justify-between group hover:shadow-md transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                    <Activity className="w-5 h-5 text-purple-500 dark:text-purple-400" />
                </div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Weekly</span>
            </div>

            <div className="space-y-4">
                <div className="flex justify-between items-end">
                    <div>
                        <p className="text-3xl font-black text-gray-800 dark:text-white">85%</p>
                        <p className="text-xs text-gray-500 font-medium">Goal Completion</p>
                    </div>
                </div>

                <div className="h-16 flex items-end justify-between gap-1">
                    {[45, 75, 55, 85, 60, 90, 70].map((h, i) => (
                        <div key={i} className="w-full bg-gray-100 dark:bg-[#333] rounded-t-sm relative overflow-hidden group/bar">
                            <div
                                style={{ height: `${h}%` }}
                                className={`absolute bottom-0 w-full rounded-t-sm transition-all duration-500 ${i === 6 ? 'bg-purple-500' : 'bg-gray-300 dark:bg-gray-600 group-hover/bar:bg-purple-400'}`}
                            ></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default StatsWidget;
