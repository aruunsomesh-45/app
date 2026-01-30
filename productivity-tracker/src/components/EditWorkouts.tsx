import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Clock, Dumbbell, Plus, MoreHorizontal, Check, Trash2, Camera,
    TrendingUp, TrendingDown, Minus, AlertTriangle, Activity, Zap, Battery,
    BatteryLow, BatteryMedium, X, Heart, Flame, Target
} from 'lucide-react';
import {
    getCustomExercises,
    saveCategoryOverride,
    getCategoryOverride,
    saveSessionSummary,
    getLastSessionSummary,
    generateRecommendation,
    saveInjuryNote,
    getActiveInjuryNotes,
    deleteInjuryNote,
    BODY_PARTS,
    type FatigueStatus,
    type EffortLevel,
    type SessionSummary,
    type InjuryNote,
    type NextSessionRecommendation
} from '../utils/workoutStore';

// --- Data Definitions ---

const CoreStrengthContent = {
    id: 'core',
    name: 'Core Strength',
    description: 'Focus on abdominal and lower back stability.',
    duration: '30 min',
    exerciseCount: 4,
    tags: ['Core', 'Stability', 'Abs'],
    exercises: [
        {
            id: 'c1',
            name: 'Plank',
            muscle: 'Core • Abs',
            sets: [{ id: 1, weight: 0, reps: 60, completed: false }]
        },
        {
            id: 'c2',
            name: 'Russian Twists',
            muscle: 'Obliques • Core',
            sets: [{ id: 1, weight: 10, reps: 20, completed: false }]
        },
        {
            id: 'c3',
            name: 'Leg Raises',
            muscle: 'Lower Abs',
            sets: [{ id: 1, weight: 0, reps: 15, completed: false }]
        },
        {
            id: 'c4',
            name: 'Superman',
            muscle: 'Lower Back',
            sets: [{ id: 1, weight: 0, reps: 12, completed: false }]
        }
    ]
};

const KettlebellContent = {
    id: 'kettlebell',
    name: 'Kettlebell Crush',
    description: 'High intensity interval training with kettlebells.',
    duration: '40 min',
    exerciseCount: 5,
    tags: ['HIIT', 'Strength', 'Cardio'],
    exercises: [
        {
            id: 'k1',
            name: 'Kettlebell Swings',
            muscle: 'Hips • Glutes',
            sets: [{ id: 1, weight: 35, reps: 20, completed: false }]
        },
        {
            id: 'k2',
            name: 'Goblet Squats',
            muscle: 'Legs • Core',
            sets: [{ id: 1, weight: 35, reps: 15, completed: false }]
        }
    ]
};

const CalisthenicsContent = {
    id: 'calisthenics',
    name: 'Calisthenics Flow',
    description: 'Bodyweight mastery and control.',
    duration: '60 min',
    exerciseCount: 6,
    tags: ['Bodyweight', 'Skill', 'Control'],
    exercises: [
        {
            id: 'cal1',
            name: 'Muscle Ups',
            muscle: 'Full Body',
            sets: [{ id: 1, weight: 0, reps: 5, completed: false }]
        },
        {
            id: 'cal2',
            name: 'Front Lever',
            muscle: 'Core • Back',
            sets: [{ id: 1, weight: 0, reps: 10, completed: false }]
        }
    ]
};

const UpperBodyContent = {
    id: 'upper-body',
    name: 'Upper Body Power',
    description: 'Push & Pull focus with heavy compound movements.',
    duration: '45 min',
    exerciseCount: 5,
    tags: ['Strength', 'Upper', 'Power'],
    exercises: [
        {
            id: 'ub1',
            name: 'Bench Press',
            muscle: 'Chest • Pushing',
            sets: [
                { id: 1, weight: 135, reps: 6, completed: false },
                { id: 2, weight: 135, reps: 6, completed: false },
                { id: 3, weight: 135, reps: 6, completed: false }
            ]
        },
        {
            id: 'ub2',
            name: 'Pull Ups',
            muscle: 'Back • Pulling',
            sets: [
                { id: 1, weight: 0, reps: 8, completed: false },
                { id: 2, weight: 0, reps: 8, completed: false }
            ]
        },
        {
            id: 'ub3',
            name: 'Overhead Press',
            muscle: 'Shoulders • Pushing',
            sets: [
                { id: 1, weight: 65, reps: 10, completed: false }
            ]
        }
    ]
};

const AestheticContent = {
    id: 'aesthetic',
    name: 'Aesthetic Body',
    description: 'High-volume session focusing on the V-taper and upper chest density.',
    duration: '75 min',
    exerciseCount: 8,
    tags: ['Symmetry', 'Definition', 'Hypertrophy'],
    exercises: [
        {
            id: 'aes1',
            name: 'Lateral Raises',
            muscle: 'Side Delts • Dumbbells',
            sets: [
                { id: 1, weight: 12, reps: 12, completed: false },
                { id: 2, weight: 12, reps: 12, completed: false }
            ]
        },
        {
            id: 'aes2',
            name: 'Incline Flyes',
            muscle: 'Upper Chest • Dumbbells',
            sets: [
                { id: 1, weight: 18, reps: 12, completed: false }
            ]
        }
    ]
};

const HybridTrainingContent = {
    id: 'hybrid',
    name: 'Hybrid Training',
    description: 'Combination of strength and endurance training.',
    duration: '50 min',
    exerciseCount: 0,
    tags: ['Hybrid', 'Endurance', 'Strength'],
    exercises: []
};

const KickboxingContent = {
    id: 'kickboxing',
    name: 'Kickboxing',
    description: 'High-intensity striking and conditioning.',
    duration: '45 min',
    exerciseCount: 1,
    tags: ['Martial Arts', 'HIIT', 'Fat Burn'],
    exercises: [
        {
            id: 'kb1',
            name: 'Shadow Boxing',
            muscle: 'Full Body • Cardio',
            sets: [{ id: 1, weight: 0, reps: 180, completed: false }]
        }
    ]
};

const MobilityFlowContent = {
    id: 'mobility',
    name: 'Mobility Flow',
    description: 'Improve range of motion and joint health.',
    duration: '20 min',
    exerciseCount: 1,
    tags: ['Flexibility', 'Recovery', 'Yoga'],
    exercises: [
        { id: 'mf1', name: 'Cat-Cow', muscle: 'Spine • Core', sets: [{ id: 1, weight: 0, reps: 10, completed: false }] }
    ]
};

const EnduranceContent = {
    id: 'endurance',
    name: 'Endurance Run',
    description: 'Steady-state cardio for lung capacity.',
    duration: '60 min',
    exerciseCount: 1,
    tags: ['Cardio', 'Lungs', 'Steady-State'],
    exercises: [
        { id: 'er1', name: 'Zone 2 Jog', muscle: 'Legs • Heart', sets: [{ id: 1, weight: 0, reps: 60, completed: false }] }
    ]
};

const PowerliftingContent = {
    id: 'powerlifting',
    name: 'Powerlifting',
    description: 'Focus on Big 3: Squat, Bench, Deadlift.',
    duration: '90 min',
    exerciseCount: 3,
    tags: ['Strength', 'Compound', 'Heavy'],
    exercises: [
        { id: 'pl1', name: 'Back Squat', muscle: 'Full Body • Legs', sets: [{ id: 1, weight: 225, reps: 5, completed: false }] }
    ]
};

const PlyometricsContent = {
    id: 'plyometrics',
    name: 'Plyometrics',
    description: 'Explosive power and vertical jump training.',
    duration: '35 min',
    exerciseCount: 2,
    tags: ['Power', 'Speed', 'Explosive'],
    exercises: [
        { id: 'plyo1', name: 'Box Jumps', muscle: 'Legs • Explosive', sets: [{ id: 1, weight: 0, reps: 8, completed: false }] }
    ]
};

const PlaceholderContent = (name: string) => ({
    name: name,
    description: 'Workout description placeholder.',
    duration: '0 min',
    exerciseCount: 0,
    tags: ['Workout'],
    exercises: []
});

const getInitials = (name: string) => {
    return name ? name.slice(0, 2).toUpperCase() : '??';
};

const getGradient = (name: string) => {
    const gradients = [
        'bg-blue-100 text-blue-700',
        'bg-green-100 text-green-700',
        'bg-purple-100 text-purple-700',
        'bg-orange-100 text-orange-700',
        'bg-pink-100 text-pink-700',
        'bg-teal-100 text-teal-700',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return gradients[Math.abs(hash) % gradients.length];
};

interface WorkoutSet {
    id: number;
    weight: number;
    reps: number;
    completed: boolean;
}

interface WorkoutExercise {
    id: string;
    name: string;
    muscle: string;
    sets: WorkoutSet[];
}

interface WorkoutData {
    id?: string;
    name: string;
    description: string;
    duration: string;
    exerciseCount: number;
    tags: string[];
    exercises: WorkoutExercise[];
    image?: string;
}

// --- Main Layout Component ---

export const EditWorkoutLayout: React.FC<{
    initialData: WorkoutData,
    title: string
}> = ({ initialData, title }) => {
    const navigate = useNavigate();
    const workoutId = initialData.id || title.toLowerCase().replace(/\s+/g, '-');

    // Core workout state
    const [exercises, setExercises] = useState<WorkoutExercise[]>(() => [...initialData.exercises, ...getCustomExercises(initialData.name)]);
    const [workoutTitle, setWorkoutTitle] = useState(initialData.name);
    const [workoutDesc, setWorkoutDesc] = useState(initialData.description);
    const [activeMenu, setActiveMenu] = useState<string | null>(null);
    const [coverImage, setCoverImage] = useState<string | null>(() => {
        const override = getCategoryOverride(initialData.id || title);
        return override?.img || initialData.image || null;
    });

    // Session tracking state
    const [sessionStartTime] = useState<Date>(new Date());
    const [effortLevel, setEffortLevel] = useState<EffortLevel>(3);
    const [fatigueStatus, setFatigueStatus] = useState<FatigueStatus>('moderate');
    const [showSessionSummary, setShowSessionSummary] = useState(false);
    const [showInjuryModal, setShowInjuryModal] = useState(false);
    const [showRecommendation, setShowRecommendation] = useState(true);
    const [sessionNotes, setSessionNotes] = useState('');

    // Injury state
    const [activeInjuries, setActiveInjuries] = useState<InjuryNote[]>([]);
    const [newInjuryBodyPart, setNewInjuryBodyPart] = useState(BODY_PARTS[0]);
    const [newInjuryPainLevel, setNewInjuryPainLevel] = useState<1 | 2 | 3 | 4 | 5>(2);
    const [newInjuryDescription, setNewInjuryDescription] = useState('');

    // Last session data
    const [lastSession, setLastSession] = useState<SessionSummary | null>(null);
    const [recommendation, setRecommendation] = useState<NextSessionRecommendation | null>(null);

    // Load previous session data
    useEffect(() => {
        const last = getLastSessionSummary(workoutId);
        setLastSession(last);
        const rec = generateRecommendation(workoutId);
        setRecommendation(rec);
        const injuries = getActiveInjuryNotes(workoutId);
        setActiveInjuries(injuries);
    }, [workoutId]);

    // Calculate total volume in real-time
    const totalVolume = useMemo(() => {
        return exercises.reduce((total, exercise) => {
            const exerciseVolume = exercise.sets.reduce((setTotal, set) => {
                if (set.completed) {
                    return setTotal + (set.weight * set.reps);
                }
                return setTotal;
            }, 0);
            return total + exerciseVolume;
        }, 0);
    }, [exercises]);

    // Calculate completed sets/exercises
    const completedSets = useMemo(() => {
        return exercises.reduce((total, ex) => total + ex.sets.filter(s => s.completed).length, 0);
    }, [exercises]);

    const completedExercises = useMemo(() => {
        return exercises.filter(ex => ex.sets.length > 0 && ex.sets.every(s => s.completed)).length;
    }, [exercises]);

    // Handle image upload
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result as string;
                setCoverImage(base64);
                saveCategoryOverride(initialData.id || title, { img: base64 });
                window.dispatchEvent(new Event('routinesUpdated'));
            };
            reader.readAsDataURL(file);
        }
    };

    const removeExercise = (exerciseId: string) => {
        setExercises(exercises.filter((ex: WorkoutExercise) => ex.id !== exerciseId));
        setActiveMenu(null);
    };

    const toggleSet = (exerciseId: string, setId: number) => {
        setExercises(exercises.map((ex: WorkoutExercise) => {
            if (ex.id !== exerciseId) return ex;
            return {
                ...ex,
                sets: ex.sets.map((s: WorkoutSet) => s.id === setId ? { ...s, completed: !s.completed } : s)
            };
        }));
    };

    const addSet = (exerciseId: string) => {
        setExercises(exercises.map((ex: WorkoutExercise) => {
            if (ex.id !== exerciseId) return ex;
            const lastSet = ex.sets.length > 0 ? ex.sets[ex.sets.length - 1] : { id: 0, weight: 0, reps: 0, completed: false };
            const newSet = {
                id: (ex.sets.length > 0 ? Math.max(...ex.sets.map((s: WorkoutSet) => s.id)) : 0) + 1,
                weight: lastSet.weight || 0,
                reps: lastSet.reps || 0,
                completed: false
            };
            return { ...ex, sets: [...ex.sets, newSet] };
        }));
    };

    const removeSet = (exerciseId: string, setId: number) => {
        setExercises(exercises.map((ex: WorkoutExercise) => {
            if (ex.id !== exerciseId) return ex;
            return { ...ex, sets: ex.sets.filter((s: WorkoutSet) => s.id !== setId) };
        }));
    };

    // Save session and end workout
    const handleEndSession = () => {
        const duration = Math.round((new Date().getTime() - sessionStartTime.getTime()) / 60000);
        const summary: SessionSummary = {
            workoutId,
            date: new Date().toISOString(),
            totalVolume,
            effortLevel,
            fatigueStatus,
            duration,
            exercisesCompleted: completedExercises,
            notes: sessionNotes || undefined
        };
        saveSessionSummary(summary);
        setShowSessionSummary(false);
        navigate(-1);
    };

    // Add injury note
    const handleAddInjury = () => {
        if (!newInjuryBodyPart) return;
        const injury: InjuryNote = {
            id: `injury_${Date.now()}`,
            workoutId,
            bodyPart: newInjuryBodyPart,
            painLevel: newInjuryPainLevel,
            description: newInjuryDescription,
            date: new Date().toISOString(),
            isActive: true
        };
        saveInjuryNote(injury);
        setActiveInjuries([...activeInjuries, injury]);
        setNewInjuryDescription('');
        setNewInjuryPainLevel(2);
        setShowInjuryModal(false);
    };

    // Remove injury
    const handleRemoveInjury = (injuryId: string) => {
        deleteInjuryNote(injuryId);
        setActiveInjuries(activeInjuries.filter(i => i.id !== injuryId));
    };

    // Get fatigue icon and color
    const getFatigueDisplay = (status: FatigueStatus) => {
        switch (status) {
            case 'low':
                return { icon: Battery, color: 'text-emerald-500', bg: 'bg-emerald-50', label: 'Low' };
            case 'moderate':
                return { icon: BatteryMedium, color: 'text-amber-500', bg: 'bg-amber-50', label: 'Moderate' };
            case 'high':
                return { icon: BatteryLow, color: 'text-red-500', bg: 'bg-red-50', label: 'High' };
        }
    };

    // Get recommendation styling
    const getRecommendationStyle = (rec: NextSessionRecommendation | null) => {
        if (!rec) return { icon: Minus, color: 'text-gray-500', bg: 'bg-gray-50' };
        switch (rec.recommendation) {
            case 'increase':
                return { icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' };
            case 'decrease':
                return { icon: TrendingDown, color: 'text-red-500', bg: 'bg-red-50' };
            default:
                return { icon: Minus, color: 'text-amber-500', bg: 'bg-amber-50' };
        }
    };

    return (
        <div className="min-h-screen bg-[#F8F9FA] text-[#1a1a1a] font-sans relative pb-28">
            <header className="sticky top-0 z-40 bg-[#F8F9FA]/80 backdrop-blur-xl border-b border-gray-100">
                <div className="flex items-center justify-between px-4 py-3 h-14">
                    <button onClick={() => navigate(-1)} className="flex items-center justify-center size-10 -ml-2 rounded-full active:scale-95 transition-all hover:bg-black/5">
                        <ArrowLeft className="w-5 h-5 text-[#1a1a1a]" />
                    </button>
                    <h2 className="text-lg font-bold tracking-tight">{title}</h2>
                    <button className="flex items-center justify-end px-2 font-bold text-base text-[#1a1a1a] hover:opacity-70 transition-opacity">
                        Save
                    </button>
                </div>
                <div className="px-4 pb-3 flex gap-2 overflow-x-auto no-scrollbar">
                    {initialData.tags && initialData.tags.map((tag: string, i: number) => (
                        <div key={i} className={`flex items-center justify-center px-4 py-1.5 rounded-full shadow-sm border border-gray-200 ${i === 0 ? 'bg-black text-white' : 'bg-white text-gray-500'}`}>
                            <span className="text-[10px] font-black uppercase tracking-widest">{tag}</span>
                        </div>
                    ))}
                    {!initialData.tags && (
                        <div className="flex items-center justify-center px-4 py-1.5 rounded-full bg-black text-white shadow-sm">
                            <span className="text-[10px] font-black uppercase tracking-widest">WORKOUT</span>
                        </div>
                    )}
                </div>
            </header>

            {/* Custom Background Image Header */}
            <div className="relative h-48 w-full overflow-hidden bg-gray-200">
                {coverImage ? (
                    <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                        <Dumbbell className="w-12 h-12 text-gray-300" />
                    </div>
                )}
                <div className="absolute inset-0 bg-black/20" />
                <label className="absolute bottom-4 right-4 flex items-center gap-2 px-3 py-2 bg-white/90 backdrop-blur-md rounded-xl shadow-lg cursor-pointer hover:bg-white transition-colors active:scale-95">
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                    <Camera className="w-4 h-4 text-gray-700" />
                    <span className="text-xs font-bold text-gray-700">Change Cover</span>
                </label>
            </div>

            <main className="flex flex-col gap-6 px-4 pt-6">
                <section className="flex flex-col gap-5 bg-white p-6 rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-50">
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.1em]">Routine Title</label>
                        <input
                            className="w-full bg-transparent border-0 border-b border-gray-100 focus:border-[#b4f835] focus:ring-0 px-0 py-1 text-2xl font-black text-[#1a1a1a] placeholder-gray-300 transition-colors"
                            type="text"
                            value={workoutTitle}
                            onChange={(e) => setWorkoutTitle(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.1em]">Focus Description</label>
                        <textarea
                            className="w-full bg-gray-50 rounded-xl border-0 focus:ring-1 focus:ring-[#b4f835]/50 px-4 py-3 text-sm text-[#1a1a1a] resize-none placeholder-gray-400 leading-relaxed"
                            rows={2}
                            value={workoutDesc}
                            onChange={(e) => setWorkoutDesc(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center justify-around py-2 border-t border-gray-50">
                        <div className="flex flex-col items-center gap-1">
                            <span className="text-xl font-black text-[#1a1a1a]">{initialData.duration || '0 min'}</span>
                            <span className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1">
                                <Clock className="w-3 h-3" /> Duration
                            </span>
                        </div>
                        <div className="w-px h-8 bg-gray-100"></div>
                        <div className="flex flex-col items-center gap-1">
                            <span className="text-xl font-black text-[#1a1a1a]">{exercises.length}</span>
                            <span className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1">
                                <Dumbbell className="w-3 h-3" /> Exercises
                            </span>
                        </div>
                        <div className="w-px h-8 bg-gray-100"></div>
                        <div className="flex flex-col items-center gap-1">
                            <span className="text-xl font-black text-[#b4f835]">{totalVolume.toLocaleString()}</span>
                            <span className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1">
                                <Activity className="w-3 h-3" /> Volume
                            </span>
                        </div>
                    </div>
                </section>

                {/* Next Session Recommendation Banner */}
                {recommendation && showRecommendation && (
                    <section className={`flex flex-col gap-3 p-4 rounded-2xl border ${getRecommendationStyle(recommendation).bg} border-opacity-50 shadow-sm relative overflow-hidden`}>
                        <button
                            onClick={() => setShowRecommendation(false)}
                            className="absolute top-2 right-2 p-1 rounded-full hover:bg-black/10 transition-colors"
                        >
                            <X className="w-4 h-4 text-gray-500" />
                        </button>
                        <div className="flex items-center gap-3">
                            {(() => {
                                const RecIcon = getRecommendationStyle(recommendation).icon;
                                return <RecIcon className={`w-6 h-6 ${getRecommendationStyle(recommendation).color}`} />;
                            })()}
                            <div>
                                <h3 className="text-sm font-black uppercase tracking-wide text-[#1a1a1a]">
                                    Next Session: {recommendation.recommendation === 'increase' ? 'Increase Weight' :
                                        recommendation.recommendation === 'decrease' ? 'Decrease Weight' : 'Maintain Weight'}
                                    {recommendation.percentageChange !== 0 && ` (${recommendation.percentageChange > 0 ? '+' : ''}${recommendation.percentageChange}%)`}
                                </h3>
                                <p className="text-xs text-gray-600 mt-0.5">{recommendation.reason}</p>
                            </div>
                        </div>
                        {recommendation.deloadRecommended && (
                            <div className="flex items-center gap-2 px-3 py-2 bg-red-100 rounded-xl border border-red-200">
                                <AlertTriangle className="w-4 h-4 text-red-600" />
                                <span className="text-xs font-bold text-red-700">Recovery Check: Deload Week Recommended</span>
                            </div>
                        )}
                        {lastSession && (
                            <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                                <span>Last session: {new Date(lastSession.date).toLocaleDateString()}</span>
                                <span>Volume: {lastSession.totalVolume.toLocaleString()} lbs</span>
                            </div>
                        )}
                    </section>
                )}

                {/* Active Injury Notes Warning */}
                {activeInjuries.length > 0 && (
                    <section className="flex flex-col gap-3 p-4 rounded-2xl bg-orange-50 border border-orange-100 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Heart className="w-5 h-5 text-orange-500" />
                                <h3 className="text-sm font-black uppercase tracking-wide text-orange-700">Active Injuries</h3>
                            </div>
                            <span className="text-xs font-bold text-orange-600 bg-orange-100 px-2 py-1 rounded-full">{activeInjuries.length} noted</span>
                        </div>
                        <div className="flex flex-col gap-2">
                            {activeInjuries.map((injury) => (
                                <div key={injury.id} className="flex items-center justify-between bg-white rounded-xl p-3 border border-orange-100">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${injury.painLevel >= 4 ? 'bg-red-100 text-red-600' :
                                            injury.painLevel >= 3 ? 'bg-orange-100 text-orange-600' :
                                                'bg-yellow-100 text-yellow-600'
                                            }`}>
                                            <AlertTriangle className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-[#1a1a1a]">{injury.bodyPart}</p>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-medium text-gray-500">Pain Level: {injury.painLevel}/5</span>
                                                {injury.painLevel >= 4 && (
                                                    <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">Limit Progression</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleRemoveInjury(injury.id)}
                                        className="p-2 rounded-lg hover:bg-red-50 transition-colors text-gray-400 hover:text-red-500"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Training Session Summary (Live) */}
                <section className="flex flex-col gap-4 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-sm font-black uppercase tracking-widest text-[#1a1a1a] flex items-center gap-2">
                        <Flame className="w-4 h-4 text-orange-500" />
                        Training Session Summary
                    </h3>
                    <span className="text-xs font-medium text-gray-500">{completedSets} sets completed</span>

                    {/* Total Volume Display */}
                    <div className="flex items-center justify-center py-4 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="text-center">
                            <p className="text-3xl font-black text-black">{totalVolume.toLocaleString()} <span className="text-lg text-gray-500">lbs</span></p>
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mt-1">Total Volume (Sets × Reps × Weight)</p>
                        </div>
                    </div>

                    {/* Effort Level */}
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1">
                                <Zap className="w-3 h-3 text-amber-500" /> Effort Level
                            </label>
                            <span className="text-sm font-black text-[#1a1a1a]">{effortLevel}/5</span>
                        </div>
                        <div className="flex gap-2">
                            {([1, 2, 3, 4, 5] as EffortLevel[]).map((level) => (
                                <button
                                    key={level}
                                    onClick={() => setEffortLevel(level)}
                                    className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${effortLevel >= level
                                        ? 'bg-black text-white'
                                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                        }`}
                                >
                                    {level}
                                </button>
                            ))}
                        </div>
                        <div className="flex justify-between text-[9px] text-gray-500 px-1">
                            <span>Easy</span>
                            <span>Moderate</span>
                            <span>Maximum</span>
                        </div>
                    </div>

                    {/* Fatigue Status */}
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1">
                            <Target className="w-3 h-3 text-blue-500" /> Fatigue Status
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {(['low', 'moderate', 'high'] as FatigueStatus[]).map((status) => {
                                const display = getFatigueDisplay(status);
                                const FatigueIcon = display.icon;
                                return (
                                    <button
                                        key={status}
                                        onClick={() => setFatigueStatus(status)}
                                        className={`flex flex-col items-center gap-1 py-3 rounded-xl transition-all ${fatigueStatus === status
                                            ? `${display.bg} border-2 border-current ${display.color}`
                                            : 'bg-gray-100 text-gray-400 border-2 border-transparent hover:bg-gray-200'
                                            }`}
                                    >
                                        <FatigueIcon className="w-5 h-5" />
                                        <span className="text-[10px] font-bold uppercase">{display.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Session Notes */}
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Session Notes</label>
                        <textarea
                            value={sessionNotes}
                            onChange={(e) => setSessionNotes(e.target.value)}
                            placeholder="How did the session feel? Any observations..."
                            className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm text-[#1a1a1a] placeholder-gray-400 focus:ring-2 focus:ring-black/5 resize-none transition-all"
                            rows={2}
                        />
                    </div>
                </section>

                {/* Add Injury Note Button */}
                <button
                    onClick={() => setShowInjuryModal(true)}
                    className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-orange-50 border border-orange-100 text-orange-600 font-bold text-sm hover:bg-orange-100 transition-colors"
                >
                    <AlertTriangle className="w-4 h-4" />
                    Log Injury / Pain
                </button>

                {/* Injury Modal */}
                {showInjuryModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-300">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-black text-[#1a1a1a]">Log Injury / Pain</h3>
                                <button
                                    onClick={() => setShowInjuryModal(false)}
                                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            <div className="flex flex-col gap-4">
                                <div>
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">Body Part</label>
                                    <select
                                        value={newInjuryBodyPart}
                                        onChange={(e) => setNewInjuryBodyPart(e.target.value)}
                                        className="w-full bg-gray-50 border-0 rounded-xl py-3 px-4 text-sm text-[#1a1a1a] focus:ring-2 focus:ring-[#b4f835]"
                                    >
                                        {BODY_PARTS.map((part) => (
                                            <option key={part} value={part}>{part}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">Pain Level</label>
                                    <div className="flex gap-2">
                                        {([1, 2, 3, 4, 5] as const).map((level) => (
                                            <button
                                                key={level}
                                                onClick={() => setNewInjuryPainLevel(level)}
                                                className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${newInjuryPainLevel === level
                                                    ? level >= 4 ? 'bg-red-500 text-white' : level >= 3 ? 'bg-orange-500 text-white' : 'bg-yellow-400 text-black'
                                                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                                    }`}
                                            >
                                                {level}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="flex justify-between text-[9px] text-gray-500 px-1 mt-1">
                                        <span>Mild</span>
                                        <span>Moderate</span>
                                        <span>Severe</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">Description (optional)</label>
                                    <textarea
                                        value={newInjuryDescription}
                                        onChange={(e) => setNewInjuryDescription(e.target.value)}
                                        placeholder="Describe the pain or injury..."
                                        className="w-full bg-gray-50 border-0 rounded-xl p-3 text-sm text-[#1a1a1a] placeholder-gray-400 focus:ring-2 focus:ring-[#b4f835] resize-none"
                                        rows={3}
                                    />
                                </div>

                                <button
                                    onClick={handleAddInjury}
                                    className="w-full py-4 rounded-xl bg-orange-500 text-white font-bold text-sm hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Injury Note
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Session Summary Modal */}
                {showSessionSummary && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-300">
                            <h3 className="text-xl font-black text-[#1a1a1a] mb-6 text-center">End Session?</h3>

                            <div className="bg-gray-50 rounded-2xl p-4 mb-6">
                                <div className="grid grid-cols-2 gap-4 text-center">
                                    <div>
                                        <p className="text-2xl font-black text-[#b4f835]">{totalVolume.toLocaleString()}</p>
                                        <p className="text-[10px] font-bold text-gray-500 uppercase">Total Volume</p>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-black text-[#1a1a1a]">{completedExercises}/{exercises.length}</p>
                                        <p className="text-[10px] font-bold text-gray-500 uppercase">Exercises Done</p>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-black text-[#1a1a1a]">{effortLevel}/5</p>
                                        <p className="text-[10px] font-bold text-gray-500 uppercase">Effort Level</p>
                                    </div>
                                    <div>
                                        <p className={`text-2xl font-black ${getFatigueDisplay(fatigueStatus).color}`}>
                                            {getFatigueDisplay(fatigueStatus).label}
                                        </p>
                                        <p className="text-[10px] font-bold text-gray-500 uppercase">Fatigue</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowSessionSummary(false)}
                                    className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-600 font-bold text-sm hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleEndSession}
                                    className="flex-1 py-3 rounded-xl bg-[#b4f835] text-black font-bold text-sm hover:bg-[#a3e030] transition-colors"
                                >
                                    Save & Exit
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Workout Flow Section */}

                <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-black uppercase tracking-widest text-[#1a1a1a]">Workout Flow</h3>
                    <button className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">Reorder</button>
                </div>

                {exercises.map((ex: WorkoutExercise) => {
                    const initials = getInitials(ex.name);
                    const gradientClass = getGradient(ex.name);

                    return (
                        <article key={ex.id} className="flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="flex items-center justify-between p-4 border-b border-gray-50 bg-gray-50/30">
                                <div className="flex items-center gap-4">
                                    <div className={`size-10 rounded-xl shadow-sm border border-gray-100 flex items-center justify-center ${gradientClass}`}>
                                        <span className="text-sm font-black tracking-tight">{initials}</span>
                                    </div>
                                    <div>
                                        <h4 className="text-base font-bold text-[#1a1a1a]">{ex.name}</h4>
                                        <p className="text-[11px] font-medium text-gray-500 uppercase tracking-tight">{ex.muscle}</p>
                                    </div>
                                </div>
                                <div className="relative">
                                    <button
                                        onClick={() => setActiveMenu(activeMenu === ex.id ? null : ex.id)}
                                        className="text-gray-300 hover:text-[#1a1a1a] p-1 transition-colors"
                                    >
                                        <MoreHorizontal className="w-5 h-5" />
                                    </button>

                                    {activeMenu === ex.id && (
                                        <button
                                            onClick={() => removeExercise(ex.id)}
                                            className="absolute right-0 top-8 bg-white border border-gray-100 shadow-xl rounded-xl py-2 px-4 flex items-center gap-2 text-red-600 text-xs font-bold whitespace-nowrap z-30 animate-in fade-in zoom-in-95 duration-200"
                                        >
                                            <Trash2 className="w-4 h-4" /> Delete Exercise
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="px-4">
                                <div className="grid grid-cols-[2.5rem_1fr_1fr_1fr_2rem] gap-3 py-3 border-b border-gray-50">
                                    <span className="text-[9px] font-black text-gray-400 uppercase text-center">Set</span>
                                    <span className="text-[9px] font-black text-gray-400 uppercase text-center">Weight</span>
                                    <span className="text-[9px] font-black text-gray-400 uppercase text-center">Reps</span>
                                    <span className="text-[9px] font-black text-gray-400 uppercase text-center">Hit</span>
                                    <span className="text-[9px] font-black text-gray-400 uppercase text-center"></span>
                                </div>

                                <div className="flex flex-col">
                                    {ex.sets.map((set: WorkoutSet) => (
                                        <div key={set.id} className="grid grid-cols-[2.5rem_1fr_1fr_1fr_2rem] gap-3 items-center py-3 border-b border-gray-50/50 last:border-0">
                                            <div className="text-xs font-black text-[#1a1a1a] text-center">{set.id}</div>
                                            <input
                                                className="text-center bg-gray-50 border-0 rounded-lg py-2 text-sm font-bold focus:ring-2 focus:ring-[#b4f835]/30 w-full"
                                                type="number"
                                                defaultValue={set.weight || 0}
                                            />
                                            <input
                                                className="text-center bg-gray-50 border-0 rounded-lg py-2 text-sm font-bold focus:ring-2 focus:ring-[#b4f835]/30 w-full"
                                                type="number"
                                                defaultValue={set.reps}
                                            />
                                            <button
                                                onClick={() => toggleSet(ex.id, set.id)}
                                                className={`flex items-center justify-center h-8 rounded-lg transition-colors ${set.completed ? 'bg-[#b4f835] text-black' : 'bg-gray-100 text-gray-400'}`}
                                            >
                                                <Check className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => removeSet(ex.id, set.id)} className="text-gray-300 hover:text-red-500">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="px-4 pb-4 pt-2 flex flex-col gap-3">
                                <button
                                    onClick={() => addSet(ex.id)}
                                    className="w-full py-2.5 rounded-xl border-2 border-dashed border-gray-100 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Plus className="w-4 h-4" /> Add Set
                                </button>
                                <details className="group">
                                    <summary className="list-none cursor-pointer flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-[#1a1a1a] transition-colors">
                                        <span>📝</span> Notes
                                    </summary>
                                    <textarea className="mt-2 w-full text-xs bg-gray-50 border-0 rounded-xl p-3 text-[#1a1a1a] placeholder-gray-400 focus:ring-1 focus:ring-[#b4f835] resize-none" placeholder="Add exercise notes..." rows={2}></textarea>
                                </details>
                            </div>
                        </article>
                    );
                })}

                <div className="h-8"></div>
                <div className="flex justify-center pb-8 px-6 w-full">
                    <button
                        onClick={() => navigate('/workout/add-exercise', { state: { sourceWorkout: initialData.name } })}
                        className="w-full max-w-xs flex items-center justify-center gap-3 bg-[#b4f835] text-black px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-[0_12px_24px_-8px_rgba(180,248,53,0.5)] active:scale-[0.98] transition-all transform hover:scale-105"
                    >
                        <Plus className="w-5 h-5" />
                        Add Exercise
                    </button>
                </div>
            </main>
        </div>
    );
};

export const EditCoreStrength = () => <EditWorkoutLayout initialData={CoreStrengthContent} title="Core Strength" />;
export const EditKettlebell = () => <EditWorkoutLayout initialData={KettlebellContent} title="Kettlebell Crush" />;
export const EditCalisthenics = () => <EditWorkoutLayout initialData={CalisthenicsContent} title="Calisthenics Flow" />;
export const EditUpperBody = () => <EditWorkoutLayout initialData={UpperBodyContent} title="Upper Body Power" />;
export const EditAesthetic = () => <EditWorkoutLayout initialData={AestheticContent} title="Aesthetic Body" />;

export const EditKickboxing = () => <EditWorkoutLayout initialData={KickboxingContent} title="Kickboxing" />;
export const EditMobilityFlow = () => <EditWorkoutLayout initialData={MobilityFlowContent} title="Mobility Flow" />;
export const EditEnduranceRun = () => <EditWorkoutLayout initialData={EnduranceContent} title="Endurance Run" />;
export const EditPowerlifting = () => <EditWorkoutLayout initialData={PowerliftingContent} title="Powerlifting" />;
export const EditPlyometrics = () => <EditWorkoutLayout initialData={PlyometricsContent} title="Plyometrics" />;

export const EditFieldTraining = () => <EditWorkoutLayout initialData={PlaceholderContent('Field Training')} title="Field Training" />;
export const EditFoamRolling = () => <EditWorkoutLayout initialData={PlaceholderContent('Foam Rolling')} title="Foam Rolling" />;
export const EditHybrid = () => <EditWorkoutLayout initialData={HybridTrainingContent} title="Hybrid Training" />;
export const EditLowerBody = () => <EditWorkoutLayout initialData={PlaceholderContent('Lower Body')} title="Lower Body Blast" />;
export const EditRecovery = () => <EditWorkoutLayout initialData={PlaceholderContent('Active Recovery')} title="Active Recovery" />;
