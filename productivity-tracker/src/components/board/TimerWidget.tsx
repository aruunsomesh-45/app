
import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Timer } from 'lucide-react';

const TimerWidget: React.FC = () => {
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);
    const [mode, setMode] = useState<'focus' | 'break'>('focus');

    useEffect(() => {
        let interval: ReturnType<typeof setInterval> | null = null;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(time => {
                    if (time <= 1) {
                        setIsActive(false);
                        return 0;
                    }
                    return time - 1;
                });
            }, 1000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isActive, timeLeft]);

    const toggleTimer = () => setIsActive(!isActive);

    const resetTimer = () => {
        setIsActive(false);
        setTimeLeft(mode === 'focus' ? 25 * 60 : 5 * 60);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const switchMode = () => {
        const newMode = mode === 'focus' ? 'break' : 'focus';
        setMode(newMode);
        setIsActive(false);
        setTimeLeft(newMode === 'focus' ? 25 * 60 : 5 * 60);
    };

    return (
        <div className="bg-white/90 dark:bg-[#252525]/90 backdrop-blur-md rounded-3xl p-4 shadow-sm border border-gray-100 dark:border-[#333] h-full overflow-hidden">
            {/* Use CSS Grid for proper alignment */}
            <div className="h-full grid grid-rows-[auto_1fr_auto] gap-1">
                {/* Header Row */}
                <div className="flex justify-between items-center">
                    <div className="p-1.5 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <Timer className="w-4 h-4 text-red-500 dark:text-red-400" />
                    </div>
                    <button
                        onClick={switchMode}
                        className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                    >
                        {mode === 'focus' ? 'Focus' : 'Break'}
                    </button>
                </div>

                {/* Timer Display - Centered */}
                <div className="flex items-center justify-center">
                    <div className="text-4xl font-black text-gray-800 dark:text-white tabular-nums tracking-tighter">
                        {formatTime(timeLeft)}
                    </div>
                </div>

                {/* Control Buttons - Always at bottom */}
                <div className="flex justify-center gap-3">
                    <button
                        onClick={toggleTimer}
                        className="w-10 h-10 rounded-full bg-gray-900 dark:bg-white text-white dark:text-black flex items-center justify-center hover:scale-105 transition-transform"
                    >
                        {isActive ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                    </button>
                    <button
                        onClick={resetTimer}
                        className="w-10 h-10 rounded-full bg-gray-100 dark:bg-[#333] text-gray-600 dark:text-gray-300 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-[#444] transition-colors"
                    >
                        <RotateCcw className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TimerWidget;
