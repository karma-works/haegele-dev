import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { useTypewriter } from '../../src/hooks/useTypewriter';
import { ReduceMotionProvider } from '../../src/contexts/ReduceMotionContext';

const wrapper = ({ children }: { children: ReactNode }) => (
  <ReduceMotionProvider>{children}</ReduceMotionProvider>
);

describe('useTypewriter', () => {
  beforeEach(() => {
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

    const { result } = renderHook(() =>
      useTypewriter({ text: 'Instant', speed: 100 })
    , { wrapper });

    expect(result.current.displayText).toBe('Instant');
    expect(result.current.isComplete).toBe(true);
    expect(result.current.isTyping).toBe(false);
  });
});
