/**
 * tcu.ts — The Circle Undone bespoke per-campaign tallies. ONE builder, ONE payload
 * blob (`tcu`), mirroring `dwl.ts` / `ptc.ts` / `tfa.ts`. Fully log-derived: TCU's
 * spine (Lodge vs Coven allegiance) is recorded as discrete choices, so there's no
 * running-count problem (the clean case — see tcu-widgets-plan.md).
 *
 *   • allegiance — Silver Twilight Lodge vs the Coven (the campaign spine).
 *   • missingPersons — the four who vanish (Gavriella/Jerome/Valentino/Penny): their
 *     fate (per-person `0504x` section) + whether you picked up their trail.
 *   • mementos — the collectibles (0–8 base; rttcu adds 2).
 *   • per-scenario — each story scenario's logged decisions/outcomes.
 *   • endings — Union and Disillusion's early faction victories (special) + the
 *     Before the Black Throne finale (incl. the slumber variants).
 */
import { getCampaignLog } from '@5argon/arkham-campaign-data';
import type { CampaignRecord } from '../achievements/achievement-aggregate';
import { filterFamilyRecords } from '../records/campaign-family';

const TCU_FAMILY = 'tcu';
const NOTES = 'campaign_notes';
const k = (id: string) => `${NOTES}.${id}`;

/** The four missing persons: section id (their card code) → name + trail note. */
export const TCU_MISSING: { id: string; name: string; trail: string }[] = [
	{ id: '05046', name: 'Gavriella Mizrah', trail: 'on_gavriellas_trail' },
	{ id: '05047', name: 'Jerome Davids', trail: 'on_jeromes_trail' },
	{ id: '05048', name: 'Valentino Rivas', trail: 'on_valentinos_trail' },
	{ id: '05049', name: 'Penny White', trail: 'on_pennys_trail' }
];
/** The four fates a missing person can meet at the Twilight Estate (their `0504x` section). */
export const TCU_FATES = [
	'taken_by_the_watcher',
	'claimed_by_specters',
	'disappeared_into_the_mist',
	'pulled_into_the_spectral_realm'
];
/** Mementos discovered (base 8 + rttcu's 2). */
export const TCU_MEMENTOS = [
	'mesmerizing_flute',
	'ritual_components',
	'scrap_of_torn_shadow',
	'gilmans_journal',
	'keziahs_formulae',
	'worn_crucific',
	'corn_husk_doll',
	'wisp_of_spectral_mist',
	'strange_incantation',
	'bloody_tree_carvings'
];

export interface TcuMissingTally {
	/** Times you picked up this person's trail (At Death's Doorstep). */
	trail: number;
	/** fate id → plays that met that fate. */
	fates: Record<string, number>;
}

export interface CampaignTcu {
	family: string;
	plays: number;
	allegiance: {
		sidedLodge: number;
		sidedCoven: number;
		membersOfLodge: number;
		enemiesOfLodge: number;
		deceivingLodge: number;
		toldLodgeAboutCoven: number;
		hidKnowledgeOfCoven: number;
	};
	/** person code → trail + fate tally. */
	missingPersons: Record<string, TcuMissingTally>;
	/** memento id → plays discovered. */
	mementos: Record<string, number>;
	witchingHour: { acceptedFate: number; rejectedFate: number; spellBroken: number; spellCast: number };
	/** neverSeenAgain = party-wipe (originals lost, fresh party continues — not a campaign end). */
	atDeathsDoorstep: { escaped: number; learnedNothing: number; neverSeenAgain: number };
	secretName: { toldLodge: number; hidCoven: number };
	wagesOfSin: { hereticsReleasedMax: number | null; survivedWatcher: number };
	forTheGreaterGood: { openedPuzzleBox: number; guardianEmerged: number; guardianDefeated: number };
	clutchesOfChaos: {
		askedAnette: number;
		askedSanford: number;
		arrestedAnette: number;
		arrestedSanford: number;
		assumedControl: number;
	};
	endings: {
		// Union and Disillusion early faction victories (campaign ends there — `special`).
		lodgeVictory: number;
		covenVictory: number;
		sanfordPossesses: number;
		anettePossessed: number;
		// Before the Black Throne finale.
		azathothDevoured: number;
		slumbersJoinedPipers: number;
		slumbersBlackBook: number;
		slumbersClean: number;
	};
}

export function buildTcu(records: CampaignRecord[]): CampaignTcu[] {
	const baseLog = getCampaignLog(TCU_FAMILY);
	if (!baseLog) return [];
	const tcuRecords = filterFamilyRecords(records, TCU_FAMILY);
	if (tcuRecords.length === 0) return [];

	const allegiance = {
		sidedLodge: 0,
		sidedCoven: 0,
		membersOfLodge: 0,
		enemiesOfLodge: 0,
		deceivingLodge: 0,
		toldLodgeAboutCoven: 0,
		hidKnowledgeOfCoven: 0
	};
	const missingPersons: Record<string, TcuMissingTally> = {};
	for (const p of TCU_MISSING) missingPersons[p.id] = { trail: 0, fates: {} };
	const mementos: Record<string, number> = {};
	const witchingHour = { acceptedFate: 0, rejectedFate: 0, spellBroken: 0, spellCast: 0 };
	const atDeathsDoorstep = { escaped: 0, learnedNothing: 0, neverSeenAgain: 0 };
	const secretName = { toldLodge: 0, hidCoven: 0 };
	const wagesOfSin = { hereticsReleasedMax: null as number | null, survivedWatcher: 0 };
	const forTheGreaterGood = { openedPuzzleBox: 0, guardianEmerged: 0, guardianDefeated: 0 };
	const clutchesOfChaos = {
		askedAnette: 0,
		askedSanford: 0,
		arrestedAnette: 0,
		arrestedSanford: 0,
		assumedControl: 0
	};
	const endings = {
		lodgeVictory: 0,
		covenVictory: 0,
		sanfordPossesses: 0,
		anettePossessed: 0,
		azathothDevoured: 0,
		slumbersJoinedPipers: 0,
		slumbersBlackBook: 0,
		slumbersClean: 0
	};

	for (const rec of tcuRecords) {
		const logs = rec.recorded.recordedLogs ?? new Set<string>();
		const has = (key: string) => logs.has(key);
		const counts = rec.recorded.logCounts ?? {};
		const items = rec.recorded.recordedSectionItems ?? {};

		// Allegiance (the spine).
		if (has(k('sided_with_the_lodge'))) allegiance.sidedLodge += 1;
		if (has(k('sided_with_the_coven'))) allegiance.sidedCoven += 1;
		if (has(k('members_of_the_lodge'))) allegiance.membersOfLodge += 1;
		if (has(k('enemies_of_the_lodge'))) allegiance.enemiesOfLodge += 1;
		if (has(k('deceiving_the_lodge'))) allegiance.deceivingLodge += 1;
		if (has(k('told_lodge_about_coven'))) allegiance.toldLodgeAboutCoven += 1;
		if (has(k('hid_knowledge_of_coven'))) allegiance.hidKnowledgeOfCoven += 1;

		// Missing persons — fate (their 0504x section) + trail.
		for (const p of TCU_MISSING) {
			if (has(k(p.trail))) missingPersons[p.id].trail += 1;
			const fateSet = items[p.id];
			if (fateSet)
				for (const fate of TCU_FATES)
					if (fateSet.has(fate))
						missingPersons[p.id].fates[fate] = (missingPersons[p.id].fates[fate] ?? 0) + 1;
		}

		// Mementos discovered.
		for (const mem of TCU_MEMENTOS) if (has(`mementos.${mem}`)) mementos[mem] = (mementos[mem] ?? 0) + 1;

		// The Witching Hour.
		if (has(k('accepted_fate'))) witchingHour.acceptedFate += 1;
		if (has(k('rejected_fate'))) witchingHour.rejectedFate += 1;
		if (has(k('witches_spell_broken'))) witchingHour.spellBroken += 1;
		if (has(k('witches_spell_cast'))) witchingHour.spellCast += 1;

		// At Death's Doorstep.
		if (has(k('investigators_escaped_the_spectral_realm'))) atDeathsDoorstep.escaped += 1;
		if (has(k('learned_nothing_of_the_lodges_schemes'))) atDeathsDoorstep.learnedNothing += 1;
		if (has(k('never_seen_again'))) atDeathsDoorstep.neverSeenAgain += 1;

		// The Secret Name.
		if (has(k('told_lodge_about_coven'))) secretName.toldLodge += 1;
		if (has(k('hid_knowledge_of_coven'))) secretName.hidCoven += 1;

		// The Wages of Sin.
		const heretics = counts[k('heretics_released')] ?? counts['heretics_released'];
		if (heretics !== undefined)
			wagesOfSin.hereticsReleasedMax =
				wagesOfSin.hereticsReleasedMax === null
					? heretics
					: Math.max(wagesOfSin.hereticsReleasedMax, heretics);
		if (has(k('survived_the_watchers_embrace'))) wagesOfSin.survivedWatcher += 1;

		// For the Greater Good.
		if (has(k('discovered_how_to_open_the_puzzle_box'))) forTheGreaterGood.openedPuzzleBox += 1;
		if (has(k('guardian_of_the_trap_emerged'))) forTheGreaterGood.guardianEmerged += 1;
		if (has(k('guardian_of_the_trap_defeated'))) forTheGreaterGood.guardianDefeated += 1;

		// In the Clutches of Chaos.
		if (has(k('asked_anette_for_assistance'))) clutchesOfChaos.askedAnette += 1;
		if (has(k('asked_sanford_for_assistance'))) clutchesOfChaos.askedSanford += 1;
		if (has(k('arrested_anette'))) clutchesOfChaos.arrestedAnette += 1;
		if (has(k('arrested_sanford'))) clutchesOfChaos.arrestedSanford += 1;
		if (has(k('assumed_control_of_the_silver_twilight_lodge'))) clutchesOfChaos.assumedControl += 1;

		// Endings — Union and Disillusion early faction victories (special).
		if (has(k('true_work_of_silver_twilight_lodge_has_begun'))) endings.lodgeVictory += 1;
		if (has(k('coven_of_keziah_holds_the_world_in_its_grasp'))) endings.covenVictory += 1;
		if (has(k('carl_sanford_possesses_the_secrets_of_the_universe'))) endings.sanfordPossesses += 1;
		if (has(k('anette_mason_is_possessed_by_evil'))) endings.anettePossessed += 1;

		// Endings — Before the Black Throne finale (slumber variants).
		if (has(k('azathoth_devoured_the_universe'))) endings.azathothDevoured += 1;
		if (has(k('azathoth_slumbers'))) {
			if (has(k('lead_investigator_joins_pipers'))) endings.slumbersJoinedPipers += 1;
			else if (has(k('signed_the_black_book'))) endings.slumbersBlackBook += 1;
			else endings.slumbersClean += 1;
		}
	}

	return [
		{
			family: TCU_FAMILY,
			plays: tcuRecords.length,
			allegiance,
			missingPersons,
			mementos,
			witchingHour,
			atDeathsDoorstep,
			secretName,
			wagesOfSin,
			forTheGreaterGood,
			clutchesOfChaos,
			endings
		}
	];
}
