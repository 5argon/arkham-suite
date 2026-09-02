/**
 * ptc-dc-labels.ts — icon, name, colour and outcome resolution for PtC's Doubt/Conviction
 * decision points and runs, shared by the chain, the source table and the signature-runs widgets.
 * The two interludes (Reality's Shadow · Lost Soul) carry no encounter set, so they borrow their
 * parent scenario's icon and aren't in campaign-data's scenarioNames.
 */
import { getCampaignLog } from '@5argon/arkham-campaign-data';
import { ChaosToken, type EncounterSet } from '@5argon/arkham-kohaku';
import type { DcRun, PtcToken } from '$lib/campaign/campaigns/ptc';
import { endingText, type EndingKind } from '$lib/campaign/outcomes/clear-status';
import { capitalizeFirst } from '$lib/campaign/utils/entry-text';
import { signatureRows, signatureRuns, type SignatureRow } from '$lib/campaign/utils/signature-runs';
import { scenarioRepresentativeSet } from '$lib/campaign/utils/standalone-scenarios';
import * as m from '$lib/paraglide/messages.js';

export const DC_TINT = {
	conviction: 'text-amber-600 dark:text-amber-400',
	doubt: 'text-violet-600 dark:text-violet-400'
} as const;

/** The chaos token each PtC special-token id renders as. */
export const PTC_TOKEN: Record<PtcToken, ChaosToken> = {
	cultist: ChaosToken.TokenCultist,
	tablet: ChaosToken.TokenTablet,
	elder_thing: ChaosToken.TokenElderThing
};

/** Interludes carry no encounter set — borrow the parent scenario's icon. */
const ICON_SCENARIO: Record<string, string> = {
	reality_s_shadow: 'the_last_king',
	lost_soul: 'the_unspeakable_oath'
};

/** The encounter-set icon for a Doubt/Conviction decision point (interludes borrow the parent scenario). */
export function dcIconSet(scenario: string): EncounterSet | null {
	return scenarioRepresentativeSet(ICON_SCENARIO[scenario] ?? scenario);
}

/** The two interludes aren't in campaign-data scenarioNames. */
const INTERLUDE: Record<string, () => string> = {
	reality_s_shadow: m.campaign_ptc_dc_scen_reality,
	lost_soul: m.campaign_ptc_dc_scen_lost_soul
};

/** Display name for a PtC scenario or Doubt/Conviction decision point. */
export function ptcScenarioName(id: string): string {
	return getCampaignLog('ptc')?.en.scenarioNames?.[id] ?? INTERLUDE[id]?.() ?? id;
}

export function dcOutcomeKind(r: DcRun): EndingKind | null {
	return r.outcome === 'win' ? 'win' : r.outcome === 'loss' ? 'loss' : null;
}

/** The run's actual ending text (the same source as the Campaign Overview faces). */
export function dcOutcomeLabel(r: DcRun): string {
	const log = getCampaignLog('ptc');
	return r.outcomeKey && log
		? capitalizeFirst(endingText(log, r.outcomeKey))
		: m.campaign_ptc_outcome_abandoned();
}

/** Most Conviction / Most Doubt / Least Combined rows over the given runs. */
export function dcSignatureRows(runs: readonly DcRun[]): SignatureRow<DcRun>[] {
	const picks = signatureRuns(runs, (r) => r.conviction, (r) => r.doubt);
	return signatureRows([
		[m.campaign_ptc_dc_row_most_conviction(), picks.mostA],
		[m.campaign_ptc_dc_row_most_doubt(), picks.mostB],
		[m.campaign_ptc_dc_row_least_combined(), picks.leastCombined]
	]);
}
