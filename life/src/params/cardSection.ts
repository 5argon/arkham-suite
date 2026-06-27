import type { ParamMatcher } from '@sveltejs/kit';
import { resolveCardSubpageSlug } from '$lib/campaign/profile/profile-card-subpages';
import { resolveClassSlug } from '$lib/campaign/profile/profile-slugs';

/**
 * The `[section]` segment under a profile's `cards/` page. It is EITHER a card-type
 * sub-page slug (`core`/`asset`/`event`/`skill`/`keywords`/`levels`, from the
 * {@link CARD_SUBPAGES} registry) OR a `CardClass` (guardian/…). Matching here lets a
 * single `[section=cardSection]` route serve both — replacing the six literal
 * sub-page folders + the separate `[class]` folder — and 404s anything else server-side.
 */
export const match = ((param) =>
	resolveCardSubpageSlug(param) !== null || resolveClassSlug(param) !== null) satisfies ParamMatcher;
