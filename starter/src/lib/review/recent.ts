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
 * How many rows each list side by side shows at first, so they end about as tall: the taller one
 * shows fewer, never under `least`, and neither more than `most`.
 */
export function balancedRecentCounts(lists: RecentRowShape[][], most = 5, least = 2): number[] {
	const firsts = lists.map((rows) => Math.min(most, rows.length));
	if (lists.length < 2) return firsts;
	const heightOf = (rows: RecentRowShape[], count: number) =>
		rows.slice(0, count).reduce((sum, row) => sum + recentRowHeight(row), 0);
	const target = Math.min(...lists.map((rows, i) => heightOf(rows, firsts[i])));
	return lists.map((rows, i) => {
		let count = Math.min(least, firsts[i]);
		while (count < firsts[i] && heightOf(rows, count + 1) <= target * 1.15) count++;
		return count;
	});
}
