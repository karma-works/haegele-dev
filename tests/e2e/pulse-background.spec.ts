import { test, expect } from '@playwright/test';

test.describe('PulseBackground', () => {
  test('canvas renders on page load', async ({ page }) => {
    await page.goto('/');

    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();

    const width = await canvas.evaluate((el: HTMLCanvasElement) => el.width);
    const height = await canvas.evaluate((el: HTMLCanvasElement) => el.height);

    expect(width).toBeGreaterThan(0);
    expect(height).toBeGreaterThan(0);
  });

  test('wave renders with proportional scaling on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();

    const canvasWidth = await canvas.evaluate((el: HTMLCanvasElement) => el.width);
    expect(canvasWidth).toBe(375);
  });

  test('wave amplitude scales with viewport height', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 400 });
    await page.goto('/');

    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
  });

  test('prefers-reduced-motion reduces animation', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');

    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();

    const root = page.locator(':root');
    const multiplier = await root.evaluate((el) =>
      getComputedStyle(el).getPropertyValue('--animation-duration-multiplier')
    );
    expect(multiplier.trim()).toBe('0');
  });
});
