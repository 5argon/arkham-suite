/**
 * How a scenario's reward is worded. ArkhamCards asks either for the Victory display (VP) or, when
 * the scenario adds XP it can't count ("+1 per clue on X"), for a flat Experience total (XP);
 * campaign-data records which in `scenarioMeta.victoryDisplay`.
 */
import * as m from '$lib/paraglide/messages.js';
import { scenarioMeta } from './scenario-meta';

/** True for Victory display (VP), false for a flat Experience total (XP); true when unknown. */
export function isVictoryDisplay(family: string | null | undefined, scenarioId: string): boolean {
	return scenarioMeta(family, scenarioId)?.victoryDisplay ?? true;
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
