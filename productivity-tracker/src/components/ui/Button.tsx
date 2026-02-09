import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn'; // Assuming you have a utility for merging classes

// Variant styles
const variants = {
    primary: 'bg-black text-white dark:bg-white dark:text-black shadow-xl hover:shadow-2xl active:bg-gray-900 dark:active:bg-gray-100',
    secondary: 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700',
    outline: 'bg-transparent border-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800/50',
    ghost: 'bg-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white',
    danger: 'bg-red-500 text-white hover:bg-red-600 shadow-md hover:shadow-lg',
};

// Size styles
const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
    xl: 'px-8 py-5 text-xl', // For those big hero buttons
};

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
    variant?: keyof typeof variants;
    size?: keyof typeof sizes;
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    fullWidth?: boolean;
    children: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({
        className,
        variant = 'primary',
        size = 'md',
        isLoading = false,
        leftIcon,
        rightIcon,
        fullWidth = false,
        children,
        disabled,
        ...props
    }, ref) => {

        const baseClasses = "relative rounded-2xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 uppercase tracking-wide overflow-hidden";

        return (
            <motion.button
                ref={ref}
                whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
                whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
                className={cn(
                    baseClasses,
                    variants[variant],
                    sizes[size],
                    fullWidth ? 'w-full' : '',
                    className
                )}
                disabled={disabled || isLoading}
                {...props}
            >
                {/* Loading Spinner */}
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-inherit">
                        <Loader2 className="animate-spin" size={20} />
                    </div>
                )}

                {/* Content */}
                <span className={cn("flex items-center gap-2", isLoading ? "opacity-0" : "opacity-100")}>
                    {leftIcon}
                    {children}
                    {rightIcon}
                </span>
            </motion.button>
        );
    }
);

Button.displayName = 'Button';

export default Button;
