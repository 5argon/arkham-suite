/** The side stories' own widgets and their page layouts. */
import * as m from '$lib/paraglide/messages.js';
import { standaloneWidgets } from '../../widget-def';
import { standaloneLayout } from './layout';

const page = (
	scenario: string,
	widgets: Parameters<typeof standaloneWidgets>[1],
	own: Parameters<typeof standaloneLayout>[1]
) =>
	standaloneWidgets(`side.${scenario}`, widgets, () => standaloneLayout(`side.${scenario}`, own));

export default [
	page(
		'fortune_and_folly_part_1',
		[
			{ id: 'fofHeist', label: m.standalone_fof_heist_title, fullWidth: true },
			{ id: 'fofStakeout', label: m.standalone_fof_stakeout_title }
		],
		{ lead: ['fofHeist'], halves: ['fofStakeout'] }
	),
	page(
		'the_midwinter_gala',
		[
			{ id: 'mwgScore', label: m.standalone_mwg_score_title },
			{ id: 'mwgFactions', label: m.standalone_mwg_factions_title }
		],
		{ halves: ['mwgScore', 'mwgFactions'] }
	),
	page('carnevale_of_horrors', [{ id: 'cohRevelers', label: m.standalone_coh_revelers_title }], {
		halves: ['cohRevelers']
	}),
	page('the_eternal_slumber', [{ id: 'tesDreamers', label: m.standalone_tes_dreamers_title }], {
		halves: ['tesDreamers']
	}),
	page(
		'murder_at_the_excelsior_hotel',
		[
			{ id: 'mehCulprit', label: m.standalone_meh_culprit_title, fullWidth: true },
			{ id: 'mehMonroe', label: m.standalone_meh_monroe_title }
		],
		{ lead: ['mehCulprit'], halves: ['mehMonroe'] }
	),
	page('film_fatale', [{ id: 'filmFilms', label: m.standalone_film_films_title }], {
		halves: ['filmFilms']
	}),
	page(
		'blob_that_ate_everything',
		[{ id: 'blobDevoured', label: m.standalone_blob_devoured_title }],
		{
			halves: ['blobDevoured']
		}
	),
	page(
		'blob_that_ate_everything_else',
		[{ id: 'blobElseDevoured', label: m.standalone_blob_devoured_title }],
		{ halves: ['blobElseDevoured'] }
	),
	page('in_the_labyrinths_of_lunacy', [{ id: 'lolGroups', label: m.standalone_lol_groups_title }], {
		halves: ['lolGroups']
	}),
	page(
		'meddling_of_meowlathotep',
		[{ id: 'momDistricts', label: m.standalone_mom_districts_title }],
		{
			halves: ['momDistricts']
		}
	),
	page(
		'machinations_through_time',
		[{ id: 'mttVariants', label: m.standalone_mtt_variants_title }],
		{
			halves: ['mttVariants']
		}
	),
	page(
		'enthralling_encore',
		[{ id: 'encUpgrades', label: m.standalone_enc_upgrades_title, fullWidth: true }],
		{
			lead: ['encUpgrades']
		}
	)
];
