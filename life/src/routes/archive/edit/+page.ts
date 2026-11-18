import { redirect } from '@sveltejs/kit';
import { ensureDatabaseLoaded } from '$lib/database/bootstrap';
import { databaseStore } from '$lib/database/database.svelte';
import { findRecord } from '$lib/database/document';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ url }) => {
	await ensureDatabaseLoaded();
	const id = url.searchParams.get('id');
	const doc = databaseStore.doc;
	if (!doc || !id || !findRecord(doc, id)) redirect(302, '/archive');
	return { id };
};
