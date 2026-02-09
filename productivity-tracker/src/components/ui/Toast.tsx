import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, Info, AlertTriangle, AlertCircle } from 'lucide-react';
import { cn } from '../../utils/cn';

export type ToastType = 'success' | 'info' | 'warning' | 'error';

interface ToastProps {
    message: string;
    type?: ToastType;
    isVisible: boolean;
    onClose: () => void;
    duration?: number;
}

const icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500" />,
    error: <AlertCircle className="w-5 h-5 text-rose-500" />,
};

const bgColors = {
    success: 'bg-emerald-50 border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-800',
    info: 'bg-blue-50 border-blue-100 dark:bg-blue-900/20 dark:border-blue-800',
    warning: 'bg-amber-50 border-amber-100 dark:bg-amber-900/20 dark:border-amber-800',
    error: 'bg-rose-50 border-rose-100 dark:bg-rose-900/20 dark:border-rose-800',
};

const Toast: React.FC<ToastProps> = ({
    message,
    type = 'info',
    isVisible,
    onClose,
    duration = 5000
}) => {
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [isVisible, duration, onClose]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.9 }}
                    transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                    className={cn(
                        "fixed bottom-24 left-1/2 -translate-x-1/2 z-50",
                        "min-w-[300px] max-w-[90vw]",
                        "px-4 py-3 rounded-2xl border shadow-xl backdrop-blur-md",
                        "flex items-center gap-3",
                        bgColors[type]
                    )}
                >
                    <div className="shrink-0">
                        {icons[type]}
                    </div>
                    <p className="flex-1 text-sm font-medium text-slate-800 dark:text-slate-200">
                        {message}
                    </p>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                    >
                        <X className="w-4 h-4 text-slate-400" />
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default Toast;
