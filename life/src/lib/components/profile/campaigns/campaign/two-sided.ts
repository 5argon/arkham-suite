/** What a two-sided campaign spine (PtC Doubt/Conviction, TCU Lodge/Coven) shows, declared once per
 *  campaign and handed to `SignatureRunsTable`, `TwoSidedChain` and `TwoSidedSourceTable`. */
import { getCampaignLog } from '@5argon/arkham-campaign-data';
import type { SideBead, SideRun } from '$lib/campaign/campaigns/two-sided';
import { endingText } from '$lib/campaign/outcomes/clear-status';
import { capitalizeFirst } from '$lib/campaign/utils/entry-text';

export interface TwoSidedSide {
	key: string;
	abbr: string;
	label: string;
	/** Text colour classes. */
	tint: string;
}

export interface TwoSidedSpec {
	family: string;
	sides: [TwoSidedSide, TwoSidedSide];
	/** Decision points in book order. */
	sources: readonly string[];
	/** The scenario whose encounter icon a decision point shows; interludes borrow one. */
	iconScenario: (source: string) => string;
	sourceName: (source: string) => string;
	/** Hover text of a decision the run leaned on. */
	earned: (bead: SideBead) => string;
	/** Hover suffix of a decision the run passed without leaning. */
	neutral: string;
	neutralColumn: string;
	/** Hover text of the Neutral dash of a decision that always takes a side. */
	neutralNa: string;
	decisionColumn: string;
	chainColumn: string;
	resultColumn: string;
	/** Titles of the runs leaning furthest to each side and of the least committed one. */
	signatureTitles: [string, string, string];
	unfinished: string;
}

/** The run's ending as the campaign log words it. */
export function outcomeText(spec: TwoSidedSpec, run: SideRun): string {
	const log = getCampaignLog(spec.family);
	return run.outcomeKey && log ? capitalizeFirst(endingText(log, run.outcomeKey)) : spec.unfinished;
}
