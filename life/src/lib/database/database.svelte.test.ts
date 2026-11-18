import { describe, expect, it } from 'vitest';

import { DatabaseStore } from './database.svelte';
import { DATABASE_FORMAT_VERSION, createEmptyDatabase, type DatabaseDocument } from './document';
import type { PersistenceAdapter } from './persistence';
import { saveStatus } from './save-status.svelte';

/** Hands back `stored` and records the last written document. */
function fakeAdapter(stored: unknown): PersistenceAdapter & { saved: DatabaseDocument | null } {
	return {
		saved: null,
		async load() {
			return stored;
		},
		async save(doc) {
			this.saved = JSON.parse(JSON.stringify(doc)) as DatabaseDocument;
		},
		async clear() {
			this.saved = null;
		}
	};
}

const flush = () => new Promise((r) => setTimeout(r, 350)); // past RECOMPUTE_DEBOUNCE_MS

describe('DatabaseStore.init', () => {
	it('loads and validates a current-format database, warming its cache', async () => {
		const doc = createEmptyDatabase({ name: 'Owner', iconCardCode: '01001' });
		const store = new DatabaseStore();
		await store.init(fakeAdapter(JSON.parse(JSON.stringify(doc))));

		expect(store.status).toBe('ready');
		expect(store.doc?.formatVersion).toBe(DATABASE_FORMAT_VERSION);
		expect(store.doc?.playGroups).toEqual([]);

		await flush();
		expect(store.doc?.profileCache).toBeTruthy();
	});

	it('reports empty when nothing is stored', async () => {
		const store = new DatabaseStore();
		await store.init(fakeAdapter(null));
		expect(store.status).toBe('empty');
		expect(store.doc).toBeNull();
	});

	it('keeps an unreadable stored document and refuses to replace it until it is dealt with', async () => {
		const stale = {
			...createEmptyDatabase({ name: 'Owner' }),
			formatVersion: DATABASE_FORMAT_VERSION - 1
		};
		const adapter = fakeAdapter(JSON.parse(JSON.stringify(stale)));
		const store = new DatabaseStore();
		await store.init(adapter);

		expect(store.status).toBe('error');
		expect(store.doc).toBeNull();
		expect(store.lastError).toMatch(/unsupported format/);
		expect(store.hasUnreadableCopy).toBe(true);
		await expect(store.createNew({ name: 'New' })).rejects.toThrow();
		expect(adapter.saved).toBeNull();

		await store.discardUnreadable();
		expect(store.status).toBe('empty');
		await store.createNew({ name: 'New' });
		expect(adapter.saved?.owner.name).toBe('New');
	});
});

describe('change counting', () => {
	it('counts one change per flushed write, not per mutation', async () => {
		saveStatus.clear();
		const store = new DatabaseStore();
		await store.init(fakeAdapter(null));
		await store.createNew({ name: 'Owner' });
		expect(saveStatus.changes).toBe(0);

		const c = store.createCampaign({ campaignCode: 'x', title: 'T' })!;
		for (const title of ['T', 'Ti', 'Tit', 'Titl', 'Title']) store.updateCampaignGeneral(c.id, { title });
		await store.saveNow();
		expect(saveStatus.changes).toBe(1);

		await store.saveNow();
		expect(saveStatus.changes).toBe(1);
	});
});
