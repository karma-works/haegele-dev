import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import { 
  useReducedMotion, 
  useShouldAnimate, 
  ReduceMotionProvider 
} from '../../src/contexts/ReduceMotionContext';

function TestComponent() {
  const { isReducedMotion, disableNonCritical } = useReducedMotion();
  return (
    <div>
      <span data-testid="reduced">{String(isReducedMotion)}</span>
      <span data-testid="noncritical">{String(disableNonCritical)}</span>
    </div>
  );
}

function AnimateTestComponent() {
  const { shouldAnimate, shouldAnimateNonCritical } = useShouldAnimate();
  return (
    <div>
      <span data-testid="animate">{String(shouldAnimate)}</span>
      <span data-testid="animate-noncritical">{String(shouldAnimateNonCritical)}</span>
    </div>
  );
}

describe('ReduceMotionContext', () => {
  let originalMatchMedia: typeof window.matchMedia;

  beforeEach(() => {
    originalMatchMedia = window.matchMedia;
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
    cleanup();
  });

  describe('useReducedMotion', () => {
    it('throws when used outside provider', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(() => {
        render(<TestComponent />);
      }).toThrow('useReducedMotion must be used within a ReduceMotionProvider');
      
      consoleError.mockRestore();
    });

    it('returns correct values when prefers-reduced-motion is false', async () => {
      render(
        <ReduceMotionProvider>
          <TestComponent />
        </ReduceMotionProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('reduced').textContent).toBe('false');
        expect(screen.getByTestId('noncritical').textContent).toBe('false');
      });
    });

    it('returns correct values when prefers-reduced-motion is true', async () => {
      window.matchMedia = vi.fn().mockImplementation((query: string) => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      render(
        <ReduceMotionProvider>
          <TestComponent />
        </ReduceMotionProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('reduced').textContent).toBe('true');
        expect(screen.getByTestId('noncritical').textContent).toBe('true');
      });
    });
  });

  describe('useShouldAnimate', () => {
    it('returns true for both when reduced motion is off', async () => {
      render(
        <ReduceMotionProvider>
          <AnimateTestComponent />
        </ReduceMotionProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('animate').textContent).toBe('true');
        expect(screen.getByTestId('animate-noncritical').textContent).toBe('true');
      });
    });

    it('returns false for both when reduced motion is on', async () => {
      window.matchMedia = vi.fn().mockImplementation((query: string) => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      render(
        <ReduceMotionProvider>
          <AnimateTestComponent />
        </ReduceMotionProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('animate').textContent).toBe('false');
        expect(screen.getByTestId('animate-noncritical').textContent).toBe('false');
      });
    });
  });
});
