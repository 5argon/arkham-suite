import {
	type Campaign,
	convert,
	type EncounterSet,
	encounterSet,
	productCoreSets
} from '@5argon/arkham-kohaku';

/**
 * UI EncounterSetFlag type from the ui package
 */
export type EncounterSetFlag = 'core' | 'return-to' | 'scenario';

/**
 * Determine the encounter set flag based on kohaku's encounter set data.
 *
 * @param encounterSetEnum - The encounter set to check
 * @param campaign - Optional campaign context. If provided, core scenario name encounter sets
 *                   will be promoted to 'scenario' flag when viewing their own core campaign.
 */
export function getEncounterSetFlag(
	encounterSetEnum: EncounterSet,
	campaign?: Campaign
): EncounterSetFlag | undefined {
	if (encounterSet.isReturnToCommonEncounterSet(encounterSetEnum)) {
		return 'return-to';
	}
	if (encounterSet.isScenarioExclusiveEncounterSet(encounterSetEnum)) {
		return 'scenario';
	}

	// Check if this is a core scenario name encounter set in its own core campaign
	if (campaign && encounterSet.isCoreScenarioNameEncounterSet(encounterSetEnum)) {
		const campaignProduct = convert.campaignToProduct(campaign);
		if (productCoreSets.includes(campaignProduct)) {
			// Promote to scenario group when viewing core campaign
			return 'scenario';
		}
	}

	if (encounterSet.isCoreEncounterSet(encounterSetEnum)) {
		return 'core';
	}
	// Common/reused encounter sets have no flag
	return undefined;
}
