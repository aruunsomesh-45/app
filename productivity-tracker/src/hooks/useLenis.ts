import { useContext, createContext } from 'react';
import type Lenis from 'lenis';

// Lenis context for accessing the instance anywhere in the app
export interface LenisContextType {
    lenis: Lenis | null;
    scrollTo: (target: string | number | HTMLElement, options?: object) => void;
}

export const LenisContext = createContext<LenisContextType>({
    lenis: null,
    scrollTo: () => { },
});

export const useLenis = () => useContext(LenisContext);
