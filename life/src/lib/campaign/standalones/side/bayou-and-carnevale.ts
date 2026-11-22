/** Curse of the Rougarou's fate of the curse, and Carnevale of Horrors' Cnidathqua, revelers and masks. */
import { tallyPlays, type Play } from '../../records/play';
import { defineStandalonePage } from '../define';
import { pickedCards, type StandaloneRules } from '../rules';

const ROU = 'curse_of_the_rougarou';
const COH = 'carnevale_of_horrors';

export const ROUGAROU_RULES: StandaloneRules = {
	scenario: ROU,
	prefix: 'rou',
	endings: [
		{
			id: 'destroyed',
			kind: 'win',
			resolutions: ['R2'],
			notes: ['rougarou_destroyed_and_curse_is_lifted'],
			code: '81019'
		},
		{
			id: 'embraced',
			kind: 'special',
			resolutions: ['R3'],
			notes: ['rougarou_escaped_and_embrace_curse'],
			code: '81030'
		},
		{
			id: 'haunts',
			kind: 'loss',
			resolutions: ['R1', 'no_resolution'],
			notes: ['rougarou_continues_to_haunt_the_bayou'],
			code: '81028'
		}
	],
	cards: [
		{
			code: '81019',
			earned: (p) => p.resolution(ROU) === 'R2' || p.has('rougarou_destroyed_and_curse_is_lifted')
		},
		{
			code: '81030',
			earned: (p) => p.resolution(ROU) === 'R3' || p.has('rougarou_escaped_and_embrace_curse')
		}
	]
};

export const buildRougarou = defineStandalonePage(ROUGAROU_RULES);

const saved = (p: Play) => p.choice(COH, 'ask_innocent_revelers_saved');

export const CARNEVALE_RULES: StandaloneRules = {
	scenario: COH,
	prefix: 'coh',
	endings: [
		{
			id: 'retreated',
			kind: 'best',
			resolutions: ['R2'],
			notes: ['coh_cnidathqua_retreated'],
			code: '82027'
		},
		{
			id: 'sun_banished',
			kind: 'win',
			resolutions: ['R1'],
			notes: ['coh_sun_banished_cnidathqua'],
			code: '82006b'
		},
		{
			id: 'sacrificed',
			kind: 'loss',
			resolutions: ['no_resolution'],
			notes: ['coh_many_were_sacrificed_to_cnidathqua'],
			code: '82002b'
		}
	],
	cards: [
		{ code: '82022', earned: (p) => saved(p) === 'three' },
		...['82025', '82024', '82023', '82026'].map((code) => ({
			code,
			earned: (p: Play) => pickedCards(p, COH, 'choose_masks').includes(code)
		}))
	]
};

export const buildCarnevale = defineStandalonePage(CARNEVALE_RULES, (plays) => ({
	revelers: {
		three: tallyPlays(plays, (p) => saved(p) === 'three'),
		oneOrTwo: tallyPlays(plays, (p) => saved(p) === 'one_or_two'),
		noneLost: tallyPlays(
			plays,
			(p) => saved(p) === 'none' && p.choice(COH, 'ask_innocent_revelers_killed') === 'none'
		),
		sacrificed: tallyPlays(
			plays,
			(p) => saved(p) === 'none' && p.choice(COH, 'ask_innocent_revelers_killed') === 'one_or_more'
		)
	}
}));
