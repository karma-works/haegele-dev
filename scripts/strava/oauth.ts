import type { StravaTokenResponse, StravaCredentials, StravaAthleteStats, StravaActivity, StoredStravaData, StravaStatsDisplay } from './types.js';
import { STRAVA_SCOPES } from './types.js';

const STRAVA_OAUTH_BASE = 'https://www.strava.com/oauth';
const STRAVA_API_BASE = 'https://www.api-v3.strava.com';

function getCredentials(): StravaCredentials {
  const clientId = process.env.STRAVA_CLIENT_ID;
  const clientSecret = process.env.STRAVA_CLIENT_SECRET;
  const refreshToken = process.env.STRAVA_REFRESH_TOKEN || '';

  if (!clientId || !clientSecret) {
    throw new Error('STRAVA_CLIENT_ID and STRAVA_CLIENT_SECRET must be set in environment');
  }

  return { clientId, clientSecret, refreshToken };
}

export function generateOAuthUrl(
  redirectUri: string,
  scope: (typeof STRAVA_SCOPES)[keyof typeof STRAVA_SCOPES][] = ['activity:read']
): string {
  const { clientId } = getCredentials();
  const scopeParam = scope.join(',');

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    approval_prompt: 'auto',
    scope: scopeParam,
  });

  return `${STRAVA_OAUTH_BASE}/authorize?${params.toString()}`;
}

export async function exchangeCodeForTokens(code: string): Promise<StravaTokenResponse> {
  const { clientId, clientSecret } = getCredentials();
  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const response = await fetch(`${STRAVA_OAUTH_BASE}/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${basicAuth}`,
    },
    body: new URLSearchParams({
      code,
      grant_type: 'authorization_code',
    }).toString(),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to exchange code: ${response.status} - ${error}`);
  }

  return response.json();
}

export async function refreshAccessToken(refreshToken?: string): Promise<StravaTokenResponse> {
  const { clientId, clientSecret } = getCredentials();
  const token = refreshToken || process.env.STRAVA_REFRESH_TOKEN;

  if (!token) {
    throw new Error('STRAVA_REFRESH_TOKEN must be set or provided');
  }

  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const response = await fetch(`${STRAVA_OAUTH_BASE}/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${basicAuth}`,
    },
    body: new URLSearchParams({
      refresh_token: token,
      grant_type: 'refresh_token',
    }).toString(),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to refresh token: ${response.status} - ${error}`);
  }

  return response.json();
}

export async function fetchAthleteStats(accessToken: string, athleteId: number): Promise<StravaAthleteStats> {
  const response = await fetch(`${STRAVA_API_BASE}/athletes/${athleteId}/stats`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to fetch athlete stats: ${response.status} - ${error}`);
  }

  return response.json();
}

export async function fetchRecentActivities(accessToken: string, perPage: number = 10): Promise<StravaActivity[]> {
  const response = await fetch(`${STRAVA_API_BASE}/athlete/activities?per_page=${perPage}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to fetch activities: ${response.status} - ${error}`);
  }

  return response.json();
}

export async function fetchCurrentAthlete(accessToken: string): Promise<{ id: number }> {
  const response = await fetch(`${STRAVA_API_BASE}/athlete`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to fetch athlete: ${response.status} - ${error}`);
  }

  return response.json();
}

export function transformStats(stats: StravaAthleteStats): StravaStatsDisplay {
  return {
    totalDistance: stats.all_run_totals?.distance || 0,
    totalRuns: stats.all_run_totals?.count || 0,
    totalTime: stats.all_run_totals?.moving_time || 0,
    ytdDistance: stats.ytd_run_totals?.distance || 0,
    ytdRuns: stats.ytd_run_totals?.count || 0,
    recentDistance: stats.recent_run_totals?.distance || 0,
    recentRuns: stats.recent_run_totals?.count || 0,
  };
}

export async function runManualOAuth(
  port: number = 3000,
  scope: (typeof STRAVA_SCOPES)[keyof typeof STRAVA_SCOPES][] = ['activity:read']
): Promise<StravaTokenResponse> {
  const redirectUri = `http://localhost:${port}/callback`;
  const authUrl = generateOAuthUrl(redirectUri, scope);

  console.log('\n=== Strava OAuth Manual Flow ===\n');
  console.log('1. Open this URL in your browser:\n');
  console.log(authUrl);
  console.log('\n2. Authorize the application');
  console.log('3. You will be redirected to localhost with a code parameter\n');

  return new Promise((resolve, reject) => {
    const server = Bun.serve({
      port,
      async fetch(req) {
        const url = new URL(req.url);

        if (url.pathname === '/callback') {
          const code = url.searchParams.get('code');
          const error = url.searchParams.get('error');

          if (error) {
            server.stop();
            reject(new Error(`OAuth error: ${error}`));
            return new Response(`Error: ${error}`, { status: 400 });
          }

          if (!code) {
            server.stop();
            reject(new Error('No code received'));
            return new Response('No code received', { status: 400 });
          }

          try {
            const tokens = await exchangeCodeForTokens(code);

            console.log('\n=== Authorization Successful ===\n');
            console.log('Access Token:', tokens.access_token.substring(0, 20) + '...');
            console.log('Refresh Token:', tokens.refresh_token.substring(0, 20) + '...');
            console.log('Expires At:', new Date(tokens.expires_at * 1000).toISOString());
            console.log('\n=== Save these to your .env file ===\n');
            console.log(`STRAVA_REFRESH_TOKEN=${tokens.refresh_token}`);
            console.log('');

            server.stop();
            resolve(tokens);

            return new Response(
              '<html><body><h1>Authorization successful!</h1><p>You can close this window.</p></body></html>',
              {
                headers: { 'Content-Type': 'text/html' },
              }
            );
          } catch (err) {
            server.stop();
            reject(err);
            return new Response(`Error: ${err}`, { status: 500 });
          }
        }

        return new Response('Waiting for OAuth callback...', { status: 200 });
      },
    });

    console.log(`Waiting for callback on http://localhost:${port}/callback ...`);
  });
}

export async function fetchAndStoreData(outputPath: string): Promise<StoredStravaData> {
  console.log('Refreshing Strava access token...');
  const tokenResponse = await refreshAccessToken();
  const accessToken = tokenResponse.access_token;

  console.log('Fetching athlete info...');
  const athlete = await fetchCurrentAthlete(accessToken);
  const athleteId = athlete.id;

  console.log('Fetching athlete stats...');
  const stats = await fetchAthleteStats(accessToken, athleteId);

  console.log('Fetching recent activities...');
  const activities = await fetchRecentActivities(accessToken, 5);

  const data: StoredStravaData = {
    stats: transformStats(stats),
    recentActivities: activities,
    lastUpdated: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
  };

  await Bun.write(outputPath, JSON.stringify(data, null, 2));
  console.log(`Data saved to ${outputPath}`);

  return data;
}

if (import.meta.main) {
  const command = process.argv[2];

  if (command === 'oauth') {
    const scopeArg = process.argv[3];
    const scope = scopeArg ? scopeArg.split(',') : ['activity:read'];

    runManualOAuth(3000, scope as (typeof STRAVA_SCOPES)[keyof typeof STRAVA_SCOPES][])
      .then(() => {
        console.log('OAuth flow completed successfully');
        process.exit(0);
      })
      .catch((err) => {
        console.error('OAuth flow failed:', err);
        process.exit(1);
      });
  } else if (command === 'refresh') {
    refreshAccessToken()
      .then((tokens) => {
        console.log('Token refreshed successfully');
        console.log(`STRAVA_REFRESH_TOKEN=${tokens.refresh_token}`);
        process.exit(0);
      })
      .catch((err) => {
        console.error('Token refresh failed:', err);
        process.exit(1);
      });
  } else if (command === 'fetch') {
    const outputPath = process.argv[3] || 'public/data/strava.json';
    fetchAndStoreData(outputPath)
      .then((data) => {
        console.log('Data fetched successfully');
        console.log(JSON.stringify(data.stats, null, 2));
        process.exit(0);
      })
      .catch((err) => {
        console.error('Data fetch failed:', err);
        process.exit(1);
      });
  } else {
    console.log('Usage: bun scripts/strava/oauth.ts <command>');
    console.log('Commands:');
    console.log('  oauth    - Run manual OAuth flow');
    console.log('  refresh  - Refresh access token');
    console.log('  fetch    - Fetch and store Strava data');
  }
}
