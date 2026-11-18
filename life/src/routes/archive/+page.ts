import { ensureDatabaseLoaded } from '$lib/database/bootstrap';
import { databaseStore } from '$lib/database/database.svelte';
import {
	EMPTY_LIST,
	listData,
	type ListResult,
	type ListSort,
	type OutcomeFilter
} from '$lib/database/archive-list';
import type { SoloType } from '$lib/database/document';
import { listParam, pageOf, PAGE_SIZE } from '$lib/components/archive/list-url';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ url }): Promise<ListResult> => {
	await ensureDatabaseLoaded();
	const doc = databaseStore.doc;
	if (!doc) return EMPTY_LIST;
	return listData(doc, {
		page: pageOf(url),
		pageSize: PAGE_SIZE,
		name: url.searchParams.get('name') ?? '',
		sort: (url.searchParams.get('sort') ?? 'date') as ListSort,
		campaigns: listParam(url, 'camp'),
		players: listParam(url, 'who'),
		investigators: listParam(url, 'inv'),
		outcomes: listParam(url, 'outcome') as OutcomeFilter[],
		playerCounts: listParam(url, 'pc')
			.map(Number)
			.filter((n) => !Number.isNaN(n)),
		solo: listParam(url, 'solo') as SoloType[]
	});
};
