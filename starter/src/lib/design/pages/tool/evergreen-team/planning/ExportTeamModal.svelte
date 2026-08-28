<!--
@component
Downloads each team member's deck as ArkhamDB-flavored JSON.
-->
<script lang="ts">
	import type { CardResolver } from '@5argon/arkham-kohaku';

	import DownloadDeckJsonModal from '$lib/design/components/deck/DownloadDeckJsonModal.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { deckFileName, toAhdbDeck } from '$lib/tool/evergreen-team/export';
	import type { DeckMeta, EvergreenState } from '$lib/tool/evergreen-team/types';

	interface Prop {
		team: EvergreenState;
		resolver: CardResolver;
		/**
		 * Name and description per deck, parallel to team.decks.
		 */
		deckMeta: DeckMeta[];
		isOpen: boolean;
		onClose: () => void;
	}
	const { team, resolver, deckMeta, isOpen, onClose }: Prop = $props();

	const items = $derived(
		team.decks.map((deck, deckIndex) => {
			const investigator = resolver.resolve(deck.investigator);
			return {
				label: investigator.name,
				fileName: deckFileName(investigator),
				deck: toAhdbDeck({
					state: team,
					deckIndex,
					resolver,
					name: deckMeta[deckIndex]?.name ?? investigator.name,
					description: deckMeta[deckIndex]?.description ?? ''
				})
			};
		})
	);
</script>

<DownloadDeckJsonModal title={m.tool_evergreen_team_export()} {items} {isOpen} {onClose} />
