import { test, expect } from '@playwright/test';

test('registers six tools without scrolling, including the idle fallback', async ({ page }) => {
  await page.addInitScript(() => {
    const registry: Record<string, { execute: (input: unknown) => Promise<unknown> }> = {};
    Object.defineProperty(window, 'requestIdleCallback', { value: undefined });
    Object.defineProperty(window, '__siteTools', { value: registry });
    Object.defineProperty(document, 'modelContext', { configurable: true, value: {
      registerTool(tool: { name: string; execute: (input: unknown) => Promise<unknown> }, options: { signal: AbortSignal }) {
        if (registry[tool.name]) throw new Error('Duplicate tool');
        registry[tool.name] = tool;
        options.signal.addEventListener('abort', () => { delete registry[tool.name]; });
        return Promise.resolve();
      },
    } });
  });
  await page.goto('/');
  await expect.poll(() => page.evaluate(() => Object.keys((window as unknown as { __siteTools: object }).__siteTools).sort())).toEqual(['get_contact_channels', 'get_profile', 'get_project', 'get_skills', 'list_projects', 'search_site']);
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
  const result = await page.evaluate(async () => {
    const tools = (window as unknown as { __siteTools: Record<string, { execute: (input: unknown) => Promise<unknown> }> }).__siteTools;
    return tools.get_profile!.execute({});
  });
  expect(JSON.stringify(result)).toContain('Christian Hägele');
});

test('registers during the browser idle callback', async ({ page }) => {
  await page.addInitScript(() => {
    const names: string[] = [];
    Object.defineProperty(window, '__toolNames', { value: names });
    Object.defineProperty(document, 'modelContext', { value: { registerTool(tool: { name: string }) { names.push(tool.name); } } });
  });
  await page.goto('/');
  await expect.poll(() => page.evaluate(() => (window as unknown as { __toolNames: string[] }).__toolNames.length)).toBe(6);
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
});

test('serves generated files as content rather than the SPA shell', async ({ request }) => {
  for (const path of ['/llms.txt', '/llms-full.txt']) {
    const response = await request.get(path);
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('text/plain');
    expect(await response.text()).toContain('Christian Hägele');
    expect(await response.text()).not.toContain('<!DOCTYPE html>');
  }
  const profile = await request.get('/data/profile.json');
  expect((await profile.json()).name).toBe('Christian Hägele');
  const home = await request.get('/');
  expect(await home.text()).toContain('application/ld+json');
});

test('shows an honest unsupported state and fits mobile screens', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(document, 'modelContext', { value: undefined });
    Object.defineProperty(navigator, 'modelContext', { value: undefined });
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.locator('#agents').scrollIntoViewIfNeeded();
  await expect(page.locator('#agents [role="status"]')).toContainText('not available');
  await expect(page.locator('#agents article')).toHaveCount(6);
  expect(await page.locator('#agents').evaluate(element => element.scrollWidth <= window.innerWidth)).toBe(true);
});
