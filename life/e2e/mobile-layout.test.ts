import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { expect, test, type Page } from '@playwright/test';

/**
 * Every profile page at iPhone size: no widget scrolls sideways or spills past its frame, and no
 * page scrolls sideways. Runs against a real Database, so it needs `LIFE_E2E_DB` pointing at an
 * .ahlifedb file and is skipped without one.
 */
const DB = process.env.LIFE_E2E_DB;
const CLASSES = ['guardian', 'seeker', 'rogue', 'mystic', 'survivor', 'neutral'];
const CARD_PAGES = ['core', 'asset', 'event', 'skill', 'keywords', 'levels'];

test.use({ viewport: { width: 393, height: 852 }, isMobile: true, hasTouch: true });

interface Problem {
	widget: string;
	kind: 'scrolls sideways' | 'spills past the frame';
	px: number;
}

/** Runs in the page: measures every widget frame. */
function measureWidgets(): { pageOverflow: number; problems: Problem[] } {
	const problems: Problem[] = [];
	const scrolls = (el: Element) => {
		const ox = getComputedStyle(el).overflowX;
		return (ox === 'auto' || ox === 'scroll') && el.scrollWidth > el.clientWidth + 2;
	};
	for (const body of document.querySelectorAll('section > .widget-frame__body')) {
		const frame = body.parentElement!;
		const widget = (frame.querySelector('h3')?.textContent ?? '(untitled)').trim();
		const fr = frame.getBoundingClientRect();
		let scroll = 0;
		let spill = 0;
		for (const el of body.querySelectorAll('*')) {
			const cs = getComputedStyle(el);
			if (cs.display === 'none' || cs.visibility === 'hidden') continue;
			if (scrolls(el)) scroll = Math.max(scroll, el.scrollWidth - el.clientWidth);
			let inScroller = false;
			for (let p = el.parentElement; p && p !== body; p = p.parentElement) {
				if (scrolls(p)) inScroller = true;
			}
			const r = el.getBoundingClientRect();
			if (!inScroller && r.width > 0) spill = Math.max(spill, r.right - fr.right, fr.left - r.left);
		}
		if (scroll) problems.push({ widget, kind: 'scrolls sideways', px: Math.round(scroll) });
		if (spill > 1) problems.push({ widget, kind: 'spills past the frame', px: Math.round(spill) });
	}
	return {
		pageOverflow: Math.max(0, document.documentElement.scrollWidth - window.innerWidth),
		problems
	};
}

async function settle(page: Page, url: string) {
	await page.goto(url, { waitUntil: 'networkidle' });
	await page.waitForTimeout(500);
}

test('profile pages fit an iPhone screen', async ({ page }) => {
	test.skip(!DB, 'Set LIFE_E2E_DB to an .ahlifedb file to run this test.');
	test.setTimeout(15 * 60_000);
	const doc = JSON.parse(gunzipSync(readFileSync(DB!)).toString('utf8'));
	const profile = `/p/private/${doc.owner.uid}`;

	page.on('dialog', (d) => d.accept());
	await page.goto('/', { waitUntil: 'networkidle' });
	await page.locator('input[type=file]').first().setInputFiles(DB!);
	await page.waitForURL(/\/archive/, { timeout: 60_000 });

	const urls = [profile, `${profile}/cards`, `${profile}/investigators`, `${profile}/standalones`];
	for (const c of CLASSES) urls.push(`${profile}/cards/${c}`, `${profile}/investigators/${c}`);
	for (const c of CARD_PAGES) urls.push(`${profile}/cards/${c}`);
	await settle(page, `${profile}/campaigns`);
	const campaignPages = await page.$$eval('a[href]', (as) =>
		as.map((a) => a.getAttribute('href') ?? '').filter((h) => /\/campaigns\/[a-z]+$/.test(h))
	);
	urls.push(`${profile}/campaigns`, ...new Set(campaignPages));

	for (const url of urls) {
		await settle(page, url);
		const { pageOverflow, problems } = await page.evaluate(measureWidgets);
		expect.soft(pageOverflow, `${url} scrolls sideways`).toBe(0);
		expect.soft(problems, url).toEqual([]);
	}
});
