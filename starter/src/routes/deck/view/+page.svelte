<script lang="ts">
	import DeckViewerPage from '$lib/design/pages/deck-viewer/DeckViewerPage.svelte';
	import OpenGraph from '$lib/components/OpenGraph.svelte';
	import type { PageProps } from './$types';

	const { data }: PageProps = $props();
</script>

<OpenGraph
	description="View decks from arkhamdb.com or arkham.build with this site's UI."
	image="image/resource/deck.webp"
	title="Deck Viewer"
	url="/deck/view"
/>

<DeckViewerPage preLoadedDeck={data.preLoadedDeck} />
