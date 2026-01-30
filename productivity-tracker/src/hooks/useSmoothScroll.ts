import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const useSmoothScroll = () => {
    const { pathname } = useLocation();
    const lenisRef = useRef<Lenis | null>(null);

    useEffect(() => {
        // Accessibility check
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) {
            return;
        }

        const lenis = new Lenis({
            duration: 1.0, // Fast but smooth
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            wheelMultiplier: 1.2,
            touchMultiplier: 2,
            infinite: false,
            // No wrapper/content - use window-based scrolling
        });

        lenisRef.current = lenis;

        // Add lenis class to html for CSS hooks
        document.documentElement.classList.add('lenis', 'lenis-smooth');

        // Connect Lenis to GSAP ScrollTrigger
        lenis.on('scroll', ScrollTrigger.update);

        // Animation frame loop
        function raf(time: number) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);

        // Disable GSAP lag smoothing for better sync
        gsap.ticker.lagSmoothing(0);

        return () => {
            document.documentElement.classList.remove('lenis', 'lenis-smooth');
            lenis.destroy();
            lenisRef.current = null;
        };
    }, []);

    // Reset scroll on route change
    useEffect(() => {
        if (lenisRef.current) {
            // Immediate reset
            lenisRef.current.scrollTo(0, { immediate: true });

            // Forced check after render to handle dynamic height changes
            setTimeout(() => {
                lenisRef.current?.scrollTo(0, { immediate: true });
                ScrollTrigger.refresh();
            }, 100);
        } else {
            window.scrollTo(0, 0);
        }
    }, [pathname]);

    return lenisRef;
};

