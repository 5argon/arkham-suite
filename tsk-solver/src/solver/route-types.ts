/**
 * Shared "executed route" types.
 *
 * A `RawRoute` is a concrete, executed sequence of stops plus the campaign state it
 * leaves behind. It is produced by the plan simulator (`simulate.ts`) and consumed by
 * the per-state evaluators (`achievements.ts`, `evaluate.ts`). Extracted from the old
 * search layer so those consumers no longer depend on the (now removed) search.
 */

import type { CampaignState, MarkerSymbol, NodeId } from '../types.js';
import type { StopOption } from '../graph/model.js';

export interface RouteStep {
	travelCost: number;
	option: StopOption;
	fired: MarkerSymbol[];
	/** When set, this leg was an Expedited Ticket 0-time jump. */
	usedTicket?: { from: NodeId; to: NodeId; saved: number };
}

export interface RawRoute {
	steps: RouteStep[];
	finalState: CampaignState;
	scenarioCount: number;
}
