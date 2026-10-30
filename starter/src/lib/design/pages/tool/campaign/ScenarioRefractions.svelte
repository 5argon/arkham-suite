<script lang="ts">
	import {
		type Campaign,
		chapterOneRefractions,
		chapterTwoRefractions,
		getScenarioData,
		refractions,
		returnToCampaignOriginal
	} from '@5argon/arkham-kohaku';
	import { SectionSeparator, UltimatumBoonItem } from '@5argon/arkham-life-ui';
	import type { Scenario } from '$lib/core/campaign';
	import { ultimatumBoonImagePath } from '$lib/ultimatum-boon';
	import { mergeEncounters } from './campaign-analyze';

	let { campaign, scenario }: { campaign: Campaign; scenario: Scenario } = $props();

	// Campaign-wide refractions plus those for this scenario. When a refraction names an encounter
	// set (one part of a multi-part scenario), that set must be in this scenario's setup.
	// Return To campaigns and scenarios use the refractions of the ones they revisit.
	const scenarioRefractions = $derived.by(() => {
		const encounterSets = mergeEncounters(scenario).map((e) => e.kohakuEncounterSet);
		const originalCampaign = returnToCampaignOriginal[campaign] ?? campaign;
		const originalScenario =
			getScenarioData(scenario.kohakuScenario).original ?? scenario.kohakuScenario;
		return [...chapterOneRefractions, ...chapterTwoRefractions].filter((refraction) => {
			const details = refractions.find((r) => r.refraction === refraction);
			if (details?.campaign !== originalCampaign) return false;
			if (details.scenario === undefined) return true;
			return (
				details.scenario === originalScenario &&
				(details.encounterSet === undefined || encounterSets.includes(details.encounterSet))
			);
		});
	});
</script>

{#if scenarioRefractions.length > 0}
	<div class="mx-auto mt-8 max-w-2xl">
		<SectionSeparator title="Refractions" />
		<ul class="mt-3 space-y-4">
			{#each scenarioRefractions as refraction (refraction)}
				<li>
					<UltimatumBoonItem
						item={refraction}
						imageSrc={ultimatumBoonImagePath(refraction)}
						showText
					/>
				</li>
			{/each}
		</ul>
	</div>
{/if}
