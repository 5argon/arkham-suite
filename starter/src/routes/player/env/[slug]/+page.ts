import { error } from '@sveltejs/kit';

import { getAllCards } from '$lib/card-data';
import { environmentPointPages, environmentPointTitle } from '$lib/tool/environment-choices';

import type { EntryGenerator, PageLoad } from './$types';

export const load: PageLoad = ({ params }) => {
	const point = environmentPointPages(getAllCards()).find((p) => p.id === params.slug);
	if (point === undefined) error(404, 'Not found');
	return { point, backName: environmentPointTitle(point) };
};

export const entries: EntryGenerator = () =>
	environmentPointPages(getAllCards()).map((point) => ({ slug: point.id }));
