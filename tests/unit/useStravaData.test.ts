import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useStravaData } from '../../src/hooks/useStravaData';

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('useStravaData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns loading state initially without cache', () => {
    vi.spyOn(global, 'fetch').mockImplementation(() => new Promise(() => {}));

    const { result } = renderHook(() => useStravaData());
    expect(result.current.isLoading).toBe(true);
    expect(result.current.stats).toBeNull();
  });

  it('uses cached data when available', () => {
    const cachedStats = {
      totalDistance: 50000,
      totalRuns: 25,
      totalTime: 180000,
      ytdDistance: 25000,
      ytdRuns: 12,
      recentDistance: 5000,
      recentRuns: 3,
    };

    localStorageMock.setItem(
      'strava_stats_cache',
      JSON.stringify({ data: cachedStats, timestamp: Date.now() })
    );

    const { result } = renderHook(() => useStravaData());
    expect(result.current.stats).toEqual(cachedStats);
    expect(result.current.isLoading).toBe(false);
  });

  it('handles unavailable Strava API', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 404,
    } as Response);

    const { result } = renderHook(() => useStravaData());

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    expect(result.current.isAvailable).toBe(false);
  });

  it('fetches and caches data successfully', async () => {
    const apiStats = {
      totalDistance: 100000,
      totalRuns: 50,
      totalTime: 360000,
      ytdDistance: 50000,
      ytdRuns: 25,
      recentDistance: 10000,
      recentRuns: 5,
    };

    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(apiStats),
    } as unknown as Response);

    const { result } = renderHook(() => useStravaData());

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    expect(result.current.stats).toEqual(apiStats);
    expect(result.current.isAvailable).toBe(true);
    expect(result.current.isLoading).toBe(false);
  });

  it('handles fetch errors gracefully', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useStravaData());

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    expect(result.current.isAvailable).toBe(false);
    expect(result.current.error).toBe('Network error');
  });
});
