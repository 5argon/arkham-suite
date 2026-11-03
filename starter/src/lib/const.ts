export const cardImagePath = import.meta.env.PUBLIC_CARD_CDN_URL ?? '/image/card';
export const siteOrigin = 'https://arkham-starter.com';

/**
 * The full address of a path under the site root, for use off the site.
 */
export function siteUrl(path: string): string {
	return `${siteOrigin}/${path.replace(/^\//, '')}`;
}
