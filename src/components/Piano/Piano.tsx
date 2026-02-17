import { useState, useCallback, useRef, useEffect, memo } from 'react';
import { PianoKey } from './PianoKey';
import {
  WHITE_KEY_NOTES,
  BLACK_KEY_NOTES,
  noteToFrequency,
  type PianoKeyRange,
} from '../../utils/pianoKeyboard';
import { useEffects } from '../../contexts/EffectsContext';
import styles from './Piano.module.css';

export interface PianoProps {
  keyRange: PianoKeyRange;
  activeNotesFromKeyboard?: Set<string>;
  showLabels?: boolean;
  className?: string;
}

interface KeyInfo {
  note: string;
  isSharp: boolean;
}

function generateKeyLayout(range: PianoKeyRange): { whiteKeys: KeyInfo[]; blackKeyMap: Map<string, KeyInfo> } {
  const whiteKeys: KeyInfo[] = [];
  const blackKeyMap = new Map<string, KeyInfo>();
  
  const { startOctave, whiteKeyCount } = range;
  let keyIndex = 0;
  
  for (let octaveOffset = 0; octaveOffset < Math.ceil(whiteKeyCount / 7); octaveOffset++) {
    const currentOctave = startOctave + octaveOffset;
    
    for (let noteIndex = 0; noteIndex < 7 && keyIndex < whiteKeyCount; noteIndex++) {
      const whiteNote = WHITE_KEY_NOTES[noteIndex];
      
      if (whiteNote) {
        whiteKeys.push({
          note: `${whiteNote}${currentOctave}`,
          isSharp: false,
        });
      }
      
      const blackNote = BLACK_KEY_NOTES[noteIndex];
      
      if (blackNote) {
        const blackKeyInfo: KeyInfo = {
          note: `${blackNote}${currentOctave}`,
          isSharp: true,
        };
        blackKeyMap.set(`${whiteNote}${currentOctave}`, blackKeyInfo);
      }
      
      keyIndex++;
    }
  }
  
  return { whiteKeys, blackKeyMap };
}

function PianoComponent({
  keyRange,
  activeNotesFromKeyboard,
  showLabels = true,
  className,
}: PianoProps) {
  const effects = useEffects();
  const [activeNotes, setActiveNotes] = useState<Set<string>>(new Set());
  const activeNotesRef = useRef<Set<string>>(activeNotes);
  
  const { whiteKeys, blackKeyMap } = generateKeyLayout(keyRange);
  
  useEffect(() => {
    activeNotesRef.current = activeNotes;
  }, [activeNotes]);

  const handleNoteStart = useCallback(
    (note: string, velocity: number) => {
      setActiveNotes((prev) => {
        const next = new Set(prev);
        next.add(note);
        return next;
      });
      
      const frequency = noteToFrequency(note);
      
      if (!effects.isMuted) {
        effects.pianoEngineRef.current?.play(note, velocity);
      }
      
      effects.waveSetMode('oscilloscope');
      effects.wavePluck(frequency / 1000);
    },
    [effects]
  );

  const handleNoteEnd = useCallback(
    (note: string) => {
      setActiveNotes((prev) => {
        const next = new Set(prev);
        next.delete(note);
        return next;
      });
      
      if (!effects.isMuted) {
        effects.pianoEngineRef.current?.stop(note);
      }
    },
    [effects]
  );

  const isNoteActive = useCallback(
    (note: string) => {
      return activeNotes.has(note) || activeNotesFromKeyboard?.has(note) || false;
    },
    [activeNotes, activeNotesFromKeyboard]
  );

  return (
    <div className={`${styles.piano} ${className || ''}`} role="application" aria-label="Piano keyboard">
      <div className={styles.keyboard}>
        {whiteKeys.map((keyInfo) => {
          const blackKey = blackKeyMap.get(keyInfo.note);
          
          return (
            <div key={keyInfo.note} className={styles.whiteKeyWrapper}>
              <PianoKey
                note={keyInfo.note}
                isSharp={false}
                isActive={isNoteActive(keyInfo.note)}
                onNoteStart={handleNoteStart}
                onNoteEnd={handleNoteEnd}
              />
              {blackKey && (
                <PianoKey
                  note={blackKey.note}
                  isSharp={true}
                  isActive={isNoteActive(blackKey.note)}
                  onNoteStart={handleNoteStart}
                  onNoteEnd={handleNoteEnd}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export const Piano = memo(PianoComponent);
