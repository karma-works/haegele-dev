import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';

const mockMatchMedia = vi.fn().mockImplementation((query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}));

const setViewport = (width: number, height: number = 768) => {
  vi.stubGlobal('innerWidth', width);
  vi.stubGlobal('innerHeight', height);
  window.innerWidth = width;
  window.innerHeight = height;
};

describe('useResponsivePianoKeys', () => {
  let originalMatchMedia: typeof window.matchMedia;

  beforeEach(async () => {
    vi.resetModules();
    originalMatchMedia = window.matchMedia;
    window.matchMedia = mockMatchMedia;
    mockMatchMedia.mockClear();
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
    vi.unstubAllGlobals();
  });

  describe('Mobile viewport (375px)', () => {
    it('returns mobile key range with 9 white keys at 375px', async () => {
      setViewport(375, 667);

      const { useResponsivePianoKeys } = await import('../../src/hooks/useResponsivePianoKeys');
      const { result } = renderHook(() => useResponsivePianoKeys());

      expect(result.current.whiteKeyCount).toBe(9);
    });

    it('returns mobile key range starting at C3 (octave 3)', async () => {
      setViewport(375, 667);

      const { useResponsivePianoKeys } = await import('../../src/hooks/useResponsivePianoKeys');
      const { result } = renderHook(() => useResponsivePianoKeys());

      expect(result.current.startOctave).toBe(3);
    });

    it('returns correct key range object for mobile', async () => {
      setViewport(375, 667);

      const { useResponsivePianoKeys } = await import('../../src/hooks/useResponsivePianoKeys');
      const { result } = renderHook(() => useResponsivePianoKeys());

      expect(result.current.keyRange).toEqual({
        startOctave: 3,
        whiteKeyCount: 9,
      });
    });

    it('generates key map with C3 as first note for mobile', async () => {
      setViewport(375, 667);

      const { useResponsivePianoKeys } = await import('../../src/hooks/useResponsivePianoKeys');
      const { result } = renderHook(() => useResponsivePianoKeys());

      expect(result.current.keyMap['a']?.note).toBe('C3');
    });

    it('mobile key map contains expected number of white key mappings', async () => {
      setViewport(375, 667);

      const { useResponsivePianoKeys } = await import('../../src/hooks/useResponsivePianoKeys');
      const { result } = renderHook(() => useResponsivePianoKeys());

      const whiteKeyMappings = Object.values(result.current.keyMap).filter(
        (key) => key && !key.isSharp
      );
      expect(whiteKeyMappings).toHaveLength(9);
    });

    it('uses mobile range at 480px width', async () => {
      setViewport(480, 800);

      const { useResponsivePianoKeys } = await import('../../src/hooks/useResponsivePianoKeys');
      const { result } = renderHook(() => useResponsivePianoKeys());

      expect(result.current.whiteKeyCount).toBe(9);
      expect(result.current.startOctave).toBe(3);
    });

    it('uses mobile range at 640px width', async () => {
      setViewport(640, 800);

      const { useResponsivePianoKeys } = await import('../../src/hooks/useResponsivePianoKeys');
      const { result } = renderHook(() => useResponsivePianoKeys());

      expect(result.current.whiteKeyCount).toBe(9);
    });
  });

  describe('Tablet viewport (768px)', () => {
    it('returns desktop key range with 15 white keys at 768px', async () => {
      setViewport(768, 1024);

      const { useResponsivePianoKeys } = await import('../../src/hooks/useResponsivePianoKeys');
      const { result } = renderHook(() => useResponsivePianoKeys());

      expect(result.current.whiteKeyCount).toBe(15);
    });

    it('returns desktop key range starting at C2 (octave 2) at 768px', async () => {
      setViewport(768, 1024);

      const { useResponsivePianoKeys } = await import('../../src/hooks/useResponsivePianoKeys');
      const { result } = renderHook(() => useResponsivePianoKeys());

      expect(result.current.startOctave).toBe(2);
    });

    it('returns correct key range object for tablet', async () => {
      setViewport(768, 1024);

      const { useResponsivePianoKeys } = await import('../../src/hooks/useResponsivePianoKeys');
      const { result } = renderHook(() => useResponsivePianoKeys());

      expect(result.current.keyRange).toEqual({
        startOctave: 2,
        whiteKeyCount: 15,
      });
    });

    it('generates key map with C2 as first note for tablet', async () => {
      setViewport(768, 1024);

      const { useResponsivePianoKeys } = await import('../../src/hooks/useResponsivePianoKeys');
      const { result } = renderHook(() => useResponsivePianoKeys());

      expect(result.current.keyMap['a']?.note).toBe('C2');
    });

    it('tablet key map contains 15 white key mappings', async () => {
      setViewport(768, 1024);

      const { useResponsivePianoKeys } = await import('../../src/hooks/useResponsivePianoKeys');
      const { result } = renderHook(() => useResponsivePianoKeys());

      const whiteKeyMappings = Object.values(result.current.keyMap).filter(
        (key) => key && !key.isSharp
      );
      expect(whiteKeyMappings).toHaveLength(15);
    });

    it('uses desktop range at 900px width (tablet)', async () => {
      setViewport(900, 1024);

      const { useResponsivePianoKeys } = await import('../../src/hooks/useResponsivePianoKeys');
      const { result } = renderHook(() => useResponsivePianoKeys());

      expect(result.current.whiteKeyCount).toBe(15);
      expect(result.current.startOctave).toBe(2);
    });

    it('uses desktop range at 1023px width (max tablet)', async () => {
      setViewport(1023, 768);

      const { useResponsivePianoKeys } = await import('../../src/hooks/useResponsivePianoKeys');
      const { result } = renderHook(() => useResponsivePianoKeys());

      expect(result.current.whiteKeyCount).toBe(15);
    });
  });

  describe('Desktop viewport (1440px)', () => {
    it('returns desktop key range with 15 white keys at 1024px', async () => {
      setViewport(1024, 768);

      const { useResponsivePianoKeys } = await import('../../src/hooks/useResponsivePianoKeys');
      const { result } = renderHook(() => useResponsivePianoKeys());

      expect(result.current.whiteKeyCount).toBe(15);
    });

    it('returns desktop key range starting at C2 (octave 2) at 1440px', async () => {
      setViewport(1440, 900);

      const { useResponsivePianoKeys } = await import('../../src/hooks/useResponsivePianoKeys');
      const { result } = renderHook(() => useResponsivePianoKeys());

      expect(result.current.startOctave).toBe(2);
    });

    it('returns correct key range object for desktop', async () => {
      setViewport(1440, 900);

      const { useResponsivePianoKeys } = await import('../../src/hooks/useResponsivePianoKeys');
      const { result } = renderHook(() => useResponsivePianoKeys());

      expect(result.current.keyRange).toEqual({
        startOctave: 2,
        whiteKeyCount: 15,
      });
    });

    it('generates key map with C2 as first note for desktop', async () => {
      setViewport(1440, 900);

      const { useResponsivePianoKeys } = await import('../../src/hooks/useResponsivePianoKeys');
      const { result } = renderHook(() => useResponsivePianoKeys());

      expect(result.current.keyMap['a']?.note).toBe('C2');
    });

    it('desktop key map contains 15 white key mappings', async () => {
      setViewport(1440, 900);

      const { useResponsivePianoKeys } = await import('../../src/hooks/useResponsivePianoKeys');
      const { result } = renderHook(() => useResponsivePianoKeys());

      const whiteKeyMappings = Object.values(result.current.keyMap).filter(
        (key) => key && !key.isSharp
      );
      expect(whiteKeyMappings).toHaveLength(15);
    });

    it('uses desktop range at 1920px width', async () => {
      setViewport(1920, 1080);

      const { useResponsivePianoKeys } = await import('../../src/hooks/useResponsivePianoKeys');
      const { result } = renderHook(() => useResponsivePianoKeys());

      expect(result.current.whiteKeyCount).toBe(15);
      expect(result.current.startOctave).toBe(2);
    });
  });

  describe('Responsive assertions', () => {
    it('boundary: 767px returns mobile range, 768px returns desktop range', async () => {
      setViewport(767, 768);

      const { useResponsivePianoKeys } = await import('../../src/hooks/useResponsivePianoKeys');
      const { result } = renderHook(() => useResponsivePianoKeys());

      expect(result.current.whiteKeyCount).toBe(9);
    });

    it('mobile range covers C3 to D4 (9 white keys)', async () => {
      setViewport(375, 667);

      const { useResponsivePianoKeys } = await import('../../src/hooks/useResponsivePianoKeys');
      const { result } = renderHook(() => useResponsivePianoKeys());

      const whiteKeyNotes = Object.values(result.current.keyMap)
        .filter((key) => key && !key.isSharp)
        .map((key) => key?.note);

      expect(whiteKeyNotes).toContain('C3');
      expect(whiteKeyNotes).toContain('D4');
    });

    it('desktop range covers C2 to C4 (15 white keys, 2 octaves)', async () => {
      setViewport(1440, 900);

      const { useResponsivePianoKeys } = await import('../../src/hooks/useResponsivePianoKeys');
      const { result } = renderHook(() => useResponsivePianoKeys());

      const whiteKeyNotes = Object.values(result.current.keyMap)
        .filter((key) => key && !key.isSharp)
        .map((key) => key?.note);

      expect(whiteKeyNotes).toContain('C2');
      expect(whiteKeyNotes).toContain('C4');
    });

    it('tablet uses same range as desktop (C2, 15 keys)', async () => {
      setViewport(768, 1024);

      const { useResponsivePianoKeys } = await import('../../src/hooks/useResponsivePianoKeys');
      const { result: tabletResult } = renderHook(() => useResponsivePianoKeys());

      expect(tabletResult.current.startOctave).toBe(2);
      expect(tabletResult.current.whiteKeyCount).toBe(15);
    });

    it('all key maps have default velocity of 0.7', async () => {
      setViewport(375, 667);

      const { useResponsivePianoKeys } = await import('../../src/hooks/useResponsivePianoKeys');
      const { result } = renderHook(() => useResponsivePianoKeys());

      Object.values(result.current.keyMap).forEach((key) => {
        expect(key?.velocity).toBe(0.7);
      });
    });
  });
});
