# Deployment Guide

## Overview

This project supports deployment to both Vercel and Cloudflare Pages with automatic CI/CD via GitHub Actions.

## GitHub Actions CI/CD

The CI/CD pipeline runs automatically on:
- Push to `main` branch
- Pull requests to `main` branch

### Required Secrets

Configure these secrets in your GitHub repository settings (`Settings > Secrets and variables > Actions`):

| Secret | Description | How to get |
|--------|-------------|------------|
| `VERCEL_TOKEN` | Vercel API token | [Vercel Account Tokens](https://vercel.com/account/tokens) |
| `VERCEL_ORG_ID` | Vercel organization ID | Run `vercel link` locally |
| `VERCEL_PROJECT_ID` | Vercel project ID | Run `vercel link` locally |

### Pipeline Steps

1. **Lint & Typecheck**: Runs ESLint and TypeScript compiler
2. **Test**: Executes unit tests with Vitest
3. **Build**: Creates production build
4. **Deploy**: Deploys to Vercel (main branch only)

## Vercel Deployment

### Initial Setup

1. Install Vercel CLI:
   ```bash
   pnpm add -g vercel
   ```

2. Link project to Vercel:
   ```bash
   vercel link
   ```

3. Deploy to preview:
   ```bash
   vercel
   ```

4. Deploy to production:
   ```bash
   vercel --prod
   ```

### Configuration

The `vercel.json` file configures:
- Build command: `pnpm build`
- Output directory: `dist`
- SPA routing (rewrites all routes to index.html)
- Security headers
- Asset caching (1 year for static assets)

## Cloudflare Pages Deployment

### Initial Setup

1. Install Wrangler CLI:
   ```bash
   pnpm add -g wrangler
   ```

2. Authenticate:
   ```bash
   wrangler login
   ```

3. Deploy:
   ```bash
   wrangler pages deploy dist
   ```

### Configuration

The `wrangler.toml` file configures:
- Build command: `pnpm build`
- Output directory: `dist`
- SPA routing (redirects all routes to index.html)
- Security headers
- Asset caching

### GitHub Integration

Cloudflare Pages can also be connected directly to GitHub:
1. Go to Cloudflare Dashboard > Pages
2. Create a new project > Connect to Git
3. Select repository and configure:
   - Build command: `pnpm build`
   - Build output directory: `dist`

## Custom Domain Setup

### Vercel

1. Go to Project Settings > Domains
2. Add your custom domain (e.g., `haegele.dev`)
3. Configure DNS records:
   - For apex domain: Add A record pointing to `76.76.21.21`
   - For www subdomain: Add CNAME record pointing to `cname.vercel-dns.com`
4. Wait for SSL certificate provisioning (automatic)

### Cloudflare Pages

1. Go to your Pages project > Custom domains
2. Add your custom domain
3. Configure DNS in Cloudflare:
   - For apex domain: Add CNAME record (Cloudflare will flatten it)
   - For subdomain: Add CNAME record pointing to your Pages URL
4. Enable "Proxied" status for DDoS protection

### DNS Configuration Example

For `haegele.dev` domain:

```
Type    Name    Value                   TTL
----    ----    -----                   ---
A       @       76.76.21.21            (Vercel)
CNAME   www     cname.vercel-dns.com   (Vercel)
```

Or for Cloudflare Pages:

```
Type    Name    Value                   TTL      Proxy
----    ----    -----                   ---      -----
CNAME   @       your-project.pages.dev  Auto     Yes
CNAME   www     your-project.pages.dev  Auto     Yes
```

## Environment Variables

### Vercel

Set environment variables in:
- Project Settings > Environment Variables
- Or via CLI: `vercel env add VARIABLE_NAME`

### Cloudflare Pages

Set environment variables in:
- Pages project > Settings > Environment variables

### Production Variables

Common production environment variables:
- `NODE_ENV=production`

## Monitoring & Logs

### Vercel
- Analytics: Project > Analytics
- Logs: Project > Deployments > [deployment] > Functions/Logs
- Real-time logs: `vercel logs --follow`

### Cloudflare Pages
- Analytics: Cloudflare Dashboard > Analytics
- Logs: Pages project > Logs tab

## Rollback

### Vercel
1. Go to Deployments tab
2. Find previous successful deployment
3. Click "..." menu > Promote to Production

### Cloudflare Pages
1. Go to Pages project > Deployments
2. Find previous successful deployment
3. Click "Rollback to this deployment"

## Performance Optimization

The build configuration includes:
- Code splitting with vendor chunks
- CSS code splitting
- Asset hashing for long-term caching
- esbuild minification
- ESNext target for modern browsers
