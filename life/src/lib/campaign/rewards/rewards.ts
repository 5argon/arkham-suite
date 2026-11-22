/** Which campaign reward cards the subject unlocked, how often and on which difficulty. */
import { getCampaignLog } from '@5argon/arkham-campaign-data';
import { readPlay, type Play } from '../records/play';
import { REWARDS, type RewardDef } from './reward-defs';
import type { CampaignRecord } from '../records/campaign-record';
import { orderedDifficulties } from '../utils/difficulty';
import { bumpTally, emptyTally, type Tally } from '../utils/tally';

/** Plays of one reward's catalogue that earned it, per difficulty. */
export function tallyReward(reward: RewardDef, plays: readonly Play[]): Tally {
	const t = emptyTally();
	for (const p of plays) if (reward.earned(p)) bumpTally(t, p.tier);
	return t;
}

/** A reward earned on one difficulty. Some players only use a reward on the difficulty they earned it. */
export interface RewardTier {
	tier: string;
	plays: number;
	/** The earliest finish date among those plays; null when none is dated. */
	firstDate: number | null;
}

export interface RewardUnlock {
	code: string;
	catalogue: string;
	scenario: string;
	/** Plays that earned it, per difficulty. */
	earned: Tally;
	/** Each difficulty it was earned on, in difficulty order. */
	tiers: RewardTier[];
	/** The earliest finish date among those plays; null when none is dated. */
	firstDate: number | null;
}

const earlier = (a: number | null, b: number | null) =>
	a == null ? b : b == null ? a : Math.min(a, b);

/** Every reward, unlocked or not, over the subject's campaign plays, Standalone Archives and side
 *  stories played inside campaigns. */
export function buildRewards(records: readonly CampaignRecord[]): RewardUnlock[] {
	const byCatalogue = new Map<string, Play[]>();
	for (const rec of records) {
		const catalogue = getCampaignLog(rec.campaignCode)?.db.code;
		if (!catalogue || !REWARDS.some((r) => r.catalogue === catalogue)) continue;
		const plays = byCatalogue.get(catalogue) ?? [];
		plays.push(readPlay(rec));
		byCatalogue.set(catalogue, plays);
	}
	return REWARDS.map((r) => {
		const earned = emptyTally();
		const firstByTier: Record<string, number | null> = {};
		for (const p of byCatalogue.get(r.catalogue) ?? []) {
			if (!r.earned(p)) continue;
			bumpTally(earned, p.tier);
			firstByTier[p.tier] = earlier(firstByTier[p.tier] ?? null, p.rec.finishDate ?? null);
		}
		const tiers = orderedDifficulties(earned.byTier).map((tier) => ({
			tier,
			plays: earned.byTier[tier],
			firstDate: firstByTier[tier] ?? null
		}));
		const firstDate = tiers.reduce<number | null>((d, t) => earlier(d, t.firstDate), null);
		return { code: r.code, catalogue: r.catalogue, scenario: r.scenario, earned, tiers, firstDate };
	});
}
