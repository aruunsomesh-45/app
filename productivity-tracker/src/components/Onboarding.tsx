import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    ArrowRight, Check, Dumbbell, Code, BookOpen, Brain,
    Briefcase, TrendingUp, Laptop, Building2, Sparkles, Palette,
    Heart, Target, DollarSign, GraduationCap, Scale, ChevronLeft
} from 'lucide-react';
import { useLifeTracker } from '../utils/lifeTrackerStore';
import { INTEREST_OPTIONS, GOAL_OPTIONS, type InterestCategory, type PrimaryGoal } from '../utils/sectionRegistry';

// Icon mapping for dynamic rendering
const iconMap: Record<string, React.ElementType> = {
    Dumbbell, Code, BookOpen, Brain, Briefcase, TrendingUp,
    Laptop, Building2, Sparkles, Palette, Heart, Target,
    DollarSign, GraduationCap, Scale
};

const Onboarding: React.FC = () => {
    const navigate = useNavigate();
    const store = useLifeTracker();
    const [step, setStep] = useState(1);
    const [selectedInterests, setSelectedInterests] = useState<InterestCategory[]>([]);
    const [selectedGoal, setSelectedGoal] = useState<PrimaryGoal | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const toggleInterest = (id: InterestCategory) => {
        setSelectedInterests(prev =>
            prev.includes(id)
                ? prev.filter(i => i !== id)
                : [...prev, id]
        );
    };

    const handleNext = () => {
        if (step === 1 && selectedInterests.length > 0) {
            setStep(2);
        }
    };

    const handleBack = () => {
        if (step === 2) {
            setStep(1);
        }
    };

    const handleComplete = async () => {
        if (!selectedGoal || selectedInterests.length === 0) return;

        setIsSubmitting(true);
        try {
            // Update user profile with onboarding data
            store.updateUserProfile({
                userInterests: selectedInterests,
                primaryGoal: selectedGoal,
                onboardingCompleted: true,
            });

            // Navigate to dashboard
            navigate('/dashboard');
        } catch (error) {
            console.error('Error completing onboarding:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const canProceedStep1 = selectedInterests.length >= 1;
    const canProceedStep2 = selectedGoal !== null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
            <div className="w-full max-w-3xl">
                {/* Progress Indicator */}
                <div className="flex items-center justify-center mb-8 gap-3">
                    <div className={`w-3 h-3 rounded-full transition-all ${step >= 1 ? 'bg-white scale-110' : 'bg-white/30'}`} />
                    <div className={`w-12 h-0.5 transition-all ${step >= 2 ? 'bg-white' : 'bg-white/30'}`} />
                    <div className={`w-3 h-3 rounded-full transition-all ${step >= 2 ? 'bg-white scale-110' : 'bg-white/30'}`} />
                </div>

                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            {/* Step 1: Interest Selection */}
                            <div className="text-center mb-8">
                                <motion.h1
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-3xl md:text-4xl font-bold text-white mb-3"
                                >
                                    What drives you? ✨
                                </motion.h1>
                                <p className="text-slate-400 text-lg">
                                    Select the areas you want to focus on. Choose at least one.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
                                {INTEREST_OPTIONS.map((interest, idx) => {
                                    const Icon = iconMap[interest.icon] || Sparkles;
                                    const isSelected = selectedInterests.includes(interest.id);

                                    return (
                                        <motion.button
                                            key={interest.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            onClick={() => toggleInterest(interest.id)}
                                            className={`relative p-4 rounded-2xl border-2 transition-all duration-200 text-left group
                                                ${isSelected
                                                    ? 'border-white bg-white/10 shadow-lg shadow-white/10'
                                                    : 'border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10'
                                                }`}
                                        >
                                            {/* Selection indicator */}
                                            {isSelected && (
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    className="absolute top-2 right-2 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center"
                                                >
                                                    <Check className="w-3 h-3 text-white" />
                                                </motion.div>
                                            )}

                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-colors
                                                ${isSelected ? 'bg-white/20' : 'bg-white/10 group-hover:bg-white/15'}`}>
                                                <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-white/70'}`} />
                                            </div>

                                            <h3 className={`font-semibold mb-1 transition-colors ${isSelected ? 'text-white' : 'text-white/80'}`}>
                                                {interest.label}
                                            </h3>
                                            <p className="text-xs text-slate-400 line-clamp-2">
                                                {interest.description}
                                            </p>
                                        </motion.button>
                                    );
                                })}
                            </div>

                            <div className="flex justify-center">
                                <motion.button
                                    whileHover={{ scale: canProceedStep1 ? 1.02 : 1 }}
                                    whileTap={{ scale: canProceedStep1 ? 0.98 : 1 }}
                                    onClick={handleNext}
                                    disabled={!canProceedStep1}
                                    className={`px-8 py-4 rounded-2xl font-semibold flex items-center gap-2 transition-all
                                        ${canProceedStep1
                                            ? 'bg-white text-slate-900 hover:shadow-lg hover:shadow-white/20'
                                            : 'bg-white/20 text-white/50 cursor-not-allowed'
                                        }`}
                                >
                                    Continue
                                    <ArrowRight className="w-5 h-5" />
                                </motion.button>
                            </div>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            {/* Step 2: Primary Goal */}
                            <div className="text-center mb-8">
                                <motion.h1
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-3xl md:text-4xl font-bold text-white mb-3"
                                >
                                    What's your main focus? 🎯
                                </motion.h1>
                                <p className="text-slate-400 text-lg">
                                    Choose your primary goal. This will prioritize your dashboard.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                                {GOAL_OPTIONS.map((goal, idx) => {
                                    const Icon = iconMap[goal.icon] || Target;
                                    const isSelected = selectedGoal === goal.id;

                                    return (
                                        <motion.button
                                            key={goal.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.08 }}
                                            onClick={() => setSelectedGoal(goal.id)}
                                            className={`relative p-5 rounded-2xl border-2 transition-all duration-200 text-left group flex items-start gap-4
                                                ${isSelected
                                                    ? 'border-emerald-400 bg-emerald-500/10 shadow-lg shadow-emerald-500/10'
                                                    : 'border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10'
                                                }`}
                                        >
                                            {/* Radio indicator */}
                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all
                                                ${isSelected
                                                    ? 'border-emerald-400 bg-emerald-500'
                                                    : 'border-white/30 bg-transparent'
                                                }`}>
                                                {isSelected && (
                                                    <motion.div
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                        className="w-2.5 h-2.5 bg-white rounded-full"
                                                    />
                                                )}
                                            </div>

                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors
                                                        ${isSelected ? 'bg-emerald-500/20' : 'bg-white/10'}`}>
                                                        <Icon className={`w-5 h-5 ${isSelected ? 'text-emerald-400' : 'text-white/70'}`} />
                                                    </div>
                                                    <h3 className={`font-semibold text-lg transition-colors ${isSelected ? 'text-white' : 'text-white/80'}`}>
                                                        {goal.label}
                                                    </h3>
                                                </div>
                                                <p className="text-sm text-slate-400">
                                                    {goal.description}
                                                </p>
                                            </div>
                                        </motion.button>
                                    );
                                })}
                            </div>

                            <div className="flex justify-between items-center">
                                <button
                                    onClick={handleBack}
                                    className="px-6 py-3 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    Back
                                </button>

                                <motion.button
                                    whileHover={{ scale: canProceedStep2 ? 1.02 : 1 }}
                                    whileTap={{ scale: canProceedStep2 ? 0.98 : 1 }}
                                    onClick={handleComplete}
                                    disabled={!canProceedStep2 || isSubmitting}
                                    className={`px-8 py-4 rounded-2xl font-semibold flex items-center gap-2 transition-all
                                        ${canProceedStep2 && !isSubmitting
                                            ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:shadow-lg hover:shadow-emerald-500/30'
                                            : 'bg-white/20 text-white/50 cursor-not-allowed'
                                        }`}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Setting up...
                                        </>
                                    ) : (
                                        <>
                                            Let's Go!
                                            <Sparkles className="w-5 h-5" />
                                        </>
                                    )}
                                </motion.button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Step indicator text */}
                <p className="text-center text-slate-500 mt-8 text-sm">
                    Step {step} of 2
                </p>
            </div>
        </div>
    );
};

export default Onboarding;
