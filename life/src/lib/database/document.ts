/**
 * document.ts — the local "database" document: the single source of truth for
 * arkham.life.
 *
 * This is the on-disk JSON the user safekeeps themselves (and the shape mirrored
 * into IndexedDB as the live working copy). It deliberately does NOT import
 * `campaign-export-format.ts` — that format is maintained separately; mapping
 * between the two is a separate, coordinated step.
 *
 * Identity model (see uid.ts + campaign-share.ts):
 *   - Roster members (owner + sub-players) are keyed by a stable `uid`
 *     (`XXX-XXX-XXX`). They are MANAGED: editable, live, profile-eligible.
 *   - Each campaign stores its participants as BAKED snapshots
 *     (`CampaignParticipant { uid, name, iconCardCode }`).
 *   - A participant is a "guest" (frozen, no profile) iff its uid is NOT in the
 *     current file's roster. Guests are derived, never stored as a flag — the same
 *     campaign yields a different guest set in a different person's file.
 *   - Universal resolution: `resolveParticipant` = roster member by uid, else the
 *     frozen snapshot. So renaming a roster member propagates to every past
 *     campaign, while guests stay frozen.
 *
 * `logs` entries are exactly the `saveLogs` payload shape (key/section/args)
 * consumed by `recorded-state.ts`, so the recording codec works unchanged.
 *
 * Everything here is pure + framework-free so it is unit-testable and reusable by
 * both the runes store (`database.svelte.ts`) and import/export helpers. Operations
 * mutate the passed document in place (idiomatic for Svelte 5 `$state` proxies)
 * and bump `updatedAt` timestamps; pass a plain object in tests.
 */
import { generateUniqueUid, normalizeUid } from './uid';
import type { ProfileCache } from './profile-cache';

/** Bumped only on a breaking change to this document's shape. */
export const DATABASE_FORMAT_VERSION = 3;

export type Difficulty = 'easy' | 'standard' | 'hard' | 'expert';

/**
 * How many players a campaign is *considered* to have been played by — for the
 * profile/widget head-count. Players and decks added imply this but don't fix it
 * (people drop in and out, or play a lower count than bodies present):
 *   - `'auto'` (default) — the participant count, clamped to 4.
 *   - `1..4`             — an explicit override.
 *   - `'unspecified'`    — deliberately no count.
 * See {@link resolvePlayerCount}. Optional on the record (absent ⇒ `'auto'`), so
 * older documents need no migration.
 */
export type PlayerCount = 'auto' | 'unspecified' | 1 | 2 | 3 | 4;

/**
 * Resolve a campaign's {@link PlayerCount} setting to a concrete head count, or
 * `null` when there is none to show (unspecified, or auto with no participants).
 * `'auto'` = participants added, clamped to 4. Must be applied wherever the count
 * is *displayed* — for the profile this happens at compile time, since the cache
 * can't see inside the campaign later.
 */
export function resolvePlayerCount(
	setting: PlayerCount | undefined,
	participantCount: number
): number | null {
	if (setting === 'unspecified') return null;
	if (typeof setting === 'number') return setting;
	// 'auto' (or absent): bodies present, capped at the game's 4-player max.
	const n = Math.min(participantCount, 4);
	return n > 0 ? n : null;
}

/** A 1-player play's solo flavor. */
export type SoloType = 'true-solo' | 'multi-handed';

/**
 * Classify a campaign's solo type, or `null` when it is not a solo (1-player) play.
 * Resolves the player count first ({@link resolvePlayerCount}); a resolved count of 1 is
 * `'multi-handed'` when {@link CampaignRecord.multiHanded} is set, else `'true-solo'`.
 */
export function resolveSoloType(
	setting: PlayerCount | undefined,
	participantCount: number,
	multiHanded: boolean | undefined
): SoloType | null {
	if (resolvePlayerCount(setting, participantCount) !== 1) return null;
	return multiHanded ? 'multi-handed' : 'true-solo';
}

/** How many distinct "hands" a campaign's decks span — the X in "Solo X-Handed". Counts
 *  distinct assigned {@link DeckRecord.hand} numbers (decks without one are ignored). */
export function distinctHands(decks: DeckRecord[]): number {
	const hands = new Set<number>();
	for (const d of decks) if (d.hand != null) hands.add(d.hand);
	return hands.size;
}

// ─── Entities ────────────────────────────────────────────────────────────────

/**
 * A locally-managed roster member: the owner, or any sub-player. Keyed by a
 * stable `uid` so the person can be matched across shared campaign files.
 */
export interface LocalPlayer {
	/** Stable identifier in `XXX-XXX-XXX` format. The cross-file join key. */
	uid: string;
	name: string;
	/** Card code used as the player's portrait, e.g. "01001". */
	iconCardCode: string;
}

/**
 * A named group of roster members (e.g. "Tuesday Night Crew"). Owns its own
 * stable `uid` so it gets its own combined profile, and references members by
 * their roster uid (never bakes them — a group is always resolved live). A group
 * is purely a local convenience: it is NOT recorded onto any campaign (recording
 * with a group just bulk-adds its members as participants).
 */
export interface LocalPlayGroup {
	/** Stable `XXX-XXX-XXX` identifier — the group's profile key. */
	uid: string;
	name: string;
	/** Roster member uids (owner and/or sub-players) in this group. */
	memberUids: string[];
}

/**
 * A participant in one campaign — a BAKED snapshot of who played. If `uid`
 * matches a roster member it resolves live (managed); otherwise it is a frozen
 * "guest". The snapshot carries name/icon so a guest survives without a roster
 * entry (and so a shared file shows guests even on a stranger's machine).
 */
export interface CampaignParticipant {
	uid: string;
	name: string;
	iconCardCode: string;
}

/**
 * Investigator + meta selections for a deck chain (mirrors
 * `campaignDeckInvestigators` / the export's investigator block).
 */
export interface DeckInvestigator {
	investigatorCode: string;
	alternateFrontCode: string | null;
	alternateBackCode: string | null;
	factionSelected: string | null;
	faction1: string | null;
	faction2: string | null;
	optionSelected: string | null;
	deckSizeSelected: number | null;
}

/** One version in a deck's upgrade history. */
export interface DeckVersion {
	/** 0-based position in the upgrade history. */
	sequenceIndex: number;
	/** Raw AhdbDeck JSON (without previous_deck / next_deck). */
	ahdbJson: string;
}

/** A deck chain played in a campaign (a series of upgrade versions). */
export interface DeckRecord {
	id: string;
	/** uid of the participant this deck belongs to, or null if unassigned. */
	ownerUid: string | null;
	investigator: DeckInvestigator;
	/** Ordered by sequenceIndex ascending. */
	versions: DeckVersion[];
	/** Which "hand" (1–4) this deck is, for a multi-handed solo play. Only meaningful
	 *  when the campaign is a 1-player {@link CampaignRecord.multiHanded} play; the count
	 *  of distinct hands across decks gives the "Solo X-Handed" X (see {@link distinctHands}).
	 *  Absent for true solo / multiplayer. */
	hand?: number;
}

/** One recorded campaign-log entry — the `saveLogs` payload shape verbatim. */
export interface CampaignLogEntry {
	/** campaign-data composite "section.id" (or section id alone). */
	key: string;
	/** owning section id (real campaign-data section or a reserved `__*`). */
	section: string;
	args: { type: 'string' | 'number'; value: string }[];
}

/** A manually-ticked achievement (inferred ones are recomputed, never stored). */
export interface ManualAchievement {
	family: string;
	achievementId: string;
	itemId: string | null;
}

/** One recorded campaign. Mirrors the `archive/edit` load shape. */
/** Whether an archive's existence is shown on the profile/compiled export.
 *  `'default'` follows the account-wide `defaultArchiveDisplayInProfile` setting.
 *  Gates only the campaign's EXISTENCE (calendar + campaigns-played); its stats
 *  always aggregate. Missing (older records) is treated as `'default'`. */
export type DisplayInProfile = 'default' | 'visible' | 'hidden';

export interface CampaignRecord {
	id: string;
	title: string;
	/** kohaku campaign enum, e.g. "the_night_of_the_zealot". */
	campaignCode: string;
	difficulty: Difficulty;
	/** Considered player count for profile/widgets; absent ⇒ `'auto'`. See {@link PlayerCount}. */
	playerCount?: PlayerCount;
	/** A 1-player play where one human piloted several decks ("hands"). Distinguishes
	 *  "Solo X-Handed" from "True Solo" — the two are otherwise indistinguishable (a lone
	 *  player can hold 2+ decks by swapping investigators mid-campaign). Absent/`false` ⇒
	 *  True Solo. Only meaningful when the resolved player count is 1. See {@link resolveSoloType}. */
	multiHanded?: boolean;
	draft: boolean;
	/** Show this archive's existence on the profile (see {@link DisplayInProfile}). */
	displayInProfile?: DisplayInProfile;
	/** ms-since-epoch, or null. */
	startDate: number | null;
	/** ms-since-epoch, or null. */
	finishDate: number | null;
	createdAt: number;
	updatedAt: number;
	/** Baked snapshots of who played (includes the owner). */
	participants: CampaignParticipant[];
	decks: DeckRecord[];
	logs: CampaignLogEntry[];
	manualAchievements: ManualAchievement[];
}

/** The whole database — one of these per file / per IndexedDB entry. */
export interface DatabaseDocument {
	formatVersion: number;
	createdAt: number;
	updatedAt: number;
	owner: LocalPlayer;
	players: LocalPlayer[];
	/** Named groups of roster members, each with its own combined profile. */
	playGroups: LocalPlayGroup[];
	campaigns: CampaignRecord[];
	/**
	 * Profile composer layout (the `ProfileSettings` JSON string). Optional and
	 * additive: absent → resolves to defaults.
	 */
	profileSettings?: string;
	/**
	 * Per-subject precomputed profile cache (see profile-cache.ts). Derived data —
	 * persisted to IndexedDB for fast profile views, but STRIPPED from exported
	 * `.arkhamlife` files and recomputed on import. Optional/additive.
	 */
	profileCache?: ProfileCache;
}

// ─── Construction ──────────────────────────────────────────────────────────────

function newId(): string {
	return crypto.randomUUID();
}

function now(): number {
	return Date.now();
}

/** Snapshot a roster member into a participant entry. */
export function bakeParticipant(member: LocalPlayer): CampaignParticipant {
	return { uid: member.uid, name: member.name, iconCardCode: member.iconCardCode };
}

/** Create a fresh, empty database owned by the given person. */
export function createEmptyDatabase(owner: {
	name: string;
	iconCardCode?: string;
}): DatabaseDocument {
	const ts = now();
	// A throwaway shell so generateUniqueUid can read an (empty) roster.
	const shell = { owner: { uid: '' }, players: [] } as unknown as DatabaseDocument;
	return {
		formatVersion: DATABASE_FORMAT_VERSION,
		createdAt: ts,
		updatedAt: ts,
		owner: {
			uid: generateUniqueUid(shell),
			name: owner.name,
			iconCardCode: owner.iconCardCode || '01001'
		},
		players: [],
		playGroups: [],
		campaigns: []
	};
}

function emptyInvestigator(investigatorCode: string): DeckInvestigator {
	return {
		investigatorCode,
		alternateFrontCode: null,
		alternateBackCode: null,
		factionSelected: null,
		faction1: null,
		faction2: null,
		optionSelected: null,
		deckSizeSelected: null
	};
}

// ─── Player roster operations ────────────────────────────────────────────────

/** All roster members (owner first, then sub-players). */
export function allPlayers(doc: DatabaseDocument): LocalPlayer[] {
	return [doc.owner, ...doc.players];
}

/** The set of uids managed by this file (used to derive guest status). */
export function rosterUids(doc: DatabaseDocument): Set<string> {
	return new Set(allPlayers(doc).map((p) => p.uid));
}

/** A uid → roster member map (the live-resolution table). */
export function rosterByUid(doc: DatabaseDocument): Map<string, LocalPlayer> {
	return new Map(allPlayers(doc).map((p) => [p.uid, p]));
}

/** Resolve a roster member by uid (owner or sub-player). */
export function findPlayer(doc: DatabaseDocument, uid: string): LocalPlayer | undefined {
	return allPlayers(doc).find((p) => p.uid === uid);
}

/**
 * Resolve a participant to the identity to DISPLAY: a managed roster member
 * (live) wins over the frozen snapshot; otherwise the snapshot (a guest).
 */
export function resolveParticipant(
	doc: DatabaseDocument,
	p: CampaignParticipant
): { uid: string; name: string; iconCardCode: string; isGuest: boolean } {
	const member = findPlayer(doc, p.uid);
	if (member)
		return {
			uid: member.uid,
			name: member.name,
			iconCardCode: member.iconCardCode,
			isGuest: false
		};
	return { uid: p.uid, name: p.name, iconCardCode: p.iconCardCode, isGuest: true };
}

/** Sort rank for a participant uid, matching the Manage Players listing:
 *  the owner ("you") = -1, a roster sub-player = its roster index (0,1,…),
 *  and a guest/unknown uid = a large sentinel so guests sort last. */
function participantOrderRank(doc: DatabaseDocument, uid: string): number {
	if (uid === doc.owner.uid) return -1;
	const idx = doc.players.findIndex((p) => p.uid === uid);
	return idx >= 0 ? idx : Number.MAX_SAFE_INTEGER;
}

/**
 * Order participants the way the UI lists them everywhere: the owner ("you")
 * first, then roster sub-players in roster order, then guests last (stable among
 * themselves). Returns a new array; the input is not mutated.
 */
export function sortParticipants(
	doc: DatabaseDocument,
	participants: CampaignParticipant[]
): CampaignParticipant[] {
	return participants
		.map((p, i) => ({ p, i }))
		.sort(
			(a, b) => participantOrderRank(doc, a.p.uid) - participantOrderRank(doc, b.p.uid) || a.i - b.i
		)
		.map((x) => x.p);
}

/**
 * Order decks to honour the participant ordering: decks group by their owner in
 * the same order participants are displayed, preserving each owner's relative
 * deck order; unassigned (and orphaned) decks fall to the end. Pass the
 * ALREADY-sorted participants so individual guests keep their relative order.
 */
export function sortDecksByParticipants(
	sortedParticipants: CampaignParticipant[],
	decks: DeckRecord[]
): DeckRecord[] {
	const pos = new Map(sortedParticipants.map((p, i) => [p.uid, i]));
	const rank = (uid: string | null): number =>
		uid != null ? (pos.get(uid) ?? Number.MAX_SAFE_INTEGER) : Number.MAX_SAFE_INTEGER;
	return decks
		.map((d, i) => ({ d, i }))
		.sort((a, b) => rank(a.d.ownerUid) - rank(b.d.ownerUid) || a.i - b.i)
		.map((x) => x.d);
}

/** Add a sub-player to the roster; returns the created member. */
export function addPlayer(
	doc: DatabaseDocument,
	fields: { name: string; iconCardCode?: string }
): LocalPlayer {
	const player: LocalPlayer = {
		uid: generateUniqueUid(doc),
		name: fields.name,
		iconCardCode: fields.iconCardCode || '01001'
	};
	doc.players.push(player);
	doc.updatedAt = now();
	return player;
}

/**
 * Update a roster member's name/icon (owner included) and WRITE THROUGH to every
 * participant snapshot bearing that uid, so snapshots never go stale: managed
 * members propagate live to all past campaigns, and if the member is later
 * un-rostered they freeze at the correct, current values.
 */
export function updatePlayer(
	doc: DatabaseDocument,
	uid: string,
	fields: Partial<Pick<LocalPlayer, 'name' | 'iconCardCode'>>
): void {
	const player = findPlayer(doc, uid);
	if (!player) return;
	if (fields.name !== undefined) player.name = fields.name;
	if (fields.iconCardCode !== undefined) player.iconCardCode = fields.iconCardCode;
	for (const c of doc.campaigns) {
		let changed = false;
		for (const p of c.participants) {
			if (p.uid !== uid) continue;
			p.name = player.name;
			p.iconCardCode = player.iconCardCode;
			changed = true;
		}
		if (changed) c.updatedAt = now();
	}
	doc.updatedAt = now();
}

/**
 * Remove a sub-player from the roster. History is preserved: rather than stripping
 * them, we freeze their current name/icon into every campaign they're in (they
 * become a guest), and their decks keep their owner. The owner cannot be removed.
 */
export function removePlayer(doc: DatabaseDocument, uid: string): void {
	if (uid === doc.owner.uid) return;
	const member = findPlayer(doc, uid);
	if (!member) return;
	for (const c of doc.campaigns) {
		let changed = false;
		for (const p of c.participants) {
			if (p.uid !== uid) continue;
			p.name = member.name; // freeze fresh
			p.iconCardCode = member.iconCardCode;
			changed = true;
		}
		if (changed) c.updatedAt = now();
	}
	doc.players = doc.players.filter((p) => p.uid !== uid);
	// Drop them from any play group so memberships never dangle.
	for (const g of doc.playGroups) g.memberUids = g.memberUids.filter((m) => m !== uid);
	doc.updatedAt = now();
}

// ─── Play group operations ─────────────────────────────────────────────────────

/** Resolve a play group by uid. */
export function findPlayGroup(doc: DatabaseDocument, uid: string): LocalPlayGroup | undefined {
	return doc.playGroups.find((g) => g.uid === uid);
}

/** Keep only valid, de-duplicated roster uids (order preserved). */
function sanitizeMembers(doc: DatabaseDocument, memberUids: string[]): string[] {
	const roster = rosterUids(doc);
	const seen = new Set<string>();
	const out: string[] = [];
	for (const uid of memberUids) {
		if (roster.has(uid) && !seen.has(uid)) {
			seen.add(uid);
			out.push(uid);
		}
	}
	return out;
}

/** Create a play group (members are filtered to current roster uids). */
export function createPlayGroup(
	doc: DatabaseDocument,
	fields: { name: string; memberUids?: string[] }
): LocalPlayGroup {
	const group: LocalPlayGroup = {
		uid: generateUniqueUid(doc),
		name: fields.name,
		memberUids: sanitizeMembers(doc, fields.memberUids ?? [])
	};
	doc.playGroups.push(group);
	doc.updatedAt = now();
	return group;
}

/** Patch a play group's name and/or member list. */
export function updatePlayGroup(
	doc: DatabaseDocument,
	uid: string,
	fields: Partial<Pick<LocalPlayGroup, 'name' | 'memberUids'>>
): void {
	const g = findPlayGroup(doc, uid);
	if (!g) return;
	if (fields.name !== undefined) g.name = fields.name;
	if (fields.memberUids !== undefined) g.memberUids = sanitizeMembers(doc, fields.memberUids);
	doc.updatedAt = now();
}

/** Delete a play group (its members and their campaigns are untouched). */
export function removePlayGroup(doc: DatabaseDocument, uid: string): void {
	const before = doc.playGroups.length;
	doc.playGroups = doc.playGroups.filter((g) => g.uid !== uid);
	if (doc.playGroups.length !== before) doc.updatedAt = now();
}

// ─── Campaign operations ───────────────────────────────────────────────────────

export function findCampaign(doc: DatabaseDocument, id: string): CampaignRecord | undefined {
	return doc.campaigns.find((c) => c.id === id);
}

/**
 * Create a campaign played by the database owner (added as the first participant so
 * deck assignment works uniformly). Returns the new record.
 */
export function createCampaign(
	doc: DatabaseDocument,
	input: { campaignCode: string; title: string; difficulty?: Difficulty }
): CampaignRecord {
	const ts = now();
	const campaign: CampaignRecord = {
		id: newId(),
		title: input.title,
		campaignCode: input.campaignCode,
		difficulty: input.difficulty ?? 'standard',
		playerCount: 'auto',
		draft: false,
		displayInProfile: 'default',
		// Players usually archive at the END of a campaign, so default the finish
		// date to today and leave the start date blank for them to fill in.
		startDate: null,
		finishDate: ts,
		createdAt: ts,
		updatedAt: ts,
		participants: [bakeParticipant(doc.owner)],
		decks: [],
		logs: [],
		manualAchievements: []
	};
	doc.campaigns.push(campaign);
	doc.updatedAt = ts;
	return campaign;
}

export function removeCampaign(doc: DatabaseDocument, id: string): void {
	const before = doc.campaigns.length;
	doc.campaigns = doc.campaigns.filter((c) => c.id !== id);
	if (doc.campaigns.length !== before) doc.updatedAt = now();
}

/** Patch general campaign fields (title/difficulty/draft/dates). */
export function updateCampaignGeneral(
	doc: DatabaseDocument,
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
	const c = findCampaign(doc, id);
	if (!c) return;
	if (fields.title !== undefined) c.title = fields.title;
	if (fields.difficulty !== undefined) c.difficulty = fields.difficulty;
	if (fields.playerCount !== undefined) c.playerCount = fields.playerCount;
	if (fields.multiHanded !== undefined) c.multiHanded = fields.multiHanded;
	if (fields.draft !== undefined) c.draft = fields.draft;
	if (fields.displayInProfile !== undefined) c.displayInProfile = fields.displayInProfile;
	if (fields.startDate !== undefined) c.startDate = fields.startDate;
	if (fields.finishDate !== undefined) c.finishDate = fields.finishDate;
	c.updatedAt = now();
	doc.updatedAt = c.updatedAt;
}

/**
 * Switch a campaign to a different scenario set. Recorded logs + manual
 * achievements no longer apply, so they are cleared.
 */
export function changeCampaignCode(doc: DatabaseDocument, id: string, campaignCode: string): void {
	const c = findCampaign(doc, id);
	if (!c) return;
	c.campaignCode = campaignCode;
	c.logs = [];
	c.manualAchievements = [];
	c.updatedAt = now();
	doc.updatedAt = c.updatedAt;
}

/** Replace the profile composer layout (a `ProfileSettings` JSON string,
 *  or null to clear back to defaults). */
export function setProfileSettings(doc: DatabaseDocument, json: string | null): void {
	if (json === null) delete doc.profileSettings;
	else doc.profileSettings = json;
	doc.updatedAt = now();
}

/** Wholesale-replace a campaign's recorded log entries. */
export function setCampaignLogs(
	doc: DatabaseDocument,
	id: string,
	entries: CampaignLogEntry[]
): void {
	const c = findCampaign(doc, id);
	if (!c) return;
	c.logs = entries.map((e) => ({
		key: e.key,
		section: e.section,
		args: e.args.map((a) => ({ ...a }))
	}));
	c.updatedAt = now();
	doc.updatedAt = c.updatedAt;
}

/** Set/clear a single manual achievement tick (idempotent). */
export function setManualAchievement(
	doc: DatabaseDocument,
	id: string,
	tick: ManualAchievement,
	earned: boolean
): void {
	const c = findCampaign(doc, id);
	if (!c) return;
	const same = (a: ManualAchievement) =>
		a.family === tick.family && a.achievementId === tick.achievementId && a.itemId === tick.itemId;
	c.manualAchievements = c.manualAchievements.filter((a) => !same(a));
	if (earned)
		c.manualAchievements.push({
			family: tick.family,
			achievementId: tick.achievementId,
			itemId: tick.itemId
		});
	c.updatedAt = now();
	doc.updatedAt = c.updatedAt;
}

// ─── Participant operations ──────────────────────────────────────────────────

/**
 * Add a participant to a campaign. Pass a roster member's uid (with their current
 * name/icon) to add a managed player, or a typed guest uid + chosen name/icon to
 * add a guest. The uid is normalized; an invalid uid is rejected (returns
 * undefined). Idempotent: re-adding an existing participant is a no-op.
 */
export function addParticipant(
	doc: DatabaseDocument,
	campaignId: string,
	fields: { uid: string; name: string; iconCardCode?: string }
): CampaignParticipant | undefined {
	const c = findCampaign(doc, campaignId);
	if (!c) return undefined;
	const uid = normalizeUid(fields.uid);
	if (!uid) return undefined;
	const existing = c.participants.find((p) => p.uid === uid);
	if (existing) return existing;
	// A roster member always wins over caller-supplied snapshot values.
	const member = findPlayer(doc, uid);
	const entry: CampaignParticipant = member
		? bakeParticipant(member)
		: { uid, name: fields.name, iconCardCode: fields.iconCardCode || '01001' };
	c.participants.push(entry);
	c.updatedAt = now();
	doc.updatedAt = c.updatedAt;
	return entry;
}

/**
 * Add a one-off guest who has no arkham.life of their own — someone you played
 * with once and won't need to match across files. We mint a fresh, collision-free
 * uid for them so they're a permanent frozen label (never a roster member, never
 * joins anyone). Use {@link addParticipant} instead when the guest read out a real
 * uid (so a future shared file can recognise them).
 */
export function addOneOffGuest(
	doc: DatabaseDocument,
	campaignId: string,
	fields: { name: string; iconCardCode?: string }
): CampaignParticipant | undefined {
	const c = findCampaign(doc, campaignId);
	if (!c) return undefined;
	const entry: CampaignParticipant = {
		uid: generateUniqueUid(doc),
		name: fields.name,
		iconCardCode: fields.iconCardCode || '01001'
	};
	c.participants.push(entry);
	c.updatedAt = now();
	doc.updatedAt = c.updatedAt;
	return entry;
}

/**
 * Edit a participant's frozen snapshot (name/icon). Meaningful only for guests;
 * for managed members the snapshot is display-ignored, but we still update it so
 * an export-before-rebake or a later un-rostering stays sane.
 */
export function updateParticipant(
	doc: DatabaseDocument,
	campaignId: string,
	uid: string,
	fields: Partial<Pick<CampaignParticipant, 'name' | 'iconCardCode'>>
): void {
	const c = findCampaign(doc, campaignId);
	if (!c) return;
	const p = c.participants.find((x) => x.uid === uid);
	if (!p) return;
	if (fields.name !== undefined) p.name = fields.name;
	if (fields.iconCardCode !== undefined) p.iconCardCode = fields.iconCardCode;
	c.updatedAt = now();
	doc.updatedAt = c.updatedAt;
}

/**
 * Remove a participant from ONE campaign (a per-campaign correction — distinct
 * from `removePlayer`, which freezes a roster member across history). Any decks
 * owned by that uid in this campaign are orphaned (owner cleared).
 */
export function removeParticipant(doc: DatabaseDocument, campaignId: string, uid: string): void {
	const c = findCampaign(doc, campaignId);
	if (!c) return;
	const before = c.participants.length;
	c.participants = c.participants.filter((p) => p.uid !== uid);
	if (c.participants.length === before) return;
	for (const d of c.decks) {
		if (d.ownerUid === uid) d.ownerUid = null;
	}
	c.updatedAt = now();
	doc.updatedAt = c.updatedAt;
}

/**
 * Re-point a participant from one uid to another within a campaign, re-mapping
 * any decks they owned. Used to claim an imported guest as one of your own roster
 * members (or as a different guest). If `toUid` is already a participant the two
 * are merged (the `fromUid` entry drops, its decks move to `toUid`).
 */
export function reassignParticipant(
	doc: DatabaseDocument,
	campaignId: string,
	fromUid: string,
	toUid: string,
	snap?: { name: string; iconCardCode: string }
): void {
	const c = findCampaign(doc, campaignId);
	if (!c) return;
	const normalized = normalizeUid(toUid);
	if (!normalized || fromUid === normalized) return;
	const fromIdx = c.participants.findIndex((p) => p.uid === fromUid);
	if (fromIdx === -1) return;

	const member = findPlayer(doc, normalized);
	const target = c.participants.find((p) => p.uid === normalized);
	if (target) {
		// Merge: drop the from-entry; keep the existing target snapshot.
		c.participants.splice(fromIdx, 1);
	} else {
		// Replace the from-entry's identity in place.
		c.participants[fromIdx] = member
			? bakeParticipant(member)
			: { uid: normalized, name: snap?.name ?? '', iconCardCode: snap?.iconCardCode || '01001' };
	}
	for (const d of c.decks) {
		if (d.ownerUid === fromUid) d.ownerUid = normalized;
	}
	c.updatedAt = now();
	doc.updatedAt = c.updatedAt;
}

/**
 * Refresh every managed participant's snapshot from the current roster (guests
 * untouched). `updatePlayer` already write-throughs, so this is a defensive pass
 * used right before serialization, guaranteeing a shared/exported file carries the
 * owner's & sub-players' current name/icon. Mutates in place — pass a clone.
 */
export function rebakeManaged(doc: DatabaseDocument): void {
	const roster = rosterByUid(doc);
	for (const c of doc.campaigns) {
		for (const p of c.participants) {
			const m = roster.get(p.uid);
			if (m) {
				p.name = m.name;
				p.iconCardCode = m.iconCardCode;
			}
		}
	}
}

// ─── Deck operations ───────────────────────────────────────────────────────────

/**
 * Add a deck chain to a campaign from an ordered list of AhdbDeck version JSON
 * strings. Investigator metadata is supplied separately (extracted by the caller
 * from the latest AhdbDeck — kept out of this pure module to avoid a kohaku dep).
 */
export function addDeck(
	doc: DatabaseDocument,
	campaignId: string,
	deck: {
		ownerUid?: string | null;
		investigator: DeckInvestigator | string;
		versions: DeckVersion[];
	}
): DeckRecord | undefined {
	const c = findCampaign(doc, campaignId);
	if (!c) return undefined;
	const investigator =
		typeof deck.investigator === 'string'
			? emptyInvestigator(deck.investigator)
			: deck.investigator;
	const ownerUid = deck.ownerUid ?? null;
	// A roster owner who isn't yet a participant joins the campaign (owning a deck
	// implies playing). A guest must be added as a participant explicitly first.
	if (ownerUid) ensureParticipant(doc, c, ownerUid);
	const entry: DeckRecord = {
		id: newId(),
		ownerUid,
		investigator,
		versions: [...deck.versions].sort((a, b) => a.sequenceIndex - b.sequenceIndex)
	};
	c.decks.push(entry);
	c.updatedAt = now();
	doc.updatedAt = c.updatedAt;
	return entry;
}

export function removeDeck(doc: DatabaseDocument, campaignId: string, deckId: string): void {
	const c = findCampaign(doc, campaignId);
	if (!c) return;
	const before = c.decks.length;
	c.decks = c.decks.filter((d) => d.id !== deckId);
	if (c.decks.length !== before) {
		c.updatedAt = now();
		doc.updatedAt = c.updatedAt;
	}
}

export function assignDeckOwner(
	doc: DatabaseDocument,
	campaignId: string,
	deckId: string,
	ownerUid: string | null
): void {
	const c = findCampaign(doc, campaignId);
	if (!c) return;
	const d = c.decks.find((x) => x.id === deckId);
	if (!d) return;
	if (ownerUid) ensureParticipant(doc, c, ownerUid);
	d.ownerUid = ownerUid;
	c.updatedAt = now();
	doc.updatedAt = c.updatedAt;
}

/** Set/clear a deck's "hand" number (1–4) for a multi-handed solo play. `null` clears it. */
export function assignDeckHand(
	doc: DatabaseDocument,
	campaignId: string,
	deckId: string,
	hand: number | null
): void {
	const c = findCampaign(doc, campaignId);
	if (!c) return;
	const d = c.decks.find((x) => x.id === deckId);
	if (!d) return;
	if (hand == null) delete d.hand;
	else d.hand = hand;
	c.updatedAt = now();
	doc.updatedAt = c.updatedAt;
}

/** If a roster member with `uid` isn't a participant of `c`, bake them in. */
function ensureParticipant(doc: DatabaseDocument, c: CampaignRecord, uid: string): void {
	if (c.participants.some((p) => p.uid === uid)) return;
	const member = findPlayer(doc, uid);
	if (member) c.participants.push(bakeParticipant(member));
}

// ─── Validation / migration (for import) ─────────────────────────────────────

/** Structural guard — enough to reject obviously-wrong files before migration. */
export function isDatabaseDocument(value: unknown): value is DatabaseDocument {
	if (typeof value !== 'object' || value === null) return false;
	const v = value as Record<string, unknown>;
	return (
		typeof v.formatVersion === 'number' &&
		typeof v.owner === 'object' &&
		v.owner !== null &&
		Array.isArray(v.players) &&
		Array.isArray(v.campaigns)
	);
}

export class DatabaseImportError extends Error {}

/**
 * Validate a parsed object as a current-format database document. Throws a
 * `DatabaseImportError` on a malformed file or a format other than the current
 * `DATABASE_FORMAT_VERSION`. No cross-version migration: a non-current format is
 * rejected. Reintroduce step-ups here if the shape ever changes again.
 */
export function parseDatabaseDocument(value: unknown): DatabaseDocument {
	if (!isDatabaseDocument(value)) {
		throw new DatabaseImportError('This file is not a recognizable arkham.life database.');
	}
	if (value.formatVersion !== DATABASE_FORMAT_VERSION) {
		throw new DatabaseImportError(
			`This database uses an unsupported format (${value.formatVersion}; this app expects ${DATABASE_FORMAT_VERSION}).`
		);
	}
	return value;
}
