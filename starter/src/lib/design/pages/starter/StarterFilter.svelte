<!--
@component
The starter library filter shared by the Starter Decks and Pre-Built Teams
pages: the products you own (Core Set 2026 is always in), preset by the
environment selector, and the investigators to show. The product choice is
remembered with the starter team cart so Use This Team carries it.
Investigators start unpicked so the reader chooses who they are curious
about, unless `initiallyAll` asks for everything shown up front.
-->
<script lang="ts">
	import { snapshot } from '$app/navigation';
	import {
		Button,
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
	import { environmentChoices } from '$lib/tool/environment-choices';
	import { investigatorsForSetup, setupForProducts } from '$lib/tool/evergreen-team/pool';
	import type { StarterFilterValue } from '$lib/tool/starter/filter';
	import { starterTeam } from '$lib/tool/starter/team-cart.svelte';

	interface Prop {
		onChange: (filter: StarterFilterValue) => void;
		showMustIncludeAll?: boolean;
		/**
		 * Starts with every investigator picked instead of none.
		 */
		initiallyAll?: boolean;
	}
	const { onChange, showMustIncludeAll = false, initiallyAll = false }: Prop = $props();

	const allCards = getAllCards();

	function rosterOf(products: Product[]): Card[] {
		return investigatorsForSetup(setupForProducts(products), allCards);
	}

	// Starts on the newest environment choice so nothing legal today is hidden;
	// the choice still travels with the starter team cart so Use This Team
	// carries it.
	const initialProducts = environmentChoices(new Date(), allCards).at(-1)?.products ?? [];
	const selectedProducts = new SvelteSet<Product>(initialProducts);
	// The roster follows the owned products: five from the core box plus the
	// ones each selected product brings.
	const investigators = $derived(rosterOf([...selectedProducts]));
	const selectedInvestigators = new SvelteSet<CardCode>(
		untrack(() => initiallyAll) ? rosterOf(initialProducts).map((c) => c.code) : []
	);
	let mustIncludeAll = $state(false);
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
		rememberProducts();
	}
	function rememberProducts() {
		starterTeam.setProducts([...selectedProducts]);
		emit();
	}
	rememberProducts();

	// Coming back to the page restores what was picked.
	snapshot({
		id: 'starter-filter',
		capture: () => ({
			products: [...selectedProducts],
			investigators: [...selectedInvestigators],
			mustIncludeAll
		}),
		restore: (value) => {
			selectedProducts.clear();
			for (const p of value.products) selectedProducts.add(p);
			selectedInvestigators.clear();
			for (const code of value.investigators) selectedInvestigators.add(code);
			mustIncludeAll = value.mustIncludeAll;
			rememberProducts();
		}
	});
</script>

<SectionSeparator title={m.starter_decks_filter_products()} />
<HelpParagraph>{m.starter_decks_filter_products_help()}</HelpParagraph>
<EnvironmentProductPicker
	selected={[...selectedProducts]}
	onChange={(products) =>
		changeProducts(() => {
			selectedProducts.clear();
			for (const p of products) selectedProducts.add(p);
		})}
/>

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
