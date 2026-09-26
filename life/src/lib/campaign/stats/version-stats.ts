/**
 * Per-version stats for scenarios played in several versions. How a play's version is identified is
 * the only campaign-specific part, declared once per scenario in {@link VERSION_AXES}.
 */ import type { CampaignLog } from '@5argon/arkham-campaign-data';
import type { CampaignRecord } from '../records/campaign-record';
import type { CampaignScenarios } from './scenario-stats';
import { scenarioVerdicts, type ResolutionVerdict } from '../utils/scenario-meta';
import { bumpTally, type Tally } from '../utils/tally';
import {
	arrivalDoomFromRecord,
	echoesPlayerCountFromRecord,
	oathVersionFromRecord,
	pallidVersionFromRecord,
	phantomVersionFromRecord
} from '../campaigns/ptc';
import { ascendingHillVersionFromRecord, openerPositionFromRecord } from '../campaigns/dwl';
import { FHV_FATE_VERSIONS, fateVersionFromRecord } from '../campaigns/fhv';
import { pathWindsFromRecord, unionCosmosVersionFromRecord } from '../campaigns/tcu';
import {
	scenarioReference,
	TSK_VARIANT_SCENARIOS,
	tskRecordedVariant
} from '../campaigns/tsk/solver';

/** A version's stats; the widget supplies its display label. */
export interface VersionStat {
	value: string;
	kind: 'version' | 'tier';
	plays: number;
	playsByTier: Record<string, number>;
	succeed: Tally | null;
	failed: Tally | null;
	/** Resolution → times reached; only reached resolutions appear. */
	tallies: Record<string, Tally>;
	/** Highest reward recorded; null when none was. */
	best: number | null;
	bestByTier: Record<string, number>;
}

/** A `VersionBreakdown` row. */
export interface VersionRow {
	id: string;
	label: string;
	/** An uppercase tag before the label. */
	badge?: string;
	/** A text colour class for the label. */
	accent?: string;
	plays?: Tally | null;
	succeed?: Tally | null;
	failed?: Tally | null;
	/** Leaves the Succeed / Failed cells blank instead of a dash. */
	noOutcome?: boolean;
	resolutionIds?: string[];
	reached?: ReadonlySet<string>;
	tallies?: Record<string, Tally> | null;
	verdicts?: Record<string, ResolutionVerdict> | null;
	vpBest?: number | null;
	vpByTier?: Record<string, number>;
}

export interface ScenarioVersions {
	stats: VersionStat[];
	hasPlays: boolean;
}

export function scenarioVersions(
	scenarios: CampaignScenarios | null | undefined,
	scenarioId: string
): ScenarioVersions {
	const stats = scenarios?.scenarios.find((s) => s.scenario === scenarioId)?.versions ?? [];
	return { stats, hasPlays: stats.some((v) => v.plays > 0) };
}

export function toVersionRow(
	vs: VersionStat,
	opts: {
		label: string;
		accent?: string;
		badge?: string;
		resolutionIds?: string[];
		verdicts?: Record<string, ResolutionVerdict> | null;
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

export interface VersionAxis {
	/** Version values in book order; each gets a row even at 0 plays. */
	order: string[] | ((log: CampaignLog) => string[]);
	/** Numeric values outside `order` also get rows, after it in ascending order. */
	open?: boolean;
	/** The version a play faced; null skips the play. */
	classify: (rec: CampaignRecord) => string | null;
	kind?: 'version' | 'tier';
	/** The version can be read from the campaign log alone, so the table survives log-only mode. */
	versionFromLog: boolean;
}

/** An axis read from an Extra choice, ordered by the choice's options. */
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

/** A TSK scenario's version or time-tier axis over the solver's options. */
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
		versionFromLog: false
	};
}

/** Whether every version axis of a scenario can be read from the campaign log alone. */
export function versionFromLog(scenarioId: string): boolean {
	const axis = VERSION_AXES[scenarioId];
	if (!axis) return false;
	return (Array.isArray(axis) ? axis : [axis]).every((a) => a.versionFromLog);
}

/** Scenario id → how a play's version is identified. */
export const VERSION_AXES: Record<string, VersionAxis | VersionAxis[]> = {
	city_of_the_elder_things: choiceAxis('city_of_the_elder_things', 'city_version'),
	// PtC: the Hastur faced (Extra) and the setup doom from the Stranger marks on arrival.
	dim_carcosa: [
		choiceAxis('dim_carcosa', 'hastur_version'),
		{ order: ['3', '2', '1', '0'], classify: arrivalDoomFromRecord, versionFromLog: false }
	],
	// PtC scenarios reached are known from their (Extra) resolutions, so none is log-only-safe.
	echoes_of_the_past: {
		order: [],
		open: true,
		classify: echoesPlayerCountFromRecord,
		versionFromLog: false
	},
	a_phantom_of_truth: {
		order: ['I', 'II'],
		classify: phantomVersionFromRecord,
		versionFromLog: false
	},
	the_pallid_mask: {
		order: ['conviction', 'doubt'],
		classify: pallidVersionFromRecord,
		versionFromLog: false
	},
	the_unspeakable_oath: {
		order: ['I', 'II'],
		classify: oathVersionFromRecord,
		versionFromLog: false
	},
	union_and_disillusion: {
		order: ['I', 'II', 'III', 'IV'],
		classify: unionCosmosVersionFromRecord,
		versionFromLog: true
	},
	before_the_black_throne: {
		order: [],
		open: true,
		classify: pathWindsFromRecord,
		versionFromLog: false
	},
	where_doom_awaits: {
		order: ['v1', 'v2', 'v3'],
		classify: ascendingHillVersionFromRecord,
		versionFromLog: true
	},
	fate_of_the_vale: {
		order: FHV_FATE_VERSIONS.map((v) => v.id),
		classify: fateVersionFromRecord,
		versionFromLog: true
	},
	// The second opener is faced by stronger investigators, so each is split by position.
	extracurricular_activity: {
		order: ['first', 'second'],
		classify: (rec) => openerPositionFromRecord(rec, 'extracurricular_activity'),
		versionFromLog: true
	},
	the_house_always_wins: {
		order: ['first', 'second'],
		classify: (rec) => openerPositionFromRecord(rec, 'the_house_always_wins'),
		versionFromLog: true
	},
	// TSK: version rows, then time-tier rows.
	...Object.fromEntries(
		TSK_VARIANT_SCENARIOS.map((s) => [s, [tskAxis(s, 'version'), tskAxis(s, 'tier')]])
	)
};

/** Bucket the family's plays of one scenario by version. */
export function buildVersionStats(
	records: CampaignRecord[],
	scenarioId: string,
	axis: VersionAxis | VersionAxis[],
	log: CampaignLog
): VersionStat[] {
	if (Array.isArray(axis))
		return axis.flatMap((a) => buildVersionStats(records, scenarioId, a, log));
	const order = typeof axis.order === 'function' ? axis.order(log) : axis.order;
	if (!order.length && !axis.open) return [];
	const kind = axis.kind ?? 'version';
	const outcomes = scenarioVerdicts(log.db.scenarioMeta?.find((m) => m.id === scenarioId));
	const blank = (value: string): VersionStat => ({
		value,
		kind,
		plays: 0,
		playsByTier: {},
		succeed: null,
		failed: null,
		tallies: {},
		best: null,
		bestByTier: {}
	});
	const byValue = new Map<string, VersionStat>(order.map((value) => [value, blank(value)]));
	for (const rec of records) {
		const v = axis.classify(rec);
		if (v == null) continue;
		let s = byValue.get(v);
		if (!s && axis.open) byValue.set(v, (s = blank(v)));
		if (!s) continue;
		const tier = rec.recorded.difficulty ?? 'standard';
		s.plays += 1;
		s.playsByTier[tier] = (s.playsByTier[tier] ?? 0) + 1;
		const resolution = rec.scenarioResolutions?.[scenarioId];
		if (resolution) {
			bumpTally((s.tallies[resolution] ??= { total: 0, byTier: {} }), tier);
			const verdict = outcomes[resolution];
			if (verdict === 'win') bumpTally((s.succeed ??= { total: 0, byTier: {} }), tier);
			else if (verdict === 'loss') bumpTally((s.failed ??= { total: 0, byTier: {} }), tier);
		}
		const xp = rec.scenarioXp?.[scenarioId];
		if (typeof xp === 'number') {
			s.best = s.best === null ? xp : Math.max(s.best, xp);
			s.bestByTier[tier] = Math.max(s.bestByTier[tier] ?? xp, xp);
		}
	}
	const extra = [...byValue.keys()]
		.filter((v) => !order.includes(v))
		.sort((a, b) => Number(a) - Number(b));
	return [...order, ...extra].map((value) => byValue.get(value)!);
}
