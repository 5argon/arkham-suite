<!--
@component
Displays investigator card(s) using CardScanFullSmallGrid with logic to handle front/back variants.
-->
<script lang="ts">
	import type { Deck, CardResolver } from '@5argon/arkham-kohaku';
	import { deck as deckUtility } from '@5argon/arkham-kohaku';
	import CardScanFullSmallGrid from './CardScanFullSmallGrid.svelte';

	interface Prop {
		deck: Deck;
		cardResolver: CardResolver;
		mode?: 'campaign' | 'decklist';
		languageCode?: string;
	}

	const { deck, cardResolver, mode = 'decklist', languageCode }: Prop = $props();

	const forwardResult = $derived.by(() => {
		const latestDeck = mode === 'campaign' ? deckUtility.forwardToLatest(deck) : deck;
		const forwarded = deckUtility.forwardDefault(latestDeck, cardResolver);
		return forwarded;
	});
	const deckLatestForwarded = $derived(forwardResult.deck);

	const frontInvestigator = $derived(
		deckLatestForwarded.meta.alternateFront ?? deckLatestForwarded.investigator
	);
	const backInvestigator = $derived.by(() => {
		if (deckLatestForwarded.meta.alternateFront) {
			// If front is an alt, always show the back regardless of it staying the same or not.
			return deckLatestForwarded.meta.alternateBack ?? deckLatestForwarded.investigator;
		} else {
			// If front is not an alt, back is hidden.
			return deckLatestForwarded.meta.alternateBack;
		}
	});

	const showTwoCards = $derived(
		backInvestigator !== undefined && backInvestigator.code !== frontInvestigator.code
	);
</script>

<CardScanFullSmallGrid
	groups={[
		{
			name: '',
			items:
				showTwoCards && backInvestigator
					? [
							{ card: frontInvestigator, quantity: 1, id: frontInvestigator.code },
							{ card: backInvestigator, quantity: 1, id: backInvestigator?.code ?? '' }
						]
					: [{ card: frontInvestigator, quantity: 1, id: frontInvestigator.code }]
		}
	]}
	{languageCode}
/>
