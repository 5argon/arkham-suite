<script lang="ts">
	import { getContext } from 'svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { BorderedContainer, SectionSeparator } from '@5argon/arkham-life-ui';
	import { playedCampaignList } from '$lib/campaign/profile-slugs';
	import ProfileWidgets from '$lib/components/profile/_framework/ProfileWidgets.svelte';
	import { toWidgetData } from '$lib/components/profile/_framework/profile-widget-data';
	import { LOCAL_PROFILE_KEY, type LocalProfileContext } from '$lib/database/profile-local';

	const ctx = getContext<LocalProfileContext>(LOCAL_PROFILE_KEY);
	const data = $derived(ctx.payload);
	const base = $derived(ctx.base);
	const campaigns = $derived(data ? playedCampaignList(data.winLossRecord) : []);
	const rows = $derived(data ? data.settings.panes.campaignsHome : []);
</script>

<svelte:head><title>{m.campaigns_index_page_title()}</title></svelte:head>

{#if data}
	<div class="mt-6">
		<SectionSeparator title={m.campaigns_index_played_heading({ count: campaigns.length })} />
		{#if campaigns.length === 0}
			<p class="text-primary-500 text-sm">{m.campaigns_index_empty()}</p>
		{:else}
			<div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
				{#each campaigns as c (c.family)}
					<a href={`${base}/campaigns/${c.slug}`} class="block">
						<BorderedContainer>
							<div class="flex items-center justify-between gap-3 p-3 transition hover:opacity-80">
								<span class="truncate font-medium text-black dark:text-white">{c.name}</span>
								<span class="text-primary-500 dark:text-primary-400 shrink-0 text-xs">
									{m.campaigns_plays({ count: c.plays })} →
								</span>
							</div>
						</BorderedContainer>
					</a>
				{/each}
			</div>
		{/if}
	</div>

	<ProfileWidgets {rows} data={toWidgetData(data)} />
{/if}
