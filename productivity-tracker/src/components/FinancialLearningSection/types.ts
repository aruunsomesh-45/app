export type TrackType = 'startup' | 'stocks';

export interface Lesson {
    id: string;
    title: string;
    type: 'text' | 'video' | 'quiz';
    content: string; // Markdown content
    duration: string;
    videoUrl?: string; // Optional video URL
    quizId?: string; // Optional linked quiz
}

export interface QuizQuestion {
    id: string;
    text: string;
    options: string[];
    correctOptionIndex: number;
    explanation?: string;
}

export interface QuizData {
    id: string;
    title: string;
    moduleId: string;
    questions: QuizQuestion[];
    rewardXp?: number;
}

export interface Module {
    id: string;
    track?: TrackType;
    title: string;
    description: string;
    order?: number;
    lessons: Lesson[];
    quiz?: QuizData;
}

export interface FinancialLearningProgress {
    currentTrack: TrackType;
    unlockedModules: string[]; // Module IDs
    completedLessons: string[]; // Lesson IDs
    quizScores: Record<string, number>; // quizId -> score percentage
    totalXp: number;
    streak: number;
    lastActiveDate: string | null;
}
