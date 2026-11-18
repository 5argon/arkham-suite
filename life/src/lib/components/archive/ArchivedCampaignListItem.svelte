<!--
@component
One Archived Campaign in the list: campaign art, three lines (title and badges; campaign name and
dates; players, cut to one line), and on the right the outcome above the investigators.
-->
<script lang="ts">
	import CampaignBadge from '$lib/components/campaign/CampaignBadge.svelte';
	import { CardSquare, FaIcon, FaIconType, UserDisplay } from '@5argon/arkham-life-ui';
	import * as m from '$lib/paraglide/messages.js';
	import { cardByCode } from '$lib/card-data';
	import { difficultyLabel } from '$lib/campaign/utils/difficulty';
	import { campaignDisplayName, type ListCampaign } from '$lib/database/archive-list';
	import { HoverTip, HoverTipState } from '$lib/components/profile/_primitives';
	import ArchiveListCard from './ArchiveListCard.svelte';
	import {
		campaignArtUrl,
		campaignPaletteStyle,
		dateRangeLabel,
		difficultyBadgeClass
	} from '$lib/components/campaign/campaign-identity';
	import { fitRow } from './fit-row';
	import { soloLabel } from './solo-label';

	interface Props {
		campaign: ListCampaign;
		/** Selection mode for multi-campaign export. */
		selectable?: boolean;
		selected?: boolean;
		onToggle?: (on: boolean) => void;
	}
	const { campaign, selectable = false, selected = false, onToggle }: Props = $props();

	const solo = $derived(soloLabel(campaign.soloType, campaign.soloHands));
	const displayName = $derived(
		campaignDisplayName(campaign.campaignCode) || m.archive_campaign_unspecified()
	);
	const dateLabel = $derived(dateRangeLabel(campaign.startDate, campaign.finishDate));
	const campaignStyle = $derived(campaignPaletteStyle(campaign.campaignCode));

	const tip = new HoverTipState();
	/** Players that don't fit on the players line. */
	let hiddenPlayers = $state<number[]>([]);
	const hiddenNames = $derived(hiddenPlayers.map((i) => campaign.players[i]?.name).filter(Boolean));
	const outcome = $derived.by(() => {
		switch (campaign.outcome) {
			case 'cleared':
				return campaign.reachedBestWin
					? { icon: FaIconType.EndingBetterWin, label: m.archive_outcome_best_win(), cls: 'text-rogue-500 dark:text-rogue-400' }
					: { icon: FaIconType.EndingWin, label: m.archive_outcome_win(), cls: 'text-rogue-500 dark:text-rogue-400' };
			case 'special':
				return { icon: FaIconType.EndingSpecial, label: m.archive_outcome_special(), cls: 'text-violet-500 dark:text-violet-400' };
			case 'attempted':
				return { icon: FaIconType.EndingLoss, label: m.archive_outcome_attempted(), cls: 'text-survivor-500 dark:text-survivor-400' };
			default:
				return null;
		}
	});
</script>

<ArchiveListCard
	href={`/archive/edit?id=${campaign.id}`}
	{selectable}
	{selected}
	{onToggle}
	class="min-h-28 sm:h-28"
>
	<div
		class="bg-primary-200 dark:bg-primary-700 relative w-20 flex-shrink-0 sm:w-37.5 overflow-hidden {campaignStyle
			? 'border-r-4 border-(--campaign-stripe)'
			: ''}"
		style={campaignStyle}
	>
		{#if campaign.campaignCode}
			<img
				src={campaignArtUrl(campaign.campaignCode)}
				alt={displayName}
				class="h-full w-full object-cover"
				onerror={(e) => {
					(e.currentTarget as HTMLImageElement).style.display = 'none';
				}}
			/>
		{/if}
		<CampaignBadge campaignCode={campaign.campaignCode} class="absolute top-1.5 left-1.5" />
	</div>

	<div
		class="-ml-3 flex min-w-0 flex-1 flex-col justify-center gap-1.5 py-2 pl-3 {campaignStyle
			? 'bg-linear-to-r from-(--campaign-tint-light)/50 to-transparent to-60% dark:from-(--campaign-tint-dark)/50'
			: ''}"
		style={campaignStyle}
	>
		<!-- Narrow cards give the title its own line, the badges the next, and let the date wrap. -->
		<div class="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
			<span class="min-w-0 basis-full truncate text-sm font-bold text-black sm:basis-auto dark:text-white"
				>{campaign.title}</span
			>
			{#if campaign.draft}
				<span
					class="shrink-0 rounded bg-yellow-200 px-1.5 py-0.5 text-xs font-semibold text-yellow-900 dark:bg-yellow-700 dark:text-yellow-100"
				>
					{m.archive_draft_badge()}
				</span>
			{/if}
			<span
				class="shrink-0 rounded px-1.5 py-0.5 text-xs font-semibold {difficultyBadgeClass[campaign.difficulty] ?? ''}"
			>
				{difficultyLabel(campaign.difficulty)}
			</span>
			{#if campaign.playerCount}
				<span
					role="img"
					aria-label={m.archive_player_count_title({ count: campaign.playerCount })}
					onmouseenter={(e) => tip.showText(m.archive_player_count_title({ count: campaign.playerCount! }), e)}
					onmouseleave={tip.hide}
					class="bg-primary-200 dark:bg-primary-700 text-primary-700 dark:text-primary-200 shrink-0 rounded px-1.5 py-0.5 text-xs font-semibold"
				>
					{campaign.playerCount}P
				</span>
			{/if}
			{#if solo}
				<span
					class="bg-secondary-100 dark:bg-secondary-900 text-secondary-800 dark:text-secondary-200 shrink-0 rounded px-1.5 py-0.5 text-xs font-semibold"
				>
					{solo}
				</span>
			{/if}
		</div>

		<div class="flex min-w-0 items-center gap-3">
			<p class="min-w-0 text-xs sm:truncate">
				<span
					class={campaignStyle
						? 'font-semibold text-(--campaign-text-light) dark:text-(--campaign-text-dark)'
						: 'text-primary-500 dark:text-primary-400'}>{displayName}</span
				>
				{#if dateLabel}
					<span class="text-primary-400 dark:text-primary-500"> · {dateLabel}</span>
				{/if}
			</p>
		</div>

		{#if campaign.players.length > 0}
			<div
				class="flex min-w-0 flex-nowrap items-center gap-x-3 overflow-hidden"
				use:fitRow={(hidden) => (hiddenPlayers = hidden)}
			>
				{#each campaign.players as p (p.uid)}
					<span data-fit-item class="shrink-0">
						<UserDisplay
							username={p.name}
							card={cardByCode(p.iconCardCode) ?? null}
							size="sm"
							guest={p.isGuest}
						/>
					</span>
				{/each}
				<span
					data-fit-more
					role="img"
					aria-label={m.archive_players_more({ names: hiddenNames.join(', ') })}
					onmouseenter={(e) => tip.showText(m.archive_players_more({ names: hiddenNames.join(', ') }), e)}
					onmouseleave={tip.hide}
					class="text-primary-500 dark:text-primary-400 shrink-0 text-sm">…</span
				>
			</div>
		{/if}
	</div>

	<div class="flex flex-shrink-0 flex-col items-end justify-between gap-1 py-2 pr-3">
		<span
			role="img"
			aria-label={outcome?.label ?? m.archive_outcome_none()}
			onmouseenter={(e) => tip.showText(outcome?.label ?? m.archive_outcome_none(), e)}
			onmouseleave={tip.hide}
			class={outcome?.cls ?? 'text-primary-400 dark:text-primary-500 text-xs font-semibold'}
		>
			{#if outcome}
				<FaIcon icon={outcome.icon} duotone />
			{:else}
				?
			{/if}
		</span>
		{#if campaign.decks.length > 0}
			<div class="flex max-w-12 flex-wrap justify-end gap-1 sm:max-w-none">
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
</ArchiveListCard>

<HoverTip {tip} />
