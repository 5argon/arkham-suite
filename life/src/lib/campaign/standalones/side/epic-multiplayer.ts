/** The epic multiplayer scenarios: The Labyrinths of Lunacy's groups and escapes, War of the Outer Gods' warring cults and relics, and Machinations Through Time's timeline. */
import { tallyPlays, type Play } from '../../records/play';
import type { Tally } from '../../utils/tally';
import { defineStandalonePage } from '../define';
import { pickedCards, type StandaloneRules } from '../rules';

const LOL = 'in_the_labyrinths_of_lunacy';
const WOG = 'war_of_the_outer_gods';
const MTT = 'machinations_through_time';

/** Each group's chamber, the face of its tile. */
export const LOL_GROUPS = [
	{ id: 'group_a', code: '70016' },
	{ id: 'group_b', code: '70019' },
	{ id: 'group_c', code: '70023' }
] as const;

/** Groups that escaped, by resolution. */
const ESCAPED: Record<string, number> = { R2: 1, R3: 2, R4: 3 };

export const LOL_RULES: StandaloneRules = {
	scenario: LOL,
	prefix: 'lol',
	endings: [
		{ id: 'all_escaped', kind: 'best', resolutions: ['R4'], code: '70015' },
		{ id: 'lives_on', kind: 'win', resolutions: ['R3'], code: '70048' },
		{ id: 'new_guest', kind: 'win', resolutions: ['R2'], code: '70039' },
		{ id: 'ritual', kind: 'loss', resolutions: ['R1', 'no_resolution'], code: '70006' }
	]
};

export const buildLabyrinths = defineStandalonePage(LOL_RULES, (plays) => {
	const groups = {} as Record<(typeof LOL_GROUPS)[number]['id'], { plays: Tally; escaped: Tally }>;
	for (const g of LOL_GROUPS) {
		const was = (p: Play) => p.choice(LOL, 'ask_group') === g.id || p.has(`hidden.${g.id}`);
		groups[g.id] = {
			plays: tallyPlays(plays, was),
			escaped: tallyPlays(plays, (p) => was(p) && (ESCAPED[p.resolution(LOL) ?? ''] ?? 0) > 0)
		};
	}
	return {
		groups,
		epic: tallyPlays(
			plays,
			(p) =>
				p.choice(LOL, 'ask_epic_multiplayer') === 'epic_multiplayer' ||
				p.has('hidden.epic_multiplayer')
		),
		/** The most groups that escaped together in one play. */
		mostEscaped: Math.max(0, ...plays.map((p) => ESCAPED[p.resolution(LOL) ?? ''] ?? 0))
	};
});

const inLead = (faction: string) => (p: Play) =>
	p.resolution(WOG) === 'no_resolution' && p.choice(WOG, 'ask_faction_in_lead') === faction;
const won =
	(...resolutions: string[]) =>
	(p: Play) =>
		resolutions.includes(p.resolution(WOG) ?? '');

export const WOG_RULES: StandaloneRules = {
	scenario: WOG,
	prefix: 'wog',
	endings: [
		{ id: 'hub_sealed', kind: 'best', resolutions: ['R1'], code: '86024' },
		{ id: 'red_slain', kind: 'win', resolutions: ['R2'], code: '86047' },
		{ id: 'blue_slain', kind: 'win', resolutions: ['R3'], code: '86035' },
		{ id: 'green_slain', kind: 'win', resolutions: ['R4'], code: '86041' },
		{ id: 'red_rules', kind: 'loss', resolutions: ['R5'], when: inLead('red'), code: '86046' },
		{ id: 'blue_rules', kind: 'loss', resolutions: ['R6'], when: inLead('blue'), code: '86034' },
		{ id: 'green_rules', kind: 'loss', resolutions: ['R7'], when: inLead('green'), code: '86040' },
		{ id: 'defeated', kind: 'loss', resolutions: ['no_resolution'] }
	],
	cards: [
		{ code: '86051', earned: won('R1', 'R2', 'R3', 'R4') },
		{ code: '86052', earned: won('R1') },
		{ code: '86055', earned: won('R2') },
		{ code: '86053', earned: won('R3') },
		{ code: '86054', earned: won('R4') }
	]
};

export const buildOuterGods = defineStandalonePage(WOG_RULES);

/** Machinations and plots drawn at setup, each a card. */
export const MTT_MACHINATIONS = [
	{ id: 'bitter_rivalry', code: '87033' },
	{ id: 'redeem_a_former_colleague', code: '87034' },
	{ id: 'uneasy_alliance', code: '87035' }
] as const;
export const MTT_PLOTS = [
	{ id: 'anomalies_in_spacetime', code: '87038' },
	{ id: 'mob_troubles', code: '87039' },
	{ id: 'unspeakable_abomination', code: '87042' }
] as const;

const edwin = (option: string) => (p: Play) =>
	p.resolution(MTT) === 'no_resolution' && p.choice(MTT, 'ask_edwin_bennet_in_play') === option;

export const MTT_RULES: StandaloneRules = {
	scenario: MTT,
	prefix: 'mtt',
	endings: [
		{ id: 'restored', kind: 'win', resolutions: ['R1'], code: '87004' },
		{
			id: 'trusted_edwin',
			kind: 'loss',
			resolutions: ['R2'],
			when: edwin('asset'),
			code: '87036b'
		},
		{
			id: 'edwin_unimpeded',
			kind: 'loss',
			resolutions: ['R3'],
			when: edwin('enemy'),
			code: '87036a'
		},
		{
			id: 'edwin_vanished',
			kind: 'loss',
			resolutions: ['R4'],
			when: edwin('neither'),
			code: '87005a'
		},
		{ id: 'hounds', kind: 'loss', resolutions: ['no_resolution'], code: '87045' }
	],
	cards: ['87014', '87023', '87032'].map((code) => ({
		code,
		earned: (p: Play) => pickedCards(p, MTT, 'ask_assets_in_play').includes(code)
	}))
};

export const buildMachinations = defineStandalonePage(MTT_RULES, (plays) => {
	const drawn = (choice: string, list: readonly { id: string }[]) => {
		const out: Record<string, Tally> = {};
		for (const x of list) out[x.id] = tallyPlays(plays, (p) => p.choice(MTT, choice) === x.id);
		return out;
	};
	return {
		machinations: drawn('machination', MTT_MACHINATIONS),
		plots: drawn('plot', MTT_PLOTS)
	};
});
