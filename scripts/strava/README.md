# Strava Integration Scripts

This directory contains utilities for Strava API integration.

## Prerequisites

1. Create a Strava API application at https://www.strava.com/settings/api
2. Set environment variables:

```bash
export STRAVA_CLIENT_ID=your_client_id
export STRAVA_CLIENT_SECRET=your_client_secret
export STRAVA_REFRESH_TOKEN=your_refresh_token  # After initial OAuth
```

## Commands

### Initial OAuth Flow (One-time)

Run this once to get your initial refresh token:

```bash
bun scripts/strava/oauth.ts oauth
```

This will:
1. Display a URL to open in your browser
2. Start a local server on port 3000 to receive the callback
3. Print the refresh token to save in your `.env` file

### Refresh Token

Manually refresh the access token:

```bash
bun scripts/strava/oauth.ts refresh
```

### Fetch Data (Build-time)

Fetch Strava data and save to `public/data/strava.json`:

```bash
bun scripts/strava/oauth.ts fetch
```

Or specify a custom output path:

```bash
bun scripts/strava/oauth.ts fetch path/to/output.json
```

## Architecture

The integration uses a **build-time fetch** approach:

```
GitHub Actions (scheduled)
    ↓
Fetch Strava data → Store as JSON in public/data/
    ↓
Build site with data embedded
    ↓
Deploy to CDN (static files)
```

### Benefits

- No server costs
- Fast page loads (static JSON)
- No client-side API calls
- Tokens stored securely in GitHub Secrets
- Graceful fallback when API unavailable

## Usage in Components

```tsx
import { useStravaData, useStravaDataWithFallback, DEFAULT_STATS } from '../hooks/useStravaData';

// Basic usage
const { stats, isLoading, isAvailable } = useStravaData();

// With fallback data
const fallback = { totalDistance: 1250000, ... };
const { stats, isAvailable } = useStravaDataWithFallback(fallback);
```

## CI/CD Integration

Add to your GitHub Actions workflow:

```yaml
- name: Fetch Strava Data
  env:
    STRAVA_CLIENT_ID: ${{ secrets.STRAVA_CLIENT_ID }}
    STRAVA_CLIENT_SECRET: ${{ secrets.STRAVA_CLIENT_SECRET }}
    STRAVA_REFRESH_TOKEN: ${{ secrets.STRAVA_REFRESH_TOKEN }}
  run: bun scripts/strava/oauth.ts fetch public/data/strava.json

- name: Build
  run: bun run build
```
