<!--
@component
Modal for exporting deck as compressed JSON or shareable URL.
-->
<script lang="ts">
	import type { Deck } from '@5argon/arkham-kohaku';
	import { deck as deckUtils } from '@5argon/arkham-kohaku';
	import Modal from '../layout/Modal.svelte';
	import Button from '../button/Button.svelte';
	import * as m from '../paraglide/messages.js';
	import HelpParagraph from '../typography/HelpParagraph.svelte';

	interface Prop {
		isOpen: boolean;
		onClose: () => void;
		deck: Deck;
		/**
		 * Share URL for the deck.
		 * If not provided, share URL section will not be available.
		 */
		shareUrl?: string;
	}

	const { isOpen, onClose, deck, shareUrl }: Prop = $props();

	const ahdbDeck = $derived.by(() => {
		if (!deck.compressedJson) return null;
		// Decompress the full deck JSON for download
		return deckUtils.decompressDeck(deck.compressedJson);
	});

	let urlCopyFeedback = $state('');

	async function copyToClipboard(text: string) {
		try {
			await navigator.clipboard.writeText(text);
			urlCopyFeedback = m.button_copied();
			setTimeout(() => {
				urlCopyFeedback = '';
			}, 2000);
		} catch {
			urlCopyFeedback = 'Failed to copy';
			setTimeout(() => {
				urlCopyFeedback = '';
			}, 2000);
		}
	}

	function downloadFullJson() {
		if (!ahdbDeck) {
			console.error('No deck data available');
			return;
		}
		
		const json = JSON.stringify(ahdbDeck, null, 2);
		const blob = new Blob([json], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `${deck.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_full.json`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}
</script>

<Modal {isOpen} {onClose} maxWidth="lg" title={m.button_export_deck()}>
	<div class="flex flex-col gap-6">
		<!-- Download Buttons Section -->
		<div class="flex flex-col gap-3">
			<div class="flex flex-col gap-2">
				<Button
					label={m.button_download_full_json()}
					onClick={downloadFullJson}
				/>
			</div>
		</div>

		<!-- Share URL Section -->
		<div class="flex flex-col gap-2">
			<div class="flex items-center justify-between gap-2 mb-1">
				<p class="text-secondary-900 dark:text-secondary-100 text-sm font-medium">
					{m.form_share_url()}
				</p>
				<div class="flex items-center gap-2">
					{#if urlCopyFeedback}
						<span class="text-sm text-green-600 dark:text-green-400">{urlCopyFeedback}</span>
					{/if}
					<Button
						label={m.button_copy()}
						onClick={() => copyToClipboard(shareUrl || '')}
						disabled={!shareUrl}
					/>
				</div>
			</div>
			<textarea
				class="bg-primary-50 dark:bg-primary-900 border-primary-300 dark:border-primary-700 text-secondary-900 dark:text-secondary-100 w-full rounded border p-2 font-mono text-xs"
				value={shareUrl}
				readonly
				rows={4}
				placeholder={m.form_no_url_available()}
			></textarea>
			<HelpParagraph>
				{m.form_share_url_description()}
			</HelpParagraph>
		</div>
	</div>
</Modal>
