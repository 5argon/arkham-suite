import { describe, expect, it } from 'vitest';
import type { RecordedCampaignState } from '@5argon/arkham-campaign-data';
import type { CampaignRecord } from '../achievements/achievement-aggregate';
import { buildNotz } from './notz';

const k = (id: string) => `campaign_notes.${id}`;

function rec(opts: {
	difficulty?: string;
	logs?: string[];
	crossed?: string[];
	interrogated?: string[];
	escaped?: string[];
	coreOnly?: boolean;
	inv?: string[];
}): CampaignRecord {
	const recorded: RecordedCampaignState = {
		difficulty: opts.difficulty ?? 'standard',
		recordedLogs: new Set((opts.logs ?? []).map(k)),
		crossedLogs: new Set((opts.crossed ?? []).map(k)),
		recordedSectionItems: {
			cultists_interrogated: new Set(opts.interrogated ?? []),
			cultists_escaped: new Set(opts.escaped ?? [])
		}
	};
	return {
		campaignCode: 'notz',
		recorded,
		manual: new Set(),
		coreOnly: opts.coreOnly,
		subjectInvestigators: opts.inv
	};
}

// A: standard, core-only, won (ritual broken); Ghoul Priest survived; caught 2 / escaped 1; past midnight.
const A = rec({
	difficulty: 'standard',
	logs: ['house_standing', 'ghoul_priest_alive', 'past_midnight', 'ritual_broken'],
	interrogated: ['01137', '01138'],
	escaped: ['01139'],
	coreOnly: true,
	inv: ['01001']
});
// B: hard, NOT core-only, won (Umôrdhoth repelled); Ghoul Priest slain (crossed); Lita found others; caught 4.
const B = rec({
	difficulty: 'hard',
	logs: ['house_burned', 'ghoul_priest_alive', 'lita_finds_others', 'umordhoth_repelled'],
	crossed: ['ghoul_priest_alive'],
	interrogated: ['01137', '01138', '01139', '01140'],
	coreOnly: false,
	inv: ['01002']
});
// C: standard, core-only, LOST (Arkham succumbed) — a clear-less run.
const C = rec({
	difficulty: 'standard',
	logs: ['house_standing', 'arkham_succumbed'],
	coreOnly: true,
	inv: ['01001']
});

describe('buildNotz', () => {
	const [n] = buildNotz([A, B, C]);

	it('returns a single blob covering every notz record', () => {
		expect(n.plays).toBe(3);
		expect(n.wins).toBe(2); // A + B; C lost
	});

	it('tallies The Gathering per difficulty, with Lita recruited derived from the absence of lita_finds_others', () => {
		expect(n.gathering.houseStanding.total).toBe(2); // A + C
		expect(n.gathering.houseStanding.byTier).toEqual({ standard: 2 });
		expect(n.gathering.houseBurned.total).toBe(1); // B (hard)
		expect(n.gathering.litaRecruited.total).toBe(2); // A + C reached the Gathering without finding others
		expect(n.gathering.litaFindsOthers.total).toBe(1); // B
	});

	it('splits the Ghoul Priest by the crossed-off state (slain vs survived to stalk you)', () => {
		expect(n.gathering.ghoulPriestSlain.total).toBe(1); // B — recorded AND crossed
		expect(n.gathering.ghoulPriestSlain.byTier).toEqual({ hard: 1 });
		expect(n.gathering.ghoulPriestSurvived.total).toBe(1); // A — recorded, not crossed
		expect(n.gathering.ghoulPriestSurvived.byTier).toEqual({ standard: 1 });
	});

	it('tracks the per-cultist manhunt, lifetime totals, and the best single-play haul', () => {
		expect(n.midnightMasks.perCultist['01137'].caught.total).toBe(2); // A + B
		expect(n.midnightMasks.perCultist['01139'].caught.total).toBe(1); // B
		expect(n.midnightMasks.perCultist['01139'].escaped.total).toBe(1); // A
		expect(n.midnightMasks.perCultist['01141'].caught.total).toBe(0); // never seen
		expect(n.midnightMasks.totalInterrogated).toBe(6); // 2 + 4
		expect(n.midnightMasks.totalEscaped).toBe(1);
		expect(n.midnightMasks.playsWithEscapes.total).toBe(1); // A
		expect(n.midnightMasks.bestHaul.total).toBe(4); // B's four
		expect(n.midnightMasks.bestHaul.byTier).toEqual({ standard: 2, hard: 4 });
		expect(n.midnightMasks.pastMidnight.total).toBe(1);
	});

	it('tallies the finale endings', () => {
		expect(n.devourerBelow.ritualBroken.total).toBe(1); // A
		expect(n.devourerBelow.umordhothRepelled.total).toBe(1); // B
		expect(n.devourerBelow.arkhamSuccumbed.total).toBe(1); // C
		expect(n.devourerBelow.litaSacrificed.total).toBe(0);
	});

	it('counts only WON, core-only clears in the purist feat (and their investigators)', () => {
		// A: won + core-only ✓. B: won but not core-only ✗. C: core-only but lost ✗.
		expect(n.purist.coreOnlyClears.total).toBe(1);
		expect(n.purist.coreOnlyClears.byTier).toEqual({ standard: 1 });
		expect(n.purist.investigators['01001'].total).toBe(1);
		expect(n.purist.investigators['01002']).toBeUndefined();
	});
});
