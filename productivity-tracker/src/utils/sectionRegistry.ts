// Section Registry - Centralized metadata for all dashboard sections
// Each section is categorized to enable personalization-based filtering

export type InterestCategory =
    | 'fitness'
    | 'coding'
    | 'learning'
    | 'mental_health'
    | 'career'
    | 'finance'
    | 'freelancing'
    | 'personal_growth'
    | 'business'
    | 'creativity';

export type PrimaryGoal =
    | 'health'
    | 'career_growth'
    | 'financial_stability'
    | 'productivity'
    | 'learning'
    | 'work_life_balance';

export interface SectionMetadata {
    id: string;
    title: string;
    description: string;
    category: InterestCategory;
    priorityGoal: PrimaryGoal;
    icon: string; // Icon name from lucide-react
    color: string;
    bg: string;
    link: string;
    img?: string;
}

// All available sections in the app with their metadata
export const SECTION_REGISTRY: SectionMetadata[] = [
    // FITNESS
    {
        id: 'workout',
        title: 'Workout',
        description: 'Track your fitness journey',
        category: 'fitness',
        priorityGoal: 'health',
        icon: 'Dumbbell',
        color: 'text-orange-500',
        bg: 'bg-orange-50',
        link: '/section/workout',
        img: '/images/section-workout.png'
    },
    {
        id: 'breathwork',
        title: 'Breathwork',
        description: 'Breathing exercises',
        category: 'fitness',
        priorityGoal: 'health',
        icon: 'Wind',
        color: 'text-rose-500',
        bg: 'bg-rose-50',
        link: '/section/meditation?type=breathing',
        img: '/images/section-breathwork.png'
    },
    {
        id: 'kickboxing',
        title: 'Kickboxing',
        description: 'Combat training',
        category: 'fitness',
        priorityGoal: 'health',
        icon: 'Zap',
        color: 'text-orange-600',
        bg: 'bg-orange-50',
        link: '/workout/kickboxing',
        img: '/images/section-kickboxing.png'
    },
    {
        id: 'mobility',
        title: 'Mobility Flow',
        description: 'Flexibility training',
        category: 'fitness',
        priorityGoal: 'health',
        icon: 'Wind',
        color: 'text-sky-500',
        bg: 'bg-sky-50',
        link: '/workout/mobility',
        img: '/images/section-mobility.png'
    },
    {
        id: 'endurance',
        title: 'Endurance Run',
        description: 'Cardio training',
        category: 'fitness',
        priorityGoal: 'health',
        icon: 'Timer',
        color: 'text-emerald-600',
        bg: 'bg-emerald-50',
        link: '/workout/endurance',
        img: '/images/track-run.png'
    },
    {
        id: 'powerlifting',
        title: 'Powerlifting',
        description: 'Strength training',
        category: 'fitness',
        priorityGoal: 'health',
        icon: 'Dumbbell',
        color: 'text-indigo-600',
        bg: 'bg-indigo-50',
        link: '/workout/powerlifting',
        img: '/images/squat.png'
    },
    {
        id: 'plyometrics',
        title: 'Plyometrics',
        description: 'Explosive power',
        category: 'fitness',
        priorityGoal: 'health',
        icon: 'Sparkles',
        color: 'text-amber-500',
        bg: 'bg-amber-50',
        link: '/workout/plyometrics',
        img: '/images/section-plyometrics.png'
    },

    // MENTAL HEALTH
    {
        id: 'meditation',
        title: 'Meditation',
        description: 'Mindfulness practice',
        category: 'mental_health',
        priorityGoal: 'work_life_balance',
        icon: 'Brain',
        color: 'text-purple-500',
        bg: 'bg-purple-50',
        link: '/section/meditation',
        img: '/images/section-meditation.jpg'
    },
    {
        id: 'notes',
        title: 'Insights & Notes',
        description: 'Reflect and journal',
        category: 'mental_health',
        priorityGoal: 'productivity',
        icon: 'FileText',
        color: 'text-violet-500',
        bg: 'bg-violet-50',
        link: '/section/notes',
        img: '/images/section-reading.jpg'
    },

    // CODING / CAREER
    {
        id: 'coding',
        title: 'Coding',
        description: 'Track coding projects',
        category: 'coding',
        priorityGoal: 'career_growth',
        icon: 'Code',
        color: 'text-blue-500',
        bg: 'bg-blue-50',
        link: '/section/coding',
        img: '/images/section-coding.jpg'
    },
    {
        id: 'ai',
        title: 'AI',
        description: 'AI tools & learning',
        category: 'coding',
        priorityGoal: 'learning',
        icon: 'Cpu',
        color: 'text-teal-500',
        bg: 'bg-teal-50',
        link: '/section/ai',
        img: '/images/section-ai.png'
    },

    // LEARNING
    {
        id: 'reading',
        title: 'Reading',
        description: 'Track your books',
        category: 'learning',
        priorityGoal: 'learning',
        icon: 'BookOpen',
        color: 'text-yellow-500',
        bg: 'bg-yellow-50',
        link: '/section/reading',
        img: '/images/section-reading.jpg'
    },

    // CAREER
    {
        id: 'networking',
        title: 'Networking',
        description: 'Build connections',
        category: 'career',
        priorityGoal: 'career_growth',
        icon: 'Users',
        color: 'text-pink-500',
        bg: 'bg-pink-50',
        link: '/section/networking',
        img: '/images/section-teaching.jpg'
    },
    {
        id: 'branding',
        title: 'Personal Branding',
        description: 'Build your brand',
        category: 'career',
        priorityGoal: 'career_growth',
        icon: 'Fingerprint',
        color: 'text-indigo-500',
        bg: 'bg-indigo-50',
        link: '/section/branding',
        img: '/images/section-branding.png'
    },

    // BUSINESS
    {
        id: 'business',
        title: 'Business',
        description: 'Track business growth',
        category: 'business',
        priorityGoal: 'financial_stability',
        icon: 'Briefcase',
        color: 'text-green-500',
        bg: 'bg-green-50',
        link: '/section/business',
        img: '/images/section-business.jpg'
    },

    // FREELANCING
    {
        id: 'freelancing',
        title: 'Freelancing',
        description: 'Manage freelance work',
        category: 'freelancing',
        priorityGoal: 'financial_stability',
        icon: 'Laptop',
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        link: '/section/freelancing',
        img: '/images/section-freelancing.png'
    },

    // FINANCE
    {
        id: 'financial-learning',
        title: 'Wealth Builder',
        description: 'Startup & investing',
        category: 'finance',
        priorityGoal: 'financial_stability',
        icon: 'TrendingUp',
        color: 'text-emerald-500',
        bg: 'bg-emerald-50',
        link: '/section/finance-learning',
        img: '/images/section-market.png'
    },
    {
        id: 'market',
        title: 'Market',
        description: 'Market analysis',
        category: 'finance',
        priorityGoal: 'financial_stability',
        icon: 'TrendingUp',
        color: 'text-emerald-500',
        bg: 'bg-emerald-50',
        link: '/section/market',
        img: '/images/section-market.png'
    },

    // PERSONAL GROWTH
    {
        id: 'looksmaxing',
        title: 'Looksmaxing',
        description: 'Personal appearance',
        category: 'personal_growth',
        priorityGoal: 'health',
        icon: 'Sparkles',
        color: 'text-rose-500',
        bg: 'bg-rose-50',
        link: '/section/looksmaxing',
        img: '/images/section-looksmaxing-new.png'
    },
    {
        id: 'cooking',
        title: 'Cooking',
        description: 'Recipes & nutrition',
        category: 'personal_growth',
        priorityGoal: 'health',
        icon: 'Utensils',
        color: 'text-red-500',
        bg: 'bg-red-50',
        link: '/section/cooking',
        img: '/images/section-cooking.png'
    },

    // ALWAYS VISIBLE (Core)
    {
        id: 'board',
        title: 'Personal Board',
        description: 'Your dashboard widgets',
        category: 'personal_growth', // Available to all
        priorityGoal: 'productivity',
        icon: 'LayoutGrid',
        color: 'text-gray-800',
        bg: 'bg-gray-100',
        link: '/board',
        img: '/hero-image.png'
    },
];

// Interest options for onboarding
export const INTEREST_OPTIONS: { id: InterestCategory; label: string; icon: string; description: string }[] = [
    { id: 'fitness', label: 'Fitness & Health', icon: 'Dumbbell', description: 'Workouts, cardio, and physical health' },
    { id: 'coding', label: 'Coding & Tech', icon: 'Code', description: 'Programming, AI, and technology' },
    { id: 'learning', label: 'Learning', icon: 'BookOpen', description: 'Reading, courses, and skill building' },
    { id: 'mental_health', label: 'Mental Health', icon: 'Brain', description: 'Meditation, journaling, and mindfulness' },
    { id: 'career', label: 'Career', icon: 'Briefcase', description: 'Networking, branding, and professional growth' },
    { id: 'finance', label: 'Finance', icon: 'TrendingUp', description: 'Investing, wealth building, and markets' },
    { id: 'freelancing', label: 'Freelancing', icon: 'Laptop', description: 'Freelance work and client management' },
    { id: 'business', label: 'Business', icon: 'Building2', description: 'Entrepreneurship and business growth' },
    { id: 'personal_growth', label: 'Personal Growth', icon: 'Sparkles', description: 'Self-improvement and lifestyle' },
    { id: 'creativity', label: 'Creativity', icon: 'Palette', description: 'Art, design, and creative projects' },
];

// Primary goal options for onboarding
export const GOAL_OPTIONS: { id: PrimaryGoal; label: string; icon: string; description: string }[] = [
    { id: 'health', label: 'Health & Fitness', icon: 'Heart', description: 'Prioritize physical and mental wellness' },
    { id: 'career_growth', label: 'Career Growth', icon: 'TrendingUp', description: 'Advance your professional career' },
    { id: 'financial_stability', label: 'Financial Stability', icon: 'DollarSign', description: 'Build wealth and financial security' },
    { id: 'productivity', label: 'Productivity', icon: 'Target', description: 'Maximize efficiency and output' },
    { id: 'learning', label: 'Continuous Learning', icon: 'GraduationCap', description: 'Focus on acquiring new skills' },
    { id: 'work_life_balance', label: 'Work-Life Balance', icon: 'Scale', description: 'Maintain harmony in all areas' },
];

// Helper function to filter sections based on user interests
export function getVisibleSections(
    userInterests: InterestCategory[],
    primaryGoal: PrimaryGoal | null
): SectionMetadata[] {
    // Always include 'board' section
    const alwaysVisible = ['board'];

    return SECTION_REGISTRY
        .filter(section =>
            alwaysVisible.includes(section.id) ||
            userInterests.includes(section.category)
        )
        .sort((a, b) => {
            // Primary goal sections come first
            if (primaryGoal) {
                const aMatch = a.priorityGoal === primaryGoal ? -1 : 0;
                const bMatch = b.priorityGoal === primaryGoal ? -1 : 0;
                if (aMatch !== bMatch) return aMatch - bMatch;
            }
            // Then sort alphabetically
            return a.title.localeCompare(b.title);
        });
}
