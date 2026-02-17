import { useState, useEffect } from "react";

export interface StravaActivity {
  id: number;
  name: string;
  type: string;
  distance: number;
  moving_time: number;
  start_date: string;
}

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
  recentActivities?: StravaActivity[];
  lastUpdated: string;
  expiresAt: string;
}

interface CachedData {
  stats: StravaStats;
  activities: StravaActivity[];
  timestamp: number;
}

interface StravaDataState {
  stats: StravaStats | null;
  activities: StravaActivity[];
  isLoading: boolean;
  isAvailable: boolean;
  error: string | null;
  lastUpdated: string | null;
  isStale: boolean;
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

const CACHE_KEY = "strava_stats_cache";
const FALLBACK_DATA_URL = "/data/strava.json";

function loadCachedData(): CachedData | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const { data, timestamp } = JSON.parse(cached);
    return {
      stats: data.stats ?? DEFAULT_STATS,
      activities: data.activities ?? [],
      timestamp,
    };
  } catch {
    return null;
  }
}

function cacheData(stats: StravaStats, activities: StravaActivity[]): void {
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        data: { stats, activities },
        timestamp: Date.now(),
      }),
    );
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
      activities: cached?.activities ?? [],
      isLoading: true,
      isAvailable: cached !== null,
      error: null,
      lastUpdated: cached ? new Date(cached.timestamp).toISOString() : null,
      isStale: false,
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
              activities: cached?.activities ?? [],
              isLoading: false,
              isAvailable: cached !== null,
              error: null,
              lastUpdated: cached
                ? new Date(cached.timestamp).toISOString()
                : null,
              isStale: cached !== null,
            });
          }
          return;
        }

        const data: StoredStravaData = await response.json();

        if (!data.stats) {
          throw new Error("Invalid data format");
        }

        const activities = data.recentActivities ?? [];
        const stale = isDataExpired(data.expiresAt);

        if (stale) {
          if (mounted) {
            setState({
              stats: data.stats,
              activities,
              isLoading: false,
              isAvailable: true,
              error: null,
              lastUpdated: data.lastUpdated,
              isStale: true,
            });
          }
          return;
        }

        if (mounted) {
          cacheData(data.stats, activities);
          setState({
            stats: data.stats,
            activities,
            isLoading: false,
            isAvailable: true,
            error: null,
            lastUpdated: data.lastUpdated,
            isStale: false,
          });
        }
      } catch (error) {
        if (mounted) {
          const cached = loadCachedData();
          setState({
            stats: cached?.stats ?? null,
            activities: cached?.activities ?? [],
            isLoading: false,
            isAvailable: cached !== null,
            error: error instanceof Error ? error.message : "Unknown error",
            lastUpdated: cached
              ? new Date(cached.timestamp).toISOString()
              : null,
            isStale: cached !== null,
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

export function useStravaDataWithFallback(
  fallbackStats?: StravaStats,
  fallbackActivities?: StravaActivity[],
): StravaDataState {
  const result = useStravaData();

  if (!result.isAvailable && (fallbackStats || fallbackActivities)) {
    return {
      ...result,
      stats: fallbackStats ?? null,
      activities: fallbackActivities ?? [],
      isAvailable: true,
    };
  }

  return result;
}

export { DEFAULT_STATS };
