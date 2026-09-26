/**
 * The Database document and the pure operations on it. Operations mutate the passed document in
 * place (a `$state` proxy in the app, a plain object in tests) and stamp `updatedAt`.
 */
import type { Campaign } from '@5argon/arkham-kohaku';
import { u } from '@5argon/arkham-string';

import type { CompiledProfileFile } from './compiled-profile';
import type { ProfileCache } from './profile-cache';
import { generateUid, generateUniqueUid, normalizeUid } from './uid';

/** Bumped only on a breaking change to this document's shape. */
export const DATABASE_FORMAT_VERSION = 3;

/** Portrait card for a person created without one. */
export const DEFAULT_ICON = '01001';

export type Difficulty = 'easy' | 'standard' | 'hard' | 'expert';

/**
 * The head count a campaign is considered to have: `'auto'` = participants clamped to 4, a number
 * overrides it, `'unspecified'` = none. Absent on a record means `'auto'`.
 */
export type PlayerCount = 'auto' | 'unspecified' | 1 | 2 | 3 | 4;

/** The concrete head count, or `null` when there is none to show. */
export function resolvePlayerCount(
	setting: PlayerCount | undefined,
	participantCount: number
): number | null {
	if (setting === 'unspecified') return null;
	if (typeof setting === 'number') return setting;
	const n = Math.min(participantCount, 4);
	return n > 0 ? n : null;
}

export type SoloType = 'true-solo' | 'multi-handed';

/** The solo flavour of a 1-player play, or `null` when it is not solo. */
export function resolveSoloType(
	setting: PlayerCount | undefined,
	participantCount: number,
	multiHanded: boolean | undefined
): SoloType | null {
	if (resolvePlayerCount(setting, participantCount) !== 1) return null;
	return multiHanded ? 'multi-handed' : 'true-solo';
}

/** The X in "Solo X-Handed": distinct assigned deck hands. */
export function distinctHands(decks: DeckRecord[]): number {
	return new Set(decks.flatMap((d) => (d.hand != null ? [d.hand] : []))).size;
}

// ─── Entities ────────────────────────────────────────────────────────────────

/** The owner or a sub-player. `uid` (`XXX-XXX-XXX`) is the cross-file join key. */
export interface LocalPlayer {
	uid: string;
	name: string;
	/** Card code used as the portrait. */
	iconCardCode: string;
}

/** A named group of roster members with its own combined profile; never recorded onto a campaign. */
export interface LocalPlayGroup {
	uid: string;
	name: string;
	memberUids: string[];
}

/** A baked snapshot of who played. A uid outside the file's roster is a frozen guest. */
export interface CampaignParticipant {
	uid: string;
	name: string;
	iconCardCode: string;
}

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

export interface DeckVersion {
	/** 0-based position in the upgrade history. */
	sequenceIndex: number;
	/** Raw AhdbDeck JSON (without previous_deck / next_deck). */
	ahdbJson: string;
}

/** A deck chain played in a campaign. */
export interface DeckRecord {
	id: string;
	/** Participant uid, or null when unassigned. */
	ownerUid: string | null;
	investigator: DeckInvestigator;
	/** Ascending `sequenceIndex`. */
	versions: DeckVersion[];
	/** Hand number (1–4) in a multi-handed solo play. */
	hand?: number;
}

/** One recorded campaign-log entry, in the `saveLogs` payload shape. */
export interface CampaignLogEntry {
	/** campaign-data composite "section.id" (or the section id alone). */
	key: string;
	/** Owning section id, or a reserved `__*` section. */
	section: string;
	args: { type: 'string' | 'number'; value: string }[];
}

/** A manually ticked achievement (inferred ones are recomputed, never stored). */
export interface ManualAchievement {
	family: string;
	achievementId: string;
	itemId: string | null;
}

/** Whether the record's existence shows on the profile; `'default'` follows the account setting.
 *  Its stats aggregate either way. */
export type DisplayInProfile = 'default' | 'visible' | 'hidden';

export interface CampaignRecord {
	id: string;
	title: string;
	/** kohaku campaign enum, e.g. "the_night_of_the_zealot". */
	campaignCode: string;
	difficulty: Difficulty;
	playerCount?: PlayerCount;
	/** One person piloted several decks; only meaningful when the resolved count is 1. */
	multiHanded?: boolean;
	draft: boolean;
	displayInProfile?: DisplayInProfile;
	/** ms since epoch. */
	startDate: number | null;
	/** ms since epoch. */
	finishDate: number | null;
	createdAt: number;
	updatedAt: number;
	/** Includes the owner. */
	participants: CampaignParticipant[];
	decks: DeckRecord[];
	logs: CampaignLogEntry[];
	/** The Dream-Eaters Linked Campaign Log: entries transcribed from the sibling campaign. */
	linkedLog?: CampaignLogEntry[];
	manualAchievements: ManualAchievement[];
}

/**
 * One scenario played standalone. `campaignCode` names the campaign-data catalogue to load:
 * `'side'` for a Scenario Pack, else the host campaign.
 */
export interface StandaloneRecord extends CampaignRecord {
	source: 'pack' | 'campaign';
	/** campaign-data scenario id within that catalogue. */
	scenario: string;
}

export interface DatabaseDocument {
	formatVersion: number;
	createdAt: number;
	updatedAt: number;
	owner: LocalPlayer;
	players: LocalPlayer[];
	playGroups: LocalPlayGroup[];
	campaigns: CampaignRecord[];
	/** Kept apart from `campaigns` so campaign compilation never sees them. */
	standalones: StandaloneRecord[];
	/** `ProfileSettings` JSON; absent resolves to defaults. */
	profileSettings?: string;
	/** Derived; kept in memory only and rebuilt after load. */
	profileCache?: ProfileCache;
	/** Other people's opened `.ahlifepro` files, one per subject uid. */
	loadedProfiles: CompiledProfileFile[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function now(): number {
	return Date.now();
}

/** Stamp the document (and a record, when given) as just edited. */
function touch(doc: DatabaseDocument, record?: CampaignRecord): void {
	const ts = now();
	if (record) record.updatedAt = ts;
	doc.updatedAt = ts;
}

function snapshot(person: {
	uid: string;
	name: string;
	iconCardCode?: string;
}): CampaignParticipant {
	return { uid: person.uid, name: person.name, iconCardCode: person.iconCardCode || DEFAULT_ICON };
}

/** A JSON-pure copy (a `$state` proxy cannot be structured-cloned) without the derived cache. */
export function toPlainDocument(doc: DatabaseDocument): DatabaseDocument {
	const plain = JSON.parse(JSON.stringify(doc)) as DatabaseDocument;
	delete plain.profileCache;
	return plain;
}

/** The title a new record gets for a campaign code. */
export function defaultCampaignTitle(campaignCode: string): string {
	if (!campaignCode) return 'Unspecified Campaign';
	try {
		return u.campaignName(campaignCode as Campaign);
	} catch {
		return campaignCode;
	}
}

export function createEmptyDatabase(owner: {
	name: string;
	iconCardCode?: string;
}): DatabaseDocument {
	const ts = now();
	return {
		formatVersion: DATABASE_FORMAT_VERSION,
		createdAt: ts,
		updatedAt: ts,
		owner: snapshot({ ...owner, uid: generateUid() }),
		players: [],
		playGroups: [],
		campaigns: [],
		standalones: [],
		loadedProfiles: []
	};
}

// ─── Roster ──────────────────────────────────────────────────────────────────

/** Owner first, then sub-players. */
export function allPlayers(doc: DatabaseDocument): LocalPlayer[] {
	return [doc.owner, ...doc.players];
}

export function rosterUids(doc: DatabaseDocument): Set<string> {
	return new Set(allPlayers(doc).map((p) => p.uid));
}

export function rosterByUid(doc: DatabaseDocument): Map<string, LocalPlayer> {
	return new Map(allPlayers(doc).map((p) => [p.uid, p]));
}

/** Campaigns and standalone plays. */
export function allRecords(doc: DatabaseDocument): CampaignRecord[] {
	return [...doc.campaigns, ...doc.standalones];
}

export function findPlayer(doc: DatabaseDocument, uid: string): LocalPlayer | undefined {
	return allPlayers(doc).find((p) => p.uid === uid);
}

/** A roster member resolves live; anyone else shows their frozen snapshot as a guest. */
export function resolveParticipant(
	doc: DatabaseDocument,
	p: CampaignParticipant
): CampaignParticipant & { isGuest: boolean } {
	const member = findPlayer(doc, p.uid);
	const shown = member ?? p;
	return { uid: shown.uid, name: shown.name, iconCardCode: shown.iconCardCode, isGuest: !member };
}

/**
 * Copy each roster member's current name/icon onto their participant snapshots. Returns the
 * records that carried at least one such participant.
 */
export function bakeFromRoster(
	records: CampaignRecord[],
	roster: Map<string, LocalPlayer>
): CampaignRecord[] {
	const baked: CampaignRecord[] = [];
	for (const c of records) {
		let hit = false;
		for (const p of c.participants) {
			const member = roster.get(p.uid);
			if (!member) continue;
			p.name = member.name;
			p.iconCardCode = member.iconCardCode;
			hit = true;
		}
		if (hit) baked.push(c);
	}
	return baked;
}

/** Refresh every managed participant snapshot before serializing. Mutates — pass a copy. */
export function rebakeManaged(doc: DatabaseDocument): void {
	bakeFromRoster(allRecords(doc), rosterByUid(doc));
}

/** Owner first, then sub-players in roster order, then guests (stable). */
export function sortParticipants(
	doc: DatabaseDocument,
	participants: CampaignParticipant[]
): CampaignParticipant[] {
	const rank = (uid: string) => {
		if (uid === doc.owner.uid) return -1;
		const i = doc.players.findIndex((p) => p.uid === uid);
		return i >= 0 ? i : Number.MAX_SAFE_INTEGER;
	};
	return participants
		.map((p, i) => ({ p, i }))
		.sort((a, b) => rank(a.p.uid) - rank(b.p.uid) || a.i - b.i)
		.map((x) => x.p);
}

/** Decks grouped by owner in the (already sorted) participant order; unassigned last. */
export function sortDecksByParticipants(
	sortedParticipants: CampaignParticipant[],
	decks: DeckRecord[]
): DeckRecord[] {
	const pos = new Map(sortedParticipants.map((p, i) => [p.uid, i]));
	const rank = (uid: string | null) =>
		(uid != null ? pos.get(uid) : undefined) ?? Number.MAX_SAFE_INTEGER;
	return decks
		.map((d, i) => ({ d, i }))
		.sort((a, b) => rank(a.d.ownerUid) - rank(b.d.ownerUid) || a.i - b.i)
		.map((x) => x.d);
}

export function addPlayer(
	doc: DatabaseDocument,
	fields: { name: string; iconCardCode?: string }
): LocalPlayer {
	const player = snapshot({ ...fields, uid: generateUniqueUid(doc) });
	doc.players.push(player);
	touch(doc);
	return player;
}

/** Edit a roster member (owner included) and write through to their snapshots. */
export function updatePlayer(
	doc: DatabaseDocument,
	uid: string,
	fields: Partial<Pick<LocalPlayer, 'name' | 'iconCardCode'>>
): void {
	const player = findPlayer(doc, uid);
	if (!player) return;
	if (fields.name !== undefined) player.name = fields.name;
	if (fields.iconCardCode !== undefined) player.iconCardCode = fields.iconCardCode;
	const ts = now();
	for (const c of bakeFromRoster(allRecords(doc), new Map([[uid, player]]))) c.updatedAt = ts;
	doc.updatedAt = ts;
}

/**
 * Remove a sub-player. Their snapshots are refreshed first so they freeze as a guest with current
 * values; their decks keep the owner uid. The owner cannot be removed.
 */
export function removePlayer(doc: DatabaseDocument, uid: string): void {
	if (uid === doc.owner.uid) return;
	const member = findPlayer(doc, uid);
	if (!member) return;
	const ts = now();
	for (const c of bakeFromRoster(allRecords(doc), new Map([[uid, member]]))) c.updatedAt = ts;
	doc.players = doc.players.filter((p) => p.uid !== uid);
	for (const g of doc.playGroups) g.memberUids = g.memberUids.filter((m) => m !== uid);
	doc.updatedAt = ts;
}

// ─── Play groups ─────────────────────────────────────────────────────────────

export function findPlayGroup(doc: DatabaseDocument, uid: string): LocalPlayGroup | undefined {
	return doc.playGroups.find((g) => g.uid === uid);
}

/** Roster uids only, de-duplicated, order kept. */
function sanitizeMembers(doc: DatabaseDocument, memberUids: string[]): string[] {
	const roster = rosterUids(doc);
	return [...new Set(memberUids)].filter((uid) => roster.has(uid));
}

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
	touch(doc);
	return group;
}

export function updatePlayGroup(
	doc: DatabaseDocument,
	uid: string,
	fields: Partial<Pick<LocalPlayGroup, 'name' | 'memberUids'>>
): void {
	const g = findPlayGroup(doc, uid);
	if (!g) return;
	if (fields.name !== undefined) g.name = fields.name;
	if (fields.memberUids !== undefined) g.memberUids = sanitizeMembers(doc, fields.memberUids);
	touch(doc);
}

export function removePlayGroup(doc: DatabaseDocument, uid: string): void {
	const before = doc.playGroups.length;
	doc.playGroups = doc.playGroups.filter((g) => g.uid !== uid);
	if (doc.playGroups.length !== before) touch(doc);
}

// ─── Records (campaigns and standalones) ─────────────────────────────────────

export function findCampaign(doc: DatabaseDocument, id: string): CampaignRecord | undefined {
	return doc.campaigns.find((c) => c.id === id);
}

export function findStandalone(doc: DatabaseDocument, id: string): StandaloneRecord | undefined {
	return doc.standalones.find((s) => s.id === id);
}

/** A campaign or standalone by id, for the editor operations that apply to both. */
export function findRecord(doc: DatabaseDocument, id: string): CampaignRecord | undefined {
	return findCampaign(doc, id) ?? findStandalone(doc, id);
}

export function isStandaloneRecord(record: CampaignRecord): record is StandaloneRecord {
	const r = record as Partial<StandaloneRecord>;
	return typeof r.source === 'string' && typeof r.scenario === 'string';
}

/** Put a whole record into its array, replacing one with the same id. */
export function insertRecord(doc: DatabaseDocument, record: CampaignRecord): void {
	const list: CampaignRecord[] = isStandaloneRecord(record) ? doc.standalones : doc.campaigns;
	const i = list.findIndex((r) => r.id === record.id);
	if (i >= 0) list[i] = record;
	else list.push(record);
	touch(doc, record);
}

/**
 * Apply `edit` to record `id` and stamp it, unless the record is missing or `edit` returns
 * `false` (nothing changed).
 */
function editRecord<T>(
	doc: DatabaseDocument,
	id: string,
	edit: (c: CampaignRecord) => T | false
): T | undefined {
	const c = findRecord(doc, id);
	if (!c) return undefined;
	const result = edit(c);
	if (result === false) return undefined;
	touch(doc, c);
	return result;
}

/** A record played by the owner. Players usually archive at the end, so it finishes today. */
function newRecord(
	doc: DatabaseDocument,
	input: { campaignCode: string; title: string; difficulty?: Difficulty }
): CampaignRecord {
	const ts = now();
	return {
		id: crypto.randomUUID(),
		title: input.title,
		campaignCode: input.campaignCode,
		difficulty: input.difficulty ?? 'standard',
		playerCount: 'auto',
		draft: false,
		displayInProfile: 'default',
		startDate: null,
		finishDate: ts,
		createdAt: ts,
		updatedAt: ts,
		participants: [snapshot(doc.owner)],
		decks: [],
		logs: [],
		manualAchievements: []
	};
}

export function createCampaign(
	doc: DatabaseDocument,
	input: { campaignCode: string; title: string; difficulty?: Difficulty }
): CampaignRecord {
	const campaign = newRecord(doc, input);
	doc.campaigns.push(campaign);
	doc.updatedAt = campaign.updatedAt;
	return campaign;
}

export function createStandalone(
	doc: DatabaseDocument,
	input: {
		source: 'pack' | 'campaign';
		campaignCode: string;
		scenario: string;
		title: string;
		difficulty?: Difficulty;
	}
): StandaloneRecord {
	const standalone: StandaloneRecord = {
		...newRecord(doc, input),
		source: input.source,
		scenario: input.scenario
	};
	doc.standalones.push(standalone);
	doc.updatedAt = standalone.updatedAt;
	return standalone;
}

export function removeCampaign(doc: DatabaseDocument, id: string): void {
	const before = doc.campaigns.length;
	doc.campaigns = doc.campaigns.filter((c) => c.id !== id);
	if (doc.campaigns.length !== before) touch(doc);
}

export function removeStandalone(doc: DatabaseDocument, id: string): void {
	const before = doc.standalones.length;
	doc.standalones = doc.standalones.filter((s) => s.id !== id);
	if (doc.standalones.length !== before) touch(doc);
}

const GENERAL_FIELDS = [
	'title',
	'difficulty',
	'playerCount',
	'multiHanded',
	'draft',
	'displayInProfile',
	'startDate',
	'finishDate'
] as const;

export type CampaignGeneralFields = Partial<Pick<CampaignRecord, (typeof GENERAL_FIELDS)[number]>>;

export function updateCampaignGeneral(
	doc: DatabaseDocument,
	id: string,
	fields: CampaignGeneralFields
): void {
	editRecord(doc, id, (c) => {
		for (const key of GENERAL_FIELDS) {
			if (fields[key] !== undefined) Object.assign(c, { [key]: fields[key] });
		}
	});
}

/**
 * Switch a record to another campaign. Its logs, linked log and manual ticks no longer apply, and
 * a title still at the old campaign's default follows the new campaign.
 */
export function changeCampaignCode(doc: DatabaseDocument, id: string, campaignCode: string): void {
	editRecord(doc, id, (c) => {
		if (!c.title || c.title === defaultCampaignTitle(c.campaignCode)) {
			c.title = defaultCampaignTitle(campaignCode);
		}
		c.campaignCode = campaignCode;
		c.logs = [];
		delete c.linkedLog;
		c.manualAchievements = [];
	});
}

/** `null` clears back to defaults. */
export function setProfileSettings(doc: DatabaseDocument, json: string | null): void {
	if (json === null) delete doc.profileSettings;
	else doc.profileSettings = json;
	touch(doc);
}

function cloneEntries(entries: CampaignLogEntry[]): CampaignLogEntry[] {
	return entries.map((e) => ({
		key: e.key,
		section: e.section,
		args: e.args.map((a) => ({ ...a }))
	}));
}

export function setCampaignLogs(
	doc: DatabaseDocument,
	id: string,
	entries: CampaignLogEntry[]
): void {
	editRecord(doc, id, (c) => {
		c.logs = cloneEntries(entries);
	});
}

export function setCampaignLinkedLogs(
	doc: DatabaseDocument,
	id: string,
	entries: CampaignLogEntry[]
): void {
	editRecord(doc, id, (c) => {
		c.linkedLog = cloneEntries(entries);
	});
}

export function setManualAchievement(
	doc: DatabaseDocument,
	id: string,
	tick: ManualAchievement,
	earned: boolean
): void {
	editRecord(doc, id, (c) => {
		c.manualAchievements = c.manualAchievements.filter(
			(a) =>
				a.family !== tick.family ||
				a.achievementId !== tick.achievementId ||
				a.itemId !== tick.itemId
		);
		if (earned) {
			c.manualAchievements.push({
				family: tick.family,
				achievementId: tick.achievementId,
				itemId: tick.itemId
			});
		}
	});
}

// ─── Participants ────────────────────────────────────────────────────────────

/**
 * Add a participant by uid: a roster member bakes from the roster, anyone else is a guest with the
 * given name/icon. Returns undefined for an invalid uid; re-adding returns the existing entry.
 */
export function addParticipant(
	doc: DatabaseDocument,
	campaignId: string,
	fields: { uid: string; name: string; iconCardCode?: string }
): CampaignParticipant | undefined {
	const uid = normalizeUid(fields.uid);
	if (!uid) return undefined;
	const existing = findRecord(doc, campaignId)?.participants.find((p) => p.uid === uid);
	if (existing) return existing;
	return editRecord(doc, campaignId, (c) => {
		const entry = snapshot(findPlayer(doc, uid) ?? { ...fields, uid });
		c.participants.push(entry);
		return entry;
	});
}

/** A guest with no uid of their own gets a fresh one, so they never match anyone across files. */
export function addOneOffGuest(
	doc: DatabaseDocument,
	campaignId: string,
	fields: { name: string; iconCardCode?: string }
): CampaignParticipant | undefined {
	return editRecord(doc, campaignId, (c) => {
		const entry = snapshot({ ...fields, uid: generateUniqueUid(doc) });
		c.participants.push(entry);
		return entry;
	});
}

/** Edit a participant's snapshot (what a guest shows; a roster member displays live anyway). */
export function updateParticipant(
	doc: DatabaseDocument,
	campaignId: string,
	uid: string,
	fields: Partial<Pick<CampaignParticipant, 'name' | 'iconCardCode'>>
): void {
	editRecord(doc, campaignId, (c) => {
		const p = c.participants.find((x) => x.uid === uid);
		if (!p) return false;
		if (fields.name !== undefined) p.name = fields.name;
		if (fields.iconCardCode !== undefined) p.iconCardCode = fields.iconCardCode;
	});
}

/** Remove a participant from one record; their decks there become unassigned. */
export function removeParticipant(doc: DatabaseDocument, campaignId: string, uid: string): void {
	editRecord(doc, campaignId, (c) => {
		const before = c.participants.length;
		c.participants = c.participants.filter((p) => p.uid !== uid);
		if (c.participants.length === before) return false;
		for (const d of c.decks) if (d.ownerUid === uid) d.ownerUid = null;
	});
}

/** Owning a deck implies playing: a roster member who is not yet a participant joins. */
function ensureParticipant(doc: DatabaseDocument, c: CampaignRecord, uid: string): void {
	if (c.participants.some((p) => p.uid === uid)) return;
	const member = findPlayer(doc, uid);
	if (member) c.participants.push(snapshot(member));
}

// ─── Decks ───────────────────────────────────────────────────────────────────

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

/** The caller extracts the investigator from the latest AhdbDeck (keeps kohaku deck parsing out). */
export function addDeck(
	doc: DatabaseDocument,
	campaignId: string,
	deck: {
		ownerUid?: string | null;
		investigator: DeckInvestigator | string;
		versions: DeckVersion[];
	}
): DeckRecord | undefined {
	return editRecord(doc, campaignId, (c) => {
		const ownerUid = deck.ownerUid ?? null;
		if (ownerUid) ensureParticipant(doc, c, ownerUid);
		const entry: DeckRecord = {
			id: crypto.randomUUID(),
			ownerUid,
			investigator:
				typeof deck.investigator === 'string'
					? emptyInvestigator(deck.investigator)
					: deck.investigator,
			versions: [...deck.versions].sort((a, b) => a.sequenceIndex - b.sequenceIndex)
		};
		c.decks.push(entry);
		return entry;
	});
}

export function removeDeck(doc: DatabaseDocument, campaignId: string, deckId: string): void {
	editRecord(doc, campaignId, (c) => {
		const before = c.decks.length;
		c.decks = c.decks.filter((d) => d.id !== deckId);
		if (c.decks.length === before) return false;
	});
}

export function assignDeckOwner(
	doc: DatabaseDocument,
	campaignId: string,
	deckId: string,
	ownerUid: string | null
): void {
	editRecord(doc, campaignId, (c) => {
		const d = c.decks.find((x) => x.id === deckId);
		if (!d) return false;
		if (ownerUid) ensureParticipant(doc, c, ownerUid);
		d.ownerUid = ownerUid;
	});
}

/** `null` clears the hand. */
export function assignDeckHand(
	doc: DatabaseDocument,
	campaignId: string,
	deckId: string,
	hand: number | null
): void {
	editRecord(doc, campaignId, (c) => {
		const d = c.decks.find((x) => x.id === deckId);
		if (!d) return false;
		if (hand == null) delete d.hand;
		else d.hand = hand;
	});
}

// ─── Loaded compiled profiles ────────────────────────────────────────────────

export function findLoadedProfile(
	doc: DatabaseDocument,
	uid: string
): CompiledProfileFile | undefined {
	return doc.loadedProfiles.find((f) => f.subject.uid === uid);
}

/** Store an opened `.ahlifepro`, replacing any earlier file for the same subject. */
export function addLoadedProfile(
	doc: DatabaseDocument,
	file: CompiledProfileFile
): CompiledProfileFile {
	const i = doc.loadedProfiles.findIndex((f) => f.subject.uid === file.subject.uid);
	if (i >= 0) doc.loadedProfiles[i] = file;
	else doc.loadedProfiles.push(file);
	touch(doc);
	return file;
}

export function removeLoadedProfile(doc: DatabaseDocument, uid: string): void {
	const before = doc.loadedProfiles.length;
	doc.loadedProfiles = doc.loadedProfiles.filter((f) => f.subject.uid !== uid);
	if (doc.loadedProfiles.length !== before) touch(doc);
}

// ─── Parsing ─────────────────────────────────────────────────────────────────

export class DatabaseImportError extends Error {}

/** The stored shape: lists added within format 3 may be absent. */
type StoredDocument = Omit<DatabaseDocument, 'playGroups' | 'standalones' | 'loadedProfiles'> &
	Partial<Pick<DatabaseDocument, 'playGroups' | 'standalones' | 'loadedProfiles'>>;

function isStoredDocument(value: unknown): value is StoredDocument {
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

/** Validate a stored/opened value as a current-format document and fill absent lists. */
export function parseDatabaseDocument(value: unknown): DatabaseDocument {
	if (!isStoredDocument(value)) {
		throw new DatabaseImportError('This file is not a recognizable arkham.life database.');
	}
	if (value.formatVersion !== DATABASE_FORMAT_VERSION) {
		throw new DatabaseImportError(
			`This database uses an unsupported format (${value.formatVersion}; this app expects ${DATABASE_FORMAT_VERSION}).`
		);
	}
	return {
		...value,
		playGroups: value.playGroups ?? [],
		standalones: value.standalones ?? [],
		loadedProfiles: value.loadedProfiles ?? []
	};
}
