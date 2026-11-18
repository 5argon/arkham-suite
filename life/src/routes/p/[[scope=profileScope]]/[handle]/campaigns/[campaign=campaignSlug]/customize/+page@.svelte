<script lang="ts">
	import { page } from '$app/state';
	import { campaignDisplayName } from '$lib/campaign/profile/profile-slugs';
	import CustomizePane from '$lib/components/profile/_framework/CustomizePane.svelte';

	const slug = $derived((page.params as { campaign: string }).campaign);
</script>

<CustomizePane pane="campaignDetail" campaign={slug} title={campaignDisplayName(slug)} />
