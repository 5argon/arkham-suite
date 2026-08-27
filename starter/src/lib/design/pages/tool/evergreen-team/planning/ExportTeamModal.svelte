<!--
@component
Downloads each deck as an ArkhamDB-flavored JSON file. Per-deck buttons are
the guaranteed path; Download All is best-effort (browsers may throttle burst
multi-downloads, so it staggers them).
-->
<script lang="ts">
	import { Button, CardLine, FaIconType, HelpParagraph, Modal } from '@5argon/arkham-life-ui';
	import type { CardResolver } from '@5argon/arkham-kohaku';

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

	function downloadDeck(deckIndex: number) {
		const investigator = resolver.resolve(team.decks[deckIndex].investigator);
		const deck = toAhdbDeck({
			state: team,
			deckIndex,
			resolver,
			name: deckMeta[deckIndex]?.name ?? investigator.name,
			description: deckMeta[deckIndex]?.description ?? ''
		});
		const blob = new Blob([JSON.stringify(deck, null, '\t')], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const anchor = document.createElement('a');
		anchor.href = url;
		anchor.download = deckFileName(investigator);
		anchor.click();
		URL.revokeObjectURL(url);
	}

	function downloadAll() {
		team.decks.forEach((_, deckIndex) => {
			setTimeout(() => downloadDeck(deckIndex), deckIndex * 300);
		});
	}
</script>

<Modal {isOpen} {onClose} maxWidth="md" title={m.tool_evergreen_team_export()}>
	<div class="flex flex-col gap-3">
		<HelpParagraph>
			{m.tool_evergreen_team_export_help()}
		</HelpParagraph>
		{#each team.decks as deck, deckIndex (deck.investigator)}
			{@const investigator = resolver.resolve(deck.investigator)}
			<div class="bg-primary-100/50 dark:bg-primary-900/50 flex items-center gap-2 rounded p-1.5">
				<span class="min-w-0 flex-1">
					<CardLine noReserveCardTypeIcon hideIcons card={investigator} />
				</span>
				<Button
					icon={FaIconType.Export}
					label={m.tool_evergreen_team_download_json()}
					onClick={() => downloadDeck(deckIndex)}
				/>
			</div>
		{/each}
		{#if team.decks.length > 1}
			<div class="flex justify-center">
				<Button
					highlighted
					icon={FaIconType.Export}
					label={m.tool_evergreen_team_download_all()}
					onClick={downloadAll}
				/>
			</div>
		{/if}
	</div>
</Modal>
