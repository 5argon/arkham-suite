import { getAllCards } from '$lib/card-data';
import { environmentPointPages } from '$lib/tool/environment-choices';

import type { PageServerLoad } from './$types';

/**
 * Evaluated when building the site, so this page lists exactly the point pages that exist without
 * bringing the whole card data along.
 */
export const load: PageServerLoad = () => ({ points: environmentPointPages(getAllCards()) });
