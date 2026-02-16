import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { useTypewriter } from '../../src/hooks/useTypewriter';
import { ReduceMotionProvider } from '../../src/contexts/ReduceMotionContext';

const wrapper = ({ children }: { children: ReactNode }) => (
  <ReduceMotionProvider>{children}</ReduceMotionProvider>
);

const mockMatchMedia = (matches: boolean = false) => vi.fn().mockImplementation((query: string) => ({
  matches,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}));

describe('useTypewriter', () => {
  let originalMatchMedia: typeof window.matchMedia | undefined;

  beforeEach(() => {
    originalMatchMedia = window.matchMedia;
    window.matchMedia = mockMatchMedia(false);
  });

  afterEach(() => {
    if (originalMatchMedia) {
      window.matchMedia = originalMatchMedia;
    }
  });

  it('starts with empty text and typing state', () => {
    const { result } = renderHook(() =>
      useTypewriter({ text: 'Hello', speed: 100 })
    , { wrapper });

    expect(result.current.displayText).toBe('');
    expect(result.current.isTyping).toBe(true);
    expect(result.current.isComplete).toBe(false);
  });

  it('returns restart function', () => {
    const { result } = renderHook(() =>
      useTypewriter({ text: 'Test', speed: 100 })
    , { wrapper });

    expect(result.current.restart).toBeTypeOf('function');
  });

  it('shows full text immediately when reduced motion is enabled', () => {
    window.matchMedia = mockMatchMedia(true);

    const { result } = renderHook(() =>
      useTypewriter({ text: 'Instant', speed: 100 })
    , { wrapper });

    expect(result.current.displayText).toBe('Instant');
    expect(result.current.isComplete).toBe(true);
    expect(result.current.isTyping).toBe(false);
  });
});
