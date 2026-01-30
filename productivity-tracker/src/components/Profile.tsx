import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Settings, Moon, Sun, Bell, Shield,
    CreditCard, LogOut, ChevronRight, Camera,
    ArrowLeft, Heart, Sparkles, Key, Smartphone
} from 'lucide-react';

const Profile: React.FC = () => {
    const navigate = useNavigate();
    const [isDarkMode, setIsDarkMode] = useState(() => {
        return document.documentElement.classList.contains('dark');
    });

    const toggleDarkMode = () => {
        const newMode = !isDarkMode;
        setIsDarkMode(newMode);
        if (newMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    };

    // Profile Settings Sections
    const settingsSections = [
        {
            title: "App Settings",
            items: [
                { id: 'theme', icon: isDarkMode ? Moon : Sun, label: "Appearance", sublabel: isDarkMode ? "Dark Mode" : "Light Mode", type: 'toggle' },
                { id: 'notifications', icon: Bell, label: "Notifications", sublabel: "Configure alerts & sounds", type: 'link' },
            ]
        },
        {
            title: "Account & Security",
            items: [
                { id: 'privacy', icon: Shield, label: "Privacy & Visibility", sublabel: "Manage your presence", type: 'link' },
                { id: 'security', icon: Key, label: "Security", sublabel: "Two-factor & passwords", type: 'link' },
                { id: 'billing', icon: CreditCard, label: "Subscription", sublabel: "Premium Membership", type: 'link' },
            ]
        },
        {
            title: "System",
            items: [
                { id: 'devices', icon: Smartphone, label: "Connected Devices", sublabel: "Manage your sessions", type: 'link' },
                { id: 'export', icon: Sparkles, label: "Export Data", sublabel: "Download your archives", type: 'link' },
            ]
        }
    ];

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
                        <button className="w-10 h-10 rounded-full bg-white dark:bg-[#333333] flex items-center justify-center shadow-sm border border-[#CCCCCC] dark:border-[#444444]">
                            <Settings className="w-5 h-5 animate-spin-slow" />
                        </button>
                    </div>

                    {/* Profile Card */}
                    <div className="flex flex-col items-center">
                        <div className="relative mb-6">
                            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white dark:border-[#333333] shadow-2xl relative group">
                                <img
                                    src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=256&h=256&auto=format&fit=crop"
                                    alt="User Profile"
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                    <Camera className="text-white w-6 h-6" />
                                </div>
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-10 h-10 bg-gradient-to-r from-[#847777] to-[#5a4f4f] rounded-full border-4 border-white dark:border-[#1A1A1A] flex items-center justify-center shadow-lg">
                                <Heart className="text-white w-4 h-4 fill-white animate-pulse" />
                            </div>
                        </div>

                        <h2 className="text-2xl font-black italic tracking-tight text-[#000000] dark:text-white mb-1">Dior Avant</h2>
                        <p className="text-[#847777] text-[10px] font-black uppercase tracking-[0.2em]">Strategic Visionary v2.4</p>

                        <div className="flex gap-4 mt-6">
                            <div className="bg-white dark:bg-[#333333] px-6 py-3 rounded-2xl shadow-sm border border-[#CCCCCC] dark:border-[#444444] text-center">
                                <p className="text-[8px] font-black text-[#847777] uppercase tracking-widest mb-1">Efficiency</p>
                                <p className="text-lg font-black italic tracking-tighter">98.4%</p>
                            </div>
                            <div className="bg-[#333333] dark:bg-[#F5F5F5] px-6 py-3 rounded-2xl shadow-sm border border-[#1A1A1A] dark:border-white text-center">
                                <p className="text-[8px] font-black text-[#847777] uppercase tracking-widest mb-1">Status</p>
                                <p className="text-lg font-black italic tracking-tighter text-white dark:text-[#1A1A1A]">ELITE</p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Settings Body */}
                <main className="px-6 space-y-10 mt-4">
                    {settingsSections.map((section, idx) => (
                        <div key={idx} className="flex flex-col gap-4">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#847777] px-2">{section.title}</h3>
                            <div className="bg-white dark:bg-[#222222] rounded-[2rem] border border-[#CCCCCC] dark:border-[#333333] overflow-hidden shadow-sm">
                                {section.items.map((item, i) => (
                                    <div
                                        key={item.id}
                                        onClick={() => item.id === 'theme' ? toggleDarkMode() : null}
                                        className={`flex items-center justify-between p-5 transition-all cursor-pointer ${i !== section.items.length - 1 ? 'border-b border-[#F5F5F5] dark:border-[#333333]' : ''} hover:bg-[#F9F9F9] dark:hover:bg-[#2a2a2a]`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-[#F5F5F5] dark:bg-[#333333] flex items-center justify-center text-[#847777]">
                                                <item.icon className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h4 className="text-[13px] font-black uppercase tracking-tight text-[#000000] dark:text-white leading-tight">{item.label}</h4>
                                                <p className="text-[10px] text-[#847777] font-medium tracking-wide">{item.sublabel}</p>
                                            </div>
                                        </div>

                                        {item.type === 'toggle' ? (
                                            <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${isDarkMode ? 'bg-[#847777]' : 'bg-[#DDDDDD]'}`}>
                                                <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-300 ${isDarkMode ? 'translate-x-6' : 'translate-x-0'}`} />
                                            </div>
                                        ) : (
                                            <ChevronRight className="w-4 h-4 text-[#CCCCCC]" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}

                    {/* Exit Section */}
                    <button className="w-full flex items-center justify-center gap-3 p-6 bg-[#333333] dark:bg-[#F5F5F5] rounded-[2rem] text-white dark:text-[#1A1A1A] shadow-xl hover:scale-[0.98] transition-all group">
                        <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-[11px] font-black uppercase tracking-[0.2em]">Deauthorize Archive</span>
                    </button>

                    <p className="text-center text-[#CCCCCC] text-[8px] font-black uppercase tracking-[0.2em] pt-4">
                        System Version 4.0.0-PRO | Hardware Encrypted
                    </p>
                </main>
            </div>

        </div>
    );
};

export default Profile;
