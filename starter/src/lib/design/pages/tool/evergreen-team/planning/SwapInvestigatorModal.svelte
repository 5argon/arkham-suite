<!--
@component
Replaces one player's investigator after setup, using the setup page's
roster grid with the other players' picks locked. Only offered while that
player's deck is empty, so no card eligibility can be invalidated.
-->
<script lang="ts">
	import { Modal } from '@5argon/arkham-life-ui';
	import type { Card, CardCode, CardResolver } from '@5argon/arkham-kohaku';

	import * as m from '$lib/paraglide/messages.js';
	import type { EvergreenState } from '$lib/tool/evergreen-team/types';

	import InvestigatorPicker from '../setup/InvestigatorPicker.svelte';

	interface Prop {
		team: EvergreenState;
		roster: Card[];
		resolver: CardResolver;
		/**
		 * The deck whose investigator is being changed; null keeps it closed.
		 */
		deckIndex: number | null;
		onSwap: (deckIndex: number, code: CardCode) => void;
		onClose: () => void;
	}
	const { team, roster, resolver, deckIndex, onSwap, onClose }: Prop = $props();

	const current = $derived(
		deckIndex === null ? null : resolver.resolve(team.decks[deckIndex].investigator)
	);

	function choose(code: CardCode) {
		if (deckIndex === null || team.setup.investigators.includes(code)) return;
		onSwap(deckIndex, code);
	}
</script>

<Modal isOpen={deckIndex !== null} {onClose} title={m.tool_evergreen_team_swap_investigator()}>
	{#if deckIndex !== null && current !== null}
		<p class="text-primary-700 dark:text-primary-300 mb-3 text-center text-sm">
			{m.tool_evergreen_team_swap_investigator_help({ name: current.name })}
		</p>
		<InvestigatorPicker
			{roster}
			selected={team.setup.investigators}
			focusIndex={deckIndex}
			onToggle={choose}
		/>
	{/if}
</Modal>
