/** Guardians of the Abyss: The Eternal Slumber's judgment of Neith and the dreamers left in the Abyss, and The Night's Usurper's fate of Xzharah. */
import { tallyValues } from '../../records/play';
import { defineStandalonePage } from '../define';
import type { StandaloneRules } from '../rules';

const TES = 'the_eternal_slumber';
const TNU = 'the_nights_usurper';

export const TES_RULES: StandaloneRules = {
	scenario: TES,
	prefix: 'tes',
	endings: [
		{
			id: 'destroyed_neith',
			kind: 'win',
			resolutions: ['R1'],
			notes: ['tes_curse_of_slumber_lifted'],
			code: '83055'
		},
		{
			id: 'spared_neith',
			kind: 'win',
			resolutions: ['R2'],
			notes: ['tes_aware_of_xzharahs_plan'],
			code: '83056'
		},
		{
			id: 'schemes_continue',
			kind: 'loss',
			resolutions: ['no_resolution'],
			notes: ['tes_brotherhood_schemes_continue'],
			code: '83013'
		}
	],
	cards: [
		{
			code: '83055',
			earned: (p) => p.resolution(TES) === 'R1' || p.has('tes_curse_of_slumber_lifted')
		},
		{
			code: '83056',
			earned: (p) => p.resolution(TES) === 'R2' || p.has('tes_aware_of_xzharahs_plan')
		}
	]
};

export const buildEternalSlumber = defineStandalonePage(TES_RULES, (plays) => ({
	/** Plays per Strength of the Abyss at the end (lower is better). */
	dreamers: tallyValues(plays, (p) => p.count('tes_dreamers_in_the_abyss'))
}));

export const TNU_RULES: StandaloneRules = {
	scenario: TNU,
	prefix: 'tnu',
	endings: [
		{
			id: 'abyss_saved',
			kind: 'win',
			resolutions: ['R2'],
			notes: ['tnu_the_abyss_was_saved'],
			code: '83058'
		},
		{
			id: 'joined_xzharah',
			kind: 'special',
			resolutions: ['R3'],
			notes: ['tnu_joined_xzharah'],
			code: '83057'
		},
		{
			id: 'day_of_reckoning',
			kind: 'loss',
			resolutions: ['R1', 'no_resolution'],
			notes: ['tnu_day_of_reckoning_is_coming'],
			code: '83027a'
		}
	],
	cards: [
		{
			code: '83058',
			earned: (p) => p.resolution(TNU) === 'R2' || p.has('tnu_the_abyss_was_saved')
		},
		{ code: '83057', earned: (p) => p.resolution(TNU) === 'R3' || p.has('tnu_joined_xzharah') }
	]
};

export const buildNightsUsurper = defineStandalonePage(TNU_RULES);
