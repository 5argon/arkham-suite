<!-- @component The five most recently finished campaigns, each with its campaign's art, icon and color. -->
<script lang="ts">
	import { HelpParagraph } from '@5argon/arkham-life-ui';
	import { campaignDisplayName } from '$lib/campaign/profile/profile-slugs';
	import { difficultyLabel } from '$lib/campaign/utils/difficulty';
	import type { ProfileCampaign } from '$lib/profile/profile-types';
	import { HoverTip, HoverTipState } from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';
	import CampaignBadge from '$lib/components/campaign/CampaignBadge.svelte';
	import { campaignArtUrl, campaignPaletteStyle } from '$lib/components/campaign/campaign-identity';

	let { campaigns }: { campaigns: ProfileCampaign[] } = $props();

	const recent = $derived(
		[...campaigns].sort((a, b) => (b.finishDate ?? 0) - (a.finishDate ?? 0)).slice(0, 5)
	);
	const chip = 'bg-primary-100 dark:bg-primary-800 rounded px-2 py-1 text-xs font-semibold';
	const tip = new HoverTipState();
</script>

{#if recent.length === 0}
	<HelpParagraph>{m.profile_campaigns_played_empty()}</HelpParagraph>
{:else}
	<div
		class="border-primary-200 dark:border-primary-700 divide-primary-200 dark:divide-primary-700 divide-y rounded border"
	>
		{#each recent as campaign (campaign.id)}
			{@const style = campaignPaletteStyle(campaign.campaignCode)}
			<!-- The chips drop under the title when the row can't keep 14rem for it. -->
			<div class="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 py-2 pr-4 pl-2" {style}>
				<div class="flex min-w-0 flex-1 basis-56 items-center gap-3">
					<div
						class="bg-primary-200 dark:bg-primary-700 relative h-11 w-16 shrink-0 overflow-hidden rounded {style
							? 'border-r-4 border-(--campaign-stripe)'
							: ''}"
					>
						{#if campaign.campaignCode}
							<img
								src={campaignArtUrl(campaign.campaignCode)}
								alt=""
								class="h-full w-full object-cover"
								onerror={(e) => {
									(e.currentTarget as HTMLImageElement).style.display = 'none';
								}}
							/>
						{/if}
						<CampaignBadge campaignCode={campaign.campaignCode} size="sm" class="absolute top-0.5 left-0.5" />
					</div>
					<div class="min-w-0">
						<p class="text-primary-900 dark:text-primary-100 line-clamp-2 leading-snug font-medium">
							{campaign.title}
						</p>
						<p class="truncate text-xs">
							<span
								class="font-semibold {style
									? 'text-(--campaign-text-light) dark:text-(--campaign-text-dark)'
									: 'text-primary-500 dark:text-primary-400'}"
							>
								{campaignDisplayName(campaign.campaignCode)}
							</span>
							{#if campaign.draft}
								<span
									class="bg-primary-200 dark:bg-primary-700 text-primary-700 dark:text-primary-200 ml-1 rounded px-1 py-0.5 text-xs"
								>
									{m.profile_campaigns_played_draft_badge()}
								</span>
							{/if}
						</p>
					</div>
				</div>
				<div class="ml-auto flex shrink-0 items-center gap-1.5">
					{#if campaign.playerCount}
						{@const players = m.profile_campaigns_played_players_title({ count: campaign.playerCount })}
						<span
							role="img"
							aria-label={players}
							class="{chip} text-primary-700 dark:text-primary-300 cursor-default"
							onmouseenter={(e) => tip.showText(players, e)}
							onmouseleave={tip.hide}
						>
							{m.profile_campaigns_played_players({ count: campaign.playerCount })}
						</span>
					{/if}
					<span class="{chip} text-primary-800 dark:text-primary-200">
						{difficultyLabel(campaign.difficulty)}
					</span>
				</div>
			</div>
		{/each}
	</div>
	<HoverTip {tip} />
{/if}
