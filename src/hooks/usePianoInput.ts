import { useEffect, useCallback, useRef } from 'react';
import {
  getKeyNote,
  noteToFrequency,
  isPianoKey,
  type PianoKeyEvent,
} from '../utils/pianoKeyboard.ts';
import { useEffects } from '../contexts/EffectsContext.tsx';
import { useResponsivePianoKeys } from './useResponsivePianoKeys.ts';

export interface UsePianoInputOptions {
  enabled?: boolean;
  onNoteOn?: (note: string, velocity: number, frequency: number) => void;
  onNoteOff?: (note: string) => void;
}

export interface PianoInputController {
  activeNotes: Set<string>;
}

export function usePianoInput(options: UsePianoInputOptions = {}): PianoInputController {
  const { enabled = true, onNoteOn, onNoteOff } = options;
  const effects = useEffects();
  const activeNotesRef = useRef<Set<string>>(new Set());
  const isKeyDownRef = useRef<Set<string>>(new Set());
  
  useResponsivePianoKeys();

  const triggerNote = useCallback((keyEvent: PianoKeyEvent) => {
    const { note, velocity } = keyEvent;
    
    if (activeNotesRef.current.has(note)) {
      return;
    }
    
    activeNotesRef.current.add(note);
    
    const frequency = noteToFrequency(note);
    
    if (!effects.isMuted) {
      effects.pianoEngineRef.current?.play(note, velocity);
    }
    
    effects.wavePluck(frequency / 1000);
    
    onNoteOn?.(note, velocity, frequency);
  }, [effects, onNoteOn]);

  const releaseNote = useCallback((note: string) => {
    if (!activeNotesRef.current.has(note)) {
      return;
    }
    
    activeNotesRef.current.delete(note);
    
    if (!effects.isMuted) {
      effects.pianoEngineRef.current?.stop(note);
    }
    
    onNoteOff?.(note);
  }, [effects, onNoteOff]);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (!isPianoKey(e.key)) return;
      
      const keyEvent = getKeyNote(e.key);
      if (!keyEvent) return;
      
      const keyId = e.key.toLowerCase();
      if (isKeyDownRef.current.has(keyId)) return;
      
      isKeyDownRef.current.add(keyId);
      triggerNote(keyEvent);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!isPianoKey(e.key)) return;
      
      const keyEvent = getKeyNote(e.key);
      if (!keyEvent) return;
      
      const keyId = e.key.toLowerCase();
      isKeyDownRef.current.delete(keyId);
      releaseNote(keyEvent.note);
    };

    const handleBlur = () => {
      activeNotesRef.current.forEach((note) => {
        releaseNote(note);
      });
      isKeyDownRef.current.clear();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [enabled, triggerNote, releaseNote]);

  return {
    activeNotes: activeNotesRef.current,
  };
}
