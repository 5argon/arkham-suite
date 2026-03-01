import { describe, expect, it } from 'vitest';

import {
	addDeck,
	addParticipant,
	addPlayer,
	createCampaign,
	createEmptyDatabase,
	createPlayGroup,
	setCampaignLogs,
	updateCampaignGeneral,
} from './document';
import { ACCOUNT_SUBJECT } from './profile-cache';
import { buildSubjectPayload, segmentSignatures } from './profile-local';

/** One AhdbDeck version JSON with the given in-play slots. */
function version(slots: Record<string, number>) {
	return [{ sequenceIndex: 0, ahdbJson: JSON.stringify({ slots }) }];
}

/**
 * Owner Anna (A) + sub-player Bob (B). Campaign C1: only A, with A's deck
 * (card 01021). Campaign C2: A + B, with B's deck (card 01088).
 */
function build() {
	const doc = createEmptyDatabase({ name: 'Anna' });
	const bob = addPlayer(doc, { name: 'Bob' });
	const c1 = createCampaign(doc, { campaignCode: 'notz', title: 'C1' });
	addDeck(doc, c1.id, { ownerUid: doc.owner.uid, investigator: '01001', versions: version({ '01021': 2 }) });
	const c2 = createCampaign(doc, { campaignCode: 'notz', title: 'C2' });
	addParticipant(doc, c2.id, { uid: bob.uid, name: 'Bob', iconCardCode: '01001' });
	addDeck(doc, c2.id, { ownerUid: bob.uid, investigator: '01002', versions: version({ '01088': 1 }) });
	return { doc, aUid: doc.owner.uid, bUid: bob.uid, c1, c2 };
}

describe('subject-scoped payloads', () => {
	it('the account subject sees every campaign and every deck', () => {
		const { doc } = build();
		const p = buildSubjectPayload(doc, ACCOUNT_SUBJECT);
		expect(p.campaigns).toHaveLength(2);
		expect(p.cardUsage['01021']).toBe(1);
		expect(p.cardUsage['01088']).toBe(1);
	});

	it('a player sees only campaigns they were in, and only their own decks', () => {
		const { doc, aUid, bUid } = build();

		const a = buildSubjectPayload(doc, aUid);
		expect(a.campaigns).toHaveLength(2); // A is in C1 and C2
		expect(a.cardUsage['01021']).toBe(1); // A's deck
		expect(a.cardUsage['01088']).toBeUndefined(); // B's deck excluded
		expect(a.playedCardCodes).toContain('01021');
		expect(a.playedCardCodes).not.toContain('01088');

		const b = buildSubjectPayload(doc, bUid);
		expect(b.campaigns).toHaveLength(1); // B is only in C2
		expect(b.cardUsage['01088']).toBe(1);
		expect(b.cardUsage['01021']).toBeUndefined();
	});

	it('a play group unions its members; an unknown subject is empty', () => {
		const { doc, aUid, bUid } = build();
		const group = createPlayGroup(doc, { name: 'Crew', memberUids: [aUid, bUid] });

		const g = buildSubjectPayload(doc, group.uid);
		expect(g.campaigns).toHaveLength(2);
		expect(g.cardUsage['01021']).toBe(1);
		expect(g.cardUsage['01088']).toBe(1);

		const empty = buildSubjectPayload(doc, 'ZZZ-2DE-FGH');
		expect(empty.campaigns).toHaveLength(0);
		expect(empty.cardUsage).toEqual({});
	});
});

describe('baked subject identity (renders the header without the live doc)', () => {
	it('bakes account / player / group / unknown identity into the payload', () => {
		const { doc, aUid, bUid } = build();
		const group = createPlayGroup(doc, { name: 'Crew', memberUids: [aUid, bUid] });

		const account = buildSubjectPayload(doc, ACCOUNT_SUBJECT).subject;
		expect(account).toMatchObject({ kind: 'account', uid: ACCOUNT_SUBJECT, name: 'Anna' });

		const player = buildSubjectPayload(doc, bUid).subject;
		expect(player).toMatchObject({ kind: 'player', uid: bUid, name: 'Bob' });

		const g = buildSubjectPayload(doc, group.uid).subject;
		expect(g).toMatchObject({ kind: 'group', uid: group.uid, name: 'Crew' });
		expect(g.members.map((mem) => mem.name)).toEqual(['Anna', 'Bob']);
		expect(g.iconCardCode).toBeNull();

		const unknown = buildSubjectPayload(doc, 'ZZZ-2DE-FGH').subject;
		expect(unknown.kind).toBe('unknown');
	});
});

describe('displayInProfile gates campaign existence, never statistics', () => {
	it('a Hidden campaign drops from the calendar + campaigns list but still aggregates stats', () => {
		const { doc, c1 } = build();
		const before = buildSubjectPayload(doc, ACCOUNT_SUBJECT);
		expect(before.campaigns).toHaveLength(2);
		expect(before.calendar).toHaveLength(2);
		expect(before.cardUsage['01021']).toBe(1); // c1's deck card

		updateCampaignGeneral(doc, c1.id, { displayInProfile: 'hidden' });
		const after = buildSubjectPayload(doc, ACCOUNT_SUBJECT);
		expect(after.campaigns.map((c) => c.id)).not.toContain(c1.id); // existence hidden
		expect(after.calendar.find((e) => e.campaignId === c1.id)).toBeUndefined();
		expect(after.cardUsage['01021']).toBe(1); // …but stats still count it
	});

	it('the account default hides Default archives; explicit Visible overrides', () => {
		const { doc, c2 } = build(); // both campaigns are created on 'default'
		doc.profileSettings = JSON.stringify({ defaultArchiveDisplayInProfile: 'hidden' });
		expect(buildSubjectPayload(doc, ACCOUNT_SUBJECT).campaigns).toHaveLength(0);

		updateCampaignGeneral(doc, c2.id, { displayInProfile: 'visible' });
		expect(buildSubjectPayload(doc, ACCOUNT_SUBJECT).campaigns.map((c) => c.id)).toEqual([c2.id]);
	});

	it('a visibility edit or default change invalidates ONLY the meta signature', () => {
		const { doc, c1 } = build();
		const s0 = segmentSignatures(doc, ACCOUNT_SUBJECT);
		updateCampaignGeneral(doc, c1.id, { displayInProfile: 'hidden' });
		const s1 = segmentSignatures(doc, ACCOUNT_SUBJECT);
		expect(s1.meta).not.toBe(s0.meta);
		expect(s1.cards).toBe(s0.cards);
		expect(s1.logs).toBe(s0.logs);

		doc.profileSettings = JSON.stringify({ defaultArchiveDisplayInProfile: 'hidden' });
		const s2 = segmentSignatures(doc, ACCOUNT_SUBJECT);
		expect(s2.meta).not.toBe(s1.meta);
	});
});

describe('segment signatures (partial-recompute change detection)', () => {
	it('a date-only edit changes ONLY the meta signature', () => {
		const { doc, c1 } = build();
		const s0 = segmentSignatures(doc, ACCOUNT_SUBJECT);
		updateCampaignGeneral(doc, c1.id, { finishDate: 1_700_000_000_000 });
		const s1 = segmentSignatures(doc, ACCOUNT_SUBJECT);
		expect(s1.meta).not.toBe(s0.meta);
		expect(s1.logs).toBe(s0.logs);
		expect(s1.cards).toBe(s0.cards);
	});

	it('a deck edit changes ONLY the (expensive) cards signature', () => {
		const { doc, c2, aUid } = build();
		const s0 = segmentSignatures(doc, ACCOUNT_SUBJECT);
		addDeck(doc, c2.id, { ownerUid: aUid, investigator: '01001', versions: version({ '01030': 1 }) });
		const s1 = segmentSignatures(doc, ACCOUNT_SUBJECT);
		expect(s1.cards).not.toBe(s0.cards);
		expect(s1.meta).toBe(s0.meta);
		expect(s1.logs).toBe(s0.logs);
	});

	it('a log edit changes logs + meta (calendar state is log-derived) but NOT cards', () => {
		const { doc, c1 } = build();
		const s0 = segmentSignatures(doc, ACCOUNT_SUBJECT);
		setCampaignLogs(doc, c1.id, [{ key: 'k', section: 's', args: [{ type: 'number', value: '1' }] }]);
		const s1 = segmentSignatures(doc, ACCOUNT_SUBJECT);
		expect(s1.logs).not.toBe(s0.logs);
		expect(s1.meta).not.toBe(s0.meta);
		expect(s1.cards).toBe(s0.cards);
	});
});
