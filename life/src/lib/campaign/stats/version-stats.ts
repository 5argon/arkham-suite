/**
 * version-stats.ts — the ONE per-version aggregation for scenarios played in several VERSIONS
 * (TSK versions/tiers, EotE City I/II/III, PtC Hastur / Doubt-vs-Conviction / Unspeakable Oath,
 * DWL Ascending the Hill). It produces `ScenarioStat.versions` (the unified per-version slice of
 * the `scenarios` record), so every campaign's version table is built + serialized the same way.
 *
 * The only campaign-specific knowledge — HOW a play's version is identified — lives in the single
 * {@link VERSION_AXES} registry below: a recorded Extra-tab choice (city_version / hastur_version /
 * doubt_conviction) or a log-note derivation (Oath = onyx clasp; DWL = Silas / Necronomicon). The
 * join (plays / Succeed-Failed / resolutions / XP per version) is generic, mirroring
 * `buildResolutionCoverage` but bucketed by version.
 */
import type { CampaignLog } from '@5argon/arkham-campaign-data';
import type { CampaignRecord } from '../achievements/achievement-aggregate';
import type { ResolutionTally } from '../outcomes/resolution-coverage';
import { oathVersionFromRecord, phantomVersionFromRecord, pallidVersionFromRecord } from '../campaigns/ptc';
import { ascendingHillVersionFromRecord } from '../campaigns/dwl';
import { unionCosmosVersionFromRecord } from '../campaigns/tcu';
import { TSK_VARIANT_SCENARIOS, tskRecordedVariant } from '../campaigns/tsk-profile';
import { scenarioReference, scenarioResultFromResolution } from '../campaigns/tsk-solver';

/** One version's stats for a scenario. `value` is the stable id (e.g. 'I' / 'conviction' / 'v1');
 *  the display label is supplied by the widget (choice option label / message), never serialized. */
export interface VersionStat {
	value: string;
	kind: 'version' | 'tier';
	plays: number;
	playsByTier: Record<string, number>;
	/** Resolution-derived Succeed / Failed for this version (campaign-data verdicts); null when none. */
	succeed: ResolutionTally | null;
	failed: ResolutionTally | null;
	/** Per-resolution reach counts for this version (only resolutions reached have an entry). */
	tallies: Record<string, ResolutionTally>;
	/** Victory-display high score for this version; null if no XP was recorded. */
	best: number | null;
	bestByTier: Record<string, number>;
}

/** Presentation row for the shared `VersionBreakdown` table — a {@link VersionStat} reshaped with a
 *  display label + the scenario's reachable resolution set (the stat carries only what was reached). */
export interface VersionRow {
	id: string;
	label: string;
	/** Optional uppercase tag before the label (TSK "VERSION" / "TIER"). */
	badge?: string;
	/** Optional label colour class (e.g. PtC amber / violet). */
	accent?: string;
	plays?: ResolutionTally | null;
	succeed?: ResolutionTally | null;
	failed?: ResolutionTally | null;
	/** This row's scenario has no win/loss signal (e.g. a skip tier) → its Succeed / Failed cells
	 *  render blank instead of "—" (TSK's no-outcome time tiers). */
	noOutcome?: boolean;
	resolutionIds?: string[];
	reached?: ReadonlySet<string>;
	tallies?: Record<string, ResolutionTally> | null;
	verdicts?: Record<string, 'win' | 'loss' | 'neutral'> | null;
	vpBest?: number | null;
	vpByTier?: Record<string, number>;
}

/** Map a built {@link VersionStat} to a display row. Label / accent / the reachable resolution set +
 *  verdicts are supplied by the caller (all re-derivable from campaign-data); stats come from the stat. */
export function toVersionRow(
	vs: VersionStat,
	opts: {
		label: string;
		accent?: string;
		badge?: string;
		resolutionIds?: string[];
		verdicts?: Record<string, 'win' | 'loss' | 'neutral'> | null;
	}
): VersionRow {
	return {
		id: vs.value,
		label: opts.label,
		badge: opts.badge,
		accent: opts.accent,
		plays: { total: vs.plays, byTier: vs.playsByTier },
		succeed: vs.succeed,
		failed: vs.failed,
		resolutionIds: opts.resolutionIds,
		reached: new Set(Object.keys(vs.tallies)),
		tallies: vs.tallies,
		verdicts: opts.verdicts ?? null,
		vpBest: vs.best,
		vpByTier: vs.bestByTier
	};
}

/** How a scenario's version is identified, declared once per scenario. */
export interface VersionAxis {
	/** Version values in book order (rows render even at 0 plays). */
	order: string[] | ((log: CampaignLog) => string[]);
	/** The version a play faced (or null to skip the play). */
	classify: (rec: CampaignRecord) => string | null;
	kind?: 'version' | 'tier';
	/** Whether the version is recoverable from the campaign log alone (drives log-only mode). */
	versionFromLog: boolean;
	/** Override the resolution → verdict mapping for Succeed / Failed (default: the scenario's
	 *  campaign-data `resolutionOutcomes`). TSK passes its own `scenarioResultFromResolution`. */
	result?: (scenarioId: string, resolution: string) => 'win' | 'loss' | 'neutral' | null;
}

/** A version axis read straight from a recorded Extra-tab choice; its values + order ARE the
 *  choice's options (campaign-data). */
function choiceAxis(scenarioId: string, choiceId: string): VersionAxis {
	const key = `${scenarioId}.${choiceId}`;
	return {
		order: (log) =>
			log.db.scenarioMeta?.find((m) => m.id === scenarioId)?.choices?.find((c) => c.id === choiceId)
				?.options ?? [],
		classify: (rec) => rec.scenarioChoices?.[key] ?? null,
		versionFromLog: false
	};
}

/** TSK's per-variant Succeed/Failed uses its own resolution→result rules (e.g. neutral resolutions
 *  like Dead Heat's R5), so its axes override the default `resolutionOutcomes` lookup. */
function tskResult(scenarioId: string, resolution: string): 'win' | 'loss' | 'neutral' | null {
	const r = scenarioResultFromResolution(scenarioId, resolution);
	return r === 'success' ? 'win' : r === 'failure' ? 'loss' : r === 'neutral' ? 'neutral' : null;
}

/** A TSK scenario's version OR tier axis: order = the solver's reference options; the variant a play
 *  faced is its recorded tier (+ log inference, {@link tskRecordedVariant}); Succeed/Failed via
 *  {@link tskResult}. Two of these (version + tier) compose each TSK scenario's multi-axis entry. */
function tskAxis(scenarioId: string, kind: 'version' | 'tier'): VersionAxis {
	const tierKind = kind === 'version' ? 'version' : 'level';
	return {
		kind,
		order: () =>
			(kind === 'version'
				? scenarioReference(scenarioId)?.versions
				: scenarioReference(scenarioId)?.levels
			)?.map((o) => o.id) ?? [],
		classify: (rec) => tskRecordedVariant(rec, scenarioId, tierKind),
		// Recorded Extra tier (+ partial log inference); the TSK passport hides the whole table in
		// log-only mode regardless, so treat as not log-only-safe.
		versionFromLog: false,
		result: tskResult
	};
}

/** The single registry: kohaku scenario id → how its version is identified. */
export const VERSION_AXES: Record<string, VersionAxis | VersionAxis[]> = {
	city_of_the_elder_things: choiceAxis('city_of_the_elder_things', 'city_version'),
	dim_carcosa: choiceAxis('dim_carcosa', 'hastur_version'),
	// Derived versions — the meter-gated Act versions + log-note derivations (clasp / Silas / Necronomicon).
	// A Phantom of Truth's version is the meter on ENTRY (the four log-derived pre-Phantom marks), NOT the
	// in-scenario `doubt_conviction` vision mark — so it is always defined and log-known. The Pallid Mask's
	// "how Act 2 advanced" prefers the recorded choice, else derives from the lean entering its Act 2 check
	// (which includes Phantom's Extra vision mark, hence not log-only-safe).
	a_phantom_of_truth: { order: ['I', 'II'], classify: phantomVersionFromRecord, versionFromLog: true },
	the_pallid_mask: { order: ['conviction', 'doubt'], classify: pallidVersionFromRecord, versionFromLog: false },
	the_unspeakable_oath: { order: ['I', 'II'], classify: oathVersionFromRecord, versionFromLog: false },
	// TCU Union and Disillusion — the Beyond-the-Mist Cosmos version (Act 3 v.I–v.IV) auto-selected by
	// the log from the side taken + deception/induction flags (see unionCosmosVersionFromRecord). Fully
	// log-derived, so log-only-safe.
	union_and_disillusion: {
		order: ['I', 'II', 'III', 'IV'],
		classify: unionCosmosVersionFromRecord,
		versionFromLog: true
	},
	where_doom_awaits: {
		order: ['v1', 'v2', 'v3'],
		classify: ascendingHillVersionFromRecord,
		versionFromLog: true
	},
	// TSK: each scenario carries a version axis + a tier axis (solver reference options; the variant
	// a play faced is its recorded tier + log inference). Multi-axis → version rows then tier rows.
	...Object.fromEntries(
		TSK_VARIANT_SCENARIOS.map((s) => [s, [tskAxis(s, 'version'), tskAxis(s, 'tier')]])
	)
};

/** Build the per-version stats for one scenario by bucketing the family's plays by their version. */
export function buildVersionStats(
	records: CampaignRecord[],
	scenarioId: string,
	axis: VersionAxis | VersionAxis[],
	log: CampaignLog
): VersionStat[] {
	// Multi-axis scenarios (TSK's version + tier) flatten into one ordered list — each axis's rows
	// carry their own `kind`, so the table shows version rows then tier rows.
	if (Array.isArray(axis)) return axis.flatMap((a) => buildVersionStats(records, scenarioId, a, log));
	const order = typeof axis.order === 'function' ? axis.order(log) : axis.order;
	if (!order.length) return [];
	const kind = axis.kind ?? 'version';
	const outcomes = (log.db.scenarioMeta?.find((m) => m.id === scenarioId)?.resolutionOutcomes ??
		{}) as Record<string, 'win' | 'loss' | 'neutral'>;
	const byValue = new Map<string, VersionStat>(
		order.map((value) => [
			value,
			{ value, kind, plays: 0, playsByTier: {}, succeed: null, failed: null, tallies: {}, best: null, bestByTier: {} }
		])
	);
	const bump = (t: ResolutionTally, tier: string) => {
		t.total += 1;
		t.byTier[tier] = (t.byTier[tier] ?? 0) + 1;
	};
	for (const rec of records) {
		const v = axis.classify(rec);
		if (v == null) continue;
		const s = byValue.get(v);
		if (!s) continue; // a value outside the declared order
		const tier = rec.recorded.difficulty ?? 'standard';
		s.plays += 1;
		s.playsByTier[tier] = (s.playsByTier[tier] ?? 0) + 1;
		const resolution = rec.scenarioResolutions?.[scenarioId];
		if (resolution) {
			bump((s.tallies[resolution] ??= { total: 0, byTier: {} }), tier);
			const verdict = axis.result ? axis.result(scenarioId, resolution) : (outcomes[resolution] ?? null);
			if (verdict === 'win') bump((s.succeed ??= { total: 0, byTier: {} }), tier);
			else if (verdict === 'loss') bump((s.failed ??= { total: 0, byTier: {} }), tier);
		}
		const xp = rec.scenarioXp?.[scenarioId];
		if (typeof xp === 'number') {
			s.best = s.best === null ? xp : Math.max(s.best, xp);
			s.bestByTier[tier] = Math.max(s.bestByTier[tier] ?? xp, xp);
		}
	}
	return order.map((value) => byValue.get(value)!);
}
