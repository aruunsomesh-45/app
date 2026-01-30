import React, { useState } from 'react';
// Force refresh
import { useParams, useNavigate } from 'react-router-dom';
import { sections } from '../data/sections';
import { ArrowLeft, Plus, Trash2, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SectionView: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const section = sections.find(s => s.id === id);

    const [logs, setLogs] = useState<{ id: string, text: string, date: string }[]>(() => {
        const saved = localStorage.getItem(`logs-${id}`);
        return saved ? JSON.parse(saved) : [];
    });
    const [newLog, setNewLog] = useState('');

    // Use the "update during render" pattern to sync logs with the URL ID
    const [prevId, setPrevId] = useState(id);
    if (id !== prevId) {
        setPrevId(id);
        const saved = localStorage.getItem(`logs-${id}`);
        setLogs(saved ? JSON.parse(saved) : []);
    }

    const saveLogs = (newLogs: typeof logs) => {
        setLogs(newLogs);
        localStorage.setItem(`logs-${id}`, JSON.stringify(newLogs));
    };

    const addLog = () => {
        if (!newLog.trim()) return;
        const item = {
            id: Date.now().toString(),
            text: newLog,
            date: new Date().toLocaleDateString()
        };
        saveLogs([item, ...logs]);
        setNewLog('');
    };

    const deleteLog = (logId: string) => {
        saveLogs(logs.filter(l => l.id !== logId));
    };

    if (!section) return <div>Section not found</div>;

    // Extract color classes but handle the 'text-' part differently for the bg
    // section.color is like "bg-orange-100 text-orange-600"
    const bgClass = section.color.split(' ').find(c => c.startsWith('bg-')) || 'bg-gray-100';
    const textClass = section.color.split(' ').find(c => c.startsWith('text-')) || 'text-gray-800';

    return (
        <div className="min-h-screen bg-white">
            <div className={`p-6 ${bgClass} bg-opacity-40 pb-12 rounded-b-[2.5rem] transition-colors duration-300`}>
                <button
                    onClick={() => navigate('/dashboard')}
                    className="p-2 -ml-2 rounded-full hover:bg-black/5 transition-colors mb-6"
                >
                    <ArrowLeft className="w-6 h-6 text-gray-800" />
                </button>

                <div className="flex items-center gap-4 mb-2">
                    <div className="p-3.5 rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
                        <section.icon className={`w-8 h-8 ${textClass}`} />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{section.title}</h1>
                </div>
                <p className="text-gray-600 font-medium ml-1 opacity-80">{section.description}</p>
            </div>

            <div className="p-6 -mt-8">
                <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] p-2 mb-8 border border-gray-50">
                    <div className="flex items-center gap-3 p-1">
                        <input
                            type="text"
                            value={newLog}
                            onChange={(e) => setNewLog(e.target.value)}
                            placeholder="Add a new entry..."
                            className="flex-1 outline-none text-gray-700 placeholder-gray-400 bg-transparent px-2 font-medium"
                            onKeyDown={(e) => e.key === 'Enter' && addLog()}
                        />
                        <button
                            onClick={addLog}
                            className={`p-3 rounded-xl ${bgClass} ${textClass} hover:brightness-95 transition-all shadow-sm active:scale-95`}
                        >
                            <Plus className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 px-2">History</h2>

                <div className="space-y-3 pb-20">
                    <AnimatePresence mode="popLayout">
                        {logs.length === 0 && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center text-gray-400 py-10 text-sm"
                            >
                                No activity logged yet. Start doing things!
                            </motion.div>
                        )}
                        {logs.map((log) => (
                            <motion.div
                                key={log.id}
                                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                                layout
                                className="bg-gray-50/80 p-4 rounded-2xl border border-gray-100 flex justify-between items-start group hover:bg-white hover:shadow-sm transition-all"
                            >
                                <div className="flex-1">
                                    <p className="text-gray-800 font-medium leading-relaxed">{log.text}</p>
                                    <div className="flex items-center gap-1.5 mt-2">
                                        <Calendar className="w-3 h-3 text-gray-400" />
                                        <span className="text-xs text-gray-400 font-medium">{log.date}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => deleteLog(log.id)}
                                    className="text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all p-2 rounded-lg opacity-0 group-hover:opacity-100 focus:opacity-100"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default SectionView;
