use github mcp server (https://github.com/modelcontextprotocol/servers/tree/main/src/fetch) and playwright-cli skill (https://github.com/microsoft/playwright-cli).
install them if they are not available in the current environment.
Before continuing with the next project phase, run a build and test (assure all tests are passing), then commit the changes.

## Commands
- `pnpm test` - Run unit tests with vitest
- `pnpm build` - Build the project

## Conventions
- Piano keyboard mapping: A-L for white keys (C4-D5), W/E/T/Y/U/O for black keys (sharps)
- Responsive piano ranges: Mobile from C3 (9 white keys), Desktop/Tablet from C2 (15 white keys)
- Hooks that integrate with EffectsContext should access it via `useEffects()` from `src/contexts/EffectsContext.tsx`
- Default velocity for piano notes is 0.7
- Piano components are wrapped with `memo()` for performance optimization
- Pointer events use `setPointerCapture()` for reliable touch/mouse tracking across elements

## Gotchas
- Keyboard event handlers must check `e.repeat` to prevent key-hold double-triggers
- Window blur event should release all active notes to prevent stuck notes
- Use `useRef` for tracking key state across renders (not useState) to avoid stale closures in event listeners
- `pianoKeyboard.ts` uses module-level state (`currentKeyMap`) that persists across tests - reset with `beforeEach(() => setKeyMap(FULL_KEY_MAP))`
- When testing components using `useEffects()`, mock with `vi.importActual` to preserve actual exports while overriding the hook
- Animation hooks use `useReducedMotion()` from `src/contexts/ReduceMotionContext.tsx` - has `isReducedMotion` (system pref) and `disableNonCritical` (optional animations) flags
- CSS custom properties require type casting: `{'--my-var': 'value'} as CSSProperties` for TypeScript compatibility 
