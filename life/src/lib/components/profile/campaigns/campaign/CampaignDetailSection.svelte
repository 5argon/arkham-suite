<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import { page } from '$app/state';
	import { getContext } from 'svelte';
	import { BorderedContainer, HelpParagraph } from '@5argon/arkham-life-ui';
	import { playedFamiliesFrom, resolveCampaignSlug } from '$lib/campaign/profile-slugs';
	import { defaultCampaignLayout } from '$lib/campaign/profile-settings';
	import ProfileWidgets from '$lib/components/profile/_framework/ProfileWidgets.svelte';
	import CampaignBanner from '$lib/components/profile/campaigns/campaign/CampaignBanner.svelte';
	import { toWidgetData } from '$lib/components/profile/_framework/profile-widget-data';
	import { LOCAL_PROFILE_KEY, type LocalProfileContext } from '$lib/database/profile-local';

	const ctx = getContext<LocalProfileContext>(LOCAL_PROFILE_KEY);
	const data = $derived(ctx.payload);
	const resolved = $derived(
		data ? resolveCampaignSlug(page.params.campaign ?? '', playedFamiliesFrom(data.winLossRecord)) : null,
	);
	// Each campaign owns its full detail-page layout (shared + campaign-specific
	// widgets interleaved); absent → that campaign's default layout.
	const rows = $derived(
		data && resolved
			? (data.settings.campaigns[resolved.slug] ?? defaultCampaignLayout(resolved.slug))
			: [],
	);
</script>

<svelte:head><title>{resolved?.name ?? m.campaign_detail_head_fallback()} – arkham.life</title></svelte:head>

{#if data}
	{#if !resolved}
		<BorderedContainer>
			<div class="p-8"><HelpParagraph>{m.campaign_detail_not_played()}</HelpParagraph></div>
		</BorderedContainer>
	{:else}
		<!-- Forced header card (not part of the customizable layout). -->
		<CampaignBanner slug={resolved.slug} name={resolved.name} />
		<ProfileWidgets {rows} data={toWidgetData(data)} family={resolved.family} />
	{/if}
{/if}
