import { ensureDatabaseLoaded } from '$lib/database/bootstrap';
import { databaseStore } from '$lib/database/database.svelte';
import {
	listData,
	type FilterOptions,
	type ListResult,
	type OutcomeFilter,
	type SoloFilter
} from '$lib/database/repository';
import type { PageLoad } from './$types';

const EMPTY_OPTIONS: FilterOptions = {
	campaigns: [],
	players: [],
	investigators: [],
	playerCounts: [],
	soloTypes: []
};

/** Parse a comma-separated multi-select query param into a trimmed string list. */
function list(url: URL, key: string): string[] {
	const raw = url.searchParams.get(key);
	return raw ? raw.split(',').filter(Boolean) : [];
}

export const load: PageLoad = async ({ url }) => {
	// Project the in-browser database into the list shape.
	await ensureDatabaseLoaded();
	const doc = databaseStore.doc;
	// Typed as ListResult so the load's two return branches share one type (keeps
	// data.filterOptions required, not `| undefined`, in the component).
	if (!doc) {
		const empty: ListResult = {
			campaigns: [],
			totalCount: 0,
			cardsByCode: {},
			filterOptions: EMPTY_OPTIONS,
			filteredIds: []
		};
		return empty;
	}

	return listData(doc, {
		page: Math.max(1, Number(url.searchParams.get('page') ?? '1')),
		pageSize: 20,
		name: url.searchParams.get('name') ?? '',
		sort: (url.searchParams.get('sort') ?? 'date') as 'date' | 'campaign' | 'difficulty',
		campaigns: list(url, 'camp'),
		players: list(url, 'who'),
		investigators: list(url, 'inv'),
		outcomes: list(url, 'outcome') as OutcomeFilter[],
		playerCounts: list(url, 'pc')
			.map(Number)
			.filter((n) => !Number.isNaN(n)),
		solo: list(url, 'solo') as SoloFilter[]
	});
};
