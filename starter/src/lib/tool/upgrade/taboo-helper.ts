import type { Taboo, TabooLists } from '@5argon/arkham-kohaku';

/**
 * Get the latest (most recent) taboo list from the taboo lists.
 */
export function getLatestTaboo(tabooLists: TabooLists): Taboo | null {
	if (tabooLists.length === 0) return null;

	// Sort by date_start descending to get the latest
	const sorted = [...tabooLists].sort((a, b) => {
		return new Date(b.date_start).getTime() - new Date(a.date_start).getTime();
	});

	return sorted[0];
}
