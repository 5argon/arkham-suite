<!--
@component
Displays a single archived campaign in the listing view.
Shows campaign thumbnail, title, campaign type, difficulty, date, participants,
and a badge indicating whether the user owns this campaign or is a participant.
-->
<script lang="ts">
	import { FaIcon, FaIconType, CardSquare, UserDisplay } from '@5argon/arkham-life-ui';
	import { u } from '@5argon/arkham-string';
	import type { Campaign, Card } from '@5argon/arkham-kohaku';
	import type { ClearState } from '$lib/campaign/clear-status';
	import type { SoloType } from '$lib/database/document';

	interface PlayerStub {
		userId: string;
		username: string;
		iconCardCode: string;
		/** A frozen label for someone with their own arkham.life — shown with a darker chip. */
		isGuest: boolean;
	}

	interface DeckStub {
		investigatorCode: string;
		alternateFrontCode: string | null;
		ownerUserId: string | null;
		ownerUsername: string | null;
		ownerIconCardCode: string | null;
	}

	interface CampaignItem {
		id: string;
		title: string;
		campaignCode: string;
		difficulty: string;
		playerCount: number | null;
		draft: boolean;
		startDate: Date | null;
		finishDate: Date | null;
		outcome: ClearState | null;
		reachedBestWin: boolean;
		soloType: SoloType | null;
		soloHands: number;
		userId: string;
		ownerUsername: string;
		ownerIconCardCode: string;
		players: PlayerStub[];
		decks: DeckStub[];
	}

	interface Props {
		campaign: CampaignItem;
		cardsByCode: Record<string, Card>;
		currentUserId: string;
		/** When true, show a selection checkbox overlay (for multi-campaign export). */
		selectable?: boolean;
		selected?: boolean;
		onToggle?: (on: boolean) => void;
	}

	const {
		campaign,
		cardsByCode,
		currentUserId,
		selectable = false,
		selected = false,
		onToggle
	}: Props = $props();

	const isOwn = $derived(campaign.userId === currentUserId);

	const difficultyColor: Record<string, string> = {
		easy: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
		standard: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
		hard: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
		expert: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
	};

	// Solo tag: "True Solo", or "Solo X-Handed" (X = distinct hands; generic when < 2).
	const soloLabel = $derived.by(() => {
		if (campaign.soloType === 'true-solo') return 'True Solo';
		if (campaign.soloType === 'multi-handed')
			return campaign.soloHands >= 2 ? `Solo ${campaign.soloHands}-Handed` : 'Solo (Multi-Handed)';
		return null;
	});

	const campaignImageUrl = $derived(
		campaign.campaignCode ? `/image/expansion/campaign/${campaign.campaignCode}.webp` : null
	);

	const campaignDisplayName = $derived(
		campaign.campaignCode ? u.campaignName(campaign.campaignCode as Campaign) : 'Unspecified'
	);

	function fmtDate(d: Date): string {
		return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
	}

	// Show the finish date; when a start date is also set, show the range. Never
	// the creation date — fall back to a lone start date for in-progress runs.
	const dateLabel = $derived.by(() => {
		const { startDate: start, finishDate: finish } = campaign;
		if (start && finish) return `${fmtDate(start)} ~ ${fmtDate(finish)}`;
		if (finish) return fmtDate(finish);
		if (start) return fmtDate(start);
		return null;
	});

	const editUrl = $derived(`/archive/edit?id=${campaign.id}`);

	// All participants: whoever is listed in campaignPlayers.
	const allParticipants = $derived(campaign.players);

	// Shared chrome for both renders: a link (browse) and a button (selection mode).
	// Fixed height so every card in the list is the same size regardless of content.
	const cardClass =
		'bg-primary-50 dark:bg-primary-900 border-primary-200 dark:border-primary-700 hover:bg-primary-100 dark:hover:bg-primary-800 flex h-36 items-stretch gap-3 overflow-hidden rounded-lg border shadow-sm transition';
</script>

{#snippet body()}
	<!-- Campaign image: spans the full card height, fixed 150px wide (clipped) -->
	<div class="bg-primary-200 dark:bg-primary-700 w-37.5 flex-shrink-0 overflow-hidden">
		{#if campaignImageUrl}
			<img
				src={campaignImageUrl}
				alt={campaignDisplayName}
				class="h-full w-full object-cover"
				onerror={(e) => {
					(e.currentTarget as HTMLImageElement).style.display = 'none';
				}}
			/>
		{/if}
	</div>

	<!-- Main info -->
	<div class="min-w-0 flex-1 py-3">
		<div class="flex flex-wrap items-center gap-2">
			<span class="truncate text-sm font-bold text-black dark:text-white">{campaign.title}</span>

			<!-- Draft badge -->
			{#if campaign.draft}
				<span
					class="rounded bg-yellow-200 px-1.5 py-0.5 text-xs font-semibold text-yellow-900 dark:bg-yellow-700 dark:text-yellow-100"
				>
					Draft
				</span>
			{/if}

			<!-- Difficulty badge -->
			<span
				class="rounded px-1.5 py-0.5 text-xs font-semibold capitalize {difficultyColor[
					campaign.difficulty
				] ?? ''}"
			>
				{campaign.difficulty}
			</span>

			<!-- Player-count badge -->
			{#if campaign.playerCount}
				<span
					title="{campaign.playerCount}-player campaign"
					class="bg-primary-200 dark:bg-primary-700 text-primary-700 dark:text-primary-200 rounded px-1.5 py-0.5 text-xs font-semibold"
				>
					{campaign.playerCount}P
				</span>
			{/if}

			<!-- Solo badge: True Solo / Solo X-Handed -->
			{#if soloLabel}
				<span
					title={soloLabel}
					class="bg-secondary-100 dark:bg-secondary-900 text-secondary-800 dark:text-secondary-200 rounded px-1.5 py-0.5 text-xs font-semibold"
				>
					{soloLabel}
				</span>
			{/if}
		</div>

		<p class="text-primary-500 dark:text-primary-400 truncate text-xs">{campaignDisplayName}</p>

		{#if dateLabel}
			<p class="text-primary-400 dark:text-primary-500 mt-0.5 text-xs">{dateLabel}</p>
		{/if}

		<!-- Players row: everyone in the campaign. Guests render in a muted, darker primary. -->
		{#if allParticipants.length > 0}
			<div class="mt-1.5 flex flex-wrap gap-x-3 gap-y-1">
				{#each allParticipants as p (p.userId)}
					<UserDisplay
						username={p.username}
						card={cardsByCode[p.iconCardCode] ?? null}
						size="sm"
						guest={p.isGuest}
					/>
				{/each}
			</div>
		{/if}

		<!-- Decks row: investigator cards used -->
		{#if campaign.decks.length > 0}
			<div class="mt-1 flex flex-wrap gap-1">
				{#each campaign.decks as deck (deck.investigatorCode)}
					{@const cardCode = deck.alternateFrontCode ?? deck.investigatorCode}
					{@const card = cardsByCode[cardCode]}
					{#if card}
						<CardSquare {card} small />
					{/if}
				{/each}
			</div>
		{/if}
	</div>

	<!-- Right side: ownership badge + outcome -->
	<div class="flex flex-shrink-0 flex-col items-end gap-1 py-3 pr-3">
		{#if isOwn}
			<span title="Your campaign" class="text-secondary-600 dark:text-secondary-400">
				<FaIcon icon={FaIconType.Investigator} duotone />
			</span>
		{:else}
			<span title="You are a participant" class="text-primary-400 dark:text-primary-500">
				<FaIcon icon={FaIconType.NoticeInfo} duotone />
			</span>
		{/if}
		{#if campaign.outcome === 'cleared'}
			<span
				title={campaign.reachedBestWin ? 'Cleared (best ending)' : 'Cleared'}
				class="text-rogue-500 dark:text-rogue-400"
			>
				<FaIcon
					icon={campaign.reachedBestWin ? FaIconType.EndingBetterWin : FaIconType.EndingWin}
					duotone
				/>
			</span>
		{:else if campaign.outcome === 'special'}
			<span title="Special ending" class="text-violet-500 dark:text-violet-400">
				<FaIcon icon={FaIconType.EndingSpecial} duotone />
			</span>
		{:else if campaign.outcome === 'attempted'}
			<span title="Attempted" class="text-survivor-500 dark:text-survivor-400">
				<FaIcon icon={FaIconType.EndingLoss} duotone />
			</span>
		{:else}
			<span class="text-primary-400 dark:text-primary-500 text-xs font-semibold">?</span>
		{/if}
	</div>
{/snippet}

{#if selectable}
	<!-- Selection mode: the whole card toggles selection; click anywhere works (no navigation). -->
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
	<a href={editUrl} class="{cardClass} no-underline">
		{@render body()}
	</a>
{/if}
