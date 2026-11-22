import { describe, expect, it } from 'vitest';
import type { RecordedCampaignState } from '@5argon/arkham-campaign-data';
import type { CampaignRecord } from '../records/campaign-record';
import { buildBoa } from './boa';

const k = (id: string) => (id.includes('.') ? id : `campaign_notes.${id}`);

function rec(difficulty: string, logs: string[]): CampaignRecord {
	const recorded: RecordedCampaignState = {
		difficulty,
		recordedLogs: new Set(logs.map(k)),
		crossedLogs: new Set(),
		recordedSectionItems: {}
	};
	return { campaignCode: 'boa', recorded, manual: new Set() };
}

// A: standard. Pursuer defeated, university saved. Interrogated Cornelia, Naomi and Abigail, held the
// Servant (Margaret) who escaped; the search failed. Unmasked Margaret in the finale, stopped the rebirth.
const A = rec('standard', [
	'defeated_their_masked_pursuer',
	'saved_miskatonic_university',
	'hidden.smoke_and_mirrors_2',
	'hidden.smoke_and_mirrors_3',
	'hidden.smoke_and_mirrors_5',
	'hidden.smoke_and_mirrors_phi',
	'hidden.servant_of_flame_beaneath_act',
	'margaret_harbinger',
	'failed_in_their_search',
	'the_servant_of_flame_escaped',
	'hidden.queen_of_ash_phi',
	'stopped_elokoss_glorious_rebirth'
]);
// B: hard. The university burned. Killed the Servant (David), interrogated everyone else, scoured
// Arkham and found the cult; flooded the ritual.
const B = rec('hard', [
	'miskatonic_university_burned',
	'hidden.smoke_and_mirrors_2',
	'hidden.smoke_and_mirrors_3',
	'hidden.smoke_and_mirrors_4',
	'hidden.smoke_and_mirrors_5',
	'hidden.smoke_and_mirrors_6',
	'killed_the_servant_of_flame',
	'david_harbinger',
	'scoured_arkham_for_answers',
	'discovered_the_cults_whereabouts',
	'flooded_the_ritual'
]);
// C: standard, still in Spreading Flames.
const C = rec('standard', ['miskatonic_university_burned']);

describe('buildBoa', () => {
	const b = buildBoa([A, B, C])!;

	it('counts the harbinger and the suspects interrogated', () => {
		expect(b.plays).toBe(3);
		expect(b.suspects.margaret.harbinger.total).toBe(1);
		expect(b.suspects.margaret.unmaskedInFinale.total).toBe(1);
		expect(b.suspects.david.harbinger.byTier).toEqual({ hard: 1 });
		expect(b.suspects.david.unmaskedInFinale.total).toBe(0); // killed in Smoke and Mirrors
		expect(b.suspects.cornelia.interrogated.total).toBe(2);
		expect(b.suspects.david.interrogated.total).toBe(0);
		expect(b.smokeAndMirrors.totalInterrogated).toBe(8);
		expect(b.smokeAndMirrors.bestInterrogated).toEqual([
			{ tier: 'standard', interrogated: 3 },
			{ tier: 'hard', interrogated: 5 }
		]);
	});

	it("follows the Servant of Flame's fate", () => {
		expect(b.servant.defeatedInSpreadingFlames.total).toBe(1);
		expect(b.servant.killed.total).toBe(1);
		expect(b.servant.escaped.total).toBe(1);
		expect(b.servant.unmaskedInFinale.total).toBe(1);
	});

	it('scopes the Queen of Ash setup to plays that reached it', () => {
		expect(b.smokeAndMirrors.played.total).toBe(2);
		expect(b.queenOfAsh.stoppedRebirth.total).toBe(1);
		expect(b.queenOfAsh.floodedRitual.total).toBe(1);
		expect(b.queenOfAsh.headStart.byTier).toEqual({ hard: 1 });
		expect(b.queenOfAsh.extraDoom.byTier).toEqual({ standard: 1 });
		expect(b.queenOfAsh.ambushed.total).toBe(0);
		expect(b.spreadingFlames.burned.total).toBe(2);
		expect(b.spreadingFlames.pursuerGotAway.total).toBe(2); // B and C burned without R1
	});
});
