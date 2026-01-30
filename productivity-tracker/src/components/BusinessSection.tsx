import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Briefcase, Shield, GitBranch, FolderOpen,
    BookOpen, Link2, Lock, Unlock, Plus,
    Search, ExternalLink, Eye, EyeOff, X, Sparkles,
    Video, FileText, GraduationCap, Settings, Trash2, Target
} from 'lucide-react';

// Types
interface VaultItem {
    id: string;
    title: string;
    content: string;
    category: 'strategy' | 'legal' | 'client' | 'credentials';
    createdAt: string;
}

interface Resource {
    id: string;
    title: string;
    url: string;
    type: 'tool' | 'client' | 'project' | 'reference';
    tags: string[];
    isProtected: boolean;
}

interface ContentItem {
    id: string;
    title: string;
    link: string;
    type: 'video' | 'article' | 'course';
    status: 'saved' | 'in-progress' | 'applied';
    takeaway: string;
}



// Sub-components
const SecureVault: React.FC<{ isUnlocked: boolean; onLock: () => void; items: VaultItem[]; onAddItem: (item: Omit<VaultItem, 'id' | 'createdAt'>) => void; onDeleteItem: (id: string) => void }> = ({ isUnlocked, onLock, items, onAddItem, onDeleteItem }) => {
    const [showContent, setShowContent] = useState<Record<string, boolean>>({});
    const [showAddModal, setShowAddModal] = useState(false);
    const [newItem, setNewItem] = useState<{ title: string; content: string; category: VaultItem['category'] }>({ title: '', content: '', category: 'strategy' });

    const categories = [
        { id: 'strategy', label: 'Strategy Notes', icon: Sparkles },
        { id: 'legal', label: 'Legal References', icon: FileText },
        { id: 'client', label: 'Client Info', icon: Briefcase },
        { id: 'credentials', label: 'Credentials', icon: Lock }
    ];

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    {isUnlocked ? <Unlock className="w-5 h-5 text-green-500" /> : <Lock className="w-5 h-5 text-red-500" />}
                    <span className="text-sm font-medium text-gray-600">{isUnlocked ? 'Vault Unlocked' : 'Vault Locked'}</span>
                </div>
                <div className="flex gap-2">
                    {isUnlocked && (
                        <>
                            <button onClick={() => setShowAddModal(true)} className="p-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors">
                                <Plus className="w-4 h-4" />
                            </button>
                            <button onClick={onLock} className="p-2 bg-gray-200 rounded-xl hover:bg-gray-300 transition-colors">
                                <Lock className="w-4 h-4" />
                            </button>
                        </>
                    )}
                </div>
            </div>

            {isUnlocked && (
                <div className="space-y-3">
                    {items.length === 0 ? (
                        <p className="text-center text-gray-400 py-8">No vault items yet. Add your first secure item.</p>
                    ) : (
                        items.map(item => (
                            <div key={item.id} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full capitalize">{item.category}</span>
                                            <h4 className="font-semibold text-gray-800 dark:text-white">{item.title}</h4>
                                        </div>
                                        <p className={`text-sm text-gray-600 dark:text-gray-300 ${showContent[item.id] ? '' : 'blur-sm select-none'}`}>
                                            {item.content}
                                        </p>
                                    </div>
                                    <div className="flex gap-1">
                                        <button onClick={() => setShowContent(prev => ({ ...prev, [item.id]: !prev[item.id] }))} className="p-1.5 hover:bg-gray-200 rounded-lg">
                                            {showContent[item.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                        <button onClick={() => onDeleteItem(item.id)} className="p-1.5 hover:bg-red-100 text-red-500 rounded-lg">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            <AnimatePresence>
                {showAddModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowAddModal(false)}>
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={e => e.stopPropagation()} className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md">
                            <h3 className="text-lg font-bold mb-4">Add Vault Item</h3>
                            <div className="space-y-4">
                                <input type="text" placeholder="Title" value={newItem.title} onChange={e => setNewItem(prev => ({ ...prev, title: e.target.value }))} className="w-full p-3 border rounded-xl" />
                                <select value={newItem.category} onChange={e => setNewItem(prev => ({ ...prev, category: e.target.value as VaultItem['category'] }))} className="w-full p-3 border rounded-xl">
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                                </select>
                                <textarea placeholder="Content" value={newItem.content} onChange={e => setNewItem(prev => ({ ...prev, content: e.target.value }))} className="w-full p-3 border rounded-xl h-32" />
                                <button onClick={() => { onAddItem(newItem); setShowAddModal(false); setNewItem({ title: '', content: '', category: 'strategy' }); }} className="w-full py-3 bg-blue-500 text-white rounded-xl font-semibold">Save to Vault</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const ResourceManager: React.FC<{ resources: Resource[]; onAdd: (r: Omit<Resource, 'id'>) => void; onDelete: (id: string) => void }> = ({ resources, onAdd, onDelete }) => {
    const [search, setSearch] = useState('');
    const [showAdd, setShowAdd] = useState(false);
    const [newRes, setNewRes] = useState<Omit<Resource, 'id'>>({ title: '', url: '', type: 'tool', tags: [], isProtected: false });
    const [tagInput, setTagInput] = useState('');
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const filtered = resources.filter(r => r.title.toLowerCase().includes(search.toLowerCase()) || r.tags.some(t => t.toLowerCase().includes(search.toLowerCase())));
    const typeIcons = { tool: Settings, client: Briefcase, project: FolderOpen, reference: FileText };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onAdd({
                title: file.name,
                url: URL.createObjectURL(file),
                type: 'project',
                tags: ['file', file.type.split('/')[1] || 'document'],
                isProtected: false
            });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex gap-2">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="text" placeholder="Search bucket resources..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-3 border rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500/20 outline-none" />
                </div>
                <button onClick={() => setShowAdd(true)} className="p-3 bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-500/30 hover:bg-blue-600 transition-all"><Plus className="w-5 h-5" /></button>
            </div>

            {/* Bucket Drop Zone */}
            <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all group"
            >
                <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
                <FolderOpen className="w-12 h-12 mx-auto text-gray-400 group-hover:text-blue-500 mb-3 transition-colors" />
                <h3 className="font-semibold text-gray-700 dark:text-gray-200">Resource Bucket</h3>
                <p className="text-sm text-gray-500 mt-1">Drop files, PDFs, or click to upload assets</p>
            </div>

            <div className="grid gap-3">
                {filtered.map(res => {
                    const Icon = typeIcons[res.type];
                    return (
                        <div key={res.id} className="bg-white dark:bg-gray-800 border rounded-xl p-4 flex items-center gap-4 hover:shadow-md transition-shadow group">
                            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-xl"><Icon className="w-6 h-6 text-gray-600 dark:text-gray-300" /></div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <h4 className="font-semibold text-gray-800 dark:text-gray-100 truncate">{res.title}</h4>
                                    {res.isProtected && <Lock className="w-3 h-3 text-amber-500" />}
                                </div>
                                <div className="flex gap-2 mt-1.5 flex-wrap">{res.tags.map(t => <span key={t} className="text-[10px] uppercase font-bold px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg">{t}</span>)}</div>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <a href={res.url} target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-blue-500"><ExternalLink className="w-4 h-4" /></a>
                                <button onClick={() => onDelete(res.id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                            </div>
                        </div>
                    );
                })}
            </div>

            <AnimatePresence>
                {showAdd && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowAdd(false)}>
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={e => e.stopPropagation()} className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md space-y-4">
                            <h3 className="text-lg font-bold">Add Resource</h3>
                            <input type="text" placeholder="Title" value={newRes.title} onChange={e => setNewRes(p => ({ ...p, title: e.target.value }))} className="w-full p-3 border rounded-xl" />
                            <input type="url" placeholder="URL" value={newRes.url} onChange={e => setNewRes(p => ({ ...p, url: e.target.value }))} className="w-full p-3 border rounded-xl" />
                            <select value={newRes.type} onChange={e => setNewRes(p => ({ ...p, type: e.target.value as Resource['type'] }))} className="w-full p-3 border rounded-xl">
                                <option value="tool">Tool</option><option value="client">Client</option><option value="project">Project</option><option value="reference">Reference</option>
                            </select>
                            <div className="flex gap-2">
                                <input type="text" placeholder="Add tag + Enter" value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && tagInput) { setNewRes(p => ({ ...p, tags: [...p.tags, tagInput] })); setTagInput(''); } }} className="flex-1 p-3 border rounded-xl" />
                            </div>
                            <div className="flex gap-1 flex-wrap">{newRes.tags.map(t => <span key={t} className="text-sm px-2 py-1 bg-blue-100 text-blue-600 rounded-full flex items-center gap-1">{t}<X className="w-3 h-3 cursor-pointer" onClick={() => setNewRes(p => ({ ...p, tags: p.tags.filter(x => x !== t) }))} /></span>)}</div>
                            <label className="flex items-center gap-2"><input type="checkbox" checked={newRes.isProtected} onChange={e => setNewRes(p => ({ ...p, isProtected: e.target.checked }))} /><span className="text-sm">Protect with vault</span></label>
                            <button onClick={() => { onAdd(newRes); setShowAdd(false); setNewRes({ title: '', url: '', type: 'tool', tags: [], isProtected: false }); }} className="w-full py-3 bg-blue-500 text-white rounded-xl font-semibold">Add Resource</button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const ContentLibrary: React.FC<{ items: ContentItem[]; onAdd: (i: Omit<ContentItem, 'id'>) => void; onUpdate: (id: string, status: ContentItem['status']) => void; onDelete: (id: string) => void }> = ({ items, onAdd, onUpdate, onDelete: _onDelete }) => {
    const [showAdd, setShowAdd] = useState(false);
    const [newItem, setNewItem] = useState<Omit<ContentItem, 'id'>>({ title: '', link: '', type: 'video', status: 'saved', takeaway: '' });
    const typeIcons = { video: Video, article: FileText, course: GraduationCap };
    const statusColors = { saved: 'bg-gray-100 text-gray-600', 'in-progress': 'bg-blue-100 text-blue-600', applied: 'bg-green-100 text-green-600' };

    return (
        <div className="space-y-4">
            <button onClick={() => setShowAdd(true)} className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors flex items-center justify-center gap-2">
                <Plus className="w-5 h-5" />Add Content
            </button>

            <div className="space-y-3">
                {items.map(item => {
                    const Icon = typeIcons[item.type];
                    return (
                        <div key={item.id} className="bg-white dark:bg-gray-800 border rounded-xl p-4">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg"><Icon className="w-5 h-5" /></div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-medium">{item.title}</h4>
                                    <p className="text-sm text-gray-500 truncate">{item.link}</p>
                                    {item.takeaway && <p className="text-sm mt-2 p-2 bg-yellow-50 rounded-lg text-yellow-800">💡 {item.takeaway}</p>}
                                </div>
                                <div className="flex flex-col gap-2 items-end">
                                    <select value={item.status} onChange={e => onUpdate(item.id, e.target.value as ContentItem['status'])} className={`text-xs px-2 py-1 rounded-full ${statusColors[item.status]}`}>
                                        <option value="saved">Saved</option><option value="in-progress">In Progress</option><option value="applied">Applied</option>
                                    </select>
                                    <button
                                        onClick={() => _onDelete(item.id)}
                                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                        title="Delete content"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <AnimatePresence>
                {showAdd && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowAdd(false)}>
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={e => e.stopPropagation()} className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md space-y-4">
                            <h3 className="text-lg font-bold">Add Learning Content</h3>
                            <input type="text" placeholder="Title" value={newItem.title} onChange={e => setNewItem(p => ({ ...p, title: e.target.value }))} className="w-full p-3 border rounded-xl" />
                            <input type="url" placeholder="Link" value={newItem.link} onChange={e => setNewItem(p => ({ ...p, link: e.target.value }))} className="w-full p-3 border rounded-xl" />
                            <select value={newItem.type} onChange={e => setNewItem(p => ({ ...p, type: e.target.value as ContentItem['type'] }))} className="w-full p-3 border rounded-xl">
                                <option value="video">YouTube Video</option><option value="article">Article/Blog</option><option value="course">Course</option>
                            </select>
                            <textarea placeholder="Key Takeaway" value={newItem.takeaway} onChange={e => setNewItem(p => ({ ...p, takeaway: e.target.value }))} className="w-full p-3 border rounded-xl h-24" />
                            <button onClick={() => { onAdd(newItem); setShowAdd(false); setNewItem({ title: '', link: '', type: 'video', status: 'saved', takeaway: '' }); }} className="w-full py-3 bg-blue-500 text-white rounded-xl font-semibold">Add Content</button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const CarouselNavbar: React.FC<{
    items: { id: string; label: string; icon: React.ElementType }[];
    activeId: string;
    onSelect: (id: string) => void;
}> = ({ items, activeId, onSelect }) => {
    return (
        <div className="w-full flex justify-center py-8">
            <div className="relative bg-white dark:bg-gray-800 p-2 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-black/30 flex items-center gap-1 border border-gray-100 dark:border-gray-700 max-w-full overflow-x-auto no-scrollbar">
                {items.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => onSelect(item.id)}
                        className={`relative flex items-center gap-2 px-3 sm:px-5 py-2.5 rounded-full font-bold text-xs sm:text-sm transition-all duration-300 z-10 whitespace-nowrap ${activeId === item.id
                            ? 'text-white'
                            : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                            }`}
                    >
                        <item.icon className={`w-3.5 h-3.5 sm:w-4 h-4 ${activeId === item.id ? 'opacity-100' : 'opacity-60'}`} />
                        <span className="text-[10px] sm:text-sm">{item.label}</span>

                        {activeId === item.id && (
                            <motion.div
                                layoutId="activeSubTabPill"
                                className="absolute inset-0 bg-blue-600 rounded-full -z-10 shadow-lg shadow-blue-500/30"
                                transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                            />
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
};

// Main Component
import AICanvas from './AICanvas';
import MarketValidationSystem from './MarketValidationSystem';
import { createLearning } from '../services/notionService';

const BusinessSection: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'business' | 'learning'>('business');
    const [activeSubTab, setActiveSubTab] = useState('vault');
    const [vaultUnlocked, setVaultUnlocked] = useState(false);
    const [pin, setPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [showPinModal, setShowPinModal] = useState(false);
    const [pinMode, setPinMode] = useState<'set' | 'enter'>('enter');
    const [pinError, setPinError] = useState('');

    // Knowledge Notes State
    const [noteTitle, setNoteTitle] = useState('');
    const [noteContent, setNoteContent] = useState('');
    const [isSavingNote, setIsSavingNote] = useState(false);


    // Data states
    const [vaultItems, setVaultItems] = useState<VaultItem[]>(() => JSON.parse(localStorage.getItem('business_vault') || '[]'));
    const [resources, setResources] = useState<Resource[]>(() => JSON.parse(localStorage.getItem('business_resources') || '[]'));
    const [contentItems, setContentItems] = useState<ContentItem[]>(() => JSON.parse(localStorage.getItem('business_content') || '[]'));
    const [storedPin, setStoredPin] = useState<string | null>(() => localStorage.getItem('business_vault_pin'));

    // Check if PIN has been set
    const hasPinSet = storedPin !== null && storedPin !== '';

    // Persist data
    useEffect(() => { localStorage.setItem('business_vault', JSON.stringify(vaultItems)); }, [vaultItems]);
    useEffect(() => { localStorage.setItem('business_resources', JSON.stringify(resources)); }, [resources]);
    useEffect(() => { localStorage.setItem('business_content', JSON.stringify(contentItems)); }, [contentItems]);

    const handleSetPin = () => {
        setPinError('');
        if (pin.length !== 4) {
            setPinError('PIN must be 4 digits');
            return;
        }
        if (pin !== confirmPin) {
            setPinError('PINs do not match');
            return;
        }
        // Save the new PIN and immediately unlock
        localStorage.setItem('business_vault_pin', pin);
        setStoredPin(pin);
        setVaultUnlocked(true);
        setShowPinModal(false);
        setPin('');
        setConfirmPin('');
    };

    const handleUnlockVault = () => {
        setPinError('');
        if (pin === storedPin) {
            setVaultUnlocked(true);
            setShowPinModal(false);
            setPin('');
        } else {
            setPinError('Incorrect PIN');
        }
    };

    const openPinModal = () => {
        setPinError('');
        setPin('');
        setConfirmPin('');
        if (storedPin && storedPin.length === 4) {
            setPinMode('enter');
        } else {
            setPinMode('set');
        }
        setShowPinModal(true);
    };

    const handleSaveNote = async () => {
        if (!noteTitle || !noteContent) return;
        setIsSavingNote(true);
        try {
            await createLearning({
                title: noteTitle,
                type: 'Knowledge Note',
                summary: noteContent.substring(0, 100) + '...',
                notes: noteContent
            });
            alert('Note saved to Notion!');
            setNoteTitle('');
            setNoteContent('');
        } catch (e) {
            console.error(e);
            alert('Failed to save to Notion. Check API key.');
        } finally {
            setIsSavingNote(false);
        }
    };

    const tabs = [
        { id: 'business', label: 'Business Core', icon: Briefcase },
        { id: 'learning', label: 'Learning Core', icon: BookOpen }
    ];

    const subTabs: Record<string, { id: string; label: string; icon: React.ElementType }[]> = {
        business: [
            { id: 'vault', label: 'Vault', icon: Shield },
            { id: 'workflow', label: 'Canvas', icon: GitBranch },
            { id: 'resources', label: 'Assets', icon: FolderOpen },
            { id: 'validation', label: 'Market', icon: Target }
        ],
        learning: [{ id: 'content', label: 'Library', icon: Video }, { id: 'notes', label: 'Notion', icon: Link2 }]
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24 overflow-x-hidden">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-6 py-5">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-5">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-2xl transition-all active:scale-95"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Business Hub</h1>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Enterprise OS v2.0</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Tabs - Reference Pill Style */}
            <div className="max-w-7xl mx-auto px-6 py-8 flex justify-center">
                <div className="bg-white dark:bg-gray-800 p-2 rounded-full shadow-[0_15px_40px_rgba(0,0,0,0.08)] dark:shadow-black/20 flex items-center gap-1 border border-gray-100 dark:border-gray-700">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => { setActiveTab(tab.id as 'business' | 'learning'); setActiveSubTab(subTabs[tab.id][0].id); }}
                            className={`relative px-8 py-3 rounded-full font-black text-sm transition-all duration-300 z-10 flex items-center gap-2 ${activeTab === tab.id
                                ? 'text-white'
                                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                                }`}
                        >
                            <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'opacity-100' : 'opacity-60'}`} />
                            {tab.label}
                            {activeTab === tab.id && (
                                <motion.div
                                    layoutId="mainTabPill"
                                    className="absolute inset-0 bg-indigo-600 rounded-full -z-10 shadow-lg shadow-indigo-500/30"
                                    transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                                />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Carousel Sub Tabs */}
            <div className="max-w-7xl mx-auto mb-4">
                <CarouselNavbar
                    items={subTabs[activeTab]}
                    activeId={activeSubTab}
                    onSelect={setActiveSubTab}
                />
            </div>

            {/* Content Area */}
            <div className="max-w-7xl mx-auto px-6">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={`${activeTab}-${activeSubTab}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >

                        {/* Business Core */}
                        {activeTab === 'business' && activeSubTab === 'vault' && (
                            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border">
                                {!vaultUnlocked ? (
                                    <div className="text-center py-12">
                                        <Shield className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                                        <h3 className="text-lg font-semibold mb-2">Secure Vault</h3>
                                        <p className="text-gray-500 mb-6">
                                            {hasPinSet
                                                ? 'Enter your PIN to access protected business data'
                                                : 'Set up a PIN to secure your business data'}
                                        </p>
                                        <button onClick={openPinModal} className="px-6 py-3 bg-blue-500 text-white rounded-xl font-semibold">
                                            {hasPinSet ? 'Enter PIN' : 'Set PIN'}
                                        </button>
                                    </div>
                                ) : (
                                    <SecureVault isUnlocked={vaultUnlocked} onLock={() => setVaultUnlocked(false)} items={vaultItems} onAddItem={item => setVaultItems(prev => [...prev, { ...item, id: Date.now().toString(), createdAt: new Date().toISOString() }])} onDeleteItem={id => setVaultItems(prev => prev.filter(i => i.id !== id))} />
                                )}
                            </div>
                        )}

                        {activeTab === 'business' && activeSubTab === 'workflow' && (
                            <div className="bg-white dark:bg-gray-800 rounded-2xl border overflow-hidden h-[70vh] relative shadow-xl">
                                <AICanvas />
                                <div className="absolute top-4 right-4 z-50 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-gray-500 shadow-sm border">
                                    Workflow Mode
                                </div>
                            </div>
                        )}

                        {activeTab === 'business' && activeSubTab === 'resources' && (
                            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border">
                                <ResourceManager resources={resources} onAdd={r => setResources(prev => [...prev, { ...r, id: Date.now().toString() }])} onDelete={id => setResources(prev => prev.filter(r => r.id !== id))} />
                            </div>
                        )}

                        {activeTab === 'business' && activeSubTab === 'validation' && (
                            <div className="h-[75vh]">
                                <MarketValidationSystem />
                            </div>
                        )}

                        {/* Learning Core */}
                        {activeTab === 'learning' && activeSubTab === 'content' && (
                            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border">
                                <ContentLibrary items={contentItems} onAdd={i => setContentItems(prev => [...prev, { ...i, id: Date.now().toString() }])} onUpdate={(id, status) => setContentItems(prev => prev.map(i => i.id === id ? { ...i, status } : i))} onDelete={id => setContentItems(prev => prev.filter(i => i.id !== id))} />
                            </div>
                        )}

                        {activeTab === 'learning' && activeSubTab === 'notes' && (
                            <div className="grid gap-6">
                                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border">
                                    <div className="flex items-center gap-3 mb-6">
                                        <Link2 className="w-8 h-8 text-purple-500" />
                                        <div>
                                            <h3 className="text-lg font-bold">Knowledge Notes</h3>
                                            <p className="text-sm text-gray-500">Synced directly to your Notion Knowledge Base</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <input
                                            type="text"
                                            placeholder="Note Title"
                                            className="w-full p-4 border rounded-xl font-semibold text-lg focus:ring-2 focus:ring-purple-500/20 outline-none"
                                            value={noteTitle}
                                            onChange={e => setNoteTitle(e.target.value)}
                                        />
                                        <div className="border rounded-xl bg-gray-50 dark:bg-gray-900 p-2">
                                            <textarea
                                                placeholder="Start typing your knowledge note here..."
                                                className="w-full h-64 p-4 bg-transparent border-none resize-none focus:ring-0 outline-none"
                                                value={noteContent}
                                                onChange={e => setNoteContent(e.target.value)}
                                            ></textarea>
                                        </div>
                                        <div className="flex justify-end gap-3">
                                            <button
                                                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
                                                onClick={() => { setNoteTitle(''); setNoteContent(''); }}
                                            >
                                                Clear
                                            </button>
                                            <button
                                                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold shadow-lg shadow-purple-200 transition-colors flex items-center gap-2"
                                                onClick={handleSaveNote}
                                                disabled={isSavingNote}
                                            >
                                                {isSavingNote ? <Sparkles className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
                                                {isSavingNote ? 'Syncing...' : 'Save to Notion'}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Recent Integration Check */}
                                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100 rounded-2xl p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white rounded-lg shadow-sm">
                                            <img src="https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png" alt="Notion" className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-800">Notion Integration Active</h4>
                                            <p className="text-xs text-gray-500">Connected to Workspace</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs font-medium text-green-600 bg-green-100 px-3 py-1 rounded-full">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                        Live Sync
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* PIN Modal */}
            <AnimatePresence>
                {showPinModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowPinModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            onClick={e => e.stopPropagation()}
                            className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-10 w-full max-w-sm border border-gray-100 dark:border-gray-800 shadow-2xl relative overflow-hidden"
                        >
                            {/* Decorative background element for PIN modal */}
                            <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl" />

                            {pinMode === 'set' ? (
                                <div className="relative z-10">
                                    <div className="text-center mb-8">
                                        <div className="w-20 h-20 mx-auto bg-blue-50 dark:bg-blue-900/20 rounded-3xl flex items-center justify-center mb-6 border border-blue-100 dark:border-blue-800">
                                            <Lock className="w-10 h-10 text-blue-600" />
                                        </div>
                                        <h3 className="text-2xl font-black text-gray-900 dark:text-white">Secure Your Vault</h3>
                                        <p className="text-sm text-gray-500 mt-2 font-medium">Create a 4-digit security PIN</p>
                                    </div>
                                    <div className="space-y-5">
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase tracking-widest font-black text-gray-400 dark:text-gray-500 ml-1">New PIN</label>
                                            <input
                                                type="password"
                                                maxLength={4}
                                                placeholder="••••"
                                                value={pin}
                                                onChange={e => { setPin(e.target.value.replace(/\D/g, '')); setPinError(''); }}
                                                className="w-full h-16 text-center text-3xl tracking-[1em] border-2 border-gray-100 dark:border-gray-800 rounded-2xl bg-gray-50 dark:bg-gray-800/50 focus:border-blue-500 focus:bg-white dark:focus:bg-gray-800 transition-all outline-none"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase tracking-widest font-black text-gray-400 dark:text-gray-500 ml-1">Confirm PIN</label>
                                            <input
                                                type="password"
                                                maxLength={4}
                                                placeholder="••••"
                                                value={confirmPin}
                                                onChange={e => { setConfirmPin(e.target.value.replace(/\D/g, '')); setPinError(''); }}
                                                className="w-full h-16 text-center text-3xl tracking-[1em] border-2 border-gray-100 dark:border-gray-800 rounded-2xl bg-gray-50 dark:bg-gray-800/50 focus:border-blue-500 focus:bg-white dark:focus:bg-gray-800 transition-all outline-none"
                                            />
                                        </div>
                                        {pinError && (
                                            <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-xs font-bold text-red-500 text-center bg-red-50 dark:bg-red-900/20 py-2 rounded-lg">{pinError}</motion.p>
                                        )}
                                        <button
                                            onClick={handleSetPin}
                                            className="w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:shadow-xl hover:shadow-blue-500/30 transition-all active:scale-[0.98] mt-4"
                                        >
                                            Initialize Vault
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="relative z-10">
                                    <div className="text-center mb-8">
                                        <div className="w-20 h-20 mx-auto bg-green-50 dark:bg-green-900/20 rounded-3xl flex items-center justify-center mb-6 border border-green-100 dark:border-green-800">
                                            <Shield className="w-10 h-10 text-green-600" />
                                        </div>
                                        <h3 className="text-2xl font-black text-gray-900 dark:text-white">Vault Access</h3>
                                        <p className="text-sm text-gray-500 mt-2 font-medium">Enter your 4-digit PIN</p>
                                    </div>
                                    <div className="space-y-6">
                                        <input
                                            type="password"
                                            maxLength={4}
                                            placeholder="••••"
                                            value={pin}
                                            onChange={e => { setPin(e.target.value.replace(/\D/g, '')); setPinError(''); }}
                                            className="w-full h-20 text-center text-4xl tracking-[1em] border-2 border-gray-100 dark:border-gray-800 rounded-2xl bg-gray-50 dark:bg-gray-800/50 focus:border-blue-500 focus:bg-white dark:focus:bg-gray-800 transition-all outline-none"
                                        />
                                        {pinError && (
                                            <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-xs font-bold text-red-500 text-center bg-red-50 dark:bg-red-900/20 py-2 rounded-lg">{pinError}</motion.p>
                                        )}
                                        <button
                                            onClick={handleUnlockVault}
                                            className="w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:shadow-xl hover:shadow-blue-500/30 transition-all active:scale-[0.98]"
                                        >
                                            Unlock Data
                                        </button>
                                        <button
                                            onClick={() => setShowPinModal(false)}
                                            className="w-full py-2 text-xs font-bold text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                        >
                                            Cancel Access
                                        </button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default BusinessSection;
