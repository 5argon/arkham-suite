<script lang="ts">
	import {
		type Campaign,
		type Refraction,
		chapterOneRefractions,
		chapterTwoRefractions,
		getScenarioData,
		refractions,
		returnToCampaignOriginal
	} from '@5argon/arkham-kohaku';
	import { SectionSeparator, UltimatumBoonItem } from '@5argon/arkham-life-ui';
	import { resolve } from '$app/paths';
	import type { Scenario } from '$lib/core/campaign';
	import { ultimatumBoonImagePath } from '$lib/ultimatum-boon';
	import { mergeEncounters, refractionMatchesScenario } from './campaign-analyze';

	let { campaign, scenario }: { campaign: Campaign; scenario: Scenario } = $props();

	// Campaign-wide refractions plus those for this scenario.
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
			return refractionMatchesScenario(details, originalScenario, encounterSets);
		});
	});

	// The ultimatums-and-boons page opens on this item's chapter and tab.
	function linkQuery(refraction: Refraction): string {
		const chapter = chapterTwoRefractions.includes(refraction) ? 2 : 1;
		return `c=${chapter}&i=${refraction}`;
	}
</script>

{#if scenarioRefractions.length > 0}
	<div class="mx-auto mt-8 max-w-2xl">
		<SectionSeparator title="Refractions" />
		<ul class="mt-3 space-y-4">
			{#each scenarioRefractions as refraction (refraction)}
				<li>
					<a
						href={resolve(`/ultimatums-and-boons?${linkQuery(refraction)}`)}
						class="block rounded-lg p-2 transition-colors hover:bg-primary-100 dark:hover:bg-primary-900"
					>
						<UltimatumBoonItem
							item={refraction}
							imageSrc={ultimatumBoonImagePath(refraction)}
							showText
						/>
					</a>
				</li>
			{/each}
		</ul>
	</div>
{/if}
