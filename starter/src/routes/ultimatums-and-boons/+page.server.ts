import { type Campaign, refractions } from '@5argon/arkham-kohaku';
import { loadCampaign } from '$lib/campaign/load-campaign';
import {
	findUniqueScenarios,
	mergeEncounters,
	refractionMatchesScenario
} from '$lib/design/pages/tool/campaign/campaign-analyze';
import type { PageServerLoad } from './$types';

export interface RefractionCampaignLink {
	campaign: Campaign;
	/** 1-based scenario page of the campaign's setup tab, for a scenario-specific refraction. */
	scenarioPage?: number;
}

/** Where each refraction's campaign reference is, so the card can link to it. */
export const load: PageServerLoad = async () => {
	const refractionLinks: Record<string, RefractionCampaignLink> = {};
	for (const details of refractions) {
		const campaign = await loadCampaign(details.campaign);
		if (!campaign) continue;
		if (details.scenario === undefined) {
			refractionLinks[details.refraction] = { campaign: details.campaign };
			continue;
		}
		const index = findUniqueScenarios(campaign).findIndex((s) =>
			refractionMatchesScenario(
				details,
				s.kohakuScenario,
				mergeEncounters(s).map((e) => e.kohakuEncounterSet)
			)
		);
		refractionLinks[details.refraction] = {
			campaign: details.campaign,
			scenarioPage: index === -1 ? undefined : index + 1
		};
	}
	return { refractionLinks };
};
