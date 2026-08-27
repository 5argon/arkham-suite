<script lang="ts">
	import { afterNavigate, goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { Button, FaIconType, MarginFull, MarginText, PageLead } from '@5argon/arkham-life-ui';

	import { createCardResolver, getAllCards } from '$lib/card-data';
	import OpenGraph from '$lib/components/OpenGraph.svelte';
	import FullScreenTeamViewer from '$lib/design/components/team/FullScreenTeamViewer.svelte';
	import TeamBanner from '$lib/design/components/team/TeamBanner.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { decodeEvergreen } from '$lib/tool/evergreen-team/codec';
	import { deckMetaFor } from '$lib/tool/evergreen-team/team-info';
	import type { EvergreenState } from '$lib/tool/evergreen-team/types';

	let encoded = $state<string | null>(null);
	let team = $state<EvergreenState | null>(null);

	const resolver = createCardResolver();
	const deckMeta = $derived(
		team === null
			? []
			: deckMetaFor(
					team,
					resolver,
					`https://arkham-starter.com/tool/team-builder?t=${encoded ?? ''}`
				)
	);

	afterNavigate(() => {
		const enc = new URLSearchParams(page.url.search).get('t');
		if (enc === encoded) return;
		encoded = enc;
		team = enc ? decodeEvergreen(enc, getAllCards()) : null;
	});
</script>

<OpenGraph
	description={m.tool_evergreen_team_description()}
	image="image/resource/evergreen.webp"
	title={m.tool_evergreen_team_title()}
	url="/tool/team-builder/view"
/>

<svelte:head>
	<title>{m.tool_evergreen_team_page_title()}</title>
</svelte:head>

<PageLead title={m.tool_evergreen_team_title()} />

{#key encoded}
	{#if team !== null}
		<MarginFull>
			<div class="mb-2 flex justify-center">
				<Button
					icon={FaIconType.Edit}
					label={m.tool_evergreen_team_view_edit()}
					onClick={() => goto(resolve(`/tool/team-builder?t=${encoded}`, {}))}
				/>
			</div>
			<div class="mb-3">
				<TeamBanner info={team.info} {team} />
			</div>
			<FullScreenTeamViewer {team} {deckMeta} />
		</MarginFull>
	{:else}
		<MarginText>
			<p class="text-primary-900 dark:text-primary-100 text-center">
				{m.tool_evergreen_team_view_invalid()}
			</p>
			<div class="mt-2 flex justify-center">
				<Button label={m.tool_evergreen_team_title()} onClick={resolve('/tool/team-builder', {})} />
			</div>
		</MarginText>
	{/if}
{/key}
