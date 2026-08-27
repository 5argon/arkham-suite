<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import { getAllCards } from '$lib/card-data';
	import OpenGraph from '$lib/components/OpenGraph.svelte';
	import EvergreenPage from '$lib/design/pages/tool/evergreen-team/EvergreenPage.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { decodeEvergreen } from '$lib/tool/evergreen-team/codec';
	import type { EvergreenState } from '$lib/tool/evergreen-team/types';

	let restoredEncoded = $state<string | null>(null);
	let restored = $state<EvergreenState | null>(null);

	afterNavigate(() => {
		const enc = new URLSearchParams(page.url.search).get('t');
		if (enc === restoredEncoded) return;
		restoredEncoded = enc;
		restored = enc ? decodeEvergreen(enc, getAllCards()) : null;
	});
</script>

<OpenGraph
	description={m.tool_evergreen_team_description()}
	image="image/resource/evergreen.webp"
	title={m.tool_evergreen_team_title()}
	url="/tool/team-builder"
/>

<svelte:head>
	<title>{m.tool_evergreen_team_page_title()}</title>
</svelte:head>

{#key restoredEncoded}
	<EvergreenPage {restored} />
{/key}
