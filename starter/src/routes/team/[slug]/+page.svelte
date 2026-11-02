<script lang="ts">
	import {
		ArkhamdbMarkdownRenderer,
		MarginFull,
		MarginText,
		PageLead,
		SectionSeparator
	} from '@5argon/arkham-life-ui';
	import { onMount } from 'svelte';

	import { createCardResolver, getAllCards } from '$lib/card-data';
	import OpenGraph from '$lib/components/OpenGraph.svelte';
	import FullScreenTeamViewer from '$lib/design/components/team/FullScreenTeamViewer.svelte';
	import TeamBanner from '$lib/design/components/team/TeamBanner.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { contributor, prebuiltTeamHref } from '$lib/starter-content';
	import { teamState } from '$lib/tool/starter/filter';

	const { data } = $props();

	// The markdown sanitizer needs a DOM, so the guide renders after hydration.
	let mounted = $state(false);
	onMount(() => {
		mounted = true;
	});
	const team = $derived(data.team);
	const teamAuthor = $derived(contributor(team.authorSlug));
	const resolver = createCardResolver();
	const builderState = $derived(teamState(team, getAllCards()));
	const deckMeta = $derived(
		team.members.map(({ deck }) => ({ name: deck.name, description: deck.description_md }))
	);
</script>

<OpenGraph
	description={team.description}
	image="image/resource/team.webp"
	title={team.name}
	url={prebuiltTeamHref(team)}
/>

<svelte:head>
	<title>{m.team_page_title()} | {team.name}</title>
</svelte:head>

<PageLead title={team.name} />

{#if builderState}
	<MarginFull>
		<div class="mb-3">
			<TeamBanner
				info={{ name: team.name, author: team.author, description: team.description }}
				team={builderState}
				tags={team.tags}
				sources={team.members.map((member) => member.source)}
				exclusive={team.exclusive}
				authorAvatar={teamAuthor?.avatarCard}
				authorSlug={teamAuthor?.slug}
			/>
		</div>
		<FullScreenTeamViewer
			team={builderState}
			{deckMeta}
			curated
		/>
	</MarginFull>
{/if}

<MarginText>
	<div class="mt-6">
		<SectionSeparator title={m.team_guide()} />
		{#if mounted}
			<ArkhamdbMarkdownRenderer descriptionMd={team.guideMd} cardResolver={resolver} />
		{/if}
	</div>
</MarginText>
