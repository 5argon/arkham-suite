/**
 * scenario-reward.ts — how a scenario's end-of-scenario reward is worded.
 *
 * ArkhamCards shows EITHER a "Victory display:" counter (it tallies the victory points itself → the
 * value is Victory Points / VP) OR a flat "Experience" total (the scenario adds XP the app can't
 * count, e.g. "+1 per clue on X", so it asks the player for the total → the value is XP). campaign-
 * data records which, per scenario, in `scenarioMeta.victoryDisplay`. These helpers pick the matching
 * label + unit so our editor input and profile widgets read exactly what the player saw in the app.
 */
import * as m from '$lib/paraglide/messages.js';
import { getCampaignLog } from '@5argon/arkham-campaign-data';

// Per-family scenarioId → victoryDisplay, memoised (campaign-data is static).
const cache = new Map<string, Map<string, boolean>>();

/** Whether the scenario tallies the Victory display (VP, `true`) vs a flat Experience total (XP,
 *  `false`), per campaign-data. Defaults to `true` (the common case) when unknown. */
export function isVictoryDisplay(family: string | null | undefined, scenarioId: string): boolean {
	const fam = family ?? '';
	let byId = cache.get(fam);
	if (!byId) {
		byId = new Map();
		for (const sm of getCampaignLog(fam)?.db.scenarioMeta ?? []) {
			if (typeof sm.victoryDisplay === 'boolean') byId.set(sm.id, sm.victoryDisplay);
		}
		cache.set(fam, byId);
	}
	return byId.get(scenarioId) ?? true;
}

/** "{n} VP" / "{n} XP" depending on the reward kind. */
export const rewardUnit = (victoryDisplay: boolean, n: number): string =>
	victoryDisplay ? m.campaign_vp_unit({ vp: n }) : m.campaign_xp_unit({ xp: n });

/** "{tier} {n} VP" / "{tier} {n} XP" — one per-difficulty breakdown entry. */
export const rewardBreakdownEntry = (victoryDisplay: boolean, tier: string, n: number): string =>
	victoryDisplay
		? m.campaign_vp_breakdown_entry({ tier, vp: n })
		: m.campaign_xp_breakdown_entry({ tier, xp: n });

/** The highscore section label — "Victory Display Highscore" / "Experience Highscore". */
export const rewardHighscoreLabel = (victoryDisplay: boolean): string =>
	victoryDisplay ? m.campaign_scenario_vp() : m.campaign_scenario_xp();

/** The bare reward kind, matching the app's input header — "Victory display" / "Experience". */
export const rewardKindLabel = (victoryDisplay: boolean): string =>
	victoryDisplay ? m.campaign_reward_victory_display() : m.campaign_reward_experience();

/** The version-table column header — "VP Highscore" / "XP Highscore". */
export const rewardVersionColumn = (victoryDisplay: boolean): string =>
	victoryDisplay ? m.campaign_version_xp() : m.campaign_version_exp();
