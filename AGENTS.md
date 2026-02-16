## Setup
- Use GitHub MCP server and playwright-cli skill (install if unavailable)

## Workflow
- Run `pnpm build && pnpm test` before committing to new phases

## Commands
- `pnpm test` - Run unit tests with vitest
- `pnpm build` - Build the project
- `pnpm typecheck` - Run TypeScript type checking
- `pnpm lint` - Run ESLint

## Conventions

### Piano
- Keyboard mapping: A-L for white keys (C4-D5), W/E/T/Y/U/O for black keys
- Responsive: Mobile C3 (9 white keys), Desktop/Tablet C2 (15 white keys)
- Default velocity: 0.7; components use `memo()` for performance
- Audio: Tone.js Sampler via `getPianoEngine()` from `src/audio/PianoEngine.ts` (lazy-loaded with Salamander Grand Piano samples)
- Pointer events: use `setPointerCapture()` for reliable touch/mouse tracking

### Contexts
- EffectsContext: `useEffects()` from `src/contexts/EffectsContext.tsx`
- ReduceMotionContext: `useReducedMotion()` returns `{ isReducedMotion, disableNonCritical }`

### UI/Accessibility
- Focus: `:focus-visible` with `--color-focus` variable
- Touch targets: min 44px; Screen reader text: `.sr-only` class
- Canvas: IntersectionObserver to pause off-screen rendering
- Sections: `React.lazy()` + `Suspense` for code splitting

### Build/Deploy
- Output: `dist` with vendor chunk splitting and CSS code split
- SPA routing: `/*` → `/index.html` rewrites on Vercel/Cloudflare
- Assets: `/assets/*` get 1-year max-age with immutable
- Headers: X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, Referrer-Policy
- Strava data: `public/data/strava.json` with `stats`, `recentActivities`, `lastUpdated`, `expiresAt`

### E2E Testing
- Viewport: `page.setViewportSize({ width, height })`
- Reduced motion: `page.emulateMedia({ reducedMotion: 'reduce' })`

## Gotchas

### Event Handlers
- Keyboard: check `e.repeat` to prevent key-hold double-triggers
- Window blur: release all active notes to prevent stuck notes
- State: use `useRef` (not useState) in event listeners to avoid stale closures

### Piano Testing
- `src/utils/pianoKeyboard.ts` has module-level state (`currentKeyMap`)
- Reset with: `beforeEach(() => setKeyMap(FULL_KEY_MAP))`
- Note handlers: call both visual state AND `pianoEngineRef.current?.play()/stop()`

### React Testing
- Mock `useEffects()`: use `vi.importActual` to preserve exports while overriding
- Mock EffectsContext: include `initPianoEngine: vi.fn()` in mock value
- Dynamic hooks: `vi.doMock()` + `vi.resetModules()` + dynamic `await import()` pattern
- Cleanup: `afterEach(() => cleanup())` between test cases

### Styling
- CSS custom properties: type cast as `{'--my-var': 'value'} as CSSProperties`
- Cards over PulseBackground: need explicit `z-index` to appear above canvas

### Deployment
- Vercel: requires `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` secrets
