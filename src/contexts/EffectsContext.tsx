import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
  type ReactNode,
  type MutableRefObject,
} from 'react';
import { getPianoEngine } from '../audio/PianoEngine';

export interface WaveEngine {
  pluck(intensity: number): void;
  setHeartbeat(active: boolean): void;
  setColor(color: string): void;
  updateViewport(width: number, height: number): void;
  destroy(): void;
}

export interface PianoEngine {
  play(note: string, velocity?: number): Promise<void>;
  stop(note: string): void;
  onNoteTrigger(callback: (freq: number) => void): void;
  destroy(): void;
}

export interface EffectsController {
  wavePluck(intensity: number): void;
  waveSetHeartbeat(active: boolean): void;
  isMuted: boolean;
  setIsMuted(value: boolean): void;
  activeSection: string;
  setActiveSection(section: string): void;
  waveEngineRef: MutableRefObject<WaveEngine | null>;
  pianoEngineRef: MutableRefObject<PianoEngine | null>;
  initPianoEngine: () => Promise<void>;
}

const EffectsContext = createContext<EffectsController | null>(null);

export function useEffects(): EffectsController {
  const context = useContext(EffectsContext);
  if (!context) {
    throw new Error('useEffects must be used within an EffectsProvider');
  }
  return context;
}

interface EffectsProviderProps {
  children: ReactNode;
}

export function EffectsProvider({ children }: EffectsProviderProps) {
  const waveEngineRef = useRef<WaveEngine | null>(null);
  const pianoEngineRef = useRef<PianoEngine | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const pianoInitRef = useRef(false);

  const wavePluck = useCallback((intensity: number) => {
    waveEngineRef.current?.pluck(intensity);
  }, []);

  const waveSetHeartbeat = useCallback((active: boolean) => {
    waveEngineRef.current?.setHeartbeat(active);
  }, []);

  const handleSetIsMuted = useCallback((value: boolean) => {
    setIsMuted(value);
  }, []);

  const handleSetActiveSection = useCallback((section: string) => {
    setActiveSection(section);
  }, []);

  const initPianoEngine = useCallback(async () => {
    if (pianoEngineRef.current || pianoInitRef.current) return;
    
    pianoInitRef.current = true;
    
    try {
      const engine = await getPianoEngine();
      pianoEngineRef.current = engine;
    } catch (error) {
      console.error('Failed to initialize piano engine:', error);
      pianoInitRef.current = false;
    }
  }, []);

  useEffect(() => {
    const handleFirstInteraction = () => {
      initPianoEngine();
    };

    document.addEventListener('click', handleFirstInteraction, { once: true });
    document.addEventListener('keydown', handleFirstInteraction, { once: true });
    document.addEventListener('touchstart', handleFirstInteraction, { once: true });

    return () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, [initPianoEngine]);

  const value: EffectsController = {
    wavePluck,
    waveSetHeartbeat,
    isMuted,
    setIsMuted: handleSetIsMuted,
    activeSection,
    setActiveSection: handleSetActiveSection,
    waveEngineRef,
    pianoEngineRef,
    initPianoEngine,
  };

  return (
    <EffectsContext.Provider value={value}>{children}</EffectsContext.Provider>
  );
}

export { EffectsContext };
