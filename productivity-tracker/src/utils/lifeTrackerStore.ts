// LifeTracker Central Data Store
// Manages all life systems data with localStorage persistence

// Types
export interface MeditationSession {
    id: string;
    date: string;
    duration: number; // in minutes
    type: 'guided' | 'unguided' | 'breathing' | 'body-scan';
    category?: string;
    moodBefore: number; // 1-5
    moodAfter: number; // 1-5
    mentalClarity?: number; // 1-5
    stressTriggers?: string;
    consistencyRating?: boolean;
    qualityRating?: number; // 1-5
    focusDrops?: number;
    note?: string;
    createdAt: string;
}

export interface ReadingSession {
    id: string;
    bookId: string;
    date: string;
    pagesRead: number;
    startPage: number;
    endPage: number;
    note?: string;
    createdAt: string;
}

export interface Book {
    id: string;
    title: string;
    author: string;
    totalPages: number;
    currentPage: number;
    status: 'reading' | 'completed' | 'paused';
    coverColor: string;
    startedAt: string;
    completedAt?: string;
    folderId?: string; // Which folder this book belongs to
    pdfFileName?: string; // Uploaded PDF file name
    pdfFileSize?: number; // PDF file size in bytes
    pdfDataUrl?: string; // PDF file content as data URL
    pdfCoverImage?: string; // Extracted first page as image data URL (deprecated - use coverImage)
    coverImage?: string; // Manually uploaded cover image (preferred)
    description?: string; // Book description/notes
}

export interface DailyTask {
    id: string;
    title: string;
    category: 'physical' | 'mental' | 'work' | 'personal';
    completed: boolean;
    date: string;
    createdAt: string;
}

export interface WeeklyGoal {
    id: string;
    title: string;
    systemId: string;
    progress: number; // 0-100
    weekStart: string;
    completed: boolean;
}

export interface LifeNote {
    id: string;
    content: string;
    linkedSystem?: 'workout' | 'meditation' | 'reading' | 'general';
    linkedSessionId?: string;
    mood?: number;
    tags: string[];
    date: string;
    createdAt: string;
}

export interface StreakData {
    systemId: string;
    currentStreak: number;
    longestStreak: number;
    lastActivityDate: string;
}

export interface ReadingFolder {
    id: string;
    name: string;
    description?: string;
    color?: string;
    icon?: string;
    bookIds: string[];
    createdAt: string;
}

// ==================== BOOK INSIGHTS TYPES ====================
export interface CoreIdea {
    id: string;
    content: string;
    linkedQuotes: string[]; // IDs of linked quotes
}

export interface ActionTakeaway {
    id: string;
    action: string;
    completed: boolean;
    linkedQuotes: string[]; // IDs of linked quotes
}

export interface BeliefChange {
    id: string;
    beliefBefore: string;
    beliefAfter: string;
    linkedQuotes: string[]; // IDs of linked quotes
}

export interface BookQuote {
    id: string;
    content: string;
    page?: number;
    note?: string;
}

export interface RevisitReminder {
    id: string;
    reminderDate: string; // ISO date string
    prompt: string;
    completed: boolean;
}

export interface BookInsight {
    id: string;
    bookId: string;
    coreIdeas: CoreIdea[];
    actionTakeaways: ActionTakeaway[];
    beliefChanges: BeliefChange[];
    quotes: BookQuote[];
    revisitReminders: RevisitReminder[];
    finalSummary: string;
    createdAt: string;
    updatedAt: string;
}

// ==================== CODING TYPES ====================
export interface CodingLearningWeek {
    id: string;
    weekNumber: number;
    weekRange: string;
    topics: string[];
    resources: { title: string, url: string }[];
    status: 'pending' | 'in-progress' | 'completed';
}

export interface CodingLearningPath {
    id: string;
    title: 'Full Stack' | 'Data Science' | 'DevOps';
    weeks: CodingLearningWeek[];
}

export interface DSAProblem {
    id: string;
    title: string;
    difficulty: 'easy' | 'medium' | 'hard';
    category: 'DSA' | 'CS Core' | 'System Design';
    notes?: string;
    learnings?: string;
    status: 'pending' | 'solved' | 'review';
    link?: string;
    dateSolved?: string;
}

export interface CSNote {
    id: string;
    title: string;
    category: 'CS Core' | 'System Design';
    content: string;
    tags: string[];
    updatedAt: string;
}

export interface VideoResource {
    id: string;
    title: string;
    description: string;
    url: string;
    domain: string;
    tags: string[];
}

export interface CodingProject {
    id: string;
    title: string;
    objective: string;
    techStack: string[];
    description: string;
    outcomes: string[];
    links: { type: 'GitHub' | 'Blog' | 'Docs' | 'YouTube', title: string, url: string }[];
    notes?: {
        learnings: string;
        blockers: string;
        improvements: string;
    };
    status: 'planning' | 'in-progress' | 'completed';
    updatedAt: string;
}

export interface DebugLog {
    id: string;
    issue: string;
    solution: string;
    tags: string[];
    date: string;
}
export interface SkillErrorPattern {
    id: string;
    description: string;
    frequency: number;
    lastOccurred: string;
}

export interface SkillMastery {
    id: string;
    name: string;
    category: string;
    depthRating: number; // 1-5
    linkedProjects: {
        projectId: string;
        projectTitle: string;
        depth: 'toy' | 'partial' | 'production';
    }[];
    readiness: 'not-ready' | 'can-explain' | 'can-defend';
    lastRevised: string;
    nextRevision: string;
    revisionHistory: string[];
    errorPatterns: SkillErrorPattern[];
    createdAt: string;
    updatedAt: string;
}

// ==================== BRANDING TYPES ====================
export type ContentIntent = 'Authority' | 'Trust' | 'Relatability' | 'Teaching' | 'Lead Generation';

export interface ExpertisePillar {
    id: string;
    text: string;
}

export interface BrandingPositioning {
    coreThemes: ExpertisePillar[];
    knownFor: string;
    antiThemes: string[];
    intent: string;
    comparisonMapping: {
        competitorName: string;
        theirDepth: string;
        myDifferentiation: string;
    }[];
}

export interface AudienceIntelligence {
    topSegments: string[];
    recurringPainPoints: string[];
    repeatedQuestions: string[];
}

export interface Platform {
    id: string;
    name: string;
    goal: string;
    format: string;
    frequency: string;
    effort: number;
}

export interface BrandConsistencyScore {
    id: string;
    date: string; // ISO date
    voiceAdherence: number; // 1-10
    postingRhythm: number; // 1-10
    repetitionStrength: number; // 1-10
    notes?: string;
}

export interface BrandingContentItem {
    id: string;
    title: string;
    body: string;
    platformIds: string[];
    pillarId: string;
    intent: ContentIntent;
    conversionPath: 'Newsletter' | 'Lead' | 'Teaching Asset' | 'None';
    status: 'idea' | 'draft' | 'published';
    analysis?: string;
    createdAt: string;
}

export interface PersonalBrandingSystem {
    positioning: BrandingPositioning;
    audienceIntelligence: AudienceIntelligence;
    consistencyScores: BrandConsistencyScore[];
    contentItems: BrandingContentItem[];
    platforms: Platform[];
    lastUpdated: string;
}

// ==================== NETWORKING TYPES ====================
export type NetworkingOutcomeType = 'Freelancing Lead' | 'Job Referral' | 'Collaboration' | 'Audience Growth' | 'Other';

export interface ConnectionOutcome {
    id: string;
    type: NetworkingOutcomeType;
    description: string;
    value?: string;
    date: string;
}

export interface RelationshipRetrospective {
    id: string;
    date: string;
    worked: string;
    forced: string;
    nextTime: string;
}

export interface NetworkingConnection {
    id: string;
    name: string;
    platform?: string;
    link?: string;
    trustScore: number; // 1-10
    responsivenessScore: number; // 1-10
    mutualValueScore: number; // 1-10
    contextNotes: string;
    starters: string[];
    dmTemplates: string[];
    outcomes: ConnectionOutcome[];
    retrospectives: RelationshipRetrospective[];
    status: 'active' | 'nurturing' | 'dormant' | 'lead';
    lastInteraction: string;
    createdAt: string;
}

export interface NetworkingSystem {
    connections: NetworkingConnection[];
    reusableAssets: {
        starters: string[];
        templates: { id: string, title: string, content: string }[];
    };
    lastUpdated: string;
}

export interface UserProfile {
    firstName: string;
    avatar?: string;
}

export interface LifeTrackerState {
    // Meditation
    meditationSessions: MeditationSession[];
    meditationStreak: StreakData;

    // Reading
    books: Book[];
    folders: ReadingFolder[];
    readingSessions: ReadingSession[];
    readingStreak: StreakData;
    bookInsights: BookInsight[];

    // Tasks
    dailyTasks: DailyTask[];
    weeklyGoals: WeeklyGoal[];

    // Notes
    notes: LifeNote[];

    // Coding
    codingLearningPaths: CodingLearningPath[];
    dsaProblems: DSAProblem[];
    csNotes: CSNote[];
    videoResources: VideoResource[];
    codingProjects: CodingProject[];
    debugLogs: DebugLog[];
    skillMastery: SkillMastery[];
    codingStreak: StreakData;

    // Branding
    branding: PersonalBrandingSystem;

    // Networking
    networking: NetworkingSystem;

    // Dashboard / Profile
    dailyFocus: string;
    lastDailyFocusDate: string;
    userProfile: UserProfile;
}

// Initial State
const getInitialState = (): LifeTrackerState => ({
    meditationSessions: [],
    meditationStreak: { systemId: 'meditation', currentStreak: 0, longestStreak: 0, lastActivityDate: '' },
    books: [],
    folders: [],
    readingSessions: [],
    readingStreak: { systemId: 'reading', currentStreak: 0, longestStreak: 0, lastActivityDate: '' },
    bookInsights: [],
    dailyTasks: [],
    weeklyGoals: [],
    notes: [],
    codingLearningPaths: [
        { id: 'fs', title: 'Full Stack', weeks: [] },
        { id: 'ds', title: 'Data Science', weeks: [] },
        { id: 'do', title: 'DevOps', weeks: [] }
    ],
    dsaProblems: [],
    csNotes: [],
    videoResources: [],
    codingProjects: [],
    debugLogs: [],
    skillMastery: [],
    codingStreak: { systemId: 'coding', currentStreak: 0, longestStreak: 0, lastActivityDate: '' },
    branding: {
        positioning: {
            coreThemes: [],
            knownFor: '',
            antiThemes: [],
            intent: '',
            comparisonMapping: []
        },
        audienceIntelligence: {
            topSegments: [],
            recurringPainPoints: [],
            repeatedQuestions: []
        },
        consistencyScores: [],
        contentItems: [],
        platforms: [],
        lastUpdated: new Date().toISOString()
    },
    networking: {
        connections: [],
        reusableAssets: {
            starters: [],
            templates: []
        },
        lastUpdated: new Date().toISOString()
    },
    dailyFocus: '',
    lastDailyFocusDate: '',
    userProfile: { firstName: 'Developer' },
});

// Storage Key
const STORAGE_KEY = 'lifetracker_data';

// Helper Functions
const generateId = (): string => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

const getToday = (): string => {
    return new Date().toISOString().split('T')[0];
};

const getWeekStart = (): string => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(now.setDate(diff)).toISOString().split('T')[0];
};

const isConsecutiveDay = (lastDate: string): boolean => {
    if (!lastDate) return false;
    const last = new Date(lastDate);
    const today = new Date(getToday());
    const diffTime = today.getTime() - last.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays === 1;
};

const isSameDay = (date1: string, date2: string): boolean => {
    return date1 === date2;
};

// Store Class
export class LifeTrackerStore {
    private state: LifeTrackerState;
    private listeners: Set<() => void> = new Set();

    constructor() {
        this.state = this.loadFromStorage();
    }

    private loadFromStorage(): LifeTrackerState {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                return { ...getInitialState(), ...JSON.parse(stored) };
            }
        } catch (e) {
            console.error('Failed to load LifeTracker data:', e);
        }
        return getInitialState();
    }

    private saveToStorage(): void {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
        } catch (e) {
            console.error('Failed to save LifeTracker data:', e);
        }
    }

    private notify(): void {
        this.listeners.forEach(listener => listener());
    }

    subscribe(listener: () => void): () => void {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    getState(): LifeTrackerState {
        return this.state;
    }

    // ==================== MEDITATION ====================

    addMeditationSession(session: Omit<MeditationSession, 'id' | 'createdAt'>): MeditationSession {
        const newSession: MeditationSession = {
            ...session,
            id: generateId(),
            createdAt: new Date().toISOString(),
        };

        this.state.meditationSessions = [newSession, ...this.state.meditationSessions];
        this.updateMeditationStreak(session.date);
        this.saveToStorage();
        this.notify();
        return newSession;
    }

    private updateMeditationStreak(activityDate: string): void {
        const streak = this.state.meditationStreak;
        const today = getToday();

        if (isSameDay(activityDate, today)) {
            if (isSameDay(streak.lastActivityDate, today)) {
                // Already logged today, no change
                return;
            } else if (isConsecutiveDay(streak.lastActivityDate)) {
                // Consecutive day, increment streak
                streak.currentStreak += 1;
            } else {
                // Streak broken, start new
                streak.currentStreak = 1;
            }
            streak.lastActivityDate = today;
            streak.longestStreak = Math.max(streak.longestStreak, streak.currentStreak);
        }
    }

    getMeditationStats() {
        const sessions = this.state.meditationSessions;
        const today = getToday();
        const weekStart = getWeekStart();

        const todaySessions = sessions.filter(s => s.date === today);
        const weekSessions = sessions.filter(s => s.date >= weekStart);

        const totalMinutesThisWeek = weekSessions.reduce((sum, s) => sum + s.duration, 0);
        const avgMoodImprovement = sessions.length > 0
            ? sessions.reduce((sum, s) => sum + (s.moodAfter - s.moodBefore), 0) / sessions.length
            : 0;

        return {
            todayCompleted: todaySessions.length > 0,
            todayMinutes: todaySessions.reduce((sum, s) => sum + s.duration, 0),
            weekMinutes: totalMinutesThisWeek,
            totalSessions: sessions.length,
            avgMoodImprovement: avgMoodImprovement.toFixed(1),
            streak: this.state.meditationStreak.currentStreak,
            longestStreak: this.state.meditationStreak.longestStreak,
        };
    }

    // ==================== READING ====================

    addBook(book: Omit<Book, 'id' | 'startedAt' | 'status' | 'currentPage'>): Book {
        const newBook: Book = {
            ...book,
            id: generateId(),
            currentPage: 0,
            status: 'reading',
            startedAt: new Date().toISOString(),
        };

        this.state.books = [newBook, ...this.state.books];
        this.saveToStorage();
        this.notify();
        return newBook;
    }

    updateBook(bookId: string, updates: Partial<Book>): void {
        this.state.books = this.state.books.map(book =>
            book.id === bookId ? { ...book, ...updates } : book
        );
        this.saveToStorage();
        this.notify();
    }

    addReadingSession(session: Omit<ReadingSession, 'id' | 'createdAt'>): ReadingSession {
        const newSession: ReadingSession = {
            ...session,
            id: generateId(),
            createdAt: new Date().toISOString(),
        };

        this.state.readingSessions = [newSession, ...this.state.readingSessions];

        // Update book progress
        const book = this.state.books.find(b => b.id === session.bookId);
        if (book) {
            book.currentPage = Math.max(book.currentPage, session.endPage);
            if (book.currentPage >= book.totalPages) {
                book.status = 'completed';
                book.completedAt = new Date().toISOString();
            }
        }

        this.updateReadingStreak(session.date);
        this.saveToStorage();
        this.notify();
        return newSession;
    }

    private updateReadingStreak(activityDate: string): void {
        const streak = this.state.readingStreak;
        const today = getToday();

        if (isSameDay(activityDate, today)) {
            if (isSameDay(streak.lastActivityDate, today)) {
                return;
            } else if (isConsecutiveDay(streak.lastActivityDate)) {
                streak.currentStreak += 1;
            } else {
                streak.currentStreak = 1;
            }
            streak.lastActivityDate = today;
            streak.longestStreak = Math.max(streak.longestStreak, streak.currentStreak);
        }
    }

    addFolder(folder: Omit<ReadingFolder, 'id' | 'createdAt' | 'bookIds'>): ReadingFolder {
        const newFolder: ReadingFolder = {
            ...folder,
            id: generateId(),
            bookIds: [],
            createdAt: new Date().toISOString(),
        };
        this.state.folders = [newFolder, ...this.state.folders];
        this.saveToStorage();
        this.notify();
        return newFolder;
    }

    getFolders(): ReadingFolder[] {
        return this.state.folders;
    }

    updateFolder(folderId: string, updates: Partial<ReadingFolder>): void {
        this.state.folders = this.state.folders.map(folder =>
            folder.id === folderId ? { ...folder, ...updates } : folder
        );
        this.saveToStorage();
        this.notify();
    }

    deleteFolder(folderId: string): void {
        // Also delete all books in this folder
        this.state.books = this.state.books.filter(book => book.folderId !== folderId);
        this.state.folders = this.state.folders.filter(folder => folder.id !== folderId);
        this.saveToStorage();
        this.notify();
    }

    getBooksInFolder(folderId: string): Book[] {
        return this.state.books.filter(book => book.folderId === folderId);
    }

    addBookToFolder(folderId: string, book: Omit<Book, 'id' | 'startedAt' | 'status' | 'currentPage' | 'folderId'>): Book {
        const newBook: Book = {
            ...book,
            id: generateId(),
            currentPage: 0,
            status: 'reading',
            startedAt: new Date().toISOString(),
            folderId: folderId,
        };

        // Add book ID to folder's bookIds array
        this.state.folders = this.state.folders.map(folder =>
            folder.id === folderId
                ? { ...folder, bookIds: [...folder.bookIds, newBook.id] }
                : folder
        );

        this.state.books = [newBook, ...this.state.books];
        this.saveToStorage();
        this.notify();
        return newBook;
    }

    uploadPdfToBook(bookId: string, fileName: string, fileSize: number, pdfDataUrl: string, pdfCoverImage?: string): void {
        this.state.books = this.state.books.map(book =>
            book.id === bookId
                ? { ...book, pdfFileName: fileName, pdfFileSize: fileSize, pdfDataUrl, pdfCoverImage }
                : book
        );
        this.saveToStorage();
        this.notify();
    }

    deleteBook(bookId: string): void {
        // Remove book from folder's bookIds
        const book = this.state.books.find(b => b.id === bookId);
        if (book?.folderId) {
            this.state.folders = this.state.folders.map(folder =>
                folder.id === book.folderId
                    ? { ...folder, bookIds: folder.bookIds.filter(id => id !== bookId) }
                    : folder
            );
        }

        // Remove all reading sessions for this book
        this.state.readingSessions = this.state.readingSessions.filter(session => session.bookId !== bookId);

        // Remove the book
        this.state.books = this.state.books.filter(b => b.id !== bookId);
        this.saveToStorage();
        this.notify();
    }

    updateBookCover(bookId: string, coverImageDataUrl: string): void {
        this.state.books = this.state.books.map(book =>
            book.id === bookId
                ? { ...book, coverImage: coverImageDataUrl }
                : book
        );
        this.saveToStorage();
        this.notify();
    }

    getReadingStats() {
        const books = this.state.books;
        const sessions = this.state.readingSessions;
        const today = getToday();
        const weekStart = getWeekStart();

        const weekSessions = sessions.filter(s => s.date >= weekStart);
        const pagesThisWeek = weekSessions.reduce((sum, s) => sum + s.pagesRead, 0);

        // Calculate overall progress across all active books
        const activeBooks = books.filter(b => b.status === 'reading');
        const totalProgress = activeBooks.length > 0
            ? activeBooks.reduce((acc, b) => acc + (b.currentPage / b.totalPages), 0) / activeBooks.length
            : 0;

        return {
            todayCompleted: sessions.some(s => s.date === today),
            pagesThisWeek,
            booksInProgress: activeBooks.length,
            booksCompleted: books.filter(b => b.status === 'completed').length,
            streak: this.state.readingStreak.currentStreak,
            longestStreak: this.state.readingStreak.longestStreak,
            overallProgress: Math.round(totalProgress * 100),
            totalActiveFolders: this.state.folders.length,
            lastOpenedBook: books.sort((a, b) => b.startedAt.localeCompare(a.startedAt))[0] || null
        };
    }

    getBooks(): Book[] {
        return this.state.books;
    }

    // ==================== BOOK INSIGHTS ====================

    saveBookInsight(insight: Omit<BookInsight, 'id' | 'createdAt' | 'updatedAt'>): BookInsight {
        const existingIndex = this.state.bookInsights.findIndex(i => i.bookId === insight.bookId);
        const now = new Date().toISOString();

        if (existingIndex >= 0) {
            // Update existing insight
            const existingInsight = this.state.bookInsights[existingIndex];
            const updatedInsight: BookInsight = {
                ...existingInsight,
                ...insight,
                updatedAt: now,
            };
            this.state.bookInsights[existingIndex] = updatedInsight;
            this.saveToStorage();
            this.notify();
            return updatedInsight;
        } else {
            // Create new insight
            const newInsight: BookInsight = {
                ...insight,
                id: generateId(),
                createdAt: now,
                updatedAt: now,
            };
            this.state.bookInsights = [newInsight, ...this.state.bookInsights];
            this.saveToStorage();
            this.notify();
            return newInsight;
        }
    }

    getBookInsight(bookId: string): BookInsight | undefined {
        return this.state.bookInsights.find(i => i.bookId === bookId);
    }

    getAllBookInsights(): BookInsight[] {
        return this.state.bookInsights;
    }

    deleteBookInsight(bookId: string): void {
        this.state.bookInsights = this.state.bookInsights.filter(i => i.bookId !== bookId);
        this.saveToStorage();
        this.notify();
    }

    toggleActionTakeaway(bookId: string, actionId: string): void {
        const insight = this.state.bookInsights.find(i => i.bookId === bookId);
        if (insight) {
            insight.actionTakeaways = insight.actionTakeaways.map(a =>
                a.id === actionId ? { ...a, completed: !a.completed } : a
            );
            insight.updatedAt = new Date().toISOString();
            this.saveToStorage();
            this.notify();
        }
    }

    toggleRevisitReminder(bookId: string, reminderId: string): void {
        const insight = this.state.bookInsights.find(i => i.bookId === bookId);
        if (insight) {
            insight.revisitReminders = insight.revisitReminders.map(r =>
                r.id === reminderId ? { ...r, completed: !r.completed } : r
            );
            insight.updatedAt = new Date().toISOString();
            this.saveToStorage();
            this.notify();
        }
    }

    // ==================== TASKS ====================

    addDailyTask(task: Omit<DailyTask, 'id' | 'createdAt' | 'completed'>): DailyTask {
        const newTask: DailyTask = {
            ...task,
            id: generateId(),
            completed: false,
            createdAt: new Date().toISOString(),
        };

        this.state.dailyTasks = [newTask, ...this.state.dailyTasks];
        this.saveToStorage();
        this.notify();
        return newTask;
    }

    toggleTask(taskId: string): void {
        this.state.dailyTasks = this.state.dailyTasks.map(task =>
            task.id === taskId ? { ...task, completed: !task.completed } : task
        );
        this.saveToStorage();
        this.notify();
    }

    deleteTask(taskId: string): void {
        this.state.dailyTasks = this.state.dailyTasks.filter(task => task.id !== taskId);
        this.saveToStorage();
        this.notify();
    }

    getTodayTasks(): DailyTask[] {
        const today = getToday();
        return this.state.dailyTasks.filter(task => task.date === today);
    }

    // ==================== WEEKLY GOALS ====================

    addWeeklyGoal(goal: Omit<WeeklyGoal, 'id' | 'weekStart' | 'progress' | 'completed'>): WeeklyGoal {
        const newGoal: WeeklyGoal = {
            ...goal,
            id: generateId(),
            weekStart: getWeekStart(),
            progress: 0,
            completed: false,
        };

        this.state.weeklyGoals = [newGoal, ...this.state.weeklyGoals];
        this.saveToStorage();
        this.notify();
        return newGoal;
    }

    updateGoalProgress(goalId: string, progress: number): void {
        this.state.weeklyGoals = this.state.weeklyGoals.map(goal =>
            goal.id === goalId ? {
                ...goal,
                progress: Math.min(100, progress),
                completed: progress >= 100
            } : goal
        );
        this.saveToStorage();
        this.notify();
    }

    getCurrentWeekGoals(): WeeklyGoal[] {
        const weekStart = getWeekStart();
        return this.state.weeklyGoals.filter(goal => goal.weekStart === weekStart);
    }

    // ==================== NOTES ====================

    addNote(note: Omit<LifeNote, 'id' | 'createdAt'>): LifeNote {
        const newNote: LifeNote = {
            ...note,
            id: generateId(),
            createdAt: new Date().toISOString(),
        };

        this.state.notes = [newNote, ...this.state.notes];
        this.saveToStorage();
        this.notify();
        return newNote;
    }

    getNotes(limit?: number): LifeNote[] {
        const notes = this.state.notes;
        return limit ? notes.slice(0, limit) : notes;
    }

    getNotesForSystem(systemId: string): LifeNote[] {
        return this.state.notes.filter(note => note.linkedSystem === systemId);
    }

    // ==================== DAILY FOCUS ====================

    setDailyFocus(focus: string): void {
        this.state.dailyFocus = focus;
        this.state.lastDailyFocusDate = getToday();
        this.saveToStorage();
        this.notify();
    }

    getDailyFocus(): { focus: string; isToday: boolean } {
        const today = getToday();
        return {
            focus: this.state.dailyFocus,
            isToday: this.state.lastDailyFocusDate === today,
        };
    }

    // ==================== CODING ====================

    addCodingLearningWeek(pathId: string, week: Omit<CodingLearningWeek, 'id'>): CodingLearningWeek {
        const newWeek: CodingLearningWeek = { ...week, id: generateId() };
        this.state.codingLearningPaths = this.state.codingLearningPaths.map(path =>
            path.id === pathId ? { ...path, weeks: [...path.weeks, newWeek] } : path
        );
        this.updateCodingStreak(getToday());
        this.saveToStorage();
        this.notify();
        return newWeek;
    }

    updateCodingLearningWeek(pathId: string, weekId: string, updates: Partial<CodingLearningWeek>): void {
        this.state.codingLearningPaths = this.state.codingLearningPaths.map(path =>
            path.id === pathId
                ? {
                    ...path,
                    weeks: path.weeks.map(w => w.id === weekId ? { ...w, ...updates } : w)
                }
                : path
        );
        this.saveToStorage();
        this.notify();
    }

    addDSAProblem(problem: Omit<DSAProblem, 'id'>): DSAProblem {
        const dateSolved = problem.status === 'solved' ? getToday() : undefined;
        const newProblem: DSAProblem = { ...problem, id: generateId(), dateSolved };
        this.state.dsaProblems = [newProblem, ...this.state.dsaProblems];
        if (problem.status === 'solved') this.updateCodingStreak(getToday());
        this.saveToStorage();
        this.notify();
        return newProblem;
    }

    updateDSAProblem(problemId: string, updates: Partial<DSAProblem>): void {
        this.state.dsaProblems = this.state.dsaProblems.map(p => {
            if (p.id === problemId) {
                const dateSolved = updates.status === 'solved' ? getToday() : p.dateSolved;
                return { ...p, ...updates, dateSolved };
            }
            return p;
        });
        if (updates.status === 'solved') this.updateCodingStreak(getToday());
        this.saveToStorage();
        this.notify();
    }

    addCSNote(note: Omit<CSNote, 'id' | 'updatedAt'>): CSNote {
        const newNote: CSNote = { ...note, id: generateId(), updatedAt: new Date().toISOString() };
        this.state.csNotes = [newNote, ...this.state.csNotes];
        this.saveToStorage();
        this.notify();
        return newNote;
    }

    addVideoResource(resource: Omit<VideoResource, 'id'>): VideoResource {
        const newResource: VideoResource = { ...resource, id: generateId() };
        this.state.videoResources = [newResource, ...this.state.videoResources];
        this.saveToStorage();
        this.notify();
        return newResource;
    }

    addCodingProject(project: Omit<CodingProject, 'id' | 'updatedAt'>): CodingProject {
        const newProject: CodingProject = { ...project, id: generateId(), updatedAt: new Date().toISOString() };
        this.state.codingProjects = [newProject, ...this.state.codingProjects];
        this.saveToStorage();
        this.notify();
        return newProject;
    }

    updateCodingProject(projectId: string, updates: Partial<CodingProject>): void {
        this.state.codingProjects = this.state.codingProjects.map(p =>
            p.id === projectId ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
        );
        this.saveToStorage();
        this.notify();
    }

    addDebugLog(log: Omit<DebugLog, 'id' | 'date'>): DebugLog {
        const newLog: DebugLog = { ...log, id: generateId(), date: getToday() };
        this.state.debugLogs = [newLog, ...this.state.debugLogs];
        this.updateCodingStreak(getToday());
        this.saveToStorage();
        this.notify();
        return newLog;
    }

    addSkillMastery(skill: Omit<SkillMastery, 'id' | 'createdAt' | 'updatedAt'>): SkillMastery {
        const newSkill: SkillMastery = {
            ...skill,
            id: generateId(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        this.state.skillMastery = [newSkill, ...this.state.skillMastery];
        this.saveToStorage();
        this.notify();
        return newSkill;
    }

    updateSkillMastery(skillId: string, updates: Partial<SkillMastery>): void {
        this.state.skillMastery = this.state.skillMastery.map(s =>
            s.id === skillId ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s
        );
        this.saveToStorage();
        this.notify();
    }

    deleteSkillMastery(skillId: string): void {
        this.state.skillMastery = this.state.skillMastery.filter(s => s.id !== skillId);
        this.saveToStorage();
        this.notify();
    }

    addErrorPatternToSkill(skillId: string, pattern: Omit<SkillErrorPattern, 'id' | 'lastOccurred' | 'frequency'>): void {
        const newPattern: SkillErrorPattern = {
            ...pattern,
            id: generateId(),
            frequency: 1,
            lastOccurred: new Date().toISOString()
        };
        this.state.skillMastery = this.state.skillMastery.map(s =>
            s.id === skillId
                ? { ...s, errorPatterns: [newPattern, ...s.errorPatterns], updatedAt: new Date().toISOString() }
                : s
        );
        this.saveToStorage();
        this.notify();
    }

    private updateCodingStreak(activityDate: string): void {
        const streak = this.state.codingStreak;
        const today = getToday();

        if (isSameDay(activityDate, today)) {
            if (isSameDay(streak.lastActivityDate, today)) {
                return;
            } else if (isConsecutiveDay(streak.lastActivityDate)) {
                streak.currentStreak += 1;
            } else {
                streak.currentStreak = 1;
            }
            streak.lastActivityDate = today;
            streak.longestStreak = Math.max(streak.longestStreak, streak.currentStreak);
        }
    }

    getCodingStats() {
        const weekStart = getWeekStart();
        const problemsSolvedThisWeek = this.state.dsaProblems.filter(p =>
            p.status === 'solved' && p.dateSolved && p.dateSolved >= weekStart
        ).length;

        const projectsCompleted = this.state.codingProjects.filter(p => p.status === 'completed').length;

        return {
            problemsSolvedThisWeek,
            projectsCompleted,
            streak: this.state.codingStreak.currentStreak,
            longestStreak: this.state.codingStreak.longestStreak
        };
    }

    // ==================== BRANDING ====================

    updateBrandingPositioning(positioning: Partial<BrandingPositioning>): void {
        this.state.branding.positioning = { ...this.state.branding.positioning, ...positioning };
        this.state.branding.lastUpdated = new Date().toISOString();
        this.saveToStorage();
        this.notify();
    }

    updateAudienceIntelligence(audience: Partial<AudienceIntelligence>): void {
        this.state.branding.audienceIntelligence = { ...this.state.branding.audienceIntelligence, ...audience };
        this.state.branding.lastUpdated = new Date().toISOString();
        this.saveToStorage();
        this.notify();
    }

    addPlatform(platform: Omit<Platform, 'id'>): Platform {
        const newPlatform: Platform = {
            ...platform,
            id: generateId()
        };
        this.state.branding.platforms = [...this.state.branding.platforms, newPlatform];
        this.state.branding.lastUpdated = new Date().toISOString();
        this.saveToStorage();
        this.notify();
        return newPlatform;
    }

    deletePlatform(id: string): void {
        this.state.branding.platforms = this.state.branding.platforms.filter(p => p.id !== id);
        this.state.branding.lastUpdated = new Date().toISOString();
        this.saveToStorage();
        this.notify();
    }

    addCoreTheme(text: string): void {
        const newPillar: ExpertisePillar = {
            id: generateId(),
            text
        };
        this.state.branding.positioning.coreThemes = [...this.state.branding.positioning.coreThemes, newPillar];
        this.state.branding.lastUpdated = new Date().toISOString();
        this.saveToStorage();
        this.notify();
    }

    deleteCoreTheme(id: string): void {
        this.state.branding.positioning.coreThemes = this.state.branding.positioning.coreThemes.filter(t => t.id !== id);
        this.state.branding.lastUpdated = new Date().toISOString();
        this.saveToStorage();
        this.notify();
    }

    addBrandConsistencyScore(score: Omit<BrandConsistencyScore, 'id'>): BrandConsistencyScore {
        const newScore: BrandConsistencyScore = {
            ...score,
            id: generateId()
        };
        this.state.branding.consistencyScores = [newScore, ...this.state.branding.consistencyScores];
        this.state.branding.lastUpdated = new Date().toISOString();
        this.saveToStorage();
        this.notify();
        return newScore;
    }

    addBrandingContent(item: Omit<BrandingContentItem, 'id' | 'createdAt' | 'status'>): BrandingContentItem {
        const newItem: BrandingContentItem = {
            ...item,
            id: generateId(),
            createdAt: new Date().toISOString(),
            status: 'idea'
        };
        this.state.branding.contentItems = [newItem, ...this.state.branding.contentItems];
        this.state.branding.lastUpdated = new Date().toISOString();
        this.saveToStorage();
        this.notify();
        return newItem;
    }

    updateBrandingContent(id: string, updates: Partial<BrandingContentItem>): void {
        this.state.branding.contentItems = this.state.branding.contentItems.map(item =>
            item.id === id ? { ...item, ...updates } : item
        );
        this.state.branding.lastUpdated = new Date().toISOString();
        this.saveToStorage();
        this.notify();
    }

    deleteBrandingContent(id: string): void {
        this.state.branding.contentItems = this.state.branding.contentItems.filter(item => item.id !== id);
        this.state.branding.lastUpdated = new Date().toISOString();
        this.saveToStorage();
        this.notify();
    }

    getBranding() {
        return this.state.branding;
    }

    // ==================== NETWORKING ====================

    addNetworkingConnection(connection: Omit<NetworkingConnection, 'id' | 'createdAt' | 'outcomes' | 'retrospectives' | 'starters' | 'dmTemplates' | 'lastInteraction'>): NetworkingConnection {
        const newConnection: NetworkingConnection = {
            ...connection,
            id: generateId(),
            createdAt: new Date().toISOString(),
            lastInteraction: new Date().toISOString(),
            outcomes: [],
            retrospectives: [],
            starters: [],
            dmTemplates: []
        };
        this.state.networking.connections = [newConnection, ...this.state.networking.connections];
        this.state.networking.lastUpdated = new Date().toISOString();
        this.saveToStorage();
        this.notify();
        return newConnection;
    }

    updateNetworkingConnection(id: string, updates: Partial<NetworkingConnection>): void {
        this.state.networking.connections = this.state.networking.connections.map(c =>
            c.id === id ? { ...c, ...updates } : c
        );
        this.state.networking.lastUpdated = new Date().toISOString();
        this.saveToStorage();
        this.notify();
    }

    deleteNetworkingConnection(id: string): void {
        this.state.networking.connections = this.state.networking.connections.filter(c => c.id !== id);
        this.state.networking.lastUpdated = new Date().toISOString();
        this.saveToStorage();
        this.notify();
    }

    addConnectionOutcome(connectionId: string, outcome: Omit<ConnectionOutcome, 'id'>): void {
        this.state.networking.connections = this.state.networking.connections.map(c => {
            if (c.id === connectionId) {
                return {
                    ...c,
                    outcomes: [...c.outcomes, { ...outcome, id: generateId() }]
                };
            }
            return c;
        });
        this.state.networking.lastUpdated = new Date().toISOString();
        this.saveToStorage();
        this.notify();
    }

    addRelationshipRetrospective(connectionId: string, retrospective: Omit<RelationshipRetrospective, 'id'>): void {
        this.state.networking.connections = this.state.networking.connections.map(c => {
            if (c.id === connectionId) {
                return {
                    ...c,
                    retrospectives: [...c.retrospectives, { ...retrospective, id: generateId() }]
                };
            }
            return c;
        });
        this.state.networking.lastUpdated = new Date().toISOString();
        this.saveToStorage();
        this.notify();
    }

    addNetworkingStarter(starter: string): void {
        this.state.networking.reusableAssets.starters = [...this.state.networking.reusableAssets.starters, starter];
        this.state.networking.lastUpdated = new Date().toISOString();
        this.saveToStorage();
        this.notify();
    }

    deleteNetworkingStarter(index: number): void {
        this.state.networking.reusableAssets.starters = this.state.networking.reusableAssets.starters.filter((_, i) => i !== index);
        this.state.networking.lastUpdated = new Date().toISOString();
        this.saveToStorage();
        this.notify();
    }

    addNetworkingTemplate(title: string, content: string): void {
        const newTemplate = { id: generateId(), title, content };
        this.state.networking.reusableAssets.templates = [...this.state.networking.reusableAssets.templates, newTemplate];
        this.state.networking.lastUpdated = new Date().toISOString();
        this.saveToStorage();
        this.notify();
    }

    deleteNetworkingTemplate(id: string): void {
        this.state.networking.reusableAssets.templates = this.state.networking.reusableAssets.templates.filter(t => t.id !== id);
        this.state.networking.lastUpdated = new Date().toISOString();
        this.saveToStorage();
        this.notify();
    }

    getNetworking() {
        return this.state.networking;
    }

    // ==================== AGGREGATED STATS ====================

    getDashboardStats() {
        const meditation = this.getMeditationStats();
        const reading = this.getReadingStats();
        const coding = this.getCodingStats();
        const todayTasks = this.getTodayTasks();
        const weeklyGoals = this.getCurrentWeekGoals();

        const tasksCompleted = todayTasks.filter(t => t.completed).length;
        const tasksTotal = todayTasks.length;

        const goalsCompleted = weeklyGoals.filter(g => g.completed).length;
        const goalsTotal = weeklyGoals.length;

        // Calculate overall "life score" (simple average)
        const scores = [
            meditation.todayCompleted ? 100 : 0,
            reading.todayCompleted ? 100 : 0,
            coding.streak > 0 ? 100 : 0, // Add coding consistency to score
            tasksTotal > 0 ? (tasksCompleted / tasksTotal) * 100 : 0,
        ];
        const lifeScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);

        return {
            lifeScore,
            meditation,
            reading,
            coding,
            tasks: { completed: tasksCompleted, total: tasksTotal },
            weeklyGoals: { completed: goalsCompleted, total: goalsTotal },
            activeStreaks: [
                meditation.streak > 0 ? { name: 'Meditation', count: meditation.streak } : null,
                reading.streak > 0 ? { name: 'Reading', count: reading.streak } : null,
                coding.streak > 0 ? { name: 'Coding', count: coding.streak } : null,
            ].filter(Boolean),
        };
    }
}

// Singleton Export
export const lifeTrackerStore = new LifeTrackerStore();

// React Hook
export const useLifeTracker = () => {
    const [, forceUpdate] = useState({});

    useEffect(() => {
        const unsubscribe = lifeTrackerStore.subscribe(() => forceUpdate({}));
        return unsubscribe;
    }, []);

    return lifeTrackerStore;
};

// Need to import useState and useEffect for the hook
import { useState, useEffect } from 'react';
