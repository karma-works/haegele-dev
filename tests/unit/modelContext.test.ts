import { afterEach, describe, expect, it, vi } from 'vitest';
import { getModelContext, getModelContextSource, type ModelContext } from '../../src/webmcp/modelContext';
import { registerWebMCPTools } from '../../src/webmcp/registerTools';

const setContext = (target: object, value: unknown) => Object.defineProperty(target, 'modelContext', { configurable: true, value });
afterEach(() => {
  Reflect.deleteProperty(document, 'modelContext');
  Reflect.deleteProperty(navigator, 'modelContext');
});
describe('modelContext adapter', () => {
  it('prefers document, falls back to a callable navigator API, and rejects malformed APIs', () => {
    expect(getModelContext()).toBeNull();
    const legacy = { registerTool: vi.fn() };
    const current = { registerTool: vi.fn() };
    setContext(navigator, legacy);
    expect(getModelContext()).toBe(legacy);
    expect(getModelContextSource()).toBe('navigator');
    setContext(document, current);
    expect(getModelContext()).toBe(current);
    expect(getModelContextSource()).toBe('document');
    setContext(document, { registerTool: true });
    expect(getModelContext()).toBe(legacy);
    setContext(navigator, {});
    expect(getModelContext()).toBeNull();
  });
  it('is a no-op when unsupported or already aborted', async () => {
    await expect(registerWebMCPTools(new AbortController().signal)).resolves.toBeUndefined();
    const registerTool = vi.fn();
    setContext(document, { registerTool });
    const controller = new AbortController(); controller.abort();
    await registerWebMCPTools(controller.signal);
    expect(registerTool).not.toHaveBeenCalled();
  });
  it('deduplicates registration and cleans up legacy APIs on abort', async () => {
    const context = { registerTool: vi.fn(), unregisterTool: vi.fn() };
    setContext(navigator, context);
    const controller = new AbortController();
    await Promise.all([registerWebMCPTools(controller.signal), registerWebMCPTools(controller.signal)]);
    expect(context.registerTool).toHaveBeenCalledTimes(6);
    controller.abort();
    expect(context.unregisterTool).toHaveBeenCalledTimes(6);
  });
  it('uses native signals and survives StrictMode cleanup followed by remount', async () => {
    const registered = new Set<string>();
    const context: ModelContext = {
      registerTool: vi.fn(async (tool, options) => {
        expect(registered.has(tool.name)).toBe(false);
        registered.add(tool.name);
        options?.signal.addEventListener('abort', () => registered.delete(tool.name));
      }),
    };
    setContext(document, context);
    const first = new AbortController();
    await registerWebMCPTools(first.signal);
    first.abort();
    expect(registered.size).toBe(0);
    const second = new AbortController();
    await registerWebMCPTools(second.signal);
    expect(registered.size).toBe(6);
    second.abort();
    expect(registered.size).toBe(0);
  });
  it('finishes late handle cleanup before registering the next lifetime', async () => {
    let resolve!: (value: { unregister: () => void }) => void;
    const dispose = vi.fn();
    const registerTool = vi.fn().mockImplementationOnce(() => new Promise(r => { resolve = r; }));
    setContext(document, { registerTool });
    const first = new AbortController();
    const pending = registerWebMCPTools(first.signal);
    await Promise.resolve();
    first.abort();
    const second = new AbortController();
    const next = registerWebMCPTools(second.signal);
    resolve({ unregister: dispose });
    await Promise.all([pending, next]);
    expect(dispose).toHaveBeenCalledOnce();
    expect(registerTool).toHaveBeenCalledTimes(7);
    second.abort();
  });
  it('rolls back partial registration when a browser rejects a tool', async () => {
    const unregisterTool = vi.fn();
    const registerTool = vi.fn().mockResolvedValueOnce(undefined).mockRejectedValueOnce(new Error('Unavailable'));
    setContext(document, { registerTool, unregisterTool });
    await expect(registerWebMCPTools(new AbortController().signal)).resolves.toBeUndefined();
    expect(unregisterTool).toHaveBeenCalledWith('get_profile');
  });
});
