import React from 'react';
import { Rocket, TrendingUp, CheckCircle2 } from 'lucide-react';
import type { TrackType } from './types';

interface TrackSelectorProps {
    currentTrack: TrackType;
    onSelectTrack: (track: TrackType) => void;
}

export const TrackSelector: React.FC<TrackSelectorProps> = ({ currentTrack, onSelectTrack }) => {
    return (
        <div className="grid grid-cols-1 gap-6 mb-8">
            {/* Startup Track Card */}
            <div
                onClick={() => onSelectTrack('startup')}
                className={`relative p-6 rounded-2xl cursor-pointer transition-all duration-300 border-2 overflow-hidden group
          ${currentTrack === 'startup'
                        ? 'bg-blue-600/10 border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.2)]'
                        : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
                    }`}
            >
                <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl ${currentTrack === 'startup' ? 'bg-blue-500 text-white' : 'bg-white/10 text-gray-400'}`}>
                        <Rocket size={24} />
                    </div>
                    {currentTrack === 'startup' && (
                        <div className="bg-blue-500 p-1 rounded-full">
                            <CheckCircle2 size={16} className="text-white" />
                        </div>
                    )}
                </div>

                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">Start a Startup</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                    From idea to IPO. Learn validation, MVP building, fundraising, and scaling your business.
                </p>

                {/* Background Gradient Effect */}
                <div className={`absolute -right-10 -bottom-10 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl transition-opacity duration-500
          ${currentTrack === 'startup' ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`}
                />
            </div>

            {/* Stock Market Track Card */}
            <div
                onClick={() => onSelectTrack('stocks')}
                className={`relative p-6 rounded-2xl cursor-pointer transition-all duration-300 border-2 overflow-hidden group
          ${currentTrack === 'stocks'
                        ? 'bg-green-600/10 border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.2)]'
                        : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
                    }`}
            >
                <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl ${currentTrack === 'stocks' ? 'bg-green-500 text-white' : 'bg-white/10 text-gray-400'}`}>
                        <TrendingUp size={24} />
                    </div>
                    {currentTrack === 'stocks' && (
                        <div className="bg-green-500 p-1 rounded-full">
                            <CheckCircle2 size={16} className="text-white" />
                        </div>
                    )}
                </div>

                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-green-400 transition-colors">Stock Market Basics</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                    Master the markets. Understand ETFs, dividends, chart reading, and long-term wealth building.
                </p>

                {/* Background Gradient Effect */}
                <div className={`absolute -right-10 -bottom-10 w-32 h-32 bg-green-500/20 rounded-full blur-3xl transition-opacity duration-500
          ${currentTrack === 'stocks' ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`}
                />
            </div>
        </div>
    );
};
