import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Lightbulb, CheckSquare, Calendar, Brain, Quote, FileText,
    Plus, Trash2, Check, Link2, ChevronDown, Sparkles
} from 'lucide-react';
import { useLifeTracker } from '../../utils/lifeTrackerStore';
import type { Book, CoreIdea, ActionTakeaway, BeliefChange, BookQuote, RevisitReminder } from '../../utils/lifeTrackerStore';

interface BookInsightsModalProps {
    book: Book;
    isOpen: boolean;
    onClose: () => void;
}

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const BookInsightsModal: React.FC<BookInsightsModalProps> = ({ book, isOpen, onClose }) => {
    const store = useLifeTracker();
    const existingInsight = store.getBookInsight(book.id);

    // Tab state
    const [activeTab, setActiveTab] = useState<'ideas' | 'actions' | 'reminders' | 'beliefs' | 'quotes' | 'summary'>('ideas');

    // Core Ideas State
    const [coreIdeas, setCoreIdeas] = useState<CoreIdea[]>(existingInsight?.coreIdeas || []);
    const [newIdea, setNewIdea] = useState('');

    // Action Takeaways State
    const [actionTakeaways, setActionTakeaways] = useState<ActionTakeaway[]>(existingInsight?.actionTakeaways || []);
    const [newAction, setNewAction] = useState('');

    // Belief Changes State
    const [beliefChanges, setBeliefChanges] = useState<BeliefChange[]>(existingInsight?.beliefChanges || []);
    const [newBeliefBefore, setNewBeliefBefore] = useState('');
    const [newBeliefAfter, setNewBeliefAfter] = useState('');

    // Quotes State
    const [quotes, setQuotes] = useState<BookQuote[]>(existingInsight?.quotes || []);
    const [newQuote, setNewQuote] = useState('');
    const [newQuotePage, setNewQuotePage] = useState('');
    const [newQuoteNote, setNewQuoteNote] = useState('');

    // Revisit Reminders State
    const [revisitReminders, setRevisitReminders] = useState<RevisitReminder[]>(existingInsight?.revisitReminders || []);
    const [newReminderPrompt, setNewReminderPrompt] = useState('');
    const [newReminderDate, setNewReminderDate] = useState('');

    // Final Summary State
    const [finalSummary, setFinalSummary] = useState(existingInsight?.finalSummary || '');

    // Expanded sections for linking quotes
    const [expandedQuoteLink, setExpandedQuoteLink] = useState<string | null>(null);

    // Load existing insight when modal opens
    useEffect(() => {
        if (existingInsight) {
            setCoreIdeas(existingInsight.coreIdeas);
            setActionTakeaways(existingInsight.actionTakeaways);
            setBeliefChanges(existingInsight.beliefChanges);
            setQuotes(existingInsight.quotes);
            setRevisitReminders(existingInsight.revisitReminders);
            setFinalSummary(existingInsight.finalSummary);
        }
    }, [existingInsight]);

    // Auto-generate review reminders
    const generateDefaultReminders = () => {
        const today = new Date();
        const oneWeek = new Date(today);
        oneWeek.setDate(oneWeek.getDate() + 7);
        const oneMonth = new Date(today);
        oneMonth.setMonth(oneMonth.getMonth() + 1);
        const threeMonths = new Date(today);
        threeMonths.setMonth(threeMonths.getMonth() + 3);

        const defaultReminders: RevisitReminder[] = [
            {
                id: generateId(),
                reminderDate: oneWeek.toISOString().split('T')[0],
                prompt: 'Have you applied any of the core ideas from this book?',
                completed: false,
            },
            {
                id: generateId(),
                reminderDate: oneMonth.toISOString().split('T')[0],
                prompt: 'Which actionable takeaways have you successfully implemented?',
                completed: false,
            },
            {
                id: generateId(),
                reminderDate: threeMonths.toISOString().split('T')[0],
                prompt: 'Has this book changed how you think or act in your daily life?',
                completed: false,
            },
        ];

        setRevisitReminders([...revisitReminders, ...defaultReminders]);
    };

    // Add handlers
    const addCoreIdea = () => {
        if (!newIdea.trim()) return;
        setCoreIdeas([...coreIdeas, { id: generateId(), content: newIdea.trim(), linkedQuotes: [] }]);
        setNewIdea('');
    };

    const addActionTakeaway = () => {
        if (!newAction.trim()) return;
        setActionTakeaways([...actionTakeaways, { id: generateId(), action: newAction.trim(), completed: false, linkedQuotes: [] }]);
        setNewAction('');
    };

    const addBeliefChange = () => {
        if (!newBeliefBefore.trim() || !newBeliefAfter.trim()) return;
        setBeliefChanges([...beliefChanges, {
            id: generateId(),
            beliefBefore: newBeliefBefore.trim(),
            beliefAfter: newBeliefAfter.trim(),
            linkedQuotes: []
        }]);
        setNewBeliefBefore('');
        setNewBeliefAfter('');
    };

    const addQuote = () => {
        if (!newQuote.trim()) return;
        setQuotes([...quotes, {
            id: generateId(),
            content: newQuote.trim(),
            page: newQuotePage ? parseInt(newQuotePage) : undefined,
            note: newQuoteNote.trim() || undefined
        }]);
        setNewQuote('');
        setNewQuotePage('');
        setNewQuoteNote('');
    };

    const addReminder = () => {
        if (!newReminderPrompt.trim() || !newReminderDate) return;
        setRevisitReminders([...revisitReminders, {
            id: generateId(),
            reminderDate: newReminderDate,
            prompt: newReminderPrompt.trim(),
            completed: false
        }]);
        setNewReminderPrompt('');
        setNewReminderDate('');
    };

    // Delete handlers
    const deleteCoreIdea = (id: string) => setCoreIdeas(coreIdeas.filter(i => i.id !== id));
    const deleteActionTakeaway = (id: string) => setActionTakeaways(actionTakeaways.filter(a => a.id !== id));
    const deleteBeliefChange = (id: string) => setBeliefChanges(beliefChanges.filter(b => b.id !== id));
    const deleteQuote = (id: string) => setQuotes(quotes.filter(q => q.id !== id));
    const deleteReminder = (id: string) => setRevisitReminders(revisitReminders.filter(r => r.id !== id));

    // Toggle action completed
    const toggleActionCompleted = (id: string) => {
        setActionTakeaways(actionTakeaways.map(a =>
            a.id === id ? { ...a, completed: !a.completed } : a
        ));
    };

    // Toggle reminder completed
    const toggleReminderCompleted = (id: string) => {
        setRevisitReminders(revisitReminders.map(r =>
            r.id === id ? { ...r, completed: !r.completed } : r
        ));
    };

    // Link quote to item
    const linkQuoteToItem = (itemType: 'idea' | 'action' | 'belief', itemId: string, quoteId: string) => {
        if (itemType === 'idea') {
            setCoreIdeas(coreIdeas.map(i =>
                i.id === itemId
                    ? {
                        ...i, linkedQuotes: i.linkedQuotes.includes(quoteId)
                            ? i.linkedQuotes.filter(q => q !== quoteId)
                            : [...i.linkedQuotes, quoteId]
                    }
                    : i
            ));
        } else if (itemType === 'action') {
            setActionTakeaways(actionTakeaways.map(a =>
                a.id === itemId
                    ? {
                        ...a, linkedQuotes: a.linkedQuotes.includes(quoteId)
                            ? a.linkedQuotes.filter(q => q !== quoteId)
                            : [...a.linkedQuotes, quoteId]
                    }
                    : a
            ));
        } else if (itemType === 'belief') {
            setBeliefChanges(beliefChanges.map(b =>
                b.id === itemId
                    ? {
                        ...b, linkedQuotes: b.linkedQuotes.includes(quoteId)
                            ? b.linkedQuotes.filter(q => q !== quoteId)
                            : [...b.linkedQuotes, quoteId]
                    }
                    : b
            ));
        }
    };

    // Save all insights
    const saveInsights = () => {
        store.saveBookInsight({
            bookId: book.id,
            coreIdeas,
            actionTakeaways,
            beliefChanges,
            quotes,
            revisitReminders,
            finalSummary,
        });
        onClose();
    };

    const tabs = [
        { id: 'ideas', label: 'Core Ideas', icon: Lightbulb, color: 'text-amber-500' },
        { id: 'actions', label: 'Actions', icon: CheckSquare, color: 'text-emerald-500' },
        { id: 'reminders', label: 'Reminders', icon: Calendar, color: 'text-blue-500' },
        { id: 'beliefs', label: 'Beliefs', icon: Brain, color: 'text-purple-500' },
        { id: 'quotes', label: 'Quotes', icon: Quote, color: 'text-rose-500' },
        { id: 'summary', label: 'Summary', icon: FileText, color: 'text-indigo-500' },
    ] as const;

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full max-w-2xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                        <div className="relative z-10 flex items-start justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Sparkles className="w-5 h-5" />
                                    Book Insights
                                </h2>
                                <p className="text-indigo-100 text-sm mt-1 max-w-xs truncate">{book.title}</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
                            >
                                <X className="w-5 h-5 text-white" />
                            </button>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-gray-100 dark:border-slate-800 overflow-x-auto scrollbar-hide">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 min-w-max flex items-center justify-center gap-1.5 px-4 py-3 text-xs font-semibold transition-all border-b-2 ${activeTab === tab.id
                                    ? `${tab.color} border-current bg-gray-50 dark:bg-slate-800/50`
                                    : 'text-gray-500 border-transparent hover:text-gray-700 dark:hover:text-gray-300'
                                    }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                <span className="hidden sm:inline">{tab.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6">
                        <AnimatePresence mode="wait">
                            {/* Core Ideas Tab */}
                            {activeTab === 'ideas' && (
                                <motion.div
                                    key="ideas"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-4"
                                >
                                    <div className="bg-amber-50 dark:bg-amber-500/10 rounded-2xl p-4 border border-amber-100 dark:border-amber-500/20">
                                        <h3 className="font-semibold text-amber-800 dark:text-amber-400 flex items-center gap-2 mb-2">
                                            <Lightbulb className="w-4 h-4" />
                                            Core Ideas
                                        </h3>
                                        <p className="text-sm text-amber-700/80 dark:text-amber-300/80">
                                            Identify 1-3 central ideas that capture the book's main message in plain language.
                                        </p>
                                    </div>

                                    {/* Add new idea */}
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newIdea}
                                            onChange={(e) => setNewIdea(e.target.value)}
                                            placeholder="Enter a core idea..."
                                            className="flex-1 p-3 bg-gray-50 dark:bg-slate-800 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 border border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                            onKeyDown={(e) => e.key === 'Enter' && addCoreIdea()}
                                        />
                                        <button
                                            onClick={addCoreIdea}
                                            disabled={!newIdea.trim()}
                                            className="px-4 py-3 bg-amber-500 text-white rounded-xl font-semibold hover:bg-amber-600 transition-colors disabled:opacity-50"
                                        >
                                            <Plus className="w-5 h-5" />
                                        </button>
                                    </div>

                                    {/* Ideas list */}
                                    <div className="space-y-3">
                                        {coreIdeas.map((idea, index) => (
                                            <div key={idea.id} className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-100 dark:border-slate-700 shadow-sm">
                                                <div className="flex items-start gap-3">
                                                    <span className="w-7 h-7 bg-amber-100 dark:bg-amber-500/20 rounded-full flex items-center justify-center text-amber-600 dark:text-amber-400 font-bold text-sm flex-shrink-0">
                                                        {index + 1}
                                                    </span>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-gray-800 dark:text-gray-200">{idea.content}</p>
                                                        {idea.linkedQuotes.length > 0 && (
                                                            <div className="mt-2 flex flex-wrap gap-1">
                                                                {idea.linkedQuotes.map(qId => {
                                                                    const quote = quotes.find(q => q.id === qId);
                                                                    return quote ? (
                                                                        <span key={qId} className="text-xs bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 px-2 py-1 rounded-full">
                                                                            "{quote.content.substring(0, 30)}..."
                                                                        </span>
                                                                    ) : null;
                                                                })}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex gap-1">
                                                        <button
                                                            onClick={() => setExpandedQuoteLink(expandedQuoteLink === idea.id ? null : idea.id)}
                                                            className="p-2 text-gray-400 hover:text-indigo-500 transition-colors"
                                                            title="Link quotes"
                                                        >
                                                            <Link2 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => deleteCoreIdea(idea.id)}
                                                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                                {expandedQuoteLink === idea.id && quotes.length > 0 && (
                                                    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-slate-700">
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Link supporting quotes:</p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {quotes.map(quote => (
                                                                <button
                                                                    key={quote.id}
                                                                    onClick={() => linkQuoteToItem('idea', idea.id, quote.id)}
                                                                    className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${idea.linkedQuotes.includes(quote.id)
                                                                        ? 'bg-rose-100 dark:bg-rose-500/20 border-rose-300 dark:border-rose-500/30 text-rose-700 dark:text-rose-300'
                                                                        : 'bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-slate-600 text-gray-600 dark:text-gray-300 hover:border-rose-300'
                                                                        }`}
                                                                >
                                                                    "{quote.content.substring(0, 25)}..."
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                        {coreIdeas.length === 0 && (
                                            <p className="text-center text-gray-400 dark:text-gray-500 py-8">No core ideas added yet</p>
                                        )}
                                    </div>
                                </motion.div>
                            )}

                            {/* Actions Tab */}
                            {activeTab === 'actions' && (
                                <motion.div
                                    key="actions"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-4"
                                >
                                    <div className="bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl p-4 border border-emerald-100 dark:border-emerald-500/20">
                                        <h3 className="font-semibold text-emerald-800 dark:text-emerald-400 flex items-center gap-2 mb-2">
                                            <CheckSquare className="w-4 h-4" />
                                            Actionable Takeaways
                                        </h3>
                                        <p className="text-sm text-emerald-700/80 dark:text-emerald-300/80">
                                            Convert ideas into a checklist of actions or habits. Each item must be testable or doable.
                                        </p>
                                    </div>

                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newAction}
                                            onChange={(e) => setNewAction(e.target.value)}
                                            placeholder="Enter an actionable takeaway..."
                                            className="flex-1 p-3 bg-gray-50 dark:bg-slate-800 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 border border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                            onKeyDown={(e) => e.key === 'Enter' && addActionTakeaway()}
                                        />
                                        <button
                                            onClick={addActionTakeaway}
                                            disabled={!newAction.trim()}
                                            className="px-4 py-3 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600 transition-colors disabled:opacity-50"
                                        >
                                            <Plus className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        {actionTakeaways.map((action) => (
                                            <div key={action.id} className={`bg-white dark:bg-slate-800 rounded-xl p-4 border shadow-sm transition-all ${action.completed
                                                ? 'border-emerald-200 dark:border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-500/5'
                                                : 'border-gray-100 dark:border-slate-700'
                                                }`}>
                                                <div className="flex items-start gap-3">
                                                    <button
                                                        onClick={() => toggleActionCompleted(action.id)}
                                                        className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${action.completed
                                                            ? 'bg-emerald-500 border-emerald-500 text-white'
                                                            : 'border-gray-300 dark:border-slate-600 hover:border-emerald-400'
                                                            }`}
                                                    >
                                                        {action.completed && <Check className="w-4 h-4" />}
                                                    </button>
                                                    <p className={`flex-1 ${action.completed ? 'text-gray-500 line-through' : 'text-gray-800 dark:text-gray-200'}`}>
                                                        {action.action}
                                                    </p>
                                                    <button
                                                        onClick={() => deleteActionTakeaway(action.id)}
                                                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        {actionTakeaways.length === 0 && (
                                            <p className="text-center text-gray-400 dark:text-gray-500 py-8">No actions added yet</p>
                                        )}
                                    </div>
                                </motion.div>
                            )}

                            {/* Reminders Tab */}
                            {activeTab === 'reminders' && (
                                <motion.div
                                    key="reminders"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-4"
                                >
                                    <div className="bg-blue-50 dark:bg-blue-500/10 rounded-2xl p-4 border border-blue-100 dark:border-blue-500/20">
                                        <h3 className="font-semibold text-blue-800 dark:text-blue-400 flex items-center gap-2 mb-2">
                                            <Calendar className="w-4 h-4" />
                                            Revisit Reminders
                                        </h3>
                                        <p className="text-sm text-blue-700/80 dark:text-blue-300/80">
                                            Generate future review prompts to check if ideas were applied or forgotten.
                                        </p>
                                    </div>

                                    {revisitReminders.length === 0 && (
                                        <button
                                            onClick={generateDefaultReminders}
                                            className="w-full py-3 bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 rounded-xl font-semibold hover:bg-blue-200 dark:hover:bg-blue-500/30 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Sparkles className="w-4 h-4" />
                                            Generate Default Reminders (1 week, 1 month, 3 months)
                                        </button>
                                    )}

                                    <div className="flex flex-col sm:flex-row gap-2">
                                        <input
                                            type="text"
                                            value={newReminderPrompt}
                                            onChange={(e) => setNewReminderPrompt(e.target.value)}
                                            placeholder="Reminder prompt..."
                                            className="flex-1 p-3 bg-gray-50 dark:bg-slate-800 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 border border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                        <input
                                            type="date"
                                            value={newReminderDate}
                                            onChange={(e) => setNewReminderDate(e.target.value)}
                                            className="p-3 bg-gray-50 dark:bg-slate-800 rounded-xl text-gray-900 dark:text-white border border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                        <button
                                            onClick={addReminder}
                                            disabled={!newReminderPrompt.trim() || !newReminderDate}
                                            className="px-4 py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50"
                                        >
                                            <Plus className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        {revisitReminders.sort((a, b) => new Date(a.reminderDate).getTime() - new Date(b.reminderDate).getTime()).map((reminder) => (
                                            <div key={reminder.id} className={`bg-white dark:bg-slate-800 rounded-xl p-4 border shadow-sm ${reminder.completed
                                                ? 'border-blue-200 dark:border-blue-500/30 opacity-70'
                                                : 'border-gray-100 dark:border-slate-700'
                                                }`}>
                                                <div className="flex items-start gap-3">
                                                    <button
                                                        onClick={() => toggleReminderCompleted(reminder.id)}
                                                        className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${reminder.completed
                                                            ? 'bg-blue-500 border-blue-500 text-white'
                                                            : 'border-gray-300 dark:border-slate-600 hover:border-blue-400'
                                                            }`}
                                                    >
                                                        {reminder.completed && <Check className="w-4 h-4" />}
                                                    </button>
                                                    <div className="flex-1">
                                                        <p className={reminder.completed ? 'text-gray-500 line-through' : 'text-gray-800 dark:text-gray-200'}>
                                                            {reminder.prompt}
                                                        </p>
                                                        <p className="text-xs text-gray-400 mt-1">
                                                            {new Date(reminder.reminderDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={() => deleteReminder(reminder.id)}
                                                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {/* Beliefs Tab */}
                            {activeTab === 'beliefs' && (
                                <motion.div
                                    key="beliefs"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-4"
                                >
                                    <div className="bg-purple-50 dark:bg-purple-500/10 rounded-2xl p-4 border border-purple-100 dark:border-purple-500/20">
                                        <h3 className="font-semibold text-purple-800 dark:text-purple-400 flex items-center gap-2 mb-2">
                                            <Brain className="w-4 h-4" />
                                            Belief Change Mapping
                                        </h3>
                                        <p className="text-sm text-purple-700/80 dark:text-purple-300/80">
                                            Record beliefs before and after reading. Note any mindset shifts or reinforced views.
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <input
                                            type="text"
                                            value={newBeliefBefore}
                                            onChange={(e) => setNewBeliefBefore(e.target.value)}
                                            placeholder="What I believed BEFORE reading..."
                                            className="w-full p-3 bg-gray-50 dark:bg-slate-800 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 border border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        />
                                        <input
                                            type="text"
                                            value={newBeliefAfter}
                                            onChange={(e) => setNewBeliefAfter(e.target.value)}
                                            placeholder="What I believe AFTER reading..."
                                            className="w-full p-3 bg-gray-50 dark:bg-slate-800 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 border border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        />
                                        <button
                                            onClick={addBeliefChange}
                                            disabled={!newBeliefBefore.trim() || !newBeliefAfter.trim()}
                                            className="w-full py-3 bg-purple-500 text-white rounded-xl font-semibold hover:bg-purple-600 transition-colors disabled:opacity-50"
                                        >
                                            Add Belief Change
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        {beliefChanges.map((belief) => (
                                            <div key={belief.id} className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-100 dark:border-slate-700 shadow-sm">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1 space-y-3">
                                                        <div className="flex items-start gap-2">
                                                            <span className="text-xs font-bold uppercase text-gray-400 dark:text-gray-500 w-16 flex-shrink-0">Before</span>
                                                            <p className="text-gray-600 dark:text-gray-400 text-sm">{belief.beliefBefore}</p>
                                                        </div>
                                                        <div className="flex justify-center">
                                                            <ChevronDown className="w-4 h-4 text-purple-400" />
                                                        </div>
                                                        <div className="flex items-start gap-2">
                                                            <span className="text-xs font-bold uppercase text-purple-500 dark:text-purple-400 w-16 flex-shrink-0">After</span>
                                                            <p className="text-gray-800 dark:text-gray-200 text-sm font-medium">{belief.beliefAfter}</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => deleteBeliefChange(belief.id)}
                                                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        {beliefChanges.length === 0 && (
                                            <p className="text-center text-gray-400 dark:text-gray-500 py-8">No belief changes recorded yet</p>
                                        )}
                                    </div>
                                </motion.div>
                            )}

                            {/* Quotes Tab */}
                            {activeTab === 'quotes' && (
                                <motion.div
                                    key="quotes"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-4"
                                >
                                    <div className="bg-rose-50 dark:bg-rose-500/10 rounded-2xl p-4 border border-rose-100 dark:border-rose-500/20">
                                        <h3 className="font-semibold text-rose-800 dark:text-rose-400 flex items-center gap-2 mb-2">
                                            <Quote className="w-4 h-4" />
                                            Quote-to-Note Linking
                                        </h3>
                                        <p className="text-sm text-rose-700/80 dark:text-rose-300/80">
                                            Attach meaningful quotes to ideas, actions, and belief changes. Each quote should support a specific note.
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <textarea
                                            value={newQuote}
                                            onChange={(e) => setNewQuote(e.target.value)}
                                            placeholder="Enter a meaningful quote..."
                                            className="w-full p-3 bg-gray-50 dark:bg-slate-800 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 border border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-rose-500 focus:border-transparent resize-none h-20"
                                        />
                                        <div className="flex gap-2">
                                            <input
                                                type="number"
                                                value={newQuotePage}
                                                onChange={(e) => setNewQuotePage(e.target.value)}
                                                placeholder="Page #"
                                                className="w-24 p-3 bg-gray-50 dark:bg-slate-800 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 border border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                                            />
                                            <input
                                                type="text"
                                                value={newQuoteNote}
                                                onChange={(e) => setNewQuoteNote(e.target.value)}
                                                placeholder="Optional note about this quote..."
                                                className="flex-1 p-3 bg-gray-50 dark:bg-slate-800 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 border border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                                            />
                                        </div>
                                        <button
                                            onClick={addQuote}
                                            disabled={!newQuote.trim()}
                                            className="w-full py-3 bg-rose-500 text-white rounded-xl font-semibold hover:bg-rose-600 transition-colors disabled:opacity-50"
                                        >
                                            Add Quote
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        {quotes.map((quote) => (
                                            <div key={quote.id} className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-100 dark:border-slate-700 shadow-sm">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex-1">
                                                        <p className="text-gray-800 dark:text-gray-200 italic">"{quote.content}"</p>
                                                        <div className="flex items-center gap-3 mt-2">
                                                            {quote.page && (
                                                                <span className="text-xs text-gray-400">Page {quote.page}</span>
                                                            )}
                                                            {quote.note && (
                                                                <span className="text-xs text-rose-500 dark:text-rose-400">{quote.note}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => deleteQuote(quote.id)}
                                                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        {quotes.length === 0 && (
                                            <p className="text-center text-gray-400 dark:text-gray-500 py-8">No quotes added yet</p>
                                        )}
                                    </div>
                                </motion.div>
                            )}

                            {/* Summary Tab */}
                            {activeTab === 'summary' && (
                                <motion.div
                                    key="summary"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-4"
                                >
                                    <div className="bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl p-4 border border-indigo-100 dark:border-indigo-500/20">
                                        <h3 className="font-semibold text-indigo-800 dark:text-indigo-400 flex items-center gap-2 mb-2">
                                            <FileText className="w-4 h-4" />
                                            Final Summary
                                        </h3>
                                        <p className="text-sm text-indigo-700/80 dark:text-indigo-300/80">
                                            A concise, connected summary designed for recall, action, and reflection.
                                        </p>
                                    </div>

                                    <textarea
                                        value={finalSummary}
                                        onChange={(e) => setFinalSummary(e.target.value)}
                                        placeholder="Write your final summary of the book... What's the one thing you want to remember?"
                                        className="w-full p-4 bg-gray-50 dark:bg-slate-800 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 border border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none h-48"
                                    />

                                    {/* Summary Stats */}
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        <div className="bg-amber-50 dark:bg-amber-500/10 rounded-xl p-3 text-center">
                                            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{coreIdeas.length}</p>
                                            <p className="text-xs text-amber-700 dark:text-amber-300">Core Ideas</p>
                                        </div>
                                        <div className="bg-emerald-50 dark:bg-emerald-500/10 rounded-xl p-3 text-center">
                                            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{actionTakeaways.filter(a => a.completed).length}/{actionTakeaways.length}</p>
                                            <p className="text-xs text-emerald-700 dark:text-emerald-300">Actions Done</p>
                                        </div>
                                        <div className="bg-purple-50 dark:bg-purple-500/10 rounded-xl p-3 text-center">
                                            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{beliefChanges.length}</p>
                                            <p className="text-xs text-purple-700 dark:text-purple-300">Belief Shifts</p>
                                        </div>
                                        <div className="bg-rose-50 dark:bg-rose-500/10 rounded-xl p-3 text-center">
                                            <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">{quotes.length}</p>
                                            <p className="text-xs text-rose-700 dark:text-rose-300">Quotes</p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Footer */}
                    <div className="bg-gray-50 dark:bg-slate-800/50 px-6 py-4 border-t border-gray-100 dark:border-slate-700 flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={saveInsights}
                            className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-colors shadow-lg"
                        >
                            Save Insights
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default BookInsightsModal;
