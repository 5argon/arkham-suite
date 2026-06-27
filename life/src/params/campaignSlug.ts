import type { ParamMatcher } from '@sveltejs/kit';
import { getCampaignLog } from '@5argon/arkham-campaign-data';

/**
 * The `[campaign]` segment under a profile's `campaigns/` page — a kohaku `Campaign`
 * slug (e.g. `tsk`, `eote`) that resolves to a real campaign log. This is the static
 * "is it a known campaign?" gate (404s garbage before the page loads); the page itself
 * still applies the data-dependent "did this subject actually play it?" check.
 */
export const match = ((param) => getCampaignLog(param as never) != null) satisfies ParamMatcher;
