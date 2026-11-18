/** The Dunwich Legacy per-scenario tallies. */
import type { CampaignRecord } from '../records/campaign-record';
import { dwlWonLostForever } from '../outcomes/clear-status';
import { countNotes, readPlay, type Play } from '../records/play';
import type { Tally } from '../utils/tally';
import { bumpTally, emptyTally, ensureTally } from '../utils/tally';
import { defineCampaignBuilder } from './define';

const EXTRACURRICULAR = 'extracurricular_activity';
const HOUSE_ALWAYS_WINS = 'the_house_always_wins';

/** The three kidnapped scholars; `code` is their Ally story card. */
export const DWL_PERSONS: { id: string; code: string }[] = [
	{ id: 'warren_rice', code: '02061' },
	{ id: 'francis_morgan', code: '02080' },
	{ id: 'henry_armitage', code: '02040' }
];

/** The allies who can be sacrificed at Blood on the Altar; `code` is the card recorded in the
 *  `sacrificed` section. */
export const DWL_SACRIFICE_ALLIES: { id: string; code: string }[] = [
	...DWL_PERSONS,
	{ id: 'zebulon_whateley', code: '02217' },
	{ id: 'earl_sawyer', code: '02218' }
];

const NOTE = {
	necTook: 'took_necronomicon',
	necDestroyed: 'destroyed_necronomicon',
	necFailed: 'failed_to_recover_necronomicon',
	necStolen: 'necronomicon_stolen',
	silasKilled: 'killed_silas_bishop',
	silasRestored: 'restored_silas_bishop',
	silasBanished: 'banished_silas_bishop',
	broodEscaped: 'brood_escaped',
	noBroodEscaped: 'no_brood_escaped',
	calmed: 'calmed_townsfolk',
	warned: 'warned_townsfolk',
	enteredGate: 'entered_the_gate',
	yogEscaped: 'yog_sothoth_escaped',
	closedTear: 'closed_tear',
	yogFled: 'yog_sothoth_fled',
	yogBecameOne: 'yog_sothoth_became_one_with_reality'
} as const;

export interface DwlPersonTally {
	rescued: number;
	/** Plays that left them kidnapped at their own scenario. */
	leftKidnapped: number;
	/** Rescued, then kidnapped again on a lost Essex County Express / Miskatonic Museum. */
	snatchedAgain: number;
}

export interface CampaignDwl {
	family: string;
	plays: number;
	persons: Record<string, DwlPersonTally>;
	sacrifices: Record<string, { survived: Tally; sacrificed: Tally }>;
	silas: { killed: number; restored: number; banished: number };
	necronomicon: { took: number; destroyed: number; failed: number; stolen: number };
	/** Extra: how the Miskatonic Museum was entered. */
	miskatonicApproach: { brokeIn: number; spokeToAdam: number };
	/** Broods escaped at Undimensioned and Unseen, ascending: count → plays. */
	broods: { escaped: number; tally: Tally }[];
	townsfolk: { calmed: number; warned: number };
	wda: { enteredGate: number; yogEscaped: number };
	/** `wonLostForever` is Lost in Time and Space R2, known only from the Extra `final_act` choice. */
	finale: { closedTear: number; yogFled: number; yogBecameOne: number; wonLostForever: number };
	/** The epilogue read after a win: peaceful when the townsfolk were calmed. */
	epilogue: { peaceful: number; ominous: number };
}

/** Whether the opener was played before or after the other one; null unless both are in the route. */
export function openerPositionFromRecord(
	rec: CampaignRecord,
	scenarioId: string
): 'first' | 'second' | null {
	const route = rec.route ?? [];
	const self = route.indexOf(scenarioId);
	const other = route.indexOf(scenarioId === EXTRACURRICULAR ? HOUSE_ALWAYS_WINS : EXTRACURRICULAR);
	if (self < 0 || other < 0) return null;
	return self < other ? 'first' : 'second';
}

/** The Ascending the Hill version a play faced, from the Silas and Necronomicon notes; null if the
 *  play never reached Where Doom Awaits. */
export function ascendingHillVersionFromRecord(rec: CampaignRecord): 'v1' | 'v2' | 'v3' | null {
	const p = readPlay(rec);
	if (!p.has(NOTE.enteredGate) && !p.has(NOTE.yogEscaped)) return null;
	if (p.has(NOTE.silasRestored)) return 'v1';
	if (p.has(NOTE.necFailed) || p.has(NOTE.necStolen)) return 'v2';
	return 'v3';
}

function broodsEscaped(p: Play): number | null {
	if (p.has(NOTE.noBroodEscaped)) return 0;
	return p.has(NOTE.broodEscaped) ? (p.count(NOTE.broodEscaped) ?? 0) : null;
}

export const buildDwl = defineCampaignBuilder<CampaignDwl>('dwl', (plays, log) => {
	const wonLostForever = (p: Play) =>
		dwlWonLostForever(log, p.rec.recorded, p.rec.scenarioChoices);

	const persons: Record<string, DwlPersonTally> = {};
	for (const { id } of DWL_PERSONS) {
		const rescued = plays.filter((p) => p.has(`${id}_rescued`));
		const kidnapped = plays.filter((p) => p.has(`${id}_kidnapped`));
		const snatchedAgain = rescued.filter((p) => p.has(`${id}_kidnapped`)).length;
		persons[id] = {
			rescued: rescued.length,
			leftKidnapped: kidnapped.length - snatchedAgain,
			snatchedAgain
		};
	}

	const sacrifices: CampaignDwl['sacrifices'] = {};
	for (const { id, code } of DWL_SACRIFICE_ALLIES) {
		const t = (sacrifices[id] = { survived: emptyTally(), sacrificed: emptyTally() });
		for (const p of plays) {
			if (p.has(`${id}_survived`)) bumpTally(t.survived, p.tier);
			if (p.items('sacrificed').has(code)) bumpTally(t.sacrificed, p.tier);
		}
	}

	const broodTallies: Record<string, Tally> = {};
	for (const p of plays) {
		const n = broodsEscaped(p);
		if (n !== null) bumpTally(ensureTally(broodTallies, String(n)), p.tier);
	}

	const approach = (value: string) =>
		plays.filter((p) => p.choice('the_miskatonic_museum', 'approach') === value).length;

	const finale = countNotes(plays, {
		closedTear: NOTE.closedTear,
		yogFled: NOTE.yogFled,
		yogBecameOne: NOTE.yogBecameOne
	});
	const won = plays.filter(
		(p) => p.has(NOTE.closedTear) || p.has(NOTE.yogFled) || wonLostForever(p)
	);

	return {
		persons,
		sacrifices,
		silas: countNotes(plays, {
			killed: NOTE.silasKilled,
			restored: NOTE.silasRestored,
			banished: NOTE.silasBanished
		}),
		necronomicon: countNotes(plays, {
			took: NOTE.necTook,
			destroyed: NOTE.necDestroyed,
			failed: NOTE.necFailed,
			stolen: NOTE.necStolen
		}),
		miskatonicApproach: { brokeIn: approach('broke_in'), spokeToAdam: approach('spoke_to_adam') },
		broods: Object.entries(broodTallies)
			.map(([n, tally]) => ({ escaped: Number(n), tally }))
			.sort((a, b) => a.escaped - b.escaped),
		townsfolk: countNotes(plays, { calmed: NOTE.calmed, warned: NOTE.warned }),
		wda: countNotes(plays, { enteredGate: NOTE.enteredGate, yogEscaped: NOTE.yogEscaped }),
		finale: { ...finale, wonLostForever: plays.filter(wonLostForever).length },
		epilogue: {
			peaceful: won.filter((p) => p.has(NOTE.calmed)).length,
			ominous: won.filter((p) => !p.has(NOTE.calmed)).length
		}
	};
});
