<script lang="ts">
	import type { EncounterSet } from '$lib/core/campaign';
	import { getEncounterSetFlag } from '$lib/utility/encounter-set-flag';
	import { EncounterSetDisplay } from '@5argon/arkham-life-ui';
	import { u } from '@5argon/arkham-string';
	import { sortEncounterSetsByGroup } from './campaign-analyze';
	import type { Campaign } from '@5argon/arkham-kohaku';

	interface Prop {
		encounterSets: EncounterSet[];
		kohakuCampaign: Campaign;
	}

	const { encounterSets, kohakuCampaign }: Prop = $props();

	const sortedEncounters = $derived(sortEncounterSetsByGroup(encounterSets, kohakuCampaign));

	const coreEncounters = $derived(
		sortedEncounters
			.filter((e) => getEncounterSetFlag(e.kohakuEncounterSet, kohakuCampaign) === 'core')
			.map((e) => ({
				encounterSet: e,
				name: u.encounterSetName(e.kohakuEncounterSet)
			}))
	);

	const otherEncounters = $derived(
		sortedEncounters
			.filter((e) => {
				const flag = getEncounterSetFlag(e.kohakuEncounterSet, kohakuCampaign);
				return flag !== 'core' && flag !== 'scenario';
			})
			.map((e) => ({
				encounterSet: e,
				name: u.encounterSetName(e.kohakuEncounterSet)
			}))
	);

	// Split arrays for column-wise ordering
	const otherEncountersLeft = $derived(
		otherEncounters.slice(0, Math.ceil(otherEncounters.length / 2))
	);
	const otherEncountersRight = $derived(
		otherEncounters.slice(Math.ceil(otherEncounters.length / 2))
	);

	const coreEncountersLeft = $derived(
		coreEncounters.slice(0, Math.ceil(coreEncounters.length / 2))
	);
	const coreEncountersRight = $derived(coreEncounters.slice(Math.ceil(coreEncounters.length / 2)));
</script>

<div class="mb-4 flex flex-wrap justify-center gap-4">
	<!-- Non-core encounters container -->
	{#if otherEncounters.length > 0}
		<div
			class="w-fit rounded-lg border border-primary-300 bg-primary-50 p-4 dark:border-primary-700 dark:bg-primary-950"
		>
			<!-- Mobile: single column -->
			<div class="space-y-2 md:hidden">
				{#each otherEncounters as { encounterSet, name }, i (i)}
					<div class="flex items-center gap-2">
						{#if encounterSet.kohakuEncounterSet}
							<EncounterSetDisplay
								encounterSet={encounterSet.kohakuEncounterSet}
								flag={getEncounterSetFlag(encounterSet.kohakuEncounterSet, kohakuCampaign)}
							/>
						{/if}
						<span class="text-sm text-primary-900 dark:text-primary-100">{name}</span>
					</div>
				{/each}
			</div>
			<!-- Desktop: two columns -->
			<div class="hidden gap-x-6 md:grid md:grid-cols-2">
				<div class="space-y-2">
					{#each otherEncountersLeft as { encounterSet, name }, i (i)}
						<div class="flex items-center gap-2">
							{#if encounterSet.kohakuEncounterSet}
								<EncounterSetDisplay
									encounterSet={encounterSet.kohakuEncounterSet}
									flag={getEncounterSetFlag(encounterSet.kohakuEncounterSet, kohakuCampaign)}
								/>
							{/if}
							<span class="text-sm text-primary-900 dark:text-primary-100">{name}</span>
						</div>
					{/each}
				</div>
				<div class="space-y-2">
					{#each otherEncountersRight as { encounterSet, name }, i (i)}
						<div class="flex items-center gap-2">
							{#if encounterSet.kohakuEncounterSet}
								<EncounterSetDisplay
									encounterSet={encounterSet.kohakuEncounterSet}
									flag={getEncounterSetFlag(encounterSet.kohakuEncounterSet, kohakuCampaign)}
								/>
							{/if}
							<span class="text-sm text-primary-900 dark:text-primary-100">{name}</span>
						</div>
					{/each}
				</div>
			</div>
		</div>
	{/if}

	<!-- Core encounters container -->
	{#if coreEncounters.length > 0}
		<div
			class="w-fit rounded-lg border border-primary-300 bg-primary-50 p-4 dark:border-primary-700 dark:bg-primary-950"
		>
			<!-- Mobile: single column -->
			<div class="space-y-2 md:hidden">
				{#each coreEncounters as { encounterSet, name }, i (i)}
					<div class="flex items-center gap-2">
						{#if encounterSet.kohakuEncounterSet}
							<EncounterSetDisplay
								encounterSet={encounterSet.kohakuEncounterSet}
								flag={getEncounterSetFlag(encounterSet.kohakuEncounterSet, kohakuCampaign)}
							/>
						{/if}
						<span class="text-sm text-primary-900 dark:text-primary-100">{name}</span>
					</div>
				{/each}
			</div>
			<!-- Desktop: two columns -->
			<div class="hidden gap-x-6 md:grid md:grid-cols-2">
				<div class="space-y-2">
					{#each coreEncountersLeft as { encounterSet, name }, i (i)}
						<div class="flex items-center gap-2">
							{#if encounterSet.kohakuEncounterSet}
								<EncounterSetDisplay
									encounterSet={encounterSet.kohakuEncounterSet}
									flag={getEncounterSetFlag(encounterSet.kohakuEncounterSet, kohakuCampaign)}
								/>
							{/if}
							<span class="text-sm text-primary-900 dark:text-primary-100">{name}</span>
						</div>
					{/each}
				</div>
				<div class="space-y-2">
					{#each coreEncountersRight as { encounterSet, name }, i (i)}
						<div class="flex items-center gap-2">
							{#if encounterSet.kohakuEncounterSet}
								<EncounterSetDisplay
									encounterSet={encounterSet.kohakuEncounterSet}
									flag={getEncounterSetFlag(encounterSet.kohakuEncounterSet, kohakuCampaign)}
								/>
							{/if}
							<span class="text-sm text-primary-900 dark:text-primary-100">{name}</span>
						</div>
					{/each}
				</div>
			</div>
		</div>
	{/if}
</div>
