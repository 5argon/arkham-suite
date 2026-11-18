import { expect, test, type Page } from '@playwright/test';

/**
 * Leaving a campaign for its list, with the browser's back button or the page's own Back, returns
 * to the same page of the list at the same scroll. Runs against a real Database with more than one
 * page of campaigns, so it needs `LIFE_E2E_DB` pointing at an .ahlifedb file and is skipped
 * without one.
 */
const DB = process.env.LIFE_E2E_DB;

test.use({ viewport: { width: 393, height: 852 }, isMobile: true, hasTouch: true });

const backButton = (page: Page) => page.getByRole('button', { name: /\bBack$/ }).first();

async function loadDatabase(page: Page) {
	page.on('dialog', (d) => d.accept());
	await page.goto('/', { waitUntil: 'networkidle' });
	await page.locator('input[type=file]').first().setInputFiles(DB!);
	await page.waitForURL(/\/archive/, { timeout: 60_000 });
}

/** Opens a campaign from far down the list and comes back, returning where the list was left. */
async function openAndReturn(page: Page, list: string, back: () => Promise<unknown>) {
	await page.goto(list, { waitUntil: 'networkidle' });
	const entry = page.locator('a[href^="/archive/edit?id="]').nth(12);
	await entry.scrollIntoViewIfNeeded();
	await page.evaluate(() => window.scrollBy(0, 100));
	const left = await page.evaluate(() => Math.round(window.scrollY));
	await entry.click();
	await page.waitForURL(/\/archive\/edit/);
	await page.evaluate(() => window.scrollTo(0, 300));
	await back();
	await page.waitForURL((u) => !u.pathname.startsWith('/archive/edit'));
	await expect.poll(() => page.evaluate(() => Math.round(window.scrollY))).toBe(left);
	return new URL(page.url());
}

test.describe('returning to the campaign list', () => {
	test.skip(!DB, 'Set LIFE_E2E_DB to an .ahlifedb file to run this test.');

	test.beforeEach(async ({ page }) => loadDatabase(page));

	test('with the browser back button', async ({ page }) => {
		const url = await openAndReturn(page, '/archive?page=2&sort=campaign', () => page.goBack());
		expect(url.pathname + url.search).toBe('/archive?page=2&sort=campaign');
	});

	test('with the Back button', async ({ page }) => {
		const url = await openAndReturn(page, '/archive?page=2&sort=campaign', () =>
			backButton(page).click()
		);
		expect(url.pathname + url.search).toBe('/archive?page=2&sort=campaign');
	});

	test('with the Back button of a campaign opened directly', async ({ page }) => {
		await page.goto('/archive', { waitUntil: 'networkidle' });
		const href = await page.locator('a[href^="/archive/edit?id="]').first().getAttribute('href');
		await page.goto(href!, { waitUntil: 'networkidle' });
		await backButton(page).click();
		await page.waitForURL((u) => u.pathname === '/archive');
		expect(new URL(page.url()).search).toBe('');
	});
});
