import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
  type ReactNode,
  type MutableRefObject,
} from "react";
import { getPianoEngine } from "../audio/PianoEngine";
import { getAudioAnalyzer } from "../audio/AudioAnalyzerService";
import type {
  AudioAnalyzerServiceImpl,
  TimeDomainData,
} from "../audio/AudioAnalyzerService";
import type { WaveMode } from "../types/index.ts";

export interface WaveEngine {
  pluck(intensity: number): void;
  setHeartbeat(active: boolean): void;
  setMode(mode: WaveMode): void;
  getMode(): WaveMode;
  setColor(color: string): void;
  updateViewport(width: number, height: number): void;
  setAudioAnalyzer(analyzer: AudioAnalyzerServiceImpl | null): void;
  setAudioData(data: TimeDomainData | null): void;
  destroy(): void;
}

export interface PianoEngine {
  play(note: string, velocity?: number): Promise<void>;
  stop(note: string): void;
  onNoteTrigger(callback: (freq: number) => void): void;
  setAudioAnalyzer(analyzer: AudioAnalyzerServiceImpl | null): void;
  destroy(): void;
}

export interface EffectsController {
  wavePluck(intensity: number): void;
  waveSetHeartbeat(active: boolean): void;
  waveSetMode(mode: WaveMode): void;
  waveSetAudioData(data: TimeDomainData | null): void;
  onPianoActivity(): void;
  scheduleReturnToIdle(): void;
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
    throw new Error("useEffects must be used within an EffectsProvider");
  }
  return context;
}

interface EffectsProviderProps {
  children: ReactNode;
}

const SCREENSAVER_DELAY_MS = 2000;

export function EffectsProvider({ children }: EffectsProviderProps) {
  const waveEngineRef = useRef<WaveEngine | null>(null);
  const pianoEngineRef = useRef<PianoEngine | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");
  const pianoInitRef = useRef(false);
  const screensaverTimeoutRef = useRef<number | null>(null);

  const cancelScreensaver = useCallback(() => {
    if (screensaverTimeoutRef.current !== null) {
      clearTimeout(screensaverTimeoutRef.current);
      screensaverTimeoutRef.current = null;
    }
  }, []);

  const scheduleReturnToIdle = useCallback(() => {
    cancelScreensaver();
    screensaverTimeoutRef.current = window.setTimeout(() => {
      waveEngineRef.current?.setMode("idle");
    }, SCREENSAVER_DELAY_MS);
  }, [cancelScreensaver]);

  const onPianoActivity = useCallback(() => {
    waveEngineRef.current?.setMode("oscilloscope");
    scheduleReturnToIdle();
  }, [scheduleReturnToIdle]);

  const wavePluck = useCallback((intensity: number) => {
    waveEngineRef.current?.pluck(intensity);
  }, []);

  const waveSetHeartbeat = useCallback((active: boolean) => {
    waveEngineRef.current?.setHeartbeat(active);
  }, []);

  const waveSetMode = useCallback((mode: WaveMode) => {
    waveEngineRef.current?.setMode(mode);
  }, []);

  const waveSetAudioData = useCallback((data: TimeDomainData | null) => {
    waveEngineRef.current?.setAudioData(data);
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

      engine.onNoteTrigger((freq: number) => {
        wavePluck(freq / 1000);
      });

      const analyzer = await getAudioAnalyzer({
        fftSize: 2048,
        smoothingTimeConstant: 0.5,
      });
      engine.setAudioAnalyzer(analyzer);
    } catch (error) {
      console.error("Failed to initialize piano engine:", error);
      pianoInitRef.current = false;
    }
  }, [wavePluck]);

  useEffect(() => {
    const handleFirstInteraction = () => {
      initPianoEngine();
    };

    document.addEventListener("click", handleFirstInteraction, { once: true });
    document.addEventListener("keydown", handleFirstInteraction, {
      once: true,
    });
    document.addEventListener("touchstart", handleFirstInteraction, {
      once: true,
    });

    return () => {
      document.removeEventListener("click", handleFirstInteraction);
      document.removeEventListener("keydown", handleFirstInteraction);
      document.removeEventListener("touchstart", handleFirstInteraction);
    };
  }, [initPianoEngine]);

  const value: EffectsController = {
    wavePluck,
    waveSetHeartbeat,
    waveSetMode,
    waveSetAudioData,
    onPianoActivity,
    scheduleReturnToIdle,
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
