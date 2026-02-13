<script lang="ts">
	import { fly } from 'svelte/transition';

	import type { Card, CardResolver } from '@5argon/arkham-kohaku';
	import { card as cardUtility } from '@5argon/arkham-kohaku';
	import UnknownCardBlock from '$lib/design/components/card/UnknownCardBlock.svelte';
	import { CardForm, SectionSeparator } from '@5argon/arkham-life-ui';
	import type { CardWithQuantity } from '$lib/tool/script/export/proto-string-restore';

	import CardBlockLeftRight from './CardBlockLeftRight.svelte';

	interface Props {
		editMode?: boolean;
		label: string;
		cardResolver: CardResolver;
		allCards?: Card[];
		stagingCards?: CardWithQuantity[];
		onAddToLeftSide?: (cardId: string) => void;
		onAddToRightSide?: (cardId: string) => void;
		onAddCard?: (code: string) => void;
		onRemoveCard?: (code: string) => void;
	}

	let {
		editMode = false,
		label,
		cardResolver,
		allCards = [],
		stagingCards = [],
		onAddToLeftSide = () => {},
		onAddToRightSide = () => {},
		onAddCard = () => {},
		onRemoveCard = () => {}
	}: Props = $props();

	let cards = $derived(
		stagingCards.map((cqItem) => {
			try {
				return { card: cardResolver.resolve(cqItem.cardId), quantity: cqItem.quantity };
			} catch {
				return null;
			}
		})
	);
</script>

<div class="stack-padding">
	<SectionSeparator inner title={label} />

	{#if editMode}
		<CardForm
			label="Add Card"
			cards={allCards}
			onSelect={(card: Card) => {
				onAddCard(card.code);
			}}
			placeholder="Type card name..."
			filter={cardUtility.deckbuildingPlayerCardsFilter}
		/>
	{/if}

	<table class="staging-table">
		<tbody>
			{#each cards as c, i (c?.card.code ?? i)}
				{#if c !== null}
					<tr in:fly={{ y: -20, duration: 300 }}>
						<CardBlockLeftRight
							{editMode}
							card={c.card}
							quantity={c.quantity}
							onClickDelete={() => {
								if (c !== null) {
									onRemoveCard(c.card.code);
								}
							}}
							onClickLeft={() => {
								if (c !== null) {
									onAddToLeftSide(c.card.code);
								}
							}}
							onClickRight={() => {
								if (c !== null) {
									onAddToRightSide(c.card.code);
								}
							}}
						/>
					</tr>
				{:else}
					<tr>
						<td colspan="4">
							<UnknownCardBlock cardId={stagingCards[i].cardId} />
						</td>
					</tr>
				{/if}
			{/each}
		</tbody>
	</table>
</div>

<style>
	.stack-padding {
		width: 400px;
	}
</style>
