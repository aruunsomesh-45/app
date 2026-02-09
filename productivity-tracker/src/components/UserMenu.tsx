import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import {
    User,
    LogOut,
    Settings,
    Shield,
    ChevronDown,
    Crown,
    Mail,
    Loader2
} from 'lucide-react';

interface UserMenuProps {
    className?: string;
}

const UserMenu: React.FC<UserMenuProps> = ({ className = '' }) => {
    const { user, isAdmin, isAuthenticated, loading, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);
    const navigate = useNavigate();

    const handleLogout = async () => {
        setLoggingOut(true);
        await logout();
        setIsOpen(false);
        setLoggingOut(false);
        navigate('/');
    };

    if (loading) {
        return (
            <div className={`flex items-center gap-2 px-3 py-2 ${className}`}>
                <Loader2 size={18} className="animate-spin text-gray-400" />
            </div>
        );
    }

    if (!isAuthenticated || !user) {
        return (
            <div className={`flex items-center gap-2 ${className}`}>
                <button
                    onClick={() => navigate('/login')}
                    className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors"
                >
                    Log In
                </button>
                <button
                    onClick={() => navigate('/signup')}
                    className="px-4 py-2 text-sm font-bold bg-black dark:bg-white text-white dark:text-black rounded-full hover:opacity-80 transition-opacity"
                >
                    Sign Up
                </button>
            </div>
        );
    }

    return (
        <div className={`relative ${className}`}>
            {/* User Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 px-3 py-2 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
                {/* Avatar */}
                <div className={`w-9 h-9 rounded-full flex items-center justify-center ${isAdmin
                        ? 'bg-gradient-to-br from-purple-500 to-pink-500'
                        : 'bg-gradient-to-br from-gray-400 to-gray-600'
                    }`}>
                    {user.photoURL ? (
                        <img
                            src={user.photoURL}
                            alt={user.displayName || 'User'}
                            className="w-full h-full rounded-full object-cover"
                        />
                    ) : isAdmin ? (
                        <Crown size={18} className="text-white" />
                    ) : (
                        <User size={18} className="text-white" />
                    )}
                </div>

                {/* Name & Role */}
                <div className="hidden sm:block text-left">
                    <div className="text-sm font-bold text-black dark:text-white truncate max-w-[120px]">
                        {user.displayName || user.email?.split('@')[0] || 'User'}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        {isAdmin ? (
                            <>
                                <Shield size={10} className="text-purple-500" />
                                <span className="text-purple-500">Admin</span>
                            </>
                        ) : (
                            <span>Member</span>
                        )}
                    </div>
                </div>

                <ChevronDown
                    size={16}
                    className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsOpen(false)}
                        />

                        <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            transition={{ duration: 0.15 }}
                            className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50"
                        >
                            {/* User Info Header */}
                            <div className="px-4 py-4 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                                <div className="flex items-center gap-3">
                                    <div className={`w-11 h-11 rounded-full flex items-center justify-center ${isAdmin
                                            ? 'bg-gradient-to-br from-purple-500 to-pink-500'
                                            : 'bg-gradient-to-br from-gray-400 to-gray-600'
                                        }`}>
                                        {user.photoURL ? (
                                            <img
                                                src={user.photoURL}
                                                alt={user.displayName || 'User'}
                                                className="w-full h-full rounded-full object-cover"
                                            />
                                        ) : isAdmin ? (
                                            <Crown size={20} className="text-white" />
                                        ) : (
                                            <User size={20} className="text-white" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-bold text-black dark:text-white truncate">
                                            {user.displayName || 'User'}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 truncate">
                                            <Mail size={10} />
                                            {user.email}
                                        </div>
                                    </div>
                                </div>
                                {isAdmin && (
                                    <div className="mt-3 flex items-center gap-1.5 px-2 py-1 bg-purple-100 dark:bg-purple-900/30 rounded-lg w-fit">
                                        <Shield size={12} className="text-purple-600 dark:text-purple-400" />
                                        <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                                            Administrator
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Menu Items */}
                            <div className="py-2">
                                <button
                                    onClick={() => { navigate('/profile'); setIsOpen(false); }}
                                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                                >
                                    <Settings size={18} className="text-gray-400" />
                                    <span className="text-sm text-black dark:text-white">Settings</span>
                                </button>

                                {isAdmin && (
                                    <button
                                        onClick={() => { navigate('/admin/users'); setIsOpen(false); }}
                                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                                    >
                                        <Shield size={18} className="text-purple-500" />
                                        <span className="text-sm text-black dark:text-white">User Management</span>
                                        <span className="ml-auto text-[10px] font-bold uppercase tracking-wider bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-full">
                                            Admin
                                        </span>
                                    </button>
                                )}

                                <div className="my-2 border-t border-gray-100 dark:border-gray-700" />

                                <button
                                    onClick={handleLogout}
                                    disabled={loggingOut}
                                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left"
                                >
                                    {loggingOut ? (
                                        <Loader2 size={18} className="animate-spin text-red-500" />
                                    ) : (
                                        <LogOut size={18} className="text-red-500" />
                                    )}
                                    <span className="text-sm text-red-500 font-medium">Sign Out</span>
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default UserMenu;
