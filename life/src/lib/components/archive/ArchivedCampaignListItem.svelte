<!--
@component
One Archived Campaign in the list: campaign art, title, badges, dates, players, investigators and
outcome.
-->
<script lang="ts">
	import { CardSquare, FaIcon, FaIconType, UserDisplay } from '@5argon/arkham-life-ui';
	import * as m from '$lib/paraglide/messages.js';
	import { cardByCode } from '$lib/card-data';
	import { difficultyLabel } from '$lib/campaign/utils/difficulty';
	import { formatFinishDate } from '$lib/campaign/utils/format-date';
	import { campaignDisplayName, type ListCampaign } from '$lib/database/archive-list';
	import ArchiveListCard from './ArchiveListCard.svelte';
	import { soloLabel } from './solo-label';

	interface Props {
		campaign: ListCampaign;
		/** Selection mode for multi-campaign export. */
		selectable?: boolean;
		selected?: boolean;
		onToggle?: (on: boolean) => void;
	}
	const { campaign, selectable = false, selected = false, onToggle }: Props = $props();

	const difficultyColor: Record<string, string> = {
		easy: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
		standard: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
		hard: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
		expert: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
	};

	const solo = $derived(soloLabel(campaign.soloType, campaign.soloHands));
	const displayName = $derived(
		campaignDisplayName(campaign.campaignCode) || m.archive_campaign_unspecified()
	);
	/** The finish date, as a range when a start date is also set; a lone start date otherwise. */
	const dateLabel = $derived.by(() => {
		const { startDate: start, finishDate: finish } = campaign;
		if (start != null && finish != null) return `${formatFinishDate(start)} ~ ${formatFinishDate(finish)}`;
		if (finish != null) return formatFinishDate(finish);
		if (start != null) return formatFinishDate(start);
		return null;
	});
</script>

<ArchiveListCard
	href={`/archive/edit?id=${campaign.id}`}
	{selectable}
	{selected}
	{onToggle}
	class="h-36"
>
	<div class="bg-primary-200 dark:bg-primary-700 w-37.5 flex-shrink-0 overflow-hidden">
		{#if campaign.campaignCode}
			<img
				src={`/image/expansion/campaign/${campaign.campaignCode}.webp`}
				alt={displayName}
				class="h-full w-full object-cover"
				onerror={(e) => {
					(e.currentTarget as HTMLImageElement).style.display = 'none';
				}}
			/>
		{/if}
	</div>

	<div class="min-w-0 flex-1 py-3">
		<div class="flex flex-wrap items-center gap-2">
			<span class="truncate text-sm font-bold text-black dark:text-white">{campaign.title}</span>
			{#if campaign.draft}
				<span
					class="rounded bg-yellow-200 px-1.5 py-0.5 text-xs font-semibold text-yellow-900 dark:bg-yellow-700 dark:text-yellow-100"
				>
					{m.archive_draft_badge()}
				</span>
			{/if}
			<span
				class="rounded px-1.5 py-0.5 text-xs font-semibold {difficultyColor[campaign.difficulty] ?? ''}"
			>
				{difficultyLabel(campaign.difficulty)}
			</span>
			{#if campaign.playerCount}
				<span
					title={m.archive_player_count_title({ count: campaign.playerCount })}
					class="bg-primary-200 dark:bg-primary-700 text-primary-700 dark:text-primary-200 rounded px-1.5 py-0.5 text-xs font-semibold"
				>
					{campaign.playerCount}P
				</span>
			{/if}
			{#if solo}
				<span
					class="bg-secondary-100 dark:bg-secondary-900 text-secondary-800 dark:text-secondary-200 rounded px-1.5 py-0.5 text-xs font-semibold"
				>
					{solo}
				</span>
			{/if}
		</div>

		<p class="text-primary-500 dark:text-primary-400 truncate text-xs">{displayName}</p>

		{#if dateLabel}
			<p class="text-primary-400 dark:text-primary-500 mt-0.5 text-xs">{dateLabel}</p>
		{/if}

		{#if campaign.players.length > 0}
			<div class="mt-1.5 flex flex-wrap gap-x-3 gap-y-1">
				{#each campaign.players as p (p.uid)}
					<UserDisplay
						username={p.name}
						card={cardByCode(p.iconCardCode) ?? null}
						size="sm"
						guest={p.isGuest}
					/>
				{/each}
			</div>
		{/if}

		{#if campaign.decks.length > 0}
			<div class="mt-1 flex flex-wrap gap-1">
				{#each campaign.decks as deck (deck.id)}
					<!-- An absent parallel front is often '' rather than null. -->
					{@const card = cardByCode(deck.alternateFrontCode || deck.investigatorCode)}
					{#if card}
						<CardSquare {card} small />
					{/if}
				{/each}
			</div>
		{/if}
	</div>

	<div class="flex flex-shrink-0 flex-col items-end gap-1 py-3 pr-3">
		{#if campaign.outcome === 'cleared'}
			<span
				title={campaign.reachedBestWin ? m.archive_outcome_best_win() : m.archive_outcome_win()}
				class="text-rogue-500 dark:text-rogue-400"
			>
				<FaIcon
					icon={campaign.reachedBestWin ? FaIconType.EndingBetterWin : FaIconType.EndingWin}
					duotone
				/>
			</span>
		{:else if campaign.outcome === 'special'}
			<span title={m.archive_outcome_special()} class="text-violet-500 dark:text-violet-400">
				<FaIcon icon={FaIconType.EndingSpecial} duotone />
			</span>
		{:else if campaign.outcome === 'attempted'}
			<span title={m.archive_outcome_attempted()} class="text-survivor-500 dark:text-survivor-400">
				<FaIcon icon={FaIconType.EndingLoss} duotone />
			</span>
		{:else}
			<span class="text-primary-400 dark:text-primary-500 text-xs font-semibold">?</span>
		{/if}
	</div>
</ArchiveListCard>
