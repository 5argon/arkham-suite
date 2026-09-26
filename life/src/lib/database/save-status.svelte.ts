/**
 * Whether the Database has been saved to a `.ahlifedb` file since it last changed. Kept in
 * localStorage, outside the document: recording a save inside the document would itself be a change.
 */
import { browser } from '$app/environment';

import * as m from '$lib/paraglide/messages.js';

import type { DatabaseDocument } from './document';

const KEY = 'arkham-life-backup';

/** Flushed edits since the last save that make the reminder insistent. */
export const ESCALATE_CHANGES = 20;
/** Days since the last save that make the reminder insistent. */
export const ESCALATE_DAYS = 7;

interface Checkpoint {
	/** ms since epoch of the last `.ahlifedb` save. */
	lastExportAt: number | null;
	/** `doc.updatedAt` at that save. */
	lastExportedDocUpdatedAt: number | null;
	/** Edits written to browser storage since that save, one per debounced write. */
	unexportedChanges: number;
}

const EMPTY: Checkpoint = {
	lastExportAt: null,
	lastExportedDocUpdatedAt: null,
	unexportedChanges: 0
};

function read(): Checkpoint {
	if (!browser) return EMPTY;
	try {
		const parsed = JSON.parse(localStorage.getItem(KEY) ?? 'null') as Partial<Checkpoint> | null;
		return { ...EMPTY, ...parsed };
	} catch {
		return EMPTY;
	}
}

function write(value: Checkpoint | null): void {
	if (!browser) return;
	try {
		if (value) localStorage.setItem(KEY, JSON.stringify(value));
		else localStorage.removeItem(KEY);
	} catch {
		// Storage full or disabled: the reminder falls back to "never saved".
	}
}

function ago(ms: number): string {
	const mins = Math.floor(ms / 60_000);
	if (mins < 1) return m.database_save_ago_now();
	if (mins < 60) return m.database_save_ago_minutes({ count: mins });
	const hours = Math.floor(mins / 60);
	if (hours < 24) return m.database_save_ago_hours({ count: hours });
	return m.database_save_ago_days({ count: Math.floor(hours / 24) });
}

class SaveStatus {
	#state = $state<Checkpoint>(read());

	#set(next: Checkpoint | null): void {
		this.#state = next ?? EMPTY;
		write(next);
	}

	get lastSavedAt(): number | null {
		return this.#state.lastExportAt;
	}

	get changes(): number {
		return this.#state.unexportedChanges;
	}

	/** One debounced write of edits reached browser storage. */
	noteFlush(): void {
		this.#set({ ...this.#state, unexportedChanges: this.#state.unexportedChanges + 1 });
	}

	recordSave(doc: DatabaseDocument): void {
		this.#set({
			lastExportAt: Date.now(),
			lastExportedDocUpdatedAt: doc.updatedAt,
			unexportedChanges: 0
		});
	}

	clear(): void {
		this.#set(null);
	}

	/** An untouched new database has nothing to lose yet, so it does not count as unsaved. */
	needsSave(doc: DatabaseDocument): boolean {
		const s = this.#state;
		if (s.unexportedChanges > 0) return true;
		if (s.lastExportedDocUpdatedAt != null) return doc.updatedAt > s.lastExportedDocUpdatedAt;
		return doc.campaigns.length > 0 || doc.standalones.length > 0;
	}

	get escalated(): boolean {
		const s = this.#state;
		if (s.unexportedChanges >= ESCALATE_CHANGES) return true;
		if (s.lastExportAt == null) return s.unexportedChanges > 0;
		return (Date.now() - s.lastExportAt) / 86_400_000 >= ESCALATE_DAYS;
	}

	/** "Last saved 5 minutes ago · 3 changes since"; null before the first save or change. */
	summary(): string | null {
		const { lastExportAt: last, unexportedChanges: changes } = this.#state;
		if (last == null && changes === 0) return null;
		const saved =
			last == null
				? m.database_save_never()
				: m.database_save_last_saved({ when: ago(Date.now() - last) });
		return changes > 0 ? `${saved} · ${m.database_save_changes_since({ count: changes })}` : saved;
	}
}

export const saveStatus = new SaveStatus();
