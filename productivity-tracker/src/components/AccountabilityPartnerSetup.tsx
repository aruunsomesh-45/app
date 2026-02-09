import { useState } from 'react';
import { Mail, Bell, ShieldCheck, X } from 'lucide-react';
import Button from './ui/Button';
import type { AccountabilityPartner } from '../types/contentProtection';

interface AccountabilityPartnerSetupProps {
    currentPartner?: AccountabilityPartner;
    onSave: (partner: AccountabilityPartner | undefined) => void;
}

export function AccountabilityPartnerSetup({
    currentPartner,
    onSave,
}: AccountabilityPartnerSetupProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [email, setEmail] = useState(currentPartner?.email || '');
    const [notifyOnBlock, setNotifyOnBlock] = useState(
        currentPartner?.notifyOnBlock ?? true
    );
    const [dailyReport, setDailyReport] = useState(currentPartner?.dailyReport ?? false);
    const [weeklyReport, setWeeklyReport] = useState(currentPartner?.weeklyReport ?? true);

    const handleSave = () => {
        if (!email.trim()) {
            onSave(undefined);
        } else {
            onSave({
                email: email.trim(),
                notifyOnBlock,
                dailyReport,
                weeklyReport,
            });
        }
        setIsEditing(false);
    };

    const handleRemove = () => {
        setEmail('');
        onSave(undefined);
        setIsEditing(false);
    };

    if (!isEditing && !currentPartner) {
        return (
            <div className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl">
                <div className="text-center">
                    <ShieldCheck className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                        Add Accountability Partner
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Get support from someone you trust. They'll receive alerts when blocked content is accessed.
                    </p>
                    <Button variant="primary" onClick={() => setIsEditing(true)}>
                        Set Up Partner
                    </Button>
                </div>
            </div>
        );
    }

    if (!isEditing && currentPartner) {
        return (
            <div className="p-4 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-xl">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <Mail className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                        <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                                Accountability Partner
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {currentPartner.email}
                            </p>
                        </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                        Edit
                    </Button>
                </div>

                <div className="space-y-2 text-sm">
                    {currentPartner.notifyOnBlock && (
                        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                            <Bell className="w-4 h-4" />
                            <span>Instant alerts on blocked content</span>
                        </div>
                    )}
                    {currentPartner.dailyReport && (
                        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                            <Bell className="w-4 h-4" />
                            <span>Daily activity reports</span>
                        </div>
                    )}
                    {currentPartner.weeklyReport && (
                        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                            <Bell className="w-4 h-4" />
                            <span>Weekly summary reports</span>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl">
            <div className="flex justify-between items-center mb-4">
                <h4 className="font-semibold text-gray-900 dark:text-white">
                    Configure Accountability Partner
                </h4>
                <button
                    onClick={() => setIsEditing(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Partner's Email Address
                    </label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="partner@example.com"
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    />
                </div>

                <div className="space-y-3">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Notification Settings
                    </p>

                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={notifyOnBlock}
                            onChange={(e) => setNotifyOnBlock(e.target.checked)}
                            className="w-4 h-4 text-violet-600 rounded focus:ring-violet-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                            Notify immediately when blocked content is accessed
                        </span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={dailyReport}
                            onChange={(e) => setDailyReport(e.target.checked)}
                            className="w-4 h-4 text-violet-600 rounded focus:ring-violet-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                            Send daily activity reports
                        </span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={weeklyReport}
                            onChange={(e) => setWeeklyReport(e.target.checked)}
                            className="w-4 h-4 text-violet-600 rounded focus:ring-violet-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                            Send weekly summary reports
                        </span>
                    </label>
                </div>

                <div className="flex gap-3 pt-4">
                    {currentPartner && (
                        <Button variant="ghost" onClick={handleRemove} fullWidth>
                            Remove Partner
                        </Button>
                    )}
                    <Button variant="primary" onClick={handleSave} fullWidth>
                        Save Partner
                    </Button>
                </div>
            </div>
        </div>
    );
}
