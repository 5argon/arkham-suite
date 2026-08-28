<!--
@component
Compact attribution for the hosted starter deck a pre-built team member was
derived from. The whole banner opens that deck in a new tab.
-->
<script lang="ts">
	import { resolve } from '$app/paths';
	import { DeckBanner } from '@5argon/arkham-life-ui';
	import { linkedAhdbDeckToDeck } from '@5argon/arkham-kohaku';

	import { createCardResolver, loadAllTabooLists } from '$lib/card-data';
	import * as m from '$lib/paraglide/messages.js';
	import { starterDeckHref, type PrebuiltTeamSource } from '$lib/starter-content';

	interface Prop {
		source: PrebuiltTeamSource;
	}
	const { source }: Prop = $props();

	const resolver = createCardResolver();
	const deck = $derived(
		linkedAhdbDeckToDeck({ deck: source.primary }, resolver, loadAllTabooLists())
	);
	const href = $derived(
		resolve(starterDeckHref(source) as '/starter/[author]/[series]/[deck]', {})
	);
</script>

<div class="px-2 pt-1.5 pb-2 text-left">
	<p class="text-primary-700 dark:text-primary-300 mb-1 text-xs">
		{m.team_from_starter_deck()}
	</p>
	<a
		class="block rounded transition-opacity hover:opacity-80"
		{href}
		target="_blank"
		rel="noopener noreferrer"
	>
		<DeckBanner
			cardResolver={resolver}
			{deck}
			mode="decklist"
			headerOnly
			byline={[{ label: source.series.author.name }, { label: source.series.name }]}
		/>
	</a>
</div>
