import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';

export interface ReduceMotionContextValue {
  isReducedMotion: boolean;
  disableNonCritical: boolean;
  setDisableNonCritical: (value: boolean) => void;
}

const ReduceMotionContext = createContext<ReduceMotionContextValue | null>(
  null
);

export function useReducedMotion(): ReduceMotionContextValue {
  const context = useContext(ReduceMotionContext);
  if (!context) {
    throw new Error(
      'useReducedMotion must be used within a ReduceMotionProvider'
    );
  }
  return context;
}

export function useShouldAnimate() {
  const { isReducedMotion, disableNonCritical } = useReducedMotion();
  return {
    shouldAnimate: !isReducedMotion,
    shouldAnimateNonCritical: !isReducedMotion && !disableNonCritical,
  };
}

interface ReduceMotionProviderProps {
  children: ReactNode;
}

function getPrefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function ReduceMotionProvider({ children }: ReduceMotionProviderProps) {
  const [isReducedMotion, setIsReducedMotion] = useState(getPrefersReducedMotion);
  const [disableNonCritical, setDisableNonCritical] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const handleChange = (event: MediaQueryListEvent | MediaQueryList) => {
      const reduced = event.matches;
      setIsReducedMotion(reduced);
      if (reduced) {
        setDisableNonCritical(true);
      }
      document.documentElement.setAttribute(
        'data-reduced-motion',
        String(reduced)
      );
    };

    handleChange(mediaQuery);

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const value: ReduceMotionContextValue = {
    isReducedMotion,
    disableNonCritical,
    setDisableNonCritical,
  };

  return (
    <ReduceMotionContext.Provider value={value}>
      {children}
    </ReduceMotionContext.Provider>
  );
}

export { ReduceMotionContext };
