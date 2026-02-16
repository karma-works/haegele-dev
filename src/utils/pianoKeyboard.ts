export interface PianoKeyRange {
  startOctave: number;
  whiteKeyCount: number;
}

export interface PianoKeyEvent {
  note: string;
  velocity: number;
  isSharp: boolean;
}

export type KeyMap = Record<string, PianoKeyEvent>;

export const WHITE_KEY_NOTES = ['C', 'D', 'E', 'F', 'G', 'A', 'B'] as const;
export const BLACK_KEY_NOTES = ['C#', 'D#', null, 'F#', 'G#', 'A#', null] as const;

export const MOBILE_KEY_RANGE: PianoKeyRange = {
  startOctave: 3,
  whiteKeyCount: 9,
};

export const DESKTOP_KEY_RANGE: PianoKeyRange = {
  startOctave: 2,
  whiteKeyCount: 15,
};

const WHITE_KEYS = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'", '\\', 'z', 'x', 'c'];
const BLACK_KEYS = ['w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', 'n', 'm', ',', '.'];

export function generateKeyMap(range: PianoKeyRange): KeyMap {
  const whiteKeyMap: KeyMap = {};
  const blackKeyMap: KeyMap = {};
  
  let keyIndex = 0;
  const { startOctave, whiteKeyCount } = range;
  
  for (let octaveOffset = 0; octaveOffset < Math.ceil(whiteKeyCount / 7); octaveOffset++) {
    const currentOctave = startOctave + octaveOffset;
    
    for (let noteIndex = 0; noteIndex < 7 && keyIndex < whiteKeyCount; noteIndex++) {
      const whiteKey = WHITE_KEYS[keyIndex];
      const whiteNote = WHITE_KEY_NOTES[noteIndex];
      
      if (whiteKey && whiteNote) {
        whiteKeyMap[whiteKey] = {
          note: `${whiteNote}${currentOctave}`,
          velocity: 0.7,
          isSharp: false,
        };
      }
      
      const blackKey = BLACK_KEYS[keyIndex];
      const blackNote = BLACK_KEY_NOTES[noteIndex];
      
      if (blackKey && blackNote) {
        blackKeyMap[blackKey] = {
          note: `${blackNote}${currentOctave}`,
          velocity: 0.7,
          isSharp: true,
        };
      }
      
      keyIndex++;
    }
  }
  
  return { ...whiteKeyMap, ...blackKeyMap };
}

export const WHITE_KEY_MAP: KeyMap = {
  a: { note: 'C4', velocity: 0.7, isSharp: false },
  s: { note: 'D4', velocity: 0.7, isSharp: false },
  d: { note: 'E4', velocity: 0.7, isSharp: false },
  f: { note: 'F4', velocity: 0.7, isSharp: false },
  g: { note: 'G4', velocity: 0.7, isSharp: false },
  h: { note: 'A4', velocity: 0.7, isSharp: false },
  j: { note: 'B4', velocity: 0.7, isSharp: false },
  k: { note: 'C5', velocity: 0.7, isSharp: false },
  l: { note: 'D5', velocity: 0.7, isSharp: false },
};

export const BLACK_KEY_MAP: KeyMap = {
  w: { note: 'C#4', velocity: 0.7, isSharp: true },
  e: { note: 'D#4', velocity: 0.7, isSharp: true },
  t: { note: 'F#4', velocity: 0.7, isSharp: true },
  y: { note: 'G#4', velocity: 0.7, isSharp: true },
  u: { note: 'A#4', velocity: 0.7, isSharp: true },
  o: { note: 'C#5', velocity: 0.7, isSharp: true },
};

export const FULL_KEY_MAP: KeyMap = { ...WHITE_KEY_MAP, ...BLACK_KEY_MAP };

let currentKeyMap: KeyMap = FULL_KEY_MAP;

export function setKeyMap(keyMap: KeyMap): void {
  currentKeyMap = keyMap;
}

export function getKeyMap(): KeyMap {
  return currentKeyMap;
}

export function getKeyNote(key: string): PianoKeyEvent | null {
  const normalizedKey = key.toLowerCase();
  return currentKeyMap[normalizedKey] || FULL_KEY_MAP[normalizedKey] || null;
}

export function isPianoKey(key: string): boolean {
  const normalizedKey = key.toLowerCase();
  return normalizedKey in currentKeyMap || normalizedKey in FULL_KEY_MAP;
}

export function noteToFrequency(note: string): number {
  const noteRegex = /^([A-G]#?)(\d+)$/;
  const match = note.match(noteRegex);
  
  if (!match || !match[1] || !match[2]) {
    throw new Error(`Invalid note format: ${note}`);
  }
  
  const noteName = match[1];
  const octave = parseInt(match[2], 10);
  
  const semitones: Record<string, number> = {
    C: 0, 'C#': 1,
    D: 2, 'D#': 3,
    E: 4,
    F: 5, 'F#': 6,
    G: 7, 'G#': 8,
    A: 9, 'A#': 10,
    B: 11,
  };
  
  const semitone = semitones[noteName];
  if (semitone === undefined) {
    throw new Error(`Unknown note name: ${noteName}`);
  }
  
  const a4 = 440;
  const a4Midi = 69;
  const midiNote = (octave + 1) * 12 + semitone;
  const semitonesFromA4 = midiNote - a4Midi;
  
  return a4 * Math.pow(2, semitonesFromA4 / 12);
}

export function calculateVelocity(keyPosition?: number): number {
  if (keyPosition === undefined) {
    return 0.7;
  }
  
  const clampedPosition = Math.max(0, Math.min(1, keyPosition));
  const minVelocity = 0.3;
  const maxVelocity = 1.0;
  
  return minVelocity + clampedPosition * (maxVelocity - minVelocity);
}

export function getKeyboardLayout(): { white: string[]; black: string[] } {
  return {
    white: Object.keys(WHITE_KEY_MAP),
    black: Object.keys(BLACK_KEY_MAP),
  };
}
