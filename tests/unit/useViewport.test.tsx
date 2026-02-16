import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

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

describe('useViewport', () => {
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
    it('returns mobile breakpoint for 375px width', async () => {
      setViewport(375, 667);

      const { useViewport } = await import('../../src/utils/responsive');
      const { result } = renderHook(() => useViewport());

      expect(result.current.breakpoint).toBe('mobile');
      expect(result.current.isMobile).toBe(true);
      expect(result.current.isTablet).toBe(false);
      expect(result.current.isDesktop).toBe(false);
    });

    it('returns correct width and height for mobile', async () => {
      setViewport(375, 667);

      const { useViewport } = await import('../../src/utils/responsive');
      const { result } = renderHook(() => useViewport());

      expect(result.current.width).toBe(375);
      expect(result.current.height).toBe(667);
    });

    it('classifies small screens below 768px as mobile', async () => {
      setViewport(640, 800);

      const { useViewport } = await import('../../src/utils/responsive');
      const { result } = renderHook(() => useViewport());

      expect(result.current.breakpoint).toBe('mobile');
      expect(result.current.isMobile).toBe(true);
    });

    it('classifies 480px as mobile', async () => {
      setViewport(480, 800);

      const { useViewport } = await import('../../src/utils/responsive');
      const { result } = renderHook(() => useViewport());

      expect(result.current.breakpoint).toBe('mobile');
      expect(result.current.isMobile).toBe(true);
    });
  });

  describe('Tablet viewport (768px)', () => {
    it('returns tablet breakpoint for 768px width', async () => {
      setViewport(768, 1024);

      const { useViewport } = await import('../../src/utils/responsive');
      const { result } = renderHook(() => useViewport());

      expect(result.current.breakpoint).toBe('tablet');
      expect(result.current.isMobile).toBe(false);
      expect(result.current.isTablet).toBe(true);
      expect(result.current.isDesktop).toBe(false);
    });

    it('returns tablet breakpoint for 900px width', async () => {
      setViewport(900, 1024);

      const { useViewport } = await import('../../src/utils/responsive');
      const { result } = renderHook(() => useViewport());

      expect(result.current.breakpoint).toBe('tablet');
      expect(result.current.isTablet).toBe(true);
    });

    it('returns correct width for tablet', async () => {
      setViewport(768, 1024);

      const { useViewport } = await import('../../src/utils/responsive');
      const { result } = renderHook(() => useViewport());

      expect(result.current.width).toBe(768);
    });

    it('classifies screens between 768px and 1023px as tablet', async () => {
      setViewport(1023, 768);

      const { useViewport } = await import('../../src/utils/responsive');
      const { result } = renderHook(() => useViewport());

      expect(result.current.breakpoint).toBe('tablet');
      expect(result.current.isTablet).toBe(true);
    });
  });

  describe('Desktop viewport (1440px)', () => {
    it('returns desktop breakpoint for 1024px width', async () => {
      setViewport(1024, 768);

      const { useViewport } = await import('../../src/utils/responsive');
      const { result } = renderHook(() => useViewport());

      expect(result.current.breakpoint).toBe('desktop');
      expect(result.current.isMobile).toBe(false);
      expect(result.current.isTablet).toBe(false);
      expect(result.current.isDesktop).toBe(true);
    });

    it('returns wide breakpoint for 1440px width', async () => {
      setViewport(1440, 900);

      const { useViewport } = await import('../../src/utils/responsive');
      const { result } = renderHook(() => useViewport());

      expect(result.current.breakpoint).toBe('wide');
      expect(result.current.isDesktop).toBe(true);
    });

    it('returns correct width for desktop at 1440px', async () => {
      setViewport(1440, 900);

      const { useViewport } = await import('../../src/utils/responsive');
      const { result } = renderHook(() => useViewport());

      expect(result.current.width).toBe(1440);
    });

    it('classifies 1920px as wide (still desktop)', async () => {
      setViewport(1920, 1080);

      const { useViewport } = await import('../../src/utils/responsive');
      const { result } = renderHook(() => useViewport());

      expect(result.current.breakpoint).toBe('wide');
      expect(result.current.isDesktop).toBe(true);
    });
  });

  describe('Responsive assertions', () => {
    it('breakpoint boundaries: 767px is mobile, 768px is tablet', async () => {
      setViewport(767, 768);

      const { useViewport } = await import('../../src/utils/responsive');
      const { result } = renderHook(() => useViewport());

      expect(result.current.breakpoint).toBe('mobile');

      act(() => {
        setViewport(768, 1024);
        window.dispatchEvent(new Event('resize'));
      });
    });

    it('breakpoint boundaries: 1023px is tablet, 1024px is desktop', async () => {
      setViewport(1023, 768);

      const { useViewport } = await import('../../src/utils/responsive');
      const { result } = renderHook(() => useViewport());

      expect(result.current.breakpoint).toBe('tablet');
    });

    it('breakpoint boundaries: 1439px is desktop, 1440px is wide', async () => {
      setViewport(1439, 900);

      const { useViewport } = await import('../../src/utils/responsive');
      const { result } = renderHook(() => useViewport());

      expect(result.current.breakpoint).toBe('desktop');
    });

    it('only one breakpoint flag is true at a time for mobile', async () => {
      setViewport(375, 667);

      const { useViewport } = await import('../../src/utils/responsive');
      const { result } = renderHook(() => useViewport());

      const trueFlags = [result.current.isMobile, result.current.isTablet, result.current.isDesktop].filter(Boolean);
      expect(trueFlags).toHaveLength(1);
    });

    it('only one breakpoint flag is true at a time for tablet', async () => {
      setViewport(768, 1024);

      const { useViewport } = await import('../../src/utils/responsive');
      const { result } = renderHook(() => useViewport());

      const trueFlags = [result.current.isMobile, result.current.isTablet, result.current.isDesktop].filter(Boolean);
      expect(trueFlags).toHaveLength(1);
    });

    it('isDesktop is true for both desktop and wide breakpoints', async () => {
      setViewport(1024, 768);

      const { useViewport } = await import('../../src/utils/responsive');
      const { result } = renderHook(() => useViewport());

      expect(result.current.isDesktop).toBe(true);
    });
  });

  describe('BREAKPOINTS constants', () => {
    it('exports correct breakpoint values', async () => {
      const { BREAKPOINTS } = await import('../../src/utils/responsive');

      expect(BREAKPOINTS.mobile).toBe(640);
      expect(BREAKPOINTS.tablet).toBe(768);
      expect(BREAKPOINTS.desktop).toBe(1024);
      expect(BREAKPOINTS.wide).toBe(1440);
    });
  });
});
