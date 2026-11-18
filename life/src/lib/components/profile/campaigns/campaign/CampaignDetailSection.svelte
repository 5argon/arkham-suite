<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import { page } from '$app/state';
	import { playedFamiliesFrom, resolveCampaignSlug } from '$lib/campaign/profile/profile-slugs';
	import { defaultCampaignLayout } from '$lib/campaign/profile/profile-widgets';
	import ProfileWidgets from '$lib/components/profile/_framework/ProfileWidgets.svelte';
	import { getProfileContext } from '$lib/components/profile/_framework/profile-context';
	import { ProfilePane } from '$lib/components/profile/_primitives';
	import CampaignBanner from './CampaignBanner.svelte';

	const ctx = getProfileContext();
	const resolved = $derived(
		ctx.payload
			? resolveCampaignSlug(page.params.campaign ?? '', playedFamiliesFrom(ctx.payload.winLossRecord))
			: null
	);
</script>

<ProfilePane
	title="{resolved?.name ?? m.campaign_detail_head_fallback()} – arkham.life"
	unknown={resolved ? null : m.campaign_detail_not_played()}
>
	{#snippet children(data)}
		{#if resolved}
			<CampaignBanner slug={resolved.slug} name={resolved.name} />
			<ProfileWidgets
				rows={data.settings.campaigns[resolved.slug] ?? defaultCampaignLayout(resolved.slug)}
				payload={data}
				campaign={resolved}
			/>
		{/if}
	{/snippet}
</ProfilePane>
