<!--
@component
Display card item metadata (owner, labels, deckbuilding choices).
Renders owner as CardStrip, labels as CardLabel components, and metaDisplay as DeckbuildingChoiceDisplay.
-->
<script lang="ts">
	import type { Card, DecodedMeta } from '@5argon/arkham-kohaku';
	import type { CardLabelProp } from './CardLabel.svelte';
	import CardStrip from './CardStrip.svelte';
	import CardLabel from './CardLabel.svelte';
	import DeckbuildingChoiceDisplay from './DeckbuildingChoiceDisplay.svelte';

	interface Props {
		/**
		 * Card that this metadata belongs to (required for DeckbuildingChoiceDisplay)
		 */
		card?: Card;
		/**
		 * Owner card (typically an investigator card) associated with this card.
		 */
		owner?: Card;
		/**
		 * Labels to display as colored tags alongside the card.
		 */
		labels?: CardLabelProp[];
		/**
		 * Metadata for displaying deckbuilding choices (faction/option selection).
		 */
		metaDisplay?: DecodedMeta;
	}

	const { card, owner, labels, metaDisplay }: Props = $props();
</script>

<div class="flex items-center gap-0.5 overflow-x-hidden">
	{#if owner}
		<CardStrip card={owner} />
	{/if}
	{#if metaDisplay && card}
		<DeckbuildingChoiceDisplay investigator={card} meta={metaDisplay} />
	{/if}
	{#if labels}
		{#each labels as label, idx (idx)}
			<CardLabel {label} />
		{/each}
	{/if}
</div>
