import { describe, expect, it } from 'vitest';

import {
	importCampaignShare,
	serializeCampaignShare,
	CampaignShareError,
} from './campaign-share';
import {
	addDeck,
	addParticipant,
	addOneOffGuest,
	addPlayer,
	assignDeckOwner,
	changeCampaignCode,
	DATABASE_FORMAT_VERSION,
	DatabaseImportError,
	createCampaign,
	createEmptyDatabase,
	createPlayGroup,
	findCampaign,
	findPlayGroup,
	isDatabaseDocument,
	parseDatabaseDocument,
	reassignParticipant,
	removeCampaign,
	removeDeck,
	removeParticipant,
	removePlayer,
	removePlayGroup,
	resolveParticipant,
	setCampaignLogs,
	setManualAchievement,
	updateCampaignGeneral,
	updateParticipant,
	updatePlayer,
	updatePlayGroup,
	type DatabaseDocument,
} from './document';
import { collectUids, generateUniqueUid, normalizeUid, UID_PATTERN } from './uid';

function seed(): DatabaseDocument {
	return createEmptyDatabase({ name: 'Keeper', iconCardCode: '01001' });
}

describe('uid', () => {
	it('normalizes and validates the XXX-XXX-XXX format', () => {
		expect(normalizeUid(' abc-2de-fgh ')).toBe('ABC-2DE-FGH');
		expect(normalizeUid('ABC2DEFGH')).toBeNull();
		expect(normalizeUid('ABC-2DE-FG')).toBeNull();
		expect(normalizeUid('ABO-0DE-FGH')).toBeNull(); // O and 0 excluded
	});
});

describe('createEmptyDatabase', () => {
	it('stamps the current format and an owner with a uid', () => {
		const doc = seed();
		expect(doc.formatVersion).toBe(DATABASE_FORMAT_VERSION);
		expect(DATABASE_FORMAT_VERSION).toBe(3);
		expect(doc.owner.name).toBe('Keeper');
		expect(doc.owner.uid).toMatch(UID_PATTERN);
		expect(doc.players).toEqual([]);
		expect(doc.playGroups).toEqual([]);
		expect(doc.campaigns).toEqual([]);
	});

	it('defaults a missing icon to 01001', () => {
		expect(createEmptyDatabase({ name: 'Nameless' }).owner.iconCardCode).toBe('01001');
	});
});

describe('player roster', () => {
	it('adds sub-players with their own uid', () => {
		const doc = seed();
		const p = addPlayer(doc, { name: 'Ally' });
		expect(doc.players).toHaveLength(1);
		expect(p.uid).toMatch(UID_PATTERN);
		expect(p.uid).not.toBe(doc.owner.uid);
	});

	it('updatePlayer writes through to participant snapshots (live propagation)', () => {
		const doc = seed();
		const ally = addPlayer(doc, { name: 'Ally', iconCardCode: '02002' });
		const c = createCampaign(doc, { campaignCode: 'x', title: 'T' });
		addParticipant(doc, c.id, { uid: ally.uid, name: 'Ally', iconCardCode: '02002' });
		updatePlayer(doc, ally.uid, { name: 'Ally Renamed', iconCardCode: '03003' });
		const snap = findCampaign(doc, c.id)!.participants.find((p) => p.uid === ally.uid)!;
		expect(snap).toMatchObject({ name: 'Ally Renamed', iconCardCode: '03003' });
	});

	it('removePlayer freezes the member as a guest in history (decks kept)', () => {
		const doc = seed();
		const ally = addPlayer(doc, { name: 'Ally', iconCardCode: '02002' });
		const c = createCampaign(doc, { campaignCode: 'x', title: 'T' });
		addParticipant(doc, c.id, { uid: ally.uid, name: 'Ally', iconCardCode: '02002' });
		const deck = addDeck(doc, c.id, { ownerUid: ally.uid, investigator: '01001', versions: [] })!;

		removePlayer(doc, ally.uid);

		expect(doc.players).toHaveLength(0);
		const cc = findCampaign(doc, c.id)!;
		// Still a participant — now a frozen guest.
		const part = cc.participants.find((p) => p.uid === ally.uid)!;
		expect(part).toMatchObject({ name: 'Ally', iconCardCode: '02002' });
		expect(resolveParticipant(doc, part).isGuest).toBe(true);
		// Deck ownership preserved.
		expect(cc.decks.find((d) => d.id === deck.id)!.ownerUid).toBe(ally.uid);
	});

	it('refuses to remove the owner', () => {
		const doc = seed();
		removePlayer(doc, doc.owner.uid);
		expect(doc.owner).toBeDefined();
	});
});

describe('campaigns', () => {
	it('creates a campaign with the owner as the sole participant', () => {
		const doc = seed();
		const c = createCampaign(doc, { campaignCode: 'the_dunwich_legacy', title: 'Dunwich', difficulty: 'hard' });
		expect(c.difficulty).toBe('hard');
		expect(c.participants).toEqual([{ uid: doc.owner.uid, name: 'Keeper', iconCardCode: '01001' }]);
		expect(doc.campaigns).toHaveLength(1);
	});

	it('updates general fields and removes campaigns', () => {
		const doc = seed();
		const c = createCampaign(doc, { campaignCode: 'x', title: 'Old' });
		updateCampaignGeneral(doc, c.id, { title: 'New', draft: true, finishDate: 123 });
		expect(findCampaign(doc, c.id)).toMatchObject({ title: 'New', draft: true, finishDate: 123 });
		removeCampaign(doc, c.id);
		expect(doc.campaigns).toHaveLength(0);
	});
});

describe('participants', () => {
	it('adds a guest by typed uid and resolves it as a frozen guest', () => {
		const doc = seed();
		const c = createCampaign(doc, { campaignCode: 'x', title: 'T' });
		const guest = addParticipant(doc, c.id, { uid: 'abc-2de-fgh', name: 'Cassidy', iconCardCode: '05005' })!;
		expect(guest.uid).toBe('ABC-2DE-FGH'); // normalized
		expect(resolveParticipant(doc, guest)).toMatchObject({ name: 'Cassidy', isGuest: true });
	});

	it('adds a one-off guest with a freshly minted uid (frozen, never in the roster)', () => {
		const doc = seed();
		const c = createCampaign(doc, { campaignCode: 'x', title: 'T' });
		const guest = addOneOffGuest(doc, c.id, { name: 'Once-a-year Pal', iconCardCode: '05005' })!;
		expect(UID_PATTERN.test(guest.uid)).toBe(true); // a real, unique uid was minted
		expect(doc.players.some((p) => p.uid === guest.uid)).toBe(false); // not a roster member
		expect(resolveParticipant(doc, guest)).toMatchObject({ name: 'Once-a-year Pal', isGuest: true });
	});

	it('a roster member added as participant resolves live (snapshot ignored)', () => {
		const doc = seed();
		const ally = addPlayer(doc, { name: 'Ally', iconCardCode: '02002' });
		const c = createCampaign(doc, { campaignCode: 'x', title: 'T' });
		// Even passing a stale name, the roster wins.
		const p = addParticipant(doc, c.id, { uid: ally.uid, name: 'STALE', iconCardCode: '99999' })!;
		expect(p.name).toBe('Ally');
		expect(resolveParticipant(doc, p)).toMatchObject({ name: 'Ally', isGuest: false });
	});

	it('rejects an invalid uid and is idempotent on re-add', () => {
		const doc = seed();
		const c = createCampaign(doc, { campaignCode: 'x', title: 'T' });
		expect(addParticipant(doc, c.id, { uid: 'nope', name: 'X' })).toBeUndefined();
		addParticipant(doc, c.id, { uid: 'abc-2de-fgh', name: 'C' });
		addParticipant(doc, c.id, { uid: 'ABC-2DE-FGH', name: 'C again' });
		expect(findCampaign(doc, c.id)!.participants.filter((p) => p.uid === 'ABC-2DE-FGH')).toHaveLength(1);
	});

	it('updateParticipant edits a guest snapshot; removeParticipant orphans their decks', () => {
		const doc = seed();
		const c = createCampaign(doc, { campaignCode: 'x', title: 'T' });
		const g = addParticipant(doc, c.id, { uid: 'abc-2de-fgh', name: 'C', iconCardCode: '01001' })!;
		const deck = addDeck(doc, c.id, { ownerUid: g.uid, investigator: '01001', versions: [] })!;
		updateParticipant(doc, c.id, g.uid, { name: 'Cassidy' });
		expect(findCampaign(doc, c.id)!.participants.find((p) => p.uid === g.uid)!.name).toBe('Cassidy');
		removeParticipant(doc, c.id, g.uid);
		const cc = findCampaign(doc, c.id)!;
		expect(cc.participants.find((p) => p.uid === g.uid)).toBeUndefined();
		expect(cc.decks.find((d) => d.id === deck.id)!.ownerUid).toBeNull();
	});

	it('reassignParticipant swaps a guest for a roster member and remaps decks', () => {
		const doc = seed();
		const ally = addPlayer(doc, { name: 'Ally' });
		const c = createCampaign(doc, { campaignCode: 'x', title: 'T' });
		const g = addParticipant(doc, c.id, { uid: 'abc-2de-fgh', name: 'C' })!;
		const deck = addDeck(doc, c.id, { ownerUid: g.uid, investigator: '01001', versions: [] })!;
		reassignParticipant(doc, c.id, g.uid, ally.uid);
		const cc = findCampaign(doc, c.id)!;
		expect(cc.participants.find((p) => p.uid === g.uid)).toBeUndefined();
		expect(cc.participants.find((p) => p.uid === ally.uid)).toBeDefined();
		expect(cc.decks.find((d) => d.id === deck.id)!.ownerUid).toBe(ally.uid);
	});

	it('reassignParticipant merges when the target is already a participant', () => {
		const doc = seed();
		const c = createCampaign(doc, { campaignCode: 'x', title: 'T' }); // owner is a participant
		const g = addParticipant(doc, c.id, { uid: 'abc-2de-fgh', name: 'C' })!;
		const deck = addDeck(doc, c.id, { ownerUid: g.uid, investigator: '01001', versions: [] })!;
		reassignParticipant(doc, c.id, g.uid, doc.owner.uid); // owner already present → merge
		const cc = findCampaign(doc, c.id)!;
		expect(cc.participants).toHaveLength(1); // just the owner
		expect(cc.decks.find((d) => d.id === deck.id)!.ownerUid).toBe(doc.owner.uid);
	});
});

describe('logs and achievements', () => {
	it('wholesale-replaces logs and deep-copies args', () => {
		const doc = seed();
		const c = createCampaign(doc, { campaignCode: 'x', title: 'T' });
		const args = [{ type: 'number' as const, value: '3' }];
		setCampaignLogs(doc, c.id, [{ key: 'campaign_notes.paths_known', section: 'campaign_notes', args }]);
		const stored = findCampaign(doc, c.id)!.logs;
		expect(stored).toHaveLength(1);
		expect(stored[0].args).not.toBe(args);
		setCampaignLogs(doc, c.id, []);
		expect(findCampaign(doc, c.id)!.logs).toHaveLength(0);
	});

	it('changeCampaignCode swaps the code and clears logs + achievements', () => {
		const doc = seed();
		const c = createCampaign(doc, { campaignCode: 'the_dunwich_legacy', title: 'T' });
		setCampaignLogs(doc, c.id, [{ key: 'k', section: 's', args: [] }]);
		setManualAchievement(doc, c.id, { family: 'f', achievementId: 'a', itemId: null }, true);
		changeCampaignCode(doc, c.id, 'the_path_to_carcosa');
		const after = findCampaign(doc, c.id)!;
		expect(after.campaignCode).toBe('the_path_to_carcosa');
		expect(after.logs).toHaveLength(0);
		expect(after.manualAchievements).toHaveLength(0);
	});

	it('toggles a manual achievement idempotently', () => {
		const doc = seed();
		const c = createCampaign(doc, { campaignCode: 'x', title: 'T' });
		const tick = { family: 'notz', achievementId: 'a1', itemId: null };
		setManualAchievement(doc, c.id, tick, true);
		setManualAchievement(doc, c.id, tick, true);
		expect(findCampaign(doc, c.id)!.manualAchievements).toHaveLength(1);
		setManualAchievement(doc, c.id, tick, false);
		expect(findCampaign(doc, c.id)!.manualAchievements).toHaveLength(0);
	});
});

describe('decks', () => {
	it('adds a deck (sorting versions), assigns owner by uid, and removes it', () => {
		const doc = seed();
		const c = createCampaign(doc, { campaignCode: 'x', title: 'T' });
		const deck = addDeck(doc, c.id, {
			investigator: '01001',
			versions: [
				{ sequenceIndex: 1, ahdbJson: '{}' },
				{ sequenceIndex: 0, ahdbJson: '{}' },
			],
		})!;
		expect(deck.versions.map((v) => v.sequenceIndex)).toEqual([0, 1]);
		expect(deck.investigator.investigatorCode).toBe('01001');
		assignDeckOwner(doc, c.id, deck.id, doc.owner.uid);
		expect(findCampaign(doc, c.id)!.decks[0].ownerUid).toBe(doc.owner.uid);
		removeDeck(doc, c.id, deck.id);
		expect(findCampaign(doc, c.id)!.decks).toHaveLength(0);
	});

	it('assigning a roster owner who is not yet a participant adds them', () => {
		const doc = seed();
		const ally = addPlayer(doc, { name: 'Ally' });
		const c = createCampaign(doc, { campaignCode: 'x', title: 'T' });
		const deck = addDeck(doc, c.id, { investigator: '01001', versions: [] })!;
		assignDeckOwner(doc, c.id, deck.id, ally.uid);
		expect(findCampaign(doc, c.id)!.participants.some((p) => p.uid === ally.uid)).toBe(true);
	});
});

describe('import validation', () => {
	it('accepts a current-version document round-trip', () => {
		const doc = seed();
		createCampaign(doc, { campaignCode: 'x', title: 'T' });
		const round = parseDatabaseDocument(JSON.parse(JSON.stringify(doc)));
		expect(round.campaigns).toHaveLength(1);
	});

	it('rejects junk and any off-version format', () => {
		expect(isDatabaseDocument({ nope: true })).toBe(false);
		expect(() => parseDatabaseDocument({ nope: true })).toThrow(DatabaseImportError);
		// Both a newer and an older (un-migratable) format are rejected.
		const newer = seed() as DatabaseDocument & { formatVersion: number };
		newer.formatVersion = DATABASE_FORMAT_VERSION + 1;
		expect(() => parseDatabaseDocument(newer)).toThrow(DatabaseImportError);
		const older = seed() as DatabaseDocument & { formatVersion: number };
		older.formatVersion = DATABASE_FORMAT_VERSION - 1;
		expect(() => parseDatabaseDocument(older)).toThrow(DatabaseImportError);
	});
});

describe('campaign share round-trip', () => {
	/** Build A's database: owner A, sub-player B, campaign with A, B, and guest C. */
	function databaseA(guestCUid: string) {
		const doc = seed();
		updatePlayer(doc, doc.owner.uid, { name: 'Anna' });
		const b = addPlayer(doc, { name: 'Bryn', iconCardCode: '02002' });
		const c = createCampaign(doc, { campaignCode: 'the_dunwich_legacy', title: 'Our Game' });
		addParticipant(doc, c.id, { uid: b.uid, name: 'Bryn', iconCardCode: '02002' });
		addParticipant(doc, c.id, { uid: guestCUid, name: 'Cass', iconCardCode: '05005' });
		return { doc, campaignId: c.id, bUid: b.uid, aUid: doc.owner.uid };
	}

	it('a stranger (D) importing gets everyone as guests', () => {
		const guestC = 'CCC-2DE-FGH';
		const a = databaseA(guestC);
		const json = serializeCampaignShare(a.doc, a.campaignId)!;

		const docD = createEmptyDatabase({ name: 'Dana' });
		const imported = importCampaignShare(docD, JSON.parse(json));
		expect(docD.campaigns).toHaveLength(1);
		expect(imported.id).not.toBe(a.campaignId); // fresh id
		// Anna, Bryn, Cass are all guests in D's file.
		for (const p of imported.participants) expect(resolveParticipant(docD, p).isGuest).toBe(true);
		expect(imported.participants.map((p) => p.name).sort()).toEqual(['Anna', 'Bryn', 'Cass']);
	});

	it("the matching player (C) importing resolves their own entry live", () => {
		const a = databaseA('CCC-2DE-FGH');
		const json = serializeCampaignShare(a.doc, a.campaignId)!;

		// C's own database; force C's owner uid to match the guest uid A used.
		const docC = createEmptyDatabase({ name: 'Cassidy', iconCardCode: '06006' });
		docC.owner.uid = 'CCC-2DE-FGH';
		const imported = importCampaignShare(docC, JSON.parse(json));

		const cEntry = imported.participants.find((p) => p.uid === 'CCC-2DE-FGH')!;
		const resolved = resolveParticipant(docC, cEntry);
		expect(resolved.isGuest).toBe(false);
		expect(resolved.name).toBe('Cassidy'); // C's current name, not A's "Cass"
		expect(resolved.iconCardCode).toBe('06006');
		// Anna and Bryn remain guests for C.
		const others = imported.participants.filter((p) => p.uid !== 'CCC-2DE-FGH');
		for (const p of others) expect(resolveParticipant(docC, p).isGuest).toBe(true);
	});

	it('rejects a malformed / newer share file', () => {
		const docD = createEmptyDatabase({ name: 'Dana' });
		expect(() => importCampaignShare(docD, { nope: true })).toThrow(CampaignShareError);
		expect(() => importCampaignShare(docD, { shareVersion: 99, campaign: {} })).toThrow(CampaignShareError);
	});
});

describe('play groups', () => {
	it('creates a group with a unique uid and sanitized members (roster-only, deduped, ordered)', () => {
		const doc = seed();
		const bob = addPlayer(doc, { name: 'Bob' });
		const g = createPlayGroup(doc, {
			name: 'Crew',
			memberUids: [bob.uid, bob.uid, 'ZZZ-2DE-FGH', doc.owner.uid],
		});
		expect(g.uid).toMatch(UID_PATTERN);
		// duplicate dropped, non-roster uid dropped, original order preserved
		expect(g.memberUids).toEqual([bob.uid, doc.owner.uid]);
		expect(findPlayGroup(doc, g.uid)).toBe(g);
	});

	it('updates a group name + membership and removes a group', () => {
		const doc = seed();
		const bob = addPlayer(doc, { name: 'Bob' });
		const g = createPlayGroup(doc, { name: 'Crew' });
		updatePlayGroup(doc, g.uid, { name: 'Tuesday Crew', memberUids: [bob.uid] });
		expect(findPlayGroup(doc, g.uid)).toMatchObject({ name: 'Tuesday Crew', memberUids: [bob.uid] });
		removePlayGroup(doc, g.uid);
		expect(findPlayGroup(doc, g.uid)).toBeUndefined();
	});

	it('strips a removed player from every group membership', () => {
		const doc = seed();
		const bob = addPlayer(doc, { name: 'Bob' });
		const g = createPlayGroup(doc, { name: 'Crew', memberUids: [doc.owner.uid, bob.uid] });
		removePlayer(doc, bob.uid);
		expect(findPlayGroup(doc, g.uid)!.memberUids).toEqual([doc.owner.uid]);
	});

	it('shares one uid namespace: generateUniqueUid avoids owner, players AND groups', () => {
		const doc = seed();
		const bob = addPlayer(doc, { name: 'Bob' });
		const g = createPlayGroup(doc, { name: 'Crew' });
		const taken = collectUids(doc);
		expect(taken.has(doc.owner.uid)).toBe(true);
		expect(taken.has(bob.uid)).toBe(true);
		expect(taken.has(g.uid)).toBe(true);
		const fresh = generateUniqueUid(doc);
		expect(taken.has(fresh)).toBe(false);
	});
});
