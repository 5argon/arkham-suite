/** A TDC scenario's logged forks ({@link TDC_OUTCOMES}) with their group headings, labels and
 *  play counts. */
import { TDC_OUTCOMES, type CampaignTdc } from '$lib/campaign/campaigns/tdc';
import { logText } from '$lib/campaign/records/campaign-log-source';
import * as m from '$lib/paraglide/messages.js';

const HEADINGS: Record<string, (() => string)[]> = {
	the_doom_of_arkham: [m.campaign_tdc_doom_approach_heading, m.campaign_tdc_doom_endings_heading]
};

/** Hidden notes campaign-data gives no text. */
const LABELS: Record<string, () => string> = {
	'hidden.tdc_helped_with_the_ropes': m.campaign_tdc_helped_with_the_ropes
};

export interface TdcOutcome {
	key: string;
	label: string;
	plays: number;
}

export interface TdcOutcomeGroup {
	heading?: string;
	outcomes: TdcOutcome[];
}

export function tdcOutcomeGroups(tdc: CampaignTdc | null, scenario: string): TdcOutcomeGroup[] {
	const plays = tdc?.scenarios[scenario] ?? {};
	return (TDC_OUTCOMES[scenario] ?? []).map((keys, i) => ({
		heading: HEADINGS[scenario]?.[i]?.(),
		outcomes: keys.map((key) => ({
			key,
			label: LABELS[key]?.() ?? logText('tdc', key),
			plays: plays[key] ?? 0
		}))
	}));
}
