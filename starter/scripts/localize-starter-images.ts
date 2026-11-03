import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';

/**
 * Copies the images a starter deck's guide links to into the site, then points
 * the guide and the deck's banner at the copies, so a host going away can't
 * break them.
 *
 * Usage: yarn localize-starter-images
 *
 * Each guide owns its images, at
 * static/image/starter/{author}/{series}/{deck}/{original name}.webp
 * Card thumbnails from arkham.build stay linked. Running it again only picks up
 * what is still external.
 */

const STARTER_ROOT = path.resolve(import.meta.dirname, '..');
const CONTENT_DIR = path.join(STARTER_ROOT, 'src/lib/starter-content/starter');
const STATIC_DIR = path.join(STARTER_ROOT, 'static');
const KEPT_HOSTS = new Set(['assets.arkham.build']);
const OWN_IMAGES = 'https://arkham-starter.com/image/starter/';
const IMAGE_URL = /(?:src=["']|!\[[^\]]*\]\()(https?:\/\/[^"')\s]+)/g;

interface SeriesJson {
	decks: { slug: string; bannerUrl?: string }[];
}

function externalImages(guide: string): string[] {
	const urls = [...guide.matchAll(IMAGE_URL)].map((match) => match[1]);
	return [...new Set(urls)].filter((url) => !KEPT_HOSTS.has(new URL(url).host));
}

async function localize(url: string, folder: string): Promise<string> {
	const name = path.parse(new URL(url).pathname).name;
	const local = `${folder}/${name}.webp`;
	const file = path.join(STATIC_DIR, local);
	if (!fs.existsSync(file)) {
		const response = await fetch(url);
		if (!response.ok) throw new Error(`${response.status} downloading ${url}`);
		fs.mkdirSync(path.dirname(file), { recursive: true });
		await sharp(Buffer.from(await response.arrayBuffer()))
			.webp({ quality: 90 })
			.toFile(file);
	}
	return `/${local}`;
}

async function localizeSeries(author: string, series: string): Promise<number> {
	const seriesDir = path.join(CONTENT_DIR, author, series);
	const seriesFile = path.join(seriesDir, 'series.json');
	let seriesText = fs.readFileSync(seriesFile, 'utf8');
	const { decks } = JSON.parse(seriesText) as SeriesJson;
	let copied = 0;
	for (const { slug, bannerUrl } of decks) {
		const guideFile = path.join(seriesDir, 'guides', `${slug}.md`);
		let guide = fs.readFileSync(guideFile, 'utf8').replaceAll(OWN_IMAGES, '/image/starter/');
		const folder = `image/starter/${author}/${series}/${slug}`;
		for (const url of externalImages(guide)) {
			const local = await localize(url, folder);
			guide = guide.replaceAll(url, local);
			if (url === bannerUrl) {
				seriesText = seriesText.replace(JSON.stringify(url), JSON.stringify(local));
			}
			copied++;
		}
		fs.writeFileSync(guideFile, guide);
	}
	fs.writeFileSync(seriesFile, seriesText);
	return copied;
}

for (const author of fs.readdirSync(CONTENT_DIR)) {
	for (const series of fs.readdirSync(path.join(CONTENT_DIR, author))) {
		const copied = await localizeSeries(author, series);
		console.log(`${author}/${series}: ${copied} images`);
	}
}
