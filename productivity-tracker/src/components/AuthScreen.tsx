import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { MoveLeft, AlertCircle, CheckCircle2 } from 'lucide-react';
import Button from './ui/Button';

// Assets
import cozyDesk from '../assets/cozy_desk.png';
import authBg from '../assets/auth_bg.png';

interface AuthScreenProps {
    initialMode?: 'login' | 'signup';
}

const AuthScreen: React.FC<AuthScreenProps> = ({ initialMode = 'login' }) => {
    const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const navigate = useNavigate();
    const { loginWithGoogle, loginWithDemo, logout, isAuthenticated } = useAuth();

    React.useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard');
        }
    }, [isAuthenticated, navigate]);

    const handleAuthResult = async (result: { success: boolean; isNewUser?: boolean; error?: string }) => {
        if (result.success) {
            if (mode === 'login') {
                if (result.isNewUser) {
                    await logout();
                    setError("No account found. Please sign up first.");
                    setMode('signup');
                    setLoading(false);
                } else {
                    navigate('/dashboard');
                }
            } else {
                if (!result.isNewUser) {
                    setError("Account already exists. Please log in.");
                    setMode('login');
                    setLoading(false);
                } else {
                    await logout();
                    setSuccessMessage("Account created successfully! Please log in to continue.");
                    setMode('login');
                    setLoading(false);
                }
            }
        } else {
            throw new Error(result.error || 'Authentication failed');
        }
    };

    const handleGoogleSignIn = async () => {
        setLoading(true);
        setError(null);
        setSuccessMessage(null);
        try {
            const result = await loginWithGoogle();
            await handleAuthResult(result);
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Google sign-in failed';
            setError(errorMessage);
            setLoading(false);
        }
    };

    const handleDemoSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccessMessage(null);
        try {
            const result = await loginWithDemo(username, password);
            if (result.success) {
                navigate('/dashboard');
            } else {
                setError(result.error || 'Invalid credentials');
                setLoading(false);
            }
        } catch (err: unknown) {
            setError('Demo sign-in failed');
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden font-sans">
            {/* Background Layer with Depth */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000"
                style={{
                    backgroundImage: `url(${authBg})`,
                    transform: 'scale(1.1)'
                }}
            />
            <div className="absolute inset-0 bg-white/30 dark:bg-black/40 backdrop-blur-sm" />

            {/* Back Button */}
            <div className="absolute top-8 left-8 z-50">
                <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-full bg-white/20 backdrop-blur-md p-3 hover:bg-white/40 border border-white/20 transition-all"
                    onClick={() => navigate('/')}
                >
                    <MoveLeft size={24} className="text-gray-900 dark:text-white" />
                </Button>
            </div>

            {/* Glass Card Container */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative z-10 w-[95%] max-w-sm sm:max-w-md bg-white/40 dark:bg-white/5 backdrop-blur-2xl rounded-[48px] border border-white/50 dark:border-white/10 shadow-2xl overflow-hidden px-4 py-4 sm:px-6 sm:py-6"
            >
                {/* Header Image Section */}
                <div className="relative rounded-[36px] overflow-hidden aspect-[16/11] mb-8 shadow-inner group">
                    <img
                        src={cozyDesk}
                        alt="Workspace Aesthetic"
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-1000"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-60" />
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/20 backdrop-blur-xl px-4 py-1.5 rounded-full border border-white/30">
                        <span className="text-white text-[10px] uppercase tracking-[0.25em] font-black drop-shadow-sm">Community</span>
                    </div>
                </div>

                {/* Content Section */}
                <div className="text-center mb-8 px-4">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">
                        {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 text-sm opacity-90">
                        {mode === 'login' ? 'Connect and explore your community.' : 'Join the collective and start tracking.'}
                    </p>
                </div>

                {/* Alert Messages */}
                <AnimatePresence mode="wait">
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                            animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                            className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold px-4 py-3 rounded-2xl flex items-center gap-2 overflow-hidden mx-2"
                        >
                            <AlertCircle size={14} />
                            {error}
                        </motion.div>
                    )}

                    {successMessage && (
                        <motion.div
                            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                            animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                            className="bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 text-xs font-semibold px-4 py-3 rounded-2xl flex items-center gap-2 overflow-hidden mx-2"
                        >
                            <CheckCircle2 size={14} />
                            {successMessage}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Interaction Section */}
                <div className="px-2">
                    <div className="space-y-4">
                        {/* Google Sign-In */}
                        <div className="relative group">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#FFD700] via-[#FF8C00] to-[#FF4500] rounded-[24px] blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
                            <button
                                onClick={handleGoogleSignIn}
                                disabled={loading}
                                className="relative w-full bg-white/80 dark:bg-white/10 hover:bg-white dark:hover:bg-white/20 transition-all duration-300 rounded-[22px] flex items-center justify-center gap-4 border border-white/60 dark:border-white/10 shadow-xl py-4"
                            >
                                {loading ? (
                                    <div className="w-6 h-6 border-[3px] border-gray-200 border-t-orange-500 rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <div className="bg-white p-1.5 rounded-lg shadow-sm">
                                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                            </svg>
                                        </div>
                                        <span className="font-bold text-gray-900 dark:text-white tracking-tight">
                                            {mode === 'login' ? 'Sign in with Google' : 'Sign up with Google'}
                                        </span>
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Divider */}
                        <div className="relative py-4">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300 dark:border-white/10" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-[#f0f2f5] dark:bg-[#1a1a1a] px-2 text-gray-500 font-bold tracking-widest">Or Use Demo</span>
                            </div>
                        </div>

                        {/* Demo Login Form */}
                        <form onSubmit={handleDemoSignIn} className="space-y-4">
                            <div className="space-y-2">
                                <input
                                    type="text"
                                    placeholder="Username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full bg-white/50 dark:bg-white/5 border border-white/60 dark:border-white/10 rounded-2xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all font-medium"
                                />
                                <input
                                    type="password"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-white/50 dark:bg-white/5 border border-white/60 dark:border-white/10 rounded-2xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all font-medium"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-orange-500/20 transform active:scale-[0.98] transition-all disabled:opacity-50"
                            >
                                {loading && username ? 'Authenticating...' : 'Demo Login'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Footer Section */}
                <div className="mt-8 px-4">
                    <label className="flex items-start gap-3 cursor-pointer group">
                        <div className="relative mt-0.5">
                            <input
                                type="checkbox"
                                defaultChecked
                                className="peer appearance-none w-5 h-5 rounded-md border-2 border-gray-300 dark:border-white/20 checked:bg-orange-500 checked:border-orange-500 transition-all cursor-pointer"
                            />
                            <svg className="absolute inset-0 w-5 h-5 p-1 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                        </div>
                        <span className="text-[11px] leading-relaxed text-gray-600 dark:text-gray-400 select-none">
                            By signing in, you agree to our <span className="text-gray-900 dark:text-white font-bold hover:underline cursor-pointer">Terms of Service</span> and <span className="text-gray-900 dark:text-white font-bold hover:underline cursor-pointer">Privacy Policy</span>.
                        </span>
                    </label>

                    <div className="mt-8 flex flex-col items-center gap-2">
                        <button
                            onClick={() => {
                                setMode(mode === 'login' ? 'signup' : 'login');
                                setError(null);
                                setSuccessMessage(null);
                            }}
                            className="text-sm font-semibold text-gray-900 dark:text-white hover:text-orange-600 dark:hover:text-orange-400 transition-colors py-2"
                        >
                            {mode === 'login' ? "New here? Create Account" : "Joined already? Log in"}
                        </button>
                        <div className="h-1 w-12 bg-gray-200 dark:bg-white/10 rounded-full" />
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default AuthScreen;
