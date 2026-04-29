<script lang="ts">
	import { type CardResolver } from '@5argon/arkham-kohaku';
	import Button from '../button/Button.svelte';
	import * as m from '../paraglide/messages.js';
	import ArkhamdbMarkdownRenderer from './ArkhamdbMarkdownRenderer.svelte';

	interface Prop {
		descriptionMd: string;
		cardResolver?: CardResolver;
		onClose: () => void;
	}

	const { descriptionMd, cardResolver, onClose }: Prop = $props();
</script>

<div class="flex h-full flex-col">
	<!-- Header with close button -->
	<div
		class="bg-primary-200 dark:bg-primary-800 border-primary-300 dark:border-primary-700 flex items-center justify-between border-b px-4 py-3"
	>
		<h2 class="text-primary-900 dark:text-primary-100 text-lg font-semibold">
			{m.card_deck_description()}
		</h2>
		<Button label={m.card_close_description()} onClick={onClose} />
	</div>

	<!-- Description content -->
	<div class="flex-1 overflow-y-auto p-6 bg-primary-50/40 dark:bg-primary-950/40">
		<ArkhamdbMarkdownRenderer {descriptionMd} {cardResolver} />
	</div>
</div>
