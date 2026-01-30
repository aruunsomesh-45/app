import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Dumbbell } from 'lucide-react';
import { WORKOUT_CATEGORIES } from '../data/workoutData';

interface CustomCategory {
    id: string;
    title: string;
    subtitle?: string;
}

const WorkoutCategories: React.FC = () => {
    const navigate = useNavigate();
    const [selectedIds, setSelectedIds] = useState<string[]>(() => {
        const stored = localStorage.getItem('selectedWorkoutCategories');
        if (stored) {
            return JSON.parse(stored);
        } else {
            return WORKOUT_CATEGORIES.filter(c => c.defaultActive).map(c => c.id);
        }
    });
    const [searchTerm, setSearchTerm] = useState('');

    const [customCategories] = useState<CustomCategory[]>(() => {
        const customData = localStorage.getItem('customCategories');
        return customData ? JSON.parse(customData) : [];
    });

    const allCategories = [
        ...WORKOUT_CATEGORIES,
        ...customCategories.map(cat => ({
            id: cat.id,
            title: cat.title,
            subtitle: cat.subtitle || 'Custom Routine',
            icon: Dumbbell,
            color: 'text-indigo-400',
            bg: 'bg-indigo-500/10',
            isCustom: true
        }))
    ];

    const toggleCategory = (id: string) => {
        const newSelection = selectedIds.includes(id)
            ? selectedIds.filter(catId => catId !== id)
            : [...selectedIds, id];

        setSelectedIds(newSelection);
        localStorage.setItem('selectedWorkoutCategories', JSON.stringify(newSelection));
        window.dispatchEvent(new Event('routinesUpdated'));
    };

    const filteredCategories = allCategories.filter(cat =>
        cat.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (cat.subtitle || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="h-[100dvh] bg-[#f6f8f6] font-sans flex justify-center selection:bg-[#2bee6c] selection:text-black overflow-hidden">
            <div className="w-full max-w-md h-full bg-[#f6f8f6] flex flex-col relative shadow-xl">

                {/* Header */}
                <div className="px-5 pt-8 pb-4 flex justify-between items-start shrink-0">
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight leading-tight">Add<br />Categories</h1>
                    <button
                        onClick={() => navigate('/section/workout')}
                        className="mt-2 px-5 py-1.5 rounded-full bg-[#2bee6c] text-black font-bold text-sm hover:bg-[#2bee6c]/90 transition-colors shadow-sm"
                    >
                        Done
                    </button>
                </div>

                {/* Search */}
                <div className="px-5 mb-4 shrink-0">
                    <div className="relative group">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#2bee6c] transition-colors">
                            <Search className="w-5 h-5" />
                        </span>
                        <input
                            className="w-full pl-12 pr-4 py-3.5 bg-white border-transparent shadow-sm rounded-2xl text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-[#2bee6c] focus:outline-none transition-all text-sm font-medium"
                            placeholder="Find categories (e.g., CrossFit)..."
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Sub-header */}
                <div className="px-5 mb-3 flex justify-between items-end shrink-0">
                    <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Available Types</h2>
                    <span className="text-xs text-[#2bee6c] font-bold">{selectedIds.length} Selected</span>
                </div>

                {/* Main Content - Scrollbar enabled */}
                <div className="flex-1 overflow-y-auto pb-24 px-5">
                    <div className="flex flex-col gap-3">
                        {filteredCategories.map((cat) => {
                            const isChecked = selectedIds.includes(cat.id);
                            return (
                                <div key={cat.id} className="flex items-center justify-between p-3.5 bg-white rounded-2xl shadow-sm border border-transparent hover:border-slate-100 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-xl ${cat.bg || 'bg-gray-100'} flex items-center justify-center shrink-0`}>
                                            <cat.icon className={`w-6 h-6 ${cat.color.replace('text-', 'text-slate-700 ')}`} />
                                            {/* Note: cat.color usually has a specific color, but for consistency we might want to override or keep it. 
                                                If cat.color is 'text-purple-500', it will show purple. That's fine for icons. */}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900 text-base">{cat.title}</h3>
                                            <p className="text-xs text-slate-500 font-medium">{cat.subtitle}</p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            checked={isChecked}
                                            onChange={() => toggleCategory(cat.id)}
                                            className="sr-only peer"
                                            type="checkbox"
                                        />
                                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2bee6c]"></div>
                                    </label>
                                </div>
                            );
                        })}
                    </div>

                    {/* Add Custom Button Link */}
                    <button
                        onClick={() => navigate('/workout/categories/add')}
                        className="w-full mt-6 py-4 rounded-2xl border-2 border-dashed border-slate-300 text-slate-400 font-bold hover:border-[#2bee6c] hover:text-[#2bee6c] hover:bg-[#2bee6c]/5 transition-colors flex items-center justify-center gap-2"
                    >
                        <span className="text-xl">+</span>
                        Create Custom Category
                    </button>

                    <div className="h-6"></div>
                </div>
            </div>
        </div>
    );
};

export default WorkoutCategories;
