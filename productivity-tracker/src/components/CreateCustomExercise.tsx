import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Check, Plus, Upload, Dumbbell } from 'lucide-react';
import { saveCustomExercise, type Exercise } from '../utils/workoutStore';

const WORKOUT_CATEGORIES = [
    { name: 'Foam Rolling', image: '/images/foam-rolling.png' },
    { name: 'Active Recovery', image: '/images/recovery-icebath.png' },
    { name: 'Hybrid Training', image: '/images/track-run.png' },
    { name: 'Field Training', image: '/images/forest-run.png' },
    { name: 'Lower Body', image: '/images/lower-body-legs.png' },
    { name: 'Kettlebell Routine', image: '/images/kettlebell.png' },
    { name: 'Core Strength', image: 'https://images.unsplash.com/photo-1544216717-3fbf546a7425?q=80&w=200&auto=format&fit=crop' },
    { name: 'Upper Body Power', image: '/images/upper-body-bench.png' }
];

const CreateCustomExercise: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // State for form fields
    const [targetWorkout, setTargetWorkout] = useState(() => {
        if (location.state?.sourceWorkout) {
            const match = WORKOUT_CATEGORIES.find(c => c.name === location.state.sourceWorkout);
            if (match) return match.name;
        }
        return WORKOUT_CATEGORIES[0].name;
    });

    const [exerciseName, setExerciseName] = useState('');
    const [description, setDescription] = useState('');
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [primaryMuscle, setPrimaryMuscle] = useState('');
    const [secondaryMuscle, setSecondaryMuscle] = useState('');
    const [selectedEquipment, setSelectedEquipment] = useState<string[]>(['Dumbbell']);

    // Equipment options
    const equipmentOptions = ['Dumbbell', 'Barbell', 'Machine', 'Kettlebell', 'Bodyweight', 'Cables'];

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const toggleEquipment = (item: string) => {
        if (selectedEquipment.includes(item)) {
            setSelectedEquipment(selectedEquipment.filter(e => e !== item));
        } else {
            setSelectedEquipment([...selectedEquipment, item]);
        }
    };

    const handleSave = () => {
        if (!exerciseName) {
            alert('Please enter an exercise name');
            return;
        }

        const newExercise: Exercise = {
            id: Date.now().toString(),
            name: exerciseName,
            muscle: `${primaryMuscle}${secondaryMuscle ? ' • ' + secondaryMuscle : ''}` || 'Custom',
            image: imagePreview || 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=200&auto=format&fit=crop',
            description: description,
            sets: [
                { id: 1, weight: 0, reps: 12, completed: false },
                { id: 2, weight: 0, reps: 12, completed: false }
            ]
        };

        try {
            saveCustomExercise(targetWorkout, newExercise);
            // Navigate back to the specific workout page
            const pathMap: Record<string, string> = {
                'Foam Rolling': '/workout/foam-rolling',
                'Active Recovery': '/workout/recovery',
                'Hybrid Training': '/workout/hybrid',
                'Field Training': '/workout/field',
                'Lower Body': '/workout/lower-body',
                'Kettlebell Routine': '/workout/kettlebell',
                'Core Strength': '/workout/core-strength', // Assuming route exists or catch-all
                'Upper Body Power': '/workout/upper-body'
            };

            navigate(pathMap[targetWorkout] || '/dashboard');
        } catch (error) {
            console.error('Failed to save exercise:', error);
            alert('Failed to save exercise (image might be too large). Try a smaller image.');
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans flex justify-center">
            <div className="relative flex h-full min-h-screen w-full flex-col overflow-x-hidden max-w-md mx-auto shadow-2xl bg-[#f8fafc] border-x border-slate-200">
                {/* Header */}
                <header className="sticky top-0 z-50 flex items-center justify-between bg-[#f8fafc]/95 backdrop-blur-md p-4 border-b border-slate-200">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center justify-center p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors group"
                    >
                        <span className="text-slate-500 text-base font-medium group-hover:text-slate-900">Cancel</span>
                    </button>
                    <h1 className="text-lg font-bold leading-tight tracking-tight text-slate-900">Create Exercise</h1>
                    <button
                        onClick={handleSave}
                        className="flex items-center justify-center p-2 -mr-2 rounded-full hover:bg-emerald-50 transition-colors"
                    >
                        <span className="text-[#059669] text-base font-bold">Save</span>
                    </button>
                </header>

                <main className="flex-1 flex flex-col p-4 gap-6 pb-10">

                    {/* Target Workout Carousel */}
                    <section className="flex flex-col gap-3">
                        <label className="text-sm font-bold text-slate-700 pl-1">Add to Workout</label>
                        <div className="flex overflow-x-auto gap-3 pb-2 -mx-4 px-4 scrollbar-hide snap-x">
                            {WORKOUT_CATEGORIES.map((cat) => (
                                <button
                                    key={cat.name}
                                    onClick={() => setTargetWorkout(cat.name)}
                                    className={`snap-center shrink-0 flex flex-col items-center gap-2 w-24 p-2 rounded-xl border transition-all ${targetWorkout === cat.name
                                        ? 'border-[#059669] bg-emerald-50 shadow-md ring-1 ring-[#059669]'
                                        : 'border-slate-200 bg-white opacity-70 hover:opacity-100'
                                        }`}
                                >
                                    <img src={cat.image} alt={cat.name} className="w-16 h-16 rounded-lg object-cover shadow-sm bg-gray-100" />
                                    <span className={`text-[10px] font-bold text-center leading-tight ${targetWorkout === cat.name ? 'text-[#059669]' : 'text-slate-600'}`}>
                                        {cat.name}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Upload Section */}
                    <section className="flex flex-col gap-2">
                        <div className="relative group cursor-pointer overflow-hidden rounded-xl">
                            {imagePreview ? (
                                <div className="relative w-full h-64 bg-black">
                                    <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
                                    <button
                                        onClick={(e) => { e.preventDefault(); setImagePreview(null); }}
                                        className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-black/80"
                                    >
                                        <ArrowLeft className="w-5 h-5 rotate-45" /> {/* Use generic icon or just reset */}
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center gap-4 border-2 border-dashed border-slate-300 bg-white px-6 py-10 transition-all hover:border-[#2bee6c] hover:bg-emerald-50/30 rounded-xl">
                                    <div className="flex size-14 items-center justify-center rounded-full bg-slate-100 text-slate-400 group-hover:scale-110 group-hover:text-[#059669] transition-all">
                                        <Upload className="w-8 h-8" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm font-bold text-slate-900">Add Photo or Video</p>
                                        <p className="text-xs text-slate-500 mt-1">Upload visual instructions (Max 5MB)</p>
                                    </div>
                                </div>
                            )}
                            <input
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                            />
                        </div>
                    </section>

                    {/* Basic Info */}
                    <section className="flex flex-col gap-5">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold text-slate-700 pl-1">Exercise Name</label>
                            <input
                                value={exerciseName}
                                onChange={(e) => setExerciseName(e.target.value)}
                                className="w-full rounded-xl bg-white border border-slate-200 focus:border-[#2bee6c] focus:ring-1 focus:ring-[#2bee6c]/50 text-slate-900 placeholder-slate-400 h-12 px-4 text-base transition-colors shadow-sm outline-none"
                                placeholder="e.g., Bulgarian Split Squat"
                                type="text"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold text-slate-700 pl-1">Description <span className="text-xs font-normal text-slate-400">(Optional)</span></label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full rounded-xl bg-white border border-slate-200 focus:border-[#2bee6c] focus:ring-1 focus:ring-[#2bee6c]/50 text-slate-900 placeholder-slate-400 min-h-[100px] p-4 text-base resize-none transition-colors shadow-sm outline-none"
                                placeholder="Add notes on proper form, tempo, or breathing cues..."
                            />
                        </div>
                    </section>

                    {/* Muscle Groups */}
                    <section className="flex flex-col gap-5 pt-2">
                        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                            <span className="text-[#059669] text-xl">💪</span>
                            Muscle Groups
                        </h3>
                        <div className="grid grid-cols-1 gap-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-slate-700 pl-1">Primary Target</label>
                                <div className="relative">
                                    <select
                                        value={primaryMuscle}
                                        onChange={(e) => setPrimaryMuscle(e.target.value)}
                                        className="w-full appearance-none rounded-xl bg-white border border-slate-200 focus:border-[#2bee6c] focus:ring-1 focus:ring-[#2bee6c]/50 text-slate-900 h-12 px-4 pr-10 text-base shadow-sm cursor-pointer outline-none"
                                    >
                                        <option value="" disabled>Select muscle group</option>
                                        <option value="Chest">Chest</option>
                                        <option value="Back">Back</option>
                                        <option value="Legs">Legs</option>
                                        <option value="Shoulders">Shoulders</option>
                                        <option value="Arms">Arms</option>
                                        <option value="Core">Core</option>
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down w-5 h-5"><path d="m6 9 6 6 6-6" /></svg>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-slate-700 pl-1">Secondary <span className="text-xs font-normal text-slate-400">(Optional)</span></label>
                                <div className="relative">
                                    <select
                                        value={secondaryMuscle}
                                        onChange={(e) => setSecondaryMuscle(e.target.value)}
                                        className="w-full appearance-none rounded-xl bg-white border border-slate-200 focus:border-[#2bee6c] focus:ring-1 focus:ring-[#2bee6c]/50 text-slate-900 h-12 px-4 pr-10 text-base shadow-sm cursor-pointer outline-none"
                                    >
                                        <option value="" disabled>Select secondary muscle</option>
                                        <option value="Triceps">Triceps</option>
                                        <option value="Biceps">Biceps</option>
                                        <option value="Calves">Calves</option>
                                        <option value="Glutes">Glutes</option>
                                        <option value="Forearms">Forearms</option>
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down w-5 h-5"><path d="m6 9 6 6 6-6" /></svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Equipment */}
                    <section className="flex flex-col gap-3 pt-2">
                        <div className="flex justify-between items-end">
                            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                                <Dumbbell className="w-5 h-5 text-[#059669]" />
                                Equipment
                            </h3>
                            <span className="text-xs text-slate-500">Select all that apply</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {equipmentOptions.map((item) => {
                                const isSelected = selectedEquipment.includes(item);
                                return (
                                    <button
                                        key={item}
                                        onClick={() => toggleEquipment(item)}
                                        className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold transition-all shadow-sm ${isSelected
                                            ? 'border-[#2bee6c] bg-[#2bee6c] text-slate-900'
                                            : 'border-slate-200 bg-white text-slate-600 hover:border-[#2bee6c] hover:text-slate-900'
                                            }`}
                                    >
                                        <span>{item}</span>
                                        {isSelected && <Check className="w-4 h-4 font-bold" />}
                                    </button>
                                );
                            })}
                            <button className="flex items-center gap-2 rounded-full border border-dashed border-slate-300 bg-transparent px-3 py-2 text-sm font-medium text-slate-400 hover:text-[#059669] hover:border-[#2bee6c] transition-all">
                                <Plus className="w-4 h-4" />
                                <span>Other</span>
                            </button>
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
};

export default CreateCustomExercise;
