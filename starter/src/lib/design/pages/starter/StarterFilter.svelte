<!--
@component
The starter library filter shared by the Starter Decks and Pre-Built Teams
pages: the products you own (Core Set 2026 is always in), preset by the
environment selector, and what to look for: the investigators to show, or the
cards to play. Cards come from the products chosen, without signature cards or
weaknesses.
Investigators start unpicked so the reader chooses who they are curious
about, unless `initiallyAll` asks for everything shown up front. Products start
on the newest environment, unless `withChapterTwo` offers and starts on all of
them. A page with more than one filter gives each its own `snapshotId`.
-->
<script lang="ts">
	import { snapshot } from '$app/navigation';
	import {
		Button,
		CardFormMultiple,
		HelpParagraph,
		InvestigatorPicker,
		RadioButtons,
		SectionSeparator
	} from '@5argon/arkham-life-ui';
	import type { Card, CardCode, Product } from '@5argon/arkham-kohaku';
	import { untrack } from 'svelte';
	import { SvelteSet } from 'svelte/reactivity';

	import { getAllCards } from '$lib/card-data';
	import EnvironmentProductPicker from '$lib/design/components/product/EnvironmentProductPicker.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { chapterTwoChoice, environmentChoices } from '$lib/tool/environment-choices';
	import { investigatorsForSetup, setupForProducts } from '$lib/tool/evergreen-team/pool';
	import { pickableCards, type StarterFilterValue } from '$lib/tool/starter/filter';

	interface Prop {
		onChange: (filter: StarterFilterValue) => void;
		showMustIncludeAll?: boolean;
		/**
		 * Starts with every investigator picked instead of none.
		 */
		initiallyAll?: boolean;
		withChapterTwo?: boolean;
		hideProductsHelp?: boolean;
		snapshotId?: string;
	}
	const {
		onChange,
		showMustIncludeAll = false,
		initiallyAll = false,
		withChapterTwo = false,
		hideProductsHelp = false,
		snapshotId = 'starter-filter'
	}: Prop = $props();

	const allCards = getAllCards();

	function rosterOf(products: Product[]): Card[] {
		return investigatorsForSetup(setupForProducts(products), allCards);
	}

	// Starts on the newest environment choice so nothing legal today is hidden.
	const initialProducts = untrack(() => withChapterTwo)
		? chapterTwoChoice(new Date(), allCards).products
		: (environmentChoices(new Date(), allCards).at(-1)?.products ?? []);
	const selectedProducts = new SvelteSet<Product>(initialProducts);
	// The roster follows the owned products: five from the core box plus the
	// ones each selected product brings.
	const investigators = $derived(rosterOf([...selectedProducts]));
	const selectedInvestigators = new SvelteSet<CardCode>(
		untrack(() => initiallyAll) ? rosterOf(initialProducts).map((c) => c.code) : []
	);
	let pickBy = $state<'investigators' | 'cards'>('investigators');
	let pickedCards = $state<CardCode[]>([]);
	const cardChoices = $derived(pickableCards(allCards, selectedProducts));
	// A card whose product is no longer chosen waits, like a roster investigator.
	const activeCards = $derived(
		pickedCards.filter((code) => cardChoices.some((c) => c.code === code))
	);
	let mustIncludeAll = $state(false);
	let resetCount = $state(0);
	const activeInvestigators = $derived(
		new Set(investigators.map((c) => c.code).filter((code) => selectedInvestigators.has(code)))
	);
	const allInvestigatorsOn = $derived(
		investigators.every((c) => selectedInvestigators.has(c.code))
	);
	// No team has every investigator, so must-include-all only ever offers clearing.
	const offersDeselect = $derived(mustIncludeAll || allInvestigatorsOn);

	function emit() {
		onChange({
			products: new Set(selectedProducts),
			investigators: activeInvestigators,
			pickBy,
			cards: new Set(activeCards),
			mustIncludeAll
		});
	}
	/**
	 * Investigators a newly owned product brings in join the selection only
	 * when everyone was already picked, so "show me everything" stays so.
	 */
	function changeProducts(apply: () => void) {
		const wasAll = allInvestigatorsOn;
		apply();
		if (wasAll) for (const c of investigators) selectedInvestigators.add(c.code);
		emit();
	}
	emit();

	/**
	 * Back to how the filter starts.
	 */
	export function reset() {
		selectedProducts.clear();
		for (const p of initialProducts) selectedProducts.add(p);
		selectedInvestigators.clear();
		if (initiallyAll) for (const c of rosterOf(initialProducts)) selectedInvestigators.add(c.code);
		pickBy = 'investigators';
		pickedCards = [];
		mustIncludeAll = false;
		resetCount++;
		emit();
	}

	// Coming back to the page restores what was picked.
	snapshot({
		id: untrack(() => snapshotId),
		capture: () => ({
			products: [...selectedProducts],
			investigators: [...selectedInvestigators],
			pickBy,
			pickedCards: [...pickedCards],
			mustIncludeAll
		}),
		restore: (value) => {
			selectedProducts.clear();
			for (const p of value.products) selectedProducts.add(p);
			selectedInvestigators.clear();
			for (const code of value.investigators) selectedInvestigators.add(code);
			pickBy = value.pickBy ?? 'investigators';
			pickedCards = value.pickedCards ?? [];
			mustIncludeAll = value.mustIncludeAll;
			emit();
		}
	});
</script>

<SectionSeparator title={m.starter_decks_filter_products()} />
{#if !hideProductsHelp}
	<HelpParagraph>{m.starter_decks_filter_products_help()}</HelpParagraph>
{/if}
{#key resetCount}
	<EnvironmentProductPicker
		{withChapterTwo}
		selected={[...selectedProducts]}
		onChange={(products) =>
			changeProducts(() => {
				selectedProducts.clear();
				for (const p of products) selectedProducts.add(p);
			})}
	/>
{/key}

<div class="mt-3">
	<RadioButtons
		choices={[
			{ value: 'investigators', label: m.starter_decks_filter_by_investigators() },
			{ value: 'cards', label: m.starter_decks_filter_by_cards() }
		]}
		label={m.starter_decks_filter_pick_by()}
		bind:selectedValue={() => pickBy,
		(value) => {
			pickBy = value;
			emit();
		}}
	/>
</div>

{#if pickBy === 'cards'}
	<SectionSeparator title={m.starter_decks_filter_cards()} />
	<div class="mb-2 flex flex-wrap items-end gap-3">
		<RadioButtons
			choices={[
				{ value: false, label: m.starter_decks_filter_include_any_card() },
				{ value: true, label: m.starter_decks_filter_include_all_cards() }
			]}
			label={showMustIncludeAll ? m.team_filter_include() : m.starter_decks_filter_decks_include()}
			bind:selectedValue={() => mustIncludeAll,
			(value) => {
				mustIncludeAll = value;
				emit();
			}}
		/>
	</div>
	<CardFormMultiple
		cards={cardChoices}
		label={m.starter_decks_filter_card_search()}
		placeholder={m.common_search_placeholder()}
		selectedCodes={activeCards}
		onSelectionChange={(codes: CardCode[]) => {
			pickedCards = codes;
			emit();
		}}
	/>
{:else}
	<SectionSeparator title={m.starter_decks_filter_investigators()} />
	<div class="mb-2 flex flex-wrap items-end gap-3">
		{#if showMustIncludeAll}
			<RadioButtons
				choices={[
					{ value: false, label: m.team_filter_include_any() },
					{ value: true, label: m.team_filter_include_all() }
				]}
				label={m.team_filter_include()}
				bind:selectedValue={() => mustIncludeAll,
				(value) => {
					// Everyone picked can never match, so start the picks over instead.
					if (value && allInvestigatorsOn) selectedInvestigators.clear();
					mustIncludeAll = value;
					emit();
				}}
			/>
		{/if}
		<Button
			disabled={mustIncludeAll && activeInvestigators.size === 0}
			label={offersDeselect
				? m.tool_evergreen_team_deselect_all()
				: m.tool_evergreen_team_select_all()}
			onClick={() => {
				if (offersDeselect) {
					selectedInvestigators.clear();
				} else {
					for (const c of investigators) selectedInvestigators.add(c.code);
				}
				emit();
			}}
		/>
	</div>
	<InvestigatorPicker
		{investigators}
		selected={activeInvestigators}
		highlightStatsAtLeast={4}
		dimStatsAtMost={2}
		onToggle={(investigator, on) => {
			if (on) selectedInvestigators.add(investigator.code);
			else selectedInvestigators.delete(investigator.code);
			emit();
		}}
	/>
{/if}
