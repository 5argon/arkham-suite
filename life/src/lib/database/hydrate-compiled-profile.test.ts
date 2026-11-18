import { describe, expect, it } from 'vitest';
import { addDeck, createCampaign, createEmptyDatabase } from './document';
import { ACCOUNT_SUBJECT } from './profile-cache';
import { buildSubjectPayload } from './profile-local';
import { makeCompiledProfileFile, parseCompiledProfileFile } from './compiled-profile';
import { hydrateCompiledProfile } from './hydrate-compiled-profile';

/** One AhdbDeck version JSON with the given in-play slots. */
function version(slots: Record<string, number>) {
	return [{ sequenceIndex: 0, ahdbJson: JSON.stringify({ slots }) }];
}

/** A small account with two campaign families + decks, so the built payload carries
 *  real (campaign-data-resolved) English in the structures the stripper drops. */
function build() {
	const doc = createEmptyDatabase({ name: 'Anna' });
	const c1 = createCampaign(doc, { campaignCode: 'notz', title: 'Zealot Run' });
	addDeck(doc, c1.id, { ownerUid: doc.owner.uid, investigator: '01001', versions: version({ '01021': 2 }) });
	const c2 = createCampaign(doc, { campaignCode: 'eote', title: 'Edge Run' });
	addDeck(doc, c2.id, { ownerUid: doc.owner.uid, investigator: '09004', versions: version({ '01087': 1 }) });
	return doc;
}

describe('hydrateCompiledProfile', () => {
	it('round-trips: strip → file → JSON → hydrate reproduces the built payload exactly', () => {
		const doc = build();
		const built = buildSubjectPayload(doc, ACCOUNT_SUBJECT);

		// Sanity: the built payload really does carry English-bearing structures (so the
		// round-trip is meaningfully exercising the re-resolution, not comparing empties).
		expect(built.achievements.families.length).toBeGreaterThan(0);
		expect(built.achievements.families[0].name).toBeTruthy();
		expect(built.achievements.families[0].achievements[0].title).toBeTruthy();
		expect(built.endings.length).toBeGreaterThan(0);
		expect(built.endings[0].endings[0].text).toBeTruthy();
		expect(built.clearGrid[0].name).toBeTruthy();

		const file = makeCompiledProfileFile(built.subject, built, '2026-01-01T00:00:00.000Z');
		// The artifact has the English stripped...
		expect(JSON.stringify(file.profile)).not.toContain(built.achievements.families[0].name);
		// ...and hydrating the (JSON-round-tripped) file restores the exact built payload.
		const parsed = parseCompiledProfileFile(JSON.parse(JSON.stringify(file)));
		const hydrated = hydrateCompiledProfile(parsed);
		expect(hydrated).toEqual(built);
	});

	it('rejects formats older than the current blob shapes', () => {
		const doc = build();
		const built = buildSubjectPayload(doc, ACCOUNT_SUBJECT);
		const file = { ...makeCompiledProfileFile(built.subject, built, '2026-01-01T00:00:00.000Z'), v: 58 };
		expect(() => parseCompiledProfileFile(JSON.parse(JSON.stringify(file)))).toThrow();
	});
});
