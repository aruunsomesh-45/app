import React, { useState } from 'react';
import { X, Trash2, Copy } from 'lucide-react';

interface ScratchpadProps {
    isOpen: boolean;
    onClose: () => void;
}

const Scratchpad: React.FC<ScratchpadProps> = ({ isOpen, onClose }) => {
    const [content, setContent] = useState(() => localStorage.getItem('global_scratchpad') || '');

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const val = e.target.value;
        setContent(val);
        localStorage.setItem('global_scratchpad', val);
    };

    const handleClear = () => {
        if (confirm('Clear scratchpad?')) {
            setContent('');
            localStorage.setItem('global_scratchpad', '');
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(content);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center pointer-events-none">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/20 backdrop-blur-sm pointer-events-auto transition-opacity"
                onClick={onClose}
            ></div>

            {/* Note Card */}
            <div className="bg-[#fef9c3] w-full max-w-md h-[80vh] sm:h-[600px] rounded-t-3xl sm:rounded-3xl shadow-2xl transform transition-transform duration-300 flex flex-col pointer-events-auto relative animate-in slide-in-from-bottom">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-yellow-400/20">
                    <h2 className="font-bold text-lg text-yellow-900 flex items-center gap-2">
                        <span className="text-xl">📝</span> Scratchpad
                    </h2>
                    <div className="flex bg-white/50 rounded-full p-1">
                        <button onClick={handleCopy} className="p-2 hover:bg-yellow-400/20 rounded-full text-yellow-800 transition-colors" title="Copy">
                            <Copy className="w-4 h-4" />
                        </button>
                        <button onClick={handleClear} className="p-2 hover:bg-red-400/20 rounded-full text-red-600 transition-colors" title="Clear">
                            <Trash2 className="w-4 h-4" />
                        </button>
                        <button onClick={onClose} className="p-2 hover:bg-black/10 rounded-full text-gray-800 transition-colors ml-2">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <textarea
                    className="flex-1 w-full bg-transparent p-6 text-lg text-slate-800 placeholder:text-slate-400/50 resize-none outline-none font-medium leading-relaxed"
                    placeholder="Jot down quick thoughts..."
                    value={content}
                    onChange={handleChange}
                    autoFocus
                />
            </div>
        </div>
    );
};

export default Scratchpad;
