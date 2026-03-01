/**
 * eoe-city.ts — Edge of the Earth "City of the Elder Things" matrix.
 *
 * Which of the three versions (I/II/III) of the scenario a player faced is NOT
 * derivable from the recorded campaign log — it depends on who is still alive, a
 * branch ArkhamCards computes from the full play tree. So the player records it
 * manually in the Extra tab as the `city_version` choice (like PtC's Hastur
 * version). This joins that choice against the play's recorded victory display,
 * the resolution reached, and the difficulty to build a per-version matrix:
 *   - times played (+ per difficulty),
 *   - resolutions obtained (the scenario's full first-choice set, lit per version,
 *     with per-resolution per-difficulty counts),
 *   - VP high score (best, + best per difficulty).
 */
import { getCampaignLog } from '@5argon/arkham-campaign-data';
import type { CampaignRecord } from './achievement-aggregate';

const EOE_FAMILY = 'eoe';
const CITY_SCENARIO = 'city_of_the_elder_things';
const CITY_CHOICE_KEY = `${CITY_SCENARIO}.city_version`;
/** The orderable version options (must match the campaign-data choice options). */
export const CITY_VERSIONS = ['I', 'II', 'III'] as const;

/** Times one resolution was reached for a version, broken down by difficulty. */
export interface CityResolutionTally {
	total: number;
	byTier: Record<string, number>;
}
export interface CityVersionStat {
	/** 'I' | 'II' | 'III'. */
	version: string;
	plays: number;
	playsByTier: Record<string, number>;
	/** Best (max) victory display recorded for this version; null if never recorded. */
	vpBest: number | null;
	/** Best victory display per difficulty tier. */
	vpBestByTier: Record<string, number>;
	/** Per-resolution visit counts; only resolutions actually reached have an entry. */
	resolutions: Record<string, CityResolutionTally>;
}
export interface CampaignEoeCity {
	/** Always 'eoe' (the base family). */
	family: string;
	/** Every first-choice resolution id for City of the Elder Things, in book order. */
	allResolutions: string[];
	/** I / II / III in order — always all three (zeroed when a version is unplayed). */
	versions: CityVersionStat[];
	/** Total City plays that recorded a version (sum across the three). */
	totalPlays: number;
}

/**
 * Build the City of the Elder Things matrix for Edge of the Earth. Returns a
 * single-element array (sliced by `family` like the other per-campaign data), or
 * empty when the subject has no Edge of the Earth plays at all. Plays that did not
 * record a version are unattributable and excluded from the matrix.
 */
export function buildEoeCity(records: CampaignRecord[]): CampaignEoeCity[] {
	const baseLog = getCampaignLog(EOE_FAMILY);
	if (!baseLog) return [];
	const eoeRecords = records.filter((r) => {
		const log = getCampaignLog(r.campaignCode);
		return log ? (log.db.originalId ?? log.db.code) === EOE_FAMILY : false;
	});
	if (eoeRecords.length === 0) return [];

	const allResolutions =
		baseLog.db.scenarioMeta?.find((m) => m.id === CITY_SCENARIO)?.resolutions ?? [];

	const byVersion = new Map<string, CityVersionStat>(
		CITY_VERSIONS.map((v) => [
			v,
			{ version: v, plays: 0, playsByTier: {}, vpBest: null, vpBestByTier: {}, resolutions: {} }
		])
	);

	let totalPlays = 0;
	for (const rec of eoeRecords) {
		const version = rec.scenarioChoices?.[CITY_CHOICE_KEY];
		const s = version ? byVersion.get(version) : undefined;
		if (!s) continue; // version not recorded (or unknown) → unattributable
		const tier = rec.recorded.difficulty ?? 'standard';
		s.plays += 1;
		s.playsByTier[tier] = (s.playsByTier[tier] ?? 0) + 1;
		totalPlays += 1;

		const vp = rec.scenarioXp?.[CITY_SCENARIO];
		if (typeof vp === 'number') {
			s.vpBest = s.vpBest === null ? vp : Math.max(s.vpBest, vp);
			const prev = s.vpBestByTier[tier];
			s.vpBestByTier[tier] = prev === undefined ? vp : Math.max(prev, vp);
		}

		const resolution = rec.scenarioResolutions?.[CITY_SCENARIO];
		if (resolution) {
			const t = (s.resolutions[resolution] ??= { total: 0, byTier: {} });
			t.total += 1;
			t.byTier[tier] = (t.byTier[tier] ?? 0) + 1;
		}
	}

	return [
		{
			family: EOE_FAMILY,
			allResolutions,
			versions: CITY_VERSIONS.map((v) => byVersion.get(v)!),
			totalPlays
		}
	];
}
