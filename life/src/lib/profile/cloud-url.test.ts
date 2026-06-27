import { describe, expect, it } from 'vitest';
import { buildCpViewerUrl, toDirectDownloadUrl } from './cloud-url';

describe('toDirectDownloadUrl', () => {
	it('forces dl=1 on a Dropbox share link', () => {
		const r = toDirectDownloadUrl('https://www.dropbox.com/s/abc123/profile.ahlifepro?dl=0');
		expect(r?.provider).toBe('dropbox');
		expect(r?.url).toContain('dl=1');
		expect(r?.url).not.toContain('dl=0');
	});

	it('adds dl=1 when a Dropbox link has no dl param', () => {
		const r = toDirectDownloadUrl('https://www.dropbox.com/scl/fi/xyz/profile.ahlifepro?rlkey=k');
		expect(r?.provider).toBe('dropbox');
		expect(r?.url).toContain('dl=1');
		expect(r?.url).toContain('rlkey=k');
	});

	it('extracts the file id from a Google Drive /file/d/<id>/ link', () => {
		const r = toDirectDownloadUrl('https://drive.google.com/file/d/1AbC_dEfG/view?usp=sharing');
		expect(r).toEqual({
			provider: 'gdrive',
			url: 'https://drive.google.com/uc?export=download&id=1AbC_dEfG',
		});
	});

	it('extracts the file id from a Google Drive ?id= link', () => {
		const r = toDirectDownloadUrl('https://drive.google.com/open?id=ZZZ999');
		expect(r?.provider).toBe('gdrive');
		expect(r?.url).toBe('https://drive.google.com/uc?export=download&id=ZZZ999');
	});

	it('passes an already-direct link through unchanged', () => {
		const r = toDirectDownloadUrl('https://example.com/me.ahlifepro');
		expect(r).toEqual({ provider: 'direct', url: 'https://example.com/me.ahlifepro' });
	});

	it('rejects empty / non-http input', () => {
		expect(toDirectDownloadUrl('')).toBeNull();
		expect(toDirectDownloadUrl('   ')).toBeNull();
		expect(toDirectDownloadUrl('not a url')).toBeNull();
		expect(toDirectDownloadUrl('ftp://example.com/x')).toBeNull();
	});
});

describe('buildCpViewerUrl', () => {
	it('encodes the direct URL into a /p?cp= viewer link', () => {
		const link = buildCpViewerUrl('https://drive.google.com/uc?export=download&id=ABC', 'https://arkham.life');
		expect(link).toBe('https://arkham.life/p?cp=https%3A%2F%2Fdrive.google.com%2Fuc%3Fexport%3Ddownload%26id%3DABC');
		// Round-trips back to the original direct URL.
		const cp = new URL(link).searchParams.get('cp');
		expect(cp).toBe('https://drive.google.com/uc?export=download&id=ABC');
	});

	it('defaults to a relative link when no origin is given', () => {
		expect(buildCpViewerUrl('https://example.com/x')).toBe('/p?cp=https%3A%2F%2Fexample.com%2Fx');
	});
});
