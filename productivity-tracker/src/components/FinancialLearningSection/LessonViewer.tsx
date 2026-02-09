import React from 'react';
import { ArrowLeft, Play, CheckCircle, Award } from 'lucide-react';
import type { Lesson } from './types';

interface LessonViewerProps {
    lesson: Lesson;
    isCompleted: boolean;
    onComplete: () => void;
    onBack: () => void;
    onStartQuiz: (quizId: string) => void;
}

export const LessonViewer: React.FC<LessonViewerProps> = ({
    lesson,
    isCompleted,
    onComplete,
    onBack,
    onStartQuiz
}) => {
    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex items-center gap-4">
                <button
                    onClick={onBack}
                    className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <span className="text-xs font-bold text-blue-400 tracking-wider uppercase mb-1 block">
                        {lesson.type} • {lesson.duration}
                    </span>
                    <h2 className="text-2xl font-bold text-white">{lesson.title}</h2>
                </div>
            </div>

            {/* Content */}
            <div className="p-8">
                {/* Video Placeholder (if applicable) */}
                {lesson.videoUrl && (
                    <div className="aspect-video bg-black/40 rounded-xl mb-8 flex items-center justify-center border border-white/5 group cursor-pointer hover:border-blue-500/50 transition-colors relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-60" />
                        <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(37,99,235,0.3)] group-hover:scale-110 transition-transform z-10">
                            <Play size={24} className="text-white ml-1" fill="currentColor" />
                        </div>
                        <span className="absolute bottom-4 left-4 text-white font-medium z-10">
                            Watch Lesson Video
                        </span>
                    </div>
                )}

                {/* Text Content */}
                <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed space-y-4">
                    {lesson.content.split('\n').map((paragraph, idx) => (
                        <p key={idx}>{paragraph}</p>
                    ))}
                </div>

                {/* Action Bar */}
                <div className="mt-12 pt-8 border-t border-white/10 flex flex-col gap-6">
                    <div className="flex items-center gap-4">
                        {isCompleted ? (
                            <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 px-4 py-2 rounded-full font-medium">
                                <CheckCircle size={18} /> Lesson Completed
                            </div>
                        ) : (
                            <div className="text-gray-500 text-sm">
                                Read/watch to complete this lesson
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        {!isCompleted && (
                            <button
                                onClick={onComplete}
                                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] flex items-center gap-2"
                            >
                                <CheckCircle size={18} /> Mark as Complete
                            </button>
                        )}

                        {lesson.quizId && (
                            <button
                                onClick={() => onStartQuiz(lesson.quizId!)}
                                className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(147,51,234,0.3)] hover:shadow-[0_0_30px_rgba(147,51,234,0.5)] flex items-center gap-2"
                            >
                                <Award size={18} /> Take Quiz
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
