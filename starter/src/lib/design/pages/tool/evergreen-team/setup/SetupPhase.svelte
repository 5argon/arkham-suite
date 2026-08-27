<script lang="ts">
	import {
		BorderedContainer,
		Button,
		FaIconType,
		HelpParagraph,
		InvestigatorExpansionFormMultiple,
		MarginFull,
		SectionSeparator
	} from '@5argon/arkham-life-ui';
	import { type CardCode, Product } from '@5argon/arkham-kohaku';

	import { getAllCards } from '$lib/card-data';
	import * as m from '$lib/paraglide/messages.js';
	import { extraProductOptions, investigatorsForSetup } from '$lib/tool/evergreen-team/pool';
	import type { EvergreenCore, EvergreenSetup } from '$lib/tool/evergreen-team/types';

	import AccessMatrix from './AccessMatrix.svelte';
	import InvestigatorPicker from './InvestigatorPicker.svelte';
	import PoolPicker from './PoolPicker.svelte';
	import TipsModal from './TipsModal.svelte';
	import WhatsEvergreenModal from './WhatsEvergreenModal.svelte';

	interface Prop {
		onProceed: (setup: EvergreenSetup) => void;
	}
	const { onProceed }: Prop = $props();

	const allCards = getAllCards();

	let core = $state<EvergreenCore>(Product.CoreSet2026);
	let deckProducts = $state<Product[]>([]);
	let extraProducts = $state<Product[]>([]);
	let investigators = $state<CardCode[]>([]);
	let showWhatsEvergreen = $state(false);
	let showTips = $state(false);
	let showAdvanced = $state(false);

	const roster = $derived(
		investigatorsForSetup({ core, deckProducts, extraProducts: [], investigators: [] }, allCards)
	);
	const selectedCards = $derived(
		investigators.map((code) => roster.find((c) => c.code === code)).filter((c) => c !== undefined)
	);
	const advancedOptions = $derived(extraProductOptions(core));

	function handleCoreChange(newCore: EvergreenCore) {
		core = newCore;
		deckProducts = [];
		extraProducts = [];
		investigators = [];
	}

	function pruneInvestigatorsToRoster() {
		const rosterCodes = new Set(
			investigatorsForSetup(
				{ core, deckProducts, extraProducts: [], investigators: [] },
				allCards
			).map((c) => c.code)
		);
		investigators = investigators.filter((code) => rosterCodes.has(code));
	}

	function handleDeckProductToggle(product: Product, included: boolean) {
		if (included) {
			deckProducts = [...deckProducts, product];
		} else {
			deckProducts = deckProducts.filter((p) => p !== product);
			pruneInvestigatorsToRoster();
		}
	}

	function handleSetAllDeckProducts(products: Product[]) {
		deckProducts = products;
		pruneInvestigatorsToRoster();
	}

	function handleInvestigatorToggle(code: CardCode) {
		if (investigators.includes(code)) {
			investigators = investigators.filter((c) => c !== code);
		} else if (investigators.length < 4) {
			investigators = [...investigators, code];
		}
	}

	function proceed() {
		onProceed({
			core,
			deckProducts: $state.snapshot(deckProducts) as Product[],
			extraProducts: $state.snapshot(extraProducts) as Product[],
			investigators: $state.snapshot(investigators) as CardCode[]
		});
	}
</script>

<MarginFull>
	<BorderedContainer>
		<div class="flex justify-end">
			<Button
				icon={FaIconType.NoticeInfo}
				label={m.tool_evergreen_team_whats_evergreen()}
				onClick={() => (showWhatsEvergreen = true)}
			/>
		</div>

		<PoolPicker
			{core}
			{deckProducts}
			onCoreChange={handleCoreChange}
			onDeckProductToggle={handleDeckProductToggle}
			onSetAllDeckProducts={handleSetAllDeckProducts}
		/>

		<div class="mt-2">
			<Button
				icon={showAdvanced ? FaIconType.Collapse : FaIconType.FoldoutRight}
				label={m.tool_evergreen_team_advanced()}
				onClick={() => (showAdvanced = !showAdvanced)}
			/>
		</div>
		{#if showAdvanced}
			<HelpParagraph>
				{m.tool_evergreen_team_advanced_help()}
			</HelpParagraph>
			<InvestigatorExpansionFormMultiple
				label={m.tool_evergreen_team_advanced_search()}
				onSelectionChange={(products) => (extraProducts = products)}
				products={advancedOptions}
				selectedProducts={extraProducts}
			/>
		{/if}

		<SectionSeparator title={m.tool_evergreen_team_team()} />
		<HelpParagraph>
			{m.tool_evergreen_team_team_help()}
		</HelpParagraph>
		<div class="mb-2">
			<Button
				icon={FaIconType.NoticeInfo}
				label={m.tool_evergreen_team_tips_button()}
				onClick={() => (showTips = true)}
			/>
		</div>
		<InvestigatorPicker {roster} selected={investigators} onToggle={handleInvestigatorToggle} />

		<div class="mx-auto mt-4 max-w-3xl">
			<SectionSeparator inner title={m.tool_evergreen_team_access_matrix_title()} />
			<AccessMatrix investigators={selectedCards} />
		</div>

		<div class="mt-6 flex justify-center">
			<Button
				disabled={investigators.length === 0}
				highlighted
				icon={FaIconType.RightSingle}
				label={m.tool_evergreen_team_proceed()}
				onClick={proceed}
			/>
		</div>
	</BorderedContainer>
</MarginFull>

<WhatsEvergreenModal isOpen={showWhatsEvergreen} onClose={() => (showWhatsEvergreen = false)} />
<TipsModal isOpen={showTips} onClose={() => (showTips = false)} />
