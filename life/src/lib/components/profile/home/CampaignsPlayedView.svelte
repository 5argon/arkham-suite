<!-- @component The five most recently finished campaigns. -->
<script lang="ts">
	import { HelpParagraph } from '@5argon/arkham-life-ui';
	import { campaignDisplayName } from '$lib/campaign/profile/profile-slugs';
	import { difficultyLabel } from '$lib/campaign/utils/difficulty';
	import type { ProfileCampaign } from '$lib/profile/profile-types';
	import { HoverTip, HoverTipState } from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';

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
			<div class="flex items-center justify-between gap-4 px-4 py-3">
				<div class="min-w-0">
					<p class="text-primary-900 dark:text-primary-100 truncate font-medium">{campaign.title}</p>
					<p class="text-primary-500 dark:text-primary-400 truncate text-xs">
						{campaignDisplayName(campaign.campaignCode)}
						{#if campaign.draft}
							<span
								class="bg-primary-200 dark:bg-primary-700 text-primary-700 dark:text-primary-200 ml-1 rounded px-1 py-0.5 text-xs"
							>
								{m.profile_campaigns_played_draft_badge()}
							</span>
						{/if}
					</p>
				</div>
				<div class="flex shrink-0 items-center gap-1.5">
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
