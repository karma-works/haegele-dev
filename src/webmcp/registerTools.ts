import { getModelContext, type ModelContext } from './modelContext';
import { tools } from './tools';

// Serialize lifetimes so late registration promises cannot remove a newer tool.
const registrations = new WeakMap<ModelContext, { signal: AbortSignal; done: Promise<void> }>();
export function registerWebMCPTools(signal: AbortSignal): Promise<void> {
  if (signal.aborted || typeof window === 'undefined' || window.top !== window.self) return Promise.resolve();
  const context = getModelContext();
  if (!context) return Promise.resolve();
  const previous = registrations.get(context);
  if (previous && !previous.signal.aborted) return previous.done;
  const done = (async () => {
    await previous?.done;
    if (signal.aborted) return;
    const lifetime = new AbortController();
    const cleanups: (() => void)[] = [];
    const cleanup = () => {
      lifetime.abort();
      for (const dispose of cleanups.splice(0)) {
        try { dispose(); } catch { /* Expired implementations must degrade quietly. */ }
      }
    };
    signal.addEventListener('abort', cleanup, { once: true });
    try {
      for (const tool of tools) {
        if (signal.aborted) break;
        const registration = await context.registerTool(tool, { signal: lifetime.signal });
        const dispose = registration?.unregister ? () => registration.unregister?.() : () => context.unregisterTool?.(tool.name);
        cleanups.push(dispose);
        if (signal.aborted) cleanup();
      }
    } catch {
      cleanup();
      signal.removeEventListener('abort', cleanup);
      registrations.delete(context);
    }
  })();
  registrations.set(context, { signal, done });
  return done;
}
