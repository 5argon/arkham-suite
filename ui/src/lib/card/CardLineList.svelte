<!--
@component
Display cards as a table list with extra info.
-->
<script lang="ts">
	import type { CardItem, RecursivelyGroupedCardItem } from './card-item.js';
	import type { Card } from '@5argon/arkham-kohaku';
	import TableCardList from './TableCardList.svelte';
	import CardExtraInfo from './CardExtraInfo.svelte';
	import CardMagnifiedModal from './CardMagnifiedModal.svelte';
	import CardItemMetadata from './CardItemMetadata.svelte';
	import BorderedContainer from '../container/BorderedContainer.svelte';

	interface Prop {
		groups: RecursivelyGroupedCardItem[];
		onClick?: (card: Card) => void;
		languageCode?: string;
		hideQuantity?: boolean;
	}

	const { groups, onClick, languageCode, hideQuantity }: Prop = $props();

	let magnifiedCard = $state<Card | null>(null);
	let isModalShowing = $state(false);

	function handleCardClick(card: Card) {
		if (onClick) {
			onClick(card);
		} else {
			magnifiedCard = card;
			isModalShowing = true;
		}
	}

	function handleModalClose(): void {
		isModalShowing = false;
		magnifiedCard = null;
	}
</script>

{#snippet cardDetail(card: CardItem)}
	<div class="hidden sm:block">
		<CardExtraInfo card={card.card} extraInfo={['cost', 'slot', 'commit', 'soak']} />
	</div>
{/snippet}

{#snippet ownerAndLabels(card: CardItem)}
	<CardItemMetadata card={card.card} owner={card.owner} labels={card.labels} metaDisplay={card.metaDisplay} />
{/snippet}

<BorderedContainer>
	<TableCardList groups={groups} afterRenders={[cardDetail, ownerAndLabels]} onClick={handleCardClick} {hideQuantity} cardLineOverflow />
</BorderedContainer>

<CardMagnifiedModal
	card={magnifiedCard}
	isShowing={isModalShowing}
	onClose={handleModalClose}
	{languageCode}
/>
