# Strava API Integration Plan

## Available Metrics

### Activity-Level Metrics

| Metric | Type | Description |
|--------|------|-------------|
| `id` | number | Unique activity ID |
| `name` | string | Activity name |
| `type` | string | Run, Ride, Swim, etc. |
| `sport_type` | string | More specific: TrailRun, MountainBikeRide, etc. |
| `start_date` | datetime | ISO 8601 UTC timestamp |
| `start_date_local` | datetime | Local time |
| `distance` | meters | Total distance |
| `moving_time` | seconds | Time spent moving |
| `elapsed_time` | seconds | Total time including stops |
| `total_elevation_gain` | meters | Elevation gained |
| `average_speed` | m/s | Average moving speed |
| `max_speed` | m/s | Maximum speed |
| `average_cadence` | rpm | Running cadence (if recorded) |
| `average_heartrate` | bpm | Average HR (if recorded) |
| `max_heartrate` | bpm | Max HR (if recorded) |
| `calories` | number | Estimated calories |
| `kudos_count` | number | Number of kudos received |
| `map.summary_polyline` | string | Encoded GPS path for maps |
| `device_name` | string | Device used (e.g., "Garmin Forerunner") |

### Athlete Stats Endpoint

**`GET /athletes/{id}/stats`**

| Metric | Description |
|--------|-------------|
| `all_run_totals.distance` | Total lifetime running distance |
| `all_run_totals.count` | Total number of runs |
| `all_run_totals.moving_time` | Total running time |
| `recent_run_totals.distance` | Last 4 weeks running distance |
| `recent_run_totals.count` | Last 4 weeks run count |
| `ytd_run_totals.distance` | Year-to-date running distance |
| `ytd_run_totals.count` | Year-to-date run count |

---

## Required for Integration

### 1. Strava App Registration

1. Go to https://www.strava.com/settings/api
2. Create application:
   - **App Name**: Your choice (e.g., "Portfolio Stats")
   - **Category**: Personal Website
   - **Authorization Callback Domain**: `localhost` (dev) or your domain (prod)

3. Note your credentials:
   ```
   STRAVA_CLIENT_ID=xxxxx
   STRAVA_CLIENT_SECRET=xxxxx
   ```

### 2. OAuth Scopes Required

| Scope | Purpose |
|-------|---------|
| `read` | Read public profile |
| `activity:read` | Read activities visible to Everyone/Followers |
| `activity:read_all` | Read private activities (optional) |

### 3. Token Management

```
Access Token  → Expires in 6 hours
Refresh Token → Long-lived (use to get new access tokens)
```

**Initial Authorization Flow:**
```
1. Redirect user to: 
   https://www.strava.com/oauth/authorize?client_id={ID}&redirect_uri={URI}&response_type=code&scope=activity:read

2. User authorizes → redirected back with ?code=xxx

3. Exchange code for tokens:
   POST https://www.strava.com/oauth/token
   { client_id, client_secret, code, grant_type: "authorization_code" }

4. Response includes: access_token, refresh_token, expires_at
```

**Token Refresh:**
```
POST https://www.strava.com/oauth/token
{ client_id, client_secret, refresh_token, grant_type: "refresh_token" }
```

---

## API Endpoints Needed

| Endpoint | Use Case |
|----------|----------|
| `GET /athlete` | Get athlete profile |
| `GET /athlete/stats` | Get lifetime/recent stats |
| `GET /athlete/activities?per_page=10` | Get recent activities |

### Sample Requests

**Get Recent Activities:**
```bash
curl -X GET "https://www.strava.com/api/v3/athlete/activities?per_page=5" \
  -H "Authorization: Bearer {access_token}"
```

**Get Athlete Stats:**
```bash
curl -X GET "https://www.strava.com/api/v3/athletes/{athlete_id}/stats" \
  -H "Authorization: Bearer {access_token}"
```

---

## Rate Limits

- **15-minute limit**: 200 requests
- **Daily limit**: 2,000 requests
- **Strategy**: Cache data, refresh only when needed

---

## Implementation Architecture

### Recommended: Build-Time Fetch (Static Site)

```
GitHub Actions (scheduled, every 6 hours)
    ↓
Fetch Strava data → Store as JSON
    ↓
Build site with data embedded
    ↓
Deploy to CDN
```

**Benefits:**
- No server costs
- Fast page loads
- No client-side API calls
- Tokens stored securely in GitHub Secrets

### Environment Variables (GitHub Secrets)

```
STRAVA_CLIENT_ID
STRAVA_CLIENT_SECRET
STRAVA_REFRESH_TOKEN
```

---

## TypeScript Types

```typescript
interface StravaActivity {
  id: number;
  name: string;
  type: 'Run' | 'Ride' | 'Swim' | 'Walk' | 'Hike';
  start_date: string;
  distance: number;       // meters
  moving_time: number;    // seconds
  elapsed_time: number;   // seconds
  total_elevation_gain: number;
  average_speed: number;  // m/s
  average_heartrate?: number;
  map?: {
    summary_polyline: string;
  };
}

interface StravaStats {
  all_run_totals: {
    distance: number;
    count: number;
    moving_time: number;
  };
  recent_run_totals: {
    distance: number;
    count: number;
  };
  ytd_run_totals: {
    distance: number;
    count: number;
  };
}

interface RunningData {
  stats: {
    totalDistance: number;   // km
    totalRuns: number;
    yearDistance: number;    // km
    yearRuns: number;
    recentDistance: number;  // km (last 4 weeks)
    recentRuns: number;
  };
  recentActivities: Activity[];
}
```

---

## Display Components (per Content Plan)

### Running Stats Widget
```
┌─────────────────────────────────┐
│  🏃 Running                     │
├─────────────────────────────────┤
│  This Year        Last 4 Weeks  │
│  234 km           42 km         │
│  28 runs          5 runs        │
├─────────────────────────────────┤
│  Recent Activities              │
│  • Morning Run - 5.2km          │
│  • Trail Run - 8.1km            │
│  • Easy Run - 4.0km             │
└─────────────────────────────────┘
```

---

## Next Steps

1. [ ] Create Strava App at https://www.strava.com/settings/api
2. [ ] Store credentials in environment/secrets
3. [ ] Implement token refresh utility
4. [ ] Create data fetching script
5. [ ] Build display component
6. [ ] Set up scheduled refresh (if using build-time approach)
