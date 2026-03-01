import { redirect } from '@sveltejs/kit';
import { ensureDatabaseLoaded } from '$lib/database/bootstrap';
import { databaseStore } from '$lib/database/database.svelte';
import { campaignDetail, type CampaignDetail } from '$lib/database/repository';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ url }): Promise<CampaignDetail> => {
	// Project the campaign out of the in-browser database.
	await ensureDatabaseLoaded();
	const id = url.searchParams.get('id');
	const doc = databaseStore.doc;
	if (!doc || !id) redirect(302, '/archive');

	const detail = campaignDetail(doc, id);
	if (!detail) redirect(302, '/archive');
	return detail;
};
