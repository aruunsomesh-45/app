
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, LayoutGrid } from 'lucide-react';
import TimeWidget from './board/TimeWidget';
import WeatherWidget from './board/WeatherWidget';
import TodoWidget from './board/TodoWidget';
import NotesWidget from './board/NotesWidget';
import TimerWidget from './board/TimerWidget';
import StatsWidget from './board/StatsWidget';
import SearchWidget from './board/SearchWidget';
import NewsWidget from './board/NewsWidget';

const PersonalBoard: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#0a0a0a] font-sans text-gray-100 pb-20">
            {/* Simple Premium Header */}
            <div className="relative w-full pt-12 pb-8 px-6">
                <div className="max-w-2xl mx-auto relative">
                    {/* Back Button */}
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="w-10 h-10 rounded-full bg-white/5 backdrop-blur-md flex items-center justify-center border border-white/10 hover:bg-white/10 transition-colors mb-8"
                    >
                        <ArrowLeft className="w-5 h-5 text-white" />
                    </button>

                    <h1 className="text-4xl font-black tracking-tight flex items-center gap-3 text-white">
                        My Board <LayoutGrid className="w-8 h-8 text-blue-500/50" />
                    </h1>
                    <p className="text-base font-medium text-gray-400 mt-2">Personal Command Center</p>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 relative z-10">
                {/* Bento Grid - Using CSS Grid for STRICT 50/50 alignment */}
                <div
                    className="grid gap-4"
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
                        gridAutoRows: 'auto',
                    }}
                >

                    {/* Row 1: Time (full width) */}
                    <div
                        style={{ gridColumn: '1 / -1', height: '140px' }}
                    >
                        <TimeWidget />
                    </div>

                    {/* Row 2: Weather + Timer - STRICT 50/50 */}
                    <div
                        style={{ height: '180px', minWidth: 0, overflow: 'hidden' }}
                    >
                        <WeatherWidget />
                    </div>
                    <div
                        style={{ height: '180px', minWidth: 0, overflow: 'hidden' }}
                    >
                        <TimerWidget />
                    </div>

                    {/* Row 3: Web Search + Skim News - STRICT 50/50 */}
                    <div
                        style={{ height: '200px', minWidth: 0, overflow: 'hidden' }}
                    >
                        <SearchWidget />
                    </div>
                    <div
                        style={{ height: '200px', minWidth: 0, overflow: 'hidden' }}
                    >
                        <NewsWidget />
                    </div>

                    {/* Row 4: Todo (full width) */}
                    <div
                        style={{ gridColumn: '1 / -1', height: '260px' }}
                    >
                        <TodoWidget />
                    </div>

                    {/* Row 5: Stats */}
                    <div
                        style={{ gridColumn: '1 / -1', height: '180px' }}
                    >
                        <StatsWidget />
                    </div>

                    {/* Row 6: Notes */}
                    <div
                        style={{ gridColumn: '1 / -1', height: '160px' }}
                    >
                        <NotesWidget />
                    </div>

                </div>
            </div>
        </div>
    );
};

export default PersonalBoard;
