import { test, expect } from '@playwright/test';

test('entrance film loads silently, pauses, resumes, and keeps CTAs accessible', async ({ page }) => {
  await page.goto('/');
  const film = page.locator('.entrance-hero video');
  await expect(film).toHaveAttribute('src', '/media/solar-entrance.mp4');
  await expect.poll(() => film.evaluate((el: HTMLVideoElement) => el.currentTime)).toBeGreaterThan(0);
  expect(await film.evaluate((el: HTMLVideoElement) => el.muted && el.playsInline)).toBe(true);
  await page.getByRole('button', { name: 'Pause solar entrance video' }).click();
  await expect.poll(() => film.evaluate((el: HTMLVideoElement) => el.paused)).toBe(true);
  await page.getByRole('button', { name: 'Play solar entrance video' }).click();
  await expect.poll(() => film.evaluate((el: HTMLVideoElement) => el.paused)).toBe(false);
  await expect(page.getByRole('link', { name: 'Request a quotation', exact: true })).toBeVisible();
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
  await page.screenshot({ path: 'test-results/entrance-desktop.png' });
  await page.getByRole('link', { name: 'Explore your solar potential' }).click();
  await expect(page).toHaveURL('/tools');
});

test('mobile entrance selects the smaller clip and does not overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.locator('.entrance-hero video')).toHaveAttribute('src', '/media/solar-entrance-mobile.mp4');
  await expect(page.getByRole('button', { name: 'Pause solar entrance video' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: 'test-results/entrance-mobile.png' });
});

test('reduced motion and data saving avoid automatic film downloads', async ({ page }) => {
  const films: string[] = [];
  page.on('request', req => { if (req.url().includes('.mp4')) films.push(req.url()); });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('.entrance-hero img')).toBeVisible();
  await expect(page.locator('.entrance-hero video')).not.toHaveAttribute('src');
  await page.locator('.residential-film').scrollIntoViewIfNeeded();
  await expect(page.locator('.residential-film video')).not.toHaveAttribute('src');
  expect(films).toEqual([]);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.addInitScript(() => Object.defineProperty(navigator, 'connection', { value: Object.assign(new EventTarget(), { saveData: true }), configurable: true }));
  await page.goto('/');
  await expect(page.locator('.entrance-hero video')).not.toHaveAttribute('src');
  await expect(page.getByRole('button', { name: 'Play solar entrance video' })).toBeVisible();
});

test('video failure leaves an illustrative poster and usable content', async ({ page }) => {
  await page.route('**/media/*.mp4', route => route.abort());
  await page.goto('/');
  await expect(page.locator('.entrance-hero').getByRole('status')).toHaveText('Still image shown');
  await expect(page.locator('.entrance-hero img')).toBeVisible();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('A brighter way to power.');
});
