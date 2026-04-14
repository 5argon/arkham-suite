import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

const validNames = ['daniela', 'joe', 'trish', 'dexter', 'isabelle'] as const;
type PreconName = (typeof validNames)[number];

function isValidName(name: string): name is PreconName {
	return (validNames as readonly string[]).includes(name);
}

export const load: PageServerLoad = async ({ params }) => {
	const { name } = params;

	if (!isValidName(name)) {
		error(404, 'Not found');
	}

	return { slug: name };
};
