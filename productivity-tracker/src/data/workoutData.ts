import {
    Zap, Dumbbell, Footprints,
    Swords, Leaf, Heart, Timer, Droplet, Smile,
    type LucideIcon
} from 'lucide-react';

export interface WorkoutCategory {
    id: string;
    title: string;
    tag: string;
    subtitle?: string; // For the list view
    time: string;
    type: string;
    icon: LucideIcon;
    image: string;
    color: string;
    bg?: string; // For the list view
    link: string;
    defaultActive: boolean;
}

export const WORKOUT_CATEGORIES: WorkoutCategory[] = [
    {
        id: 'foam-rolling',
        title: 'Foam Rolling',
        tag: 'RELIEF',
        subtitle: 'Myofascial Release',
        time: '15 mins',
        type: 'Mobility',
        icon: Smile,
        image: '/images/foam-rolling.png',
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
        link: '/workout/foam-rolling',
        defaultActive: true
    },
    {
        id: 'recovery',
        title: 'Recovery',
        tag: 'REST',
        subtitle: 'Active Recovery',
        time: '20 mins',
        type: 'Stretching',
        icon: Leaf,
        image: '/images/recovery-icebath.png',
        color: 'text-green-400',
        bg: 'bg-green-500/10 dark:bg-green-500/20',
        link: '/workout/recovery',
        defaultActive: true
    },
    {
        id: 'hybrid',
        title: 'Hybrid Training',
        tag: 'ADVANCED',
        subtitle: 'HIIT & Strength',
        time: '45 mins',
        type: 'HIIT & Strength',
        icon: Zap,
        image: '/images/track-run.png',
        color: 'text-purple-400',
        bg: 'bg-purple-500/10 dark:bg-purple-500/20',
        link: '/workout/hybrid',
        defaultActive: true
    },
    {
        id: 'field',
        title: 'Field Training',
        tag: 'CARDIO',
        subtitle: 'Outdoor Conditioning',
        time: '40 mins',
        type: 'Outdoor',
        icon: Timer,
        image: '/images/forest-run.png',
        color: 'text-yellow-400',
        bg: 'bg-yellow-500/10 dark:bg-yellow-500/20',
        link: '/workout/field',
        defaultActive: true
    },
    {
        id: 'aesthetic',
        title: 'Aesthetic Routine',
        tag: 'TONE',
        subtitle: 'Hypertrophy Focus',
        time: '30 mins',
        type: 'Full Body',
        icon: Droplet,
        image: '/images/aesthetic-physique.png',
        color: 'text-blue-400',
        bg: 'bg-blue-500/10 dark:bg-blue-500/20',
        link: '/workout/aesthetic',
        defaultActive: true
    },
    {
        id: 'kettlebell',
        title: 'Kettlebell Routine',
        tag: 'POWER',
        subtitle: 'Ballistic Strength',
        time: '25 mins',
        type: 'Circuit',
        icon: Dumbbell,
        image: '/images/kettlebell.png',
        color: 'text-orange-400',
        bg: 'bg-orange-500/10 dark:bg-orange-500/20',
        link: '/workout/kettlebell',
        defaultActive: true
    },
    {
        id: 'upper-body',
        title: 'Upper Body Power',
        tag: 'STRENGTH',
        subtitle: 'Push & Pull',
        time: '45 mins',
        type: 'Strength',
        icon: Dumbbell,
        image: '/images/upper-body-bench.png',
        color: 'text-red-400',
        bg: 'bg-red-500/10 dark:bg-red-500/20',
        link: '/workout/upper-body',
        defaultActive: true
    },
    {
        id: 'lower-body',
        title: 'Lower Body Blast',
        tag: 'LEGS',
        subtitle: 'Squat & Lunge',
        time: '50 mins',
        type: 'Strength',
        icon: Zap,
        image: '/images/lower-body-legs.png',
        color: 'text-blue-500',
        bg: 'bg-blue-500/10 dark:bg-blue-500/20',
        link: '/workout/lower-body',
        defaultActive: true
    },
    {
        id: 'calisthenics',
        title: 'Calisthenics',
        tag: 'BODYWEIGHT',
        subtitle: 'Bodyweight Mastery',
        time: '45 mins',
        type: 'Strength',
        icon: Dumbbell,
        image: '/images/core-workout.png',
        color: 'text-indigo-400',
        bg: 'bg-indigo-500/10 dark:bg-indigo-500/20',
        link: '/workout/calisthenics',
        defaultActive: true
    },
    {
        id: 'core',
        title: 'Core Workout',
        tag: 'CORE',
        subtitle: 'Abs & Obliques',
        time: '20 mins',
        type: 'Abs & Obliques',
        icon: Zap,
        image: '/images/calisthenics.png',
        color: 'text-pink-400',
        bg: 'bg-pink-500/10 dark:bg-pink-500/20',
        link: '/workout/core',
        defaultActive: true
    },
    {
        id: 'plyometrics',
        title: 'Plyometrics',
        tag: 'EXPLOSIVE',
        subtitle: 'Explosive Power • HIIT',
        time: '20 mins',
        type: 'HIIT',
        icon: Zap,
        image: '/images/track-run.png', // Reusing
        color: 'text-orange-500',
        bg: 'bg-orange-500/10 dark:bg-orange-500/20',
        link: '/workout/plyometrics',
        defaultActive: false
    },
    {
        id: 'powerlifting',
        title: 'Powerlifting',
        tag: 'MAX STRENGTH',
        subtitle: 'Max Strength • Barbell',
        time: '60 mins',
        type: 'Strength',
        icon: Dumbbell,
        image: '/images/upper-body-bench.png', // Reusing
        color: 'text-red-500',
        bg: 'bg-red-500/10 dark:bg-red-500/20',
        link: '/workout/powerlifting',
        defaultActive: false
    },
    {
        id: 'endurance',
        title: 'Endurance Run',
        tag: 'DISTANCE',
        subtitle: 'Long Distance • Cardio',
        time: '60 mins',
        type: 'Cardio',
        icon: Footprints,
        image: '/images/forest-run.png', // Reusing
        color: 'text-yellow-500',
        bg: 'bg-yellow-500/10 dark:bg-yellow-500/20',
        link: '/workout/endurance',
        defaultActive: false
    },
    {
        id: 'kickboxing',
        title: 'Kickboxing',
        tag: 'COMBAT',
        subtitle: 'Combat Cardio • Agility',
        time: '40 mins',
        type: 'Cardio',
        icon: Swords,
        image: '/images/aesthetic-physique.png', // Placeholder
        color: 'text-purple-500',
        bg: 'bg-purple-500/10 dark:bg-purple-500/20',
        link: '/workout/kickboxing',
        defaultActive: false
    },
    {
        id: 'mobility',
        title: 'Mobility Flow',
        tag: 'FLOW',
        subtitle: 'Recovery • Flexibility',
        time: '30 mins',
        type: 'Recovery',
        icon: Leaf,
        image: '/images/recovery-icebath.png', // Reusing
        color: 'text-teal-500',
        bg: 'bg-teal-500/10 dark:bg-teal-500/20',
        link: '/workout/mobility',
        defaultActive: false
    },
    {
        id: 'yoga',
        title: 'Prenatal Yoga',
        tag: 'GENTLE',
        subtitle: 'Gentle • Breathing',
        time: '45 mins',
        type: 'Yoga',
        icon: Heart,
        image: '/images/foam-rolling.png', // Placeholder
        color: 'text-pink-500',
        bg: 'bg-pink-500/10 dark:bg-pink-500/20',
        link: '/workout/yoga',
        defaultActive: false
    }
];
