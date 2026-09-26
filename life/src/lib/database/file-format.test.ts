import { describe, expect, it } from 'vitest';

import { fileStem, gzipJsonText, readDataFile, safeFileName } from './file-format';

function fileFrom(data: Uint8Array<ArrayBuffer> | string, name: string): File {
	return new File([data], name);
}

const sample = {
	formatVersion: 2,
	owner: { uid: 'P7J-KHY-QMP', name: '5argon' },
	campaigns: [{ id: 'abc', title: 'Edge hard 3', decks: [] as unknown[] }],
};

describe('file-format', () => {
	it('round-trips a gzipped file', async () => {
		const bytes = gzipJsonText(JSON.stringify(sample, null, 2));
		expect(await readDataFile(fileFrom(bytes, 'db.ahlifedb'))).toEqual(sample);
	});

	it('reads a plain .json export', async () => {
		const text = JSON.stringify(sample, null, 2);
		expect(await readDataFile(fileFrom(text, 'old-export.json'))).toEqual(sample);
	});

	it('produces a real gzip stream (magic bytes 1f 8b)', () => {
		const bytes = gzipJsonText('{"a":1}');
		expect([bytes[0], bytes[1]]).toEqual([0x1f, 0x8b]);
	});

	it('compresses redundant data far below the original size', () => {
		const big = JSON.stringify({
			decks: Array.from({ length: 50 }, (_, i) => ({ ...sample.campaigns[0], i })),
		});
		const ratio = gzipJsonText(big).length / new TextEncoder().encode(big).length;
		expect(ratio).toBeLessThan(0.5);
	});

	it('throws on a corrupt file so the UI can surface the error', async () => {
		// Gzip magic bytes followed by garbage → decompression fails.
		const corrupt = new Uint8Array([0x1f, 0x8b, 0x00, 0x01, 0x02, 0x03]);
		await expect(readDataFile(fileFrom(corrupt, 'corrupt.ahlifedb'))).rejects.toThrow();
	});

	it('builds filesystem-safe dated stems', () => {
		expect(safeFileName('The Keeper / #1')).toBe('The_Keeper_1');
		expect(safeFileName('')).toBe('untitled');
		expect(fileStem('arkham-life', 'Keeper', '-x')).toMatch(/^arkham-life-Keeper-x-\d{4}-\d{2}-\d{2}$/);
	});
});
