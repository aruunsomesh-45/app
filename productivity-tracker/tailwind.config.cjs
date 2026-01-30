/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class',
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                display: ['Montserrat', 'sans-serif'],
                serif: ['Playfair Display', 'serif'],
            },
            colors: {
                // Dior-Inspired Luxury Palette
                primary: "#847777", // Rosy Granite - for buttons and accents

                // Dark Mode Colors
                "background-dark": "#333333", // Graphite - primary dark background
                "surface-dark": "#1A1A1A", // Carbon Black - cards/surfaces
                "text-dark": "#000000", // Black - main text (high contrast)
                "subtext-dark": "#CCCCCC", // Silver - secondary text
                "border-dark": "#1A1A1A", // Carbon Black - borders
                "highlight-dark": "#F5F5F5", // White Smoke - icons/highlights

                // Light Mode Colors
                "background-light": "#F5F5F5", // White Smoke - primary light background
                "surface-light": "#FFFFFF", // Pure White - cards/surfaces
                "text-light": "#333333", // Graphite - main text
                "heading-light": "#000000", // Black - headings
                "subtext-light": "#DDDDDD", // Alabaster Grey - secondary text
                "border-light": "#CCCCCC", // Silver - borders/dividers

                // Shared Accent Colors
                "accent": "#847777", // Rosy Granite - buttons, CTAs
                "graphite": "#333333",
                "silver": "#CCCCCC",
                "rosy-granite": "#847777",
                "carbon-black": "#1A1A1A",
                "white-smoke": "#F5F5F5",
                "alabaster-grey": "#DDDDDD",
            },
            boxShadow: {
                'soft': '0 10px 40px -10px rgba(132, 119, 119, 0.15)', // Rosy Granite soft shadow
                'glow': '0 0 20px -5px rgba(132, 119, 119, 0.4)', // Rosy Granite glow
                'luxury': '0 20px 60px -15px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(132, 119, 119, 0.05)',
                'elegant': '0 4px 20px rgba(132, 119, 119, 0.12)',
            },
            borderRadius: {
                '4xl': '2.5rem',
            }
        },
    },
    plugins: [],
}
