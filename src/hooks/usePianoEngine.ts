import { useCallback, useRef } from 'react';
import { getPianoEngine, destroyPianoEngine, PianoEngineImpl } from '../audio/PianoEngine';
import type { PianoEngine } from '../contexts/EffectsContext';

export function usePianoEngine(
  pianoEngineRef: React.MutableRefObject<PianoEngine | null>
): () => Promise<void> {
  const isLoadingRef = useRef(false);

  const initPianoEngine = useCallback(async () => {
    if (pianoEngineRef.current || isLoadingRef.current) return;

    isLoadingRef.current = true;
    
    try {
      const engine = await getPianoEngine();
      pianoEngineRef.current = engine;
    } catch (error) {
      console.error('Failed to initialize piano engine:', error);
    } finally {
      isLoadingRef.current = false;
    }
  }, [pianoEngineRef]);

  return initPianoEngine;
}

export { destroyPianoEngine, getPianoEngine };
export type { PianoEngineImpl };

