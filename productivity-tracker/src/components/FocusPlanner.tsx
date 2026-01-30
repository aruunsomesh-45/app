import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus, Check } from 'lucide-react';

interface PriorityItem {
    id: string;
    text: string;
    category: string;
    done: boolean;
}

interface AnticodeItem {
    id: string;
    text: string;
    note?: string;
    avoided: boolean;
}

interface WeeklyTask {
    id: string;
    title: string;
    week: string;
    done: boolean;
}

const FocusPlanner: React.FC = () => {
    const navigate = useNavigate();

    // -- State --
    const [priorities, setPriorities] = useState<PriorityItem[]>([
        { id: '1', text: 'Deep work – Development', category: 'Deep Work', done: false },
        { id: '2', text: 'Finish UI for client', category: 'Work', done: true },
    ]);
    const [anticodes, setAnticodes] = useState<AnticodeItem[]>([
        { id: '1', text: 'No social media before noon', note: 'Strict!', avoided: false },
        { id: '2', text: 'Avoid multitasking', avoided: true },
    ]);
    const [weeklyTasks, setWeeklyTasks] = useState<WeeklyTask[]>([
        { id: '1', title: 'Submit proposal', week: 'Week of Sept 18', done: false },
        { id: '2', title: 'Complete design review', week: 'Week of Sept 18', done: true },
    ]);

    // -- Modal State --
    const [isPriorityModalOpen, setPriorityModalOpen] = useState(false);
    const [isAnticodeModalOpen, setAnticodeModalOpen] = useState(false);
    const [isWeeklyModalOpen, setWeeklyModalOpen] = useState(false);
    const [newItemText, setNewItemText] = useState('');
    const [newCategory, setNewCategory] = useState(''); // reused for extra fields

    // -- Handlers --
    const togglePriority = (id: string) => {
        setPriorities(priorities.map(p => p.id === id ? { ...p, done: !p.done } : p));
    };

    const toggleAnticode = (id: string) => {
        setAnticodes(anticodes.map(a => a.id === id ? { ...a, avoided: !a.avoided } : a));
    };

    const toggleWeekly = (id: string) => {
        setWeeklyTasks(weeklyTasks.map(w => w.id === id ? { ...w, done: !w.done } : w));
    };

    const addPriority = () => {
        if (newItemText.trim()) {
            setPriorities([...priorities, {
                id: Date.now().toString(),
                text: newItemText,
                category: newCategory || 'General',
                done: false
            }]);
            setNewItemText('');
            setNewCategory('');
            setPriorityModalOpen(false);
        }
    };

    const addAnticode = () => {
        if (newItemText.trim()) {
            setAnticodes([...anticodes, {
                id: Date.now().toString(),
                text: newItemText,
                note: newCategory,
                avoided: false
            }]);
            setNewItemText('');
            setNewCategory('');
            setAnticodeModalOpen(false);
        }
    };

    const addWeekly = () => {
        if (newItemText.trim()) {
            setWeeklyTasks([...weeklyTasks, {
                id: Date.now().toString(),
                title: newItemText,
                week: newCategory || 'Current Week',
                done: false
            }]);
            setNewItemText('');
            setNewCategory('');
            setWeeklyModalOpen(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans pb-10">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-100 flex items-center justify-between px-6 py-4">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors">
                    <ChevronLeft className="w-6 h-6 text-gray-600" />
                </button>
                <h1 className="text-lg font-bold text-gray-900">Focus Planner</h1>
                <div className="w-8 h-8"></div> {/* Spacer for alignment */}
            </header>

            <main className="px-6 py-6 space-y-6 max-w-md mx-auto">

                {/* --- Section 1: Priorities --- */}
                <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-50 flex justify-between items-center bg-indigo-50/30">
                        <h2 className="font-bold text-gray-900 text-base">Priorities</h2>
                        <button onClick={() => setPriorityModalOpen(true)} className="p-1.5 rounded-full bg-white border border-gray-200 shadow-sm text-indigo-600 hover:scale-105 active:scale-95 transition-transform">
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {priorities.length === 0 ? (
                            <div className="p-8 text-center text-gray-400 text-sm">No priorities added yet</div>
                        ) : (
                            priorities.map(item => (
                                <div key={item.id} className="p-4 flex items-start gap-3 hover:bg-gray-50/50 transition-colors cursor-pointer" onClick={() => togglePriority(item.id)}>
                                    <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${item.done ? 'bg-indigo-500 border-indigo-500' : 'border-gray-300'}`}>
                                        {item.done && <Check className="w-3 h-3 text-white" />}
                                    </div>
                                    <div className="flex-1">
                                        <p className={`text-sm font-medium transition-colors ${item.done ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{item.text}</p>
                                        <span className={`inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 ${item.done ? 'opacity-50' : ''}`}>
                                            {item.category}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                        <button className="w-full py-3 text-xs font-semibold text-gray-500 hover:text-indigo-600 hover:bg-gray-50 transition-colors text-center border-t border-gray-50">
                            View All Priorities
                        </button>
                    </div>
                </section>

                {/* --- Section 2: Anticodes --- */}
                <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-50 flex justify-between items-center bg-red-50/30">
                        <h2 className="font-bold text-gray-900 text-base">Anticodes <span className="text-xs font-normal text-gray-400 ml-1">(Avoid)</span></h2>
                        <button onClick={() => setAnticodeModalOpen(true)} className="p-1.5 rounded-full bg-white border border-gray-200 shadow-sm text-red-600 hover:scale-105 active:scale-95 transition-transform">
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {anticodes.map(item => (
                            <div key={item.id} className="p-4 flex items-center gap-3 hover:bg-gray-50/50 transition-colors cursor-pointer" onClick={() => toggleAnticode(item.id)}>
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${item.avoided ? 'bg-red-500 border-red-500' : 'border-gray-300'}`}>
                                    {item.avoided && <Check className="w-3 h-3 text-white" />}
                                </div>
                                <div className="flex-1">
                                    <p className={`text-sm font-medium transition-colors ${item.avoided ? 'text-gray-400' : 'text-gray-900'}`}>{item.text}</p>
                                    {item.note && <p className="text-xs text-red-400 mt-0.5">{item.note}</p>}
                                </div>
                            </div>
                        ))}
                        <button className="w-full py-3 text-xs font-semibold text-gray-500 hover:text-red-600 hover:bg-gray-50 transition-colors text-center border-t border-gray-50">
                            View All Anticodes
                        </button>
                    </div>
                </section>

                {/* --- Section 3: Weekly Section --- */}
                <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-50 flex justify-between items-center bg-emerald-50/30">
                        <h2 className="font-bold text-gray-900 text-base">This Week</h2>
                        <button onClick={() => setWeeklyModalOpen(true)} className="p-1.5 rounded-full bg-white border border-gray-200 shadow-sm text-emerald-600 hover:scale-105 active:scale-95 transition-transform">
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {weeklyTasks.map(item => (
                            <div key={item.id} className="p-4 flex items-center gap-3 hover:bg-gray-50/50 transition-colors cursor-pointer" onClick={() => toggleWeekly(item.id)}>
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${item.done ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300'}`}>
                                    {item.done && <Check className="w-3 h-3 text-white" />}
                                </div>
                                <div className="flex-1">
                                    <p className={`text-sm font-medium transition-colors ${item.done ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{item.title}</p>
                                    <p className="text-xs text-gray-400 mt-0.5">{item.week}</p>
                                </div>
                            </div>
                        ))}
                        <button className="w-full py-3 text-xs font-semibold text-gray-500 hover:text-emerald-600 hover:bg-gray-50 transition-colors text-center border-t border-gray-50">
                            View Weekly Overview
                        </button>
                    </div>
                </section>
            </main>

            {/* --- Modals --- */}

            {/* Priority Modal */}
            {isPriorityModalOpen && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4 sm:p-0 animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-sm rounded-t-2xl sm:rounded-2xl p-6 shadow-xl animate-in slide-in-from-bottom duration-300">
                        <h3 className="text-lg font-bold mb-4">Add Priority</h3>
                        <input
                            autoFocus
                            type="text"
                            placeholder="Enter priority..."
                            className="w-full mb-3 p-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            value={newItemText}
                            onChange={e => setNewItemText(e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="Category (e.g. Work)"
                            className="w-full mb-6 p-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                            value={newCategory}
                            onChange={e => setNewCategory(e.target.value)}
                        />
                        <div className="flex gap-3">
                            <button onClick={() => setPriorityModalOpen(false)} className="flex-1 py-3 text-gray-600 font-medium bg-gray-100 rounded-xl hover:bg-gray-200">Cancel</button>
                            <button onClick={addPriority} className="flex-1 py-3 text-white font-bold bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200">Save</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Anticode Modal */}
            {isAnticodeModalOpen && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4 sm:p-0 animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-sm rounded-t-2xl sm:rounded-2xl p-6 shadow-xl animate-in slide-in-from-bottom duration-300">
                        <h3 className="text-lg font-bold mb-4 text-red-600">Add Anticode</h3>
                        <input
                            autoFocus
                            type="text"
                            placeholder="Enter habit to avoid..."
                            className="w-full mb-3 p-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                            value={newItemText}
                            onChange={e => setNewItemText(e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="Note (optional)"
                            className="w-full mb-6 p-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                            value={newCategory}
                            onChange={e => setNewCategory(e.target.value)}
                        />
                        <div className="flex gap-3">
                            <button onClick={() => setAnticodeModalOpen(false)} className="flex-1 py-3 text-gray-600 font-medium bg-gray-100 rounded-xl hover:bg-gray-200">Cancel</button>
                            <button onClick={addAnticode} className="flex-1 py-3 text-white font-bold bg-red-600 rounded-xl hover:bg-red-700 shadow-lg shadow-red-200">Save</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Weekly Modal */}
            {isWeeklyModalOpen && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4 sm:p-0 animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-sm rounded-t-2xl sm:rounded-2xl p-6 shadow-xl animate-in slide-in-from-bottom duration-300">
                        <h3 className="text-lg font-bold mb-4 text-emerald-600">Add Weekly Task</h3>
                        <input
                            autoFocus
                            type="text"
                            placeholder="Enter task..."
                            className="w-full mb-3 p-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            value={newItemText}
                            onChange={e => setNewItemText(e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="Week (e.g. Week of Sept 1)"
                            className="w-full mb-6 p-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                            value={newCategory}
                            onChange={e => setNewCategory(e.target.value)}
                        />
                        <div className="flex gap-3">
                            <button onClick={() => setWeeklyModalOpen(false)} className="flex-1 py-3 text-gray-600 font-medium bg-gray-100 rounded-xl hover:bg-gray-200">Cancel</button>
                            <button onClick={addWeekly} className="flex-1 py-3 text-white font-bold bg-emerald-600 rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-200">Save</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default FocusPlanner;
