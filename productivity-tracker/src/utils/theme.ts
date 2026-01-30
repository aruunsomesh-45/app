/**
 * Dior-Inspired Luxury Theme Utilities
 * 
 * This file provides utility classes and constants for the premium
 * color palette used throughout the application.
 */

// Color Palette
export const COLORS = {
    // Dark Mode
    DARK: {
        BACKGROUND: '#333333',      // Graphite - primary dark background
        SURFACE: '#1A1A1A',         // Carbon Black - cards/surfaces
        TEXT: '#000000',            // Black - main text (high contrast)
        SUBTEXT: '#CCCCCC',         // Silver - secondary text
        BORDER: '#1A1A1A',          // Carbon Black - borders
        HIGHLIGHT: '#F5F5F5',       // White Smoke - icons/highlights
    },

    // Light Mode
    LIGHT: {
        BACKGROUND: '#F5F5F5',      // White Smoke - primary light background
        SURFACE: '#FFFFFF',         // Pure White - cards/surfaces
        TEXT: '#333333',            // Graphite - main text
        HEADING: '#000000',         // Black - headings
        SUBTEXT: '#DDDDDD',         // Alabaster Grey - secondary text
        BORDER: '#CCCCCC',          // Silver - borders/dividers
    },

    // Shared Colors
    ACCENT: '#847777',            // Rosy Granite - buttons, CTAs
    GRAPHITE: '#333333',
    SILVER: '#CCCCCC',
    ROSY_GRANITE: '#847777',
    CARBON_BLACK: '#1A1A1A',
    WHITE_SMOKE: '#F5F5F5',
    ALABASTER_GREY: '#DDDDDD',
    BLACK: '#000000',
    WHITE: '#FFFFFF',
};

// CSS Classes for common patterns
export const THEME_CLASSES = {
    // Background Classes
    BG_PRIMARY: 'bg-background-light dark:bg-background-dark',
    BG_SURFACE: 'bg-surface-light dark:bg-surface-dark',
    BG_ACCENT: 'bg-accent',

    // Text Classes
    TEXT_PRIMARY: 'text-text-light dark:text-text-dark',
    TEXT_HEADING: 'text-heading-light dark:text-text-dark',
    TEXT_SECONDARY: 'text-subtext-light dark:text-subtext-dark',

    // Border Classes
    BORDER: 'border-border-light dark:border-border-dark',
    BORDER_SUBTLE: 'border-border-light/50 dark:border-border-dark/50',

    // Button Classes
    BTN_PRIMARY: 'bg-accent hover:bg-rosy-granite text-white-smoke transition-all duration-300 shadow-elegant hover:shadow-luxury',
    BTN_SECONDARY: 'bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark hover:border-accent transition-all duration-300',
    BTN_GHOST: 'bg-transparent hover:bg-accent/10 text-accent transition-all duration-300',

    // Card Classes
    CARD: 'bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-2xl shadow-soft hover:shadow-luxury transition-all duration-500',
    CARD_ELEVATED: 'bg-surface-light dark:bg-surface-dark rounded-2xl shadow-luxury border border-accent/20',

    // Input Classes
    INPUT: 'bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all duration-300',

    // Premium Effects
    GLASS_EFFECT: 'backdrop-blur-xl bg-surface-light/80 dark:bg-surface-dark/80 border border-border-light/30 dark:border-border-dark/30',
    LUXURY_GRADIENT: 'bg-gradient-to-br from-surface-light to-white-smoke dark:from-surface-dark dark:to-carbon-black',

    // Transitions
    SMOOTH_TRANSITION: 'transition-all duration-500 ease-out',
    QUICK_TRANSITION: 'transition-all duration-300 ease-out',
};

// Inline Styles Generator for dynamic styling
export const getThemeStyles = (isDark: boolean) => ({
    backgroundColor: isDark ? COLORS.DARK.BACKGROUND : COLORS.LIGHT.BACKGROUND,
    color: isDark ? COLORS.DARK.TEXT : COLORS.LIGHT.TEXT,
});

// Utility function to get accent color with opacity
export const getAccentWithOpacity = (opacity: number) => {
    const hex = COLORS.ACCENT.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

// Premium animation variants for framer-motion
export const LUXURY_ANIMATIONS = {
    fadeIn: {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] },
    },
    scaleIn: {
        initial: { opacity: 0, scale: 0.95 },
        animate: { opacity: 1, scale: 1 },
        transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
    },
    slideIn: {
        initial: { opacity: 0, x: -30 },
        animate: { opacity: 1, x: 0 },
        transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] },
    },
    elegant: {
        whileHover: { scale: 1.02, transition: { duration: 0.3 } },
        whileTap: { scale: 0.98 },
    },
};

export default {
    COLORS,
    THEME_CLASSES,
    getThemeStyles,
    getAccentWithOpacity,
    LUXURY_ANIMATIONS,
};
