## Setup
- Use GitHub MCP server and playwright-cli skill (install if unavailable)

## Workflow
- Run `pnpm build && pnpm test` before committing to new phases

## Commands
- `pnpm test` - Run unit tests with vitest
- `pnpm build` - Build the project

## Conventions
- Piano keyboard mapping: A-L for white keys (C4-D5), W/E/T/Y/U/O for black keys
- Responsive piano: Mobile C3 (9 white keys), Desktop/Tablet C2 (15 white keys)
- Default note velocity: 0.7
- Piano components use `memo()` for performance
- Pointer events use `setPointerCapture()` for reliable touch/mouse tracking
- Access EffectsContext via `useEffects()` from `src/contexts/EffectsContext.tsx`
- Strava data: static fallback at `/data/strava.json` with `stats`, `recentActivities`, `lastUpdated`, `expiresAt` fields
- Sections use `React.lazy()` + `Suspense` for code splitting
- Tone.js lazy-loaded via `getPianoEngine()` on first user interaction
- Canvas uses IntersectionObserver to pause rendering when off-screen

## Gotchas
- Keyboard handlers: check `e.repeat` to prevent key-hold double-triggers
- Window blur: release all active notes to prevent stuck notes
- Key state tracking: use `useRef` (not useState) to avoid stale closures in event listeners
- `pianoKeyboard.ts` has module-level state (`currentKeyMap`) - reset with `beforeEach(() => setKeyMap(FULL_KEY_MAP))`
- Mocking `useEffects()`: use `vi.importActual` to preserve exports while overriding the hook
- Mocking EffectsContext: include `initPianoEngine: vi.fn()` in mock value
- Animation hooks: use `useReducedMotion()` from `src/contexts/ReduceMotionContext.tsx` (flags: `isReducedMotion`, `disableNonCritical`)
- CSS custom properties: type cast as `{'--my-var': 'value'} as CSSProperties`
- Test cleanup: use `afterEach(() => cleanup())` between test cases
- Testing dynamic hook states: use `vi.doMock()` + `vi.resetModules()` + dynamic `await import()` pattern
