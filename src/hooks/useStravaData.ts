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

interface StoredStravaData {
  stats: StravaStats;
  recentActivities?: Array<{
    id: number;
    name: string;
    type: string;
    distance: number;
    moving_time: number;
    start_date: string;
  }>;
  lastUpdated: string;
  expiresAt: string;
}

interface StravaDataState {
  stats: StravaStats | null;
  isLoading: boolean;
  isAvailable: boolean;
  error: string | null;
  lastUpdated: string | null;
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
const FALLBACK_DATA_URL = '/data/strava.json';

function loadCachedData(): { stats: StravaStats; timestamp: number } | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const { data, timestamp } = JSON.parse(cached);
    return { stats: data, timestamp };
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

function isDataExpired(expiresAt: string): boolean {
  try {
    return new Date(expiresAt) < new Date();
  } catch {
    return true;
  }
}

export function useStravaData(): StravaDataState {
  const [state, setState] = useState<StravaDataState>(() => {
    const cached = loadCachedData();
    return {
      stats: cached?.stats ?? null,
      isLoading: true,
      isAvailable: false,
      error: null,
      lastUpdated: cached ? new Date(cached.timestamp).toISOString() : null,
    };
  });

  useEffect(() => {
    let mounted = true;

    async function loadStravaData() {
      try {
        const response = await fetch(FALLBACK_DATA_URL);

        if (!response.ok) {
          if (mounted) {
            const cached = loadCachedData();
            setState({
              stats: cached?.stats ?? null,
              isLoading: false,
              isAvailable: cached !== null,
              error: null,
              lastUpdated: cached ? new Date(cached.timestamp).toISOString() : null,
            });
          }
          return;
        }

        const data: StoredStravaData = await response.json();

        if (!data.stats) {
          throw new Error('Invalid data format');
        }

        if (isDataExpired(data.expiresAt)) {
          if (mounted) {
            const cached = loadCachedData();
            setState({
              stats: cached?.stats ?? data.stats,
              isLoading: false,
              isAvailable: true,
              error: null,
              lastUpdated: data.lastUpdated,
            });
          }
          return;
        }

        if (mounted) {
          cacheData(data.stats);
          setState({
            stats: data.stats,
            isLoading: false,
            isAvailable: true,
            error: null,
            lastUpdated: data.lastUpdated,
          });
        }
      } catch (error) {
        if (mounted) {
          const cached = loadCachedData();
          setState({
            stats: cached?.stats ?? null,
            isLoading: false,
            isAvailable: cached !== null,
            error: error instanceof Error ? error.message : 'Unknown error',
            lastUpdated: cached ? new Date(cached.timestamp).toISOString() : null,
          });
        }
      }
    }

    loadStravaData();

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
