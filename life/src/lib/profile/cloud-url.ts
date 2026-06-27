/**
 * cloud-url.ts — turn a pasted Dropbox / Google Drive *share* URL into a
 * direct-download URL, and build the `/p?cp=…` viewer link for it.
 *
 * Hosting an `.ahlifepro` and sharing the page's share link is friendlier than
 * handing someone a raw download, but those share links serve an HTML preview, not
 * the file bytes. This maps the common providers to their direct-download form so a
 * future `?cp=` viewer can `fetch()` the file. That viewer (download + hydrate +
 * render) is a SEPARATE, later task — this module only produces the link.
 */

export type CloudProvider = 'dropbox' | 'gdrive' | 'direct';

export interface DirectDownloadResult {
	/** Which provider we recognized (`direct` = passed through unchanged). */
	provider: CloudProvider;
	/** The direct-download URL. */
	url: string;
}

/**
 * Convert a pasted share URL to a direct-download URL for the hosts we recognize:
 *  - **Dropbox** (`dropbox.com/s/…`, `/scl/fi/…`): force the raw-bytes flag `dl=1`.
 *  - **Google Drive** (`/file/d/<id>/…` or `?id=<id>`): `uc?export=download&id=<id>`.
 *  - **anything else**: returned unchanged (assumed already a direct link).
 * Returns `null` for empty input or a non-http(s) URL.
 */
export function toDirectDownloadUrl(shareUrl: string): DirectDownloadResult | null {
	const raw = shareUrl.trim();
	if (!raw) return null;
	let u: URL;
	try {
		u = new URL(raw);
	} catch {
		return null;
	}
	if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
	const host = u.hostname.toLowerCase();

	// Dropbox: flip/append dl=1 (the "serve raw bytes" flag) on the share link.
	if (host === 'dropbox.com' || host.endsWith('.dropbox.com')) {
		u.searchParams.set('dl', '1');
		return { provider: 'dropbox', url: u.toString() };
	}

	// Google Drive: pull the file id from /file/d/<id>/…, /d/<id>, or ?id=<id>.
	if (host === 'drive.google.com' || host === 'docs.google.com') {
		const id = (u.pathname.match(/\/(?:file\/)?d\/([^/]+)/)?.[1] ?? u.searchParams.get('id'))?.trim();
		if (id) return { provider: 'gdrive', url: `https://drive.google.com/uc?export=download&id=${id}` };
	}

	return { provider: 'direct', url: raw };
}

/** Build the shareable viewer URL (`<origin>/p?cp=<encoded direct url>`). `origin`
 *  defaults to a relative URL so it works without knowing the deployed host. */
export function buildCpViewerUrl(directUrl: string, origin = ''): string {
	return `${origin}/p?cp=${encodeURIComponent(directUrl)}`;
}
