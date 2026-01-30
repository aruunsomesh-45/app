export interface Exercise {
    id: string;
    name: string;
    muscle: string;
    image: string;
    sets: { id: number; weight: number; reps: number; completed: boolean }[];
    description?: string;
}

// Session Summary Types
export type FatigueStatus = 'low' | 'moderate' | 'high';
export type EffortLevel = 1 | 2 | 3 | 4 | 5;

export interface SessionSummary {
    workoutId: string;
    date: string;
    totalVolume: number; // sets × reps × weight
    effortLevel: EffortLevel;
    fatigueStatus: FatigueStatus;
    duration: number; // in minutes
    exercisesCompleted: number;
    notes?: string;
}

export interface InjuryNote {
    id: string;
    workoutId: string;
    bodyPart: string;
    painLevel: 1 | 2 | 3 | 4 | 5; // 1 = mild, 5 = severe
    description: string;
    date: string;
    isActive: boolean;
}

export interface NextSessionRecommendation {
    workoutId: string;
    recommendation: 'increase' | 'maintain' | 'decrease';
    percentageChange: number;
    reason: string;
    deloadRecommended: boolean;
}

// Calculate total volume from exercises
export const calculateTotalVolume = (exercises: Exercise[]): number => {
    return exercises.reduce((total, exercise) => {
        const exerciseVolume = exercise.sets.reduce((setTotal, set) => {
            if (set.completed) {
                return setTotal + (set.weight * set.reps);
            }
            return setTotal;
        }, 0);
        return total + exerciseVolume;
    }, 0);
};

// Save session summary
export const saveSessionSummary = (summary: SessionSummary): void => {
    try {
        const key = `session_summaries_${summary.workoutId}`;
        const existing = localStorage.getItem(key);
        const summaries: SessionSummary[] = existing ? JSON.parse(existing) : [];
        summaries.push(summary);
        // Keep only last 30 sessions
        const trimmed = summaries.slice(-30);
        localStorage.setItem(key, JSON.stringify(trimmed));
    } catch (e) {
        console.error("Failed to save session summary", e);
    }
};

// Get session summaries for a workout
export const getSessionSummaries = (workoutId: string): SessionSummary[] => {
    try {
        const key = `session_summaries_${workoutId}`;
        const existing = localStorage.getItem(key);
        return existing ? JSON.parse(existing) : [];
    } catch (e) {
        console.error("Failed to load session summaries", e);
        return [];
    }
};

// Get the last session summary
export const getLastSessionSummary = (workoutId: string): SessionSummary | null => {
    const summaries = getSessionSummaries(workoutId);
    return summaries.length > 0 ? summaries[summaries.length - 1] : null;
};

// Save injury note
export const saveInjuryNote = (note: InjuryNote): void => {
    try {
        const key = 'injury_notes';
        const existing = localStorage.getItem(key);
        const notes: InjuryNote[] = existing ? JSON.parse(existing) : [];
        const index = notes.findIndex(n => n.id === note.id);
        if (index >= 0) {
            notes[index] = note;
        } else {
            notes.push(note);
        }
        localStorage.setItem(key, JSON.stringify(notes));
    } catch (e) {
        console.error("Failed to save injury note", e);
    }
};

// Get all injury notes
export const getInjuryNotes = (): InjuryNote[] => {
    try {
        const key = 'injury_notes';
        const existing = localStorage.getItem(key);
        return existing ? JSON.parse(existing) : [];
    } catch (e) {
        console.error("Failed to load injury notes", e);
        return [];
    }
};

// Get active injury notes for a workout
export const getActiveInjuryNotes = (workoutId?: string): InjuryNote[] => {
    const notes = getInjuryNotes();
    return notes.filter(n => n.isActive && (!workoutId || n.workoutId === workoutId));
};

// Delete injury note
export const deleteInjuryNote = (noteId: string): void => {
    try {
        const key = 'injury_notes';
        const existing = localStorage.getItem(key);
        const notes: InjuryNote[] = existing ? JSON.parse(existing) : [];
        const filtered = notes.filter(n => n.id !== noteId);
        localStorage.setItem(key, JSON.stringify(filtered));
    } catch (e) {
        console.error("Failed to delete injury note", e);
    }
};

// Generate next session recommendation based on fatigue history
export const generateRecommendation = (workoutId: string): NextSessionRecommendation => {
    const summaries = getSessionSummaries(workoutId);
    const recentSummaries = summaries.slice(-3); // Look at last 3 sessions

    const defaultRec: NextSessionRecommendation = {
        workoutId,
        recommendation: 'maintain',
        percentageChange: 0,
        reason: 'No previous session data available',
        deloadRecommended: false
    };

    if (recentSummaries.length === 0) {
        return defaultRec;
    }

    const lastSession = recentSummaries[recentSummaries.length - 1];
    const highFatigueCount = recentSummaries.filter(s => s.fatigueStatus === 'high').length;
    const activeInjuries = getActiveInjuryNotes(workoutId);

    // Check for deload condition: 2+ high fatigue sessions in a row
    if (highFatigueCount >= 2) {
        return {
            workoutId,
            recommendation: 'decrease',
            percentageChange: -15,
            reason: 'High fatigue detected in multiple sessions. Deload recommended.',
            deloadRecommended: true
        };
    }

    // Check for active injuries
    if (activeInjuries.length > 0) {
        const severeInjury = activeInjuries.some(i => i.painLevel >= 4);
        if (severeInjury) {
            return {
                workoutId,
                recommendation: 'decrease',
                percentageChange: -20,
                reason: `⚠️ Active injury reported. Reduce intensity to prevent aggravation.`,
                deloadRecommended: true
            };
        }
        return {
            workoutId,
            recommendation: 'maintain',
            percentageChange: 0,
            reason: `⚠️ Minor injury noted. Maintain current weights and monitor.`,
            deloadRecommended: false
        };
    }

    // Normal progression logic
    if (lastSession.fatigueStatus === 'low' && lastSession.effortLevel <= 3) {
        return {
            workoutId,
            recommendation: 'increase',
            percentageChange: 5,
            reason: 'Low fatigue and effort. Ready for progressive overload!',
            deloadRecommended: false
        };
    }

    if (lastSession.fatigueStatus === 'high') {
        return {
            workoutId,
            recommendation: 'decrease',
            percentageChange: -10,
            reason: 'High fatigue from last session. Consider reducing weight.',
            deloadRecommended: false
        };
    }

    return {
        workoutId,
        recommendation: 'maintain',
        percentageChange: 0,
        reason: 'Moderate fatigue. Maintain current intensity.',
        deloadRecommended: false
    };
};

// Body parts for injury tracking
export const BODY_PARTS = [
    'Neck', 'Shoulder (Left)', 'Shoulder (Right)', 'Upper Back',
    'Lower Back', 'Chest', 'Bicep (Left)', 'Bicep (Right)',
    'Tricep (Left)', 'Tricep (Right)', 'Forearm (Left)', 'Forearm (Right)',
    'Wrist (Left)', 'Wrist (Right)', 'Hip (Left)', 'Hip (Right)',
    'Quad (Left)', 'Quad (Right)', 'Hamstring (Left)', 'Hamstring (Right)',
    'Knee (Left)', 'Knee (Right)', 'Calf (Left)', 'Calf (Right)',
    'Ankle (Left)', 'Ankle (Right)', 'Core/Abs'
];

export const saveCustomExercise = (workoutName: string, exercise: Exercise) => {
    try {
        const key = `custom_exercises_${workoutName}`;
        const existing = localStorage.getItem(key);
        const exercises = existing ? JSON.parse(existing) : [];
        exercises.push(exercise);
        localStorage.setItem(key, JSON.stringify(exercises));
    } catch (e) {
        console.error("Failed to save exercise", e);
        throw e;
    }
};

export const getCustomExercises = (workoutName: string): Exercise[] => {
    try {
        const key = `custom_exercises_${workoutName}`;
        const existing = localStorage.getItem(key);
        return existing ? JSON.parse(existing) : [];
    } catch (e) {
        console.error("Failed to load exercises", e);
        return [];
    }
};
export const saveCategoryOverride = (id: string, data: { img?: string; title?: string }) => {
    try {
        const key = `category_override_${id}`;
        const existing = localStorage.getItem(key);
        const current = existing ? JSON.parse(existing) : {};
        localStorage.setItem(key, JSON.stringify({ ...current, ...data }));
    } catch (e) {
        console.error("Failed to save category override", e);
    }
};

export const getCategoryOverride = (id: string): { img?: string; title?: string } | null => {
    try {
        const key = `category_override_${id}`;
        const existing = localStorage.getItem(key);
        return existing ? JSON.parse(existing) : null;
    } catch (e) {
        console.error("Failed to load category override", e);
        return null;
    }
};
