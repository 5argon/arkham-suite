/**
 * How far back a list of recent reviews goes. Light enough for any page to import.
 */
export const recentListLimit = 30;

/**
 * What a row's height depends on, in a list of recent reviews.
 */
export interface RecentRowShape {
	/**
	 * Goes to a review written here, which has no title or creator line of its own.
	 */
	href?: string;
	entry: { title?: string };
	/**
	 * A line each when every one has its card, otherwise one line saying how many.
	 */
	cards: { card?: unknown }[];
}

/**
 * Roughly how many lines of text tall a row is in a half-width column: its title, wrapping at
 * about 42 characters, the creator under it, and its cards.
 */
export function recentRowHeight(row: RecentRowShape): number {
	const external = row.href === undefined;
	const title = external ? Math.max(1, Math.ceil((row.entry.title?.length ?? 0) / 42)) : 1;
	const creator = external ? 1 : 0;
	const cards = row.cards.every((line) => line.card !== undefined) ? row.cards.length * 1.3 : 0.8;
	return title + creator + cards + 0.5;
}

/**
 * How many rows each list side by side shows at first, so they end about as tall: a list is cut
 * short to match another that is full, never under `least` and never over `most`. It may still end
 * up to `fence` times as tall as that one, so a list of big rows doesn't shrink to almost nothing.
 * Next to a list with fewer than `most` rows, which can't fill its side anyway, it shows them all.
 */
export function balancedRecentCounts(
	lists: RecentRowShape[][],
	most = 5,
	least = 3,
	fence = 1.35
): number[] {
	const firsts = lists.map((rows) => Math.min(most, rows.length));
	const heightOf = (rows: RecentRowShape[], count: number) =>
		rows.slice(0, count).reduce((sum, row) => sum + recentRowHeight(row), 0);
	return lists.map((rows, i) => {
		const others = lists.filter((other, j) => j !== i && other.length >= most);
		if (others.length === 0) return firsts[i];
		const target = Math.min(...others.map((other) => heightOf(other, most)));
		let count = Math.min(least, firsts[i]);
		while (count < firsts[i] && heightOf(rows, count + 1) <= target * fence) count++;
		return count;
	});
}
