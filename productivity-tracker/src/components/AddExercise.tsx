import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    ChevronLeft, Search, Plus, ChevronRight,
    Dumbbell, Activity, Check
} from 'lucide-react';
import { ALL_EXERCISES } from '../data/exerciseList';
import { saveCustomExercise } from '../utils/workoutStore';

const AddExercise: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { sourceWorkout } = location.state || {};

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    // Extract unique categories from data
    const categories = useMemo(() => {
        const cats = new Set(ALL_EXERCISES.map(ex => ex.category));
        return ['All', 'Favorites', ...Array.from(cats)];
    }, []);

    // Helper to get consistent gradient
    const getGradient = (category: string) => {
        const gradients = [
            'from-blue-500/20 to-purple-500/20',
            'from-orange-500/20 to-red-500/20',
            'from-green-500/20 to-teal-500/20',
            'from-indigo-500/20 to-blue-500/20',
            'from-yellow-500/20 to-orange-500/20',
            'from-pink-500/20 to-rose-500/20',
            'from-cyan-500/20 to-blue-500/20',
        ];
        let hash = 0;
        for (let i = 0; i < category.length; i++) {
            hash = category.charCodeAt(i) + ((hash << 5) - hash);
        }
        return gradients[Math.abs(hash) % gradients.length];
    };

    // Consistent Recent Exercises
    const recentExercises = useMemo(() => [
        { id: 'rec-ab', name: 'Ab Crunch', muscle: 'Core • Bodyweight', icon: Activity, description: 'Core • Bodyweight' },
        { id: 'rec-ap', name: 'Arnold Press', muscle: 'Shoulders • Dumbbell', icon: Dumbbell, description: 'Shoulders • Dumbbell' },
        { id: 'rec-br', name: 'Barbell Row', muscle: 'Back • Barbell', icon: Dumbbell, description: 'Back • Barbell' },
        { id: 'rec-bc', name: 'Bicep Curl', muscle: 'Arms • Dumbbell', icon: Dumbbell, description: 'Arms • Dumbbell' },
        { id: 'rec-bs', name: 'Bulgarian Split Squat', muscle: 'Legs • Dumbbell', icon: Dumbbell, description: 'Legs • Dumbbell', preselected: true },
    ], []);

    // Selection Logic
    const toggleSelection = (id: string) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setSelectedIds(newSet);
    };

    const handleDone = () => {
        if (!sourceWorkout) {
            console.warn("No source workout provided");
            navigate(-1);
            return;
        }

        const allPotential = [...recentExercises, ...ALL_EXERCISES.map(ex => ({ ...ex, muscle: ex.description, icon: Dumbbell }))];

        // Find selected items
        selectedIds.forEach(id => {
            const item = allPotential.find(ex => ex.id === id);
            if (item) {
                // Save to store
                saveCustomExercise(sourceWorkout, {
                    id: item.id,
                    name: item.name,
                    muscle: item.muscle || item.description, // Mapping description to muscle
                    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=200', // Placeholder
                    sets: [{ id: 1, weight: 0, reps: 10, completed: false }],
                    description: item.description
                });
            }
        });

        navigate(-1);
    };


    // Filter logic
    const filteredExercises = useMemo(() => {
        return ALL_EXERCISES.filter(ex => {
            const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (ex.description || '').toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = selectedCategory === 'All' ||
                (selectedCategory === 'Favorites' ? false : ex.category === selectedCategory);
            return matchesSearch && matchesCategory;
        });
    }, [searchQuery, selectedCategory]);

    return (
        // Fix scrolling: Removed h-screen and overflow-y-auto to allow global window scrolling
        <div className="w-full bg-[#f6f8f6] font-sans text-slate-900 flex justify-center min-h-screen">
            <div className="w-full max-w-md flex flex-col bg-[#f6f8f6]">

                {/* Header */}
                <header className="sticky top-0 z-50 bg-[#f6f8f6]/95 backdrop-blur-md border-b border-black/5">
                    <div className="flex items-center justify-between p-4 h-16">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-black/5 transition-colors"
                        >
                            <ChevronLeft className="w-7 h-7 text-slate-900" />
                        </button>
                        <h1 className="text-lg font-bold tracking-tight">Add Exercise</h1>
                        <button
                            onClick={handleDone}
                            className="px-3 py-1.5 rounded-full text-[#2bee6c] font-bold text-sm hover:bg-[#2bee6c]/10 transition-colors"
                        >
                            Done
                        </button>
                    </div>
                </header>

                {/* Search */}
                <div className="px-4 py-3 sticky top-16 z-40 bg-[#f6f8f6]">
                    <div className="relative group enhanced-card-mini p-0 border-0" style={{ borderRadius: '0.75rem', overflow: 'hidden' }}>
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="w-5 h-5 text-slate-400 group-focus-within:text-[#2bee6c] transition-colors" />
                        </div>
                        <input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="block w-full pl-10 pr-3 py-3 border-none bg-white text-slate-900 placeholder-slate-400 focus:ring-0 focus:bg-white transition-all text-base outline-none"
                            placeholder="Search exercises..."
                            type="text"
                        />
                    </div>
                </div>

                {/* Categories */}
                <div className="w-full overflow-x-auto no-scrollbar pb-2 sticky top-[7rem] z-30 bg-[#f6f8f6]">
                    <div className="flex gap-2 px-4 min-w-max">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`flex items-center px-4 py-2 rounded-full font-medium text-sm transition-all border ${selectedCategory === cat
                                    ? 'bg-[#2bee6c] text-black border-[#2bee6c] shadow-md shadow-[#2bee6c]/20 font-semibold'
                                    : 'bg-white border-black/5 text-slate-600 hover:bg-black/5'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                <main className="flex-1 flex flex-col px-4 pb-20 space-y-6 mt-4">
                    {/* Create Custom Action */}
                    <button
                        onClick={() => navigate('/workout/create-exercise')}
                        className="enhanced-card-mini card-interactive flex items-center gap-4 w-full p-4 group card-glow-green"
                        style={{ borderRadius: '0.75rem' }}
                    >
                        <div className="w-10 h-10 rounded-full bg-[#2bee6c]/10 flex items-center justify-center shrink-0 group-hover:bg-[#2bee6c] group-hover:text-black transition-colors text-[#2bee6c]">
                            <Plus className="w-6 h-6" />
                        </div>
                        <div className="flex-1 text-left">
                            <p className="text-base font-semibold text-slate-900 group-hover:text-[#2bee6c] transition-colors">Create Custom Exercise</p>
                            <p className="text-sm text-slate-500">Can't find it? Add your own.</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
                    </button>

                    {/* Recent Section */}
                    {searchQuery === '' && selectedCategory === 'All' && (
                        <div className="flex flex-col gap-2">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 px-1">Recent</h3>
                            <div className="flex flex-col gap-3">
                                {recentExercises.map((ex) => {
                                    // const isSelected = selectedIds.has(ex.id) || (selectedIds.size === 0 && ex.preselected); // Unused

                                    // Actually, let's use explicit state. Initialize preselection in useEffect? 
                                    const isSelectedExplicit = selectedIds.has(ex.id);

                                    return (
                                        <div
                                            key={ex.id}
                                            onClick={() => toggleSelection(ex.id)}
                                            className={`enhanced-card-mini card-interactive flex items-center gap-4 p-3 transition-colors cursor-pointer group ${isSelectedExplicit
                                                ? 'card-glow-green ring-2 ring-[#2bee6c]/50'
                                                : ''
                                                }`}
                                            style={{ borderRadius: '0.75rem' }}
                                        >
                                            <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center shrink-0 border border-black/5 overflow-hidden">
                                                {isSelectedExplicit ? (
                                                    <ex.icon className="w-6 h-6 text-[#2bee6c]" />
                                                ) : (
                                                    <ex.icon className="w-6 h-6 text-slate-400" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start">
                                                    <p className={`text-base font-semibold truncate ${isSelectedExplicit ? 'text-[#2bee6c]' : 'text-slate-900'}`}>{ex.name}</p>
                                                </div>
                                                <p className={`text-sm truncate ${isSelectedExplicit ? 'text-[#2bee6c]/80' : 'text-slate-500'}`}>{ex.muscle}</p>
                                            </div>
                                            <button
                                                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${isSelectedExplicit
                                                    ? 'border-[#2bee6c] bg-[#2bee6c] text-black'
                                                    : 'border-slate-300 text-transparent group-hover:border-[#2bee6c] group-hover:text-[#2bee6c] group-hover:bg-[#2bee6c]/10'
                                                    }`}
                                            >
                                                {isSelectedExplicit ? <Check className="w-4 h-4 font-bold" /> : <Plus className="w-4 h-4 font-bold" />}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Library Section */}
                    <div className="flex flex-col gap-2">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 px-1">
                            {selectedCategory === 'All' ? 'All Exercises' : selectedCategory} ({filteredExercises.length})
                        </h3>
                        <div className="flex flex-col gap-3">
                            {filteredExercises.map((ex) => {
                                const gradient = getGradient(ex.category);
                                const abbr = ex.name.substring(0, 2).toUpperCase();
                                const isSelected = selectedIds.has(ex.id);
                                return (
                                    <div
                                        key={ex.id}
                                        onClick={() => toggleSelection(ex.id)}
                                        className={`enhanced-card-mini card-interactive card-animate-fade flex items-center gap-4 p-3 transition-colors cursor-pointer group ${isSelected
                                            ? 'card-glow-green ring-2 ring-[#2bee6c]/50'
                                            : ''
                                            }`}
                                        style={{ borderRadius: '0.75rem' }}
                                    >
                                        <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center shrink-0 border border-black/5 overflow-hidden">
                                            <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                                                <span className="text-xs font-bold text-slate-700/70">{abbr}</span>
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start">
                                                <p className={`text-base font-semibold truncate ${isSelected ? 'text-[#2bee6c]' : 'text-slate-900'}`}>{ex.name}</p>
                                            </div>
                                            <p className={`text-sm truncate ${isSelected ? 'text-[#2bee6c]/80' : 'text-slate-500'}`}>{ex.description}</p>
                                        </div>
                                        <button className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${isSelected
                                            ? 'border-[#2bee6c] bg-[#2bee6c] text-black'
                                            : 'border-slate-300 text-transparent group-hover:border-[#2bee6c] group-hover:text-[#2bee6c] group-hover:bg-[#2bee6c]/10'
                                            }`}>
                                            {isSelected ? <Check className="w-4 h-4 font-bold" /> : <Plus className="w-4 h-4 font-bold" />}
                                        </button>
                                    </div>
                                );
                            })}
                            {filteredExercises.length === 0 && (
                                <div className="text-center py-10 text-slate-400">
                                    <p>No exercises found.</p>
                                </div>
                            )}
                        </div>
                    </div>

                </main>

                {/* Bottom Fade */}
                <div className="fixed bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#f6f8f6] dark:from-[#102216] to-transparent pointer-events-none z-10 w-full max-w-md mx-auto"></div>
            </div>
        </div>
    );
};

export default AddExercise;
