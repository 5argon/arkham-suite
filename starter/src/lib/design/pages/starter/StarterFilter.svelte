<!--
@component
The starter library filter shared by the Starter Decks and Pre-Built Teams
pages: the Investigator Decks you own (Core Set 2026 is always in) and the
investigators to show, each with select / deselect all. The product choice
is remembered with the starter team cart so Use This Team carries it.
-->
<script lang="ts">
	import {
		Button,
		CardLine,
		Checkbox,
		HealthSanity,
		HelpParagraph,
		ImageIconCommit,
		SectionSeparator
	} from '@5argon/arkham-life-ui';
	import { type CardCode, Product } from '@5argon/arkham-kohaku';
	import clsx from 'clsx';
	import { SvelteSet } from 'svelte/reactivity';

	import { getAllCards } from '$lib/card-data';
	import DeckProductPicker from '$lib/design/components/product/DeckProductPicker.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { deckProductsForCore, investigatorsForSetup } from '$lib/tool/evergreen-team/pool';
	import type { StarterFilterValue } from '$lib/tool/starter/filter';
	import { starterTeam } from '$lib/tool/starter/team-cart.svelte';

	interface Prop {
		onChange: (filter: StarterFilterValue) => void;
		showMustIncludeAll?: boolean;
	}
	const { onChange, showMustIncludeAll = false }: Prop = $props();

	const core = Product.CoreSet2026;
	const deckProducts = deckProductsForCore(core);
	const allCards = getAllCards();

	// Every Investigator Deck starts selected; the choice still travels with
	// the starter team cart so Use This Team carries it.
	const selectedProducts = new SvelteSet<Product>(deckProducts);
	// The roster follows the owned products: five from the core box plus one
	// per selected Investigator Deck.
	const investigators = $derived(
		investigatorsForSetup(
			{ core, deckProducts: [...selectedProducts], extraProducts: [], investigators: [] },
			allCards
		)
	);
	// Codes the user turned off; everything available is on by default, so
	// newly appearing investigators start selected.
	const excludedInvestigators = new SvelteSet<CardCode>();
	let mustIncludeAll = $state(false);
	const activeInvestigators = $derived(
		new Set(investigators.map((c) => c.code).filter((code) => !excludedInvestigators.has(code)))
	);
	const allInvestigatorsOn = $derived(
		investigators.every((c) => !excludedInvestigators.has(c.code))
	);

	function emit() {
		onChange({
			products: new Set(selectedProducts),
			investigators: activeInvestigators,
			mustIncludeAll
		});
	}
	function rememberProducts() {
		starterTeam.setProducts([...selectedProducts]);
		emit();
	}
	rememberProducts();
</script>

<SectionSeparator title={m.starter_decks_filter_products()} />
<HelpParagraph>{m.starter_decks_filter_products_help()}</HelpParagraph>
<DeckProductPicker
	{core}
	selected={[...selectedProducts]}
	onToggle={(product, included) => {
		if (included) selectedProducts.add(product);
		else selectedProducts.delete(product);
		rememberProducts();
	}}
	onSetAll={(products) => {
		selectedProducts.clear();
		for (const p of products) selectedProducts.add(p);
		rememberProducts();
	}}
/>

<SectionSeparator title={m.starter_decks_filter_investigators()} />
<div class="mb-2 flex flex-wrap items-center gap-2">
	<Button
		label={allInvestigatorsOn
			? m.tool_evergreen_team_deselect_all()
			: m.tool_evergreen_team_select_all()}
		onClick={() => {
			if (allInvestigatorsOn) {
				for (const c of investigators) excludedInvestigators.add(c.code);
			} else {
				excludedInvestigators.clear();
			}
			emit();
		}}
	/>
	{#if showMustIncludeAll}
		<Checkbox
			bind:checked={mustIncludeAll}
			label={m.team_filter_must_include_all()}
			onChange={emit}
		/>
	{/if}
</div>
<!-- The same investigator block as the deck banner's left side, so beginners
     meet each investigator's name, health, sanity, and stats while filtering. -->
<div class="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
	{#each investigators as investigator (investigator.code)}
		{@const on = activeInvestigators.has(investigator.code)}
		<button
			type="button"
			class={clsx(
				'investigator-toggle bg-primary-200 dark:bg-primary-900 flex flex-col items-start gap-1 rounded-md border-2 px-2 py-1.5 text-left',
				on ? 'on border-primary-500' : 'border-transparent opacity-50 grayscale'
			)}
			aria-pressed={on}
			onclick={() => {
				if (on) excludedInvestigators.add(investigator.code);
				else excludedInvestigators.delete(investigator.code);
				emit();
			}}
		>
			<CardLine noReserveCardTypeIcon hideIcons card={investigator} />
			<span class="flex items-center gap-2">
				<HealthSanity health={investigator.health} sanity={investigator.sanity} />
				<ImageIconCommit card={investigator} highlightAtLeast={4} dimAtMost={2} />
			</span>
		</button>
	{/each}
</div>

<style>
	.investigator-toggle {
		cursor: pointer;
	}

	.investigator-toggle:hover {
		opacity: 1;
		filter: none;
		background-color: var(--color-primary-200);
	}

	.investigator-toggle.on:hover {
		background-color: var(--color-primary-300);
	}

	.investigator-toggle:active {
		transform: scale(0.99);
	}

	:global(.dark) .investigator-toggle:hover {
		background-color: var(--color-primary-800);
	}

	:global(.dark) .investigator-toggle.on:hover {
		background-color: var(--color-primary-700);
	}
</style>
