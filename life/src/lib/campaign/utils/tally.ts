/** Accumulators shared by the per-campaign builders and the stats layer. */

/** A count with its per-difficulty breakdown, e.g. `{ total: 5, byTier: { standard: 4, hard: 1 } }`. */
export interface Tally {
	total: number;
	byTier: Record<string, number>;
}

export function emptyTally(): Tally {
	return { total: 0, byTier: {} };
}

export function bumpTally(t: Tally, tier: string, by = 1): void {
	t.total += by;
	t.byTier[tier] = (t.byTier[tier] ?? 0) + by;
}

/** The tally at `key`, created empty when missing. */
export function ensureTally(map: Record<string, Tally>, key: string): Tally {
	return (map[key] ??= emptyTally());
}

export function mergeTally(a: Tally, b: Tally): Tally {
	const out: Tally = { total: a.total + b.total, byTier: { ...a.byTier } };
	for (const [tier, n] of Object.entries(b.byTier)) out.byTier[tier] = (out.byTier[tier] ?? 0) + n;
	return out;
}

/** Adds `by` to `map[key]` and returns the new count. */
export function bumpCount(map: Record<string, number>, key: string, by = 1): number {
	return (map[key] = (map[key] ?? 0) + by);
}

/** The highest and lowest of the values recorded so far; null until one is. */
export interface Extent {
	max: number | null;
	min: number | null;
}

export function extentOf(values: Iterable<number | null | undefined>): Extent {
	let max: number | null = null;
	let min: number | null = null;
	for (const v of values) {
		if (v == null) continue;
		max = max === null ? v : Math.max(max, v);
		min = min === null ? v : Math.min(min, v);
	}
	return { max, min };
}

/** Newest first by finish date (undated last), keeping at most `cap`. */
export function recentFirst<T extends { finishDate: number | null }>(items: T[], cap = Infinity): T[] {
	return [...items].sort((a, b) => (b.finishDate ?? 0) - (a.finishDate ?? 0)).slice(0, cap);
}
