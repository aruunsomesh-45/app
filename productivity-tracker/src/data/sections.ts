import {
    Dumbbell, Code, Brain, BookOpen, Briefcase,
    Cpu, UserCircle, Laptop, Sparkles, GraduationCap, Utensils
} from 'lucide-react';

export const sections = [
    { id: 'workout', title: 'Work Out', icon: Dumbbell, color: 'bg-orange-100 text-orange-600', description: 'Track your fitness journey' },
    { id: 'coding', title: 'Coding', icon: Code, color: 'bg-blue-100 text-blue-600', description: 'Log your commit streaks' },
    { id: 'meditation', title: 'Meditation', icon: Brain, color: 'bg-purple-100 text-purple-600', description: 'Mindfulness minutes' },
    { id: 'reading', title: 'Reading', icon: BookOpen, color: 'bg-emerald-100 text-emerald-600', description: 'Books and pages read' },
    { id: 'business', title: 'Business', icon: Briefcase, color: 'bg-slate-100 text-slate-600', description: 'Key business metrics' },
    { id: 'ai', title: 'AI', icon: Cpu, color: 'bg-indigo-100 text-indigo-600', description: 'AI learning and tools' },
    { id: 'personal-branding', title: 'Personal Branding', icon: UserCircle, color: 'bg-pink-100 text-pink-600', description: 'Social media growth' },
    { id: 'freelancing', title: 'Freelancing', icon: Laptop, color: 'bg-cyan-100 text-cyan-600', description: 'Client work & hours' },
    { id: 'look-maxing', title: 'Look Maxing', icon: Sparkles, color: 'bg-rose-100 text-rose-600', description: 'Grooming & style' },
    { id: 'networking', title: 'Networking', icon: GraduationCap, color: 'bg-yellow-100 text-yellow-600', description: 'Lessons and mentoring' },
    { id: 'cooking', title: 'Cooking', icon: Utensils, color: 'bg-red-100 text-red-600', description: 'Recipes & Meal Prep' },
];
