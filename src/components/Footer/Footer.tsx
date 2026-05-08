import { memo, useState, useCallback, useRef, useEffect } from "react";
import { Piano } from "../Piano";
import { useResponsivePianoKeys } from "../../hooks/useResponsivePianoKeys";
import { type PianoKeyRange } from "../../utils/pianoKeyboard";
import { useEffects } from "../../contexts/EffectsContext";
import styles from "./Footer.module.css";

interface ThemeColor {
  accent: string;
  glow: string;
}

const NOTE_COLORS: Record<string, ThemeColor> = {
  C: { accent: "#10b981", glow: "rgba(16, 185, 129, 0.2)" },
  "C#": { accent: "#059669", glow: "rgba(5, 150, 105, 0.2)" },
  D: { accent: "#14b8a6", glow: "rgba(20, 184, 166, 0.2)" },
  "D#": { accent: "#06b6d4", glow: "rgba(6, 182, 212, 0.2)" },
  E: { accent: "#3b82f6", glow: "rgba(59, 130, 246, 0.2)" },
  F: { accent: "#6366f1", glow: "rgba(99, 102, 241, 0.2)" },
  "F#": { accent: "#8b5cf6", glow: "rgba(139, 92, 246, 0.2)" },
  G: { accent: "#a855f7", glow: "rgba(168, 85, 247, 0.2)" },
  "G#": { accent: "#d946ef", glow: "rgba(217, 70, 239, 0.2)" },
  A: { accent: "#ec4899", glow: "rgba(236, 72, 153, 0.2)" },
  "A#": { accent: "#f43f5e", glow: "rgba(244, 63, 94, 0.2)" },
  B: { accent: "#f97316", glow: "rgba(249, 115, 22, 0.2)" },
};

const FOOTER_PIANO_RANGE: PianoKeyRange = {
  startOctave: 3,
  whiteKeyCount: 22,
};

function getNoteBase(note: string): string {
  return note.replace(/\d+$/, "");
}

const DEFAULT_THEME: ThemeColor = {
  accent: "#10b981",
  glow: "rgba(16, 185, 129, 0.15)",
};

function getThemeColorForNotes(notes: Set<string>): ThemeColor {
  if (notes.size === 0) {
    return DEFAULT_THEME;
  }

  const noteArray = Array.from(notes);
  const lastNote = noteArray[noteArray.length - 1];
  if (!lastNote) {
    return NOTE_COLORS["C"] ?? DEFAULT_THEME;
  }
  const baseNote = getNoteBase(lastNote);

  return NOTE_COLORS[baseNote] ?? NOTE_COLORS["C"] ?? DEFAULT_THEME;
}

export const Footer = memo(function Footer() {
  const effects = useEffects();
  const { keyRange } = useResponsivePianoKeys();
  const [activeNotes, setActiveNotes] = useState<Set<string>>(new Set());
  const [themeColor, setThemeColor] = useState<ThemeColor>(
    NOTE_COLORS["C"] ?? DEFAULT_THEME,
  );
  const activeNotesRef = useRef<Set<string>>(activeNotes);
  const isKeyDownRef = useRef<Set<string>>(new Set());

  const adjustedKeyRange =
    keyRange.whiteKeyCount >= 15 ? keyRange : FOOTER_PIANO_RANGE;

  useEffect(() => {
    activeNotesRef.current = activeNotes;
    const color = getThemeColorForNotes(activeNotes);
    setThemeColor(color);
  }, [activeNotes]);

  const handleNoteOn = useCallback(
    (note: string, velocity: number) => {
      setActiveNotes((prev) => {
        const next = new Set(prev);
        next.add(note);
        return next;
      });

      if (!effects.isMuted) {
        effects.pianoEngineRef.current?.play(note, velocity);
      }
      effects.onPianoActivity();
    },
    [effects],
  );

  const handleNoteOff = useCallback(
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
    [effects],
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;

      const key = e.key.toLowerCase();
      const keyMap = {
        a: "C",
        w: "C#",
        s: "D",
        e: "D#",
        d: "E",
        f: "F",
        t: "F#",
        g: "G",
        y: "G#",
        h: "A",
        u: "A#",
        j: "B",
        k: "C",
        o: "C#",
        l: "D",
      };

      const noteBase = keyMap[key as keyof typeof keyMap];
      if (!noteBase) return;

      const keyId = key;
      if (isKeyDownRef.current.has(keyId)) return;

      isKeyDownRef.current.add(keyId);

      const octave =
        noteBase === "C" ||
        noteBase === "C#" ||
        noteBase === "D" ||
        noteBase === "D#" ||
        noteBase === "E" ||
        noteBase === "F"
          ? key === "k" || key === "o" || key === "l"
            ? 5
            : 4
          : 4;

      const note = `${noteBase}${octave}`;
      handleNoteOn(note, 0.7);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const keyMap = {
        a: "C",
        w: "C#",
        s: "D",
        e: "D#",
        d: "E",
        f: "F",
        t: "F#",
        g: "G",
        y: "G#",
        h: "A",
        u: "A#",
        j: "B",
        k: "C",
        o: "C#",
        l: "D",
      };

      const noteBase = keyMap[key as keyof typeof keyMap];
      if (!noteBase) return;

      isKeyDownRef.current.delete(key);

      const octave =
        noteBase === "C" ||
        noteBase === "C#" ||
        noteBase === "D" ||
        noteBase === "D#" ||
        noteBase === "E" ||
        noteBase === "F"
          ? key === "k" || key === "o" || key === "l"
            ? 5
            : 4
          : 4;

      const note = `${noteBase}${octave}`;
      handleNoteOff(note);
    };

    const handleBlur = () => {
      activeNotesRef.current.forEach((note) => {
        handleNoteOff(note);
      });
      isKeyDownRef.current.clear();
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleBlur);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleBlur);
    };
  }, [handleNoteOn, handleNoteOff]);

  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div
        className={styles.footerGlow}
        style={
          {
            "--glow-color": themeColor.glow,
          } as React.CSSProperties
        }
      />

      <div className={styles.container}>
        <div className={styles.pianoWrapper}>
          <span className={styles.pianoLabel}>Play a tune</span>
          <div className={styles.footerPiano}>
            <Piano keyRange={adjustedKeyRange} showLabels={false} />
          </div>
        </div>

        <div className={styles.content}>
          <div className={styles.socialLinks}>
            <a
              href="https://github.com/karma-works/"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialLink}
              aria-label="GitHub"
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
            </a>
            <a
              href="https://www.linkedin.com/in/christian-haegele-3403aaa/"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialLink}
              aria-label="LinkedIn"
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>
            <a
              href="https://x.com/symbian2111"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialLink}
              aria-label="Twitter"
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a
              href="https://huggingface.co/karma-works"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialLink}
              aria-label="Hugging Face"
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2zm-3.5 6a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm7 0a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm-7.25 5.5c-.138 0-.25.112-.25.25 0 2.347 1.97 4.25 4.75 4.25s4.75-1.903 4.75-4.25c0-.138-.112-.25-.25-.25H8.25zm1.363 1h4.774C13.98 15.473 13.07 16 12 16s-1.98-.527-2.387-1.5z"/>
              </svg>
            </a>
          </div>

          <div className={styles.themeIndicator}>
            <div
              className={styles.colorDot}
              style={
                {
                  "--current-accent": themeColor.accent,
                } as React.CSSProperties
              }
            />
            <span>
              Keyboard mapping: A-L for white keys (C4-D5), W/E/T/Y/U/O for
              black keys
            </span>
          </div>

          <p className={styles.copyright}>
            &copy; {currentYear} <a href="/">haegele.dev</a> — Days since last bug: 0
          </p>
        </div>
      </div>
    </footer>
  );
});

export default Footer;
