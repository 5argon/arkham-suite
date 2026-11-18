<!-- @component Played campaigns as tiles in each campaign's art, icon and color, linking to their pages. -->
<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import type { PlayedCampaign } from '$lib/campaign/profile/profile-slugs';
	import { WidgetEmpty } from '$lib/components/profile/_primitives';
	import { getProfileContext } from '$lib/components/profile/_framework/profile-context';
	import CampaignArt from '$lib/components/campaign/CampaignArt.svelte';
	import CampaignBadge from '$lib/components/campaign/CampaignBadge.svelte';
	import { campaignPaletteStyle } from '$lib/components/campaign/campaign-identity';

	let { campaigns }: { campaigns: PlayedCampaign[] } = $props();

	const profile = getProfileContext();
</script>

{#if campaigns.length === 0}
	<WidgetEmpty>{m.campaigns_index_empty()}</WidgetEmpty>
{:else}
	<div class="@container">
		<div class="grid grid-cols-1 gap-2 @lg:grid-cols-2">
			{#each campaigns as c (c.family)}
				{@const style = campaignPaletteStyle(c.slug)}
				<a
					href="{profile?.base ?? ''}/campaigns/{c.slug}"
					{style}
					class="border-primary-200 dark:border-primary-700 bg-primary-50 dark:bg-primary-900 relative block h-18 overflow-hidden rounded-lg border shadow-sm transition hover:brightness-110"
				>
					<div class="absolute inset-0">
						<CampaignArt campaignCode={c.slug} banner />
					</div>
					<div
						class="from-primary-50 via-primary-50/85 to-primary-50/20 dark:from-primary-900 dark:via-primary-900/85 dark:to-primary-900/20 absolute inset-0 bg-linear-to-r"
					></div>
					<div
						class="relative flex h-full items-center gap-3 px-3 {style
							? 'border-b-4 border-(--campaign-stripe)'
							: ''}"
					>
						<CampaignBadge campaignCode={c.slug} />
						<div class="min-w-0">
							<p
								class="line-clamp-2 leading-tight font-semibold {style
									? 'text-(--campaign-text-light) dark:text-(--campaign-text-dark)'
									: 'text-black dark:text-white'}"
							>
								{c.name}
							</p>
							<p class="text-primary-600 dark:text-primary-300 text-xs">
								{m.campaigns_plays({ count: c.plays })}
							</p>
						</div>
						<span class="text-secondary-500 ml-auto shrink-0">→</span>
					</div>
				</a>
			{/each}
		</div>
	</div>
{/if}
