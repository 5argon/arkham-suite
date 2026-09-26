/** Dropbox / Google Drive share links serve an HTML preview; these helpers turn them into direct
 *  downloads. */

export type CloudProvider = 'dropbox' | 'gdrive' | 'direct';

export interface DirectDownloadResult {
	/** `direct`: an unrecognized host, passed through unchanged. */
	provider: CloudProvider;
	url: string;
}

/** Null for empty input or a non-http(s) URL. */
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

	// dl=1 makes Dropbox serve the raw bytes.
	if (host === 'dropbox.com' || host.endsWith('.dropbox.com')) {
		u.searchParams.set('dl', '1');
		return { provider: 'dropbox', url: u.toString() };
	}

	// The file id sits in /file/d/<id>/…, /d/<id> or ?id=<id>.
	if (host === 'drive.google.com' || host === 'docs.google.com') {
		const id = (
			u.pathname.match(/\/(?:file\/)?d\/([^/]+)/)?.[1] ?? u.searchParams.get('id')
		)?.trim();
		if (id)
			return { provider: 'gdrive', url: `https://drive.google.com/uc?export=download&id=${id}` };
	}

	return { provider: 'direct', url: raw };
}

/** `<origin>/p?cp=<encoded direct url>`; relative without an origin. */
export function buildCpViewerUrl(directUrl: string, origin = ''): string {
	return `${origin}/p?cp=${encodeURIComponent(directUrl)}`;
}
