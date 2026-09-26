/** The archive lists keep their search, sort, page and facet filters in the URL. */
export const PAGE_SIZE = 20;

/** A comma-separated multi-select query param. */
export function listParam(url: URL, key: string): string[] {
	const raw = url.searchParams.get(key);
	return raw ? raw.split(',').filter(Boolean) : [];
}

export function pageOf(url: URL): number {
	return Math.max(1, Number(url.searchParams.get('page') ?? '1') || 1);
}

export function activeFilterCount(url: URL, keys: readonly string[]): number {
	return keys.reduce((n, k) => n + listParam(url, k).length, 0);
}

/** A filter modal's unapplied selections, one set per facet key. */
export type FilterDrafts<K extends string> = Record<K, Set<string>>;

export function draftsFromUrl<K extends string>(url: URL, keys: readonly K[]): FilterDrafts<K> {
	return Object.fromEntries(keys.map((k) => [k, new Set(listParam(url, k))])) as FilterDrafts<K>;
}

export function toggleDraft<D extends FilterDrafts<string>>(
	drafts: D,
	key: keyof D & string,
	value: string
): D {
	const next = new Set(drafts[key]);
	if (next.has(value)) next.delete(value);
	else next.add(value);
	return { ...drafts, [key]: next };
}

/** The query string with these facet selections applied, back on page 1. */
export function withFilters(url: URL, drafts: Partial<Record<string, Iterable<string>>>): string {
	const sp = new URLSearchParams(url.searchParams);
	for (const [key, values] of Object.entries(drafts)) {
		const joined = [...(values ?? [])].join(',');
		if (joined) sp.set(key, joined);
		else sp.delete(key);
	}
	sp.set('page', '1');
	return sp.toString();
}

export function withoutFilters(url: URL, keys: readonly string[]): string {
	return withFilters(url, Object.fromEntries(keys.map((k) => [k, []])));
}
