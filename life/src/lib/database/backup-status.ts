/**
 * backup-status.ts — tracks whether the user has exported (backed up) their database
 * since their last change.
 *
 * The whole database lives in IndexedDB, which the browser can evict without warning
 * (clearing site data, private browsing, disk pressure). Non-power users assume
 * their data is auto-saved to disk — it isn't. The user's only real backup is the
 * exported JSON file. This module powers a blunt reminder banner (see the root
 * layout) + the import/export readout, nudging people to export.
 *
 * The checkpoint is kept in localStorage, deliberately OUTSIDE the document — if it
 * lived in the doc, recording a backup would itself be a change, so the doc could
 * never be "fully backed up". It is a small, per-browser hint, not authoritative.
 */
import { browser } from '$app/environment';

import type { DatabaseDocument } from './document';

const KEY = 'arkham-life-backup';

/** A change count that escalates the banner from gentle to insistent. */
export const ESCALATE_CHANGES = 20;
/** Days since last backup that also escalate the banner. */
export const ESCALATE_DAYS = 7;

export interface BackupStatus {
	/** ms-since-epoch of the last full-database export, or null if never. */
	lastExportAt: number | null;
	/** doc.updatedAt captured at the last export (the "backed-up watermark"). */
	lastExportedDocUpdatedAt: number | null;
	/** Mutations recorded since the last export. */
	unexportedChanges: number;
}

const EMPTY: BackupStatus = { lastExportAt: null, lastExportedDocUpdatedAt: null, unexportedChanges: 0 };

function read(): BackupStatus {
	if (!browser) return { ...EMPTY };
	try {
		const raw = localStorage.getItem(KEY);
		if (!raw) return { ...EMPTY };
		const parsed = JSON.parse(raw) as Partial<BackupStatus>;
		return {
			lastExportAt: parsed.lastExportAt ?? null,
			lastExportedDocUpdatedAt: parsed.lastExportedDocUpdatedAt ?? null,
			unexportedChanges: parsed.unexportedChanges ?? 0,
		};
	} catch {
		return { ...EMPTY };
	}
}

function write(status: BackupStatus): void {
	if (!browser) return;
	try {
		localStorage.setItem(KEY, JSON.stringify(status));
	} catch {
		// Storage full / disabled — the banner just falls back to "never backed up".
	}
}

/** Current checkpoint. */
export function backupStatus(): BackupStatus {
	return read();
}

/** Record that a mutation happened (called from the store on every change). */
export function noteChange(): void {
	const s = read();
	s.unexportedChanges += 1;
	write(s);
}

/** Mark the database as backed up to `doc.updatedAt` right now. Full export only. */
export function recordBackup(doc: DatabaseDocument): void {
	write({ lastExportAt: Date.now(), lastExportedDocUpdatedAt: doc.updatedAt, unexportedChanges: 0 });
}

/** Forget the checkpoint entirely (used by the "delete database" flow). */
export function clearBackup(): void {
	if (!browser) return;
	try {
		localStorage.removeItem(KEY);
	} catch {
		// ignore
	}
}

/** True when there's something worth exporting that hasn't been backed up.
 *
 * A freshly created, untouched database must NOT nag: it has never been exported
 * (so the time watermark is null) but there is nothing to lose yet. We key off the
 * tracked change counter (every real mutation bumps it; `createNew` does not), and
 * fall back to "is there actual content" only when the checkpoint is missing. */
export function needsBackup(doc: DatabaseDocument): boolean {
	const s = read();
	// Any edit since the last backup → definitely warn.
	if (s.unexportedChanges > 0) return true;
	// Exported before → warn only if the doc moved past that watermark.
	if (s.lastExportedDocUpdatedAt != null) return doc.updatedAt > s.lastExportedDocUpdatedAt;
	// Never backed up and no tracked changes (e.g. just created, or the localStorage
	// checkpoint was cleared): only nag once there's real content to lose.
	return doc.campaigns.length > 0;
}

/** Whether the reminder should be shown more insistently. */
export function isEscalated(): boolean {
	const s = read();
	if (s.unexportedChanges >= ESCALATE_CHANGES) return true;
	if (s.lastExportAt == null) return s.unexportedChanges > 0;
	const days = (Date.now() - s.lastExportAt) / 86_400_000;
	return days >= ESCALATE_DAYS;
}

/** A short, human "last backup" phrase for the banner. */
export function lastBackupLabel(): string {
	const s = read();
	if (s.lastExportAt == null) return 'never';
	const ms = Date.now() - s.lastExportAt;
	const mins = Math.floor(ms / 60_000);
	if (mins < 1) return 'just now';
	if (mins < 60) return `${mins} minute${mins === 1 ? '' : 's'} ago`;
	const hours = Math.floor(mins / 60);
	if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
	const days = Math.floor(hours / 24);
	return `${days} day${days === 1 ? '' : 's'} ago`;
}
