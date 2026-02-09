import React, { useState } from 'react';
import { X, CheckCircle, XCircle, Award, ArrowRight } from 'lucide-react';
import type { QuizData } from './types';

interface QuizModalProps {
    quiz: QuizData;
    onClose: () => void;
    onComplete: (score: number) => void;
}

export const QuizModal: React.FC<QuizModalProps> = ({ quiz, onClose, onComplete }) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);

    const currentQuestion = quiz.questions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;

    const handleOptionClick = (index: number) => {
        if (isAnswered) return;
        setSelectedOption(index);
    };

    const handleSubmitAnswer = () => {
        if (selectedOption === null) return;

        setIsAnswered(true);
        if (selectedOption === currentQuestion.correctOptionIndex) {
            setScore(prev => prev + 1);
        }
    };

    const handleNext = () => {
        if (isLastQuestion) {
            setShowResult(true);
        } else {
            setCurrentQuestionIndex(prev => prev + 1);
            setSelectedOption(null);
            setIsAnswered(false);
        }
    };

    const handleFinish = () => {
        const finalScorePercentage = Math.round((score / quiz.questions.length) * 100);
        onComplete(finalScorePercentage);
    };

    if (showResult) {
        const percentage = Math.round((score / quiz.questions.length) * 100);
        const passed = percentage >= 80;

        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-md overflow-hidden relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>

                    <div className="p-8 text-center">
                        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${passed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                            <Award size={40} />
                        </div>

                        <h2 className="text-3xl font-bold text-white mb-2">{percentage}%</h2>
                        <p className="text-gray-400 mb-6">
                            You answered {score} out of {quiz.questions.length} correctly.
                        </p>

                        <div className="mb-8">
                            {passed ? (
                                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-emerald-300 text-sm">
                                    <p className="font-bold mb-1">Congratulations!</p>
                                    You've passed the quiz and earned bonus XP!
                                </div>
                            ) : (
                                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-300 text-sm">
                                    <p className="font-bold mb-1">Keep Learning!</p>
                                    Review the lesson material and try again to improve your score.
                                </div>
                            )}
                        </div>

                        <button
                            onClick={handleFinish}
                            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all"
                        >
                            {passed ? 'Collect Rewards' : 'Try Again Later'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-6 border-b border-white/10 flex items-center justify-between bg-gray-900/50">
                    <div>
                        <span className="text-xs font-bold text-gray-500 tracking-wider uppercase">
                            Question {currentQuestionIndex + 1} of {quiz.questions.length}
                        </span>
                        <h3 className="text-white font-bold text-lg mt-1">{quiz.title}</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Question Body */}
                <div className="p-6 overflow-y-auto flex-1">
                    <p className="text-lg text-white mb-6 leading-relaxed">
                        {currentQuestion.text}
                    </p>

                    <div className="space-y-3">
                        {currentQuestion.options.map((option, idx) => {
                            let stateClass = 'border-white/10 hover:border-blue-500/50 hover:bg-white/5';

                            if (isAnswered) {
                                if (idx === currentQuestion.correctOptionIndex) {
                                    stateClass = 'border-emerald-500 bg-emerald-500/10 text-emerald-200';
                                } else if (idx === selectedOption) {
                                    stateClass = 'border-red-500 bg-red-500/10 text-red-200';
                                } else {
                                    stateClass = 'border-white/5 opacity-50';
                                }
                            } else if (selectedOption === idx) {
                                stateClass = 'border-blue-500 bg-blue-500/20 text-white';
                            }

                            return (
                                <button
                                    key={idx}
                                    onClick={() => handleOptionClick(idx)}
                                    disabled={isAnswered}
                                    className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-center justify-between ${stateClass}`}
                                >
                                    <span>{option}</span>
                                    {isAnswered && idx === currentQuestion.correctOptionIndex && (
                                        <CheckCircle size={20} className="text-emerald-500" />
                                    )}
                                    {isAnswered && idx === selectedOption && idx !== currentQuestion.correctOptionIndex && (
                                        <XCircle size={20} className="text-red-500" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/10 bg-gray-900/50">
                    {!isAnswered ? (
                        <button
                            onClick={handleSubmitAnswer}
                            disabled={selectedOption === null}
                            className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 text-white font-bold rounded-xl transition-all"
                        >
                            Submit Answer
                        </button>
                    ) : (
                        <button
                            onClick={handleNext}
                            className="w-full py-3 bg-white text-black hover:bg-gray-200 font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                        >
                            {isLastQuestion ? 'View Results' : 'Next Question'} <ArrowRight size={18} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
