
import React, { useState, useEffect } from 'react';
import { PenLine } from 'lucide-react';

const NotesWidget: React.FC = () => {
    const [note, setNote] = useState(() => {
        return localStorage.getItem('personal_board_sticky_note') || '';
    });

    useEffect(() => {
        localStorage.setItem('personal_board_sticky_note', note);
    }, [note]);

    return (
        <div className="bg-yellow-50/90 dark:bg-yellow-900/10 backdrop-blur-md rounded-3xl p-6 shadow-sm border border-yellow-100 dark:border-yellow-900/30 h-full flex flex-col group hover:shadow-md transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/40 rounded-xl">
                    <PenLine className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <h3 className="font-bold text-gray-800 dark:text-white">Quick Note</h3>
            </div>
            <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Capture a thought..."
                className="flex-1 w-full bg-transparent resize-none border-none focus:ring-0 p-0 text-sm leading-relaxed text-gray-700 dark:text-gray-200 placeholder:text-gray-400 font-medium"
            />
        </div>
    );
};

export default NotesWidget;
