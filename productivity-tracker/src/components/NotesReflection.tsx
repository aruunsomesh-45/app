import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Plus, Search, Tag,
    Dumbbell, Brain, BookOpen, Sparkles,
    Calendar, X, Edit3, Paperclip, FileText, Loader2
} from 'lucide-react';
import { useLifeTracker } from '../utils/lifeTrackerStore';
import type { LifeNote } from '../utils/lifeTrackerStore';

const SYSTEMS = [
    { id: 'workout', label: 'Workout', icon: Dumbbell, color: 'from-orange-500 to-red-500', bg: 'bg-orange-100', text: 'text-orange-600' },
    { id: 'meditation', label: 'Meditation', icon: Brain, color: 'from-purple-500 to-indigo-500', bg: 'bg-purple-100', text: 'text-purple-600' },
    { id: 'reading', label: 'Reading', icon: BookOpen, color: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-100', text: 'text-emerald-600' },
    { id: 'general', label: 'General', icon: Sparkles, color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-100', text: 'text-blue-600' },
] as const;

const MOOD_LABELS = ['😔', '😕', '😐', '🙂', '😊'];

const NotesReflection: React.FC = () => {
    const navigate = useNavigate();
    const store = useLifeTracker();
    const allNotes = store.getNotes();

    // State
    const [showAddNoteModal, setShowAddNoteModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterSystem, setFilterSystem] = useState<string | null>(null);

    // New Note Form
    const [noteContent, setNoteContent] = useState('');
    const [noteSystem, setNoteSystem] = useState<'workout' | 'meditation' | 'reading' | 'general'>('general');
    const [noteMood, setNoteMood] = useState<number | undefined>(undefined);
    const [noteTags, setNoteTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');
    const [attachmentPath, setAttachmentPath] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    // Filter notes
    const filteredNotes = allNotes.filter(note => {
        const matchesSearch = !searchQuery ||
            note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
            note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesSystem = !filterSystem || note.linkedSystem === filterSystem;
        return matchesSearch && matchesSystem;
    });

    // Group notes by date
    const groupedNotes = filteredNotes.reduce((groups, note) => {
        const date = note.date;
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(note);
        return groups;
    }, {} as Record<string, LifeNote[]>);

    const sortedDates = Object.keys(groupedNotes).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    const handleAddTag = () => {
        if (tagInput.trim() && !noteTags.includes(tagInput.trim())) {
            setNoteTags([...noteTags, tagInput.trim()]);
            setTagInput('');
        }
    };

    const handleRemoveTag = (tag: string) => {
        setNoteTags(noteTags.filter(t => t !== tag));
    };

    const handleSaveNote = () => {
        if (!noteContent.trim()) return;

        store.addNote({
            content: noteContent.trim(),
            linkedSystem: noteSystem,
            mood: noteMood,
            tags: noteTags,
            date: new Date().toISOString().split('T')[0],
            attachmentPath: attachmentPath || undefined,
        });

        setNoteContent('');
        setNoteSystem('general');
        setNoteMood(undefined);
        setNoteTags([]);
        setAttachmentPath(null);
        setShowAddNoteModal(false);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            // @ts-ignore
            const path = await store.uploadFile(file, 'note-attachments');
            if (path) {
                setAttachmentPath(path);
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            alert('Failed to upload file.');
        } finally {
            setIsUploading(false);
        }
    };

    const formatDate = (dateStr: string): string => {
        const date = new Date(dateStr);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (dateStr === today.toISOString().split('T')[0]) {
            return 'Today';
        } else if (dateStr === yesterday.toISOString().split('T')[0]) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-blue-50 pb-24">
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
                        <h1 className="text-xl font-bold text-gray-900">Notes & Reflection</h1>
                        <p className="text-xs text-gray-500">{allNotes.length} entries</p>
                    </div>
                    <button
                        onClick={() => setShowAddNoteModal(true)}
                        className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center shadow-lg"
                    >
                        <Plus className="w-5 h-5 text-white" />
                    </button>
                </div>

                {/* Search & Filter */}
                <div className="px-5 pb-4 space-y-3">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search notes..."
                            className="w-full pl-11 pr-4 py-3 bg-gray-100 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-slate-500 focus:outline-none"
                        />
                    </div>

                    {/* System Filter Pills */}
                    <div className="flex gap-2 overflow-x-auto pb-1 -mx-5 px-5">
                        <button
                            onClick={() => setFilterSystem(null)}
                            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${!filterSystem
                                ? 'bg-slate-800 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            All
                        </button>
                        {SYSTEMS.map((sys) => {
                            const Icon = sys.icon;
                            return (
                                <button
                                    key={sys.id}
                                    onClick={() => setFilterSystem(filterSystem === sys.id ? null : sys.id)}
                                    className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 transition-all ${filterSystem === sys.id
                                        ? 'bg-slate-800 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {sys.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Notes List */}
            <div className="px-5 py-4">
                {filteredNotes.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-white rounded-2xl p-8 text-center border border-dashed border-gray-200 mt-4"
                    >
                        <Edit3 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p className="text-gray-500 mb-4">
                            {searchQuery || filterSystem ? 'No notes match your search' : 'No notes yet'}
                        </p>
                        {!searchQuery && !filterSystem && (
                            <button
                                onClick={() => setShowAddNoteModal(true)}
                                className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium"
                            >
                                Write Your First Note
                            </button>
                        )}
                    </motion.div>
                ) : (
                    <div className="space-y-6">
                        {sortedDates.map((date) => (
                            <div key={date}>
                                <div className="flex items-center gap-2 mb-3">
                                    <Calendar className="w-4 h-4 text-gray-400" />
                                    <h3 className="text-sm font-medium text-gray-500">{formatDate(date)}</h3>
                                </div>

                                <div className="space-y-3">
                                    {groupedNotes[date].map((note: LifeNote, index: number) => {
                                        const systemInfo = SYSTEMS.find(s => s.id === note.linkedSystem);
                                        const SystemIcon = systemInfo?.icon || Sparkles;

                                        return (
                                            <motion.div
                                                key={note.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.03 }}
                                                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
                                            >
                                                {/* Header */}
                                                <div className="flex items-start gap-3 mb-3">
                                                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${systemInfo?.color || 'from-gray-400 to-gray-500'} flex items-center justify-center flex-shrink-0`}>
                                                        <SystemIcon className="w-5 h-5 text-white" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between">
                                                            <span className={`text-xs font-medium ${systemInfo?.text || 'text-gray-500'}`}>
                                                                {systemInfo?.label || 'Note'}
                                                            </span>
                                                            {note.mood && (
                                                                <span className="text-lg">{MOOD_LABELS[note.mood - 1]}</span>
                                                            )}
                                                        </div>
                                                        <span className="text-xs text-gray-400">
                                                            {new Date(note.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Content */}
                                                <p className="text-gray-700 whitespace-pre-wrap">{note.content}</p>

                                                {/* Attachment */}
                                                {note.attachmentPath && (
                                                    <NoteAttachmentView path={note.attachmentPath} />
                                                )}

                                                {/* Tags */}
                                                {note.tags.length > 0 && (
                                                    <div className="flex flex-wrap gap-2 mt-3">
                                                        {note.tags.map((tag) => (
                                                            <span
                                                                key={tag}
                                                                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full flex items-center gap-1"
                                                            >
                                                                <Tag className="w-3 h-3" />
                                                                {tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Weekly Review Prompt */}
            {new Date().getDay() === 0 && (
                <div className="px-5 py-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl p-5 shadow-lg"
                    >
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-white font-semibold">Weekly Review Time!</h3>
                                <p className="text-white/80 text-sm mt-1">
                                    Take a moment to reflect on your week. What went well? What could be better?
                                </p>
                                <button
                                    onClick={() => {
                                        setNoteSystem('general');
                                        setNoteContent('## Weekly Review\n\n**What went well:**\n\n\n**What could improve:**\n\n\n**Focus for next week:**\n');
                                        setShowAddNoteModal(true);
                                    }}
                                    className="mt-3 px-4 py-2 bg-white text-orange-600 rounded-lg text-sm font-medium"
                                >
                                    Start Review
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Add Note Modal */}
            <AnimatePresence>
                {showAddNoteModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end justify-center"
                        onClick={() => setShowAddNoteModal(false)}
                    >
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-md bg-white rounded-t-3xl p-6 max-h-[90vh] overflow-y-auto"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-gray-900">New Note</h3>
                                <button
                                    onClick={() => setShowAddNoteModal(false)}
                                    className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
                                >
                                    <X className="w-4 h-4 text-gray-600" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                {/* System Selection */}
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-2 block">Category</label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {SYSTEMS.map((sys) => {
                                            const Icon = sys.icon;
                                            return (
                                                <button
                                                    key={sys.id}
                                                    onClick={() => setNoteSystem(sys.id)}
                                                    className={`p-3 rounded-xl flex flex-col items-center gap-1 transition-all ${noteSystem === sys.id
                                                        ? `bg-gradient-to-br ${sys.color} text-white shadow-lg`
                                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                        }`}
                                                >
                                                    <Icon className="w-5 h-5" />
                                                    <span className="text-xs font-medium">{sys.label}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Note Content */}
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-2 block">Note</label>
                                    <textarea
                                        value={noteContent}
                                        onChange={(e) => setNoteContent(e.target.value)}
                                        placeholder="What's on your mind? Any insights or reflections?"
                                        className="w-full p-4 bg-gray-50 rounded-xl text-gray-900 placeholder:text-gray-400 resize-none h-32 focus:ring-2 focus:ring-slate-500 focus:outline-none"
                                        autoFocus
                                    />
                                </div>

                                {/* Mood (Optional) */}
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-2 block">Mood (optional)</label>
                                    <div className="flex gap-2">
                                        {MOOD_LABELS.map((emoji, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setNoteMood(noteMood === i + 1 ? undefined : i + 1)}
                                                className={`flex-1 py-3 rounded-xl text-2xl transition-all ${noteMood === i + 1
                                                    ? 'bg-slate-800 ring-2 ring-slate-600'
                                                    : 'bg-gray-100 hover:bg-gray-200'
                                                    }`}
                                            >
                                                {emoji}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Tags */}
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-2 block">Tags</label>
                                    <div className="flex gap-2 mb-2 flex-wrap">
                                        {noteTags.map((tag) => (
                                            <span
                                                key={tag}
                                                className="px-3 py-1 bg-slate-800 text-white text-sm rounded-full flex items-center gap-1"
                                            >
                                                {tag}
                                                <button onClick={() => handleRemoveTag(tag)}>
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={tagInput}
                                            onChange={(e) => setTagInput(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                                            placeholder="Add a tag..."
                                            className="flex-1 p-3 bg-gray-50 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-slate-500 focus:outline-none"
                                        />
                                        <button
                                            onClick={handleAddTag}
                                            className="px-4 py-3 bg-gray-100 rounded-xl text-gray-600 hover:bg-gray-200"
                                        >
                                            <Plus className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Attachment Upload */}
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-2 block">Attachment</label>
                                    <div className="flex items-center gap-3">
                                        <label className={`cursor-pointer px-4 py-3 rounded-xl border border-dashed border-gray-300 flex items-center gap-2 hover:bg-gray-50 transition-colors ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                            <input
                                                type="file"
                                                className="hidden"
                                                onChange={handleFileUpload}
                                                disabled={isUploading}
                                            />
                                            {isUploading ? (
                                                <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                                            ) : (
                                                <Paperclip className="w-4 h-4 text-gray-500" />
                                            )}
                                            <span className="text-sm text-gray-500">
                                                {isUploading ? 'Uploading...' : 'Attach File'}
                                            </span>
                                        </label>

                                        {attachmentPath && (
                                            <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg border border-slate-100">
                                                <FileText className="w-4 h-4 text-slate-500" />
                                                <span className="text-xs text-slate-600 truncate max-w-[150px]">
                                                    {attachmentPath.split('/').pop()}
                                                </span>
                                                <button
                                                    onClick={() => setAttachmentPath(null)}
                                                    className="p-1 hover:bg-slate-200 rounded-full"
                                                >
                                                    <X className="w-3 h-3 text-slate-400" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleSaveNote}
                                disabled={!noteContent.trim()}
                                className="w-full mt-6 py-4 bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-xl font-semibold shadow-lg disabled:opacity-50"
                            >
                                Save Note
                            </motion.button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};


const NoteAttachmentView: React.FC<{ path: string }> = ({ path }) => {
    const store = useLifeTracker();
    const [url, setUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    React.useEffect(() => {
        const fetchUrl = async () => {
            // @ts-ignore
            const signed = await store.getPrivateFileUrl('note-attachments', path);
            setUrl(signed);
            setLoading(false);
        };
        fetchUrl();
    }, [path, store]);

    if (loading) return <div className="mt-2 text-xs text-gray-400">Loading attachment...</div>;
    if (!url) return null;

    const isImage = path.match(/\.(jpg|jpeg|png|gif|webp)$/i);

    if (isImage) {
        return (
            <div className="mt-3 rounded-lg overflow-hidden border border-gray-200 max-w-xs">
                <img src={url} alt="Attachment" className="w-full h-auto" />
            </div>
        );
    }

    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
        >
            <Paperclip className="w-4 h-4 text-gray-500" />
            <span className="text-xs font-medium text-gray-700">View Attachment</span>
        </a>
    );
};

export default NotesReflection;
