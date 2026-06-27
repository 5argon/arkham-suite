import { ensureDatabaseLoaded } from '$lib/database/bootstrap';
import { databaseStore } from '$lib/database/database.svelte';
import { standaloneListData, type StandaloneListResult } from '$lib/database/repository';
import type { PageLoad } from './$types';

const EMPTY: StandaloneListResult = {
	items: [],
	totalCount: 0,
	filteredIds: [],
	cardsByCode: {},
	filterOptions: { sources: [], difficulties: [], verdicts: [] },
};

/** Parse a comma-separated multi-select query param into a trimmed string list. */
function list(url: URL, key: string): string[] {
	const raw = url.searchParams.get(key);
	return raw ? raw.split(',').filter(Boolean) : [];
}

/** The standalone-archive list — same URL-param shape (name/sort/page + facets) as
 *  the campaign list, so the shared ArchiveListView drives both identically. */
export const load: PageLoad = async ({ url }): Promise<StandaloneListResult> => {
	await ensureDatabaseLoaded();
	const doc = databaseStore.doc;
	if (!doc) return EMPTY;
	return standaloneListData(doc, {
		page: Math.max(1, Number(url.searchParams.get('page') ?? '1')),
		pageSize: 20,
		name: url.searchParams.get('name') ?? '',
		sort: (url.searchParams.get('sort') ?? 'date') as 'date' | 'name' | 'difficulty',
		sources: list(url, 'src'),
		difficulties: list(url, 'diff'),
		verdicts: list(url, 'verdict'),
	});
};
