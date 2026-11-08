<!--
@component
Downloads decks as ArkhamDB-flavored JSON files, the format arkham.build
imports (and can sync on to arkhamdb.com). Per-item buttons are the
guaranteed path; Download All is best-effort (browsers may throttle burst
multi-downloads, so it staggers them). When a deck has a side deck, it can be
kept, kept without its 0 XP cards, or left out, for every file downloaded.
-->
<script lang="ts">
	import { Button, FaIconType, HelpParagraph, Modal, RadioButtons } from '@5argon/arkham-life-ui';
	import type { AhdbDeck } from '@5argon/arkham-kohaku';

	import { createCardResolver } from '$lib/card-data';
	import * as m from '$lib/paraglide/messages.js';
	import { hasSideDeck, type SideDeckChoice, withSideDeckChoice } from '$lib/tool/side-deck-choice';

	export interface DownloadDeckItem {
		label: string;
		deck: AhdbDeck;
		fileName: string;
	}

	interface Prop {
		title: string;
		items: DownloadDeckItem[];
		isOpen: boolean;
		onClose: () => void;
	}
	const { title, items, isOpen, onClose }: Prop = $props();

	let sideDeck = $state<SideDeckChoice>('keep');
	const anySideDeck = $derived(items.some((item) => hasSideDeck(item.deck)));
	const sideDeckHelp = $derived(
		sideDeck === 'keep'
			? m.tool_download_side_keep_help()
			: sideDeck === 'noZeroXp'
				? m.tool_download_side_no_zero_xp_help()
				: m.tool_download_side_none_help()
	);
	const resolver = createCardResolver();
	const xpOf = (code: string) => resolver.resolve(code)?.xp;

	function download(item: DownloadDeckItem) {
		const deck = withSideDeckChoice(item.deck, sideDeck, xpOf);
		const blob = new Blob([JSON.stringify(deck, null, '\t')], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const anchor = document.createElement('a');
		anchor.href = url;
		anchor.download = item.fileName;
		anchor.click();
		URL.revokeObjectURL(url);
	}

	function downloadAll() {
		items.forEach((item, i) => {
			setTimeout(() => download(item), i * 300);
		});
	}
</script>

<Modal {isOpen} {onClose} maxWidth="md" {title}>
	<div class="flex flex-col gap-3">
		<HelpParagraph>
			{m.tool_evergreen_team_export_help()}
		</HelpParagraph>
		{#if anySideDeck}
			<div class="flex flex-col items-center gap-1">
				<RadioButtons
					choices={[
						{ value: 'keep', label: m.tool_download_side_keep() },
						{ value: 'noZeroXp', label: m.tool_download_side_no_zero_xp() },
						{ value: 'none', label: m.tool_download_side_none() }
					]}
					label={m.tool_download_side_deck()}
					size="flexible"
					bind:selectedValue={sideDeck}
				/>
				<HelpParagraph>{sideDeckHelp}</HelpParagraph>
			</div>
		{/if}
		{#each items as item (item.fileName)}
			<div class="bg-primary-100/50 dark:bg-primary-900/50 flex items-center gap-2 rounded p-1.5">
				<span class="text-primary-900 dark:text-primary-100 min-w-0 flex-1 font-semibold">
					{item.label}
				</span>
				<Button
					icon={FaIconType.Export}
					label={m.tool_evergreen_team_download_json()}
					onClick={() => download(item)}
				/>
			</div>
		{/each}
		{#if items.length > 1}
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
