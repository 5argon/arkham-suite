<script lang="ts">
	import { FaIcon, FaIconType } from '@5argon/arkham-life-ui';
	import { EncounterSet as KohakuEncounterSet } from '@5argon/arkham-kohaku';
	import { u } from '@5argon/arkham-string';
	import { parseArkhamMarkup } from '$lib/utility/arkham-markup';
	import clsx from 'clsx';
	import EncounterSetDisplayWithTooltip from './EncounterSetDisplayWithTooltip.svelte';

	let {
		kohakuEncounterSet,
		subText = '',
		smallNumber = null,
		number = null,
		coreSet = false,
		scenarioSet = false,
		returnToSet = false,
		showName = false
	}: {
		kohakuEncounterSet: KohakuEncounterSet;
		subText?: string;
		smallNumber?: number | null;
		number?: number | null;
		coreSet?: boolean;
		scenarioSet?: boolean;
		returnToSet?: boolean;
		showName?: boolean;
	} = $props();

	function getFlag(): 'core' | 'return-to' | 'scenario' | undefined {
		if (coreSet) return 'core';
		if (returnToSet) return 'return-to';
		if (scenarioSet) return 'scenario';
		return undefined;
	}

	const translatedName = $derived(u.encounterSetName(kohakuEncounterSet));
</script>

<div class="inline-flex flex-col space-y-px text-center items-center mx-1">
	<div class="flex items-center">
		<EncounterSetDisplayWithTooltip encounterSet={kohakuEncounterSet} flag={getFlag()} />
		{#if smallNumber !== null || number !== null}
			<div
				class={clsx(
					'text-primary-900 dark:text-primary-100 flex flex-col align-middle leading-none rounded py-0.5 px-1 bg-primary-500/10'
				)}
			>
				{#if smallNumber !== null}
					<span class="text-[0.6em] text-primary-700 dark:text-primary-300">{smallNumber}</span>
				{/if}
				{#if smallNumber !== null && number !== null}
					<span class="text-[0.5em]">
						<FaIcon duotone icon={FaIconType.EncounterSubset} />
					</span>
				{/if}
				{#if number !== null}
					<span class="text-[1em]">{number}</span>
				{/if}
			</div>
		{/if}
		{#if subText !== ''}
			<div
				class={clsx(
					'text-primary-900 dark:text-primary-100 rounded py-0.5 px-1 bg-primary-500/10 ml-1 text-left leading-none'
				)}
			>
				<span class="text-[1em] text-primary-700 dark:text-primary-300"
					>{@html parseArkhamMarkup(subText)}</span
				>
			</div>
		{/if}
	</div>
	{#if showName}
		<span
			class="text-[0.5em] leading-none text-center show-name max-w-20 rounded bg-primary-400/10 py-0.5 px-1 text-primary-800 dark:text-primary-200"
			class:name-with-number={smallNumber !== null || number !== null}>{translatedName}</span
		>
	{/if}
</div>
