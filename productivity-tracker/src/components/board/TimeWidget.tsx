
import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

const TimeWidget: React.FC = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
    };

    return (
        <div className="bg-white/90 dark:bg-[#252525]/90 backdrop-blur-md rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-[#333] flex flex-col justify-between h-full group hover:shadow-md transition-all duration-300">
            <div className="flex justify-between items-start">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                    <Clock className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                </div>
            </div>
            <div>
                <h2 className="text-4xl font-bold text-gray-800 dark:text-white tracking-tight">
                    {formatTime(time)}
                </h2>
                <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">
                    {formatDate(time)}
                </p>
            </div>
        </div>
    );
};

export default TimeWidget;
