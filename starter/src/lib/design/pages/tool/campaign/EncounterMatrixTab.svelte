<script lang="ts">
	import { type Campaign, type Scenario } from '$lib/core/campaign';
	import { getEncounterSetFlag } from '$lib/utility/encounter-set-flag';
	import { EncounterSetDisplay } from '@5argon/arkham-life-ui';
	import { u } from '@5argon/arkham-string';

	import {
		findUniqueEncounters,
		findUniqueScenarios,
		sortEncounterSetsByGroup
	} from './campaign-analyze';
	import EncounterIconTableHeader from './EncounterIconTableHeader.svelte';
	import MatrixLegendsTable from './MatrixLegendsTable.svelte';
	import { createMatrixRows } from './matrix-row';

	interface Prop {
		campaign: Campaign;
		kohakuCampaign: import('@5argon/arkham-kohaku').Campaign;
		showName?: boolean;
		shortScenarioName?: boolean;
		onGoToScenario?: (s: Scenario) => void;
	}

	const {
		campaign,
		kohakuCampaign,
		showName = false,
		shortScenarioName = false,
		onGoToScenario = () => {}
	}: Prop = $props();

	const scenarios = $derived(findUniqueScenarios(campaign));
	const uniqueEncounters = $derived(findUniqueEncounters(campaign));
	const encountersSorted = $derived(sortEncounterSetsByGroup(uniqueEncounters, kohakuCampaign));
	const encountersReused = $derived(
		encountersSorted.filter(
			(x) => getEncounterSetFlag(x.kohakuEncounterSet, kohakuCampaign) === undefined
		)
	);
	const encountersCore = $derived(
		encountersSorted.filter(
			(x) => getEncounterSetFlag(x.kohakuEncounterSet, kohakuCampaign) === 'core'
		)
	);
	const encountersReturnTo = $derived(
		encountersSorted.filter(
			(x) => getEncounterSetFlag(x.kohakuEncounterSet, kohakuCampaign) === 'return-to'
		)
	);
	const rows = $derived(
		createMatrixRows(scenarios, encountersReused, encountersReturnTo, encountersCore)
	);
</script>

<div class="overflow-x-auto rounded-lg border border-primary-300 dark:border-primary-700">
	<table class="min-w-full divide-y divide-primary-300 dark:divide-primary-700">
		<thead class="bg-primary-200 dark:bg-primary-800">
			<tr>
				<th
					class="sticky left-0 z-10 bg-primary-200 px-1 py-1 text-left text-xs font-semibold uppercase text-primary-900 dark:bg-primary-800 dark:text-primary-100"
				></th>
				<th
					class="border-x border-primary-300 px-1 py-1 text-left text-xs font-semibold uppercase text-primary-900 dark:border-primary-700 dark:text-primary-100"
				></th>
				{#each encountersReused as e, i (i)}
					<th class="border-x border-primary-300 px-1 py-1 dark:border-primary-700">
						<EncounterIconTableHeader encounterSet={e} {kohakuCampaign} />
					</th>
				{/each}
				{#each encountersReturnTo as e, i (i)}
					<th class="border-x border-primary-300 px-1 py-1 dark:border-primary-700">
						<EncounterIconTableHeader encounterSet={e} {kohakuCampaign} />
					</th>
				{/each}
				{#each encountersCore as e, i (i)}
					<th class="border-x border-primary-300 px-1 py-1 dark:border-primary-700">
						<EncounterIconTableHeader encounterSet={e} {kohakuCampaign} />
					</th>
				{/each}
			</tr>
		</thead>
		<tbody class="divide-y divide-primary-300 dark:divide-primary-700">
			{#each rows as r, i (i)}
				<tr
					class={i % 2 === 0
						? 'bg-primary-50 dark:bg-primary-950'
						: 'bg-primary-100 dark:bg-primary-900'}
				>
					<td
						class="sticky left-0 z-10 cursor-pointer whitespace-nowrap px-4 py-2 text-sm font-medium text-primary-900 underline dark:text-primary-100 {i %
							2 ===
						0
							? 'bg-primary-50 dark:bg-primary-950'
							: 'bg-primary-100 dark:bg-primary-900'}"
						onclick={() => {
							onGoToScenario(r.scenario);
						}}
						role="button"
						tabindex="0"
					>
						{shortScenarioName
							? (r.scenario.shortName ?? i + 1)
							: (r.scenario.overrideName ?? u.encounterSetName(r.scenario.representativeSet))}
					</td>
					<td class="border-x border-primary-300 px-1 py-1 dark:border-primary-700">
						{#if r.specificSets.length > 0}
							<div class="flex flex-wrap items-center justify-center gap-1">
								{#each r.specificSets as s, j (j)}
									{#if s.kohakuEncounterSet}
										<EncounterSetDisplay encounterSet={s.kohakuEncounterSet} flag="scenario" />
									{/if}
								{/each}
							</div>
						{/if}
					</td>
					{#each r.orderedEncounterSets as o, j (j)}
						{#if o !== null}
							<td class="border-x border-primary-300 px-1 py-1 dark:border-primary-700">
								<div class="flex items-center justify-center">
									{#if o.kohakuEncounterSet}
										<EncounterSetDisplay
											encounterSet={o.kohakuEncounterSet}
											flag={getEncounterSetFlag(o.kohakuEncounterSet, kohakuCampaign)}
										/>
									{/if}
								</div>
							</td>
						{:else}
							<td class="border-x border-primary-300 px-1 py-1 dark:border-primary-700"></td>
						{/if}
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
</div>

{#if showName}
	<div class="mt-4">
		<MatrixLegendsTable encounterSets={encountersSorted} {kohakuCampaign} />
	</div>
{/if}
