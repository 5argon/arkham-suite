import type { ParamMatcher } from '@sveltejs/kit';
import { getCampaignLog } from '@5argon/arkham-campaign-data';

/** A `[campaign]` segment: a kohaku `Campaign` slug (`tsk`, `eote`, …) with a campaign log.
 *  Whether the subject played it is checked by the page. */
export const match = ((param) => getCampaignLog(param as never) != null) satisfies ParamMatcher;
