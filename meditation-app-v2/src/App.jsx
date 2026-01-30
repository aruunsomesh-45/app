import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Library,
  Timer,
  Settings,
  Play,
  Wind,
  CloudRain,
  Waves,
  Trees,
  TrendingUp,
  ChevronLeft,
  Circle,
  Heart
} from 'lucide-react';
import './index.css';

// Mock Data
const HERO_SESSIONS = [
  { id: 1, title: "Morning Mindfulness", duration: "10 min", trainer: "Sarah Wilson", image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=800" },
  { id: 2, title: "Deep Sleep Zen", duration: "20 min", trainer: "Michael Chen", image: "https://images.unsplash.com/photo-1545389336-cf09bdace999?auto=format&fit=crop&q=80&w=800" },
  { id: 3, title: "Stress Relief", duration: "15 min", trainer: "Aria Bloom", image: "https://images.unsplash.com/photo-1499209974431-9dac3adaf471?auto=format&fit=crop&q=80&w=800" },
];

const YOUTUBE_VIDEOS = [
  { id: 1, title: "10 Min Breathing", channel: "Meditation Hub", thumbnail: "https://img.youtube.com/vi/aFX6jMeb0uU/maxresdefault.jpg" },
  { id: 2, title: "Nature Sounds", channel: "Relaxation Academy", thumbnail: "https://img.youtube.com/vi/W_L7V9S8v0M/maxresdefault.jpg" },
  { id: 3, title: "Stress Recovery", channel: "Mindful Life", thumbnail: "https://img.youtube.com/vi/ZToicYcHIOU/maxresdefault.jpg" },
];

const AMBIENT_SOUNDS = [
  { id: 'rain', name: 'Soft Rain', icon: <CloudRain size={24} />, color: '#E0F2F1' },
  { id: 'ocean', name: 'Ocean', icon: <Waves size={24} />, color: '#E3F2FD' },
  { id: 'forest', name: 'Forest', icon: <Trees size={24} />, color: '#F1F8E9' },
  { id: 'wind', name: 'Breeze', icon: <Wind size={24} />, color: '#F3E5F5' },
];

const HomeScreen = ({ onStartSession }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="page-content"
  >
    <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
      <div>
        <p className="text-caption" style={{ marginBottom: '4px' }}>Sunday, Jan 18</p>
        <h1 className="text-h1">Welcome back, Zen</h1>
      </div>
      <div className="card" style={{ padding: '8px 12px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <TrendingUp size={18} color="var(--color-primary)" />
        <span style={{ fontWeight: 600, fontSize: '14px' }}>12 Day Streak</span>
      </div>
    </header>

    <section>
      <div className="scroll-x">
        {HERO_SESSIONS.map((session) => (
          <motion.div
            key={session.id}
            className="scroll-item hero-card"
            whileTap={{ scale: 0.98 }}
            onClick={() => onStartSession(session)}
          >
            <img src={session.image} alt={session.title} className="hero-image" />
            <div className="hero-content">
              <p style={{ fontSize: '12px', fontWeight: 500, opacity: 0.9 }}>RECOMMENDED</p>
              <h3 className="text-h2" style={{ color: 'white' }}>{session.title}</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <Play size={14} fill="white" />
                <span style={{ fontSize: '14px', opacity: 0.9 }}>{session.duration} • {session.trainer}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>

    <section>
      <div className="section-header">
        <h2 className="text-h2">Quick Meditations</h2>
        <a href="#" className="view-all">See All</a>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 var(--spacing-sm)' }}>
        {[10, 20, 30].map((mins) => (
          <div key={mins} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <motion.button
              className="btn-round"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onStartSession({ title: "Quick Session", duration: `${mins} min` })}
            >
              <span style={{ fontSize: '20px', fontWeight: 700 }}>{mins}</span>
              <span style={{ fontSize: '10px', textTransform: 'uppercase', opacity: 0.8 }}>min</span>
            </motion.button>
            <span className="text-caption">Session</span>
          </div>
        ))}
      </div>
    </section>

    <section>
      <div className="section-header">
        <h2 className="text-h2">Saved on YouTube</h2>
        <a href="#" className="view-all">Browse</a>
      </div>
      <div className="scroll-x">
        {YOUTUBE_VIDEOS.map((video) => (
          <motion.div key={video.id} className="scroll-item" style={{ width: '220px' }}>
            <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
              <div style={{ position: 'relative' }}>
                <img src={video.thumbnail} style={{ width: '100%', height: '120px', objectFit: 'cover' }} />
                <div style={{
                  position: 'absolute',
                  top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                  background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(5px)',
                  borderRadius: '50%', padding: '10px'
                }}>
                  <Play size={20} fill="white" color="white" />
                </div>
              </div>
              <div style={{ padding: 'var(--spacing-md)' }}>
                <h4 className="text-h3" style={{ fontSize: '15px', marginBottom: '2px' }}>{video.title}</h4>
                <p className="text-caption" style={{ fontSize: '12px' }}>{video.channel}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>

    <section style={{ marginBottom: 'var(--spacing-xl)' }}>
      <div className="section-header">
        <h2 className="text-h2">Ambient Sounds</h2>
      </div>
      <div className="scroll-x">
        {AMBIENT_SOUNDS.map((sound) => (
          <motion.div
            key={sound.id}
            className="scroll-item ambient-card"
            whileTap={{ scale: 0.95 }}
          >
            <div className="ambient-icon" style={{ backgroundColor: sound.color }}>
              {sound.icon}
            </div>
            <span style={{ fontSize: '13px', fontWeight: 600 }}>{sound.name}</span>
          </motion.div>
        ))}
      </div>
    </section>
  </motion.div>
);

const TimerScreen = ({ session, onBack }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 1.05 }}
    style={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}
  >
    <button onClick={onBack} style={{ position: 'absolute', top: 'var(--spacing-lg)', left: 'var(--spacing-lg)', background: 'none', border: 'none', color: 'var(--color-text-dim)' }}>
      <ChevronLeft size={32} />
    </button>

    <div style={{ marginBottom: '40px' }}>
      <p className="text-caption" style={{ textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px' }}>NOW PLAYING</p>
      <h2 className="text-h1">{session?.title || "Meditation"}</h2>
    </div>

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
      <span style={{ fontSize: '48px', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>09:42</span>
    </div>

    <div style={{ display: 'flex', gap: '24px' }}>
      <motion.button whileTap={{ scale: 0.9 }} className="card" style={{ padding: '16px', borderRadius: '50%' }}><Play size={24} /></motion.button>
      <motion.button whileTap={{ scale: 0.9 }} className="btn-round" style={{ width: '64px', height: '64px' }}>
        <div style={{ width: '20px', height: '20px', backgroundColor: 'white', borderRadius: '4px' }} />
      </motion.button>
      <motion.button whileTap={{ scale: 0.9 }} className="card" style={{ padding: '16px', borderRadius: '50%' }}><Heart size={24} /></motion.button>
    </div>
  </motion.div>
);

const App = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [currentSession, setCurrentSession] = useState(null);

  return (
    <div className="app-container">
      <AnimatePresence mode="wait">
        {currentSession ? (
          <TimerScreen key="timer" session={currentSession} onBack={() => setCurrentSession(null)} />
        ) : (
          <HomeScreen key="home-screen" onStartSession={setCurrentSession} />
        )}
      </AnimatePresence>

      <nav className="bottom-nav">
        <a href="#" className={`nav-item ${activeTab === 'home' ? 'active' : ''}`} onClick={() => { setActiveTab('home'); setCurrentSession(null); }}>
          <Home size={22} fill={activeTab === 'home' ? 'currentColor' : 'none'} />
          <span>Home</span>
        </a>
        <a href="#" className={`nav-item ${activeTab === 'library' ? 'active' : ''}`} onClick={() => setActiveTab('library')}>
          <Library size={22} fill={activeTab === 'library' ? 'currentColor' : 'none'} />
          <span>Library</span>
        </a>
        <a href="#" className={`nav-item ${activeTab === 'timer' ? 'active' : ''}`} onClick={() => setActiveTab('timer')}>
          <Timer size={22} fill={activeTab === 'timer' ? 'currentColor' : 'none'} />
          <span>Timer</span>
        </a>
        <a href="#" className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
          <Settings size={22} fill={activeTab === 'settings' ? 'currentColor' : 'none'} />
          <span>Settings</span>
        </a>
      </nav>
    </div>
  );
};

export default App;
