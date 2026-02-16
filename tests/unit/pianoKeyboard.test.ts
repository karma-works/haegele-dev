import { describe, it, expect, beforeEach } from 'vitest';
import {
  WHITE_KEY_MAP,
  BLACK_KEY_MAP,
  FULL_KEY_MAP,
  getKeyNote,
  isPianoKey,
  noteToFrequency,
  calculateVelocity,
  getKeyboardLayout,
  generateKeyMap,
  setKeyMap,
  getKeyMap,
  MOBILE_KEY_RANGE,
  DESKTOP_KEY_RANGE,
} from '../../src/utils/pianoKeyboard';

describe('pianoKeyboard', () => {
  describe('Key Maps', () => {
    it('has 9 white keys (A-L)', () => {
      expect(Object.keys(WHITE_KEY_MAP)).toHaveLength(9);
    });

    it('has 6 black keys (sharps/flats)', () => {
      expect(Object.keys(BLACK_KEY_MAP)).toHaveLength(6);
    });

    it('combines white and black keys into full map', () => {
      expect(Object.keys(FULL_KEY_MAP)).toHaveLength(15);
    });

    it('maps A key to C4', () => {
      expect(WHITE_KEY_MAP.a?.note).toBe('C4');
      expect(WHITE_KEY_MAP.a?.isSharp).toBe(false);
    });

    it('maps W key to C#4', () => {
      expect(BLACK_KEY_MAP.w?.note).toBe('C#4');
      expect(BLACK_KEY_MAP.w?.isSharp).toBe(true);
    });

    it('maps K key to C5 (next octave)', () => {
      expect(WHITE_KEY_MAP.k?.note).toBe('C5');
    });
  });

  describe('getKeyNote', () => {
    beforeEach(() => {
      setKeyMap(FULL_KEY_MAP);
    });

    it('returns note info for valid key', () => {
      const result = getKeyNote('a');
      expect(result).toEqual({ note: 'C4', velocity: 0.7, isSharp: false });
    });

    it('returns note info for sharp key', () => {
      const result = getKeyNote('w');
      expect(result).toEqual({ note: 'C#4', velocity: 0.7, isSharp: true });
    });

    it('handles uppercase keys', () => {
      const result = getKeyNote('A');
      expect(result?.note).toBe('C4');
    });

    it('returns null for invalid key', () => {
      expect(getKeyNote('z')).toBeNull();
      expect(getKeyNote('1')).toBeNull();
    });
  });

  describe('isPianoKey', () => {
    beforeEach(() => {
      setKeyMap(FULL_KEY_MAP);
    });

    it('returns true for valid piano keys', () => {
      expect(isPianoKey('a')).toBe(true);
      expect(isPianoKey('s')).toBe(true);
      expect(isPianoKey('w')).toBe(true);
      expect(isPianoKey('l')).toBe(true);
    });

    it('returns false for non-piano keys', () => {
      expect(isPianoKey('z')).toBe(false);
      expect(isPianoKey('x')).toBe(false);
      expect(isPianoKey('1')).toBe(false);
    });

    it('handles uppercase keys', () => {
      expect(isPianoKey('A')).toBe(true);
      expect(isPianoKey('Z')).toBe(false);
    });
  });

  describe('noteToFrequency', () => {
    it('calculates A4 as 440Hz', () => {
      expect(noteToFrequency('A4')).toBeCloseTo(440, 1);
    });

    it('calculates C4 as approximately 261.63Hz', () => {
      expect(noteToFrequency('C4')).toBeCloseTo(261.63, 1);
    });

    it('calculates C#4 as approximately 277.18Hz', () => {
      expect(noteToFrequency('C#4')).toBeCloseTo(277.18, 1);
    });

    it('calculates C5 as double C4 frequency', () => {
      const c4 = noteToFrequency('C4');
      const c5 = noteToFrequency('C5');
      expect(c5 / c4).toBeCloseTo(2, 2);
    });

    it('throws for invalid note format', () => {
      expect(() => noteToFrequency('H4')).toThrow('Invalid note format');
      expect(() => noteToFrequency('C')).toThrow('Invalid note format');
      expect(() => noteToFrequency('4')).toThrow('Invalid note format');
    });
  });

  describe('calculateVelocity', () => {
    it('returns default velocity when no position provided', () => {
      expect(calculateVelocity()).toBe(0.7);
    });

    it('returns minimum velocity for position 0', () => {
      expect(calculateVelocity(0)).toBe(0.3);
    });

    it('returns maximum velocity for position 1', () => {
      expect(calculateVelocity(1)).toBe(1.0);
    });

    it('returns scaled velocity for position 0.5', () => {
      const expected = 0.3 + 0.5 * (1.0 - 0.3);
      expect(calculateVelocity(0.5)).toBeCloseTo(expected, 2);
    });

    it('clamps values below 0 to minimum', () => {
      expect(calculateVelocity(-0.5)).toBe(0.3);
    });

    it('clamps values above 1 to maximum', () => {
      expect(calculateVelocity(1.5)).toBe(1.0);
    });
  });

  describe('getKeyboardLayout', () => {
    it('returns white and black key arrays', () => {
      const layout = getKeyboardLayout();
      expect(layout).toHaveProperty('white');
      expect(layout).toHaveProperty('black');
    });

    it('white keys start with a', () => {
      const layout = getKeyboardLayout();
      expect(layout.white[0]).toBe('a');
    });

    it('black keys start with w', () => {
      const layout = getKeyboardLayout();
      expect(layout.black[0]).toBe('w');
    });
  });

  describe('Responsive Key Ranges', () => {
    beforeEach(() => {
      setKeyMap(FULL_KEY_MAP);
    });

    describe('Key Range Constants', () => {
      it('mobile range starts at octave 3', () => {
        expect(MOBILE_KEY_RANGE.startOctave).toBe(3);
      });

      it('desktop range starts at octave 2', () => {
        expect(DESKTOP_KEY_RANGE.startOctave).toBe(2);
      });

      it('mobile range has 9 white keys', () => {
        expect(MOBILE_KEY_RANGE.whiteKeyCount).toBe(9);
      });

      it('desktop range has 15 white keys', () => {
        expect(DESKTOP_KEY_RANGE.whiteKeyCount).toBe(15);
      });
    });

    describe('generateKeyMap', () => {
      it('generates mobile key map starting from C3', () => {
        const keyMap = generateKeyMap(MOBILE_KEY_RANGE);
        expect(keyMap.a?.note).toBe('C3');
      });

      it('generates desktop key map starting from C2', () => {
        const keyMap = generateKeyMap(DESKTOP_KEY_RANGE);
        expect(keyMap.a?.note).toBe('C2');
      });

      it('mobile map has correct number of white keys', () => {
        const keyMap = generateKeyMap(MOBILE_KEY_RANGE);
        const whiteKeys = Object.values(keyMap).filter(k => !k.isSharp);
        expect(whiteKeys).toHaveLength(9);
      });

      it('desktop map has correct number of white keys', () => {
        const keyMap = generateKeyMap(DESKTOP_KEY_RANGE);
        const whiteKeys = Object.values(keyMap).filter(k => !k.isSharp);
        expect(whiteKeys).toHaveLength(15);
      });

      it('includes sharps for mobile range', () => {
        const keyMap = generateKeyMap(MOBILE_KEY_RANGE);
        const blackKeys = Object.values(keyMap).filter(k => k.isSharp);
        expect(blackKeys.length).toBeGreaterThan(0);
      });

      it('includes sharps for desktop range', () => {
        const keyMap = generateKeyMap(DESKTOP_KEY_RANGE);
        const blackKeys = Object.values(keyMap).filter(k => k.isSharp);
        expect(blackKeys.length).toBeGreaterThan(0);
      });

      it('maps consecutive keys to consecutive notes', () => {
        const keyMap = generateKeyMap(MOBILE_KEY_RANGE);
        expect(keyMap.a?.note).toBe('C3');
        expect(keyMap.s?.note).toBe('D3');
        expect(keyMap.d?.note).toBe('E3');
        expect(keyMap.f?.note).toBe('F3');
      });

      it('wraps octave correctly after B', () => {
        const keyMap = generateKeyMap(MOBILE_KEY_RANGE);
        expect(keyMap.j?.note).toBe('B3');
        expect(keyMap.k?.note).toBe('C4');
      });

      it('sets default velocity to 0.7', () => {
        const keyMap = generateKeyMap(MOBILE_KEY_RANGE);
        Object.values(keyMap).forEach(key => {
          expect(key.velocity).toBe(0.7);
        });
      });
    });

    describe('setKeyMap and getKeyMap', () => {
      it('sets and gets the current key map', () => {
        const customMap = generateKeyMap(MOBILE_KEY_RANGE);
        setKeyMap(customMap);
        expect(getKeyMap()).toBe(customMap);
      });

      it('updates key lookup after setKeyMap', () => {
        const mobileMap = generateKeyMap(MOBILE_KEY_RANGE);
        setKeyMap(mobileMap);
        expect(getKeyNote('a')?.note).toBe('C3');
        
        const desktopMap = generateKeyMap(DESKTOP_KEY_RANGE);
        setKeyMap(desktopMap);
        expect(getKeyNote('a')?.note).toBe('C2');
      });
    });
  });
});
