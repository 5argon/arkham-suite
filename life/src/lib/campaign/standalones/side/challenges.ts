/**
 * The parallel-investigator challenge scenarios and Enthralling Encore: the advanced cards each play
 * earned or forced, each challenge's own score, and The Meddling of Meowlathotep's starting district.
 */
import { choiceNumber, tallyPlays, tallyValues, type Play } from '../../records/play';
import { bumpTally, emptyTally, type Tally } from '../../utils/tally';
import { defineStandalonePage } from '../define';
import { pickedCards, type StandaloneRules } from '../rules';

/** A swap question and which of its options moves each card. */
interface Swap {
	id: string;
	signature: string;
	weakness: string;
}

/** How a challenge's score question reads: a number, or one of an ordered list of options. */
export type ChallengeScore =
	| {
			choice: string;
			kind: 'number';
			/** The track's length; a higher play extends it. */
			max: number;
	  }
	| { choice: string; kind: 'options'; options: readonly string[] };

export interface Challenge {
	scenario: string;
	prefix: string;
	/** The parallel investigator. */
	investigator: string;
	/** Original → advanced signature card, and original → advanced signature weakness. */
	signature: readonly [string, string];
	weakness: readonly [string, string];
	/** Win: may upgrade the signature or downgrade the advanced weakness. */
	good: Swap;
	/** Loss: must upgrade the weakness or downgrade the advanced signature. */
	bad: Swap;
	win: string[];
	loss: string[];
	/** The loss tile's face: the challenge's villain. */
	villain?: string;
	score?: ChallengeScore;
}

export const CHALLENGES: readonly Challenge[] = [
	{
		scenario: 'read_or_die',
		prefix: 'rod',
		investigator: '90001',
		signature: ['01008', '90002'],
		weakness: ['01009', '90003'],
		good: { id: 'daisy_good_swap', signature: 'tote_bag', weakness: 'necronomicon' },
		bad: { id: 'daisy_bad_swap', signature: 'tote_bag', weakness: 'necronomicon' },
		win: ['R1'],
		loss: ['R2', 'no_resolution'],
		villain: '90007',
		score: { choice: 'ask_daisy_tomes', kind: 'number', max: 8 }
	},
	{
		scenario: 'all_or_nothing',
		prefix: 'aon',
		investigator: '90008',
		signature: ['01010', '90009'],
		weakness: ['01011', '90010'],
		good: { id: 'skids_good_swap', signature: 'tote_bag', weakness: 'necronomicon' },
		bad: { id: 'skids_bad_swap', signature: 'tote_bag', weakness: 'necronomicon' },
		win: ['R1'],
		loss: ['R2', 'no_resolution'],
		villain: '90015',
		score: {
			choice: 'ask_act2_resources',
			kind: 'options',
			options: [
				'resources_10',
				'resources_20',
				'resources_30',
				'resource_40',
				'resource_50',
				'resource_60'
			]
		}
	},
	{
		scenario: 'bad_blood',
		prefix: 'bb',
		investigator: '90017',
		signature: ['01012', '90018'],
		weakness: ['01013', '90019'],
		good: { id: 'agnes_good_swap', signature: 'heirloom', weakness: 'dark_memory' },
		bad: { id: 'agnes_bad_swap', signature: 'heirloom', weakness: 'dark_memory' },
		win: ['R1'],
		loss: ['R2', 'no_resolution'],
		villain: '90023',
		score: { choice: 'ask_agnes_memories', kind: 'number', max: 9 }
	},
	{
		scenario: 'by_the_book',
		prefix: 'btb',
		investigator: '90024',
		signature: ['01006', '90030'],
		weakness: ['01007', '90031'],
		good: { id: 'roland_good_swap', signature: 'gun', weakness: 'crime' },
		bad: { id: 'roland_bad_swap', signature: 'tote_bag', weakness: 'necronomicon' },
		win: ['R1', 'no_resolution'],
		loss: ['R2'],
		villain: '90033b',
		score: {
			choice: 'ask_cultist_enemies',
			kind: 'options',
			options: ['0_3', '4_5', '6_7', '8_9', '10']
		}
	},
	{
		scenario: 'red_tide_rising',
		prefix: 'rtr',
		investigator: '90037',
		signature: ['01014', '90039'],
		weakness: ['01015', '90040'],
		good: { id: 'wendy_good_swap', signature: 'amulet', weakness: 'abandoned' },
		bad: { id: 'wendy_bad_swap', signature: 'amulet', weakness: 'abandoned' },
		win: ['R1', 'no_resolution_resigned'],
		loss: ['R2', 'no_resolution_defeated'],
		villain: '90045a',
		score: { choice: 'ask_victory_cards', kind: 'number', max: 12 }
	},
	{
		scenario: 'laid_to_rest',
		prefix: 'ltr',
		investigator: '90049',
		signature: ['02012', '90050'],
		weakness: ['02013', '90051'],
		good: { id: 'jim_good_swap', signature: 'trumpet', weakness: 'final' },
		bad: { id: 'jim_bad_swap', signature: 'trumpet', weakness: 'final' },
		win: ['R1'],
		loss: ['R2', 'no_resolution_defeated'],
		villain: '90057a'
	},
	{
		scenario: 'relics_of_the_past',
		prefix: 'rotp',
		investigator: '90062',
		signature: ['08008', '90063'],
		weakness: ['08009', '90064'],
		good: { id: 'jack_good_swap', signature: 'gun', weakness: 'crime' },
		bad: { id: 'jack_bad_swap', signature: 'tote_bag', weakness: 'necronomicon' },
		win: ['R1'],
		loss: ['no_resolution_defeated'],
		score: { choice: 'earn_jack_xp', kind: 'number', max: 4 }
	}
];

export function challengeRules(c: Challenge): StandaloneRules {
	return {
		scenario: c.scenario,
		prefix: c.prefix,
		endings: [
			{ id: 'won', kind: 'win', resolutions: c.win, code: c.investigator },
			{ id: 'lost', kind: 'loss', resolutions: c.loss, code: c.villain }
		]
	};
}

export interface ChallengeBlob {
	swaps: {
		signatureUpgraded: Tally;
		weaknessDowngraded: Tally;
		unchanged: Tally;
		weaknessUpgraded: Tally;
		signatureDowngraded: Tally;
	};
	/** Plays per score: the number, or the option's index in `score.options`. */
	scores: Record<string, Tally>;
}

/** A challenge's score of one play, as a number or the option's position. */
export function challengeScore(p: Play, c: Challenge): number | undefined {
	if (!c.score) return undefined;
	if (c.score.kind === 'number') return choiceNumber(p, c.scenario, c.score.choice);
	const i = c.score.options.indexOf(p.choice(c.scenario, c.score.choice) ?? '');
	return i < 0 ? undefined : i;
}

export function buildChallenge(c: Challenge) {
	return defineStandalonePage<ChallengeBlob>(challengeRules(c), (plays) => {
		const answer = (p: Play, s: Swap) => p.choice(c.scenario, s.id);
		return {
			swaps: {
				signatureUpgraded: tallyPlays(plays, (p) => answer(p, c.good) === c.good.signature),
				weaknessDowngraded: tallyPlays(plays, (p) => answer(p, c.good) === c.good.weakness),
				unchanged: tallyPlays(plays, (p) => answer(p, c.good) === 'neither'),
				weaknessUpgraded: tallyPlays(plays, (p) => answer(p, c.bad) === c.bad.weakness),
				signatureDowngraded: tallyPlays(plays, (p) => answer(p, c.bad) === c.bad.signature)
			},
			scores: tallyValues(plays, (p) => challengeScore(p, c))
		};
	});
}

/** Enthralling Encore: the parallel investigators whose signature or weakness it upgraded, by base code. */
export const ENCORE_INVESTIGATORS = [
	{ base: '01001', parallel: '90024' },
	{ base: '01002', parallel: '90001' },
	{ base: '01003', parallel: '90008' },
	{ base: '01004', parallel: '90017' },
	{ base: '01005', parallel: '90037' },
	{ base: '02001', parallel: '90059' },
	{ base: '02002', parallel: '90078' },
	{ base: '02003', parallel: '90084' },
	{ base: '02004', parallel: '90049' },
	{ base: '02005', parallel: '90046' },
	{ base: '03006', parallel: '90087' },
	{ base: '04004', parallel: '90081' },
	{ base: '08007', parallel: '90062' }
] as const;

const ENC = 'enthralling_encore';

export const ENCORE_RULES: StandaloneRules = {
	scenario: ENC,
	prefix: 'enc',
	endings: [
		{ id: 'won', kind: 'win', resolutions: ['R1'], code: '90097' },
		{ id: 'lost', kind: 'loss', resolutions: ['no_resolution_defeated'] }
	]
};

export const buildEncore = defineStandalonePage(ENCORE_RULES, (plays) => {
	const upgrades: Record<string, { signature: Tally; weakness: Tally }> = {};
	for (const inv of ENCORE_INVESTIGATORS)
		upgrades[inv.base] = { signature: emptyTally(), weakness: emptyTally() };
	for (const p of plays) {
		for (const code of pickedCards(p, ENC, 'choose_reward_card'))
			if (upgrades[code]) bumpTally(upgrades[code].signature, p.tier);
		for (const code of pickedCards(p, ENC, 'choose_punishment_card'))
			if (upgrades[code]) bumpTally(upgrades[code].weakness, p.tier);
	}
	return { upgrades };
});

/** The Meddling of Meowlathotep's four starting districts, by the two scents followed. */
export const MOM_DISTRICTS = ['slobbertown', 'snoutside', 'beasttown', 'tailside'] as const;

const MOM = 'meddling_of_meowlathotep';

export const MOM_RULES: StandaloneRules = {
	scenario: MOM,
	prefix: 'mom',
	endings: [
		{ id: 'dog_people', kind: 'win', resolutions: ['R1'] },
		{ id: 'cat_people', kind: 'loss', resolutions: ['R2', 'no_resolution'] }
	]
};

export const buildMeowlathotep = defineStandalonePage(MOM_RULES, (plays) => {
	const districts = {} as Record<(typeof MOM_DISTRICTS)[number], { plays: Tally; won: Tally }>;
	for (const d of MOM_DISTRICTS) {
		const started = (p: Play) => p.choice(MOM, 'start_location') === d;
		districts[d] = {
			plays: tallyPlays(plays, started),
			won: tallyPlays(plays, (p) => started(p) && p.resolution(MOM) === 'R1')
		};
	}
	return { districts };
});
