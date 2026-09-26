<!--
@component
One Standalone Archive in the list: scenario, source, difficulty, date, investigators and the
Standalone Mode verdict.
-->
<script lang="ts">
	import { CardSquare, EncounterSetIcon, FaIcon, FaIconType } from '@5argon/arkham-life-ui';
	import * as m from '$lib/paraglide/messages.js';
	import { cardByCode } from '$lib/card-data';
	import { difficultyLabel } from '$lib/campaign/utils/difficulty';
	import { formatFinishDate } from '$lib/campaign/utils/format-date';
	import { scenarioRepresentativeSet } from '$lib/campaign/utils/standalone-scenarios';
	import type { ListStandalone } from '$lib/database/standalone-list';
	import ArchiveListCard from './ArchiveListCard.svelte';
	import { standaloneSourceLabel } from './standalone-labels';

	interface Props {
		standalone: ListStandalone;
		selectable?: boolean;
		selected?: boolean;
		onToggle?: (on: boolean) => void;
	}
	const { standalone, selectable = false, selected = false, onToggle }: Props = $props();

	const iconSet = $derived(scenarioRepresentativeSet(standalone.scenario));
</script>

<ArchiveListCard href={`/archive/edit?id=${standalone.id}`} {selectable} {selected} {onToggle}>
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
				{standaloneSourceLabel(standalone.source)}
			</span>
			<span>{difficultyLabel(standalone.difficulty)}</span>
			{#if standalone.finishDate != null}
				<span>{formatFinishDate(standalone.finishDate)}</span>
			{/if}
		</div>
		{#if standalone.decks.length}
			<div class="mt-1 flex flex-wrap gap-1">
				{#each standalone.decks as deck (deck.id)}
					{@const card = cardByCode(deck.investigatorCode)}
					{#if card}<CardSquare {card} small />{/if}
				{/each}
			</div>
		{/if}
	</div>
	<div class="flex shrink-0 flex-col items-end justify-center gap-1 py-3 pr-3">
		{#if standalone.verdict === 'won'}
			<span title={m.archive_verdict_won()} class="text-rogue-500 dark:text-rogue-400">
				<FaIcon icon={FaIconType.EndingWin} duotone />
			</span>
		{:else if standalone.verdict === 'lost'}
			<span title={m.archive_verdict_lost()} class="text-survivor-500 dark:text-survivor-400">
				<FaIcon icon={FaIconType.EndingLoss} duotone />
			</span>
		{/if}
	</div>
</ArchiveListCard>
