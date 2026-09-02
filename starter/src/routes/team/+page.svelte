<script lang="ts">
	import { MarginFull, MarginText, PageLead, TextParagraph } from '@5argon/arkham-life-ui';

	import { getAllCards } from '$lib/card-data';
	import OpenGraph from '$lib/components/OpenGraph.svelte';
	import StarterFilter from '$lib/design/pages/starter/StarterFilter.svelte';
	import PrebuiltTeamList from '$lib/design/pages/team/PrebuiltTeamList.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { allPrebuiltTeams } from '$lib/starter-content';
	import { decodeTeams, type StarterFilterValue, teamMatches } from '$lib/tool/starter/filter';

	const teams = decodeTeams(allPrebuiltTeams(), getAllCards());
	let filter = $state<StarterFilterValue>({
		products: new Set(),
		investigators: new Set(),
		mustIncludeAll: false
	});
	const visible = $derived(teams.filter((entry) => teamMatches(entry, filter)));
</script>

<OpenGraph
	description={m.team_intro()}
	image="image/resource/team.webp"
	title={m.team_title()}
	url="/team"
/>

<svelte:head>
	<title>{m.team_page_title()}</title>
</svelte:head>

<PageLead title={m.team_title()} />

<MarginText>
	<TextParagraph>{m.team_intro()}</TextParagraph>
	<StarterFilter showMustIncludeAll onChange={(f) => (filter = f)} />
</MarginText>

<MarginFull>
	<div class="mt-4">
		<PrebuiltTeamList entries={visible} />
	</div>
</MarginFull>
