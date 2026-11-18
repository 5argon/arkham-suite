import { defineParams } from '@sveltejs/kit/params';
import { match as campaignSlug } from './campaignSlug';
import { match as cardSection } from './cardSection';
import { match as playerClass } from './playerClass';
import { match as profileScope } from './profileScope';
import { match as standaloneScenario } from './standaloneScenario';

/** SvelteKit reads every route matcher from this module. Each per-file `match` is a boolean
 *  predicate over the raw segment; a matcher accepts by returning the segment unchanged. */
const accept = (test: (param: string) => boolean) => (param: string) =>
	test(param) ? param : undefined;

export const params = defineParams({
	campaignSlug: accept(campaignSlug),
	cardSection: accept(cardSection),
	playerClass: accept(playerClass),
	profileScope: accept(profileScope),
	standaloneScenario: accept(standaloneScenario)
});
