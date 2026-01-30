import { useEffect, useCallback, useState } from 'react';
import type { ReactNode } from 'react';
import Lenis from 'lenis';
import { LenisContext } from '../hooks/useLenis';

interface LenisProviderProps {
    children: ReactNode;
}

export const LenisProvider = ({ children }: LenisProviderProps) => {
    const [lenis, setLenis] = useState<Lenis | null>(null);

    useEffect(() => {
        // Initialize Lenis with smooth scrolling settings
        const instance = new Lenis({
            duration: 1.2, // Scroll animation duration
            easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Smooth easing
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            wheelMultiplier: 1,
            touchMultiplier: 2,
            infinite: false,
        });

        // Animation frame loop for smooth scrolling
        let animationId: number;
        function raf(time: number) {
            instance.raf(time);
            animationId = requestAnimationFrame(raf);
        }

        animationId = requestAnimationFrame(raf);

        // Use setTimeout to set state asynchronously (avoids set-state-in-effect warning)
        const timeoutId = setTimeout(() => setLenis(instance), 0);

        // Cleanup
        return () => {
            clearTimeout(timeoutId);
            cancelAnimationFrame(animationId);
            instance.destroy();
        };
    }, []);

    const scrollTo = useCallback((target: string | number | HTMLElement, options?: object) => {
        lenis?.scrollTo(target, options);
    }, [lenis]);

    return (
        <LenisContext.Provider value={{ lenis, scrollTo }}>
            {children}
        </LenisContext.Provider>
    );
};

export default LenisProvider;
