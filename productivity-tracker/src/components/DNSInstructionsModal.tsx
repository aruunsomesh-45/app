import React, { useState } from 'react';
import { Shield, Smartphone, Laptop, Monitor, X, Check, Copy } from 'lucide-react';

interface DNSInstructionsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type Platform = 'windows' | 'mac' | 'ios' | 'android';

const DNS_IPS = {
    primary: '208.67.222.123',
    secondary: '208.67.220.123'
};

export const DNSInstructionsModal: React.FC<DNSInstructionsModalProps> = ({ isOpen, onClose }) => {
    const [platform, setPlatform] = useState<Platform>('windows');
    const [copiedIp, setCopiedIp] = useState<string | null>(null);

    if (!isOpen) return null;

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedIp(text);
        setTimeout(() => setCopiedIp(null), 2000);
    };

    const instructions = {
        windows: [
            "Open 'Control Panel' > 'Network and Internet' > 'Network and Sharing Center'.",
            "Click on 'Change adapter settings' in the left sidebar.",
            "Right-click your active connection (Wi-Fi or Ethernet) and select 'Properties'.",
            "Select 'Internet Protocol Version 4 (TCP/IPv4)' and click 'Properties'.",
            "Select 'Use the following DNS server addresses' and enter the IPs below.",
            "Click 'OK' and restart your browser."
        ],
        mac: [
            "Open 'System Settings' (or System Preferences) > 'Network'.",
            "Select your active network connection and click 'Details' (or Advanced).",
            "Go to the 'DNS' tab.",
            "Click the '+' button to add the new server addresses below.",
            "Click 'OK' then 'Apply'.",
            "Flush DNS cache if needed (optional)."
        ],
        ios: [
            "Go to 'Settings' > 'Wi-Fi'.",
            "Tap the 'i' icon next to your connected network.",
            "Scroll down to 'Configure DNS' and tap it.",
            "Select 'Manual'.",
            "Tap 'Add Server' and enter the Primary IP.",
            "Tap 'Add Server' again for the Secondary IP.",
            "Tap 'Save'."
        ],
        android: [
            "Go to 'Settings' > 'Network & Internet' > 'Wi-Fi'.",
            "Tap the gear icon next to your network.",
            "Tap the pencil icon (Modify) or 'Advanced'.",
            "Change 'IP Settings' from 'DHCP' to 'Static'.",
            "Scroll down to DNS 1 and DNS 2.",
            "Enter the IPs below and Save."
        ]
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-[#1A1A1A] w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden border border-[#CCCCCC] dark:border-[#333333]">
                {/* Header */}
                <div className="bg-[#F5F5F5] dark:bg-[#222222] p-6 border-b border-[#E5E5E5] dark:border-[#333333] flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                            <Shield className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black uppercase tracking-tight text-[#333333] dark:text-white">Network Filtering</h2>
                            <p className="text-xs text-[#847777] font-bold tracking-wide">OpenDNS FamilyShield Configuration</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-white dark:bg-[#333333] flex items-center justify-center hover:bg-[#EEE] dark:hover:bg-[#444444] transition-colors"
                    >
                        <X className="w-4 h-4 text-[#847777]" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    <div className="flex items-center justify-center gap-2 mb-8 bg-[#F5F5F5] dark:bg-[#111111] p-1 rounded-full w-fit mx-auto border border-[#E5E5E5] dark:border-[#333333]">
                        {(['windows', 'mac', 'ios', 'android'] as Platform[]).map((p) => (
                            <button
                                key={p}
                                onClick={() => setPlatform(p)}
                                className={`px-4 py-2 rounded-full flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-all duration-300 ${platform === p
                                        ? 'bg-black dark:bg-white text-white dark:text-black shadow-md'
                                        : 'text-[#847777] hover:text-[#333333] dark:hover:text-[#CCCCCC]'
                                    }`}
                            >
                                {p === 'windows' && <Monitor className="w-3 h-3" />}
                                {p === 'mac' && <Laptop className="w-3 h-3" />}
                                {(p === 'ios' || p === 'android') && <Smartphone className="w-3 h-3" />}
                                {p}
                            </button>
                        ))}
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-sm font-black uppercase tracking-wider text-[#333333] dark:text-white mb-4 flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center text-[10px]">1</span>
                                Configure Settings
                            </h3>
                            <ul className="space-y-3">
                                {instructions[platform].map((step, index) => (
                                    <li key={index} className="text-xs font-medium text-[#666666] dark:text-[#AAAAAA] flex gap-3 leading-relaxed">
                                        <span className="min-w-[4px] h-[4px] mt-1.5 rounded-full bg-[#CCCCCC] dark:bg-[#555555]" />
                                        {step}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-sm font-black uppercase tracking-wider text-[#333333] dark:text-white mb-4 flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center text-[10px]">2</span>
                                Server Addresses
                            </h3>

                            <div className="space-y-4">
                                <div className="bg-[#F9F9F9] dark:bg-[#111111] p-4 rounded-xl border border-[#E5E5E5] dark:border-[#333333] relative group">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-[#847777] mb-1">Primary DNS</p>
                                    <p className="text-lg font-mono font-bold text-[#333333] dark:text-white">{DNS_IPS.primary}</p>
                                    <button
                                        onClick={() => copyToClipboard(DNS_IPS.primary)}
                                        className="absolute top-4 right-4 p-2 rounded-lg bg-white dark:bg-[#222222] shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:scale-105"
                                    >
                                        {copiedIp === DNS_IPS.primary ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-[#847777]" />}
                                    </button>
                                </div>

                                <div className="bg-[#F9F9F9] dark:bg-[#111111] p-4 rounded-xl border border-[#E5E5E5] dark:border-[#333333] relative group">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-[#847777] mb-1">Secondary DNS</p>
                                    <p className="text-lg font-mono font-bold text-[#333333] dark:text-white">{DNS_IPS.secondary}</p>
                                    <button
                                        onClick={() => copyToClipboard(DNS_IPS.secondary)}
                                        className="absolute top-4 right-4 p-2 rounded-lg bg-white dark:bg-[#222222] shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:scale-105"
                                    >
                                        {copiedIp === DNS_IPS.secondary ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-[#847777]" />}
                                    </button>
                                </div>
                            </div>

                            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl flex gap-3">
                                <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                                <p className="text-[10px] text-blue-700 dark:text-blue-300 font-medium leading-relaxed">
                                    This configuration forces your device to check the OpenDNS blocklist before loading any website. It works system-wide, including Incognito mode and other browsers.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
