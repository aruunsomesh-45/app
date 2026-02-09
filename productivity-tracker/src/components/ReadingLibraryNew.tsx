import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    ArrowLeft, FolderPlus, Folder, FolderOpen, BookOpen,
    Search, Grid, List, ChevronRight, ChevronDown,
    X, Check, Edit3, Trash2, Upload, BookPlus, FileUp, Eye, Loader2
} from 'lucide-react';
import { useLifeTracker } from '../utils/lifeTrackerStore';
import type { ReadingFolder, Book } from '../utils/lifeTrackerStore';
import { openPdfInNewTab, extractPdfCover } from '../utils/pdfService';
import Button from './ui/Button';
import { useContentProtection } from '../contexts/ContentProtectionContext';
import { checkKeywords } from '../services/contentFilter';

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

const FOLDER_COLORS = [
    'bg-indigo-500', 'bg-purple-500', 'bg-pink-500',
    'bg-emerald-500', 'bg-blue-500', 'bg-orange-500',
    'bg-slate-600', 'bg-rose-500'
];

const ReadingLibraryNew: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const store = useLifeTracker();
    const { settings, logBlockedAttempt } = useContentProtection();
    const folders = store.getFolders();

    // View States
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [expandedFolderId, setExpandedFolderId] = useState<string | null>(null);

    // Handle navigation from Currently Reading - auto-expand folder
    useEffect(() => {
        if (location.state?.expandFolderId) {
            setExpandedFolderId(location.state.expandFolderId);

            // If scrollToBookId is provided, optionally open the PDF after a delay
            if (location.state.scrollToBookId) {
                const book = store.getBooks().find(b => b.id === location.state.scrollToBookId);
                if (book?.pdfDataUrl) {
                    // Give time for folder to expand, then open PDF
                    setTimeout(() => {
                        openPdfInNewTab(book.pdfDataUrl!, book.title);
                    }, 500);
                }
            }

            // Clear the state after handling it
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.state, location.pathname, navigate, store]);

    // Modal States
    const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
    const [showEditFolderModal, setShowEditFolderModal] = useState(false);
    const [showAddBookModal, setShowAddBookModal] = useState(false);
    const [showUploadPdfModal, setShowUploadPdfModal] = useState(false);
    const [showUploadCoverModal, setShowUploadCoverModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<{ type: 'folder' | 'book'; id: string } | null>(null);

    // Edit targets
    const [editingFolder, setEditingFolder] = useState<ReadingFolder | null>(null);
    const [targetFolderId, setTargetFolderId] = useState<string | null>(null);
    const [targetBookId, setTargetBookId] = useState<string | null>(null);

    // Form States - Folder
    const [folderName, setFolderName] = useState('');
    const [folderDesc, setFolderDesc] = useState('');
    const [folderColor, setFolderColor] = useState('bg-indigo-500');

    // Form States - Book
    const [bookTitle, setBookTitle] = useState('');
    const [bookAuthor, setBookAuthor] = useState('');
    const [bookPages, setBookPages] = useState('');
    const [bookDescription, setBookDescription] = useState('');

    // File upload - PDF
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    // File upload - Cover Image
    const coverInputRef = useRef<HTMLInputElement>(null);
    const [selectedCoverFile, setSelectedCoverFile] = useState<File | null>(null);
    const [coverPreview, setCoverPreview] = useState<string | null>(null);
    const [isProcessingPdf, setIsProcessingPdf] = useState(false);

    // Handlers
    const handleCreateFolder = () => {
        if (!folderName.trim()) return;

        // Content Protection
        if (settings.protectionLevel !== 'off') {
            const protectionResult = checkKeywords(
                `${folderName} ${folderDesc}`,
                settings.protectionLevel,
                settings.customBlockedKeywords
            );
            if (protectionResult.blocked) {
                alert(`Cannot create folder: ${protectionResult.reason}`);
                logBlockedAttempt(folderName, 'keyword', protectionResult.reason);
                return;
            }
        }

        store.addFolder({
            name: folderName.trim(),
            description: folderDesc.trim(),
            color: folderColor,
            icon: 'folder'
        });
        resetFolderForm();
        setShowCreateFolderModal(false);
    };

    const handleUpdateFolder = () => {
        if (!editingFolder || !folderName.trim()) return;

        // Content Protection
        if (settings.protectionLevel !== 'off') {
            const protectionResult = checkKeywords(
                `${folderName} ${folderDesc}`,
                settings.protectionLevel,
                settings.customBlockedKeywords
            );
            if (protectionResult.blocked) {
                alert(`Cannot update folder: ${protectionResult.reason}`);
                logBlockedAttempt(folderName, 'keyword', protectionResult.reason);
                return;
            }
        }

        store.updateFolder(editingFolder.id, {
            name: folderName.trim(),
            description: folderDesc.trim(),
            color: folderColor,
        });
        resetFolderForm();
        setShowEditFolderModal(false);
        setEditingFolder(null);
    };

    const handleDeleteFolder = (folderId: string) => {
        store.deleteFolder(folderId);
        setShowDeleteConfirm(null);
        if (expandedFolderId === folderId) setExpandedFolderId(null);
    };

    const handleAddBook = () => {
        if (!targetFolderId || !bookTitle.trim() || !bookPages) return;

        // Content Protection
        if (settings.protectionLevel !== 'off') {
            const protectionResult = checkKeywords(
                `${bookTitle} ${bookAuthor} ${bookDescription}`,
                settings.protectionLevel,
                settings.customBlockedKeywords
            );
            if (protectionResult.blocked) {
                alert(`Cannot add book: ${protectionResult.reason}`);
                logBlockedAttempt(bookTitle, 'keyword', protectionResult.reason);
                return;
            }
        }

        const randomColor = COVER_COLORS[Math.floor(Math.random() * COVER_COLORS.length)];
        store.addBookToFolder(targetFolderId, {
            title: bookTitle.trim(),
            author: bookAuthor.trim() || 'Unknown Author',
            totalPages: parseInt(bookPages),
            coverColor: randomColor,
            description: bookDescription.trim(),
        });
        resetBookForm();
        setShowAddBookModal(false);
    };

    const handleDeleteBook = (bookId: string) => {
        store.deleteBook(bookId);
        setShowDeleteConfirm(null);
    };

    // Simplified PDF file selection - NO automatic extraction
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
        }
    };

    // PDF upload with automatic cover extraction
    const handleUploadPdf = async () => {
        if (!targetBookId || !selectedFile) return;

        console.log('=== Uploading PDF with Auto Cover Extraction ===');
        console.log('File:', selectedFile.name);
        console.log('Size:', (selectedFile.size / 1024).toFixed(2), 'KB');

        try {
            // 1. Process PDF (extract cover)
            const reader = new FileReader();
            reader.onload = async () => {
                try {
                    const pdfDataUrl = reader.result as string;
                    console.log('PDF converted to data URL for extraction');
                    setIsProcessingPdf(true);

                    // Try to extract cover
                    let coverImage: string | undefined;
                    try {
                        console.log('Extracting cover page...');
                        coverImage = await extractPdfCover(pdfDataUrl);
                        console.log('✅ Cover extracted successfully');

                        // If we have a cover image, upload it too
                        if (coverImage) {
                            // This part is tricky if coverImage is data URL. 
                            // We might want to upload it to 'book-covers' to save space?
                            // valid point, but for now let's persist existing behavior for cover, 
                            // or effectively, we can upload it later.
                            // Actually, store.updateBookCover handles base64 fine.
                        }
                    } catch (coverError) {
                        console.warn('⚠️ Could not extract cover during upload:', coverError);
                    }

                    // 2. Upload PDF to Supabase Storage
                    console.log('Uploading PDF to Supabase Storage...');
                    // @ts-ignore
                    const pdfPath = await store.uploadFile(selectedFile, 'book-pdfs');

                    if (pdfPath) {
                        console.log('✅ PDF uploaded to storage:', pdfPath);

                        // 3. Save to Store (with path, empty dataUrl to save local storage space)
                        store.uploadPdfToBook(
                            targetBookId,
                            selectedFile.name,
                            selectedFile.size,
                            "", // Empty data URL since we have path
                            coverImage,
                            pdfPath
                        );
                        // Also update cover if we extracted one
                        if (coverImage) {
                            store.updateBookCover(targetBookId, coverImage);
                        }

                        console.log('✅ PDF info saved to store');

                        // Reset state
                        setSelectedFile(null);
                        setShowUploadPdfModal(false);
                        setTargetBookId(null);
                    } else {
                        throw new Error("Failed to upload PDF to storage");
                    }
                } catch (error) {
                    console.error('❌ Error processing PDF:', error);
                    alert('Failed to process PDF. Please try again.');
                } finally {
                    setIsProcessingPdf(false);
                }
            };
            reader.onerror = () => {
                console.error('❌ Error reading file');
                alert('Failed to read PDF file. Please try again.');
            };
            reader.readAsDataURL(selectedFile);
        } catch (error) {
            console.error('❌ Error uploading PDF:', error);
            alert('Failed to upload PDF. Please try again.');
            setIsProcessingPdf(false);
        }
    };

    const handleOpenPdf = async (book: Book) => {
        console.log('=== Opening PDF ===');
        console.log('Book:', book.title);

        try {
            if (book.pdfPath) {
                console.log('Found PDF Path in Storage:', book.pdfPath);
                // @ts-ignore
                const signedUrl = await store.getPrivateFileUrl('book-pdfs', book.pdfPath);
                if (signedUrl) {
                    console.log('Generated Signed URL, opening...');
                    openPdfInNewTab(signedUrl, book.title);
                    return;
                } else {
                    console.error('Failed to generate signed URL');
                    alert('Could not access PDF file from storage.');
                    return;
                }
            } else if (book.pdfDataUrl) {
                console.log('Found PDF Data URL');
                openPdfInNewTab(book.pdfDataUrl, book.title);
            } else {
                console.warn('⚠️ No PDF found for book:', book.title);
                alert('No PDF attached to this book.');
            }
        } catch (error) {
            console.error('❌ Error opening PDF:', error);
            alert(`Failed to open PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };


    // Manual cover image upload handlers
    const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            setSelectedCoverFile(file);

            // Create preview
            const reader = new FileReader();
            reader.onload = () => {
                setCoverPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleExtractCoverFromPdf = async () => {
        if (!targetBookId) return;
        const book = store.getBooks().find(b => b.id === targetBookId);
        if (!book?.pdfDataUrl) return;

        try {
            setIsProcessingPdf(true);
            console.log('Extracting cover from existing PDF...');
            const coverImage = await extractPdfCover(book.pdfDataUrl);

            if (coverImage) {
                setCoverPreview(coverImage);
                console.log('✅ Cover extracted successfully');
            } else {
                alert('Could not extract cover from this PDF. The file might be protected or incompatible.');
            }
        } catch (error: unknown) {
            console.error('Error extracting cover:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            alert(`Error extracting cover: ${errorMessage}`);
        } finally {
            setIsProcessingPdf(false);
        }
    };

    const handleUploadCover = async () => {
        if (!targetBookId || !coverPreview) return;

        setIsProcessingPdf(true); // Reuse loader or add new one
        console.log('Starting cover upload...');

        try {
            let fileToUpload: File | null = selectedCoverFile;

            // If no file selected but we have a preview (e.g. from PDF extraction), convert base64 to file
            if (!fileToUpload && coverPreview.startsWith('data:')) {
                try {
                    const res = await fetch(coverPreview);
                    const blob = await res.blob();
                    fileToUpload = new File([blob], `cover-${targetBookId}.jpg`, { type: 'image/jpeg' });
                } catch (e) {
                    console.error('Error converting preview to file:', e);
                }
            }

            let coverUrl = coverPreview;

            if (fileToUpload) {
                console.log('Uploading file to Supabase Storage...');
                // @ts-ignore - method added recently
                const uploadedUrl = await store.uploadFile(fileToUpload, 'book-covers');
                if (uploadedUrl) {
                    console.log('Upload successful:', uploadedUrl);
                    coverUrl = uploadedUrl;
                } else {
                    console.error('Upload failed, falling back to base64');
                }
            }

            // Update the book's coverImage in the store
            store.updateBookCover(targetBookId, coverUrl);

            // Reset state
            setCoverPreview(null);
            setSelectedCoverFile(null);
            setShowUploadCoverModal(false);
            setTargetBookId(null);
        } catch (error) {
            console.error('Error in handleUploadCover:', error);
            alert('Failed to upload cover image.');
        } finally {
            setIsProcessingPdf(false);
        }
    };

    const openUploadCover = (bookId: string) => {
        setTargetBookId(bookId);
        setShowUploadCoverModal(true);
    };

    const resetFolderForm = () => {
        setFolderName('');
        setFolderDesc('');
        setFolderColor('bg-indigo-500');
    };

    const resetBookForm = () => {
        setBookTitle('');
        setBookAuthor('');
        setBookPages('');
        setBookDescription('');
        setTargetFolderId(null);
    };

    const openEditFolder = (folder: ReadingFolder) => {
        setEditingFolder(folder);
        setFolderName(folder.name);
        setFolderDesc(folder.description || '');
        setFolderColor(folder.color || 'bg-indigo-500');
        setShowEditFolderModal(true);
    };

    const openAddBook = (folderId: string) => {
        setTargetFolderId(folderId);
        setShowAddBookModal(true);
    };

    const openUploadPdf = (bookId: string) => {
        setTargetBookId(bookId);
        setShowUploadPdfModal(true);
    };

    const toggleFolder = (folderId: string) => {
        setExpandedFolderId(expandedFolderId === folderId ? null : folderId);
    };

    const filteredFolders = folders.filter(f =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-indigo-50/30 pb-24">
            {/* Header - Fixed with proper spacing */}
            <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-slate-100 shadow-sm">
                <div className="px-5 py-4 flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-slate-700" />
                    </button>
                    <div className="flex-1">
                        <h1 className="text-xl font-bold text-slate-900">Reading Library</h1>
                        <p className="text-xs text-slate-500">{folders.length} folders</p>
                    </div>
                </div>
            </div>

            {/* Workflow Guide Banner */}
            <div className="px-5 pt-4">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-4 text-white shadow-lg shadow-indigo-200/50">
                    <p className="text-xs font-semibold uppercase tracking-wider opacity-80 mb-1">Workflow</p>
                    <div className="flex items-center gap-2 text-sm">
                        <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs font-bold">1</span>
                        <span>Create Folder</span>
                        <ChevronRight className="w-4 h-4 opacity-60" />
                        <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs font-bold">2</span>
                        <span>Add Book</span>
                        <ChevronRight className="w-4 h-4 opacity-60" />
                        <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs font-bold">3</span>
                        <span>Upload PDF</span>
                    </div>
                </div>
            </div>

            {/* Search & View Controls */}
            <div className="px-5 py-4">
                <div className="flex items-center gap-3">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search folders..."
                            className="w-full pl-11 pr-4 py-3 bg-slate-100 border-none rounded-xl text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                        />
                    </div>
                    <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <Grid className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <List className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Create Folder CTA */}
            <div className="px-5 mb-4">
                <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setShowCreateFolderModal(true)}
                    className="w-full p-4 bg-white border-2 border-dashed border-indigo-200 rounded-2xl flex items-center justify-center gap-3 text-indigo-600 font-medium hover:border-indigo-400 hover:bg-indigo-50/50 transition-all group"
                >
                    <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <FolderPlus className="w-5 h-5" />
                    </div>
                    <span>Create New Folder</span>
                </motion.button>
            </div>

            {/* Folders Section */}
            <div className="px-5">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Your Folders</h2>

                {filteredFolders.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-200">
                        <Folder className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                        <p className="text-slate-500 font-medium mb-2">No folders yet</p>
                        <p className="text-sm text-slate-400 mb-4">Create a folder to start organizing your books</p>
                        <Button
                            onClick={() => setShowCreateFolderModal(true)}
                            variant="primary"
                            size="md"
                        >
                            Create Your First Folder
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredFolders.map((folder) => {
                            const isExpanded = expandedFolderId === folder.id;
                            const booksInFolder = store.getBooksInFolder(folder.id);

                            return (
                                <motion.div
                                    key={folder.id}
                                    layout
                                    className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
                                >
                                    {/* Folder Header */}
                                    <div
                                        className="p-4 flex items-center gap-4 cursor-pointer hover:bg-slate-50 transition-colors"
                                        onClick={() => toggleFolder(folder.id)}
                                    >
                                        <div className={`w-12 h-12 ${folder.color || 'bg-indigo-500'} rounded-xl flex items-center justify-center shadow-md`}>
                                            {isExpanded ? (
                                                <FolderOpen className="w-6 h-6 text-white" />
                                            ) : (
                                                <Folder className="w-6 h-6 text-white" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-slate-900 truncate">{folder.name}</h3>
                                            <p className="text-xs text-slate-500">
                                                {booksInFolder.length} {booksInFolder.length === 1 ? 'book' : 'books'}
                                                {folder.description && ` • ${folder.description}`}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); openEditFolder(folder); }}
                                                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                            >
                                                <Edit3 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm({ type: 'folder', id: folder.id }); }}
                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                            <motion.div
                                                animate={{ rotate: isExpanded ? 180 : 0 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <ChevronDown className="w-5 h-5 text-slate-400" />
                                            </motion.div>
                                        </div>
                                    </div>

                                    {/* Folder Content - Books */}
                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3 }}
                                                className="border-t border-slate-100"
                                            >
                                                <div className="p-4 bg-slate-50/50">
                                                    {/* Add Book Button */}
                                                    <button
                                                        onClick={() => openAddBook(folder.id)}
                                                        className="w-full mb-4 p-3 bg-white border border-dashed border-emerald-200 rounded-xl flex items-center justify-center gap-2 text-emerald-600 font-medium hover:border-emerald-400 hover:bg-emerald-50/50 transition-all text-sm"
                                                    >
                                                        <BookPlus className="w-4 h-4" />
                                                        Add Book to Folder
                                                    </button>

                                                    {/* Books List */}
                                                    {booksInFolder.length === 0 ? (
                                                        <div className="text-center py-6 text-slate-400 text-sm">
                                                            <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-50" />
                                                            <p>No books in this folder yet</p>
                                                        </div>
                                                    ) : (
                                                        <div className={viewMode === 'grid' ? 'grid grid-cols-2 gap-3' : 'space-y-3'}>
                                                            {booksInFolder.map((book) => (
                                                                <motion.div
                                                                    key={book.id}
                                                                    layout
                                                                    onClick={() => book.pdfDataUrl && handleOpenPdf(book)}
                                                                    className={`bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden ${book.pdfDataUrl ? 'cursor-pointer hover:shadow-md transition-shadow' : ''
                                                                        } ${viewMode === 'grid' ? 'p-3' : 'p-3 flex items-center gap-3'}`}
                                                                >
                                                                    {/* Book Cover */}
                                                                    <div
                                                                        className={`rounded-lg overflow-hidden shadow relative ${viewMode === 'grid' ? 'w-full aspect-[3/4] mb-3' : 'w-14 h-20 flex-shrink-0'
                                                                            }`}
                                                                    >
                                                                        {(book.coverImage || book.pdfCoverImage) ? (
                                                                            // Display manual or auto cover
                                                                            <img
                                                                                src={book.coverImage || book.pdfCoverImage}
                                                                                alt={book.title}
                                                                                className="w-full h-full object-cover"
                                                                            />
                                                                        ) : (
                                                                            // Fallback gradient
                                                                            <div className={`w-full h-full bg-gradient-to-br ${book.coverColor} flex items-center justify-center`}>
                                                                                <BookOpen className={`text-white/80 ${viewMode === 'grid' ? 'w-10 h-10' : 'w-6 h-6'}`} />
                                                                            </div>
                                                                        )}
                                                                        {book.pdfDataUrl && (
                                                                            <div className="absolute top-1 right-1 bg-emerald-500 text-white rounded-full p-1">
                                                                                <Eye className="w-2.5 h-2.5" />
                                                                            </div>
                                                                        )}
                                                                    </div>

                                                                    {/* Book Info */}
                                                                    <div className="flex-1 min-w-0">
                                                                        <h4 className="font-semibold text-slate-900 text-sm truncate">{book.title}</h4>
                                                                        <p className="text-xs text-slate-500 truncate">{book.author}</p>
                                                                        <p className="text-[10px] text-slate-400 mt-1">{book.totalPages} pages</p>

                                                                        {/* Action Buttons Row */}
                                                                        <div className="mt-2 flex gap-1 flex-wrap">
                                                                            {!book.coverImage && (
                                                                                <button
                                                                                    onClick={(e) => { e.stopPropagation(); openUploadCover(book.id); }}
                                                                                    className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium rounded-md bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors"
                                                                                    title="Upload book cover"
                                                                                >
                                                                                    <Upload className="w-3 h-3" />
                                                                                    Cover
                                                                                </button>
                                                                            )}

                                                                            {!book.pdfDataUrl ? (
                                                                                <button
                                                                                    onClick={(e) => { e.stopPropagation(); openUploadPdf(book.id); }}
                                                                                    className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium rounded-md bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
                                                                                    title="Upload PDF file"
                                                                                >
                                                                                    <FileUp className="w-3 h-3" />
                                                                                    PDF
                                                                                </button>
                                                                            ) : (
                                                                                <button
                                                                                    onClick={(e) => { e.stopPropagation(); handleOpenPdf(book); }}
                                                                                    className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium rounded-md bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                                                                                    title="Open PDF in browser"
                                                                                >
                                                                                    <Eye className="w-3 h-3" />
                                                                                    Open
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                    </div>

                                                                    {/* Delete Button */}
                                                                    <div className={`flex gap-1 ${viewMode === 'grid' ? 'mt-2 justify-end' : 'self-center'}`}>
                                                                        <button
                                                                            onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm({ type: 'book', id: book.id }); }}
                                                                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                                            title="Delete book"
                                                                        >
                                                                            <Trash2 className="w-3.5 h-3.5" />
                                                                        </button>
                                                                    </div>
                                                                </motion.div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ==================== MODALS ==================== */}

            {/* Create Folder Modal */}
            <AnimatePresence>
                {showCreateFolderModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end justify-center px-4 pb-4"
                        onClick={() => { setShowCreateFolderModal(false); resetFolderForm(); }}
                    >
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900">New Folder</h3>
                                    <p className="text-sm text-slate-500">Step 1: Organize your books</p>
                                </div>
                                <button
                                    onClick={() => { setShowCreateFolderModal(false); resetFolderForm(); }}
                                    className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-5">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Folder Name *</label>
                                    <input
                                        type="text"
                                        value={folderName}
                                        onChange={(e) => setFolderName(e.target.value)}
                                        placeholder="e.g., Fiction, Self-Help, Programming"
                                        className="w-full p-4 bg-slate-50 border-none rounded-2xl text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                                        autoFocus
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Description</label>
                                    <textarea
                                        value={folderDesc}
                                        onChange={(e) => setFolderDesc(e.target.value)}
                                        placeholder="Optional description..."
                                        className="w-full p-4 bg-slate-50 border-none rounded-2xl text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 transition-all font-medium resize-none h-20"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block">Color</label>
                                    <div className="flex flex-wrap gap-3">
                                        {FOLDER_COLORS.map((color) => (
                                            <button
                                                key={color}
                                                onClick={() => setFolderColor(color)}
                                                className={`w-10 h-10 rounded-xl transition-all ${color} ${folderColor === color
                                                    ? 'ring-4 ring-offset-2 ring-indigo-500 scale-110'
                                                    : 'opacity-60 hover:opacity-100 hover:scale-105'
                                                    }`}
                                            >
                                                {folderColor === color && <Check className="w-5 h-5 text-white mx-auto" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <Button
                                onClick={handleCreateFolder}
                                disabled={!folderName.trim()}
                                variant="primary"
                                size="lg"
                                fullWidth
                                className="mt-8"
                            >
                                Create Folder
                            </Button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Edit Folder Modal */}
            <AnimatePresence>
                {showEditFolderModal && editingFolder && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end justify-center px-4 pb-4"
                        onClick={() => { setShowEditFolderModal(false); setEditingFolder(null); resetFolderForm(); }}
                    >
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900">Edit Folder</h3>
                                    <p className="text-sm text-slate-500">Update folder details</p>
                                </div>
                                <button
                                    onClick={() => { setShowEditFolderModal(false); setEditingFolder(null); resetFolderForm(); }}
                                    className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-5">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Folder Name *</label>
                                    <input
                                        type="text"
                                        value={folderName}
                                        onChange={(e) => setFolderName(e.target.value)}
                                        className="w-full p-4 bg-slate-50 border-none rounded-2xl text-slate-900 focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Description</label>
                                    <textarea
                                        value={folderDesc}
                                        onChange={(e) => setFolderDesc(e.target.value)}
                                        className="w-full p-4 bg-slate-50 border-none rounded-2xl text-slate-900 focus:ring-2 focus:ring-indigo-500 transition-all font-medium resize-none h-20"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block">Color</label>
                                    <div className="flex flex-wrap gap-3">
                                        {FOLDER_COLORS.map((color) => (
                                            <button
                                                key={color}
                                                onClick={() => setFolderColor(color)}
                                                className={`w-10 h-10 rounded-xl transition-all ${color} ${folderColor === color
                                                    ? 'ring-4 ring-offset-2 ring-indigo-500 scale-110'
                                                    : 'opacity-60 hover:opacity-100'
                                                    }`}
                                            >
                                                {folderColor === color && <Check className="w-5 h-5 text-white mx-auto" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <Button
                                onClick={handleUpdateFolder}
                                disabled={!folderName.trim()}
                                variant="primary"
                                size="lg"
                                fullWidth
                                className="mt-8"
                            >
                                Save Changes
                            </Button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Add Book Modal */}
            <AnimatePresence>
                {showAddBookModal && targetFolderId && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end justify-center px-4 pb-4"
                        onClick={() => { setShowAddBookModal(false); resetBookForm(); }}
                    >
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl max-h-[85vh] overflow-y-auto"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900">Add Book</h3>
                                    <p className="text-sm text-slate-500">Step 2: Add to "{folders.find(f => f.id === targetFolderId)?.name}"</p>
                                </div>
                                <button
                                    onClick={() => { setShowAddBookModal(false); resetBookForm(); }}
                                    className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-5">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Book Title *</label>
                                    <input
                                        type="text"
                                        value={bookTitle}
                                        onChange={(e) => setBookTitle(e.target.value)}
                                        placeholder="e.g., Atomic Habits"
                                        className="w-full p-4 bg-slate-50 border-none rounded-2xl text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                                        autoFocus
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Author</label>
                                    <input
                                        type="text"
                                        value={bookAuthor}
                                        onChange={(e) => setBookAuthor(e.target.value)}
                                        placeholder="e.g., James Clear"
                                        className="w-full p-4 bg-slate-50 border-none rounded-2xl text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Total Pages *</label>
                                    <input
                                        type="number"
                                        value={bookPages}
                                        onChange={(e) => setBookPages(e.target.value)}
                                        placeholder="e.g., 320"
                                        className="w-full p-4 bg-slate-50 border-none rounded-2xl text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Description / Notes</label>
                                    <textarea
                                        value={bookDescription}
                                        onChange={(e) => setBookDescription(e.target.value)}
                                        placeholder="Why are you reading this book?"
                                        className="w-full p-4 bg-slate-50 border-none rounded-2xl text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500 transition-all font-medium resize-none h-24"
                                    />
                                </div>
                            </div>

                            <Button
                                onClick={handleAddBook}
                                disabled={!bookTitle.trim() || !bookPages}
                                variant="primary"
                                size="lg"
                                fullWidth
                                className="mt-8 bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200"
                            >
                                Add Book
                            </Button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Upload PDF Modal */}
            <AnimatePresence>
                {showUploadPdfModal && targetBookId && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end justify-center px-4 pb-4"
                        onClick={() => { setShowUploadPdfModal(false); setSelectedFile(null); setTargetBookId(null); }}
                    >
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900">Upload PDF</h3>
                                    <p className="text-sm text-slate-500">Attach PDF to "{store.getBooks().find(b => b.id === targetBookId)?.title}"</p>
                                </div>
                                <button
                                    onClick={() => { setShowUploadPdfModal(false); setSelectedFile(null); setTargetBookId(null); }}
                                    className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* File Upload Area */}
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className={`p-8 border-2 border-dashed rounded-3xl text-center transition-all ${selectedFile
                                    ? 'border-emerald-500 bg-emerald-50 cursor-pointer'
                                    : 'border-slate-200 bg-slate-50 hover:border-indigo-400 hover:bg-indigo-50/50 cursor-pointer'
                                    }`}
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileSelect}
                                    className="hidden"
                                    accept=".pdf"
                                />

                                {selectedFile ? (
                                    <div>
                                        <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                                            <Check className="w-8 h-8 text-white" />
                                        </div>
                                        <p className="font-bold text-slate-900 truncate">{selectedFile.name}</p>
                                        <p className="text-sm text-emerald-600 font-medium mt-1">{formatFileSize(selectedFile.size)}</p>
                                        <p className="text-xs text-slate-400 mt-2">Tap to change file</p>
                                    </div>
                                ) : (
                                    <div>
                                        <div className="w-16 h-16 bg-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                            <FileUp className="w-8 h-8 text-slate-500" />
                                        </div>
                                        <p className="font-bold text-slate-900">Tap to select PDF file</p>
                                        <p className="text-sm text-slate-400 mt-1">PDF files only</p>
                                    </div>
                                )}
                            </div>

                            <div className="mt-8 flex gap-3">
                                <Button
                                    onClick={() => { setShowUploadPdfModal(false); setSelectedFile(null); setTargetBookId(null); }}
                                    disabled={isProcessingPdf}
                                    variant="secondary"
                                    size="lg"
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleUploadPdf}
                                    disabled={!selectedFile || isProcessingPdf}
                                    isLoading={isProcessingPdf}
                                    variant="primary"
                                    size="lg"
                                    className="flex-[2]"
                                >
                                    {isProcessingPdf ? 'Extracting Cover...' : 'Upload & Attach'}
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Upload Cover Image Modal */}
            <AnimatePresence>
                {showUploadCoverModal && targetBookId && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end justify-center px-4 pb-4"
                        onClick={() => { setShowUploadCoverModal(false); setCoverPreview(null); setSelectedCoverFile(null); setTargetBookId(null); }}
                    >
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900">Upload Book Cover</h3>
                                    <p className="text-sm text-slate-500">Add cover for "{store.getBooks().find(b => b.id === targetBookId)?.title}"</p>
                                </div>
                                <button
                                    onClick={() => { setShowUploadCoverModal(false); setCoverPreview(null); setSelectedCoverFile(null); setTargetBookId(null); }}
                                    className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Cover Preview */}
                            {coverPreview && (
                                <div className="mb-4 rounded-2xl overflow-hidden border-4 border-purple-200">
                                    <img
                                        src={coverPreview}
                                        alt="Cover preview"
                                        className="w-full aspect-[3/4] object-cover"
                                    />
                                </div>
                            )}

                            {/* File Upload Area */}
                            <div className="space-y-4">
                                {store.getBooks().find(b => b.id === targetBookId)?.pdfDataUrl && !coverPreview && (
                                    <button
                                        onClick={handleExtractCoverFromPdf}
                                        disabled={isProcessingPdf}
                                        className="w-full py-4 border-2 border-indigo-200 bg-indigo-50 text-indigo-700 rounded-3xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-100 transition-all disabled:opacity-50"
                                    >
                                        {isProcessingPdf ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <Eye className="w-5 h-5" />
                                        )}
                                        Extract Cover from PDF
                                    </button>
                                )}

                                <div
                                    onClick={() => coverInputRef.current?.click()}
                                    className={`p-8 border-2 border-dashed rounded-3xl text-center transition-all ${coverPreview
                                        ? 'border-purple-500 bg-purple-50 cursor-pointer'
                                        : 'border-slate-200 bg-slate-50 hover:border-purple-400 hover:bg-purple-50/50 cursor-pointer'
                                        }`}
                                >
                                    <input
                                        type="file"
                                        ref={coverInputRef}
                                        onChange={handleCoverSelect}
                                        className="hidden"
                                        accept="image/*"
                                    />

                                    {coverPreview ? (
                                        <div>
                                            <div className="w-16 h-16 bg-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                                                <Check className="w-8 h-8 text-white" />
                                            </div>
                                            <p className="font-bold text-slate-900">Cover selected!</p>
                                            <p className="text-xs text-slate-400 mt-2">Tap to change image</p>
                                        </div>
                                    ) : (
                                        <div>
                                            <div className="w-16 h-16 bg-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                                <Upload className="w-8 h-8 text-slate-500" />
                                            </div>
                                            <p className="font-bold text-slate-900">Select Cover Image</p>
                                            <p className="text-sm text-slate-400 mt-1">JPG, PNG, or WebP</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <Button
                                onClick={handleUploadCover}
                                disabled={!coverPreview || isProcessingPdf}
                                variant="primary"
                                size="lg"
                                fullWidth
                                className="mt-6 bg-purple-600 hover:bg-purple-700"
                            >
                                Set as Cover
                            </Button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {showDeleteConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center px-6"
                        onClick={() => setShowDeleteConfirm(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl text-center"
                        >
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trash2 className="w-8 h-8 text-red-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">
                                Delete {showDeleteConfirm.type === 'folder' ? 'Folder' : 'Book'}?
                            </h3>
                            <p className="text-sm text-slate-500 mb-6">
                                {showDeleteConfirm.type === 'folder'
                                    ? 'This will also delete all books inside this folder.'
                                    : 'This action cannot be undone.'}
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowDeleteConfirm(null)}
                                    className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        if (showDeleteConfirm.type === 'folder') {
                                            handleDeleteFolder(showDeleteConfirm.id);
                                        } else {
                                            handleDeleteBook(showDeleteConfirm.id);
                                        }
                                    }}
                                    className="flex-1 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors"
                                >
                                    Delete
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ReadingLibraryNew;
