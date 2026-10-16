import { test, expect } from '@playwright/test';
import { progressToFrame, framePath, sequences } from '../src/lib/sequences';
import { validateEnquiry } from '../src/lib/enquiry';

test('frame mapping preserves endpoints, reverse order, clamping, and padding', () => {
  const scene = sequences[0];
  expect(progressToFrame(-1, 1, 192)).toBe(1);
  expect(progressToFrame(1, 1, 192)).toBe(192);
  expect(progressToFrame(2, 1, 192)).toBe(192);
  const forward = Array.from({ length: 192 }, (_, i) => progressToFrame(i / 191, 1, 192));
  expect(forward).toEqual(Array.from({ length: 192 }, (_, i) => i + 1));
  expect(forward.toReversed()).toEqual(Array.from({ length: 192 }, (_, i) => 192 - i));
  expect(framePath(scene, 9)).toBe('/sequences/scene-01/frame_000009.webp');
});

test('desktop sequence scrubs in both directions and respects memory bounds', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('A brighter way to power.');
  const canvas = page.locator('canvas[data-sequence]');
  await page.screenshot({ path: 'test-results/home-desktop.png' });
  const sceneTop = await page.locator('.hero').evaluate(el => el.getBoundingClientRect().top + window.scrollY);
  await page.evaluate(top => window.scrollTo(0, top), sceneTop);
  await expect(canvas).toHaveAttribute('data-frame', '1');
  await page.evaluate(top => window.scrollTo(0, top + 600), sceneTop);
  await expect.poll(async () => Number(await canvas.getAttribute('data-frame'))).toBeGreaterThan(7);
  await page.evaluate(top => window.scrollTo(0, top + 1050), sceneTop);
  await expect(canvas).toHaveAttribute('data-frame', '18');
  for (let i = 0; i < 3; i++) { await page.evaluate(top => window.scrollTo(0, top + 150), sceneTop); await page.waitForTimeout(500); await page.evaluate(top => window.scrollTo(0, top + 950), sceneTop); await page.waitForTimeout(500); }
  expect(Number(await canvas.getAttribute('data-cache-size'))).toBeLessThanOrEqual(8);
  await page.evaluate(top => window.scrollTo(0, top), sceneTop);
  await expect(canvas).toHaveAttribute('data-frame', '1');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: 'test-results/home-full-desktop.png', fullPage: true });
  expect(errors).toEqual([]);
});

test('mobile menu traps focus, supports escape and closes after navigation', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.locator('.entrance-hero img')).toBeVisible();
  await page.screenshot({ path: 'test-results/home-mobile.png' });
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Shift+Tab');
  expect(await page.getByRole('dialog').evaluate(dialog => dialog.contains(document.activeElement))).toBe(true);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(page.getByRole('button', { name: 'Open navigation' })).toBeFocused();
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await page.getByRole('navigation', { name: 'Mobile navigation' }).getByRole('link', { name: 'Solutions' }).click();
  await expect(page).toHaveURL('/solutions');
  await expect(page.getByRole('dialog')).toBeHidden();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: 'test-results/solutions-mobile.png', fullPage: true });
});

test('reduced motion renders a poster without pinning or downloading a frame window', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const requests: string[] = []; page.on('request', req => { if (req.url().includes('.webp')) requests.push(req.url()); });
  await page.goto('/');
  await expect(page.locator('canvas')).toHaveAttribute('data-mode', 'poster');
  await expect(page.locator('.sequence-poster')).toBeVisible();
  expect(await page.locator('.pin-spacer').count()).toBe(0);
  expect(requests.every(url => url.includes('frame_000001.webp'))).toBe(true);
  await page.screenshot({ path: 'test-results/reduced-motion.png' });
});

test('unavailable sequence retains poster and readable content', async ({ page }) => {
  await page.route('**/sequences/scene-01/*.webp', route => route.request().url().endsWith('frame_000001.webp') ? route.continue() : route.abort());
  await page.goto('/');
  const sceneTop = await page.locator('.hero').evaluate(el => el.getBoundingClientRect().top + window.scrollY);
  await page.evaluate(top => window.scrollTo(0, top + 800), sceneTop);
  await expect(page.locator('.sequence-poster')).toBeVisible();
  await expect(page.getByRole('heading', { name: /Brilliance is/ })).toBeAttached();
});

test('enquiry validation and unavailable backend never report false delivery', async ({ page, request }) => {
  await page.goto('/contact?property=residential');
  await expect(page.getByLabel('Property type')).toHaveValue('residential');
  await page.getByLabel('Property location').fill('Test city');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Send enquiry' }).click();
  await expect(page.getByText('Enter a name between 2 and 120 characters.')).toBeVisible();
  await expect(page.getByLabel('Your name')).toBeFocused();
  await page.getByLabel('Your name').fill('Test User');
  await page.getByLabel('Email address').fill('test@example.com');
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Send enquiry' }).click();
  await expect(page.getByRole('status')).toContainText('Your enquiry was not sent.');
  await expect(page.getByRole('button', { name: 'Delivered' })).toHaveCount(0);
  const invalid = await request.post('/api/enquiry', { data: { name: 'A' } });
  expect(invalid.status()).toBe(422);
  const foreign = await request.post('/api/enquiry', { data: {}, headers: { origin: 'https://unrelated.example' } });
  expect(foreign.status()).toBe(403);
  const overlong = validateEnquiry({ name: 'Name', email: 'a@example.com', location: 'City', property: 'commercial', phone: '', requirements: 'x'.repeat(3001) });
  expect(overlong.errors.requirements).toBeTruthy();
  await page.screenshot({ path: 'test-results/contact-mobile.png', fullPage: true });
});

test('business routes, missing projects, and navigation remain usable', async ({ page, request }) => {
  for (const path of ['/solutions', '/projects', '/about', '/contact', '/privacy', '/tools', '/service', '/knowledge']) { const response = await page.goto(path); expect(response?.status()).toBe(200); await expect(page.locator('main h1')).toBeVisible(); expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true); }
  const missing = await request.get('/projects/unverified-example'); expect(missing.status()).toBe(404);
  await page.goto('/projects'); await expect(page.getByText('PROJECT PHOTOGRAPHY TO FOLLOW')).toBeVisible();
});

test('slow downloads and lower CPU retain poster and converge on the requested frame', async ({ page, context }) => {
  const session = await context.newCDPSession(page);
  await session.send('Network.enable');
  await session.send('Network.emulateNetworkConditions', { offline: false, latency: 100, downloadThroughput: 1500 * 1024, uploadThroughput: 200 * 1024 });
  await session.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await page.goto('/');
  await expect(page.locator('.sequence-poster')).toBeVisible();
  const sceneTop = await page.locator('.hero').evaluate(el => el.getBoundingClientRect().top + window.scrollY);
  await page.evaluate(top => window.scrollTo(0, top + 900), sceneTop);
  await expect.poll(async () => Number(await page.locator('canvas').getAttribute('data-frame')), { timeout: 30000 }).toBeGreaterThan(12);
  expect(Number(await page.locator('canvas').getAttribute('data-cache-size'))).toBeLessThanOrEqual(8);
});
