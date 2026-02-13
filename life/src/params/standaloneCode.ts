import type { ParamMatcher } from '@sveltejs/kit';

export const match = ((param: string): param is ('apple' | 'orange') => {
    return param === 'apple' || param === 'orange';
}) satisfies ParamMatcher;