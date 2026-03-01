/**
 * database.svelte.ts — the reactive database store.
 *
 * Holds the in-memory `DatabaseDocument` (a Svelte 5 `$state` proxy) and exposes
 * mutation methods that delegate to the pure operations in `document.ts`, then
 * persist via the active `PersistenceAdapter`.
 *
 * Side-effect discipline (project rule "avoid rendering side effects"): the state
 * is SEEDED from the loaded document; persistence runs from these explicit
 * mutation handlers (a debounced `save`), never from a reactive `$effect`
 * watching the document. Components mutate only through these methods.
 */

import {
	addDeck as docAddDeck,
	addParticipant as docAddParticipant,
	addOneOffGuest as docAddOneOffGuest,
	addPlayer as docAddPlayer,
	assignDeckOwner as docAssignDeckOwner,
	assignDeckHand as docAssignDeckHand,
	changeCampaignCode as docChangeCampaignCode,
	createCampaign as docCreateCampaign,
	createEmptyDatabase,
	createPlayGroup as docCreatePlayGroup,
	findCampaign,
	parseDatabaseDocument,
	reassignParticipant as docReassignParticipant,
	removeCampaign as docRemoveCampaign,
	removeDeck as docRemoveDeck,
	removeParticipant as docRemoveParticipant,
	removePlayer as docRemovePlayer,
	removePlayGroup as docRemovePlayGroup,
	setCampaignLogs as docSetCampaignLogs,
	setManualAchievement as docSetManualAchievement,
	setProfileSettings as docSetProfileSettings,
	updateCampaignGeneral as docUpdateCampaignGeneral,
	updateParticipant as docUpdateParticipant,
	updatePlayer as docUpdatePlayer,
	updatePlayGroup as docUpdatePlayGroup,
	type CampaignParticipant,
	type CampaignRecord,
	type DeckRecord,
	type DatabaseDocument,
	type CampaignLogEntry,
	type DeckInvestigator,
	type DeckVersion,
	type Difficulty,
	type LocalPlayer,
	type LocalPlayGroup,
	type ManualAchievement
} from './document';
import { importCampaignShare } from './campaign-share';
import { loadSnapshotCampaign, recordCampaignSnapshot } from './snapshots';
import { downloadDatabase, downloadDatabaseJson, downloadCompiledProfile } from './export';
import { clearBackup, noteChange, recordBackup } from './backup-status';
import type { PersistenceAdapter } from './persistence';
import { DEFAULT_PROFILE_SETTINGS, resolveProfileSettings, type DifficultyTier } from '$lib/campaign/profile-settings';
import {
	assemblePayload,
	buildCardsSegmentFor,
	buildLogsSegmentFor,
	buildMetaSegmentFor,
	buildSubjectIdentity,
	buildSubjectPayload,
	segmentSignatures,
	type LocalProfilePayload
} from './profile-local';
import { ACCOUNT_SUBJECT, CACHE_VERSION, type SubjectCache } from './profile-cache';
import type { ProfileSubject } from '$lib/profile/profile-types';

export type DatabaseStatus = 'empty' | 'loading' | 'ready' | 'saving' | 'error';

/** Debounce window for autosave after a mutation (ms). */
const SAVE_DEBOUNCE_MS = 600;
/** Debounce window for the post-save profile-cache recompute (ms). */
const RECOMPUTE_DEBOUNCE_MS = 300;

export class DatabaseStore {
	#adapter: PersistenceAdapter | null = null;
	#saveTimer: ReturnType<typeof setTimeout> | null = null;
	#recomputeTimer: ReturnType<typeof setTimeout> | null = null;

	doc = $state<DatabaseDocument | null>(null);
	// Starts 'loading' (not 'empty'): until init() has read IndexedDB we don't yet
	// know whether a database exists, so UI can withhold the empty-vs-ready choice
	// instead of flashing the "start fresh" state before hydration settles.
	status = $state<DatabaseStatus>('loading');
	lastError = $state<string | null>(null);
	/** Whether a background profile-cache recompute is in progress (UI spinner). */
	profileStatus = $state<'idle' | 'updating'>('idle');

	/** Whether a database has been created/opened in this store. */
	get hasDatabase(): boolean {
		return this.doc !== null;
	}

	/**
	 * Attach an adapter and load any previously-stored document into state.
	 * Call once on app start (client only).
	 */
	async init(adapter: PersistenceAdapter): Promise<void> {
		this.#adapter = adapter;
		this.status = 'loading';
		try {
			const loaded = await adapter.load();
			// Validate the stored shape against the current format; throws on a corrupt or
			// off-version document (caught below → 'error' status).
			this.doc = loaded ? parseDatabaseDocument(loaded) : null; // seed $state; no $effect involved
			this.status = this.doc ? 'ready' : 'empty';
			// Warm the profile cache for the loaded database (no-op when already fresh).
			if (this.doc) this.#scheduleRecompute();
		} catch (e) {
			this.status = 'error';
			this.lastError = e instanceof Error ? e.message : String(e);
		}
	}

	/** Create a brand-new empty database (the "Create database" bootstrap). */
	async createNew(
		owner: { name: string; iconCardCode?: string },
		init?: { trackedTiers?: DifficultyTier[] },
	): Promise<void> {
		const doc = createEmptyDatabase(owner);
		// Seed the difficulty tiers the player said they care about during onboarding, so their stats
		// filter to those from the very first campaign (untracked-tier dabbling never pollutes totals;
		// see ProfileSettings.trackedTiers + the precompute records-filter).
		if (init?.trackedTiers) {
			docSetProfileSettings(
				doc,
				JSON.stringify({ ...DEFAULT_PROFILE_SETTINGS, trackedTiers: init.trackedTiers }),
			);
		}
		this.doc = doc;
		this.status = 'ready';
		await this.saveNow();
	}

	/** Adopt an imported/parsed document (the "Open database file" bootstrap). */
	async importDocument(value: unknown): Promise<void> {
		const parsed = parseDatabaseDocument(value); // throws DatabaseImportError on bad input
		this.doc = parsed;
		this.status = 'ready';
		// The file the user just opened IS their backup — start from a clean slate.
		recordBackup(parsed);
		await this.saveNow();
	}

	/**
	 * Import a single shared campaign into the current database as a new campaign.
	 * Returns the inserted record so the caller can open it for editing. Throws
	 * `CampaignShareError` on a malformed file.
	 */
	importSharedCampaign(value: unknown): CampaignRecord | undefined {
		if (!this.doc) return undefined;
		const rec = importCampaignShare(this.doc, value);
		noteChange();
		this.#scheduleSave();
		return rec;
	}

	// ─── Autosave snapshots (invisible per-campaign history; see snapshots.ts) ────

	/** Stash an invisible snapshot of one campaign into the global 20-slot history. */
	async snapshotCampaign(campaignId: string): Promise<void> {
		if (!this.doc) return;
		const c = findCampaign(this.doc, campaignId);
		if (c) await recordCampaignSnapshot(c);
	}

	/** Replace a campaign with one of its autosaved snapshots. Returns false when the
	 *  snapshot no longer exists. */
	async restoreCampaignSnapshot(snapshotId: string): Promise<boolean> {
		if (!this.doc) return false;
		const restored = await loadSnapshotCampaign(snapshotId);
		if (!restored) return false;
		const ts = Date.now();
		const next = { ...restored, updatedAt: ts };
		const idx = this.doc.campaigns.findIndex((c) => c.id === restored.id);
		if (idx >= 0) this.doc.campaigns[idx] = next;
		else this.doc.campaigns.push(next);
		this.doc.updatedAt = ts;
		noteChange();
		await this.saveNow();
		return true;
	}

	/** Save the whole database to a user-chosen file and record the backup checkpoint. */
	async exportDatabaseNow(): Promise<void> {
		if (!this.doc) return;
		await downloadDatabase(this.doc);
	}

	/** Advanced: save the raw database as plain (uncompressed) JSON for inspection /
	 *  reuse. NOT a backup checkpoint — the compressed export is the canonical backup. */
	async exportDatabaseJsonNow(): Promise<void> {
		if (!this.doc) return;
		await downloadDatabaseJson(this.doc);
	}

	/** The real, exportable subjects (owner + each player + each play group). The
	 *  whole-account aggregate is deliberately excluded — a compiled profile is shared
	 *  per person/group so it lands on one home and never leaks tablemates. */
	exportableSubjects(): ProfileSubject[] {
		const doc = this.doc;
		if (!doc) return [];
		return this.#subjectKeys(doc)
			.filter((k) => k !== ACCOUNT_SUBJECT)
			.map((k) => buildSubjectIdentity(doc, k));
	}

	/** Save ONE subject's "compiled profile" (the precomputed, render-ready payload):
	 *  `gzip` → compact `.ahlifepro`, `json` → plain JSON for inspection. The
	 *  account aggregate is never exported. */
	async exportCompiledProfileFor(subjectUid: string, format: 'gzip' | 'json'): Promise<void> {
		if (!this.doc || subjectUid === ACCOUNT_SUBJECT) return;
		const payload = this.getProfilePayload(subjectUid);
		if (!payload) return;
		await downloadCompiledProfile(payload.subject, payload, format);
	}

	/**
	 * Permanently delete the database from this browser (IndexedDB + backup
	 * checkpoint) and reset to the empty state. The exported file, if any, is the
	 * only remaining copy — callers must confirm first.
	 */
	async deleteDatabase(): Promise<void> {
		if (this.#saveTimer) {
			clearTimeout(this.#saveTimer);
			this.#saveTimer = null;
		}
		if (this.#recomputeTimer) {
			clearTimeout(this.#recomputeTimer);
			this.#recomputeTimer = null;
		}
		try {
			await this.#adapter?.clear?.();
		} catch (e) {
			this.lastError = e instanceof Error ? e.message : String(e);
		}
		this.doc = null;
		this.status = 'empty';
		clearBackup();
	}

	// ─── Mutations (delegate to pure ops, then persist) ──────────────────────────

	addPlayer(fields: { name: string; iconCardCode?: string }): LocalPlayer | undefined {
		return this.#mutate((d) => docAddPlayer(d, fields));
	}
	updatePlayer(uid: string, fields: Partial<Pick<LocalPlayer, 'name' | 'iconCardCode'>>): void {
		this.#mutate((d) => docUpdatePlayer(d, uid, fields));
	}
	removePlayer(uid: string): void {
		this.#mutate((d) => docRemovePlayer(d, uid));
	}

	// ─── Play group ops ──────────────────────────────────────────────────────────

	createPlayGroup(fields: { name: string; memberUids?: string[] }): LocalPlayGroup | undefined {
		return this.#mutate((d) => docCreatePlayGroup(d, fields));
	}
	updatePlayGroup(uid: string, fields: Partial<Pick<LocalPlayGroup, 'name' | 'memberUids'>>): void {
		this.#mutate((d) => docUpdatePlayGroup(d, uid, fields));
	}
	removePlayGroup(uid: string): void {
		this.#mutate((d) => docRemovePlayGroup(d, uid));
	}

	createCampaign(input: {
		campaignCode: string;
		title: string;
		difficulty?: Difficulty;
	}): CampaignRecord | undefined {
		return this.#mutate((d) => docCreateCampaign(d, input));
	}
	removeCampaign(id: string): void {
		this.#mutate((d) => docRemoveCampaign(d, id));
	}
	updateCampaignGeneral(
		id: string,
		fields: Partial<
			Pick<
				CampaignRecord,
				| 'title'
				| 'difficulty'
				| 'playerCount'
				| 'multiHanded'
				| 'draft'
				| 'displayInProfile'
				| 'startDate'
				| 'finishDate'
			>
		>
	): void {
		this.#mutate((d) => docUpdateCampaignGeneral(d, id, fields));
	}
	changeCampaignCode(id: string, campaignCode: string): void {
		this.#mutate((d) => docChangeCampaignCode(d, id, campaignCode));
	}
	setCampaignLogs(id: string, entries: CampaignLogEntry[]): void {
		this.#mutate((d) => docSetCampaignLogs(d, id, entries));
	}
	setManualAchievement(id: string, tick: ManualAchievement, earned: boolean): void {
		this.#mutate((d) => docSetManualAchievement(d, id, tick, earned));
	}
	/** Persist the profile composer layout (ProfileSettings JSON, or null). */
	setProfileSettings(json: string | null): void {
		this.#mutate((d) => docSetProfileSettings(d, json));
	}

	// ─── Participant ops ─────────────────────────────────────────────────────────

	addParticipant(
		campaignId: string,
		fields: { uid: string; name: string; iconCardCode?: string }
	): CampaignParticipant | undefined {
		return this.#mutate((d) => docAddParticipant(d, campaignId, fields));
	}
	/** Add a one-off guest with no uid of their own — a fresh uid is minted internally. */
	addOneOffGuest(
		campaignId: string,
		fields: { name: string; iconCardCode?: string }
	): CampaignParticipant | undefined {
		return this.#mutate((d) => docAddOneOffGuest(d, campaignId, fields));
	}
	updateParticipant(
		campaignId: string,
		uid: string,
		fields: Partial<Pick<CampaignParticipant, 'name' | 'iconCardCode'>>
	): void {
		this.#mutate((d) => docUpdateParticipant(d, campaignId, uid, fields));
	}
	removeParticipant(campaignId: string, uid: string): void {
		this.#mutate((d) => docRemoveParticipant(d, campaignId, uid));
	}
	reassignParticipant(
		campaignId: string,
		fromUid: string,
		toUid: string,
		snap?: { name: string; iconCardCode: string }
	): void {
		this.#mutate((d) => docReassignParticipant(d, campaignId, fromUid, toUid, snap));
	}

	// ─── Deck ops ────────────────────────────────────────────────────────────────

	addDeck(
		campaignId: string,
		deck: {
			ownerUid?: string | null;
			investigator: DeckInvestigator | string;
			versions: DeckVersion[];
		}
	): DeckRecord | undefined {
		return this.#mutate((d) => docAddDeck(d, campaignId, deck));
	}
	removeDeck(campaignId: string, deckId: string): void {
		this.#mutate((d) => docRemoveDeck(d, campaignId, deckId));
	}
	assignDeckOwner(campaignId: string, deckId: string, ownerUid: string | null): void {
		this.#mutate((d) => docAssignDeckOwner(d, campaignId, deckId, ownerUid));
	}
	assignDeckHand(campaignId: string, deckId: string, hand: number | null): void {
		this.#mutate((d) => docAssignDeckHand(d, campaignId, deckId, hand));
	}

	// ─── Persistence ─────────────────────────────────────────────────────────────

	/** Apply a pure operation to the live document, then schedule a debounced save. */
	#mutate<T>(op: (doc: DatabaseDocument) => T): T | undefined {
		if (!this.doc) return undefined;
		const result = op(this.doc);
		noteChange();
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

	/** Flush any pending changes to the adapter immediately. */
	async saveNow(): Promise<void> {
		if (this.#saveTimer) {
			clearTimeout(this.#saveTimer);
			this.#saveTimer = null;
		}
		if (!this.#adapter || !this.doc) return;
		this.status = 'saving';
		try {
			await this.#adapter.save(this.doc);
			this.status = 'ready';
			// Refresh the derived profile cache in the background (does not re-save
			// through this path, so there is no save→recompute→save loop).
			this.#scheduleRecompute();
		} catch (e) {
			this.status = 'error';
			this.lastError = e instanceof Error ? e.message : String(e);
		}
	}

	// ─── Profile precompute cache ────────────────────────────────────────────────

	/** Every subject key that should currently have a cache entry. */
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
	 * Rebuild only the changed segments of each subject's cache (by signature) and
	 * prune subjects that no longer exist. Runs after a save and updates the
	 * IN-MEMORY cache only — it is never persisted (see IndexedDbAdapter.save), so
	 * there is no second write per edit; the cache is rebuilt cheaply on next load.
	 */
	async #recompute(): Promise<void> {
		const doc = this.doc;
		if (!doc) return;
		this.profileStatus = 'updating';
		try {
			const fullRebuild = !doc.profileCache || doc.profileCache.version !== CACHE_VERSION;
			const prev = fullRebuild ? {} : doc.profileCache!.subjects;
			const next: Record<string, SubjectCache> = {};
			let changed = fullRebuild;

			const keys = this.#subjectKeys(doc);
			for (const key of keys) {
				// Yield so the 'updating' indicator can paint between subjects.
				await Promise.resolve();
				if (this.doc !== doc) return; // doc replaced mid-run (import/delete) → abort
				const sigs = segmentSignatures(doc, key);
				const old = prev[key];
				const meta =
					old && old.meta.sig === sigs.meta
						? old.meta
						: { sig: sigs.meta, data: buildMetaSegmentFor(doc, key) };
				const logs =
					old && old.logs.sig === sigs.logs
						? old.logs
						: { sig: sigs.logs, data: buildLogsSegmentFor(doc, key) };
				const cards =
					old && old.cards.sig === sigs.cards
						? old.cards
						: { sig: sigs.cards, data: buildCardsSegmentFor(doc, key) };
				if (meta !== old?.meta || logs !== old?.logs || cards !== old?.cards) changed = true;
				next[key] = { meta, logs, cards };
			}

			// Detect a pruned subject (deleted player/group) even if nothing rebuilt.
			const prevKeys = Object.keys(prev);
			if (prevKeys.length !== keys.length || prevKeys.some((k) => !next[k])) changed = true;

			if (changed) {
				// In-memory only: the adapter strips the cache on save, and the doc was
				// already persisted by saveNow, so we don't write again here.
				doc.profileCache = { version: CACHE_VERSION, subjects: next };
			}
		} finally {
			this.profileStatus = 'idle';
		}
	}

	/**
	 * The assembled profile payload for a subject (`'__account__'`, a roster uid, or
	 * a play-group uid). Returns the cached assembly when the cache is current, else
	 * builds it fresh (the next background recompute will cache it). PURE — never
	 * writes, so it is safe to call from a `$derived`.
	 */
	getProfilePayload(key: string = ACCOUNT_SUBJECT): LocalProfilePayload | null {
		const doc = this.doc;
		if (!doc) return null;
		const settings = resolveProfileSettings(doc.profileSettings);
		const cache = doc.profileCache;
		const sub = cache && cache.version === CACHE_VERSION ? cache.subjects[key] : undefined;
		if (sub) {
			const sigs = segmentSignatures(doc, key);
			if (
				sub.meta.sig === sigs.meta &&
				sub.logs.sig === sigs.logs &&
				sub.cards.sig === sigs.cards
			) {
				return assemblePayload(
					{ meta: sub.meta.data, logs: sub.logs.data, cards: sub.cards.data },
					settings,
					buildSubjectIdentity(doc, key)
				);
			}
		}
		return buildSubjectPayload(doc, key);
	}
}

/** App-wide singleton. Call `databaseStore.init(adapter)` once on the client. */
export const databaseStore = new DatabaseStore();
