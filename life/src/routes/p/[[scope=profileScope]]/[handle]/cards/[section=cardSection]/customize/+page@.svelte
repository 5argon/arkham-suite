<script lang="ts">
	import { page } from '$app/state';
	import * as m from '$lib/paraglide/messages.js';
	import { resolveCardSubpageSlug } from '$lib/campaign/profile/profile-card-subpages';
	import { classDisplayName } from '$lib/campaign/profile/profile-slugs';
	import CardSubpageCustomize from '$lib/components/profile/cards/CardSubpageCustomize.svelte';
	import CustomizePane from '$lib/components/profile/_framework/CustomizePane.svelte';

	const section = $derived((page.params as { section: string }).section);
	const sub = $derived(resolveCardSubpageSlug(section));
</script>

{#if sub}
	<CardSubpageCustomize slug={sub.slug} />
{:else}
	<CustomizePane
		pane="cardClassDetail"
		title={m.framework_customize_subpage({
			section: m.framework_page_crumb_player_cards(),
			page: classDisplayName(section)
		})}
	/>
{/if}
