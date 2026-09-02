/**
 * fhv-outcome-scenarios.ts — the FHV scenarios whose widget is the shared passport plus their
 * logged outcomes as ●/○ lists: which residents to picture, and the `campaign_notes` / villager
 * milestone keys to list, in groups (a heading per group; a group can hide until one hits).
 */
import * as m from '$lib/paraglide/messages.js';

export interface FhvOutcomeGroup {
	heading?: () => string;
	keys: string[];
	/** Render the group only once one of its outcomes has been reached. */
	onlyWhenHit?: boolean;
}

export interface FhvOutcomeScenarioDef {
	villagers: string[];
	groups: FhvOutcomeGroup[];
}

export const FHV_OUTCOME_SCENARIOS: Record<string, FhvOutcomeScenarioDef> = {
	written_in_rock: {
		villagers: ['simeon', 'leah'],
		groups: [
			{
				// The Atwood siblings' fate (one fork per play), best outcome first.
				keys: [
					'simeon.simeon_survived',
					'leah.leah_and_simeon_were_reunited',
					'leah.leah_saw_something_in_the_mine',
					'simeon.simeon_disappeared',
					'campaign_notes.survived_the_horrors_in_the_rock'
				]
			}
		]
	},
	the_silent_heath: {
		villagers: ['leah'],
		groups: [
			{
				keys: [
					'campaign_notes.laid_the_pearl_family_to_rest',
					'campaign_notes.remains_were_partially_recovered',
					'campaign_notes.madame_pearls_diary_was_recovered',
					'leah.searched_the_pearl_ruins'
				]
			}
		]
	},
	the_lost_sister: {
		villagers: ['theo', 'gideon'],
		groups: [
			{
				keys: [
					'campaign_notes.the_peters_family_was_reunited',
					'campaign_notes.elizabeth_peters_was_saved',
					'theo.theo_reconciled_with_helen',
					'gideon.gideon_found_his_treasure'
				]
			}
		]
	},
	the_thing_in_the_depths: {
		villagers: ['judith'],
		groups: [
			{ keys: ['campaign_notes.thing_in_the_depths_was_defeated', 'judith.judith_shared_a_grudge'] },
			{
				heading: m.campaign_fhv_thing_hybrid_heading,
				keys: [
					'campaign_notes.chelydran_hybrid_lived',
					'campaign_notes.chelydran_hybrid_perished',
					'campaign_notes.chelydran_hybrid_devoured'
				]
			}
		]
	},
	the_twisted_hollow: {
		villagers: ['rachel'],
		groups: [
			{
				keys: [
					'campaign_notes.bertie_was_rescued',
					'campaign_notes.bertie_was_lost_in_the_woods',
					'campaign_notes.mother_rachel_showed_the_way',
					'campaign_notes.lost_the_path',
					'campaign_notes.the_bear_was_wounded'
				]
			},
			{
				heading: m.campaign_fhv_hollow_bear_heading,
				keys: [
					'judith.judith_saved_your_ass',
					'theo.theo_distracted_the_bear',
					'rachel.mother_rachel_intervened'
				],
				onlyWhenHit: true
			}
		]
	}
};
