export interface StravaActivity {
  id: number;
  name: string;
  type: 'Run' | 'Ride' | 'Swim' | 'Walk' | 'Hike' | 'VirtualRun' | 'VirtualRide';
  sport_type?: string;
  start_date: string;
  start_date_local: string;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  total_elevation_gain: number;
  average_speed: number;
  max_speed?: number;
  average_heartrate?: number;
  max_heartrate?: number;
  calories?: number;
  kudos_count?: number;
  map?: {
    summary_polyline: string;
  };
  device_name?: string;
}

export interface StravaRunTotals {
  distance: number;
  count: number;
  moving_time: number;
  elapsed_time?: number;
  elevation_gain?: number;
  achievement_count?: number;
}

export interface StravaAthleteStats {
  biggest_ride_distance?: number;
  biggest_climb_elevation_gain?: number;
  recent_run_totals: StravaRunTotals;
  all_run_totals: StravaRunTotals;
  ytd_run_totals: StravaRunTotals;
  recent_swim_totals?: StravaRunTotals;
  all_swim_totals?: StravaRunTotals;
  ytd_swim_totals?: StravaRunTotals;
  recent_ride_totals?: StravaRunTotals;
  all_ride_totals?: StravaRunTotals;
  ytd_ride_totals?: StravaRunTotals;
}

export interface StravaAthlete {
  id: number;
  username: string | null;
  firstname: string;
  lastname: string;
  profile_medium: string;
  profile: string;
  city: string;
  state: string;
  country: string;
  sex: 'M' | 'F';
  premium: boolean;
  created_at: string;
  updated_at: string;
}

export interface StravaTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  expires_in: number;
  token_type: string;
  athlete?: StravaAthlete;
}

export interface StravaCredentials {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
}

export interface StoredStravaData {
  stats: StravaStatsDisplay;
  recentActivities: StravaActivity[];
  lastUpdated: string;
  expiresAt: string;
}

export interface StravaStatsDisplay {
  totalDistance: number;
  totalRuns: number;
  totalTime: number;
  ytdDistance: number;
  ytdRuns: number;
  recentDistance: number;
  recentRuns: number;
}

export const STRAVA_API_BASE = 'https://www.strava.com/api/v3';
export const STRAVA_OAUTH_BASE = 'https://www.strava.com/oauth';

export const STRAVA_SCOPES = {
  READ: 'read',
  ACTIVITY_READ: 'activity:read',
  ACTIVITY_READ_ALL: 'activity:read_all',
} as const;

export const DEFAULT_STATS: StravaStatsDisplay = {
  totalDistance: 0,
  totalRuns: 0,
  totalTime: 0,
  ytdDistance: 0,
  ytdRuns: 0,
  recentDistance: 0,
  recentRuns: 0,
};
