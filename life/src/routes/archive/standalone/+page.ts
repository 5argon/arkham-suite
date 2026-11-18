import { ensureDatabaseLoaded } from '$lib/database/bootstrap';
import { databaseStore } from '$lib/database/database.svelte';
import {
	EMPTY_STANDALONE_LIST,
	standaloneListData,
	type StandaloneListResult,
	type StandaloneSort
} from '$lib/database/standalone-list';
import { listParam, pageOf, PAGE_SIZE } from '$lib/components/archive/list-url';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ url }): Promise<StandaloneListResult> => {
	await ensureDatabaseLoaded();
	const doc = databaseStore.doc;
	if (!doc) return EMPTY_STANDALONE_LIST;
	return standaloneListData(doc, {
		page: pageOf(url),
		pageSize: PAGE_SIZE,
		name: url.searchParams.get('name') ?? '',
		sort: (url.searchParams.get('sort') ?? 'date') as StandaloneSort,
		sources: listParam(url, 'src'),
		difficulties: listParam(url, 'diff'),
		verdicts: listParam(url, 'verdict')
	});
};
