import React, { useState } from 'react';
import { useLifeTracker } from '../../utils/lifeTrackerStore';
import { TrackSelector } from './TrackSelector';
import { ModuleList } from './ModuleList';
import { LessonViewer } from './LessonViewer';
import { QuizModal } from './QuizModal';
import { STARTUP_MODULES, STOCKS_MODULES } from './data';
import type { TrackType, QuizData } from './types';
import { ChevronRight, Home, Trophy, Flame } from 'lucide-react';
import { Link } from 'react-router-dom';

export const FinancialLearningSection: React.FC = () => {
    const store = useLifeTracker();
    const financialState = store.state.financialLearning || {
        currentTrack: 'startup',
        unlockedModules: ['startup-101'],
        completedLessons: [],
        quizScores: {},
        totalXp: 0,
        streak: 0,
        lastActiveDate: null
    };

    const {
        currentTrack,
        unlockedModules,
        completedLessons,
        totalXp,
        streak
    } = financialState;

    const [activeLesson, setActiveLesson] = useState<{ moduleId: string, lessonId: string } | null>(null);
    const [activeQuiz, setActiveQuiz] = useState<QuizData | null>(null);

    const currentModules = currentTrack === 'startup' ? STARTUP_MODULES : STOCKS_MODULES;

    const handleSelectTrack = (track: TrackType) => {
        store.switchFinancialTrack(track);
        setActiveLesson(null);
    };

    const handleSelectLesson = (moduleId: string, lessonId: string) => {
        setActiveLesson({ moduleId, lessonId });
    };

    const handleBackToModules = () => {
        setActiveLesson(null);
    };

    const handleCompleteLesson = () => {
        if (activeLesson) {
            store.completeFinancialLesson(activeLesson.lessonId);
        }
    };

    const handleStartQuiz = (quizId: string) => {
        // In a real app, we'd fetch the quiz data by ID. 
        // For this demo, we'll mock a quiz object if ID matches.
        // We'll attach a mock quiz to the data.ts or just create one here dynamically for testing.
        const mockQuiz: QuizData = {
            id: quizId,
            title: 'Knowledge Check',
            moduleId: activeLesson?.moduleId || '',
            questions: [
                {
                    id: 'q1',
                    text: 'What is the most important validation step?',
                    options: ['Building a prototype', 'Talking to users', 'Running ads', 'Incorporating'],
                    correctOptionIndex: 1
                },
                {
                    id: 'q2',
                    text: 'Which is NOT a principle of The Mom Test?',
                    options: ['Talk about their life', 'Ask about specifics', 'Pitch your idea immediately', 'Listen more'],
                    correctOptionIndex: 2
                }
            ]
        };
        setActiveQuiz(mockQuiz);
    };

    const handleQuizComplete = (score: number) => {
        if (activeQuiz) {
            store.submitFinancialQuiz(activeQuiz.id, score);
            setActiveQuiz(null);
            // Optionally auto-complete lesson if passed
            if (activeLesson && score >= 80) {
                store.completeFinancialLesson(activeLesson.lessonId, 50); // Bonus XP
            }
        }
    };

    // Find current lesson object
    const currentLessonObject = activeLesson
        ? currentModules.find(m => m.id === activeLesson.moduleId)?.lessons.find(l => l.id === activeLesson.lessonId)
        : null;

    return (
        <div className="min-h-screen bg-black text-gray-200 pb-20 p-6 font-sans selection:bg-blue-500/30">
            {/* Header / Nav */}
            <div className="max-w-7xl mx-auto mb-8 flex flex-col justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                        <Link to="/dashboard" className="hover:text-blue-400 transition-colors"><Home size={14} /></Link>
                        <ChevronRight size={14} />
                        <span className="text-gray-300">Financial Learning</span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight flex items-center gap-4">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                            Wealth Builder
                        </span>
                    </h1>
                </div>

                {/* Stats Bar */}
                <div className="flex items-center gap-4 bg-white/5 border border-white/10 px-6 py-3 rounded-2xl">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-yellow-500/20 text-yellow-500 rounded-lg">
                            <Trophy size={18} />
                        </div>
                        <div>
                            <div className="text-xs text-gray-500 uppercase font-bold">Total XP</div>
                            <div className="text-white font-mono font-bold">{totalXp}</div>
                        </div>
                    </div>
                    <div className="w-px h-8 bg-white/10" />
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-orange-500/20 text-orange-500 rounded-lg">
                            <Flame size={18} />
                        </div>
                        <div>
                            <div className="text-xs text-gray-500 uppercase font-bold">Streak</div>
                            <div className="text-white font-mono font-bold">{streak} Days</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto">
                {!activeLesson ? (
                    <>
                        <TrackSelector
                            currentTrack={currentTrack}
                            onSelectTrack={handleSelectTrack}
                        />

                        <div className="bg-gradient-to-br from-gray-900 to-black rounded-3xl border border-white/10 p-1">
                            <ModuleList
                                modules={currentModules}
                                unlockedModuleIds={unlockedModules}
                                completedLessonIds={completedLessons}
                                onSelectLesson={handleSelectLesson}
                            />
                        </div>
                    </>
                ) : (
                    currentLessonObject && (
                        <LessonViewer
                            lesson={currentLessonObject}
                            isCompleted={completedLessons.includes(activeLesson.lessonId)}
                            onComplete={handleCompleteLesson}
                            onBack={handleBackToModules}
                            onStartQuiz={handleStartQuiz}
                        />
                    )
                )}
            </div>

            {activeQuiz && (
                <QuizModal
                    quiz={activeQuiz}
                    onClose={() => setActiveQuiz(null)}
                    onComplete={handleQuizComplete}
                />
            )}
        </div>
    );
};

export default FinancialLearningSection;
