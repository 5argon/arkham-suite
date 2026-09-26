<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import { SectionSeparator } from '@5argon/arkham-life-ui';
	import { playedCampaignList } from '$lib/campaign/profile/profile-slugs';
	import ProfileWidgets from '$lib/components/profile/_framework/ProfileWidgets.svelte';
	import { NavTile, ProfilePane, WidgetEmpty } from '$lib/components/profile/_primitives';
</script>

<ProfilePane title={m.campaigns_index_page_title()}>
	{#snippet children(data, base)}
		{@const campaigns = playedCampaignList(data.winLossRecord)}
		<div class="mt-6">
			<SectionSeparator title={m.campaigns_index_played_heading({ count: campaigns.length })} />
			{#if campaigns.length === 0}
				<WidgetEmpty>{m.campaigns_index_empty()}</WidgetEmpty>
			{:else}
				<div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
					{#each campaigns as c (c.family)}
						<NavTile
							href="{base}/campaigns/{c.slug}"
							label={c.name}
							detail={m.campaigns_plays({ count: c.plays })}
						/>
					{/each}
				</div>
			{/if}
		</div>

		<ProfileWidgets rows={data.settings.panes.campaignsHome} payload={data} />
	{/snippet}
</ProfilePane>
