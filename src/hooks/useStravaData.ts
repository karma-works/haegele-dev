import { useState, useEffect } from 'react';

export interface StravaStats {
  totalDistance: number;
  totalRuns: number;
  totalTime: number;
  ytdDistance: number;
  ytdRuns: number;
  recentDistance: number;
  recentRuns: number;
}

interface StravaDataState {
  stats: StravaStats | null;
  isLoading: boolean;
  isAvailable: boolean;
  error: string | null;
}

const DEFAULT_STATS: StravaStats = {
  totalDistance: 0,
  totalRuns: 0,
  totalTime: 0,
  ytdDistance: 0,
  ytdRuns: 0,
  recentDistance: 0,
  recentRuns: 0,
};

const CACHE_KEY = 'strava_stats_cache';
const CACHE_DURATION = 6 * 60 * 60 * 1000;

function loadCachedData(): StravaStats | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp > CACHE_DURATION) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }

    return data;
  } catch {
    return null;
  }
}

function cacheData(data: StravaStats): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
  } catch {
    // localStorage might be unavailable
  }
}

export function useStravaData(): StravaDataState {
  const [state, setState] = useState<StravaDataState>(() => {
    const cached = loadCachedData();
    return {
      stats: cached,
      isLoading: !cached,
      isAvailable: false,
      error: null,
    };
  });

  useEffect(() => {
    if (state.stats && !state.isLoading) {
      return;
    }

    let mounted = true;

    async function fetchStravaData() {
      try {
        const response = await fetch('/api/strava/stats');

        if (!response.ok) {
          if (response.status === 404) {
            if (mounted) {
              setState((prev) => ({
                ...prev,
                isLoading: false,
                isAvailable: false,
              }));
            }
            return;
          }
          throw new Error(`Failed to fetch: ${response.status}`);
        }

        const data = await response.json();

        if (mounted) {
          cacheData(data);
          setState({
            stats: data,
            isLoading: false,
            isAvailable: true,
            error: null,
          });
        }
      } catch (error) {
        if (mounted) {
          setState((prev) => ({
            ...prev,
            isLoading: false,
            isAvailable: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          }));
        }
      }
    }

    fetchStravaData();

    return () => {
      mounted = false;
    };
  }, []);

  return state;
}

export function useStravaDataWithFallback(fallbackStats?: StravaStats): StravaDataState {
  const result = useStravaData();

  if (!result.isAvailable && fallbackStats) {
    return {
      ...result,
      stats: fallbackStats,
      isAvailable: true,
    };
  }

  return result;
}

export { DEFAULT_STATS };
