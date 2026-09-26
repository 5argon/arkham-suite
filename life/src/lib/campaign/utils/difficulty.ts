/** Labels and ordering for the four difficulty tiers, shared by every per-difficulty breakdown. */
import * as m from '$lib/paraglide/messages.js';
import { ALL_TIERS, type DifficultyTier } from '../profile/profile-settings';
import type { Tally } from './tally';

/** Easiest to hardest. */
export const DIFFICULTY_ORDER: readonly DifficultyTier[] = ALL_TIERS;

/** Unknown tier ids pass through. */
export function difficultyLabel(tier: string): string {
	return m.shared_difficulty({ tier });
}

/** Easy / Std / Hard / Expert, for tight tables. */
export function difficultyAbbr(tier: string): string {
	return m.shared_difficulty_abbr({ tier });
}

/** "1 time" / "N times", the unit of a per-difficulty count breakdown. */
export function nTimes(n: number): string {
	return m.shared_count_time({ count: n });
}

/** The tiers present in a per-tier map: known tiers in order, then unknown ones as they appear. */
export function orderedDifficulties(byTier: Record<string, number>): string[] {
	const known: string[] = DIFFICULTY_ORDER.filter((t) => t in byTier);
	const extra = Object.keys(byTier).filter((t) => !(DIFFICULTY_ORDER as readonly string[]).includes(t));
	return [...known, ...extra];
}

/** e.g. "Standard 4 times, Hard 1 time" — positive tiers only, each value rendered by `fmt`. */
export function difficultyBreakdown(
	byTier: Record<string, number>,
	fmt: (n: number) => string = nTimes,
	sep = ', '
): string {
	return orderedDifficulties(byTier)
		.filter((t) => (byTier[t] ?? 0) > 0)
		.map((t) => `${difficultyLabel(t)} ${fmt(byTier[t])}`)
		.join(sep);
}

/** A tally's hover line: `zero()` when never reached, else `some(times)` plus a per-tier breakdown
 *  when more than one tier is involved. */
export function tallyDetail(
	t: Tally | undefined,
	zero: () => string,
	some: (times: string) => string
): string {
	const c = t?.total ?? 0;
	if (c === 0) return zero();
	const base = some(nTimes(c));
	const bd =
		t && Object.keys(t.byTier).length > 1
			? difficultyBreakdown(t.byTier, (n) => `×${n}`, ' · ')
			: '';
	return bd ? `${base} · ${bd}` : base;
}
