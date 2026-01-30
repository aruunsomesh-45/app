import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import loginBgVideo from '../assets/login-bg.mp4';

const WelcomeScreen: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col h-screen bg-white font-sans overflow-hidden">
            {/* 1) Top Hero Media Area (~60% screen height) */}
            <div className="relative h-[62%] w-full overflow-hidden bg-black">
                {/* Background Video */}
                <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-cover opacity-90"
                >
                    <source src={loginBgVideo} type="video/mp4" />
                    <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4" />
                </video>

                {/* Overlay Gradient for Text Readability */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />

                {/* 3) Hero Text Overlay (upper-middle area) */}
                <div className="absolute inset-0 flex flex-col items-center justify-center -mt-10 text-center z-10 px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1.2, ease: 'easeOut' }}
                    >
                        <h1 className="text-white text-4xl font-serif mb-2 drop-shadow-xl" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                            Upgrade Your Life
                        </h1>
                        <p className="text-white text-xs tracking-[0.8em] uppercase font-light drop-shadow-lg opacity-90">
                            IN SILENCE.
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* 4) Bottom White Card (Welcome Sheet) - Slightly overlapping */}
            <div className="relative flex-1 bg-white rounded-t-[40px] -mt-10 z-20 px-8 pt-10 pb-10 flex flex-col items-center shadow-[0_-15px_40px_rgba(0,0,0,0.12)]">
                {/* 5) Card Content (center aligned) */}
                <div className="text-center w-full mb-10">
                    <motion.h2
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-2xl font-black text-black mb-3 uppercase tracking-tighter"
                    >
                        WELCOME
                    </motion.h2>
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="space-y-1"
                    >
                        <p className="text-gray-500 text-[14px] font-medium leading-tight">
                            Find your next space, feel at home
                        </p>
                        <p className="text-gray-500 text-[14px] font-medium leading-tight">
                            Where comfort meets convenience
                        </p>
                    </motion.div>
                </div>

                {/* 6) Buttons (pill shaped, stacked) */}
                <div className="w-full space-y-4 max-w-xs">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate('/dashboard')}
                        className="w-full bg-black text-white py-[18px] rounded-full font-bold text-[16px] shadow-2xl active:bg-gray-900 transition-all uppercase tracking-wide"
                    >
                        Login
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full bg-white border-2 border-gray-100 text-gray-900 py-[18px] rounded-full font-bold text-[16px] hover:bg-gray-50 transition-all uppercase tracking-wide"
                    >
                        Sign Up
                    </motion.button>
                </div>

                {/* Extra spacer for mobile bottom safety */}
                <div className="h-6 w-full" />
            </div>
        </div>
    );
};

export default WelcomeScreen;

