/**
 * tcu-allegiance-labels.ts — icon, name, colour and outcome resolution for TCU's five Lodge/Coven
 * allegiance decision points and runs, shared by the chain, the source table and the spine widget.
 * The two interludes (The Price of Progress · The Inner Circle) carry no encounter set, so they
 * borrow their parent scenario's icon and aren't in campaign-data's scenarioNames.
 */
import { getCampaignLog } from '@5argon/arkham-campaign-data';
import type { EncounterSet } from '@5argon/arkham-kohaku';
import { TCU_FINALE_ENDINGS, type TcuAllegianceRun } from '$lib/campaign/campaigns/tcu';
import { endingText, type EndingKind } from '$lib/campaign/outcomes/clear-status';
import { capitalizeFirst } from '$lib/campaign/utils/entry-text';
import { signatureRows, signatureRuns, type SignatureRow } from '$lib/campaign/utils/signature-runs';
import { scenarioRepresentativeSet } from '$lib/campaign/utils/standalone-scenarios';
import * as m from '$lib/paraglide/messages.js';

export const ALLEGIANCE_TINT = {
	lodge: 'text-sky-600 dark:text-sky-400',
	coven: 'text-emerald-600 dark:text-emerald-400'
} as const;

/** Interludes carry no encounter set — borrow the parent scenario's icon. */
const ICON_SCENARIO: Record<string, string> = {
	the_price_of_progress: 'at_deaths_doorstep',
	the_inner_circle: 'for_the_greater_good'
};

/** The encounter-set icon for an allegiance decision point (interludes borrow the parent scenario). */
export function allegianceIconSet(scenario: string): EncounterSet | null {
	return scenarioRepresentativeSet(ICON_SCENARIO[scenario] ?? scenario);
}

/** The 2 interludes aren't in campaign-data scenarioNames. */
const INTERLUDE: Record<string, () => string> = {
	the_price_of_progress: m.campaign_tcu_alleg_scen_price,
	the_inner_circle: m.campaign_tcu_alleg_scen_inner
};

/** Display name for an allegiance decision point. */
export function allegianceScenName(id: string): string {
	return getCampaignLog('tcu')?.en.scenarioNames?.[id] ?? INTERLUDE[id]?.() ?? id;
}

/** Finale ending note → outcome-face kind, from the same table the precompute classifies endings by. */
const FINALE_KIND: Record<string, EndingKind> = Object.fromEntries(
	TCU_FINALE_ENDINGS.map((e) => [e.note, e.kind])
);

export function allegianceOutcomeKind(r: TcuAllegianceRun): EndingKind | null {
	const note = r.outcomeKey?.replace('campaign_notes.', '');
	return note ? (FINALE_KIND[note] ?? null) : null;
}

export function allegianceOutcomeLabel(r: TcuAllegianceRun): string {
	const log = getCampaignLog('tcu');
	return r.outcomeKey && log
		? capitalizeFirst(endingText(log, r.outcomeKey))
		: m.campaign_tcu_outcome_abandoned();
}

/** Most Lodge-aligned / Most Coven-aligned / Least committed rows over the given runs. */
export function allegianceSignatureRows(
	runs: readonly TcuAllegianceRun[]
): SignatureRow<TcuAllegianceRun>[] {
	const picks = signatureRuns(runs, (r) => r.lodge, (r) => r.coven);
	return signatureRows([
		[m.campaign_tcu_alleg_row_most_lodge(), picks.mostA],
		[m.campaign_tcu_alleg_row_most_coven(), picks.mostB],
		[m.campaign_tcu_alleg_row_least(), picks.leastCombined]
	]);
}
