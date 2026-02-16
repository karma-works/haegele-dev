import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  type ReactNode,
  type MutableRefObject,
} from 'react';

export interface WaveEngine {
  pluck(intensity: number): void;
  setHeartbeat(active: boolean): void;
  setColor(color: string): void;
  updateViewport(width: number, height: number): void;
  destroy(): void;
}

export interface PianoEngine {
  play(note: string, velocity?: number): void;
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

  const value: EffectsController = {
    wavePluck,
    waveSetHeartbeat,
    isMuted,
    setIsMuted: handleSetIsMuted,
    activeSection,
    setActiveSection: handleSetActiveSection,
    waveEngineRef,
    pianoEngineRef,
  };

  return (
    <EffectsContext.Provider value={value}>{children}</EffectsContext.Provider>
  );
}

export { EffectsContext };
