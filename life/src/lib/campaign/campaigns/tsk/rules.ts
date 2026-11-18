/** The Scarlet Keys' game rules over one play's record: no display text, no solver data. */
import { noteKey, type Play } from '../../records/play';

// ─── Chaos bag: Tablet vs Elder Thing ─────────────────────────────────────────

type BagDetector =
	| { mode: 'log'; id: string }
	| { mode: 'crossoff'; id: string }
	| { mode: 'extra'; key: string; value: string };

/** A choice that swaps the chaos bag: trust removes an Elder Thing and adds a Tablet, deception
 *  the reverse. */
export interface BagAct {
	id: string;
	kind: 'trust' | 'deception';
	/** Where the act happens; orders a run's swaps and names the act. */
	scenario: string;
	/** Detected when any of these matches. Three acts leave no log trace and need an Extra input. */
	any: BagDetector[];
}

export const TSK_BAG_ACTS: BagAct[] = [
	{ id: 'rr_offer', kind: 'trust', scenario: 'riddles_and_rain', any: [{ mode: 'extra', key: 'riddles_and_rain.intro_offer', value: 'take_offer' }] },
	{ id: 'foundation_tell', kind: 'trust', scenario: 'the_foundation', any: [{ mode: 'log', id: 'cell_told_the_truth_to_taylor' }] },
	{ id: 'bolivar_all', kind: 'trust', scenario: 'sanguine_shadows', any: [{ mode: 'extra', key: 'sanguine_shadows.bolivar', value: 'all' }] },
	{ id: 'dealings_work', kind: 'trust', scenario: 'dealings_in_the_dark', any: [{ mode: 'log', id: 'cell_is_working_with_ece' }] },
	{ id: 'deadgone_tell', kind: 'trust', scenario: 'london', any: [{ mode: 'crossoff', id: 'agent_quinn_does_not_trust_the_cell' }] },
	{ id: 'onthinice_deal', kind: 'trust', scenario: 'on_thin_ice', any: [{ mode: 'log', id: 'cell_made_a_deal_with_thorne' }, { mode: 'extra', key: 'on_thin_ice.raw_deal', value: 'accept' }] },
	{ id: 'dogs_aid', kind: 'trust', scenario: 'dogs_of_war', any: [{ mode: 'log', id: 'cell_aided_the_knight' }] },
	{ id: 'whistle_accept', kind: 'trust', scenario: 'kathmandu', any: [{ mode: 'log', id: 'cell_possesses_a_mysterious_whistle' }] },
	{ id: 'rr_own', kind: 'deception', scenario: 'riddles_and_rain', any: [{ mode: 'extra', key: 'riddles_and_rain.intro_offer', value: 'reject_offer' }] },
	{ id: 'foundation_hide', kind: 'deception', scenario: 'the_foundation', any: [{ mode: 'log', id: 'cell_hid_the_truth_from_taylor' }] },
	{ id: 'bolivar_nada', kind: 'deception', scenario: 'sanguine_shadows', any: [{ mode: 'extra', key: 'sanguine_shadows.bolivar', value: 'nada' }] },
	{ id: 'dealings_deceive', kind: 'deception', scenario: 'dealings_in_the_dark', any: [{ mode: 'log', id: 'cell_is_deceiving_ece' }] },
	{ id: 'deadgone_keep', kind: 'deception', scenario: 'london', any: [{ mode: 'log', id: 'foundation_remains_in_the_dark' }] },
	{ id: 'onthinice_refuse', kind: 'deception', scenario: 'on_thin_ice', any: [{ mode: 'extra', key: 'on_thin_ice.raw_deal', value: 'reject' }] },
	{ id: 'dogs_sirry', kind: 'deception', scenario: 'dogs_of_war', any: [{ mode: 'log', id: 'cell_is_assisting_agent_sirry' }] },
	{ id: 'whistle_refuse', kind: 'deception', scenario: 'kathmandu', any: [{ mode: 'log', id: 'cell_refused_alikis_offer' }] }
];

/** Each side of the bag holds at most 4; adding to a full side grants 1 XP instead. */
const TSK_BAG_CAP = 4;

export function bagActDetected(
	act: BagAct,
	logs: ReadonlySet<string>,
	crossed: ReadonlySet<string> | undefined,
	choices: Record<string, string> | undefined
): boolean {
	return act.any.some((d) =>
		d.mode === 'log'
			? logs.has(noteKey(d.id))
			: d.mode === 'crossoff'
				? (crossed?.has(noteKey(d.id)) ?? false)
				: choices?.[d.key] === d.value
	);
}

/** The XP a run earned by adding to a full side, replaying its swaps from the starting one Tablet
 *  and one Elder Thing: the fixed opening first, then in route order. */
export function bagOverflowXp(acts: BagAct[], route: readonly string[]): number {
	const order = (scenario: string) =>
		scenario === 'riddles_and_rain' ? -2 : scenario === 'the_foundation' ? -1 : ((i) => (i >= 0 ? i : Number.MAX_SAFE_INTEGER))(route.indexOf(scenario));
	const bag = { trust: 1, deception: 1 };
	let xp = 0;
	for (const act of [...acts].sort((a, b) => order(a.scenario) - order(b.scenario))) {
		const other = act.kind === 'trust' ? 'deception' : 'trust';
		bag[other] = Math.max(0, bag[other] - 1);
		if (bag[act.kind] >= TSK_BAG_CAP) xp += 1;
		else bag[act.kind] += 1;
	}
	return xp;
}

/**
 * The two `lifeInfer` "Trust …" achievements: a won run that ends with four of one token and never
 * removed one, i.e. never made an act of the opposite kind. Sound only when every act was recorded,
 * the three Extra-only acts included.
 */
export function tskTrustAchievements(args: {
	recordedLogs: ReadonlySet<string>;
	crossedLogs?: ReadonlySet<string>;
	scenarioChoices?: Record<string, string>;
	finalChaosBag?: Record<string, number>;
	won: boolean;
}): { trust_nobody: boolean; trust_everybody: boolean } {
	const { recordedLogs, crossedLogs, scenarioChoices, finalChaosBag, won } = args;
	const made = (kind: BagAct['kind']) =>
		TSK_BAG_ACTS.some((a) => a.kind === kind && bagActDetected(a, recordedLogs, crossedLogs, scenarioChoices));
	return {
		trust_everybody: won && finalChaosBag?.['tablet'] === TSK_BAG_CAP && !made('deception'),
		trust_nobody: won && finalChaosBag?.['elder_thing'] === TSK_BAG_CAP && !made('trust')
	};
}

// ─── The epilogue tally: Foundation Trust vs Cell Deception ───────────────────
// A separate axis from the bag: aiding the Claret Knight is a bag trust act but a Cell Deception entry.

export interface TallyEntry {
	/** A `campaign_notes` id. */
	id: string;
	/** Counts when crossed off rather than when recorded. */
	crossoff?: boolean;
}

export const TSK_FOUNDATION_TRUST: TallyEntry[] = [
	{ id: 'cell_is_assisting_agent_sirry' },
	{ id: 'cell_told_the_truth_to_taylor' },
	{ id: 'agent_quinn_has_your_back' },
	{ id: 'cell_is_delivering_foundation_intel', crossoff: true }
];

export const TSK_CELL_DECEPTION: TallyEntry[] = [
	{ id: 'cell_hid_the_truth_from_taylor' },
	{ id: 'cell_is_off_mission' },
	{ id: 'cell_aided_the_knight' },
	{ id: 'ece_trusts_the_cell' },
	{ id: 'cell_made_a_deal_with_thorne' },
	{ id: 'aliki_is_on_your_side' },
	{ id: 'desi_is_in_your_debt' },
	{ id: 'tuwile_masai_is_on_your_side' }
];

export function crossedOff(p: Play, id: string): boolean {
	return p.rec.recorded.crossedLogs?.has(noteKey(id)) ?? false;
}

export function tallyEntryPresent(p: Play, e: TallyEntry): boolean {
	return e.crossoff ? crossedOff(p, e.id) : p.has(e.id);
}

// ─── The Congress of the Keys ─────────────────────────────────────────────────

const JUDGMENT_VERSION: Record<string, string> = {
	'COTK.judgment.liability': 'I',
	'COTK.judgment.asset': 'II',
	'COTK.judgment.overthrow': 'II',
	'COTK.judgment.join': 'II',
	'COTK.judgment.spared': 'III',
	'COTK.judgment.destroyed': 'III'
};

/** The finale version (roman) a judgment leads to. */
export function congressVersionForJudgment(judgmentId: string): string | null {
	return JUDGMENT_VERSION[judgmentId] ?? null;
}

/** The Congress trial's judgment, from the play's terminal Coterie notes; null before the finale. */
export function congressJudgment(p: Play): string | null {
	if (p.has('cell_joined_the_red_coterie')) return 'COTK.judgment.join';
	if (p.has('cell_overthrew_the_red_coterie')) return 'COTK.judgment.overthrow';
	if (p.has('red_coterie_was_destroyed_from_within')) return 'COTK.judgment.destroyed';
	if (p.has('red_coterie_spared_the_cell'))
		return p.has('cell_knows_the_true_nature_of_the_coterie') ? 'COTK.judgment.spared' : 'COTK.judgment.asset';
	if (p.has('cell_escaped_the_red_coterie')) return 'COTK.judgment.liability';
	return null;
}

// ─── Scarlet Keys won at a scenario ───────────────────────────────────────────

/** The scenarios whose own resolution decides who takes the Key. The Bale Engine, the Ruinous Chime
 *  and the Mirroring Blade are won at interludes instead. */
export const TSK_KEY_SCENARIOS: { scenarioId: string; keyId: string }[] = [
	{ scenarioId: 'riddles_and_rain', keyId: 'eye_of_ravens' },
	{ scenarioId: 'dead_heat', keyId: 'last_blossom' },
	{ scenarioId: 'sanguine_shadows', keyId: 'weeping_lady' },
	{ scenarioId: 'dealings_in_the_dark', keyId: 'twisted_antiprism' },
	{ scenarioId: 'on_thin_ice', keyId: 'sable_glass' },
	{ scenarioId: 'dogs_of_war', keyId: 'light_of_pharos' },
	{ scenarioId: 'shades_of_suffering', keyId: 'shade_reaper' }
];

/**
 * Whether a cell investigator took the scenario's Key, by its recorded resolution: null when no
 * resolution was recorded. Not "holds it now", since a Key can be stolen later.
 */
export function keyObtainedFromScenario(p: Play, scenarioId: string): boolean | null {
	const resolution = p.resolution(scenarioId);
	if (!resolution) return null;
	if (resolution === 'no_resolution') return false;
	const oneOf = (...rs: string[]) => rs.includes(resolution);
	switch (scenarioId) {
		case 'riddles_and_rain':
			return oneOf('R1', 'R2'); // else the Red-Gloved Man
		case 'dead_heat':
			return oneOf('R3', 'R4'); // else Amaranth
		case 'sanguine_shadows':
			return oneOf('R1', 'R2'); // R3: La Chica Roja
		case 'on_thin_ice':
			return resolution === 'R2'; // R1: Thorne
		case 'dogs_of_war':
			return oneOf('R2', 'R6'); // R1/R5: the Claret Knight, R3: the Beast
		case 'shades_of_suffering':
			return oneOf('R1', 'R2'); // R3: Tzu San Niang
		case 'dealings_in_the_dark':
			// R1 recovers the Antiprism: yours when you deceived or refused Ece, hers when you worked with her.
			if (resolution !== 'R1' || p.has('cell_is_working_with_ece')) return false;
			if (p.has('cell_is_deceiving_ece') || p.has('cell_refused_eces_offer')) return true;
			return null;
		default:
			return null;
	}
}

// ─── Dead Heat's late tier ────────────────────────────────────────────────────

const DEAD_HEAT_LEVEL = 'dead_heat.level';
/** At 25+ time the city is already lost: the scenario is skipped and resolves R5. */
const DEAD_HEAT_LATE = 'DH.t.late';
const DEAD_HEAT_SKIPPED = 'R5';
const LEVEL_FORCES: Record<string, string> = { [DEAD_HEAT_LATE]: DEAD_HEAT_SKIPPED };

/** Fills whichever of Dead Heat's late tier and R5 the player omitted, since each implies the other;
 *  returns the inputs unchanged when there is nothing to fill. */
export function applyTskTierResolutionInference(
	resolutions: Record<string, string>,
	tiers: Record<string, string>
): { resolutions: Record<string, string>; tiers: Record<string, string> } {
	if (tiers[DEAD_HEAT_LEVEL] === DEAD_HEAT_LATE && resolutions.dead_heat === undefined)
		return { resolutions: { ...resolutions, dead_heat: DEAD_HEAT_SKIPPED }, tiers };
	if (resolutions.dead_heat === DEAD_HEAT_SKIPPED && tiers[DEAD_HEAT_LEVEL] === undefined)
		return { resolutions, tiers: { ...tiers, [DEAD_HEAT_LEVEL]: DEAD_HEAT_LATE } };
	return { resolutions, tiers };
}

/** The resolutions reachable on a time tier: a tier that forces an outcome allows only it, and the
 *  same scenario's other tiers never reach it. */
export function resolutionsReachableInLevel(levelId: string | undefined, all: string[]): string[] {
	if (!levelId) return all;
	const forced = LEVEL_FORCES[levelId];
	if (forced) return all.filter((r) => r === forced);
	const scenarioCode = levelId.split('.')[0];
	const forcedElsewhere = new Set(
		Object.entries(LEVEL_FORCES)
			.filter(([id]) => id.split('.')[0] === scenarioCode)
			.map(([, r]) => r)
	);
	return all.filter((r) => !forcedElsewhere.has(r));
}

/** A tier that skips the scenario has no Succeed / Failed. */
export function levelHasNoOutcome(levelId: string | undefined): boolean {
	return !!levelId && levelId in LEVEL_FORCES;
}
