<!--
@component
One standalone-mode play in the /archive/standalone listing — mirrors the campaign
list item's look (and its selection behavior): scenario icon + title, the scenario
name, source (pack / from-campaign), difficulty, date, investigator portraits, and
the Standalone-Mode win/loss badge.
-->
<script lang="ts">
	import { CardSquare, EncounterSetIcon, FaIcon, FaIconType } from '@5argon/arkham-life-ui';
	import type { Card } from '@5argon/arkham-kohaku';
	import { scenarioRepresentativeSet } from '$lib/campaign/utils/standalone-scenarios';
	import { difficultyLabel } from '$lib/campaign/utils/difficulty';
	import type { ListStandalone } from '$lib/database/repository';

	const {
		standalone,
		cardsByCode,
		selectable = false,
		selected = false,
		onToggle,
	}: {
		standalone: ListStandalone;
		cardsByCode: Record<string, Card>;
		selectable?: boolean;
		selected?: boolean;
		onToggle?: (on: boolean) => void;
	} = $props();

	const iconSet = $derived(scenarioRepresentativeSet(standalone.scenario));
	const cardClass =
		'bg-primary-50 dark:bg-primary-900 border-primary-200 dark:border-primary-700 hover:bg-primary-100 dark:hover:bg-primary-800 flex items-stretch gap-3 overflow-hidden rounded-lg border shadow-sm transition';
</script>

{#snippet body()}
	<div class="min-w-0 flex-1 p-3">
		<div class="flex items-center gap-2">
			{#if iconSet}
				<span class="text-primary-600 dark:text-primary-300 shrink-0 text-lg leading-none">
					<EncounterSetIcon encounterSet={iconSet} />
				</span>
			{/if}
			<span class="truncate font-bold text-black dark:text-white">{standalone.title}</span>
		</div>
		<div
			class="text-primary-500 dark:text-primary-400 mt-0.5 flex flex-wrap items-center gap-2 text-xs"
		>
			<span>{standalone.scenarioName}</span>
			<span class="bg-primary-100 dark:bg-primary-800 rounded px-1.5 py-0.5">
				{standalone.source === 'pack' ? 'Scenario Pack' : 'From Campaign'}
			</span>
			<span>{difficultyLabel(standalone.difficulty)}</span>
			{#if standalone.finishDate}
				<span>{new Date(standalone.finishDate).toLocaleDateString()}</span>
			{/if}
		</div>
		{#if standalone.investigatorCodes.length}
			<div class="mt-1 flex flex-wrap gap-1">
				{#each standalone.investigatorCodes as code (code)}
					{@const card = cardsByCode[code]}
					{#if card}<CardSquare {card} small />{/if}
				{/each}
			</div>
		{/if}
	</div>
	<div class="flex shrink-0 flex-col items-end justify-center gap-1 py-3 pr-3">
		{#if standalone.verdict === 'won'}
			<span title="Won" class="text-rogue-500 dark:text-rogue-400">
				<FaIcon icon={FaIconType.EndingWin} duotone />
			</span>
		{:else if standalone.verdict === 'lost'}
			<span title="Lost" class="text-survivor-500 dark:text-survivor-400">
				<FaIcon icon={FaIconType.EndingLoss} duotone />
			</span>
		{/if}
	</div>
{/snippet}

{#if selectable}
	<button
		type="button"
		onclick={() => onToggle?.(!selected)}
		aria-pressed={selected}
		class="{cardClass} relative w-full cursor-pointer text-left {selected
			? 'ring-secondary-500 ring-2'
			: ''}"
	>
		<span
			class="absolute top-2 right-2 z-10 h-5 w-5 rounded-full border-2 {selected
				? 'border-secondary-500 bg-secondary-500'
				: 'border-primary-400 dark:border-primary-500 bg-white/70 dark:bg-black/40'}"
		></span>
		{@render body()}
	</button>
{:else}
	<a href={`/archive/edit?id=${standalone.id}`} class="{cardClass} no-underline">
		{@render body()}
	</a>
{/if}
