import { siteOrigin } from '$lib/const';
import { reviewLastModified, reviewSitemapPaths } from '$lib/server/reviews';
import { starterSitemapPaths } from '$lib/starter-content/seo';

export const prerender = true;

export function GET() {
	const urls = [...starterSitemapPaths(), ...reviewSitemapPaths()]
		.map((path) => {
			const lastModified = reviewLastModified(path);
			const lastmod = lastModified === undefined ? '' : `<lastmod>${lastModified}</lastmod>`;
			return `<url><loc>${siteOrigin}${path}</loc>${lastmod}</url>`;
		})
		.join('');
	return new Response(
		`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`,
		{ headers: { 'Content-Type': 'application/xml' } }
	);
}
