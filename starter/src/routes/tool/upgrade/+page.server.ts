import type { PageServerLoad } from './$types';
import {
	protoStringRestore,
	type RestoreResult
} from '$lib/tool/script/export/proto-string-restore';

export const prerender = false;
export const load: PageServerLoad = async ({ url }) => {
	const importProto = url.searchParams.get('i');
	let restoreResult: RestoreResult | null = null;

	if (importProto) {
		restoreResult = protoStringRestore(importProto);
	}

	return {
		restoreResult
	};
};
