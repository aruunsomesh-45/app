import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    Brain, Play, Pause, Check, Wind,
    Home, Library, Timer, Settings,
    CloudRain, Waves, Trees, ChevronLeft, ChevronRight, Bell, Heart, Flame,
    Search, Plus, Trash2, Calendar, Volume2, VolumeX, Sun, Moon, LogOut, Download,
    CheckSquare, Zap, MoreHorizontal
} from 'lucide-react';
import { useLifeTracker } from '../utils/lifeTrackerStore';
import type { MeditationSession } from '../utils/lifeTrackerStore';
import youtubeService from '../services/youtubeService';
import type { YouTubeVideoData } from '../services/youtubeService';
import freesoundService from '../services/freesoundService';
import '../styles/meditation-premium.css';

// Mock Data for Premium Look
interface LibrarySession {
    id: string | number;
    title: string;
    duration: string;
    trainer: string;
    image: string;
    video?: string;
    category: string;
}

const HERO_SESSIONS: LibrarySession[] = [
    { id: 1, title: "Morning Mindfulness", duration: "10 min", trainer: "Sarah Wilson", image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=800", video: "/videos/meditation_1.mp4", category: "Focus" },
    { id: 2, title: "Deep Sleep Zen", duration: "20 min", trainer: "Michael Chen", image: "https://images.unsplash.com/photo-1545389336-cf09bdace999?auto=format&fit=crop&q=80&w=800", video: "/videos/meditation_2.mp4", category: "Sleep" },
    { id: 3, title: "Stress Relief", duration: "15 min", trainer: "Aria Bloom", image: "https://images.unsplash.com/photo-1499209974431-9dac3adaf471?auto=format&fit=crop&q=80&w=800", video: "/videos/meditation_3.mp4", category: "Stress" },
    { id: 4, title: "Quick Focus", duration: "5 min", trainer: "David Ray", image: "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&q=80&w=800", video: "/videos/meditation_4.mp4", category: "Focus" },
];

const TRAINERS = [
    { id: 't1', name: "Sarah Wilson", role: "Mindfulness Coach", image: "https://i.pravatar.cc/150?u=Sarah", bio: "Sarah helps you find calm in the chaos of daily life." },
    { id: 't2', name: "Michael Chen", role: "Sleep Specialist", image: "https://i.pravatar.cc/150?u=Michael", bio: "Michael uses yoga nidra techniques for deep rest." },
    { id: 't3', name: "Aria Bloom", role: "Anxiety Expert", image: "https://i.pravatar.cc/150?u=Aria", bio: "Aria's gentle voice guides you through panic and stress." },
    { id: 't4', name: "David Ray", role: "High Performance", image: "https://i.pravatar.cc/150?u=David", bio: "David focuses on mental clarity and energy." },
];

// Helper to generate sessions for categories
const generateSessions = (category: string, count: number) => {
    return Array.from({ length: count }).map((_, i) => ({
        id: `${category.toLowerCase()}-${i}`,
        title: `${category} ${['Basics', 'Flow', 'Deep Dive', 'Rest', 'Power'][i % 5]} ${i + 1}`,
        duration: [5, 10, 15, 20, 30][i % 5] + " min",
        trainer: TRAINERS[i % TRAINERS.length].name,
        // Rotate through some nice nature/abstract images
        image: [
            "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80",
            "https://images.unsplash.com/photo-1545389336-cf09bdace999?w=800&q=80",
            "https://images.unsplash.com/photo-1499209974431-9dac3adaf471?w=800&q=80",
            "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=800&q=80",
            "https://images.unsplash.com/photo-1602192509156-033a840d4d6d?w=800&q=80",
            "https://images.unsplash.com/photo-1511295742362-92c96b136114?w=800&q=80"
        ][i % 6],
        category: category
    }));
};

const ALL_SESSIONS = [
    ...HERO_SESSIONS,
    ...generateSessions("Stress", 12),
    ...generateSessions("Anxiety", 15),
    ...generateSessions("Growth", 6),
    ...generateSessions("Focus", 10),
    ...generateSessions("Energy", 9),
    ...generateSessions("Sleep", 8),
];

const CUSTOM_PLAYLISTS: Playlist[] = [
    {
        id: 'pl-morning',
        title: "Morning Routine",
        count: 3,
        image: "/images/meditation/meditation_1.png",
        color: "from-orange-500/20 to-amber-500/20",
        getSessions: () => ALL_SESSIONS.filter(s => s.category === 'Energy').slice(0, 3)
    },
    {
        id: 'pl-sleep',
        title: "Sleep Aid",
        count: 5,
        image: "/images/meditation/meditation_2.png",
        color: "from-indigo-500/20 to-blue-500/20",
        getSessions: () => ALL_SESSIONS.filter(s => s.category === 'Sleep').slice(0, 5)
    },
    {
        id: 'pl-work',
        title: "Work Focus",
        count: 2,
        image: "/images/meditation/meditation_3.png",
        color: "from-emerald-500/20 to-teal-500/20",
        getSessions: () => ALL_SESSIONS.filter(s => s.category === 'Focus').slice(0, 2)
    },
];

const YOUTUBE_VIDEOS = [
    { id: 1, title: "10 Min Breathing", channel: "Meditation Hub", thumbnail: "https://img.youtube.com/vi/aFX6jMeb0uU/maxresdefault.jpg", url: "https://www.youtube.com/watch?v=aFX6jMeb0uU" },
    { id: 2, title: "Nature Sounds", channel: "Relaxation Academy", thumbnail: "https://img.youtube.com/vi/W_L7V9S8v0M/maxresdefault.jpg", url: "https://www.youtube.com/watch?v=W_L7V9S8v0M" },
    { id: 3, title: "Stress Recovery", channel: "Mindful Life", thumbnail: "https://img.youtube.com/vi/ZToicYcHIOU/maxresdefault.jpg", url: "https://www.youtube.com/watch?v=ZToicYcHIOU" },
];

const AMBIENT_SOUNDS = [
    { id: 'rain', name: 'Soft Rain', icon: <CloudRain size={24} />, color: '#E0F2F1', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
    { id: 'ocean', name: 'Ocean', icon: <Waves size={24} />, color: '#E3F2FD', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
    { id: 'forest', name: 'Forest', icon: <Trees size={24} />, color: '#F1F8E9', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
    { id: 'wind', name: 'Breeze', icon: <Wind size={24} />, color: '#F3E5F5', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' },
];

const BREATHING_PATTERNS = [
    { id: 'box', label: 'Box Breathing', inhale: 4, hold: 4, exhale: 4, holdPost: 4 },
    { id: 'relaxed', label: '4-7-8 Relax', inhale: 4, hold: 7, exhale: 8, holdPost: 0 },
    { id: 'energy', label: 'Power Breath', inhale: 2, hold: 0, exhale: 2, holdPost: 0 },
];

const MOOD_LABELS = ['😔', '😕', '😐', '🙂', '😊'];

interface Playlist {
    id: string;
    title: string;
    count: number;
    image: string;
    color: string;
    sessionIds?: (string | number)[];
    getSessions: () => LibrarySession[];
}

interface CategorySound {
    url: string;
    name: string;
    id: string;
    artist?: string;
    icon?: React.ReactNode;
}

// Move these constants outside the component to prevent recreation on each render
const FALLBACK_CATEGORY_SOUNDS: Record<string, string> = {
    'Stress': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
    'Anxiety': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3',
    'Growth': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    'Focus': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3',
    'Energy': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3',
    'Sleep': 'https://cdn.pixabay.com/download/audio/2022/03/09/audio_c8c8a73467.mp3?filename=river-and-birds-loop-11357.mp3'
};

const CATEGORY_SOUND_QUERIES: Record<string, string> = {
    'Stress': 'tibetan singing bowl meditation loop',
    'Anxiety': 'calm ocean waves gentle',
    'Growth': 'ethereal space ambient pad',
    'Focus': 'binaural beats concentration',
    'Energy': 'forest morning birds nature',
    'Sleep': 'heavy rain storm loop'
};

const MeditationSystem: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const store = useLifeTracker();
    const stats = store.getMeditationStats();
    const sessions = store.getState().meditationSessions.slice(0, 10);

    const [activeTab, setActiveTab] = useState('home');
    const [currentSession, setCurrentSession] = useState<{ id?: string | number; title: string; duration: string; type: MeditationSession['type']; image?: string; trainer?: string; category?: string } | null>(null);
    const [isTimerActive, setIsTimerActive] = useState(false);
    const [showSummary, setShowSummary] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [selectedDuration] = useState(10);
    const [activeSound, setActiveSound] = useState<string | null>(null);
    const [selectedPattern, setSelectedPattern] = useState(BREATHING_PATTERNS[0]);
    const [breathPhase, setBreathPhase] = useState<'Inhale' | 'Hold' | 'Exhale' | 'Rest'>('Inhale');
    const [breathProgress, setBreathProgress] = useState(0);
    const [sessionMoodBefore, setSessionMoodBefore] = useState(3);
    const [sessionMoodAfter, setSessionMoodAfter] = useState(5);
    const [heroIndex, setHeroIndex] = useState(0);
    const [ytIndex, setYtIndex] = useState(0);
    const [mentalClarity, setMentalClarity] = useState(3);
    const [stressTriggers, setStressTriggers] = useState('');
    const [consistencyRating, setConsistencyRating] = useState(true); // "Did I show up?"
    const [qualityRating, setQualityRating] = useState(3); // "How well did I perform?"
    const [focusDrops, setFocusDrops] = useState(0);
    const [weeklyInsight, setWeeklyInsight] = useState('');

    const [ytVideos, setYtVideos] = useState<YouTubeVideoData[]>(YOUTUBE_VIDEOS.map(v => ({
        originalUrl: v.url,
        videoId: String(v.id),
        thumbnailUrl: v.thumbnail,
        thumbnailUrlHQ: v.thumbnail,
        thumbnailUrlMaxRes: v.thumbnail,
        iframeCode: '',
        embedUrl: v.url.replace('watch?v=', 'embed/'),
        title: v.title,
        channelName: v.channel
    })));

    // Note: FALLBACK_CATEGORY_SOUNDS and CATEGORY_SOUND_QUERIES are now defined outside the component

    // Library State
    const [libraryView, setLibraryView] = useState<'main' | 'category' | 'trainer' | 'playlist' | 'create_playlist' | 'add_sessions'>('main');
    const [selectedCategory, setSelectedCategory] = useState<{ name: string, count: number, color: string } | null>(null);
    const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
    const [customCollections, setCustomCollections] = useState<Playlist[]>([]); // User created collections
    const [searchQuery, setSearchQuery] = useState('');
    const [playlistCarouselIndex, setPlaylistCarouselIndex] = useState(0);
    const [dynamicAmbientSounds, setDynamicAmbientSounds] = useState<CategorySound[]>(AMBIENT_SOUNDS.map(s => ({
        url: s.url,
        name: s.name,
        id: s.id
    })));

    // Initialize with fallbacks first so there's always a unique sound
    const [categorySounds, setCategorySounds] = useState<Record<string, CategorySound>>(() => {
        const initial: Record<string, CategorySound> = {};
        Object.keys(FALLBACK_CATEGORY_SOUNDS).forEach(cat => {
            initial[cat] = {
                url: FALLBACK_CATEGORY_SOUNDS[cat],
                name: `${cat} Ambience`,
                id: `cat-${cat.toLowerCase()}`
            };
        });
        return initial;
    });

    const [isSyncingSounds, setIsSyncingSounds] = useState(false);

    // New Playlist State
    const [newPlaylistData, setNewPlaylistData] = useState({
        title: '',
        image: '/images/meditation/meditation_1.png'
    });

    // Settings State
    const [voiceVolume, setVoiceVolume] = useState(75);
    const [isLooping, setIsLooping] = useState(true);
    const [reminders, setReminders] = useState<{ id: string, time: string, label: string, enabled: boolean }[]>([
        { id: '1', time: '08:00', label: 'Daily Morning Zen', enabled: true }
    ]);
    const [showReminderModal, setShowReminderModal] = useState(false);
    const [newReminder, setNewReminder] = useState({ time: '09:00', label: '', enabled: true });

    // Productivity / Home State
    const [dailyTasks, setDailyTasks] = useState<{ id: number, text: string, done: boolean }[]>([
        { id: 1, text: "Begin with a 5 min breathe", done: false },
        { id: 2, text: "Focus for 25 mins", done: false }
    ]);
    const [showDailyPlanner, setShowDailyPlanner] = useState(false);

    const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

    // Fetch dynamic YouTube videos once
    useEffect(() => {
        const loadVideos = async () => {
            if (YOUTUBE_API_KEY && YOUTUBE_API_KEY !== 'YOUR_YOUTUBE_API_KEY_HERE') {
                const status = await youtubeService.validateApiKey(YOUTUBE_API_KEY);
                if (status.valid) {
                    const results = await youtubeService.searchVideos('10 minute meditation', YOUTUBE_API_KEY, 5);
                    if (results.length > 0) setYtVideos(results);
                }
            }
        };
        loadVideos();
    }, [YOUTUBE_API_KEY]);

    const nextHero = () => setHeroIndex((prev) => (prev + 1) % HERO_SESSIONS.length);
    const prevHero = () => setHeroIndex((prev) => (prev - 1 + HERO_SESSIONS.length) % HERO_SESSIONS.length);

    const nextYt = () => setYtIndex((prev) => (prev + 1) % ytVideos.length);
    const prevYt = () => setYtIndex((prev) => (prev - 1 + ytVideos.length) % ytVideos.length);

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Initial config based on search params
    useEffect(() => {
        const type = searchParams.get('type');
        if (type === 'breathing') {
            setActiveTab('home');
            // Auto start breathing if requested? Or just focus UI?
        }
    }, [searchParams]);

    // Data Pooling Pipeline for Freesound (Atmosphere + Categories)
    useEffect(() => {
        const fetchAllSounds = async () => {
            setIsSyncingSounds(true);
            try {
                // Fetch Atmosphere Sounds (Rain, Ocean, etc.)
                const atmosphereResults = await Promise.all(
                    AMBIENT_SOUNDS.map(async (baseSound) => {
                        const searchQuery = baseSound.id === 'rain' ? 'soft rain loop' :
                            baseSound.id === 'ocean' ? 'peaceful ocean waves' :
                                baseSound.id === 'forest' ? 'forest birds atmosphere' :
                                    'soft breeze wind';

                        const sounds = await freesoundService.searchSounds(searchQuery, 1);
                        if (sounds && sounds.length > 0) {
                            return {
                                ...baseSound,
                                url: sounds[0].previews['preview-hq-mp3'],
                                name: sounds[0].name.split('.')[0].slice(0, 20),
                                artist: 'Freesound'
                            };
                        }
                        return baseSound;
                    })
                );
                setDynamicAmbientSounds(atmosphereResults);

                // Fetch Category-Specific Sounds
                const categories = Object.keys(CATEGORY_SOUND_QUERIES);
                const fetchedCategorySounds: Record<string, CategorySound> = {};

                await Promise.all(
                    categories.map(async (cat) => {
                        try {
                            const sounds = await freesoundService.searchSounds(CATEGORY_SOUND_QUERIES[cat], 1);
                            if (sounds && sounds.length > 0) {
                                fetchedCategorySounds[cat] = {
                                    url: sounds[0].previews['preview-hq-mp3'],
                                    name: sounds[0].name,
                                    id: `cat-${cat.toLowerCase()}`
                                };
                            }
                        } catch (err) {
                            console.warn(`Failed to fetch sound for ${cat}`, err);
                        }
                    })
                );

                // Merge fetched sounds with existing fallbacks
                setCategorySounds(prev => ({
                    ...prev,
                    ...fetchedCategorySounds
                }));

            } catch (error) {
                console.error("Freesound pooling failed:", error);
            } finally {
                setIsSyncingSounds(false);
            }
        };

        fetchAllSounds();
    }, []); // CATEGORY_SOUND_QUERIES is now a stable constant outside the component

    // Timer Logic
    useEffect(() => {
        if (isTimerActive && !isPaused && timeRemaining > 0) {
            intervalRef.current = setInterval(() => {
                setTimeRemaining(prev => prev - 1);
            }, 1000);
        } else if (timeRemaining === 0 && isTimerActive) {
            handleCompleteSession();
        }

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isTimerActive, isPaused, timeRemaining]);

    // Sound Logic (Simultaneous with Timer & Category Support)
    useEffect(() => {
        if (isTimerActive && !isPaused) {
            let soundUrl = '';

            // 1. Check for manual activeSound in dynamicAmbientSounds
            const manualSound = dynamicAmbientSounds.find(s => s.id === activeSound);
            if (manualSound) {
                soundUrl = manualSound.url;
            }
            // 2. Check for manual activeSound in categorySounds (if id starts with cat-)
            else if (activeSound?.startsWith('cat-')) {
                const catName = Object.keys(categorySounds).find(k => `cat-${k.toLowerCase()}` === activeSound);
                if (catName) {
                    soundUrl = categorySounds[catName].url;
                }
            }
            // 3. Fallback to current session's category sound IF no activeSound is manually set
            else if (!activeSound && currentSession?.category && categorySounds[currentSession.category]) {
                soundUrl = categorySounds[currentSession.category].url;
            }

            if (soundUrl) {
                if (!audioRef.current) {
                    audioRef.current = new Audio(soundUrl);
                    audioRef.current.loop = true;
                }

                if (audioRef.current.src !== soundUrl) {
                    audioRef.current.pause();
                    audioRef.current.src = soundUrl;
                    audioRef.current.load();
                }

                audioRef.current.volume = 0.6;
                audioRef.current.play().catch(e => console.log("Audio play blocked", e));
            } else {
                if (audioRef.current) {
                    audioRef.current.pause();
                }
            }
        } else {
            if (audioRef.current) {
                audioRef.current.pause();
            }
        }

        return () => {
            if (audioRef.current && !isTimerActive) {
                audioRef.current.pause();
            }
        };
    }, [activeSound, isTimerActive, isPaused, dynamicAmbientSounds, categorySounds, currentSession]);

    // Breathing Pacer Logic
    useEffect(() => {
        if (!isTimerActive || isPaused || currentSession?.type !== 'breathing') return;

        let timer = 0;
        const breatheInterval = setInterval(() => {
            timer += 0.1;

            const pattern = selectedPattern;
            const totalCycle = pattern.inhale + pattern.hold + pattern.exhale + pattern.holdPost;
            const cycleTime = timer % totalCycle;

            let progress = 0;
            let currentPhase: 'Inhale' | 'Hold' | 'Exhale' | 'Rest' = 'Inhale';

            if (cycleTime < pattern.inhale) {
                currentPhase = 'Inhale';
                progress = cycleTime / pattern.inhale;
            } else if (cycleTime < pattern.inhale + pattern.hold) {
                currentPhase = 'Hold';
                progress = 1;
            } else if (cycleTime < pattern.inhale + pattern.hold + pattern.exhale) {
                currentPhase = 'Exhale';
                progress = 1 - ((cycleTime - pattern.inhale - pattern.hold) / pattern.exhale);
            } else {
                currentPhase = 'Rest';
                progress = 0;
            }

            setBreathPhase(currentPhase);
            setBreathProgress(progress);
        }, 100);

        return () => clearInterval(breatheInterval);
    }, [isTimerActive, isPaused, currentSession, selectedPattern]);

    const startSession = (session: { title: string; duration: string; type: MeditationSession['type']; image?: string; trainer?: string; category?: string }) => {
        setCurrentSession(session);
        const duration = parseInt(session.duration) || selectedDuration;
        setTimeRemaining(duration * 60);
        setIsTimerActive(true);
        setIsPaused(false);
        setShowSummary(false);
        setSessionMoodBefore(3);
        setSessionMoodAfter(5);
        setFocusDrops(0);
        setMentalClarity(3);
        setStressTriggers('');
        setQualityRating(3);

        // Auto-set the active sound based on session category if available
        if (session.category && categorySounds[session.category]) {
            setActiveSound(`cat-${session.category.toLowerCase()}`);
        } else {
            setActiveSound(null);
        }
    };

    const handleCompleteSession = () => {
        setShowSummary(true);
        setIsPaused(true);
        setIsTimerActive(false);
        setActiveSound(null);
    };

    const saveSession = () => {
        store.addMeditationSession({
            date: new Date().toISOString().split('T')[0],
            duration: Math.ceil((parseInt(currentSession?.duration || '10'))),
            type: currentSession?.type || 'unguided',
            moodBefore: sessionMoodBefore,
            moodAfter: sessionMoodAfter,
            mentalClarity,
            stressTriggers,
            consistencyRating,
            qualityRating,
            focusDrops
        });
        setShowSummary(false);
        setCurrentSession(null);
    };

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const HomeScreen = () => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="page-content"
        >
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 'var(--spacing-lg)' }}>
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <button onClick={() => navigate(-1)} className="p-1 -ml-1 hover:bg-black/5 rounded-full transition-colors border-none bg-none cursor-pointer">
                            <ChevronLeft size={20} />
                        </button>
                        <p className="text-caption">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
                    </div>
                    <h1 className="text-h1">Welcome back, Zen</h1>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <motion.button whileTap={{ scale: 0.95 }} className="w-10 h-10 rounded-full bg-white flex items-center justify-center border-none shadow-sm cursor-pointer">
                        <Heart size={20} color="#FF6B6B" fill="#FF6B6B" />
                    </motion.button>
                    <motion.button whileTap={{ scale: 0.95 }} className="w-10 h-10 rounded-full bg-white flex items-center justify-center border-none shadow-sm cursor-pointer">
                        <Bell size={20} color="#636E72" />
                    </motion.button>
                    <div className="flex items-center gap-2 bg-[#FFF4E6] px-3 py-2 rounded-full border border-[#FFE8CC] shadow-sm">
                        <Flame size={18} color="#FF922B" fill="#FF922B" />
                        <span className="font-extrabold text-[#D9480F] text-sm">{stats.streak}</span>
                    </div>
                </div>
            </header>

            {/* Mood Check-in */}
            <section className="mb-6">
                <h3 className="text-caption font-bold mb-3 uppercase tracking-wider text-gray-400">How are you feeling?</h3>
                <div className="flex justify-between bg-white p-4 rounded-3xl shadow-sm">
                    {MOOD_LABELS.map((emoji, index) => (
                        <button
                            key={index}
                            onClick={() => {
                                // Simple logic: suggest a session based on mood
                                const mood = index + 1;
                                let suggestedCategory = 'Focus';
                                if (mood <= 2) suggestedCategory = 'Stress';
                                else if (mood === 3) suggestedCategory = 'Anxiety';
                                else if (mood >= 4) suggestedCategory = 'Energy';

                                const suggestion = ALL_SESSIONS.find(s => s.category === suggestedCategory);
                                if (suggestion) startSession({ ...suggestion, type: 'guided' });
                            }}
                            className="text-2xl hover:scale-125 transition-transform cursor-pointer border-none bg-none p-2 rounded-full hover:bg-gray-50 from-neutral-200"
                        >
                            {emoji}
                        </button>
                    ))}
                </div>
            </section>

            {/* PRODUCTIVITY: Daily Intention Strip */}
            <section className="mb-6">
                <div className="card bg-gradient-to-r from-indigo-50 to-blue-50 border-none p-4 flex justify-between items-center cursor-pointer" onClick={() => setShowDailyPlanner(!showDailyPlanner)}>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                            <CheckSquare size={16} />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-gray-800">Today's Plan</h3>
                            <p className="text-xs text-gray-500">{dailyTasks.filter(t => t.done).length}/{dailyTasks.length} completed</p>
                        </div>
                    </div>
                    <ChevronRight size={16} className={`transform transition-transform ${showDailyPlanner ? 'rotate-90' : ''}`} />
                </div>
                <AnimatePresence>
                    {showDailyPlanner && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                            <div className="mt-2 space-y-2 pl-2">
                                {dailyTasks.map(task => (
                                    <div key={task.id} className="flex items-center gap-3 p-2 bg-white rounded-xl shadow-sm">
                                        <button
                                            onClick={() => setDailyTasks(dailyTasks.map(t => t.id === task.id ? { ...t, done: !t.done } : t))}
                                            className={`w-5 h-5 rounded border ${task.done ? 'bg-green-500 border-green-500' : 'border-gray-300'} flex items-center justify-center cursor-pointer`}
                                        >
                                            {task.done && <Check size={12} color="white" />}
                                        </button>
                                        <span className={`text-sm ${task.done ? 'line-through text-gray-400' : 'text-gray-700'}`}>{task.text}</span>
                                    </div>
                                ))}
                                <button className="text-xs text-indigo-600 font-semibold px-2 py-1">+ Add Task</button>
                            </div>
                            <div className="mt-4 px-2">
                                <p className="text-xs font-bold text-gray-400 mb-2 uppercase">Daily Journal</p>
                                <textarea
                                    className="w-full bg-indigo-50/50 rounded-xl p-3 text-sm text-gray-700 border-none outline-none resize-none focus:bg-indigo-50 transition-colors"
                                    placeholder="What's on your mind today?"
                                    rows={3}
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </section>

            {/* Focus Mode Shortcut */}
            <section className="grid grid-cols-2 gap-4 mb-8">
                <motion.button
                    whileTap={{ scale: 0.98 }}
                    className="card p-4 bg-gradient-to-br from-violet-500 to-purple-600 text-white border-none cursor-pointer flex flex-col justify-between h-24"
                    onClick={() => startSession({ title: "Deep Work", duration: "25 min", type: "unguided" })}
                >
                    <div className="flex justify-between items-start">
                        <Zap size={20} fill="rgba(255,255,255,0.2)" />
                        <span className="text-xs font-medium bg-white/20 px-2 py-0.5 rounded-full">25 min</span>
                    </div>
                    <span className="font-bold text-lg text-left">Focus Mode</span>
                </motion.button>
                <motion.button
                    whileTap={{ scale: 0.98 }}
                    className="card p-4 bg-white border-none cursor-pointer flex flex-col justify-between h-24"
                    onClick={() => startSession({ title: "Box Breathing", duration: "5 min", type: "breathing" })}
                >
                    <div className="flex justify-between items-start">
                        <Wind size={20} className="text-blue-500" />
                        <span className="text-xs font-medium bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">5 min</span>
                    </div>
                    <span className="font-bold text-lg text-left text-gray-800">Quick Reset</span>
                </motion.button>
            </section>

            <section style={{ position: 'relative', overflow: 'hidden', borderRadius: '32px', marginBottom: 'var(--spacing-xl)' }}>
                <AnimatePresence mode='wait'>
                    <motion.div
                        key={heroIndex}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.4 }}
                        style={{ width: '100%', height: '220px', position: 'relative', cursor: 'pointer' }}
                        onClick={() => startSession({ ...HERO_SESSIONS[heroIndex], type: 'guided' })}
                    >
                        {HERO_SESSIONS[heroIndex].video ? (
                            <video
                                autoPlay
                                muted
                                loop
                                playsInline
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                key={HERO_SESSIONS[heroIndex].video}
                            >
                                <source src={HERO_SESSIONS[heroIndex].video} type="video/mp4" />
                            </video>
                        ) : (
                            <img src={HERO_SESSIONS[heroIndex].image} alt={HERO_SESSIONS[heroIndex].title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        )}
                        <div style={{
                            position: 'absolute', bottom: 0, left: 0, right: 0,
                            padding: '24px', background: 'linear-gradient(transparent, rgba(0, 0, 0, 0.7))',
                            color: 'white'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                <span style={{ backgroundColor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', padding: '4px 10px', borderRadius: '100px', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' }}>Daily Pick</span>
                                <span style={{ fontSize: '12px', opacity: 0.8 }}>• {HERO_SESSIONS[heroIndex].duration}</span>
                            </div>
                            <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '2px' }}>{HERO_SESSIONS[heroIndex].title}</h2>
                            <p style={{ fontSize: '14px', opacity: 0.9 }}>with {HERO_SESSIONS[heroIndex].trainer}</p>
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Manual Controls */}
                <button
                    onClick={(e) => { e.stopPropagation(); prevHero(); }}
                    style={{ position: 'absolute', top: '50%', left: '12px', transform: 'translateY(-50%)', backgroundColor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 }}
                >
                    <ChevronLeft size={20} color="white" />
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); nextHero(); }}
                    style={{ position: 'absolute', top: '50%', right: '12px', transform: 'translateY(-50%)', backgroundColor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 }}
                >
                    <ChevronRight size={20} color="white" />
                </button>

                <div style={{ position: 'absolute', bottom: '16px', right: '24px', display: 'flex', gap: '6px' }}>
                    {HERO_SESSIONS.map((_, i) => (
                        <div key={i} style={{
                            height: '6px', borderRadius: '3px',
                            width: i === heroIndex ? '20px' : '6px',
                            backgroundColor: i === heroIndex ? 'white' : 'rgba(255,255,255,0.5)',
                            transition: 'all 0.3s'
                        }} />
                    ))}
                </div>
            </section>

            <section style={{ marginBottom: 'var(--spacing-xl)' }}>
                <div className="section-header">
                    <h2 className="text-h2">Saved on YouTube</h2>
                    <a href="https://www.youtube.com/results?search_query=meditation" target="_blank" rel="noopener noreferrer" className="view-all">Browse</a>
                </div>

                <div style={{ position: 'relative', height: '200px', borderRadius: '24px', overflow: 'hidden' }}>
                    <AnimatePresence mode='wait'>
                        <motion.div
                            key={ytIndex}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.4 }}
                            className="w-full h-full cursor-pointer"
                            onClick={() => window.open(ytVideos[ytIndex].originalUrl, '_blank')}
                        >
                            <img
                                src={ytVideos[ytIndex].thumbnailUrl}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                alt="YouTube Thumbnail"
                            />
                            <div style={{
                                position: 'absolute', inset: 0,
                                background: 'linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.8))',
                                display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                                padding: '20px'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{
                                        width: '40px', height: '40px', borderRadius: '50%',
                                        backgroundColor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        <Play size={20} fill="white" color="white" />
                                    </div>
                                    <div>
                                        <h4 style={{ color: 'white', fontSize: '16px', fontWeight: 600, marginBottom: '2px' }}>
                                            {ytVideos[ytIndex].title}
                                        </h4>
                                        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>
                                            {ytVideos[ytIndex].channelName}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Manual Controls */}
                    <button
                        onClick={(e) => { e.stopPropagation(); prevYt(); }}
                        style={{ position: 'absolute', top: '50%', left: '12px', transform: 'translateY(-50%)', backgroundColor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 }}
                    >
                        <ChevronLeft size={18} color="white" />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); nextYt(); }}
                        style={{ position: 'absolute', top: '50%', right: '12px', transform: 'translateY(-50%)', backgroundColor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 }}
                    >
                        <ChevronRight size={18} color="white" />
                    </button>
                </div>
            </section>
        </motion.div>
    );

    const HistoryScreen = () => (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="page-content"
        >
            <h1 className="text-h1 mb-6">Activity History</h1>

            {/* Weekly Insight Summary */}
            <section className="mb-8">
                <div className="bg-indigo-600 rounded-[32px] p-6 text-white shadow-xl relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-4">
                            <Zap size={20} className="text-indigo-200" />
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-100">Weekly Insight</h3>
                        </div>
                        <p className="text-lg font-medium leading-relaxed opacity-95 mb-4">
                            {(() => {
                                const last7Days = sessions.filter(s => {
                                    const sessionDate = new Date(s.date);
                                    const now = new Date();
                                    const diffTime = Math.abs(now.getTime() - sessionDate.getTime());
                                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                    return diffDays <= 7;
                                });

                                if (last7Days.length === 0) return "No sessions this week yet. Start your journey today!";

                                const avgClarity = last7Days.reduce((sum, s) => sum + (s.mentalClarity || 3), 0) / last7Days.length;
                                const totalFocusDrops = last7Days.reduce((sum, s) => sum + (s.focusDrops || 0), 0);
                                const avgQuality = last7Days.reduce((sum, s) => sum + (s.qualityRating || 3), 0) / last7Days.length;

                                const allTriggers = last7Days.map(s => s.stressTriggers).filter(Boolean).join(' ').toLowerCase();
                                const commonWords = ['work', 'email', 'meeting', 'deadline', 'family', 'health', 'sleep', 'money', 'noise'];
                                const foundTriggers = commonWords.filter(word => allTriggers.includes(word));

                                let insight = `Your average mental clarity is ${avgClarity.toFixed(1)}/5 with a quality score of ${avgQuality.toFixed(1)}/5. `;
                                if (totalFocusDrops > 10) {
                                    insight += `Focus was challenged with ${totalFocusDrops} drops. Consider shorter, guided sessions. `;
                                } else {
                                    insight += `Strong focus stability with only ${totalFocusDrops} breaks. `;
                                }

                                if (foundTriggers.length > 0) {
                                    insight += `Common obstacles: ${foundTriggers.join(', ')}. `;
                                }

                                return insight;
                            })()}
                        </p>
                        <div className="flex gap-4">
                            <div className="bg-white/10 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/10">
                                Trends detected
                            </div>
                        </div>
                    </div>
                    {/* Abstract background shape */}
                    <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
                    <div className="absolute -left-4 -top-4 w-24 h-24 bg-indigo-400/20 rounded-full blur-2xl" />
                </div>
            </section>

            <div className="space-y-4">
                {sessions.map((session, i) => (
                    <div key={i} className="card flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center bg-green-50">
                            <Brain className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold">{session.type.charAt(0).toUpperCase() + session.type.slice(1)} Session</h3>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-gray-500">{new Date(session.date).toLocaleDateString()} • {session.duration} min</span>
                                {session.focusDrops !== undefined && (
                                    <span className="text-[10px] font-bold bg-violet-50 text-violet-600 px-2 py-0.5 rounded-full border border-violet-100">
                                        {session.focusDrops} Drops
                                    </span>
                                )}
                                {session.qualityRating !== undefined && (
                                    <span className="text-[10px] font-bold bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full border border-amber-100">
                                        Q:{session.qualityRating}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="text-2xl">
                            {MOOD_LABELS[session.moodAfter - 1]}
                        </div>
                    </div>
                ))}
            </div>
        </motion.div>
    );

    const TimerScreen = () => {
        const isBreathing = currentSession?.type === 'breathing';

        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                style={{
                    height: '100vh',
                    width: '100%',
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    zIndex: 2000,
                    backgroundColor: 'var(--color-bg)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    padding: 'var(--spacing-lg)'
                }}
            >
                {/* Close Button */}
                <button
                    onClick={() => {
                        setIsTimerActive(false);
                        setCurrentSession(null);
                        setActiveSound(null);
                    }}
                    style={{ position: 'absolute', top: 'var(--spacing-lg)', left: 'var(--spacing-lg)', background: 'none', border: 'none', color: 'var(--color-text-dim)' }}
                >
                    <ChevronLeft size={32} />
                </button>

                <div style={{ marginBottom: '40px' }}>
                    <p className="text-caption" style={{ textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px' }}>NOW PLAYING</p>
                    <h2 className="text-h1">{currentSession?.title || "Meditation"}</h2>
                </div>

                {isBreathing ? (
                    <div className="relative flex flex-col items-center mb-10">
                        <div className="relative w-64 h-64 flex items-center justify-center">
                            <motion.div
                                animate={{
                                    scale: 0.8 + (breathProgress * 0.4),
                                    backgroundColor: 'var(--color-primary)',
                                    opacity: 0.1
                                }}
                                className="absolute inset-0 rounded-full blur-xl"
                            />
                            <motion.div
                                animate={{
                                    scale: 0.8 + (breathProgress * 0.4),
                                    borderWidth: breathPhase === 'Hold' ? '6px' : '2px',
                                }}
                                className="w-full h-full rounded-full border-2 border-[var(--color-primary)] flex items-center justify-center backdrop-blur-sm"
                            >
                                <div className="text-center">
                                    <motion.p
                                        key={breathPhase}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-primary-dark text-2xl font-semibold tracking-widest uppercase"
                                    >
                                        {breathPhase}
                                    </motion.p>
                                </div>
                            </motion.div>
                        </div>
                        <div className="mt-8 flex gap-2">
                            {BREATHING_PATTERNS.map(p => (
                                <button
                                    key={p.id}
                                    onClick={() => setSelectedPattern(p)}
                                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all border-none cursor-pointer ${selectedPattern.id === p.id ? 'bg-[var(--color-primary)] text-white' : 'bg-gray-100 text-gray-400'}`}
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div style={{
                        width: '240px',
                        height: '240px',
                        borderRadius: '50%',
                        border: '4px solid var(--color-accent)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        marginBottom: '40px'
                    }}>
                        <motion.div
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            style={{ width: '200px', height: '200px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', opacity: 0.2, position: 'absolute' }}
                        />
                        <span style={{ fontSize: '48px', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{formatTime(timeRemaining)}</span>
                    </div>
                )}

                {!isBreathing && (
                    <div className="mb-10 text-3xl font-light text-gray-400">
                        {formatTime(timeRemaining)}
                    </div>
                )}

                <div className="flex flex-col gap-8 items-center">
                    {/* Focus Drop Tracker */}
                    <div className="flex flex-col items-center gap-2">
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setFocusDrops(prev => prev + 1)}
                            className="bg-black/10 hover:bg-black/20 text-black px-6 py-3 rounded-full font-bold text-sm transition-all border-none cursor-pointer flex items-center gap-2"
                        >
                            <Brain size={16} /> Log Focus Drop ({focusDrops})
                        </motion.button>
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest">Tap when your mind wanders</p>
                    </div>
                    {/* Ambient Sound Toggles in Timer */}
                    <div className="flex gap-4">
                        {AMBIENT_SOUNDS.map(sound => (
                            <button
                                key={sound.id}
                                onClick={() => setActiveSound(activeSound === sound.id ? 'mute' : sound.id)}
                                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all border-none cursor-pointer ${activeSound === sound.id
                                    ? 'bg-[var(--color-primary)] text-white scale-110'
                                    : 'bg-white/50 text-gray-400'
                                    }`}
                            >
                                {sound.icon}
                            </button>
                        ))}
                        <button
                            onClick={() => setActiveSound(activeSound === 'mute' ? null : 'mute')}
                            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all border-none cursor-pointer ${activeSound === 'mute'
                                ? 'bg-red-500 text-white scale-110'
                                : 'bg-white/50 text-gray-400'
                                }`}
                        >
                            <VolumeX size={24} />
                        </button>
                    </div>

                    <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                        <motion.button whileTap={{ scale: 0.9 }} className="card border-none cursor-pointer" style={{ padding: '16px', borderRadius: '50%' }}>
                            <Settings size={24} className="text-gray-400" />
                        </motion.button>

                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            className="btn-round"
                            style={{ width: '80px', height: '80px' }}
                            onClick={() => setIsPaused(!isPaused)}
                        >
                            {isPaused ? <Play size={32} fill="white" /> : <Pause size={32} fill="white" />}
                        </motion.button>

                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            className="card border-none cursor-pointer"
                            style={{ padding: '16px', borderRadius: '50%' }}
                            onClick={handleCompleteSession}
                        >
                            <Check size={24} className="text-green-500" />
                        </motion.button>
                    </div>
                </div>
            </motion.div>
        );
    };

    const LibraryScreen = () => {
        const allPlaylists = [...customCollections, ...CUSTOM_PLAYLISTS];

        // Safety check for empty playlists or invalid index
        const safePlaylistIndex = allPlaylists.length > 0 ? (playlistCarouselIndex % allPlaylists.length) : 0;
        const currentHeroPlaylist = allPlaylists.length > 0 ? allPlaylists[safePlaylistIndex] : null;

        const categories = [
            { name: "Stress", count: 12, color: "#E0F2F1" },
            { name: "Sleep", count: 8, color: "#E8EAF6" },
            { name: "Anxiety", count: 15, color: "#FFF3E0" },
            { name: "Focus", count: 10, color: "#F1F8E9" },
            { name: "Growth", count: 6, color: "#F3E5F5" },
            { name: "Energy", count: 9, color: "#FFFDE7" },
        ];

        const toggleSessionInPlaylist = (playlistId: string, sessionId: string | number) => {
            setCustomCollections(prev => prev.map(pl => {
                if (pl.id === playlistId) {
                    const sessionIds: (string | number)[] = pl.sessionIds || [];
                    const exists = sessionIds.includes(sessionId);
                    const newSessionIds = exists
                        ? sessionIds.filter((id: string | number) => id !== sessionId)
                        : [...sessionIds, sessionId];

                    const updatedPl = {
                        ...pl,
                        sessionIds: newSessionIds,
                        count: newSessionIds.length
                    };

                    // If this is the currently selected playlist, update it too
                    if (selectedPlaylist && selectedPlaylist.id === playlistId) {
                        setSelectedPlaylist(updatedPl);
                    }

                    return updatedPl;
                }
                return pl;
            }));
        };

        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`page-content ${(libraryView === 'main' || libraryView === 'playlist' || libraryView === 'add_sessions' || libraryView === 'create_playlist') ? 'h-full' : ''}`}
            >
                {libraryView === 'main' && currentHeroPlaylist ? (
                    <div className="relative h-full overflow-hidden bg-black">
                        {/* Fixed Background Image Layer */}
                        <div className="absolute inset-0 z-0 select-none">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentHeroPlaylist.id || currentHeroPlaylist.title}
                                    initial={{ opacity: 0, scale: 1.15 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                                    className="absolute inset-0"
                                >
                                    {currentHeroPlaylist.image ? (
                                        <img
                                            src={currentHeroPlaylist.image}
                                            alt=""
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className={`w-full h-full bg-gradient-to-br ${currentHeroPlaylist.color}`} />
                                    )}
                                    <div className="absolute inset-0 bg-black/40" />
                                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/90" />
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* Scrollable Content Container */}
                        <div className="absolute inset-0 z-10 overflow-y-auto no-scrollbar pt-6 flex flex-col">
                            {/* Header - Stays relatively to top during scroll start */}
                            <div className="px-6 flex justify-between items-center mb-6 shrink-0">
                                <div>
                                    <h1 className="text-3xl font-bold text-white mb-1 drop-shadow-lg">Library</h1>
                                    <p className="text-white/60 text-sm font-medium">Your personalized zen space</p>
                                </div>
                                <div className="flex gap-3">
                                    <button className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white cursor-pointer hover:bg-white/20 transition-colors">
                                        <Heart size={20} />
                                    </button>
                                    <button
                                        onClick={() => setLibraryView('create_playlist')}
                                        className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white cursor-pointer hover:bg-green-600 transition-all shadow-lg shadow-green-500/20 active:scale-95"
                                    >
                                        <Plus size={24} />
                                    </button>
                                </div>
                            </div>

                            {/* Search Sticky-ish */}
                            <div className="px-6 relative mb-8 sticky top-0 z-30">
                                <div className="absolute left-9 top-1/2 -translate-y-1/2 text-white/50">
                                    <Search size={18} />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search library..."
                                    className="w-full pl-12 pr-4 py-3.5 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl text-white placeholder:text-white/40 outline-none focus:ring-2 focus:ring-green-500/50 transition-all shadow-2xl"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            {/* Hero Carousel Section - Content Part */}
                            <div className="h-[45vh] flex flex-col justify-center items-center px-6 text-center mb-8 relative">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={`info-${currentHeroPlaylist.id}`}
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -30 }}
                                        className="mb-8"
                                    >
                                        <span className="text-green-400 text-xs font-bold uppercase tracking-[0.3em] mb-4 block">Recommended for now</span>
                                        <motion.h2 className="text-5xl font-bold text-white mb-6 tracking-tight drop-shadow-2xl">
                                            {currentHeroPlaylist.title}
                                        </motion.h2>
                                        <div className="flex items-center justify-center gap-6">
                                            <div className="flex flex-col items-center">
                                                <span className="text-white/40 text-[10px] uppercase tracking-widest mb-1">Sessions</span>
                                                <span className="text-white font-bold">{currentHeroPlaylist.count || 0}</span>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setSelectedPlaylist(currentHeroPlaylist);
                                                    setLibraryView('playlist');
                                                }}
                                                className="w-20 h-20 rounded-full bg-green-500 text-white flex items-center justify-center shadow-2xl shadow-green-500/40 hover:scale-110 active:scale-90 transition-all border-none cursor-pointer"
                                            >
                                                <Play size={32} fill="white" className="ml-1" />
                                            </button>
                                            <div className="flex flex-col items-center">
                                                <span className="text-white/40 text-[10px] uppercase tracking-widest mb-1">Duration</span>
                                                <span className="text-white font-bold">~15m</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                </AnimatePresence>

                                {/* Dots */}
                                <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-2 pb-4">
                                    {allPlaylists.map((_: Playlist, idx: number) => (
                                        <button
                                            key={idx}
                                            onClick={() => setPlaylistCarouselIndex(idx)}
                                            className={`h-1.5 rounded-full transition-all cursor-pointer border-none ${idx === playlistCarouselIndex ? 'w-8 bg-green-500' : 'w-2 bg-white/30'}`}
                                        />
                                    ))}
                                </div>

                                {/* Slide controls on sides */}
                                <div className="absolute left-2 top-1/2 -translate-y-1/2">
                                    <button onClick={() => setPlaylistCarouselIndex(prev => (prev - 1 + allPlaylists.length) % allPlaylists.length)} className="p-3 bg-white/5 backdrop-blur-md rounded-full text-white/50 hover:text-white transition-colors border-none cursor-pointer">
                                        <ChevronLeft size={24} />
                                    </button>
                                </div>
                                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                    <button onClick={() => setPlaylistCarouselIndex(prev => (prev + 1) % allPlaylists.length)} className="p-3 bg-white/5 backdrop-blur-md rounded-full text-white/50 hover:text-white transition-colors border-none cursor-pointer">
                                        <ChevronRight size={24} />
                                    </button>
                                </div>
                            </div>

                            {/* Additional Sections - Vertical Scroll starts here */}
                            <div className="flex-1 bg-gradient-to-t from-black via-black/90 to-transparent pt-12 pb-32">

                                {/* Collections Section */}
                                <section className="px-6 mb-12">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-sm font-bold text-white uppercase tracking-[0.2em]">Curated Collections</h3>
                                        <button className="text-green-500 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 bg-green-500/10 rounded-full border border-green-500/20">View All</button>
                                    </div>
                                    <div className="flex gap-4 overflow-x-auto pb-6 no-scrollbar">
                                        {categories.map((cat) => (
                                            <motion.button
                                                key={cat.name}
                                                whileHover={{ y: -8, scale: 1.02 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => {
                                                    setSelectedCategory(cat);
                                                    setLibraryView('category');
                                                }}
                                                className="shrink-0 w-40 h-48 rounded-[36px] p-6 flex flex-col justify-between text-left border-none cursor-pointer shadow-2xl relative overflow-hidden group backdrop-blur-xl bg-white/5 border border-white/10"
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent group-hover:from-white/20 transition-all" />
                                                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white mb-4">
                                                    <Brain size={24} className="opacity-60" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-white text-lg leading-tight mb-1">{cat.name}</h4>
                                                    <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">{cat.count} Sessions</p>
                                                </div>
                                            </motion.button>
                                        ))}
                                    </div>
                                </section>

                                {/* Ambient Atmosphere */}
                                <section className="px-6 mb-12">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-sm font-bold text-white uppercase tracking-[0.2em]">Atmosphere</h3>
                                        <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Customizable</span>
                                    </div>
                                    <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                                        {dynamicAmbientSounds.map(sound => (
                                            <motion.button
                                                key={sound.id}
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => setActiveSound(activeSound === sound.id ? null : sound.id)}
                                                className={`relative shrink-0 w-32 h-32 rounded-[2rem] flex flex-col items-center justify-center gap-2 transition-all border-none cursor-pointer overflow-hidden ${activeSound === sound.id ? 'bg-green-500 text-white shadow-[0_20px_40px_rgba(34,197,94,0.3)] scale-105' : 'bg-white/5 text-white/50 backdrop-blur-xl border border-white/10'}`}
                                            >
                                                {isSyncingSounds && (
                                                    <motion.div
                                                        animate={{ rotate: 360 }}
                                                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                                        className="absolute inset-0 border-2 border-transparent border-t-green-500/20 rounded-full"
                                                    />
                                                )}
                                                <div className={`${activeSound === sound.id ? 'text-white' : 'text-green-500'} relative z-10`}>
                                                    {sound.icon}
                                                </div>
                                                <span className="text-[10px] font-bold uppercase tracking-widest relative z-10">{sound.name}</span>
                                                {sound.artist && (
                                                    <span className="text-[8px] opacity-30 mt-[-4px] relative z-10">{sound.artist}</span>
                                                )}
                                            </motion.button>
                                        ))}
                                    </div>
                                </section>

                                {/* YouTube Masters */}
                                <section className="px-6 mb-12">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-sm font-bold text-white uppercase tracking-[0.2em]">YouTube Masters</h3>
                                        <button className="text-white/40 hover:text-white transition-colors"><ChevronRight size={20} /></button>
                                    </div>
                                    <div className="flex gap-5 overflow-x-auto pb-4 no-scrollbar">
                                        {YOUTUBE_VIDEOS.map(video => (
                                            <motion.div
                                                key={video.id}
                                                whileHover={{ y: -4 }}
                                                className="shrink-0 w-72 group cursor-pointer"
                                                onClick={() => window.open(video.url, '_blank')}
                                            >
                                                <div className="relative aspect-video rounded-3xl overflow-hidden mb-3 border border-white/10 transition-all group-hover:border-white/30 shadow-2xl">
                                                    <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                                                        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100">
                                                            <Play size={24} fill="white" className="text-white ml-1" />
                                                        </div>
                                                    </div>
                                                </div>
                                                <h4 className="font-bold text-white text-sm mb-1 line-clamp-1">{video.title}</h4>
                                                <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">{video.channel}</p>
                                            </motion.div>
                                        ))}
                                    </div>
                                </section>

                                {/* Expert Mentors */}
                                <section className="px-6 mb-8">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-sm font-bold text-white uppercase tracking-[0.2em]">Elite Mentors</h3>
                                    </div>
                                    <div className="flex gap-6 overflow-x-auto pb-4 no-scrollbar">
                                        {TRAINERS.map(trainer => (
                                            <motion.div
                                                key={trainer.id}
                                                whileHover={{ y: -4 }}
                                                className="shrink-0 flex flex-col items-center text-center w-24"
                                            >
                                                <div className="w-20 h-20 rounded-full p-1 border-2 border-green-500/30 mb-3 group relative cursor-pointer">
                                                    <div className="w-full h-full rounded-full overflow-hidden grayscale hover:grayscale-0 transition-all duration-500">
                                                        <img src={trainer.image} alt={trainer.name} className="w-full h-full object-cover" />
                                                    </div>
                                                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-black flex items-center justify-center text-white scale-0 group-hover:scale-100 transition-transform">
                                                        <Plus size={14} />
                                                    </div>
                                                </div>
                                                <h4 className="font-bold text-white text-[11px] mb-0.5">{trainer.name.split(' ')[0]}</h4>
                                                <p className="text-[9px] text-white/40 font-medium uppercase tracking-tighter">Zen Master</p>
                                            </motion.div>
                                        ))}
                                    </div>
                                </section>

                            </div>
                        </div>
                    </div>
                ) : libraryView === 'playlist' ? (
                    <div className="relative h-full overflow-hidden bg-black">
                        {/* Immersive Background */}
                        <div className="absolute inset-0 z-0 select-none">
                            {selectedPlaylist?.image ? (
                                <img src={selectedPlaylist.image} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <div className={`w-full h-full bg-gradient-to-br ${selectedPlaylist?.color}`} />
                            )}
                            <div className="absolute inset-0 bg-black/60" />
                            <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black" />
                        </div>

                        {/* Relative Content Container */}
                        <div className="absolute inset-0 z-10 overflow-y-auto no-scrollbar flex flex-col pt-12">
                            <div className="px-6 flex items-center justify-between mb-8 shrink-0">
                                <button
                                    onClick={() => setLibraryView('main')}
                                    className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white cursor-pointer hover:bg-white/20 transition-all"
                                >
                                    <ChevronLeft size={24} />
                                </button>
                                <span className="text-white/60 text-[10px] font-bold uppercase tracking-[0.2em]">{selectedPlaylist?.count || 0} Sessions</span>
                                <button className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white cursor-pointer">
                                    <MoreHorizontal size={20} />
                                </button>
                            </div>

                            <div className="px-8 mb-12 shrink-0">
                                <h2 className="text-5xl font-bold text-white mb-2 tracking-tight drop-shadow-2xl">{selectedPlaylist?.title}</h2>
                                <p className="text-white/40 text-sm font-medium">Your curated focus collection</p>
                            </div>

                            <div className="flex-1 bg-gradient-to-t from-black via-black/90 to-transparent pt-8 px-6 pb-32">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xs font-bold text-white uppercase tracking-[0.2em]">Up Next</h3>
                                    {selectedPlaylist?.id?.toString().startsWith('custom-') && (
                                        <button
                                            onClick={() => setLibraryView('add_sessions')}
                                            className="text-green-500 text-[10px] font-bold uppercase tracking-widest px-4 py-2 bg-green-500/10 rounded-full border border-green-500/20 flex items-center gap-2 hover:bg-green-500/20 transition-colors cursor-pointer"
                                        >
                                            <Plus size={14} /> Add Sessions
                                        </button>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    {(() => {
                                        const sessions = selectedPlaylist?.getSessions ? selectedPlaylist.getSessions() : [];
                                        if (sessions.length === 0) {
                                            return (
                                                <div className="py-20 text-center flex flex-col items-center">
                                                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-white/20 mb-4">
                                                        <Library size={32} />
                                                    </div>
                                                    <p className="text-white/30 text-sm font-medium mb-6 italic">No zen here yet...</p>
                                                    {selectedPlaylist?.id?.toString().startsWith('custom-') && (
                                                        <button
                                                            onClick={() => setLibraryView('add_sessions')}
                                                            className="px-8 py-3 bg-green-500 text-white rounded-2xl font-bold text-sm shadow-xl shadow-green-500/20 active:scale-95 transition-all cursor-pointer border-none"
                                                        >
                                                            Add Your First Session
                                                        </button>
                                                    )}
                                                </div>
                                            );
                                        }
                                        return sessions.map((session: LibrarySession) => (
                                            <motion.div
                                                key={session.id}
                                                whileHover={{ x: 4 }}
                                                className="group flex gap-4 items-center p-3 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all cursor-pointer"
                                                onClick={() => startSession({ ...session, type: 'guided' })}
                                            >
                                                <div className="w-14 h-14 rounded-2xl overflow-hidden bg-white/10 shrink-0">
                                                    <img src={session.image} alt={session.title} className="w-full h-full object-cover" />
                                                </div>
                                                <div className="flex-1 overflow-hidden">
                                                    <h4 className="font-bold text-white text-sm truncate mb-0.5">{session.title}</h4>
                                                    <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest truncate">{session.trainer || session.category} • {session.duration}</p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button className="w-10 h-10 rounded-full bg-white/5 text-white/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all border-none hover:text-white cursor-pointer">
                                                        <Download size={16} />
                                                    </button>
                                                    <button className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center shadow-lg shadow-green-500/20 border-none">
                                                        <Play size={18} fill="white" className="ml-0.5" />
                                                    </button>
                                                </div>
                                            </motion.div>
                                        ));
                                    })()}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : libraryView === 'add_sessions' ? (
                    <div className="relative h-full overflow-hidden bg-black">
                        {/* Immersive Background */}
                        <div className="absolute inset-0 z-0 select-none">
                            {selectedPlaylist?.image ? (
                                <img src={selectedPlaylist.image} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <div className={`w-full h-full bg-gradient-to-br ${selectedPlaylist?.color}`} />
                            )}
                            <div className="absolute inset-0 bg-black/80 backdrop-blur-3xl" />
                        </div>

                        {/* Content */}
                        <div className="absolute inset-0 z-10 flex flex-col pt-12">
                            <div className="px-6 flex items-center justify-between mb-8 shrink-0">
                                <button
                                    onClick={() => setLibraryView('playlist')}
                                    className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white cursor-pointer hover:bg-white/20 transition-all"
                                >
                                    <ChevronLeft size={24} />
                                </button>
                                <h3 className="text-white font-bold uppercase tracking-[0.2em] text-xs">Add to {selectedPlaylist?.title}</h3>
                                <button onClick={() => setLibraryView('playlist')} className="text-green-500 font-bold text-sm bg-none border-none cursor-pointer">Done</button>
                            </div>

                            <div className="px-6 mb-8 shrink-0 relative">
                                <div className="absolute left-9 top-1/2 -translate-y-1/2 text-white/50">
                                    <Search size={18} />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search library..."
                                    className="w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl text-white placeholder:text-white/40 outline-none transition-all"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            <div className="flex-1 overflow-y-auto no-scrollbar px-6 pb-32">
                                <div className="space-y-3">
                                    {ALL_SESSIONS.filter(s => s.title.toLowerCase().includes(searchQuery.toLowerCase()) || s.category.toLowerCase().includes(searchQuery.toLowerCase())).map(session => {
                                        const isInPlaylist = (selectedPlaylist?.sessionIds || [] as (string | number)[]).includes(session.id);
                                        return (
                                            <div
                                                key={session.id}
                                                className={`flex gap-4 items-center p-3 rounded-3xl transition-all border ${isInPlaylist ? 'bg-green-500/10 border-green-500/30' : 'bg-white/5 border-white/5'}`}
                                            >
                                                <div className="w-12 h-12 rounded-2xl overflow-hidden bg-white/10">
                                                    <img src={session.image} alt={session.title} className="w-full h-full object-cover" />
                                                </div>
                                                <div className="flex-1 overflow-hidden">
                                                    <h4 className="font-bold text-white text-sm truncate">{session.title}</h4>
                                                    <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest truncate">{session.category} • {session.duration}</p>
                                                </div>
                                                <button
                                                    onClick={() => selectedPlaylist && toggleSessionInPlaylist(selectedPlaylist.id, session.id)}
                                                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all border-none cursor-pointer ${isInPlaylist ? 'bg-green-500 text-white' : 'bg-white/10 text-white/50 hover:bg-white/20'}`}
                                                >
                                                    {isInPlaylist ? <Check size={20} strokeWidth={3} /> : <Plus size={20} />}
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : libraryView === 'category' ? (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                        <button onClick={() => setLibraryView('main')} className="mb-6 flex items-center gap-2 text-gray-500 font-medium btn-ghost p-0 border-none bg-none cursor-pointer">
                            <ChevronLeft size={20} /> Back to Library
                        </button>
                        <h2 className="text-4xl font-bold mb-2" style={{ color: 'var(--color-primary-dark)' }}>{selectedCategory?.name}</h2>
                        <p className="text-gray-500 mb-8">Curated sessions for {selectedCategory?.name.toLowerCase()}.</p>

                        <div className="space-y-4">
                            {ALL_SESSIONS.filter(s => s.category === selectedCategory?.name).map(session => (
                                <div key={session.id} className="card p-4 flex gap-4 items-center cursor-pointer hover:shadow-md transition-shadow" onClick={() => startSession({ ...session, type: 'guided' })}>
                                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                                        <img src={session.image} alt={session.title} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-gray-800">{session.title}</h4>
                                        <p className="text-xs text-gray-500">{session.trainer} • {session.duration}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={(e) => { e.stopPropagation(); alert('Downloading ' + session.title); }} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 border-none transition-colors cursor-pointer">
                                            <Download size={14} />
                                        </button>
                                        <button className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 border-none">
                                            <Play size={14} fill="currentColor" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                ) : libraryView === 'create_playlist' ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 z-50 bg-black flex flex-col overflow-hidden"
                    >
                        {/* Immersive Preview Header */}
                        <div className="relative h-[60%] w-full">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={newPlaylistData.image}
                                    initial={{ opacity: 0, scale: 1.1 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 1.05 }}
                                    transition={{ duration: 0.8 }}
                                    className="absolute inset-0"
                                >
                                    <img src={newPlaylistData.image} alt="Preview" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                                </motion.div>
                            </AnimatePresence>

                            {/* Decorative Glass Navbar for Create Screen */}
                            <div className="absolute top-0 left-0 right-0 p-6 pt-12 flex justify-between items-center z-20">
                                <button
                                    onClick={() => setLibraryView('main')}
                                    className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white cursor-pointer hover:bg-white/20 transition-all active:scale-90"
                                >
                                    <ChevronLeft size={24} />
                                </button>
                                <span className="text-white/80 font-bold uppercase tracking-[0.2em] text-[10px] bg-white/10 px-4 py-2 rounded-full backdrop-blur-md border border-white/10">Design Studio</span>
                                <div className="w-12" /> {/* Spacer */}
                            </div>

                            <div className="absolute bottom-12 left-8 right-8 z-20">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    <span className="text-green-400 text-xs font-bold uppercase tracking-widest mb-3 block">New Collection</span>
                                    <input
                                        type="text"
                                        placeholder="Playlist Title..."
                                        className="w-full bg-transparent border-none text-5xl font-bold text-white placeholder:text-white/20 outline-none p-0 focus:ring-0"
                                        value={newPlaylistData.title}
                                        onChange={(e) => setNewPlaylistData({ ...newPlaylistData, title: e.target.value })}
                                        autoFocus
                                    />
                                </motion.div>
                            </div>
                        </div>

                        {/* Selection Controls - Elevated Bottom Sheet */}
                        <div className="flex-1 bg-white rounded-t-[48px] -mt-10 relative z-30 px-8 pt-12 pb-12 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
                            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-8 opacity-50" />

                            <h3 className="text-2xl font-bold text-gray-900 mb-8 font-display tracking-tight text-center">Select Background</h3>

                            <div className="grid grid-cols-3 gap-5 mb-10">
                                {[1, 2, 3].map(id => (
                                    <motion.div
                                        key={id}
                                        whileHover={{ y: -5, scale: 1.02 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setNewPlaylistData({ ...newPlaylistData, image: `/images/meditation/meditation_${id}.png` })}
                                        className={`relative aspect-[3/4] rounded-24 overflow-hidden cursor-pointer border-4 transition-all duration-300 ring-offset-4 ${newPlaylistData.image === `/images/meditation/meditation_${id}.png` ? 'border-green-500 ring-2 ring-green-500 shadow-2xl' : 'border-transparent grayscale-[50%] opacity-40 hover:opacity-100 hover:grayscale-0'}`}
                                        style={{ borderRadius: '24px' }}
                                    >
                                        <img src={`/images/meditation/meditation_${id}.png`} alt={`Option ${id}`} className="w-full h-full object-cover" />
                                        {newPlaylistData.image === `/images/meditation/meditation_${id}.png` && (
                                            <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full shadow-lg">
                                                <Check size={12} strokeWidth={4} />
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                            </div>

                            <button
                                onClick={() => {
                                    if (!newPlaylistData.title.trim()) return alert('Please name your playlist');
                                    const newPl: Playlist = {
                                        id: `custom-${Date.now()}`,
                                        title: newPlaylistData.title,
                                        image: newPlaylistData.image,
                                        count: 0,
                                        color: "from-gray-900 to-black",
                                        sessionIds: [] as (string | number)[],
                                        getSessions: function () {
                                            return ALL_SESSIONS.filter(s => (this.sessionIds || []).includes(s.id));
                                        }
                                    };
                                    setCustomCollections([newPl, ...customCollections]);
                                    setLibraryView('main');
                                    setPlaylistCarouselIndex(0);
                                    setNewPlaylistData({ title: '', image: '/images/meditation/meditation_1.png' });
                                }}
                                className="w-full py-6 bg-gray-950 text-white rounded-[24px] font-bold text-xl shadow-2xl hover:bg-black transition-all border-none cursor-pointer active:scale-[0.97] flex items-center justify-center gap-3"
                            >
                                <Plus size={24} /> Create Playlist
                            </button>
                        </div>
                    </motion.div>
                ) : libraryView === 'main' ? (
                    <div className="flex flex-col items-center justify-center h-full text-white/50 space-y-4">
                        <Library size={48} className="opacity-20" />
                        <p className="font-medium">Initializing your library...</p>
                    </div>
                ) : null}
            </motion.div>
        );
    };

    const SettingsScreen = () => (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="page-content">
            <h1 className="text-h1 mb-8">Settings</h1>
            <div className="space-y-6">
                <section>
                    <h3 className="text-caption uppercase mb-4">Preferences</h3>
                    <div className="card space-y-4">
                        <div className="flex justify-between items-center">
                            <span>Guided Voice Volume</span>
                            <div className="flex items-center gap-3 w-1/2">
                                <Volume2 size={16} className="text-gray-400" />
                                <input
                                    type="range"
                                    min="0" max="100"
                                    value={voiceVolume}
                                    onChange={(e) => setVoiceVolume(parseInt(e.target.value))}
                                    className="w-full accent-green-600 h-1 bg-gray-200 rounded-lg appearance-none"
                                />
                            </div>
                        </div>
                        <div className="flex justify-between items-center">
                            <span>Background Sound Loop</span>
                            <button
                                onClick={() => setIsLooping(!isLooping)}
                                className={`w-12 h-6 rounded-full relative transition-colors ${isLooping ? 'bg-green-500' : 'bg-gray-300'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isLooping ? 'left-7' : 'left-1'}`} />
                            </button>
                        </div>
                        <div className="flex justify-between items-center">
                            <span>Theme</span>
                            <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
                                <button className="p-1 bg-white shadow-sm rounded-md"><Sun size={14} /></button>
                                <button className="p-1"><Moon size={14} className="text-gray-400" /></button>
                            </div>
                        </div>
                    </div>
                </section>
                <section>
                    <h3 className="text-caption uppercase mb-4">Reminders</h3>
                    <div className="card p-0 overflow-hidden">
                        {reminders.map(reminder => (
                            <div key={reminder.id} className="flex justify-between items-center p-4 border-b border-gray-100 last:border-0">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <Calendar size={14} className="text-green-600" />
                                        <span className="font-semibold">{reminder.label}</span>
                                    </div>
                                    <span className="text-gray-400 text-sm ml-6">{reminder.time} PM</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setReminders(reminders.map(r => r.id === reminder.id ? { ...r, enabled: !r.enabled } : r))}
                                        className={`w-10 h-5 rounded-full relative transition-colors ${reminder.enabled ? 'bg-green-500' : 'bg-gray-300'}`}
                                    >
                                        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${reminder.enabled ? 'left-5.5' : 'left-0.5'}`} />
                                    </button>
                                    <button onClick={() => setReminders(reminders.filter(r => r.id !== reminder.id))} className="text-gray-400 hover:text-red-500 border-none bg-none cursor-pointer">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                        <button
                            onClick={() => setShowReminderModal(true)}
                            className="w-full py-4 bg-gray-50 text-green-700 font-semibold border-none cursor-pointer hover:bg-green-50 transition-colors flex items-center justify-center gap-2"
                        >
                            <Plus size={16} /> Add Reminder
                        </button>
                    </div>
                </section>

                <section>
                    <h3 className="text-caption uppercase mb-4">Data & Account</h3>
                    <div className="card space-y-4">
                        <button className="w-full flex justify-between items-center text-left border-none bg-none cursor-pointer">
                            <span className="flex items-center gap-2"><Download size={16} className="text-gray-500" /> Export Data</span>
                            <ChevronRight size={16} className="text-gray-300" />
                        </button>
                        <button className="w-full flex justify-between items-center text-left border-none bg-none cursor-pointer text-red-500">
                            <span className="flex items-center gap-2"><LogOut size={16} /> Sign Out</span>
                        </button>
                    </div>
                </section>
            </div>

            {/* Simple Add Reminder Modal */}
            <AnimatePresence>
                {showReminderModal && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowReminderModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
                            className="bg-white rounded-2xl p-6 w-full max-w-sm"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 className="text-xl font-bold mb-4">New Reminder</h2>
                            <div className="space-y-4 mb-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Time</label>
                                    <input
                                        type="time"
                                        value={newReminder.time}
                                        onChange={(e) => setNewReminder({ ...newReminder, time: e.target.value })}
                                        className="w-full p-3 bg-gray-100 rounded-xl border-none font-bold text-lg"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Label</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Morning Zen"
                                        value={newReminder.label}
                                        onChange={(e) => setNewReminder({ ...newReminder, label: e.target.value })}
                                        className="w-full p-3 bg-gray-100 rounded-xl border-none"
                                    />
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    setReminders([...reminders, { id: Date.now().toString(), ...newReminder }]);
                                    setShowReminderModal(false);
                                    setNewReminder({ time: '09:00', label: '', enabled: true });
                                }}
                                className="w-full py-3 bg-[var(--color-primary)] text-white rounded-xl font-bold border-none"
                            >
                                Save Reminder
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );

    const SummaryModal = () => (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
                position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)',
                zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: 'var(--spacing-lg)'
            }}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="card"
                style={{ width: '100%', maxWidth: '400px', padding: 'var(--spacing-xl)', textAlign: 'center' }}
            >
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Check size={40} className="text-green-600" />
                </div>
                <h2 className="text-h1 mb-2">Beautifully Done</h2>
                <p className="text-caption mb-8">You just completed {currentSession?.duration || selectedDuration} of mindfulness.</p>

                <div className="mb-8">
                    <p className="text-sm font-semibold mb-4 text-gray-600">How do you feel now?</p>
                    <div className="flex justify-between px-4">
                        {MOOD_LABELS.map((mood, i) => (
                            <button
                                key={i}
                                onClick={() => setSessionMoodAfter(i + 1)}
                                className={`text-3xl p-2 rounded-xl transition-all border-none bg-none cursor-pointer ${sessionMoodAfter === i + 1 ? 'bg-green-50 scale-125' : 'opacity-50'}`}
                            >
                                {mood}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 mb-8 text-left max-h-[40vh] overflow-y-auto px-2 custom-scrollbar">
                    {/* Mental Clarity */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Mental Clarity (Foggy → Sharp)</label>
                            <span className="text-sm font-black text-indigo-600">{['Foggy', 'Hazy', 'Clear', 'Sharp', 'Crystal'][mentalClarity - 1]}</span>
                        </div>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map(level => (
                                <button
                                    key={level}
                                    onClick={() => setMentalClarity(level)}
                                    className={`flex-1 py-3 rounded-xl text-lg transition-all ${mentalClarity === level ? 'bg-indigo-600 text-white shadow-lg' : 'bg-gray-100 text-gray-400'}`}
                                >
                                    {level}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Quality vs Consistency */}
                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Consistency</span>
                                <span className="text-sm font-bold text-gray-800">Did you show up?</span>
                            </div>
                            <button
                                onClick={() => setConsistencyRating(!consistencyRating)}
                                className={`px-4 py-2 rounded-full font-bold text-xs transition-all ${consistencyRating ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                            >
                                {consistencyRating ? 'YES' : 'NO'}
                            </button>
                        </div>
                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Quality (Performance)</span>
                                <span className="text-sm font-black text-amber-600">{qualityRating}/5</span>
                            </div>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map(q => (
                                    <button
                                        key={q}
                                        onClick={() => setQualityRating(q)}
                                        className={`flex-1 py-2 rounded-lg text-sm transition-all ${qualityRating === q ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-white text-gray-300'}`}
                                    >
                                        {q}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Stress Triggers */}
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Stress Triggers</label>
                        <textarea
                            value={stressTriggers}
                            onChange={(e) => setStressTriggers(e.target.value)}
                            placeholder="What increased your stress today?"
                            className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-indigo-100 resize-none transition-all"
                            rows={2}
                        />
                    </div>

                    {/* Focus Stats Display */}
                    <div className="flex gap-4">
                        <div className="flex-1 bg-violet-50 p-3 rounded-2xl border border-violet-100 text-center">
                            <span className="block text-[10px] font-bold text-violet-400 uppercase tracking-tight">Focus Drops</span>
                            <span className="text-xl font-black text-violet-600">{focusDrops}</span>
                        </div>
                        <div className="flex-1 bg-emerald-50 p-3 rounded-2xl border border-emerald-100 text-center">
                            <span className="block text-[10px] font-bold text-emerald-400 uppercase tracking-tight">Avg Focus</span>
                            <span className="text-xl font-black text-emerald-600">
                                {focusDrops === 0 ? '100%' : `${Math.max(0, 100 - (focusDrops * 5))}%`}
                            </span>
                        </div>
                    </div>
                </div>

                <button
                    onClick={saveSession}
                    className="w-full py-5 rounded-[24px] bg-black text-white font-black text-lg shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                    Complete Reflection
                </button>
            </motion.div>
        </motion.div>
    );

    const isFullScreenView = activeTab === 'library' && (libraryView === 'main' || libraryView === 'create_playlist');

    return (
        <div className="meditation-premium min-h-screen">
            <div
                className="app-container transition-all duration-500"
                style={{
                    paddingBottom: '100px',
                    padding: isFullScreenView ? '0' : 'var(--spacing-lg)',
                    height: isFullScreenView || libraryView === 'playlist' || libraryView === 'add_sessions' ? '100vh' : 'auto',
                    overflow: isFullScreenView || libraryView === 'playlist' || libraryView === 'add_sessions' ? 'hidden' : 'auto'
                }}
            >
                <AnimatePresence mode="wait">
                    {isTimerActive ? (
                        <TimerScreen key="timer" />
                    ) : (
                        <>
                            {activeTab === 'home' && <HomeScreen key="home" />}
                            {activeTab === 'history' && <HistoryScreen key="history" />}
                            {activeTab === 'library' && <LibraryScreen key="library" />}
                            {activeTab === 'settings' && <SettingsScreen key="settings" />}
                        </>
                    )}
                </AnimatePresence>
            </div>

            {showSummary && <SummaryModal />}

            {!isTimerActive && (
                <nav className="bottom-nav">
                    <button onClick={() => setActiveTab('home')} className={`nav-item border-none bg-none cursor-pointer ${activeTab === 'home' ? 'active' : ''}`}>
                        <Home size={24} />
                        <span>Home</span>
                    </button>
                    <button onClick={() => setActiveTab('library')} className={`nav-item border-none bg-none cursor-pointer ${activeTab === 'library' ? 'active' : ''}`}>
                        <Library size={24} />
                        <span>Library</span>
                    </button>
                    <button onClick={() => setActiveTab('history')} className={`nav-item border-none bg-none cursor-pointer ${activeTab === 'history' ? 'active' : ''}`}>
                        <Timer size={24} />
                        <span>History</span>
                    </button>
                    <button onClick={() => setActiveTab('settings')} className={`nav-item border-none bg-none cursor-pointer ${activeTab === 'settings' ? 'active' : ''}`}>
                        <Settings size={24} />
                        <span>Settings</span>
                    </button>
                </nav>
            )}
        </div>
    );
};

export default MeditationSystem;
