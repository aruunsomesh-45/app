import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Settings, Moon, Sun, Bell,
    LogOut, ChevronRight, Camera,
    ArrowLeft, Heart, Sparkles,
    Download, Upload, Trash, Shield,
    Globe, ShieldAlert
} from 'lucide-react';
import { useLifeTracker } from '../utils/lifeTrackerStore';
import type { UserProfile } from '../utils/lifeTrackerStore';
import { authService } from '../services/authService';
import { useContentProtection } from '../contexts/ContentProtectionContext';
import { ProtectionLevelSelector } from './ProtectionLevelSelector';
import { PINSetupModal } from './PINSetupModal';
import { AccountabilityPartnerSetup } from './AccountabilityPartnerSetup';
import { BlockHistoryViewer } from './BlockHistoryViewer';
import { DNSInstructionsModal } from './DNSInstructionsModal';
import type { ProtectionLevel } from '../types/contentProtection';
import { useNotifications } from '../contexts/NotificationContext';

const Profile: React.FC = () => {
    const navigate = useNavigate();
    const store = useLifeTracker();
    const state = store.getState();
    const { userProfile } = state;
    const {
        token,
        requestPermission,
        sendLocalNotification
    } = useNotifications();


    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState<Partial<UserProfile>>(userProfile);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const avatarInputRef = useRef<HTMLInputElement>(null);

    const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Optimistic update (optional, but good for UX)
        // For now, let's just wait for upload
        try {
            // @ts-ignore
            const publicUrl = await store.uploadFile(file, 'avatars');
            if (publicUrl) {
                store.updateUserProfile({ avatar: publicUrl });
            } else {
                alert('Failed to upload avatar.');
            }
        } catch (error) {
            console.error('Error uploading avatar:', error);
            alert('Error uploading avatar.');
        }
    };

    // Content Protection State
    const contentProtection = useContentProtection();
    const [showPINModal, setShowPINModal] = useState(false);
    const [showDNSModal, setShowDNSModal] = useState(false);
    const [pinModalMode, setPinModalMode] = useState<'set' | 'verify' | 'change'>('set');
    const [expandedContentSection, setExpandedContentSection] = useState<string | null>(null);
    const [pendingLevel, setPendingLevel] = useState<ProtectionLevel | null>(null);
    const [pendingVitalToggle, setPendingVitalToggle] = useState<boolean | null>(null);

    const handleLogout = async () => {
        if (confirm('Are you sure you want to log out?')) {
            await authService.authSignOut();
            navigate('/');
        }
    };

    // Sync theme with DOM
    useEffect(() => {
        const theme = userProfile.preferences?.theme;
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else if (theme === 'light') {
            document.documentElement.classList.remove('dark');
        }
    }, [userProfile.preferences?.theme]);

    const isDarkMode = userProfile.preferences?.theme === 'dark' ||
        (userProfile.preferences?.theme === 'system' && document.documentElement.classList.contains('dark'));

    const toggleDarkMode = () => {
        const newTheme = isDarkMode ? 'light' : 'dark';
        if (newTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        store.updateUserProfile({
            preferences: { ...userProfile.preferences, theme: newTheme }
        });
    };

    const handleSaveProfile = () => {
        store.updateUserProfile(editForm);
        setIsEditing(false);
    };

    const handleExport = () => {
        const data = store.exportData();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `lifetracker-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string;
            if (store.importData(content)) {
                alert('Data imported successfully!');
                window.location.reload(); // Reload to refresh all state
            } else {
                alert('Failed to import data. Invalid format.');
            }
        };
        reader.readAsText(file);
    };

    const handleClearData = () => {
        if (confirm('ARE YOU SURE? This will delete ALL your data permanently.')) {
            store.clearAllData();
            alert('All data verified deleted.');
            navigate('/');
        }
    };

    // Content Protection handlers
    const handleProtectionLevelChange = async (level: ProtectionLevel) => {
        const currentLevel = contentProtection.settings.protectionLevel;
        const currentLevelIndex = ['off', 'light', 'strong', 'strict'].indexOf(currentLevel);
        const newLevelIndex = ['off', 'light', 'strong', 'strict'].indexOf(level);

        // If trying to enable protection and no PIN exists, show set PIN modal
        if (level !== 'off' && !contentProtection.settings.pin) {
            setPendingLevel(level);
            setPinModalMode('set');
            setShowPINModal(true);
            return;
        }

        // Require PIN only if protection is being lowered or disabled
        if (contentProtection.settings.pin && newLevelIndex < currentLevelIndex) {
            setPendingLevel(level);
            setPinModalMode('verify');
            setShowPINModal(true);
            return;
        }

        // If increasing protection, no PIN needed (or if no PIN exists yet)
        await contentProtection.updateProtectionLevel(level);
    };

    const handleVitalBlockingToggle = async () => {
        const nextState = !contentProtection.settings.vitalBlockingEnabled;

        // If disabling and PIN exists, require PIN
        if (!nextState && contentProtection.settings.pin) {
            setPendingVitalToggle(nextState);
            setPinModalMode('verify');
            setShowPINModal(true);
            return;
        }

        contentProtection.toggleVitalBlocking(nextState);
    };

    const handlePINModalSuccess = (pin: string, oldPin?: string): boolean => {
        let success = false;

        if (pinModalMode === 'set') {
            success = contentProtection.setPin(pin);
            if (success && pendingLevel) {
                contentProtection.updateProtectionLevel(pendingLevel);
            }
        } else if (pinModalMode === 'verify') {
            success = contentProtection.verifyPin(pin);
            if (success) {
                if (pendingLevel) {
                    contentProtection.updateProtectionLevel(pendingLevel, pin);
                } else if (pendingVitalToggle !== null) {
                    contentProtection.toggleVitalBlocking(pendingVitalToggle, pin);
                }
            }
        } else if (pinModalMode === 'change') {
            success = contentProtection.setPin(pin, oldPin);
        }

        if (success) {
            setPendingLevel(null);
            setPendingVitalToggle(null);
        }
        return success;
    };

    const toggleContentSection = (section: string) => {
        setExpandedContentSection(expandedContentSection === section ? null : section);
    };

    // calculate efficiency score based on task completion
    const taskEfficiency = state.dailyTasks.length > 0
        ? Math.round((state.dailyTasks.filter(t => t.completed).length / state.dailyTasks.length) * 100)
        : 0;

    const userStatus = taskEfficiency > 80 ? 'ELITE' : taskEfficiency > 50 ? 'PRO' : 'ROOKIE';

    return (
        <div className="min-h-screen bg-[#F5F5F5] dark:bg-[#1A1A1A] text-[#333333] dark:text-[#F5F5F5] font-sans antialiased flex justify-center pb-32 transition-colors duration-500">
            <div className="w-full max-w-md min-h-screen relative flex flex-col">

                {/* Header Section */}
                <header className="pt-12 px-6 pb-8 bg-gradient-to-b from-white dark:from-[#111111] to-transparent">
                    <div className="flex justify-between items-center mb-10">
                        <button
                            onClick={() => navigate(-1)}
                            className="w-10 h-10 rounded-full bg-white dark:bg-[#333333] flex items-center justify-center shadow-sm border border-[#CCCCCC] dark:border-[#444444] transition-all hover:bg-[#DDDDDD] dark:hover:bg-[#444444]"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <h1 className="text-xl font-black tracking-tighter uppercase italic">Institutional Profile</h1>
                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm border border-[#CCCCCC] dark:border-[#444444] ${isEditing ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-white dark:bg-[#333333]'}`}
                        >
                            <Settings className={`w-5 h-5 ${isEditing ? 'animate-spin-slow' : ''}`} />
                        </button>
                    </div>

                    {/* Profile Card */}
                    <div className="flex flex-col items-center">
                        <div className="relative mb-6">
                            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white dark:border-[#333333] shadow-2xl relative group">
                                <img
                                    src={userProfile.avatar || "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=256&h=256&auto=format&fit=crop"}
                                    alt="User Profile"
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                                <div
                                    onClick={() => avatarInputRef.current?.click()}
                                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                                >
                                    <Camera className="text-white w-6 h-6" />
                                </div>
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-10 h-10 bg-gradient-to-r from-[#847777] to-[#5a4f4f] rounded-full border-4 border-white dark:border-[#1A1A1A] flex items-center justify-center shadow-lg">
                                <Heart className="text-white w-4 h-4 fill-white animate-pulse" />
                            </div>
                            <input
                                type="file"
                                ref={avatarInputRef}
                                onChange={handleAvatarChange}
                                accept="image/*"
                                className="hidden"
                            />
                        </div>

                        {isEditing ? (
                            <div className="space-y-3 w-full max-w-xs text-center">
                                <input
                                    type="text"
                                    value={editForm.firstName || ''}
                                    onChange={e => setEditForm({ ...editForm, firstName: e.target.value })}
                                    className="w-full text-center text-xl font-black italic bg-transparent border-b border-gray-300 focus:outline-none focus:border-black dark:focus:border-white"
                                    placeholder="First Name"
                                />
                                <input
                                    type="text"
                                    value={editForm.title || ''}
                                    onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                                    className="w-full text-center text-[10px] uppercase tracking-[0.2em] bg-transparent border-b border-gray-300 focus:outline-none focus:border-black dark:focus:border-white"
                                    placeholder="Title"
                                />
                                <button
                                    onClick={handleSaveProfile}
                                    className="px-6 py-2 bg-black dark:bg-white text-white dark:text-black rounded-full text-xs font-bold uppercase tracking-widest mt-2"
                                >
                                    Save Changes
                                </button>
                            </div>
                        ) : (
                            <>
                                <h2 className="text-2xl font-black italic tracking-tight text-[#000000] dark:text-white mb-1">
                                    {userProfile.firstName} {userProfile.lastName}
                                </h2>
                                <p className="text-[#847777] text-[10px] font-black uppercase tracking-[0.2em]">{userProfile.title}</p>
                            </>
                        )}

                        <div className="flex gap-4 mt-6">
                            <div className="bg-white dark:bg-[#333333] px-6 py-3 rounded-2xl shadow-sm border border-[#CCCCCC] dark:border-[#444444] text-center">
                                <p className="text-[8px] font-black text-[#847777] uppercase tracking-widest mb-1">Efficiency</p>
                                <p className="text-lg font-black italic tracking-tighter">{taskEfficiency}%</p>
                            </div>
                            <div className="bg-[#333333] dark:bg-[#F5F5F5] px-6 py-3 rounded-2xl shadow-sm border border-[#1A1A1A] dark:border-white text-center">
                                <p className="text-[8px] font-black text-[#847777] uppercase tracking-widest mb-1">Status</p>
                                <p className="text-lg font-black italic tracking-tighter text-white dark:text-[#1A1A1A]">{userStatus}</p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Settings Body */}
                <main className="px-6 space-y-10 mt-4">
                    {/* App Settings */}
                    <div className="flex flex-col gap-4">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#847777] px-2">App Settings</h3>
                        <div className="bg-white dark:bg-[#222222] rounded-[2rem] border border-[#CCCCCC] dark:border-[#333333] overflow-hidden shadow-sm">
                            <div
                                onClick={toggleDarkMode}
                                className="flex items-center justify-between p-5 transition-all cursor-pointer border-b border-[#F5F5F5] dark:border-[#333333] hover:bg-[#F9F9F9] dark:hover:bg-[#2a2a2a]"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-[#F5F5F5] dark:bg-[#333333] flex items-center justify-center text-[#847777]">
                                        {isDarkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <h4 className="text-[13px] font-black uppercase tracking-tight text-[#000000] dark:text-white leading-tight">Appearance</h4>
                                        <p className="text-[10px] text-[#847777] font-medium tracking-wide">{isDarkMode ? "Dark Mode" : "Light Mode"}</p>
                                    </div>
                                </div>
                                <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${isDarkMode ? 'bg-[#847777]' : 'bg-[#DDDDDD]'}`}>
                                    <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-300 ${isDarkMode ? 'translate-x-6' : 'translate-x-0'}`} />
                                </div>
                            </div>

                            <div
                                onClick={requestPermission}
                                className="flex items-center justify-between p-5 transition-all cursor-pointer hover:bg-[#F9F9F9] dark:hover:bg-[#2a2a2a]"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-[#F5F5F5] dark:bg-[#333333] flex items-center justify-center text-[#847777]">
                                        <Bell className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="text-[13px] font-black uppercase tracking-tight text-[#000000] dark:text-white leading-tight">Push Notifications</h4>
                                        <p className="text-[10px] text-[#847777] font-medium tracking-wide">
                                            {token ? "Enabled" : "Click to enable alerts"}
                                        </p>
                                    </div>
                                </div>
                                <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${token ? 'bg-green-500' : 'bg-[#DDDDDD]'}`}>
                                    <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-300 ${token ? 'translate-x-6' : 'translate-x-0'}`} />
                                </div>
                            </div>

                            {token && (
                                <div
                                    onClick={() => sendLocalNotification("Test Alert 🚀", "FCM setup is complete and notifications are working!")}
                                    className="mx-5 mb-5 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-bold text-center cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all border border-blue-100 dark:border-blue-900/40"
                                >
                                    Click here to send a Test Notification
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Content Protection */}
                    <div className="flex flex-col gap-4">
                        <div className="flex justify-between items-center px-2">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#847777]">Content Protection</h3>
                            {contentProtection.settings.vitalBlockingEnabled && (
                                <span className="text-[8px] font-black uppercase tracking-widest bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full border border-amber-200">
                                    Vital Active
                                </span>
                            )}
                        </div>
                        <div className="bg-white dark:bg-[#222222] rounded-[2rem] border border-[#CCCCCC] dark:border-[#333333] overflow-hidden shadow-sm">
                            {/* Vital Blocking Toggle */}
                            <div className="p-5 border-b border-[#F5F5F5] dark:border-[#333333]">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${contentProtection.settings.vitalBlockingEnabled ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-[#F5F5F5] dark:bg-[#333333] text-[#847777]'}`}>
                                            <ShieldAlert className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="text-[13px] font-black uppercase tracking-tight text-[#000000] dark:text-white leading-tight">
                                                Vital Blocking
                                            </h4>
                                            <p className="text-[10px] text-[#847777] font-medium tracking-wide">
                                                Blocks Adult & Twitter/X content
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleVitalBlockingToggle}
                                        className={`w-12 h-6 rounded-full p-1 transition-all duration-300 ${contentProtection.settings.vitalBlockingEnabled ? 'bg-amber-500' : 'bg-[#DDDDDD] dark:bg-[#444444]'}`}
                                    >
                                        <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-300 ${contentProtection.settings.vitalBlockingEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                                    </button>
                                </div>
                            </div>

                            {/* Protection Level */}
                            <div className="p-5 border-b border-[#F5F5F5] dark:border-[#333333]">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-[#F5F5F5] dark:bg-[#333333] flex items-center justify-center text-[#847777]">
                                            <Shield className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="text-[13px] font-black uppercase tracking-tight text-[#000000] dark:text-white leading-tight">
                                                Protection Level
                                            </h4>
                                            <p className="text-[10px] text-[#847777] font-medium tracking-wide">
                                                {contentProtection.settings.protectionLevel === 'off' ? 'Disabled' : contentProtection.settings.protectionLevel.charAt(0).toUpperCase() + contentProtection.settings.protectionLevel.slice(1)}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => toggleContentSection('protection-level')}
                                        className="text-[#847777] hover:text-[#000000] dark:hover:text-white transition-colors"
                                    >
                                        <ChevronRight className={`w-4 h-4 transition-transform ${expandedContentSection === 'protection-level' ? 'rotate-90' : ''}`} />
                                    </button>
                                </div>
                                {expandedContentSection === 'protection-level' && (
                                    <div className="mt-4">
                                        <ProtectionLevelSelector
                                            currentLevel={contentProtection.settings.protectionLevel}
                                            onLevelChange={handleProtectionLevelChange}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* PIN Settings */}
                            {contentProtection.settings.protectionLevel !== 'off' && (
                                <div className="p-5 border-b border-[#F5F5F5] dark:border-[#333333]">
                                    <button
                                        onClick={() => {
                                            setPinModalMode('change');
                                            setShowPINModal(true);
                                        }}
                                        className="w-full text-left transition-all hover:opacity-70"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="text-[13px] font-black uppercase tracking-tight text-[#000000] dark:text-white leading-tight">
                                                    Change PIN
                                                </h4>
                                                <p className="text-[10px] text-[#847777] font-medium tracking-wide">
                                                    Update your protection PIN
                                                </p>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-[#CCCCCC]" />
                                        </div>
                                    </button>
                                </div>
                            )}

                            {/* Accountability Partner */}
                            {contentProtection.settings.protectionLevel !== 'off' && (
                                <div className="p-5 border-b border-[#F5F5F5] dark:border-[#333333]">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h4 className="text-[13px] font-black uppercase tracking-tight text-[#000000] dark:text-white leading-tight">
                                                Account Ability Partner
                                            </h4>
                                            <p className="text-[10px] text-[#847777] font-medium tracking-wide">
                                                {contentProtection.settings.accountabilityPartner ? 'Configured' : 'Not configured'}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => toggleContentSection('accountability')}
                                            className="text-[#847777] hover:text-[#000000] dark:hover:text-white transition-colors"
                                        >
                                            <ChevronRight className={`w-4 h-4 transition-transform ${expandedContentSection === 'accountability' ? 'rotate-90' : ''}`} />
                                        </button>
                                    </div>
                                    {expandedContentSection === 'accountability' && (
                                        <div className="mt-4">
                                            <AccountabilityPartnerSetup
                                                currentPartner={contentProtection.settings.accountabilityPartner}
                                                onSave={contentProtection.setAccountabilityPartner}
                                            />
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* DNS / Network Filtering */}
                            <div className="p-5 border-b border-[#F5F5F5] dark:border-[#333333]">
                                <button
                                    onClick={() => setShowDNSModal(true)}
                                    className="w-full text-left transition-all hover:opacity-70"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-500">
                                                <Globe className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h4 className="text-[13px] font-black uppercase tracking-tight text-[#000000] dark:text-white leading-tight">
                                                    Network Filtering
                                                </h4>
                                                <p className="text-[10px] text-[#847777] font-medium tracking-wide">
                                                    Configure System-wide DNS
                                                </p>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-[#CCCCCC]" />
                                    </div>
                                </button>
                            </div>

                            {/* Block History */}
                            {contentProtection.settings.protectionLevel !== 'off' && contentProtection.settings.blockHistory.length > 0 && (
                                <div className="p-5">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h4 className="text-[13px] font-black uppercase tracking-tight text-[#000000] dark:text-white leading-tight">
                                                Block History
                                            </h4>
                                            <p className="text-[10px] text-[#847777] font-medium tracking-wide">
                                                {contentProtection.settings.blockHistory.length} blocked attempts
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => toggleContentSection('block-history')}
                                            className="text-[#847777] hover:text-[#000000] dark:hover:text-white transition-colors"
                                        >
                                            <ChevronRight className={`w-4 h-4 transition-transform ${expandedContentSection === 'block-history' ? 'rotate-90' : ''}`} />
                                        </button>
                                    </div>
                                    {expandedContentSection === 'block-history' && (
                                        <div className="mt-4">
                                            <BlockHistoryViewer
                                                blockHistory={contentProtection.settings.blockHistory}
                                                onClear={contentProtection.clearBlockHistory}
                                            />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Data Management */}
                    <div className="flex flex-col gap-4">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#847777] px-2">System Data</h3>
                        <div className="bg-white dark:bg-[#222222] rounded-[2rem] border border-[#CCCCCC] dark:border-[#333333] overflow-hidden shadow-sm">
                            <div
                                onClick={handleExport}
                                className="flex items-center justify-between p-5 transition-all cursor-pointer border-b border-[#F5F5F5] dark:border-[#333333] hover:bg-[#F9F9F9] dark:hover:bg-[#2a2a2a]"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-[#F5F5F5] dark:bg-[#333333] flex items-center justify-center text-[#847777]">
                                        <Download className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="text-[13px] font-black uppercase tracking-tight text-[#000000] dark:text-white leading-tight">Export Data</h4>
                                        <p className="text-[10px] text-[#847777] font-medium tracking-wide">Download full backup</p>
                                    </div>
                                </div>
                                <Sparkles className="w-4 h-4 text-[#CCCCCC]" />
                            </div>

                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="flex items-center justify-between p-5 transition-all cursor-pointer border-b border-[#F5F5F5] dark:border-[#333333] hover:bg-[#F9F9F9] dark:hover:bg-[#2a2a2a]"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-[#F5F5F5] dark:bg-[#333333] flex items-center justify-center text-[#847777]">
                                        <Upload className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="text-[13px] font-black uppercase tracking-tight text-[#000000] dark:text-white leading-tight">Import Data</h4>
                                        <p className="text-[10px] text-[#847777] font-medium tracking-wide">Restore from backup</p>
                                    </div>
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleImport}
                                    className="hidden"
                                    accept=".json"
                                />
                                <ChevronRight className="w-4 h-4 text-[#CCCCCC]" />
                            </div>

                            <div
                                onClick={handleClearData}
                                className="flex items-center justify-between p-5 transition-all cursor-pointer hover:bg-rose-50 dark:hover:bg-rose-900/10"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-500">
                                        <Trash className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="text-[13px] font-black uppercase tracking-tight text-rose-500 leading-tight">Clear All Data</h4>
                                        <p className="text-[10px] text-rose-400 font-medium tracking-wide">Permanent reset</p>
                                    </div>
                                </div>
                                <LogOut className="w-4 h-4 text-rose-300" />
                            </div>

                            <div
                                onClick={handleLogout}
                                className="flex items-center justify-between p-5 transition-all cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800/50"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500">
                                        <LogOut className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="text-[13px] font-black uppercase tracking-tight text-gray-500 dark:text-gray-400 leading-tight">Log Out</h4>
                                        <p className="text-[10px] text-gray-400 font-medium tracking-wide">End current session</p>
                                    </div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-gray-300" />
                            </div>
                        </div>
                    </div>

                    <p className="text-center text-[#CCCCCC] text-[8px] font-black uppercase tracking-[0.2em] pt-4">
                        System Version 4.0.0-PRO | Hardware Encrypted
                    </p>
                </main>
            </div>

            {/* PIN Setup Modal */}
            <PINSetupModal
                isOpen={showPINModal}
                mode={pinModalMode}
                onSetPin={handlePINModalSuccess}
                onClose={() => {
                    setShowPINModal(false);
                    setPendingLevel(null);
                }}
            />

            <DNSInstructionsModal
                isOpen={showDNSModal}
                onClose={() => setShowDNSModal(false)}
            />
        </div>
    );
};

export default Profile;
