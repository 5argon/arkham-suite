<script lang="ts">
	import {
		BorderedContainer,
		Button,
		FaIconType,
		HelpParagraph,
		MarginFull,
		SectionSeparator
	} from '@5argon/arkham-life-ui';
	import type { CardCode, Product } from '@5argon/arkham-kohaku';

	import { getAllCards } from '$lib/card-data';
	import EnvironmentProductPicker from '$lib/design/components/product/EnvironmentProductPicker.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { investigatorsForSetup, setupForProducts } from '$lib/tool/evergreen-team/pool';
	import type { EvergreenSetup } from '$lib/tool/evergreen-team/types';

	import AccessMatrix from './AccessMatrix.svelte';
	import InvestigatorPicker from './InvestigatorPicker.svelte';
	import TipsModal from './TipsModal.svelte';
	import WhatsEvergreenModal from './WhatsEvergreenModal.svelte';

	interface Prop {
		onProceed: (setup: EvergreenSetup) => void;
	}
	const { onProceed }: Prop = $props();

	const allCards = getAllCards();

	let products = $state<Product[]>([]);
	let investigators = $state<CardCode[]>([]);
	let showWhatsEvergreen = $state(false);
	let showTips = $state(false);

	const roster = $derived(investigatorsForSetup(setupForProducts(products), allCards));
	const selectedCards = $derived(
		investigators.map((code) => roster.find((c) => c.code === code)).filter((c) => c !== undefined)
	);

	function handleProductsChange(newProducts: Product[]) {
		products = newProducts;
		const rosterCodes = new Set(roster.map((c) => c.code));
		investigators = investigators.filter((code) => rosterCodes.has(code));
	}

	function handleInvestigatorToggle(code: CardCode) {
		if (investigators.includes(code)) {
			investigators = investigators.filter((c) => c !== code);
		} else if (investigators.length < 4) {
			investigators = [...investigators, code];
		}
	}

	function proceed() {
		onProceed(
			setupForProducts(
				$state.snapshot(products) as Product[],
				$state.snapshot(investigators) as CardCode[]
			)
		);
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

		<SectionSeparator title={m.tool_evergreen_team_include_decks()} />
		<HelpParagraph>
			{m.tool_evergreen_team_include_decks_help()}
		</HelpParagraph>
		<EnvironmentProductPicker selected={products} onChange={handleProductsChange} />

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
