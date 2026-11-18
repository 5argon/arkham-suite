<!-- @component The customize screen of a card-type page. -->
<script lang="ts">
	import {
		resolveCardSubpageSlug,
		type CardSubpageSlug
	} from '$lib/campaign/profile/profile-card-subpages';
	import CustomizePane from '$lib/components/profile/_framework/CustomizePane.svelte';
	import * as m from '$lib/paraglide/messages.js';

	let { slug }: { slug: CardSubpageSlug } = $props();

	const sub = $derived(resolveCardSubpageSlug(slug));
</script>

{#if sub}
	<CustomizePane
		pane={sub.pane}
		title={m.framework_customize_subpage({
			section: m.framework_page_crumb_player_cards(),
			page: sub.name()
		})}
	/>
{/if}
