import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Trash2 } from 'lucide-react';

interface Set {
    id: string;
    reps: number;
    weight?: number;
}

interface Workout {
    id: string;
    name: string;
    sets: Set[];
}

interface CategoryData {
    id: string;
    title: string;
    subtitle?: string;
    workouts: Workout[];
}

const CustomCategoryView: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [category, setCategory] = useState<CategoryData | null>(null);

    useEffect(() => {
        const loadCategory = () => {
            const stored = localStorage.getItem('customCategories');
            if (stored) {
                const categories: CategoryData[] = JSON.parse(stored);
                // The ID in URL matches the category ID
                const found = categories.find(c => c.id === id);
                if (found) {
                    setCategory(found);
                }
            }
        };
        loadCategory();
    }, [id]);

    const handleDelete = () => {
        if (!category) return;
        if (confirm('Are you sure you want to delete this category?')) {
            const stored = localStorage.getItem('customCategories');
            if (stored) {
                const categories: CategoryData[] = JSON.parse(stored);
                const updated = categories.filter(c => c.id !== category.id);
                localStorage.setItem('customCategories', JSON.stringify(updated));

                // Update selected routines too
                const selected = localStorage.getItem('selectedWorkoutCategories');
                if (selected) {
                    const selIds = JSON.parse(selected);
                    localStorage.setItem('selectedWorkoutCategories', JSON.stringify(selIds.filter((sid: string) => sid !== category.id)));
                }

                window.dispatchEvent(new Event('storage'));
                navigate('/dashboard');
            }
        }
    };

    if (!category) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <p className="text-gray-500">Category not found.</p>
                <button onClick={() => navigate('/dashboard')} className="ml-4 text-indigo-500 font-bold">Go Home</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900 flex justify-center pb-20">
            <div className="w-full max-w-md bg-gray-50 min-h-screen flex flex-col relative">

                {/* Header */}
                <header className="px-6 pt-12 pb-6 flex justify-between items-start bg-white rounded-b-[2.5rem] shadow-sm mb-6 sticky top-0 z-30">
                    <div>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors mb-4 block"
                        >
                            <ArrowLeft className="w-6 h-6 text-gray-800" />
                        </button>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900 leading-tight">
                            {category.title}
                        </h1>
                        <p className="text-gray-500 mt-1">{category.subtitle || `${category.workouts.length} Exercises`}</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleDelete}
                            className="p-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-100 transition-colors"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </div>
                </header>

                <div className="px-6 space-y-4">
                    {category.workouts.map((workout, index) => (
                        <div key={workout.id} className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 relative group animate-in fade-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: `${index * 50}ms` }}>
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-sm">
                                        {index + 1}
                                    </div>
                                    <h3 className="font-bold text-lg text-gray-900">{workout.name}</h3>
                                </div>
                            </div>

                            <div className="space-y-2 pl-12 sm:pl-14">
                                {workout.sets.map((set, sIndex) => (
                                    <div key={set.id} className="flex items-center text-sm text-gray-600 bg-gray-50/50 rounded-lg px-3 py-2 border border-gray-100/50">
                                        <span className="font-bold text-gray-400 w-6">S{sIndex + 1}</span>
                                        <span className="font-bold text-gray-900 mr-2">{set.reps}</span>
                                        <span className="text-gray-400">reps</span>
                                        {set.weight ? (
                                            <>
                                                <span className="mx-2 text-gray-300">|</span>
                                                <span className="font-bold text-gray-900 mr-1">{set.weight}</span>
                                                <span className="text-gray-400">kg</span>
                                            </>
                                        ) : null}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}

                    <button className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 active:scale-95 transition-all flex items-center justify-center gap-2 mt-8">
                        <Play className="w-5 h-5 fill-current" />
                        Start Workout
                    </button>
                </div>

            </div>
        </div>
    );
};

export default CustomCategoryView;
