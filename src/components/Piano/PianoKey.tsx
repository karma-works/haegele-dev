import { useCallback, useRef, memo } from 'react';
import styles from './Piano.module.css';

export interface PianoKeyProps {
  note: string;
  isSharp: boolean;
  isActive: boolean;
  onNoteStart: (note: string, velocity: number) => void;
  onNoteEnd: (note: string) => void;
  velocity?: number;
  label?: string;
}

function PianoKeyComponent({
  note,
  isSharp,
  isActive,
  onNoteStart,
  onNoteEnd,
  velocity = 0.7,
  label,
}: PianoKeyProps) {
  const isPressedRef = useRef(false);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      if (isPressedRef.current) return;
      isPressedRef.current = true;
      
      const target = e.target as HTMLElement;
      if (target.setPointerCapture) {
        target.setPointerCapture(e.pointerId);
      }
      
      onNoteStart(note, velocity);
    },
    [note, velocity, onNoteStart]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      
      if (!isPressedRef.current) return;
      isPressedRef.current = false;
      
      onNoteEnd(note);
    },
    [note, onNoteEnd]
  );

  const handlePointerLeave = useCallback(
    (e: React.PointerEvent) => {
      if (isPressedRef.current) {
        isPressedRef.current = false;
        onNoteEnd(note);
      }
    },
    [note, onNoteEnd]
  );

  const handlePointerCancel = useCallback(
    (e: React.PointerEvent) => {
      if (isPressedRef.current) {
        isPressedRef.current = false;
        onNoteEnd(note);
      }
    },
    [note, onNoteEnd]
  );

  const className = isSharp
    ? `${styles.blackKey} ${isActive ? styles.blackKeyActive : ''}`
    : `${styles.whiteKey} ${isActive ? styles.whiteKeyActive : ''}`;

  return (
    <button
      type="button"
      className={className}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      onPointerCancel={handlePointerCancel}
      aria-label={`${note} key${label ? ` (${label})` : ''}`}
      aria-pressed={isActive}
      data-note={note}
      data-sharp={isSharp}
    >
      {label && <span className={styles.keyLabel}>{label}</span>}
    </button>
  );
}

export const PianoKey = memo(PianoKeyComponent);
