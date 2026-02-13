<script lang="ts">
	import DeckViewerPage from '$lib/design/pages/deck-viewer/DeckViewerPage.svelte';
	import type { PageProps } from './$types';

	const { data }: PageProps = $props();
</script>

<DeckViewerPage preLoadedDeck={data.preLoadedDeck} />
