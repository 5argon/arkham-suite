import { describe, expect, it } from 'vitest';
import { DatabaseStore } from './database.svelte';
import { DATABASE_FORMAT_VERSION, createEmptyDatabase, type DatabaseDocument } from './document';
import type { PersistenceAdapter } from './persistence';

/**
 * An in-memory adapter that hands back a pre-seeded stored value and records the
 * last document written, so we can assert what `init` loaded and re-persisted.
 */
function fakeAdapter(stored: unknown): PersistenceAdapter & { saved: DatabaseDocument | null } {
	return {
		capabilities: { kind: 'indexeddb', backedByFile: false },
		saved: null,
		// `load()` returns the raw stored shape, exactly like a real adapter.
		async load() {
			return stored as DatabaseDocument | null;
		},
		async save(doc) {
			// Mirror the real adapters' JSON round-trip so we store a plain (un-proxied) copy.
			this.saved = JSON.parse(JSON.stringify(doc)) as DatabaseDocument;
		},
		async clear() {
			this.saved = null;
		},
	};
}

const flush = () => new Promise((r) => setTimeout(r, 350)); // past RECOMPUTE_DEBOUNCE_MS

describe('DatabaseStore.init', () => {
	it('loads and validates a current-format database, warming its cache', async () => {
		const doc = createEmptyDatabase({ name: 'Owner', iconCardCode: '01001' });
		const adapter = fakeAdapter(JSON.parse(JSON.stringify(doc)));
		const store = new DatabaseStore();
		await store.init(adapter);

		expect(store.status).toBe('ready');
		expect(store.doc?.formatVersion).toBe(DATABASE_FORMAT_VERSION);
		expect(store.doc?.playGroups).toEqual([]);

		// The post-load recompute warms the IN-MEMORY profile cache. It is never
		// persisted (the adapter strips it on save), so check the live doc, not `saved`.
		await flush();
		expect(store.doc?.profileCache).toBeTruthy();
	});

	it('reports empty when nothing is stored', async () => {
		const store = new DatabaseStore();
		await store.init(fakeAdapter(null));
		expect(store.status).toBe('empty');
		expect(store.doc).toBeNull();
	});

	it('reports error on an off-version stored document (no migration path)', async () => {
		// A database persisted by an older app version can no longer be upgraded.
		const stale = { ...createEmptyDatabase({ name: 'Owner' }), formatVersion: DATABASE_FORMAT_VERSION - 1 };
		const store = new DatabaseStore();
		await store.init(fakeAdapter(JSON.parse(JSON.stringify(stale))));
		expect(store.status).toBe('error');
		expect(store.doc).toBeNull();
	});
});
