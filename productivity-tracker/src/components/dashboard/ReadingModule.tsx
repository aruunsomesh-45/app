import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLifeTracker } from '../../utils/lifeTrackerStore';
import {
    BookOpen as BookOpenIcon,
    Plus as PlusIcon,
    Upload as DocumentArrowUpIcon,
    Folder as FolderIcon,
    ChevronRight as ChevronRightIcon
} from 'lucide-react';

interface ReadingModuleProps {
    compact?: boolean;
    showImage?: boolean;
    customSubheading?: string;
}

const ReadingModule: React.FC<ReadingModuleProps> = ({ compact, showImage, customSubheading }) => {
    const navigate = useNavigate();
    const store = useLifeTracker();
    const [isLoading, setIsLoading] = useState(true);
    const stats = store.getReadingStats();

    useEffect(() => {
        // Simulate loading for the skeleton effect
        const timer = setTimeout(() => setIsLoading(false), 800);
        return () => clearTimeout(timer);
    }, []);

    if (isLoading) {
        return (
            <div className={`bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm animate-pulse border border-slate-100 dark:border-slate-700/50 ${compact ? 'h-full' : ''}`}>
                <div className={`flex ${compact ? 'flex-col' : 'flex-col md:flex-row'} gap-6`}>
                    <div className="flex-1 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-14 h-14 bg-slate-200 dark:bg-slate-700 rounded-2xl"></div>
                            <div className="space-y-2">
                                <div className="h-5 w-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
                                <div className="h-4 w-48 bg-slate-200 dark:bg-slate-700 rounded"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const backgroundImage = "/images/section-reading.jpg";

    return (
        <div className={`group bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-slate-100 dark:border-slate-700/50 overflow-hidden relative ${compact ? 'h-full' : ''}`}>
            {/* Background Decorative Element or Image */}
            {showImage ? (
                <>
                    <img
                        src={backgroundImage}
                        alt="Reading"
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-40 dark:opacity-20"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-white/40 to-transparent dark:from-slate-900/80 dark:via-slate-900/40 dark:to-transparent"></div>
                </>
            ) : (
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-indigo-500/5 dark:bg-indigo-400/5 rounded-full blur-3xl pointer-events-none"></div>
            )}

            <div className={`flex ${compact ? 'flex-col' : 'flex-col md:flex-row'} items-start ${compact ? '' : 'md:items-center'} justify-between gap-6 relative z-10 h-full`}>

                {/* Left Side: Icon & Summary */}
                <div className="flex items-center gap-4 flex-1 w-full">
                    <div className="relative">
                        <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-none transform group-hover:scale-110 transition-transform duration-300">
                            <BookOpenIcon className="w-7 h-7 text-white" />
                        </div>
                        {stats.streak > 0 && (
                            <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                                🔥 {stats.streak}
                            </div>
                        )}
                    </div>

                    <div className="space-y-1 min-w-0 flex-1">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            Reading
                            <span className="text-[10px] uppercase tracking-wider bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-md text-slate-500 dark:text-slate-400 font-medium">
                                Active
                            </span>
                        </h3>
                        <p className="text-sm text-slate-700 dark:text-slate-300 font-bold line-clamp-1">
                            {customSubheading ? customSubheading : (stats.lastOpenedBook
                                ? `Recently opened: ${stats.lastOpenedBook.title}`
                                : 'Start your reading journey')}
                        </p>
                        <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                            <span className="flex items-center gap-1">
                                <BookOpenIcon className="w-3 h-3" />
                                {stats.booksInProgress} books
                            </span>
                            <span className="w-1 h-1 bg-slate-300 dark:bg-slate-600 rounded-full"></span>
                            <span className="flex items-center gap-1">
                                <FolderIcon className="w-3 h-3" />
                                {stats.totalActiveFolders} folders
                            </span>
                        </div>
                    </div>
                </div>

                {/* Right Side: Progress & CTAs */}
                <div className={`w-full ${compact ? '' : 'md:w-auto'} flex-1 space-y-4`}>
                    {/* Progress Summary */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-end">
                            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight">Progress</span>
                            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{stats.overallProgress}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-1000 ease-out"
                                style={{ width: `${stats.overallProgress}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* CTAs */}
                    <div className={`flex ${compact ? 'flex-col gap-2' : 'flex-wrap items-center gap-2'} pt-1`}>
                        <div className={`flex gap-2 ${compact ? 'w-full' : ''}`}>
                            <button
                                onClick={() => navigate('/section/reading/library', { state: { openModal: 'folder' } })}
                                className="flex-1 flex items-center justify-center gap-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-3 py-2 rounded-xl text-[11px] font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-all active:scale-95 shadow-sm"
                            >
                                <PlusIcon className="w-3.5 h-3.5" />
                                <span>Folder</span>
                            </button>

                            <button
                                onClick={() => navigate('/section/reading/library', { state: { openModal: 'pdf' } })}
                                className="flex-1 flex items-center justify-center gap-1.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-3 py-2 rounded-xl text-[11px] font-bold hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-all active:scale-95"
                            >
                                <DocumentArrowUpIcon className="w-3.5 h-3.5" />
                                <span>Upload</span>
                            </button>
                        </div>

                        <button
                            onClick={() => navigate('/section/reading')}
                            className={`${compact ? 'w-full' : 'w-full md:w-auto'} h-9 flex items-center justify-center gap-1 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-xs font-bold group/view`}
                        >
                            View Library
                            <ChevronRightIcon className="w-3.5 h-3.5 group-hover/view:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReadingModule;
