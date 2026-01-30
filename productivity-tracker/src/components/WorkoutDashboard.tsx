import React, { useLayoutEffect, useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import {
    Search, SlidersHorizontal,
    Dumbbell
} from 'lucide-react';
import { WORKOUT_CATEGORIES, type WorkoutCategory } from '../data/workoutData';
import { getCategoryOverride } from '../utils/workoutStore';

const WorkoutDashboard: React.FC = () => {
    const navigate = useNavigate();
    const gridRef = useRef<HTMLDivElement>(null);
    const [activeWorkouts, setActiveWorkouts] = useState<WorkoutCategory[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const loadCategories = () => {
            const stored = localStorage.getItem('selectedWorkoutCategories');
            const customData = localStorage.getItem('customCategories');

            let customRoutines: WorkoutCategory[] = [];
            if (customData) {
                const parsed = JSON.parse(customData);
                customRoutines = parsed.map((cat: { id: string, title: string, subtitle?: string, img?: string }) => ({
                    id: cat.id,
                    title: cat.title,
                    tag: 'CUSTOM',
                    subtitle: cat.subtitle || 'Custom Routine',
                    time: '-- mins',
                    type: 'Custom',
                    icon: Dumbbell,
                    image: cat.img || '',
                    color: 'text-indigo-400',
                    bg: 'bg-indigo-500/10',
                    link: `/section/custom/${cat.id}`,
                    defaultActive: true
                }));
            }

            if (stored) {
                const ids = JSON.parse(stored);
                const filteredStatic = WORKOUT_CATEGORIES.filter(c => ids.includes(c.id));
                // Only include custom routines that are in selectedWorkoutCategories
                const filteredCustom = customRoutines.filter(c => ids.includes(c.id));
                setActiveWorkouts([...filteredStatic, ...filteredCustom]);
            } else {
                const defaults = WORKOUT_CATEGORIES.filter(c => c.defaultActive);
                setActiveWorkouts([...defaults, ...customRoutines]);
            }
        };

        loadCategories();
        window.addEventListener('routinesUpdated', loadCategories);
        return () => window.removeEventListener('routinesUpdated', loadCategories);
    }, []);

    useLayoutEffect(() => {
        if (activeWorkouts.length === 0) return;

        const ctx = gsap.context(() => {
            gsap.fromTo('.workout-card',
                {
                    opacity: 0,
                    x: 50,
                    scale: 0.95
                },
                {
                    opacity: 1,
                    x: 0,
                    scale: 1,
                    duration: 0.8,
                    stagger: 0.1,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: gridRef.current,
                        start: "top bottom-=100",
                        toggleActions: "play none none reverse"
                    }
                }
            );
        }, gridRef);

        return () => ctx.revert();
    }, [activeWorkouts]);

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark pb-24 font-sans text-text-light dark:text-text-dark flex justify-center transition-colors duration-500">
            <div className="w-full max-w-md bg-background-light dark:bg-background-dark min-h-screen flex flex-col relative">

                {/* Header */}
                <header className="px-6 pt-12 pb-6 flex justify-between items-start">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight text-heading-light dark:text-text-dark leading-tight">
                            Discover<br />Workouts
                        </h1>
                    </div>
                    <div className="relative">
                        <div className="w-12 h-12 rounded-full p-0.5 bg-gradient-to-tr from-accent to-rosy-granite">
                            <img
                                alt="Profile"
                                className="w-full h-full rounded-full object-cover border-2 border-surface-light dark:border-surface-dark"
                                src="https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=200&auto=format&fit=crop"
                            />
                        </div>
                        <div className="absolute top-0 right-0 w-3 h-3 bg-accent rounded-full border-2 border-background-light dark:border-background-dark"></div>
                    </div>
                </header>

                {/* Search Bar */}
                <div className="px-6 mb-8 flex gap-3">
                    <div className="flex-1 bg-surface-light dark:bg-surface-dark rounded-2xl h-14 flex items-center px-5 shadow-soft border border-border-light dark:border-border-dark">
                        <Search className="w-5 h-5 text-subtext-light dark:text-subtext-dark mr-3" />
                        <input
                            type="text"
                            placeholder="Search routines, muscles..."
                            className="flex-1 bg-transparent border-none outline-none text-text-light dark:text-text-dark placeholder-subtext-light dark:placeholder-subtext-dark text-sm font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={() => navigate('/workout/categories')}
                        className="w-14 h-14 rounded-2xl bg-surface-light dark:bg-surface-dark flex items-center justify-center shadow-soft border border-border-light dark:border-border-dark text-heading-light dark:text-text-dark hover:border-accent hover:bg-accent hover:text-white-smoke transition-all duration-300"
                    >
                        <SlidersHorizontal className="w-6 h-6" />
                    </button>
                </div>

                {/* Workout Grid */}
                <div
                    ref={gridRef}
                    className="px-6 grid grid-cols-2 gap-4 pb-6"
                >
                    {activeWorkouts.filter(w =>
                        w.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (w.type && w.type.toLowerCase().includes(searchTerm.toLowerCase()))
                    ).map((workout, index) => {
                        const override = getCategoryOverride(workout.id);
                        const displayImage = override?.img || workout.image;

                        return (
                            <div
                                key={workout.id || index}
                                onClick={() => navigate(workout.link)}
                                className="workout-card enhanced-card-mini card-interactive relative w-full h-40 overflow-hidden cursor-pointer group"
                                style={{
                                    borderRadius: '1.5rem',
                                    animationDelay: `${index * 0.1}s`
                                }}
                            >
                                <img
                                    alt={workout.title}
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    src={displayImage}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent"></div>

                                <div className="relative z-10 flex flex-col h-full justify-between p-4">
                                    <div className="flex justify-between items-start">
                                        <div className={`w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center`}>
                                            <workout.icon className={`w-4 h-4 ${workout.color} text-white fill-current`} />
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-white font-bold text-base leading-tight mb-1">{workout.title}</h3>
                                        <p className="text-[10px] text-gray-300 font-medium tracking-wide flex items-center gap-1">
                                            <span>{workout.time}</span>
                                            <span className="w-0.5 h-0.5 rounded-full bg-gray-400"></span>
                                            <span>{workout.type}</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Customize Button */}
                <div className="px-6 mt-6 pb-4">
                    <button
                        onClick={() => navigate('/workout/categories')}
                        className="w-full py-4 rounded-2xl border-2 border-dashed border-border-light dark:border-border-dark text-subtext-light dark:text-subtext-dark font-semibold flex items-center justify-center gap-2 hover:border-accent hover:text-accent transition-all duration-300 group shadow-soft hover:shadow-elegant"
                    >
                        <SlidersHorizontal className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        Customize Sections
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WorkoutDashboard;
