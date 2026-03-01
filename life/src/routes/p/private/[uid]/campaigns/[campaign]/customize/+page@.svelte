<script lang="ts">
	import { page } from '$app/state';
	import { u as stringUtils } from '@5argon/arkham-string';
	import { Campaign } from '@5argon/arkham-kohaku';
	import CustomizePane from '$lib/components/profile/_framework/CustomizePane.svelte';

	const slug = $derived((page.params as { campaign: string }).campaign);
	const title = $derived(
		(Object.values(Campaign) as string[]).includes(slug) ? stringUtils.campaignName(slug as Campaign) : slug,
	);
</script>

<CustomizePane pane="campaignDetail" campaign={slug} {title} />
