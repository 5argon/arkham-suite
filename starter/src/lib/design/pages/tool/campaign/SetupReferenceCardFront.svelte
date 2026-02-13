<script lang="ts">
	import {
		type EncounterSetItem,
		isEncounterSetWithModification,
		type Scenario
	} from '$lib/core/campaign';
	import { SectionSeparator } from '@5argon/arkham-life-ui';
	import { Campaign } from '@5argon/arkham-kohaku';

	import { mergeEncounters } from './campaign-analyze';
	import CustomSetupRender from './CustomSetupRender.svelte';
	import EncounterIconFlex from './EncounterIconFlex.svelte';
	import ExtraInfoRender from './ExtraInfoRender.svelte';
	import SetupReferenceCardFrame from './SetupReferenceCardFrame.svelte';
	import { fly } from 'svelte/transition';

	let {
		campaign,
		scenario,
		incomplete = false,
		showSetCount = false
	}: {
		campaign: Campaign;
		scenario: Scenario;
		incomplete?: boolean;
		showSetCount?: boolean;
	} = $props();

	let selectedScenarioEncounters = $derived(mergeEncounters(scenario));
	let multipleSetups = $derived(scenario.setups.length > 1);

	function computeCount(esis: EncounterSetItem[]): number {
		const count = esis.reduce<number>((p, c) => {
			if (!isEncounterSetWithModification(c)) {
				return p + c.count;
			} else {
				const overwriteCount = c.overwriteCount;
				if (overwriteCount !== undefined) {
					return p + overwriteCount;
				}
				return p + c.encounterSet.count;
			}
		}, 0);
		return count;
	}
</script>

<!-- Front card -->
<SetupReferenceCardFrame {campaign} {scenario}>
	{#key scenario}
		<div in:fly|global={{ x: -10, duration: 200, delay: 80 }}>
			<SectionSeparator title="Encounter Sets" />
			<EncounterIconFlex
				encounterSets={selectedScenarioEncounters}
				showName={true}
				{showSetCount}
				kohakuCampaign={campaign}
			/>
		</div>

		{#if !incomplete}
			<div in:fly|global={{ x: -10, duration: 200, delay: 130 }}>
				<SectionSeparator
					title={'Starting Encounter Deck' +
						(!multipleSetups ? ` : ${computeCount(scenario.setups[0].shuffles)} Cards` : '')}
				/>
				{#each scenario.setups as setup, i (i)}
					{#if multipleSetups}
						<SectionSeparator
							inner
							title={(setup.name ? `${setup.name} Variant` : 'Variant ' + (i + 1)) +
								' : ' +
								`${computeCount(setup.shuffles)} Cards`}
						/>
						<div class="pl-4 border-l border-secondary-700/20 dark:border-secondary-300/20">
							<EncounterIconFlex
								encounterSets={setup.shuffles}
								showName={false}
								kohakuCampaign={campaign}
								{showSetCount}
							/>
						</div>
					{:else}
						<EncounterIconFlex
							encounterSets={setup.shuffles}
							showName={false}
							kohakuCampaign={campaign}
							{showSetCount}
						/>
					{/if}
					<CustomSetupRender {setup} {campaign} notCommon={true} />
				{/each}
				{#if scenario.commonSetup !== undefined}
					<CustomSetupRender setup={scenario.commonSetup} {campaign} />
				{/if}
			</div>
		{/if}

		{#if scenario.extraInfo?.front}
			<div in:fly|global={{ x: -10, duration: 200, delay: 160 }}>
				<ExtraInfoRender extraInfos={scenario.extraInfo.front} />
			</div>
		{/if}
	{/key}
</SetupReferenceCardFrame>

<!-- Back card -->
{#if scenario.extraInfo?.back}
	<div class="mt-8">
		<SetupReferenceCardFrame {campaign} {scenario} isBack={true}>
			<ExtraInfoRender extraInfos={scenario.extraInfo.back} centered={true} />
		</SetupReferenceCardFrame>
	</div>
{/if}
