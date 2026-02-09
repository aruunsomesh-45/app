import { useState } from 'react';
import { Clock, Globe, Hash, AlertTriangle, Download } from 'lucide-react';
import type { BlockedAttempt } from '../types/contentProtection';
import Button from './ui/Button';

interface BlockHistoryViewerProps {
    blockHistory: BlockedAttempt[];
    onClear: () => void;
}

export function BlockHistoryViewer({ blockHistory, onClear }: BlockHistoryViewerProps) {
    const [filter, setFilter] = useState<'all' | 'today' | 'week'>('all');

    const getFilteredHistory = () => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        switch (filter) {
            case 'today':
                return blockHistory.filter((attempt) => new Date(attempt.timestamp) >= today);
            case 'week':
                return blockHistory.filter((attempt) => new Date(attempt.timestamp) >= weekAgo);
            default:
                return blockHistory;
        }
    };

    const filteredHistory = getFilteredHistory();

    const formatTimestamp = (date: Date) => {
        const d = new Date(date);
        const now = new Date();
        const diffMs = now.getTime() - d.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return d.toLocaleDateString();
    };

    const handleExport = () => {
        const csv = [
            ['Timestamp', 'Type', 'Content', 'Reason', 'Protection Level'].join(','),
            ...filteredHistory.map((attempt) =>
                [
                    new Date(attempt.timestamp).toISOString(),
                    attempt.url ? 'URL' : 'Keyword',
                    attempt.url || attempt.keyword || '',
                    `"${attempt.reason}"`,
                    attempt.protectionLevel,
                ].join(',')
            ),
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `block-history-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    if (blockHistory.length === 0) {
        return (
            <div className="p-8 text-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl">
                <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">No Blocks Yet</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Blocked content will appear here when filtering is active
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${filter === 'all'
                            ? 'bg-violet-600 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                            }`}
                    >
                        All Time
                    </button>
                    <button
                        onClick={() => setFilter('week')}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${filter === 'week'
                            ? 'bg-violet-600 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                            }`}
                    >
                        Last 7 Days
                    </button>
                    <button
                        onClick={() => setFilter('today')}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${filter === 'today'
                            ? 'bg-violet-600 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                            }`}
                    >
                        Today
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={handleExport}>
                        <Download className="w-4 h-4 mr-1" />
                        Export
                    </Button>
                    <Button variant="ghost" size="sm" onClick={onClear}>
                        Clear History
                    </Button>
                </div>
            </div>

            <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing {filteredHistory.length} of {blockHistory.length} blocks
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredHistory.map((attempt) => (
                    <div
                        key={attempt.id}
                        className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                    {attempt.url ? (
                                        <Globe className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
                                    ) : (
                                        <Hash className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
                                    )}
                                    <span className="text-xs font-medium text-red-800 dark:text-red-300">
                                        {attempt.url ? 'URL Blocked' : 'Keyword Blocked'}
                                    </span>
                                </div>

                                <p className="text-sm text-gray-900 dark:text-white font-mono break-all mb-1">
                                    {attempt.url || attempt.keyword}
                                </p>

                                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                                    {attempt.reason}
                                </p>

                                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {formatTimestamp(attempt.timestamp)}
                                    </span>
                                    <span className="capitalize">{attempt.protectionLevel} mode</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
