import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    ArrowLeft, FolderPlus, FileUp, Folder, FileText,
    MoreVertical, Search, Grid, List, ChevronRight,
    X, Check, Info, BookPlus, PlusCircle
} from 'lucide-react';
import { useLifeTracker } from '../utils/lifeTrackerStore';

const ReadingLibrary: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const store = useLifeTracker();
    const folders = store.getFolders();
    const books = store.getBooks();

    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    // Modal States
    // Modal States
    const [showCreateFolderModal, setShowCreateFolderModal] = useState(location.state?.openModal === 'folder');
    const [showUploadPDFModal, setShowUploadPDFModal] = useState(location.state?.openModal === 'pdf');
    const [showAddBookModal, setShowAddBookModal] = useState(location.state?.openModal === 'book');

    // Form States
    const [folderName, setFolderName] = useState('');
    const [folderDesc, setFolderDesc] = useState('');
    const [folderColor, setFolderColor] = useState('bg-indigo-500');

    const [pdfTitle, setPdfTitle] = useState('');
    const [pdfAuthor, setPdfAuthor] = useState('');
    const [pdfPages, setPdfPages] = useState('');

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            if (!pdfTitle) setPdfTitle(file.name.replace(/\.[^/.]+$/, "")); // Remove extension
        }
    };

    const [bookTitle, setBookTitle] = useState('');
    const [bookAuthor, setBookAuthor] = useState('');
    const [bookPages, setBookPages] = useState('');

    const handleCreateFolder = () => {
        if (!folderName.trim()) return;
        store.addFolder({
            name: folderName.trim(),
            description: folderDesc.trim(),
            color: folderColor,
            icon: 'folder'
        });
        setFolderName('');
        setFolderDesc('');
        setShowCreateFolderModal(false);
    };

    const handleUploadPDF = () => {
        if (!pdfTitle.trim() || !pdfPages) return;
        store.addBook({
            title: pdfTitle.trim(),
            author: pdfAuthor.trim() || 'Unknown',
            totalPages: parseInt(pdfPages),
            coverColor: 'from-slate-700 to-slate-900', // PDF style cover
        });
        setPdfTitle('');
        setPdfAuthor('');
        setPdfPages('');
        setShowUploadPDFModal(false);
    };

    const handleAddBook = () => {
        if (!bookTitle.trim() || !bookPages) return;
        store.addBook({
            title: bookTitle.trim(),
            author: bookAuthor.trim() || 'Unknown',
            totalPages: parseInt(bookPages),
            coverColor: 'from-emerald-500 to-teal-600', // Book style cover
        });
        setBookTitle('');
        setBookAuthor('');
        setBookPages('');
        setShowAddBookModal(false);
    };

    const filteredBooks = books.filter(b =>
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.author.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const colors = [
        'bg-indigo-500', 'bg-purple-500', 'bg-pink-500',
        'bg-emerald-500', 'bg-blue-500', 'bg-orange-500',
        'bg-slate-500', 'bg-rose-500'
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] pb-24">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800">
                <div className="px-5 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Reading Library</h1>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium tracking-wide uppercase">Manage Documents & Folders</p>
                        </div>
                    </div>
                </div>

                {/* Search & Tabs */}
                <div className="px-5 pb-4 space-y-4">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search your library..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-2xl pl-11 pr-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 dark:text-white transition-all shadow-inner"
                        />
                    </div>
                </div>
            </div>

            <main className="px-5 py-6 space-y-8">
                {/* Actions Grid */}
                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={() => setShowCreateFolderModal(true)}
                        className="flex flex-col items-center justify-center gap-3 p-6 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-all group"
                    >
                        <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                            <FolderPlus className="w-6 h-6" />
                        </div>
                        <span className="text-sm font-bold text-slate-900 dark:text-white">New Folder</span>
                    </button>

                    <button
                        onClick={() => setShowUploadPDFModal(true)}
                        className="flex flex-col items-center justify-center gap-3 p-6 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-all group"
                    >
                        <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                            <FileUp className="w-6 h-6" />
                        </div>
                        <span className="text-sm font-bold text-slate-900 dark:text-white">Upload PDF</span>
                    </button>

                    <button
                        onClick={() => setShowAddBookModal(true)}
                        className="col-span-2 flex items-center justify-center gap-2 p-4 bg-indigo-600 rounded-3xl text-white shadow-lg shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 transition-all active:scale-95 group"
                    >
                        <PlusCircle className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                        <span className="font-bold">Add Physical Book</span>
                    </button>
                </div>

                {/* Folders Section */}
                {folders.length > 0 && (
                    <section>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Folders</h2>
                            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">{folders.length} active</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {folders.map((folder) => (
                                <motion.div
                                    key={folder.id}
                                    whileHover={{ y: -4 }}
                                    className="bg-white dark:bg-slate-800 p-4 rounded-3xl border border-slate-100 dark:border-slate-700/50 shadow-sm relative overflow-hidden group"
                                >
                                    <div className={`absolute top-0 left-0 w-1.5 h-full ${folder.color}`}></div>
                                    <div className="flex items-start justify-between mb-3">
                                        <div className={`p-2 rounded-xl bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-400`}>
                                            <Folder className="w-5 h-5" />
                                        </div>
                                        <button className="text-slate-300 hover:text-slate-500 transition-colors">
                                            <MoreVertical className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <h3 className="font-bold text-slate-900 dark:text-white truncate">{folder.name}</h3>
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-1">{folder.bookIds.length} items</p>
                                </motion.div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Documents / All Books Section */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Documents</h2>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                            >
                                <Grid className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                            >
                                <List className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {filteredBooks.length === 0 ? (
                        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
                            <FileText className="w-12 h-12 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
                            <p className="text-slate-500 dark:text-slate-400 font-medium">No documents found</p>
                        </div>
                    ) : (
                        <div className={viewMode === 'grid' ? "grid grid-cols-2 gap-4" : "space-y-3"}>
                            {filteredBooks.map((book) => (
                                <motion.div
                                    key={book.id}
                                    layout
                                    className={`bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 shadow-sm transition-all ${viewMode === 'grid' ? 'p-4 rounded-3xl' : 'p-3 rounded-2xl flex items-center gap-4'
                                        }`}
                                >
                                    <div className={`${viewMode === 'grid' ? 'w-full aspect-[3/4] mb-4' : 'w-12 h-16'} rounded-xl bg-gradient-to-br ${book.coverColor} flex items-center justify-center shadow-md flex-shrink-0`}>
                                        <FileText className={`${viewMode === 'grid' ? 'w-10 h-10' : 'w-5 h-5'} text-white/80`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-slate-900 dark:text-white truncate text-sm">{book.title}</h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate mb-2">{book.author}</p>
                                        <div className="flex items-center justify-between text-[10px]">
                                            <span className="text-slate-400 font-medium">{Math.round((book.currentPage / book.totalPages) * 100)}% read</span>
                                            <ChevronRight className="w-3 h-3 text-slate-300" />
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </section>
            </main>

            {/* Create Folder Modal */}
            <AnimatePresence>
                {showCreateFolderModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end justify-center px-4 pb-4"
                        onClick={() => setShowCreateFolderModal(false)}
                    >
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">New Folder</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Organize your reading materials</p>
                                </div>
                                <button
                                    onClick={() => setShowCreateFolderModal(false)}
                                    className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Folder Name</label>
                                    <input
                                        type="text"
                                        value={folderName}
                                        onChange={(e) => setFolderName(e.target.value)}
                                        placeholder="e.g., Artificial Intelligence"
                                        className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                                        autoFocus
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Description (Optional)</label>
                                    <textarea
                                        value={folderDesc}
                                        onChange={(e) => setFolderDesc(e.target.value)}
                                        placeholder="What's inside this folder?"
                                        className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 transition-all font-medium resize-none h-24"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 block">Folder Color</label>
                                    <div className="flex flex-wrap gap-3">
                                        {colors.map((color) => (
                                            <button
                                                key={color}
                                                onClick={() => setFolderColor(color)}
                                                className={`w-10 h-10 rounded-xl transition-all ${color} ${folderColor === color ? 'ring-4 ring-offset-4 ring-indigo-500 dark:ring-offset-slate-900' : 'scale-90 opacity-60 hover:opacity-100 hover:scale-100'
                                                    }`}
                                            >
                                                {folderColor === color && <Check className="w-5 h-5 text-white mx-auto" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleCreateFolder}
                                disabled={!folderName.trim()}
                                className="w-full mt-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                            >
                                Create Folder
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Upload PDF Modal */}
            <AnimatePresence>
                {showUploadPDFModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end justify-center px-4 pb-4"
                        onClick={() => setShowUploadPDFModal(false)}
                    >
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Upload Document</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">PDF, EPUB or Word documents</p>
                                </div>
                                <button
                                    onClick={() => setShowUploadPDFModal(false)}
                                    className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                {/* File Upload Area */}
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`p-8 border-2 border-dashed rounded-3xl text-center group cursor-pointer transition-colors relative overflow-hidden
                                        ${selectedFile
                                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10'
                                            : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:border-indigo-500'}`}
                                >
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileSelect}
                                        className="hidden"
                                        accept=".pdf,.epub,.docx"
                                    />

                                    {selectedFile ? (
                                        <div className="relative z-10">
                                            <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm text-emerald-500">
                                                <Check className="w-8 h-8" />
                                            </div>
                                            <p className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[200px] mx-auto">{selectedFile.name}</p>
                                            <p className="text-xs text-emerald-600 font-medium mt-1">Ready to upload</p>
                                        </div>
                                    ) : (
                                        <div className="relative z-10">
                                            <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm text-indigo-500 group-hover:scale-110 transition-transform">
                                                <FileUp className="w-8 h-8" />
                                            </div>
                                            <p className="text-sm font-bold text-slate-900 dark:text-white">Tap to browse files</p>
                                            <p className="text-xs text-slate-400 mt-1">Maximum size 50MB</p>
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Document Title</label>
                                        <input
                                            type="text"
                                            value={pdfTitle}
                                            onChange={(e) => setPdfTitle(e.target.value)}
                                            placeholder="e.g., Deep Work.pdf"
                                            className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Author</label>
                                        <input
                                            type="text"
                                            value={pdfAuthor}
                                            onChange={(e) => setPdfAuthor(e.target.value)}
                                            placeholder="Cal Newport"
                                            className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Pages</label>
                                        <input
                                            type="number"
                                            value={pdfPages}
                                            onChange={(e) => setPdfPages(e.target.value)}
                                            placeholder="290"
                                            className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                                        />
                                    </div>
                                </div>

                                <div className="p-4 bg-indigo-50 dark:bg-indigo-500/5 rounded-2xl flex items-start gap-3">
                                    <Info className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                                    <p className="text-xs text-indigo-700 dark:text-indigo-300 font-medium leading-relaxed">
                                        Uploads are simulated. Added documents will appear in your "Documents" list below.
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={handleUploadPDF}
                                disabled={!pdfTitle.trim() || !pdfPages}
                                className="w-full mt-10 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold shadow-lg shadow-emerald-200 dark:shadow-none transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                            >
                                Process Document
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Add Book Modal */}
            <AnimatePresence>
                {showAddBookModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end justify-center px-4 pb-4"
                        onClick={() => setShowAddBookModal(false)}
                    >
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Add Book</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Track a physical or kindle book</p>
                                </div>
                                <button
                                    onClick={() => setShowAddBookModal(false)}
                                    className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div className="p-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl bg-slate-50 dark:bg-slate-800/50 text-center flex items-center justify-center gap-3">
                                    <BookPlus className="w-6 h-6 text-indigo-500" />
                                    <span className="text-sm font-bold text-slate-600 dark:text-slate-300">Manual Entry</span>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Book Title</label>
                                        <input
                                            type="text"
                                            value={bookTitle}
                                            onChange={(e) => setBookTitle(e.target.value)}
                                            placeholder="e.g., The Psychology of Money"
                                            className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Author</label>
                                        <input
                                            type="text"
                                            value={bookAuthor}
                                            onChange={(e) => setBookAuthor(e.target.value)}
                                            placeholder="Morgan Housel"
                                            className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Pages</label>
                                        <input
                                            type="number"
                                            value={bookPages}
                                            onChange={(e) => setBookPages(e.target.value)}
                                            placeholder="242"
                                            className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleAddBook}
                                disabled={!bookTitle.trim() || !bookPages}
                                className="w-full mt-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                            >
                                Add to Library
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ReadingLibrary;
