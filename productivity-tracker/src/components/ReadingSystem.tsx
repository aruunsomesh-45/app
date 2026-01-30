import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, BookOpen, Plus, Flame, TrendingUp,
    ChevronRight, X, Check, BookMarked, Bookmark, Edit3,
    FolderPlus, FileUp, PlusCircle, StickyNote, Brain, Sparkles, Eye, Lightbulb
} from 'lucide-react';
import { useLifeTracker } from '../utils/lifeTrackerStore';
import type { Book, ReadingSession } from '../utils/lifeTrackerStore';
import BookInsightsModal from './reading/BookInsightsModal';

const COVER_COLORS = [
    'from-blue-500 to-indigo-600',
    'from-purple-500 to-pink-600',
    'from-emerald-500 to-teal-600',
    'from-orange-500 to-red-600',
    'from-cyan-500 to-blue-600',
    'from-rose-500 to-pink-600',
    'from-amber-500 to-orange-600',
    'from-violet-500 to-purple-600',
];

const ReadingSystem: React.FC = () => {
    const navigate = useNavigate();
    const store = useLifeTracker();
    const stats = store.getReadingStats();
    const books = store.getBooks();
    const sessions = store.getState().readingSessions.slice(0, 10);

    // Modal States
    const [showAddBookModal, setShowAddBookModal] = useState(false);
    const [showLogSessionModal, setShowLogSessionModal] = useState(false);
    const [showInsightsModal, setShowInsightsModal] = useState(false);
    const [selectedBook, setSelectedBook] = useState<Book | null>(null);

    // Add Book Form
    const [newBookTitle, setNewBookTitle] = useState('');
    const [newBookAuthor, setNewBookAuthor] = useState('');
    const [newBookPages, setNewBookPages] = useState('');

    // Log Session Form
    const [pagesRead, setPagesRead] = useState('');
    const [sessionNote, setSessionNote] = useState('');

    const handleAddBook = () => {
        if (!newBookTitle.trim() || !newBookAuthor.trim() || !newBookPages) return;

        const randomColor = COVER_COLORS[Math.floor(Math.random() * COVER_COLORS.length)];
        store.addBook({
            title: newBookTitle.trim(),
            author: newBookAuthor.trim(),
            totalPages: parseInt(newBookPages),
            coverColor: randomColor,
        });

        setNewBookTitle('');
        setNewBookAuthor('');
        setNewBookPages('');
        setShowAddBookModal(false);
    };

    const handleLogSession = () => {
        if (!selectedBook || !pagesRead) return;

        const pages = parseInt(pagesRead);
        store.addReadingSession({
            bookId: selectedBook.id,
            date: new Date().toISOString().split('T')[0],
            pagesRead: pages,
            startPage: selectedBook.currentPage,
            endPage: selectedBook.currentPage + pages,
            note: sessionNote || undefined,
        });

        setPagesRead('');
        setSessionNote('');
        setSelectedBook(null);
        setShowLogSessionModal(false);
    };

    const openLogSession = (book: Book) => {
        setSelectedBook(book);
        setShowLogSessionModal(true);
    };

    const readingBooks = books.filter(b => b.status === 'reading');
    const completedBooks = books.filter(b => b.status === 'completed');

    // Combine session notes and book insights for the feed
    const insightFeed = [
        ...store.getState().readingSessions.filter(s => s.note).map(s => ({
            id: `session-${s.id}`,
            bookId: s.bookId,
            content: s.note!,
            date: s.date,
            type: 'note' as const,
        })),
        ...store.getAllBookInsights().flatMap(insight =>
            insight.coreIdeas.map(idea => ({
                id: `idea-${idea.id}`,
                bookId: insight.bookId,
                content: idea.content,
                date: insight.updatedAt,
                type: 'idea' as const,
            }))
        )
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 3);

    return (
        <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-teal-50 pb-24">
            {/* Header */}
            <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-100">
                <div className="px-5 py-4 flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-700" />
                    </button>
                    <div className="flex-1">
                        <h1 className="text-xl font-bold text-gray-900">Reading</h1>
                        <p className="text-xs text-gray-500">Track → Reflect → Improve</p>
                    </div>
                    <button
                        onClick={() => setShowAddBookModal(true)}
                        className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center shadow-lg"
                    >
                        <Plus className="w-5 h-5 text-white" />
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="px-5 py-4">
                <div className="grid grid-cols-3 gap-3">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <Flame className="w-4 h-4 text-orange-500" />
                            <span className="text-xs text-gray-500">Streak</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{stats.streak}</p>
                        <p className="text-xs text-gray-400">days</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <BookOpen className="w-4 h-4 text-emerald-500" />
                            <span className="text-xs text-gray-500">This Week</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{stats.pagesThisWeek}</p>
                        <p className="text-xs text-gray-400">pages</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="w-4 h-4 text-blue-500" />
                            <span className="text-xs text-gray-500">Completed</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{stats.booksCompleted}</p>
                        <p className="text-xs text-gray-400">books</p>
                    </motion.div>
                </div>
            </div>

            {/* Hub Actions Section */}
            <div className="px-5 py-2">
                <div className="grid grid-cols-4 gap-2">
                    <motion.button
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/section/reading/library', { state: { openModal: 'folder' } })}
                        className="flex flex-col items-center justify-center gap-2 p-3 bg-white rounded-2xl border border-indigo-100 shadow-sm transition-all group"
                    >
                        <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                            <FolderPlus className="w-5 h-5" />
                        </div>
                        <span className="text-[9px] font-bold text-gray-700 uppercase tracking-tight">Folder</span>
                    </motion.button>

                    <motion.button
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/section/reading/library')}
                        className="flex flex-col items-center justify-center gap-2 p-3 bg-white rounded-2xl border border-emerald-100 shadow-sm transition-all group"
                    >
                        <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                            <PlusCircle className="w-5 h-5" />
                        </div>
                        <span className="text-[9px] font-bold text-gray-700 uppercase tracking-tight">Add Book</span>
                    </motion.button>

                    <motion.button
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/section/reading/library', { state: { openModal: 'pdf' } })}
                        className="flex flex-col items-center justify-center gap-2 p-3 bg-white rounded-2xl border border-slate-100 shadow-sm transition-all group"
                    >
                        <div className="w-9 h-9 bg-slate-50 rounded-xl flex items-center justify-center text-slate-600 group-hover:scale-110 transition-transform">
                            <FileUp className="w-5 h-5" />
                        </div>
                        <span className="text-[9px] font-bold text-gray-700 uppercase tracking-tight">PDF</span>
                    </motion.button>

                    <motion.button
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                            // Open insights for the most recently read book or first completed book
                            const recentBook = [...readingBooks, ...completedBooks][0];
                            if (recentBook) {
                                setSelectedBook(recentBook);
                                setShowInsightsModal(true);
                            }
                        }}
                        className="flex flex-col items-center justify-center gap-2 p-3 bg-white rounded-2xl border border-amber-100 shadow-sm transition-all group"
                    >
                        <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
                            <Lightbulb className="w-5 h-5" />
                        </div>
                        <span className="text-[9px] font-bold text-gray-700 uppercase tracking-tight">Insights</span>
                    </motion.button>
                </div>
            </div>

            {/* Insights & Notes (Updated) */}
            <div className="px-5 py-4">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Insights & Notes</h2>
                    <button
                        onClick={() => navigate('/section/notes')}
                        className="text-sm text-emerald-600 font-medium"
                    >
                        View All
                    </button>
                </div>

                <div className="space-y-3">
                    {insightFeed.map((item, i) => {
                        const book = books.find(b => b.id === item.bookId);
                        return (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className={`p-4 rounded-2xl border shadow-sm cursor-pointer hover:shadow-md transition-all ${item.type === 'idea'
                                        ? 'bg-amber-50/50 border-amber-100'
                                        : 'bg-white border-gray-100'
                                    }`}
                                onClick={() => {
                                    if (book) {
                                        setSelectedBook(book);
                                        setShowInsightsModal(true);
                                    }
                                }}
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    {item.type === 'idea' ? (
                                        <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                                    ) : (
                                        <StickyNote className="w-3.5 h-3.5 text-emerald-500" />
                                    )}
                                    <span className={`text-[10px] font-bold uppercase tracking-widest ${item.type === 'idea' ? 'text-amber-600/70' : 'text-gray-400'
                                        }`}>
                                        {book?.title || 'Book Insight'} • {item.type === 'idea' ? 'Core Idea' : 'Note'}
                                    </span>
                                </div>
                                <p className={`text-sm leading-relaxed ${item.type === 'idea' ? 'text-gray-900 font-medium' : 'text-gray-700 italic'
                                    }`}>
                                    {item.type === 'note' && '"'}{item.content}{item.type === 'note' && '"'}
                                </p>
                                <p className="text-[10px] text-gray-400 mt-2">
                                    {new Date(item.date).toLocaleDateString()}
                                </p>
                            </motion.div>
                        );
                    })}

                    {insightFeed.length === 0 && (
                        <div className="bg-gray-50 rounded-2xl p-6 text-center border border-dashed border-gray-200">
                            <Sparkles className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                            <p className="text-xs text-gray-500 italic">No insights or notes recorded yet. Start reading to see them here.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Learning Hub Integration */}
            <div className="px-5 pb-4">
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/learning')}
                    className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-5 text-white shadow-lg shadow-indigo-200 relative overflow-hidden group cursor-pointer"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform"></div>

                    <div className="relative z-10 flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Brain className="w-5 h-5 text-violet-200" />
                                <h3 className="font-bold text-lg">Learning Hub</h3>
                            </div>
                            <p className="text-violet-100 text-xs max-w-[200px]">Summarize books, create mind maps, and understand complex topics with AI.</p>
                        </div>
                        <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Currently Reading */}
            <div className="px-5 py-4">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Currently Reading</h2>
                    <span className="text-sm text-gray-500">{readingBooks.length} books</span>
                </div>

                {readingBooks.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-white rounded-2xl p-8 text-center border border-dashed border-gray-200"
                    >
                        <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p className="text-gray-500 mb-4">No books in progress</p>
                        <button
                            onClick={() => setShowAddBookModal(true)}
                            className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium"
                        >
                            Add Your First Book
                        </button>
                    </motion.div>
                ) : (
                    <div className="space-y-3">
                        {readingBooks.map((book, index) => {
                            const progress = Math.round((book.currentPage / book.totalPages) * 100);

                            return (
                                <motion.div
                                    key={book.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    onClick={() => {
                                        // Navigate to library with folder expanded
                                        navigate('/section/reading/library', {
                                            state: { expandFolderId: book.folderId, scrollToBookId: book.id }
                                        });
                                    }}
                                    className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md hover:border-indigo-200 transition-all"
                                >
                                    <div className="flex gap-4">
                                        {/* Book Cover */}
                                        <div className="w-16 h-24 rounded-lg overflow-hidden shadow-md flex-shrink-0 relative">
                                            {(book.coverImage || book.pdfCoverImage) ? (
                                                <img
                                                    src={book.coverImage || book.pdfCoverImage}
                                                    alt={book.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className={`w-full h-full bg-gradient-to-br ${book.coverColor} flex items-center justify-center`}>
                                                    <BookOpen className="w-8 h-8 text-white/80" />
                                                </div>
                                            )}
                                            {book.pdfDataUrl && (
                                                <div className="absolute top-1 right-1 bg-emerald-500 text-white rounded-full p-0.5">
                                                    <Eye className="w-2 h-2" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Book Info */}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-gray-900 truncate">{book.title}</h3>
                                            <p className="text-sm text-gray-500 truncate">{book.author}</p>

                                            {/* Progress */}
                                            <div className="mt-3">
                                                <div className="flex items-center justify-between text-xs mb-1">
                                                    <span className="text-gray-500">Page {book.currentPage} of {book.totalPages}</span>
                                                    <span className="font-medium text-emerald-600">{progress}%</span>
                                                </div>
                                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${progress}%` }}
                                                        transition={{ duration: 0.5 }}
                                                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex flex-col gap-2 self-center">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); openLogSession(book); }}
                                                className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 hover:bg-emerald-200 transition-colors"
                                                title="Log Progress"
                                            >
                                                <Edit3 className="w-5 h-5 text-emerald-600" />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedBook(book);
                                                    setShowInsightsModal(true);
                                                }}
                                                className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 hover:bg-amber-200 transition-colors"
                                                title="Book Insights"
                                            >
                                                <Lightbulb className="w-5 h-5 text-amber-600" />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Completed Books */}
            {completedBooks.length > 0 && (
                <div className="px-5 py-4">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">Completed</h2>
                        <button className="text-sm text-emerald-600 font-medium flex items-center gap-1">
                            View All <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5">
                        {completedBooks.map((book, index) => {
                            const hasInsights = store.getBookInsight(book.id);
                            return (
                                <motion.div
                                    key={book.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="flex-shrink-0 cursor-pointer"
                                    onClick={() => {
                                        setSelectedBook(book);
                                        setShowInsightsModal(true);
                                    }}
                                >
                                    <div className={`w-20 h-28 rounded-lg bg-gradient-to-br ${book.coverColor} flex items-center justify-center shadow-md relative group hover:shadow-lg transition-shadow`}>
                                        {(book.coverImage || book.pdfCoverImage) ? (
                                            <img
                                                src={book.coverImage || book.pdfCoverImage}
                                                alt={book.title}
                                                className="w-full h-full object-cover rounded-lg"
                                            />
                                        ) : (
                                            <BookMarked className="w-8 h-8 text-white/80" />
                                        )}
                                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                            <Check className="w-3 h-3 text-white" />
                                        </div>
                                        {hasInsights && (
                                            <div className="absolute -bottom-1 -left-1 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
                                                <Lightbulb className="w-3 h-3 text-white" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 rounded-lg flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100">
                                            <Lightbulb className="w-6 h-6 text-white" />
                                        </div>
                                    </div>
                                    <p className="mt-2 text-xs font-medium text-gray-700 truncate w-20">{book.title}</p>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Recent Sessions */}
            {sessions.length > 0 && (
                <div className="px-5 py-4">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">Recent Sessions</h2>
                    </div>

                    <div className="space-y-3">
                        {sessions.slice(0, 5).map((session: ReadingSession, index: number) => {
                            const book = books.find(b => b.id === session.bookId);

                            return (
                                <motion.div
                                    key={session.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${book?.coverColor || 'from-gray-400 to-gray-500'} flex items-center justify-center`}>
                                            <Bookmark className="w-5 h-5 text-white/80" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900 text-sm">{book?.title || 'Unknown Book'}</p>
                                            <p className="text-xs text-gray-500">
                                                {session.pagesRead} pages • {new Date(session.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>
                                    {session.note && (
                                        <p className="mt-2 text-sm text-gray-600 bg-gray-50 rounded-lg p-2">
                                            {session.note}
                                        </p>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            )}



            {/* Add Book Modal */}
            <AnimatePresence>
                {showAddBookModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end justify-center"
                        onClick={() => setShowAddBookModal(false)}
                    >
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-md bg-white rounded-t-3xl p-6"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-gray-900">Add Book</h3>
                                <button
                                    onClick={() => setShowAddBookModal(false)}
                                    className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
                                >
                                    <X className="w-4 h-4 text-gray-600" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-2 block">Book Title</label>
                                    <input
                                        type="text"
                                        value={newBookTitle}
                                        onChange={(e) => setNewBookTitle(e.target.value)}
                                        placeholder="e.g., Atomic Habits"
                                        className="w-full p-4 bg-gray-50 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-2 block">Author</label>
                                    <input
                                        type="text"
                                        value={newBookAuthor}
                                        onChange={(e) => setNewBookAuthor(e.target.value)}
                                        placeholder="e.g., James Clear"
                                        className="w-full p-4 bg-gray-50 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-2 block">Total Pages</label>
                                    <input
                                        type="number"
                                        value={newBookPages}
                                        onChange={(e) => setNewBookPages(e.target.value)}
                                        placeholder="e.g., 320"
                                        className="w-full p-4 bg-gray-50 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                    />
                                </div>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleAddBook}
                                disabled={!newBookTitle.trim() || !newBookAuthor.trim() || !newBookPages}
                                className="w-full mt-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold shadow-lg disabled:opacity-50"
                            >
                                Add Book
                            </motion.button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Log Session Modal */}
            <AnimatePresence>
                {showLogSessionModal && selectedBook && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end justify-center"
                        onClick={() => setShowLogSessionModal(false)}
                    >
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-md bg-white rounded-t-3xl p-6"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">Log Reading</h3>
                                    <p className="text-sm text-gray-500">{selectedBook.title}</p>
                                </div>
                                <button
                                    onClick={() => setShowLogSessionModal(false)}
                                    className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
                                >
                                    <X className="w-4 h-4 text-gray-600" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                                        Pages Read (Currently on page {selectedBook.currentPage})
                                    </label>
                                    <input
                                        type="number"
                                        value={pagesRead}
                                        onChange={(e) => setPagesRead(e.target.value)}
                                        placeholder="e.g., 25"
                                        className="w-full p-4 bg-gray-50 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                    />
                                    {pagesRead && (
                                        <p className="text-xs text-gray-500 mt-2">
                                            You'll be on page {selectedBook.currentPage + parseInt(pagesRead || '0')} of {selectedBook.totalPages}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-2 block">Notes / Key Insights</label>
                                    <textarea
                                        value={sessionNote}
                                        onChange={(e) => setSessionNote(e.target.value)}
                                        placeholder="Any quotes, thoughts, or takeaways?"
                                        className="w-full p-4 bg-gray-50 rounded-xl text-gray-900 placeholder:text-gray-400 resize-none h-24 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                    />
                                </div>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleLogSession}
                                disabled={!pagesRead}
                                className="w-full mt-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold shadow-lg disabled:opacity-50"
                            >
                                Save Session
                            </motion.button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Book Insights Modal */}
            {selectedBook && (
                <BookInsightsModal
                    book={selectedBook}
                    isOpen={showInsightsModal}
                    onClose={() => {
                        setShowInsightsModal(false);
                    }}
                />
            )}
        </div>
    );
};

export default ReadingSystem;
