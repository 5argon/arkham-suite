/**
 * difficulty.ts — shared display helpers for the four campaign difficulty tiers,
 * so every widget that breaks a stat down per difficulty (Resolution chips, the
 * Scenario-XP highscore, EotE's City matrix, …) orders and labels them the SAME
 * way. The *unit* stays each widget's own business (XP, "times", …) — pass it via
 * `fmt` — keeping the look familiar but the wording purpose-appropriate.
 *
 * The tier list is the same `ALL_TIERS` the profile settings track, re-exported
 * here so there's a single source of truth.
 */
import * as m from '$lib/paraglide/messages.js';
import { ALL_TIERS, type DifficultyTier } from './profile-settings';

/** The difficulty tiers, easiest → hardest. */
export const DIFFICULTY_ORDER: readonly DifficultyTier[] = ALL_TIERS;

/** Friendly label for a difficulty id; unknown ids (custom tiers) pass through. */
export function difficultyLabel(tier: string): string {
	return m.shared_difficulty({ tier });
}

/** Abbreviated label (Easy/Std/Hard/Expert) — the compact form for tight tables. */
export function difficultyAbbr(tier: string): string {
	return m.shared_difficulty_abbr({ tier });
}

/** "N time" / "N times" — the pluralizer shared by per-difficulty tally tooltips. */
export function times(n: number): string {
	return m.shared_count_time({ count: n });
}

/**
 * The difficulty tiers present in a per-tier count map, in canonical order: the
 * known tiers (easy→expert) first, then any extra/unknown tiers in insertion
 * order. No value filtering — callers decide whether to drop zero/absent entries.
 */
export function orderedDifficulties(byTier: Record<string, number>): string[] {
	const known: string[] = DIFFICULTY_ORDER.filter((t) => t in byTier);
	const extra = Object.keys(byTier).filter(
		(t) => !(DIFFICULTY_ORDER as readonly string[]).includes(t),
	);
	return [...known, ...extra];
}

/**
 * A per-difficulty breakdown string, e.g. `"Standard 4 times, Hard 1 time"` —
 * known tiers with a positive value first, then extras, each value rendered by
 * `fmt` (so callers pick the unit) and joined by `sep`. `''` when nothing has a
 * positive value.
 */
export function difficultyBreakdown(
	byTier: Record<string, number>,
	fmt: (n: number) => string,
	sep = ', ',
): string {
	return orderedDifficulties(byTier)
		.filter((t) => (byTier[t] ?? 0) > 0)
		.map((t) => `${difficultyLabel(t)} ${fmt(byTier[t])}`)
		.join(sep);
}
