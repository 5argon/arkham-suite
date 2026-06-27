/**
 * tally.ts — accumulator helpers shared by the per-campaign payload builders and the stats layer,
 * so the "bump a count / per-difficulty tally" idiom is written once instead of open-coded per site.
 */
import type { ResolutionTally } from '../outcomes/resolution-coverage';

/** A fresh `{ total: 0, byTier: {} }`. */
export function emptyTally(): ResolutionTally {
	return { total: 0, byTier: {} };
}

/** Add `by` to a tally's total and its per-difficulty (`tier`) count. */
export function bumpTally(t: ResolutionTally, tier: string, by = 1): void {
	t.total += by;
	t.byTier[tier] = (t.byTier[tier] ?? 0) + by;
}

/** Get-or-create the tally at `key` in `map`, ready to bump. */
export function ensureTally(map: Record<string, ResolutionTally>, key: string): ResolutionTally {
	return (map[key] ??= emptyTally());
}

/** Sum two tallies into a new one (totals + per-difficulty). */
export function mergeTally(a: ResolutionTally, b: ResolutionTally): ResolutionTally {
	const out: ResolutionTally = { total: a.total + b.total, byTier: { ...a.byTier } };
	for (const [tier, n] of Object.entries(b.byTier)) out.byTier[tier] = (out.byTier[tier] ?? 0) + n;
	return out;
}

/** Add `by` to a plain code→count map at `key`; returns the new count. */
export function bumpCount(map: Record<string, number>, key: string, by = 1): number {
	return (map[key] = (map[key] ?? 0) + by);
}

/** Increment a code→count map once for every code in a set (e.g. cards recorded this play). */
export function bumpSet(map: Record<string, number>, codes: ReadonlySet<string> | undefined): void {
	if (!codes) return;
	for (const code of codes) bumpCount(map, code);
}
