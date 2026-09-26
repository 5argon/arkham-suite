/**
 * The reactive database store: the in-memory `DatabaseDocument` plus mutation methods that apply
 * the pure operations in `document.ts` and schedule a debounced write through the adapter.
 */
import {
	DEFAULT_PROFILE_SETTINGS,
	resolveProfileSettings,
	type DifficultyTier
} from '$lib/campaign/profile/profile-settings';
import type { ProfilePayload, ProfileSubject } from '$lib/profile/profile-types';

import { importCampaignShare } from './campaign-share';
import { makeCompiledProfileFile, type CompiledProfileFile } from './compiled-profile';
import * as ops from './document';
import type {
	CampaignGeneralFields,
	CampaignLogEntry,
	CampaignParticipant,
	CampaignRecord,
	DatabaseDocument,
	DeckInvestigator,
	DeckRecord,
	DeckVersion,
	Difficulty,
	LocalPlayer,
	LocalPlayGroup,
	ManualAchievement,
	StandaloneRecord
} from './document';
import { saveCompiledProfile, saveDatabase, saveUnreadableDatabase } from './export';
import { hydrateCompiledProfile } from './hydrate-compiled-profile';
import type { PersistenceAdapter } from './persistence';
import { ACCOUNT_SUBJECT, CACHE_VERSION, type SubjectCache } from './profile-cache';
import {
	assemblePayload,
	buildCardsSegmentFor,
	buildLogsSegmentFor,
	buildMetaSegmentFor,
	buildSubjectIdentity,
	buildSubjectPayload,
	segmentSignatures
} from './profile-local';
import { saveStatus } from './save-status.svelte';
import { loadSnapshotCampaign, recordCampaignSnapshot } from './snapshots';

/** `error`: the stored document could not be loaded (`doc` is null). */
export type DatabaseStatus = 'empty' | 'loading' | 'ready' | 'saving' | 'error';

const SAVE_DEBOUNCE_MS = 600;
const RECOMPUTE_DEBOUNCE_MS = 300;

function message(e: unknown): string {
	return e instanceof Error ? e.message : String(e);
}

export class DatabaseStore {
	#adapter: PersistenceAdapter | null = null;
	#saveTimer: ReturnType<typeof setTimeout> | null = null;
	#recomputeTimer: ReturnType<typeof setTimeout> | null = null;
	/** Edits not yet written through the adapter. */
	#dirty = false;
	/** The stored value that failed to load, kept so it can be saved out before starting over. */
	#unreadable: unknown = null;
	/** Hydrated loaded profiles by uid; null memoizes a file that failed to hydrate. */
	#hydratedLoaded = new Map<string, ProfilePayload | null>();

	doc = $state<DatabaseDocument | null>(null);
	/** Unknown until `init` has read storage, so the UI never flashes the empty state. */
	status = $state<DatabaseStatus>('loading');
	/** The latest load or write failure; cleared by the next successful write. */
	lastError = $state<string | null>(null);
	profileStatus = $state<'idle' | 'updating'>('idle');

	get hasDatabase(): boolean {
		return this.doc !== null;
	}

	/** Whether the failed load left something to save out. */
	get hasUnreadableCopy(): boolean {
		return this.#unreadable != null;
	}

	/** Attach the adapter and load the stored document. Call once, on the client. */
	async init(adapter: PersistenceAdapter): Promise<void> {
		this.#adapter = adapter;
		this.status = 'loading';
		let stored: unknown = null;
		try {
			stored = await adapter.load();
			this.doc = stored == null ? null : ops.parseDatabaseDocument(stored);
			this.status = this.doc ? 'ready' : 'empty';
			if (this.doc) this.#scheduleRecompute();
		} catch (e) {
			this.#unreadable = stored;
			this.lastError = message(e);
			this.status = 'error';
		}
	}

	/** Refuses while a stored document that failed to load has not been dealt with. */
	#assertReplaceable(): void {
		if (this.status === 'error') {
			throw new Error('The stored database could not be opened; save it before replacing it.');
		}
	}

	async createNew(
		owner: { name: string; iconCardCode?: string },
		init?: { trackedTiers?: DifficultyTier[] }
	): Promise<void> {
		this.#assertReplaceable();
		const doc = ops.createEmptyDatabase(owner);
		if (init?.trackedTiers) {
			ops.setProfileSettings(
				doc,
				JSON.stringify({ ...DEFAULT_PROFILE_SETTINGS, trackedTiers: init.trackedTiers })
			);
		}
		this.#replace(doc);
		saveStatus.clear();
		await this.saveNow();
	}

	/** Adopt an opened `.ahlifedb`. The opened file is the latest save. */
	async importDocument(value: unknown): Promise<void> {
		this.#assertReplaceable();
		const parsed = ops.parseDatabaseDocument(value);
		this.#replace(parsed);
		saveStatus.recordSave(parsed);
		await this.saveNow();
	}

	#replace(doc: DatabaseDocument | null): void {
		this.#dirty = false;
		this.#hydratedLoaded.clear();
		this.doc = doc;
		this.status = doc ? 'ready' : 'empty';
	}

	/** Save the stored value that failed to load, verbatim. */
	async saveUnreadableCopy(): Promise<boolean> {
		return this.#unreadable != null && saveUnreadableDatabase(this.#unreadable);
	}

	/** Drop the unreadable stored document so a new one can be created or loaded. */
	async discardUnreadable(): Promise<void> {
		await this.deleteDatabase();
		this.#unreadable = null;
		this.lastError = null;
	}

	/** Append a shared record as a new copy. Throws `CampaignShareError` on a malformed file. */
	importSharedCampaign(value: unknown): CampaignRecord | undefined {
		return this.#mutate((d) => importCampaignShare(d, value));
	}

	// ─── Campaign snapshots ──────────────────────────────────────────────────

	async snapshotCampaign(campaignId: string): Promise<void> {
		const c = this.doc && ops.findRecord(this.doc, campaignId);
		if (c) await recordCampaignSnapshot(c);
	}

	/** Replace a record with one of its snapshots; false when the snapshot is gone. */
	async restoreCampaignSnapshot(snapshotId: string): Promise<boolean> {
		if (!this.doc) return false;
		const restored = await loadSnapshotCampaign(snapshotId);
		if (!restored) return false;
		this.#mutate((d) => ops.insertRecord(d, restored));
		await this.saveNow();
		return true;
	}

	// ─── Files ───────────────────────────────────────────────────────────────

	async exportDatabaseNow(): Promise<void> {
		if (this.doc) await saveDatabase(this.doc, 'gzip');
	}

	/** Plain JSON for inspection; not a save. */
	async exportDatabaseJsonNow(): Promise<void> {
		if (this.doc) await saveDatabase(this.doc, 'json');
	}

	/** One person's or group's compiled profile. The account aggregate is never exported. */
	async exportCompiledProfileFor(subjectUid: string, format: 'gzip' | 'json'): Promise<void> {
		if (subjectUid === ACCOUNT_SUBJECT) return;
		const payload = this.getProfilePayload(subjectUid);
		if (!payload) return;
		const file = makeCompiledProfileFile(payload.subject, payload, new Date().toISOString());
		await saveCompiledProfile(file, format);
	}

	// ─── Loaded compiled profiles ────────────────────────────────────────────

	loadedSubjects(): { subject: ProfileSubject; exportedAt: string }[] {
		return (this.doc?.loadedProfiles ?? []).map((f) => ({
			subject: f.subject,
			exportedAt: f.exportedAt
		}));
	}

	/** Keep an opened `.ahlifepro`, replacing any earlier file for the same subject. */
	loadCompiledProfile(file: CompiledProfileFile): void {
		this.#hydratedLoaded.delete(file.subject.uid);
		this.#mutate((d) => ops.addLoadedProfile(d, file));
	}

	removeLoadedProfile(uid: string): void {
		this.#hydratedLoaded.delete(uid);
		this.#mutate((d) => ops.removeLoadedProfile(d, uid));
	}

	/**
	 * A loaded profile's payload, hydrated from the stored file. Null when `uid` is not loaded or
	 * the file fails to hydrate. Never writes reactive state, so it is safe from a `$derived`.
	 */
	getLoadedProfilePayload(uid: string): ProfilePayload | null {
		const file = this.doc && ops.findLoadedProfile(this.doc, uid);
		if (!file) return null;
		if (!this.#hydratedLoaded.has(uid)) {
			let payload: ProfilePayload | null = null;
			try {
				payload = hydrateCompiledProfile(file);
			} catch (e) {
				console.error(`Loaded profile ${uid} could not be hydrated`, e);
			}
			this.#hydratedLoaded.set(uid, payload);
		}
		return this.#hydratedLoaded.get(uid) ?? null;
	}

	/** Save a kept `.ahlifepro` verbatim. */
	async exportLoadedProfile(uid: string, format: 'gzip' | 'json'): Promise<void> {
		const file = this.doc && ops.findLoadedProfile(this.doc, uid);
		if (file) await saveCompiledProfile(file, format);
	}

	/** Erase the database from this browser. Callers confirm first. */
	async deleteDatabase(): Promise<void> {
		this.#clearTimers();
		try {
			await this.#adapter?.clear();
		} catch (e) {
			this.lastError = message(e);
		}
		this.#replace(null);
		saveStatus.clear();
	}

	// ─── Mutations ───────────────────────────────────────────────────────────

	addPlayer(fields: { name: string; iconCardCode?: string }): LocalPlayer | undefined {
		return this.#mutate((d) => ops.addPlayer(d, fields));
	}
	updatePlayer(uid: string, fields: Partial<Pick<LocalPlayer, 'name' | 'iconCardCode'>>): void {
		this.#mutate((d) => ops.updatePlayer(d, uid, fields));
	}
	removePlayer(uid: string): void {
		this.#mutate((d) => ops.removePlayer(d, uid));
	}

	createPlayGroup(fields: { name: string; memberUids?: string[] }): LocalPlayGroup | undefined {
		return this.#mutate((d) => ops.createPlayGroup(d, fields));
	}
	updatePlayGroup(uid: string, fields: Partial<Pick<LocalPlayGroup, 'name' | 'memberUids'>>): void {
		this.#mutate((d) => ops.updatePlayGroup(d, uid, fields));
	}
	removePlayGroup(uid: string): void {
		this.#mutate((d) => ops.removePlayGroup(d, uid));
	}

	createCampaign(input: {
		campaignCode: string;
		title: string;
		difficulty?: Difficulty;
	}): CampaignRecord | undefined {
		return this.#mutate((d) => ops.createCampaign(d, input));
	}
	removeCampaign(id: string): void {
		this.#mutate((d) => ops.removeCampaign(d, id));
	}
	createStandalone(input: {
		source: 'pack' | 'campaign';
		campaignCode: string;
		scenario: string;
		title: string;
		difficulty?: Difficulty;
	}): StandaloneRecord | undefined {
		return this.#mutate((d) => ops.createStandalone(d, input));
	}
	removeStandalone(id: string): void {
		this.#mutate((d) => ops.removeStandalone(d, id));
	}
	updateCampaignGeneral(id: string, fields: CampaignGeneralFields): void {
		this.#mutate((d) => ops.updateCampaignGeneral(d, id, fields));
	}
	changeCampaignCode(id: string, campaignCode: string): void {
		this.#mutate((d) => ops.changeCampaignCode(d, id, campaignCode));
	}
	setCampaignLogs(id: string, entries: CampaignLogEntry[]): void {
		this.#mutate((d) => ops.setCampaignLogs(d, id, entries));
	}
	setCampaignLinkedLogs(id: string, entries: CampaignLogEntry[]): void {
		this.#mutate((d) => ops.setCampaignLinkedLogs(d, id, entries));
	}
	setManualAchievement(id: string, tick: ManualAchievement, earned: boolean): void {
		this.#mutate((d) => ops.setManualAchievement(d, id, tick, earned));
	}
	/** `ProfileSettings` JSON, or null for defaults. */
	setProfileSettings(json: string | null): void {
		this.#mutate((d) => ops.setProfileSettings(d, json));
	}

	addParticipant(
		campaignId: string,
		fields: { uid: string; name: string; iconCardCode?: string }
	): CampaignParticipant | undefined {
		return this.#mutate((d) => ops.addParticipant(d, campaignId, fields));
	}
	addOneOffGuest(
		campaignId: string,
		fields: { name: string; iconCardCode?: string }
	): CampaignParticipant | undefined {
		return this.#mutate((d) => ops.addOneOffGuest(d, campaignId, fields));
	}
	updateParticipant(
		campaignId: string,
		uid: string,
		fields: Partial<Pick<CampaignParticipant, 'name' | 'iconCardCode'>>
	): void {
		this.#mutate((d) => ops.updateParticipant(d, campaignId, uid, fields));
	}
	removeParticipant(campaignId: string, uid: string): void {
		this.#mutate((d) => ops.removeParticipant(d, campaignId, uid));
	}

	addDeck(
		campaignId: string,
		deck: {
			ownerUid?: string | null;
			investigator: DeckInvestigator | string;
			versions: DeckVersion[];
		}
	): DeckRecord | undefined {
		return this.#mutate((d) => ops.addDeck(d, campaignId, deck));
	}
	removeDeck(campaignId: string, deckId: string): void {
		this.#mutate((d) => ops.removeDeck(d, campaignId, deckId));
	}
	assignDeckOwner(campaignId: string, deckId: string, ownerUid: string | null): void {
		this.#mutate((d) => ops.assignDeckOwner(d, campaignId, deckId, ownerUid));
	}
	assignDeckHand(campaignId: string, deckId: string, hand: number | null): void {
		this.#mutate((d) => ops.assignDeckHand(d, campaignId, deckId, hand));
	}

	// ─── Persistence ─────────────────────────────────────────────────────────

	#mutate<T>(op: (doc: DatabaseDocument) => T): T | undefined {
		if (!this.doc) return undefined;
		const result = op(this.doc);
		this.#dirty = true;
		this.#scheduleSave();
		return result;
	}

	#scheduleSave(): void {
		if (this.#saveTimer) clearTimeout(this.#saveTimer);
		this.#saveTimer = setTimeout(() => {
			this.#saveTimer = null;
			void this.saveNow();
		}, SAVE_DEBOUNCE_MS);
	}

	#clearTimers(): void {
		if (this.#saveTimer) clearTimeout(this.#saveTimer);
		if (this.#recomputeTimer) clearTimeout(this.#recomputeTimer);
		this.#saveTimer = this.#recomputeTimer = null;
	}

	/** Write pending changes now. */
	async saveNow(): Promise<void> {
		if (this.#saveTimer) clearTimeout(this.#saveTimer);
		this.#saveTimer = null;
		if (!this.#adapter || !this.doc) return;
		const counted = this.#dirty;
		this.#dirty = false;
		this.status = 'saving';
		try {
			await this.#adapter.save(this.doc);
			this.lastError = null;
			if (counted) saveStatus.noteFlush();
			this.#scheduleRecompute();
		} catch (e) {
			this.#dirty ||= counted;
			this.lastError = message(e);
		} finally {
			if (this.doc) this.status = 'ready';
		}
	}

	// ─── Profile precompute cache ────────────────────────────────────────────

	#subjectKeys(doc: DatabaseDocument): string[] {
		return [
			ACCOUNT_SUBJECT,
			doc.owner.uid,
			...doc.players.map((p) => p.uid),
			...doc.playGroups.map((g) => g.uid)
		];
	}

	#scheduleRecompute(): void {
		if (this.#recomputeTimer) clearTimeout(this.#recomputeTimer);
		this.#recomputeTimer = setTimeout(() => {
			this.#recomputeTimer = null;
			void this.#recompute();
		}, RECOMPUTE_DEBOUNCE_MS);
	}

	/**
	 * Rebuild the segments whose signature changed and drop removed subjects. The cache lives in
	 * memory only (the adapter strips it), so this never triggers another write.
	 */
	async #recompute(): Promise<void> {
		const doc = this.doc;
		if (!doc) return;
		this.profileStatus = 'updating';
		try {
			const fullRebuild = doc.profileCache?.version !== CACHE_VERSION;
			const prev = fullRebuild ? {} : doc.profileCache!.subjects;
			const next: Record<string, SubjectCache> = {};
			let changed = fullRebuild;
			const keys = this.#subjectKeys(doc);
			for (const key of keys) {
				// Yield so the 'updating' indicator can paint between subjects.
				await Promise.resolve();
				if (this.doc !== doc) return;
				const sigs = segmentSignatures(doc, key);
				const old = prev[key];
				const meta =
					old?.meta.sig === sigs.meta
						? old.meta
						: { sig: sigs.meta, data: buildMetaSegmentFor(doc, key) };
				const logs =
					old?.logs.sig === sigs.logs
						? old.logs
						: { sig: sigs.logs, data: buildLogsSegmentFor(doc, key) };
				const cards =
					old?.cards.sig === sigs.cards
						? old.cards
						: { sig: sigs.cards, data: buildCardsSegmentFor(doc, key) };
				if (meta !== old?.meta || logs !== old?.logs || cards !== old?.cards) changed = true;
				next[key] = { meta, logs, cards };
			}
			const prevKeys = Object.keys(prev);
			if (prevKeys.length !== keys.length || prevKeys.some((k) => !next[k])) changed = true;
			if (changed) doc.profileCache = { version: CACHE_VERSION, subjects: next };
		} finally {
			this.profileStatus = 'idle';
		}
	}

	/**
	 * The payload for `'__account__'`, a roster uid or a play-group uid: the cached segments when
	 * current, else built fresh. Never writes, so it is safe from a `$derived`.
	 */
	getProfilePayload(key: string = ACCOUNT_SUBJECT): ProfilePayload | null {
		const doc = this.doc;
		if (!doc) return null;
		const sub =
			doc.profileCache?.version === CACHE_VERSION ? doc.profileCache.subjects[key] : undefined;
		if (sub) {
			const sigs = segmentSignatures(doc, key);
			if (
				sub.meta.sig === sigs.meta &&
				sub.logs.sig === sigs.logs &&
				sub.cards.sig === sigs.cards
			) {
				return assemblePayload(
					{ meta: sub.meta.data, logs: sub.logs.data, cards: sub.cards.data },
					resolveProfileSettings(doc.profileSettings),
					buildSubjectIdentity(doc, key)
				);
			}
		}
		return buildSubjectPayload(doc, key);
	}
}

/** App-wide singleton; `bootstrap.ts` initializes it on the client. */
export const databaseStore = new DatabaseStore();
