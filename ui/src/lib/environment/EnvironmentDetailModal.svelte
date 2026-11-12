<!--
@component
The point in time a review or a deck is based on, so it's clear what its four slots mean: the rotating
expansions filling them, with the one that began this point highlighted, what that pushed out, the
Evergreen products that are always in, and a gallery of the investigators to choose from.
-->
<script lang="ts">
	import { m as stringMessages } from '@5argon/arkham-string';

	import ProductButton from '../button/ProductButton.svelte';
	import FlexibleCardDisplay from '../card/FlexibleCardDisplay.svelte';
	import Modal from '../layout/Modal.svelte';
	import * as m from '../paraglide/messages.js';
	import type { EnvironmentDetail, EnvironmentProduct, EnvironmentSubject } from './environment.js';

	interface Prop {
		isOpen: boolean;
		onClose: () => void;
		/**
		 * The name of the point in time.
		 */
		name: string;
		detail: EnvironmentDetail;
		subject?: EnvironmentSubject;
	}
	const { isOpen, onClose, name, detail, subject = 'review' }: Prop = $props();

	const half = $derived(detail.slots.length / 2);
	const noop = () => {};
	const investigators = $derived(
		detail.roster.map((card) => ({ card, quantity: 1, id: card.code }))
	);
</script>

{#snippet productButton(entry: EnvironmentProduct, active?: boolean)}
	<ProductButton {active} onClick={entry.href ?? noop} product={entry.product} />
{/snippet}

{#snippet heading(text: string)}
	<h4 class="text-primary-900 dark:text-primary-100 mt-4 mb-1 text-sm font-semibold">{text}</h4>
{/snippet}

<Modal
	{isOpen}
	maxWidth="lg"
	{onClose}
	title={subject === 'deck' ? m.card_environment_title_deck() : m.card_environment_title()}
>
	<p class="text-primary-900 dark:text-primary-100 font-semibold">{name}</p>
	{#if detail.since}
		<p class="text-primary-800 dark:text-primary-200 mb-1 text-xs">
			{m.card_environment_since({ date: detail.since })}
		</p>
	{/if}
	<p class="text-primary-900 dark:text-primary-100 text-sm leading-snug">
		{subject === 'deck' ? m.card_environment_intro_deck() : m.card_environment_intro()}
	</p>

	{@render heading(m.card_environment_rotating())}
	<div class="tile-grid slot-grid">
		{#each detail.slots as slot, i (i)}
			{#if slot}
				<div class="flex flex-col items-center">
					{#if detail.defining.includes(slot.product)}
						<div class="ring-secondary-500 dark:ring-secondary-300 rounded-sm ring-2">
							{@render productButton(slot)}
						</div>
						<span class="text-secondary-800 dark:text-secondary-200 mt-0.5 text-xs font-semibold">
							{m.card_environment_defining()}
						</span>
					{:else}
						{@render productButton(slot)}
					{/if}
				</div>
			{:else}
				<div
					class="border-primary-400 dark:border-primary-500 text-primary-700 dark:text-primary-300 flex h-[70px] w-[250px] items-center justify-center rounded-sm border-2 border-dashed text-xs"
				>
					{i < half
						? stringMessages.productTypeDeckbuildingExpansion()
						: stringMessages.productTypeInvestigatorExpansion()}
				</div>
			{/if}
		{/each}
	</div>

	{#if detail.pushedOut.length > 0}
		{@render heading(m.card_environment_pushed_out())}
		<p class="text-primary-800 dark:text-primary-200 mb-1 text-xs leading-snug">
			{m.card_environment_pushed_out_help()}
		</p>
		<div class="tile-grid">
			{#each detail.pushedOut as entry (entry.product)}
				{@render productButton(entry, false)}
			{/each}
		</div>
	{/if}

	{@render heading(m.card_environment_evergreen())}
	<div class="tile-grid">
		{#each detail.evergreen as entry (entry.product)}
			{@render productButton(entry)}
		{/each}
	</div>

	{@render heading(m.card_environment_investigators({ count: detail.roster.length }))}
	<FlexibleCardDisplay cards={investigators} hideChecklistMode hideQuantity />
</Modal>

<style>
	.tile-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, 250px);
		gap: 0.25rem;
		justify-content: center;
	}

	/* Deckbuilding on one row and investigator on the next, whatever room there is. */
	.slot-grid {
		max-width: calc(500px + 0.25rem);
		margin-inline: auto;
	}
</style>
