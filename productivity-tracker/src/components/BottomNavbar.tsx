import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Dumbbell, BarChart2, User, StickyNote, Target } from 'lucide-react';

interface BottomNavbarProps {
    onOpenScratchpad: () => void;
}

const BottomNavbar: React.FC<BottomNavbarProps> = ({ onOpenScratchpad }) => {
    const navigate = useNavigate();
    const location = useLocation();

    // Hide navbar on login/welcome page
    if (location.pathname === '/') {
        return null;
    }



    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-center w-full pointer-events-none">
            <div className="w-full max-w-md bg-white dark:bg-[#1A1A1A] border-t border-gray-100 dark:border-[#333333] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] flex items-center justify-around px-2 pb-2 pt-2 pointer-events-auto transition-colors duration-500">
                <button
                    onClick={() => navigate('/dashboard')}
                    className={`p-2 flex flex-col items-center transition-colors ${location.pathname === '/dashboard' || location.pathname === '/' ? 'text-primary' : 'text-gray-400 hover:text-gray-900'}`}
                >
                    <Home className="w-6 h-6" />
                    <span className="text-[10px] font-medium mt-0.5">Home</span>
                </button>

                <button
                    onClick={() => navigate('/section/workout')}
                    className={`p-2 flex flex-col items-center transition-colors ${location.pathname.includes('workout') ? 'text-[#8b5cf6]' : 'text-gray-400 hover:text-gray-900'}`}
                >
                    <Dumbbell className="w-6 h-6" />
                    <span className="text-[10px] font-medium mt-0.5">Workouts</span>
                </button>

                {/* Scratchpad Trigger - Aligned */}
                <button
                    onClick={onOpenScratchpad}
                    className="p-2 flex flex-col items-center transition-colors text-gray-400 hover:text-gray-900"
                >
                    <StickyNote className="w-6 h-6" />
                    <span className="text-[10px] font-medium mt-0.5">Note</span>
                </button>

                <button
                    onClick={() => navigate('/stats')}
                    className={`p-2 flex flex-col items-center transition-colors ${location.pathname === '/stats' ? 'text-primary' : 'text-gray-400 hover:text-gray-900'}`}
                >
                    <BarChart2 className="w-6 h-6" />
                    <span className="text-[10px] font-medium mt-0.5">Stats</span>
                </button>

                <button
                    onClick={() => navigate('/planner')}
                    className={`p-2 flex flex-col items-center transition-colors ${location.pathname === '/planner' ? 'text-[#f59e0b]' : 'text-gray-400 hover:text-gray-900'}`}
                >
                    <Target className="w-6 h-6" />
                    <span className="text-[10px] font-medium mt-0.5">Planner</span>
                </button>

                <button
                    onClick={() => navigate('/profile')}
                    className={`p-2 flex flex-col items-center transition-colors ${location.pathname === '/profile' ? 'text-[#847777]' : 'text-gray-400 hover:text-gray-900'}`}
                >
                    <User className="w-6 h-6" />
                    <span className="text-[10px] font-medium mt-0.5">Profile</span>
                </button>
            </div>
        </nav>
    );
};

export default BottomNavbar;
