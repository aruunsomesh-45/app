import React from 'react';
import { Lock, PlayCircle, CheckCircle, BookOpen } from 'lucide-react';
import type { Module } from './types';

interface ModuleListProps {
    modules: Module[];
    unlockedModuleIds: string[];
    completedLessonIds: string[];
    onSelectLesson: (moduleId: string, lessonId: string) => void;
}

export const ModuleList: React.FC<ModuleListProps> = ({
    modules,
    unlockedModuleIds,
    completedLessonIds,
    onSelectLesson
}) => {
    return (
        <div className="space-y-6">
            {modules.map((module, index) => {
                const isUnlocked = unlockedModuleIds.includes(module.id);
                const completedCount = module.lessons.filter(l => completedLessonIds.includes(l.id)).length;
                const progress = Math.round((completedCount / module.lessons.length) * 100);

                return (
                    <div
                        key={module.id}
                        className={`rounded-xl border transition-all duration-300 overflow-hidden
              ${isUnlocked
                                ? 'bg-white/5 border-white/10'
                                : 'bg-black/20 border-white/5 opacity-75'
                            }`}
                    >
                        {/* Module Header */}
                        <div className="p-6 border-b border-white/5 flex items-start justify-between gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-xs font-bold tracking-wider text-gray-500 uppercase">
                                        Module {index + 1}
                                    </span>
                                    {isUnlocked ? (
                                        <span className="bg-emerald-500/10 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full font-medium">
                                            {progress === 100 ? 'COMPLETED' : 'IN PROGRESS'}
                                        </span>
                                    ) : (
                                        <span className="bg-white/5 text-gray-500 text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                                            <Lock size={10} /> LOCKED
                                        </span>
                                    )}
                                </div>
                                <h3 className={`text-xl font-bold mb-1 ${isUnlocked ? 'text-white' : 'text-gray-500'}`}>
                                    {module.title}
                                </h3>
                                <p className="text-gray-400 text-sm">{module.description}</p>
                            </div>

                            {/* Progress Circle (Mini) */}
                            {isUnlocked && (
                                <div className="relative w-12 h-12 flex items-center justify-center">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle
                                            cx="24" cy="24" r="20"
                                            className="text-white/10 stroke-current"
                                            strokeWidth="4"
                                            fill="none"
                                        />
                                        <circle
                                            cx="24" cy="24" r="20"
                                            className="text-blue-500 stroke-current"
                                            strokeWidth="4"
                                            fill="none"
                                            strokeDasharray={126}
                                            strokeDashoffset={126 - (126 * progress) / 100}
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                    <span className="absolute text-[10px] font-bold text-white">{progress}%</span>
                                </div>
                            )}
                        </div>

                        {/* Lessons List */}
                        {isUnlocked && (
                            <div className="divide-y divide-white/5">
                                {module.lessons.map((lesson) => {
                                    const isCompleted = completedLessonIds.includes(lesson.id);

                                    return (
                                        <div
                                            key={lesson.id}
                                            onClick={() => onSelectLesson(module.id, lesson.id)}
                                            className="p-4 flex items-center gap-4 hover:bg-white/5 cursor-pointer transition-colors group"
                                        >
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0
                        ${isCompleted ? 'bg-emerald-500 text-white' : 'bg-white/10 text-gray-400 group-hover:bg-blue-500 group-hover:text-white transition-colors'}`}>
                                                {isCompleted ? <CheckCircle size={16} /> : <PlayCircle size={16} />}
                                            </div>

                                            <div className="flex-1">
                                                <div className="text-white font-medium group-hover:text-blue-400 transition-colors">
                                                    {lesson.title}
                                                </div>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className="text-xs text-gray-500 flex items-center gap-1">
                                                        <BookOpen size={12} /> {lesson.type.toUpperCase()}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        {lesson.duration}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};
