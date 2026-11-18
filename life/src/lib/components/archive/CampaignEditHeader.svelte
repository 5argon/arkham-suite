<!--
@component
The top of a campaign's edit page, made to look like its Archived Campaign card so the player sees
they opened the right one: the campaign's banner art, icon and colors, the title with the same
badges, the campaign name and the dates. `actions` renders on the right.
-->
<script lang="ts">
	import CampaignArt from '$lib/components/campaign/CampaignArt.svelte';
	import CampaignBadge from '$lib/components/campaign/CampaignBadge.svelte';
	import type { Snippet } from 'svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { difficultyLabel } from '$lib/campaign/utils/difficulty';
	import {
		distinctHands,
		resolvePlayerCount,
		resolveSoloType,
		type CampaignRecord
	} from '$lib/database/document';
	import {
		campaignPaletteStyle,
		dateRangeLabel,
		difficultyBadgeClass
	} from '$lib/components/campaign/campaign-identity';
	import { soloLabel } from './solo-label';

	interface Props {
		record: CampaignRecord;
		/** The campaign's name. */
		campaignName: string;
		actions?: Snippet;
	}
	const { record, campaignName, actions }: Props = $props();

	const campaignStyle = $derived(campaignPaletteStyle(record.campaignCode));
	const playerCount = $derived(resolvePlayerCount(record.playerCount, record.participants.length));
	const solo = $derived(
		soloLabel(
			resolveSoloType(record.playerCount, record.participants.length, record.multiHanded),
			distinctHands(record.decks)
		)
	);
	const dateLabel = $derived(dateRangeLabel(record.startDate, record.finishDate));
</script>

<div
	class="border-primary-200 dark:border-primary-700 bg-primary-50 dark:bg-primary-900 relative mb-4 overflow-hidden rounded-lg border shadow-sm"
	style={campaignStyle}
>
	{#if record.campaignCode}
		<div class="absolute inset-0">
			<CampaignArt campaignCode={record.campaignCode} banner />
		</div>
		<!-- Keeps the text readable over the art. -->
		<div
			class="from-primary-50 via-primary-50/85 to-primary-50/30 dark:from-primary-900 dark:via-primary-900/85 dark:to-primary-900/30 absolute inset-0 bg-linear-to-r"
		></div>
	{/if}

	<div
		class="relative flex flex-wrap items-center gap-3 p-3 sm:gap-4 sm:p-4 {campaignStyle
			? 'border-b-4 border-(--campaign-stripe)'
			: ''}"
	>
		<CampaignBadge campaignCode={record.campaignCode} size="lg" />

		<!-- The actions take a line of their own when the text can't keep 12rem beside them. -->
		<div class="min-w-0 flex-1 basis-48">
			<p
				class="truncate text-xs font-semibold tracking-wider uppercase {campaignStyle
					? 'text-(--campaign-text-light) dark:text-(--campaign-text-dark)'
					: 'text-primary-500 dark:text-primary-400'}"
			>
				{campaignName}
			</p>
			<div class="flex min-w-0 flex-wrap items-center gap-2">
				<span class="min-w-0 truncate text-lg font-bold text-black dark:text-white">
					{record.title || campaignName}
				</span>
				{#if record.draft}
					<span
						class="shrink-0 rounded bg-yellow-200 px-1.5 py-0.5 text-xs font-semibold text-yellow-900 dark:bg-yellow-700 dark:text-yellow-100"
					>
						{m.archive_draft_badge()}
					</span>
				{/if}
				<span
					class="shrink-0 rounded px-1.5 py-0.5 text-xs font-semibold {difficultyBadgeClass[
						record.difficulty
					] ?? ''}"
				>
					{difficultyLabel(record.difficulty)}
				</span>
				{#if playerCount}
					<span
						class="bg-primary-200 dark:bg-primary-700 text-primary-700 dark:text-primary-200 shrink-0 rounded px-1.5 py-0.5 text-xs font-semibold"
					>
						{playerCount}P
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
			{#if dateLabel}
				<p class="text-primary-500 dark:text-primary-400 text-xs">{dateLabel}</p>
			{/if}
		</div>

		{#if actions}
			<div class="ml-auto flex shrink-0 flex-wrap justify-end gap-2">
				{@render actions()}
			</div>
		{/if}
	</div>
</div>
