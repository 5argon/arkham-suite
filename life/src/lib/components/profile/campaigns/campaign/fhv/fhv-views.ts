/** Each FHV outcome passport's logged forks (`FHV_PASSPORTS`) under short labels and headings. */
import { fhvVillagerName } from '$lib/campaign/campaigns/fhv';
import * as m from '$lib/paraglide/messages.js';

export interface FhvViewGroup {
	heading?: () => string;
	stats: { key: string; label: () => string }[];
}

const villager = (id: string) => () => fhvVillagerName(id);

export const FHV_SCENARIO_VIEWS: Record<string, FhvViewGroup[]> = {
	written_in_rock: [
		{
			heading: villager('simeon'),
			stats: [
				{ key: 'simeon.simeon_survived', label: m.campaign_fhv_sv_survived },
				{ key: 'simeon.simeon_disappeared', label: m.campaign_fhv_sv_disappeared }
			]
		},
		{
			heading: villager('leah'),
			stats: [
				{ key: 'leah.leah_and_simeon_were_reunited', label: m.campaign_fhv_sv_reunited_simeon },
				{ key: 'leah.leah_saw_something_in_the_mine', label: m.campaign_fhv_sv_saw_mine }
			]
		},
		{
			stats: [
				{ key: 'campaign_notes.survived_the_horrors_in_the_rock', label: m.campaign_fhv_sv_horrors }
			]
		}
	],
	hemlock_house: [
		{ stats: [{ key: 'hidden.found_little_sylvie', label: m.campaign_fhv_house_sylvie }] }
	],
	the_silent_heath: [
		{
			heading: m.campaign_fhv_sv_pearl_heading,
			stats: [
				{
					key: 'campaign_notes.laid_the_pearl_family_to_rest',
					label: m.campaign_fhv_sv_laid_to_rest
				},
				{
					key: 'campaign_notes.remains_were_partially_recovered',
					label: m.campaign_fhv_sv_remains_partial
				},
				{ key: 'campaign_notes.madame_pearls_diary_was_recovered', label: m.campaign_fhv_sv_diary }
			]
		},
		{
			heading: villager('leah'),
			stats: [{ key: 'leah.searched_the_pearl_ruins', label: m.campaign_fhv_sv_searched_ruins }]
		}
	],
	the_lost_sister: [
		{
			heading: m.campaign_fhv_sv_peters_heading,
			stats: [
				{ key: 'campaign_notes.the_peters_family_was_reunited', label: m.campaign_fhv_sv_reunited },
				{
					key: 'campaign_notes.elizabeth_peters_was_saved',
					label: m.campaign_fhv_sv_elizabeth_saved
				},
				{ key: 'theo.theo_reconciled_with_helen', label: m.campaign_fhv_sv_reconciled_helen }
			]
		},
		{
			heading: villager('gideon'),
			stats: [{ key: 'gideon.gideon_found_his_treasure', label: m.campaign_fhv_sv_found_treasure }]
		}
	],
	the_thing_in_the_depths: [
		{
			stats: [
				{
					key: 'campaign_notes.thing_in_the_depths_was_defeated',
					label: m.campaign_fhv_sv_thing_defeated
				},
				{ key: 'judith.judith_shared_a_grudge', label: m.campaign_fhv_sv_shared_grudge }
			]
		},
		{
			heading: m.campaign_fhv_thing_hybrid_heading,
			stats: [
				{ key: 'campaign_notes.chelydran_hybrid_lived', label: m.campaign_fhv_sv_lived },
				{ key: 'campaign_notes.chelydran_hybrid_perished', label: m.campaign_fhv_sv_perished },
				{ key: 'campaign_notes.chelydran_hybrid_devoured', label: m.campaign_fhv_sv_devoured }
			]
		}
	],
	the_twisted_hollow: [
		{
			heading: m.campaign_fhv_sv_bertie_heading,
			stats: [
				{ key: 'campaign_notes.bertie_was_rescued', label: m.campaign_fhv_sv_rescued },
				{
					key: 'campaign_notes.bertie_was_lost_in_the_woods',
					label: m.campaign_fhv_sv_lost_in_woods
				}
			]
		},
		{
			heading: m.campaign_fhv_sv_path_heading,
			stats: [
				{
					key: 'campaign_notes.mother_rachel_showed_the_way',
					label: m.campaign_fhv_sv_rachel_showed_way
				},
				{ key: 'campaign_notes.lost_the_path', label: m.campaign_fhv_sv_lost_path }
			]
		},
		{
			heading: m.campaign_fhv_hollow_bear_heading,
			stats: [
				{ key: 'campaign_notes.the_bear_was_wounded', label: m.campaign_fhv_sv_bear_wounded },
				{ key: 'judith.judith_saved_your_ass', label: villager('judith') },
				{ key: 'theo.theo_distracted_the_bear', label: villager('theo') },
				{ key: 'rachel.mother_rachel_intervened', label: villager('rachel') }
			]
		}
	],
	the_longest_night: [
		{
			heading: m.campaign_fhv_ln_captives_heading,
			stats: [
				{ key: 'campaign_notes.captives_were_saved', label: m.campaign_fhv_sv_captives_saved },
				{
					key: 'campaign_notes.many_captives_were_lost',
					label: m.campaign_fhv_sv_captives_many_lost
				},
				{
					key: 'campaign_notes.all_the_captives_were_lost',
					label: m.campaign_fhv_sv_captives_all_lost
				}
			]
		},
		{
			stats: [
				{ key: 'campaign_notes.faced_the_night_alone', label: m.campaign_fhv_sv_night_alone },
				{ key: 'campaign_notes.dr_marquez_has_a_plan', label: m.campaign_fhv_sv_marquez_plan }
			]
		}
	]
};
