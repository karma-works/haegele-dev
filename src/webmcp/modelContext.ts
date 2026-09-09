import type { WebMCPTool } from './tools';

export interface ModelContext {
  registerTool(tool: WebMCPTool, options?: { signal: AbortSignal }):
    Promise<{ unregister?: () => void } | void> | { unregister?: () => void } | void;
  unregisterTool?: (name: string) => void;
}

export function getModelContextSource(): 'document' | 'navigator' | null {
  if (typeof document === 'undefined') return null;
  const current = (document as unknown as { modelContext?: ModelContext }).modelContext;
  if (typeof current?.registerTool === 'function') return 'document';
  const legacy = typeof navigator === 'undefined' ? undefined :
    (navigator as unknown as { modelContext?: ModelContext }).modelContext;
  return typeof legacy?.registerTool === 'function' ? 'navigator' : null;
}

export function getModelContext(): ModelContext | null {
  const source = getModelContextSource();
  if (!source) return null;
  return ((source === 'document' ? document : navigator) as unknown as { modelContext: ModelContext }).modelContext;
}
