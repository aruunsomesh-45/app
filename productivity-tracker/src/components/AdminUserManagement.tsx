import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';
import type { UserListItem, UserRole } from '../types/auth';
import {
    MoveLeft,
    Users,
    Shield,
    ShieldCheck,
    User,
    Mail,
    Calendar,
    Clock,
    Search,
    Filter,
    MoreVertical,
    UserCheck,
    UserX,
    Loader2,
    RefreshCw,
    Crown
} from 'lucide-react';

const AdminUserManagement: React.FC = () => {
    const navigate = useNavigate();
    const { user, isAdmin } = useAuth();
    const [users, setUsers] = useState<UserListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterRole, setFilterRole] = useState<'all' | UserRole>('all');
    const [activeMenu, setActiveMenu] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    useEffect(() => {
        if (!isAdmin) {
            navigate('/dashboard');
            return;
        }
        loadUsers();
    }, [isAdmin, navigate]);

    const loadUsers = async () => {
        setLoading(true);
        const userList = await authService.getAllUsers();
        setUsers(userList);
        setLoading(false);
    };

    const handleRoleChange = async (uid: string, newRole: UserRole) => {
        setActionLoading(uid);
        const success = await authService.updateUserRole(uid, newRole);
        if (success) {
            setUsers(prev => prev.map(u => u.uid === uid ? { ...u, role: newRole } : u));
        }
        setActionLoading(null);
        setActiveMenu(null);
    };

    const handleToggleStatus = async (uid: string, currentStatus: boolean) => {
        setActionLoading(uid);
        const success = await authService.toggleUserStatus(uid, !currentStatus);
        if (success) {
            setUsers(prev => prev.map(u => u.uid === uid ? { ...u, isActive: !currentStatus } : u));
        }
        setActionLoading(null);
        setActiveMenu(null);
    };

    const filteredUsers = users.filter(u => {
        const matchesSearch = searchQuery === '' ||
            u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.displayName?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = filterRole === 'all' || u.role === filterRole;
        return matchesSearch && matchesRole;
    });

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatTime = (date: Date) => {
        return new Date(date).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (!isAdmin) {
        return null;
    }

    return (
        <div className="flex flex-col h-screen bg-white dark:bg-[#1A1A1A] font-sans overflow-hidden">
            {/* Header */}
            <div className="pt-12 px-6 pb-4 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                    >
                        <MoveLeft size={24} className="text-black dark:text-white" />
                    </button>
                    <div className="flex items-center gap-2">
                        <Shield size={20} className="text-purple-500" />
                        <h2 className="text-sm font-bold tracking-[0.2em] uppercase text-black/40 dark:text-white/40">
                            Admin Panel
                        </h2>
                    </div>
                    <button
                        onClick={loadUsers}
                        disabled={loading}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                    >
                        <RefreshCw size={20} className={`text-gray-500 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                <div className="flex items-center gap-3 mb-4">
                    <Users size={28} className="text-purple-500" />
                    <div>
                        <h1 className="text-2xl font-serif text-black dark:text-white" style={{ fontFamily: "Georgia, serif" }}>
                            User Management
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {users.length} registered users
                        </p>
                    </div>
                </div>

                {/* Search & Filter */}
                <div className="flex gap-3">
                    <div className="flex-1 relative">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by email or name..."
                            className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl py-3 pl-11 pr-4 text-black dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-purple-500/20 transition-all outline-none text-sm"
                        />
                    </div>
                    <div className="relative">
                        <select
                            value={filterRole}
                            onChange={(e) => setFilterRole(e.target.value as 'all' | UserRole)}
                            className="appearance-none bg-gray-50 dark:bg-gray-800 border-none rounded-xl py-3 pl-4 pr-10 text-black dark:text-white cursor-pointer focus:ring-2 focus:ring-purple-500/20 transition-all outline-none text-sm"
                        >
                            <option value="all">All Roles</option>
                            <option value="admin">Admins</option>
                            <option value="user">Users</option>
                        </select>
                        <Filter size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* User List */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-64 gap-4">
                        <Loader2 size={40} className="animate-spin text-purple-500" />
                        <p className="text-gray-500 dark:text-gray-400">Loading users...</p>
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 gap-4">
                        <Users size={48} className="text-gray-300 dark:text-gray-600" />
                        <p className="text-gray-500 dark:text-gray-400">No users found</p>
                    </div>
                ) : (
                    <AnimatePresence>
                        {filteredUsers.map((userItem, index) => (
                            <motion.div
                                key={userItem.uid}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ delay: index * 0.05 }}
                                className={`bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 relative ${!userItem.isActive ? 'opacity-60' : ''
                                    } ${userItem.uid === user?.uid ? 'ring-2 ring-purple-500/30' : ''}`}
                            >
                                <div className="flex items-start gap-4">
                                    {/* Avatar */}
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${userItem.role === 'admin'
                                            ? 'bg-gradient-to-br from-purple-500 to-pink-500'
                                            : 'bg-gradient-to-br from-gray-400 to-gray-500'
                                        }`}>
                                        {userItem.role === 'admin' ? (
                                            <Crown size={22} className="text-white" />
                                        ) : (
                                            <User size={22} className="text-white" />
                                        )}
                                    </div>

                                    {/* User Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-bold text-black dark:text-white truncate">
                                                {userItem.displayName || 'No Name'}
                                            </h3>
                                            {userItem.uid === user?.uid && (
                                                <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-full">
                                                    You
                                                </span>
                                            )}
                                            {!userItem.isActive && (
                                                <span className="text-[10px] font-bold uppercase tracking-wider bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full">
                                                    Inactive
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 mb-2">
                                            <Mail size={14} />
                                            <span className="truncate">{userItem.email || 'No email'}</span>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400 dark:text-gray-500">
                                            <div className="flex items-center gap-1">
                                                <Calendar size={12} />
                                                <span>Joined {formatDate(userItem.createdAt)}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Clock size={12} />
                                                <span>Last seen {formatDate(userItem.lastLoginAt)} at {formatTime(userItem.lastLoginAt)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Role Badge & Actions */}
                                    <div className="flex items-center gap-2">
                                        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${userItem.role === 'admin'
                                                ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                                                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                                            }`}>
                                            {userItem.role === 'admin' ? <ShieldCheck size={14} /> : <User size={14} />}
                                            {userItem.role}
                                        </div>

                                        {userItem.uid !== user?.uid && (
                                            <div className="relative">
                                                <button
                                                    onClick={() => setActiveMenu(activeMenu === userItem.uid ? null : userItem.uid)}
                                                    className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                                                >
                                                    <MoreVertical size={18} className="text-gray-500" />
                                                </button>

                                                {/* Dropdown Menu */}
                                                <AnimatePresence>
                                                    {activeMenu === userItem.uid && (
                                                        <motion.div
                                                            initial={{ opacity: 0, scale: 0.95 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            exit={{ opacity: 0, scale: 0.95 }}
                                                            className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden z-10"
                                                        >
                                                            {actionLoading === userItem.uid ? (
                                                                <div className="flex items-center justify-center py-4">
                                                                    <Loader2 size={20} className="animate-spin text-purple-500" />
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    <button
                                                                        onClick={() => handleRoleChange(userItem.uid, userItem.role === 'admin' ? 'user' : 'admin')}
                                                                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                                                                    >
                                                                        {userItem.role === 'admin' ? (
                                                                            <>
                                                                                <User size={16} className="text-gray-500" />
                                                                                <span className="text-sm text-black dark:text-white">Demote to User</span>
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <ShieldCheck size={16} className="text-purple-500" />
                                                                                <span className="text-sm text-black dark:text-white">Promote to Admin</span>
                                                                            </>
                                                                        )}
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleToggleStatus(userItem.uid, userItem.isActive)}
                                                                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left border-t border-gray-100 dark:border-gray-700"
                                                                    >
                                                                        {userItem.isActive ? (
                                                                            <>
                                                                                <UserX size={16} className="text-red-500" />
                                                                                <span className="text-sm text-red-500">Deactivate User</span>
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <UserCheck size={16} className="text-green-500" />
                                                                                <span className="text-sm text-green-500">Activate User</span>
                                                                            </>
                                                                        )}
                                                                    </button>
                                                                </>
                                                            )}
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>

            {/* Stats Footer */}
            <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30">
                <div className="flex justify-around">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-black dark:text-white">
                            {users.filter(u => u.role === 'admin').length}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Admins</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-black dark:text-white">
                            {users.filter(u => u.role === 'user').length}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Users</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-500">
                            {users.filter(u => u.isActive).length}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Active</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminUserManagement;
