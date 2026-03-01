import { describe, expect, it } from 'vitest';

import { gzipJsonText, readBackupFile } from './backup-file';

function fileFrom(data: Uint8Array<ArrayBuffer> | string, name: string): File {
	return new File([data], name);
}

const sample = {
	formatVersion: 2,
	owner: { uid: 'P7J-KHY-QMP', name: '5argon' },
	campaigns: [{ id: 'abc', title: 'Edge hard 3', decks: [] as unknown[] }],
};

describe('backup-file', () => {
	it('round-trips a gzipped backup', async () => {
		const bytes = gzipJsonText(JSON.stringify(sample, null, 2));
		expect(await readBackupFile(fileFrom(bytes, 'backup.arkhamlife'))).toEqual(sample);
	});

	it('still reads a legacy uncompressed .json export (backward compat)', async () => {
		const text = JSON.stringify(sample, null, 2);
		expect(await readBackupFile(fileFrom(text, 'old-export.json'))).toEqual(sample);
	});

	it('produces a real gzip stream (magic bytes 1f 8b)', () => {
		const bytes = gzipJsonText('{"a":1}');
		expect([bytes[0], bytes[1]]).toEqual([0x1f, 0x8b]);
	});

	it('compresses redundant data far below the original size', () => {
		// Many near-identical records (like a real export's deck versions) should
		// shrink dramatically — this is the whole point of compressing the backup.
		const big = JSON.stringify({
			decks: Array.from({ length: 50 }, (_, i) => ({ ...sample.campaigns[0], i })),
		});
		const ratio = gzipJsonText(big).length / new TextEncoder().encode(big).length;
		expect(ratio).toBeLessThan(0.5);
	});

	it('throws on a corrupt file so the UI can surface the error', async () => {
		// Gzip magic bytes followed by garbage → decompression fails.
		const corrupt = new Uint8Array([0x1f, 0x8b, 0x00, 0x01, 0x02, 0x03]);
		await expect(readBackupFile(fileFrom(corrupt, 'corrupt.arkhamlife'))).rejects.toThrow();
	});
});
