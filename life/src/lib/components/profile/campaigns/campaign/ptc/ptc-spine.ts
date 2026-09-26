import { ChaosToken } from '@5argon/arkham-kohaku';
import {
	DC_SOURCE_SCENARIOS,
	reachableResolutions,
	type DcSide,
	type PtcToken
} from '$lib/campaign/campaigns/ptc';
import type { SideBead } from '$lib/campaign/campaigns/two-sided';
import { scenarioName } from '$lib/campaign/records/campaign-log-source';
import {
	scenarioVersions,
	toVersionRow,
	versionFromLog,
	type VersionRow
} from '$lib/campaign/stats/version-stats';
import { scenarioMeta } from '$lib/campaign/utils/scenario-meta';
import type { WidgetContext } from '$lib/components/profile/_framework/widget-context';
import * as m from '$lib/paraglide/messages.js';
import type { TwoSidedSpec } from '../two-sided';

export const DC_TINT: Record<DcSide, string> = {
	conviction: 'text-amber-600 dark:text-amber-400',
	doubt: 'text-violet-600 dark:text-violet-400'
};

export const PTC_TOKEN: Record<PtcToken, ChaosToken> = {
	cultist: ChaosToken.TokenCultist,
	tablet: ChaosToken.TokenTablet,
	elder_thing: ChaosToken.TokenElderThing
};

/** The interludes' campaign-data ids and the scenario whose icon they borrow. */
const INTERLUDE: Record<string, { id: string; icon: string }> = {
	reality_s_shadow: { id: 'ptc_interlude1_reprint', icon: 'the_last_king' },
	lost_soul: { id: 'ptc_interlude2', icon: 'the_unspeakable_oath' }
};

export const ptcScenarioName = (id: string) => scenarioName('ptc', INTERLUDE[id]?.id ?? id);

/** The decision behind a mark: the logged outcome, or the in-scenario prompt for Extra marks. */
const DECISION: Record<string, Record<DcSide, () => string>> = {
	curtain_call: {
		conviction: m.campaign_ptc_curtain_warned,
		doubt: m.campaign_ptc_curtain_not_warned
	},
	reality_s_shadow: {
		conviction: m.campaign_ptc_lastking_slayed,
		doubt: m.campaign_ptc_lastking_intruded
	},
	echoes_of_the_past: {
		conviction: m.campaign_ptc_echoes_took_onyx,
		doubt: m.campaign_ptc_echoes_left_onyx
	},
	lost_soul: {
		conviction: m.campaign_ptc_oath_daniel_heeded,
		doubt: m.campaign_ptc_oath_daniel_ignored
	},
	a_phantom_of_truth: {
		conviction: m.campaign_ptc_dc_src_phantom,
		doubt: m.campaign_ptc_dc_src_phantom
	},
	the_pallid_mask: {
		conviction: m.campaign_ptc_dc_src_pallid,
		doubt: m.campaign_ptc_dc_src_pallid
	},
	black_stars_rise: { conviction: m.campaign_ptc_dc_src_bsr, doubt: m.campaign_ptc_dc_src_bsr }
};

export function ptcDcSpec(): TwoSidedSpec {
	const sides: TwoSidedSpec['sides'] = [
		{
			key: 'conviction',
			abbr: m.campaign_ptc_dc_conviction_abbr(),
			label: m.campaign_ptc_dc_conviction_full(),
			tint: DC_TINT.conviction
		},
		{
			key: 'doubt',
			abbr: m.campaign_ptc_dc_doubt_abbr(),
			label: m.campaign_ptc_dc_doubt_full(),
			tint: DC_TINT.doubt
		}
	];
	return {
		family: 'ptc',
		sides,
		sources: DC_SOURCE_SCENARIOS,
		iconScenario: (id) => INTERLUDE[id]?.icon ?? id,
		sourceName: ptcScenarioName,
		earned: (b: SideBead) => {
			const side = b.side as DcSide;
			const decision = DECISION[b.scenario]?.[side]() ?? b.scenario;
			return `${decision} (+${b.amount} ${sides.find((s) => s.key === side)?.label})`;
		},
		neutral: m.campaign_ptc_dc_neutral(),
		neutralColumn: m.campaign_ptc_dc_neutral_short(),
		neutralNa: m.campaign_ptc_dc_neutral_na(),
		decisionColumn: m.campaign_ptc_dc_src_col_change(),
		chainColumn: m.campaign_ptc_dc_col_changes(),
		resultColumn: m.campaign_ptc_dc_col_result(),
		signatureTitles: [
			m.campaign_ptc_dc_row_most_conviction(),
			m.campaign_ptc_dc_row_most_doubt(),
			m.campaign_ptc_dc_row_least_combined()
		],
		unfinished: m.campaign_ptc_outcome_abandoned()
	};
}

/** The resolution columns of a version table row: the version's own plus any its plays reached. */
export function versionResolutions(ctx: WidgetContext): (version: string) => string[] {
	const scenario = ctx.scenario ?? '';
	const all = scenarioMeta(ctx.family, scenario)?.resolutions ?? [];
	const stats = scenarioVersions(ctx.scenarios, scenario).stats;
	return (version) =>
		reachableResolutions(
			scenario,
			version,
			all,
			new Set(Object.keys(stats.find((s) => s.value === version)?.tallies ?? {}))
		);
}

/** The passport's version table has rows to show in this mode. */
export function hasVersionTable(ctx: WidgetContext): boolean {
	const scenario = ctx.scenario ?? '';
	return (
		scenarioVersions(ctx.scenarios, scenario).hasPlays && (!ctx.logOnly || versionFromLog(scenario))
	);
}

/** Version table rows of the passport's scenario, for a `VersionBreakdown` that needs its own column
 *  header or only some of the scenario's versions. */
export function versionRows(
	ctx: WidgetContext,
	opts: {
		label: (version: string) => string;
		resolutionIds?: (version: string) => string[];
		only?: (version: string) => boolean;
	}
): VersionRow[] {
	const scenario = ctx.scenario ?? '';
	const verdicts = ctx.scenarios?.scenarios.find((s) => s.scenario === scenario)?.verdicts ?? null;
	const all = scenarioMeta(ctx.family, scenario)?.resolutions ?? [];
	return scenarioVersions(ctx.scenarios, scenario)
		.stats.filter((vs) => opts.only?.(vs.value) ?? true)
		.map((vs) =>
			toVersionRow(vs, {
				label: opts.label(vs.value),
				resolutionIds: opts.resolutionIds?.(vs.value) ?? all,
				verdicts
			})
		);
}
