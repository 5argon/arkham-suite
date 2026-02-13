<script lang="ts">
	import type { EncounterSet, EncounterSetItem } from '$lib/core/campaign';
	import { getEncounterInsideItem, isEncounterSetWithModification } from '$lib/core/campaign';
	import { getEncounterSetFlag } from '$lib/utility/encounter-set-flag';
	import { Campaign } from '@5argon/arkham-kohaku';

	import { sortEncounterSetsByGroup } from './campaign-analyze';
	import EncounterIconWithLabel from './EncounterIconWithLabel.svelte';

	let {
		encounterSets,
		kohakuCampaign,
		showName = false,
		showSetCount = false,
		hideNumbers = false
	}: {
		encounterSets: EncounterSetItem[];
		kohakuCampaign: Campaign;
		showName?: boolean;
		showSetCount?: boolean;
		hideNumbers?: boolean;
	} = $props();

	const sortedEncounterSets = $derived.by(() => {
		// Extract EncounterSet from EncounterSetItem
		const extractedSets: EncounterSet[] = encounterSets.map(getEncounterInsideItem);
		// Sort using central sorting function
		const sorted = sortEncounterSetsByGroup(extractedSets, kohakuCampaign);
		// Map back to original EncounterSetItem order
		return sorted.map((set) => {
			const item = encounterSets.find((item) => getEncounterInsideItem(item) === set);
			return item!;
		});
	});

	const encounterSetsExtracted = $derived.by(() => {
		const extracted: EncounterSet[] = [];
		sortedEncounterSets.forEach((x) => {
			if (isEncounterSetWithModification(x)) {
				extracted.push(x.encounterSet);
			} else {
				extracted.push(x);
			}
		});
		return extracted;
	});

	const smallNumbers = $derived.by(() => {
		const numbers: (number | null)[] = [];
		sortedEncounterSets.forEach((x) => {
			if (isEncounterSetWithModification(x)) {
				const overwriteCount = x.overwriteCount;
				if (overwriteCount !== undefined) {
					// Overwrite exists: show original as small
					numbers.push(x.encounterSet.count);
				} else {
					// No overwrite: no small number
					numbers.push(null);
				}
			} else {
				// No modification: no small number
				numbers.push(null);
			}
		});
		return numbers;
	});

	const largeNumbers = $derived.by(() => {
		const numbers: (number | null)[] = [];
		sortedEncounterSets.forEach((x) => {
			if (isEncounterSetWithModification(x)) {
				const overwriteCount = x.overwriteCount;
				if (overwriteCount !== undefined) {
					// Overwrite exists: show overwrite as large
					numbers.push(overwriteCount);
				} else {
					// No overwrite: show original as large
					numbers.push(x.encounterSet.count);
				}
			} else {
				// No modification: show count as large
				numbers.push(x.count);
			}
		});
		return numbers;
	});
</script>

<div>
	{#each encounterSetsExtracted as ce, i (ce.kohakuEncounterSet)}
		{#if hideNumbers || (!hideNumbers && largeNumbers[i] !== 0)}
			{@const flag = getEncounterSetFlag(ce.kohakuEncounterSet, kohakuCampaign)}
			<EncounterIconWithLabel
				kohakuEncounterSet={ce.kohakuEncounterSet}
				smallNumber={!hideNumbers && showSetCount ? smallNumbers[i] : null}
				number={!hideNumbers ? largeNumbers[i] : null}
				coreSet={flag === 'core'}
				returnToSet={flag === 'return-to'}
				{showName}
				scenarioSet={flag === 'scenario'}
			/>
		{/if}
	{/each}
</div>
