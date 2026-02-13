<script lang="ts">
	import { type Campaign } from '$lib/core/campaign';
	import {
		Button,
		Dropdown,
		FaIconType,
		FormLabelWithHelp,
		HelpParagraph
	} from '@5argon/arkham-life-ui';

	import { findUniqueScenarios, makeLongScenarioName } from './campaign-analyze';
	import { Campaign as KohakuCampaign } from '@5argon/arkham-kohaku';
	import SetupReferenceCardFront from './SetupReferenceCardFront.svelte';
	import { fly } from 'svelte/transition';

	let {
		campaign,
		kohakuCampaign,
		incomplete = false,
		showSetCount = false,
		dropdownIndex = 0,
		onDropdownIndexChanged = (n: number) => {
			dropdownIndex = n;
		}
	}: {
		campaign: Campaign;
		kohakuCampaign: KohakuCampaign;
		incomplete?: boolean;
		showSetCount?: boolean;
		dropdownIndex?: number;
		onDropdownIndexChanged?: (n: number) => void;
	} = $props();

	let selectedScenarioIndex = $derived(dropdownIndex);
	let scenarios = $derived(findUniqueScenarios(campaign));
	let selectedScenario = $derived(scenarios[selectedScenarioIndex]);

	let dropdownOptions = $derived(
		scenarios.map((s, i) => ({
			value: i,
			label: makeLongScenarioName(s)
		}))
	);
</script>

<div class="flex items-center justify-center gap-4 mb-4">
	<FormLabelWithHelp label="">
		<div in:fly|global={{ x: 10, duration: 200, delay: 80 }}>
			<Button
				disabled={selectedScenarioIndex === 0}
				hideLabel
				icon={FaIconType.ArrowLeftBordered}
				label="Previous Scenario"
				onClick={() => {
					onDropdownIndexChanged(selectedScenarioIndex - 1);
				}}
			/>
		</div>
	</FormLabelWithHelp>
	<div in:fly|global={{ y: -10, duration: 200 }}>
		<Dropdown
			label="Select Scenario"
			name="scenarios"
			onchange={(value) => onDropdownIndexChanged(value)}
			options={dropdownOptions}
			value={selectedScenarioIndex}
		/>
	</div>
	<FormLabelWithHelp label="">
		<div in:fly|global={{ x: -10, duration: 200, delay: 80 }}>
			<Button
				disabled={selectedScenarioIndex === scenarios.length - 1}
				hideLabel
				icon={FaIconType.ArrowRightBordered}
				label="Next Scenario"
				onClick={() => {
					onDropdownIndexChanged(selectedScenarioIndex + 1);
				}}
			/>
		</div>
	</FormLabelWithHelp>
</div>

{#if incomplete}
	<HelpParagraph>
		Setup reference cards for scenarios in this campaign are still in development. Please check back
		later or refer to the official campaign guide.
	</HelpParagraph>
{:else}
	<SetupReferenceCardFront
		campaign={kohakuCampaign}
		scenario={selectedScenario}
		{incomplete}
		{showSetCount}
	/>
{/if}
