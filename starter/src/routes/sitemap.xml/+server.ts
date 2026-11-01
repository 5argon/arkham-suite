import { siteOrigin } from '$lib/const';
import { starterSitemapPaths } from '$lib/starter-content/seo';

export const prerender = true;

export function GET() {
	const urls = starterSitemapPaths()
		.map((path) => `<url><loc>${siteOrigin}${path}</loc></url>`)
		.join('');
	return new Response(
		`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`,
		{ headers: { 'Content-Type': 'application/xml' } }
	);
}
