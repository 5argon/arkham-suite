<!--
@component
Shows the imported deck preview with DeckDisplay component.
Handles error display for failed deck imports.
-->
<script lang="ts">
	import type { CardResolver, Deck, LocalizationResolver } from '@5argon/arkham-kohaku';
	import DeckDisplay from './DeckDisplay.svelte';
	import * as m from '../paraglide/messages.js';

	interface Prop {
		result: { success: true; deck: Deck } | { success: false; error: string };
		cardResolver: CardResolver;
		localizationResolver?: LocalizationResolver;
		languageCode?: string;
	}

	const { result, cardResolver, localizationResolver, languageCode }: Prop = $props();
</script>

{#if result.success}
	<DeckDisplay deck={result.deck} mode="decklist" {localizationResolver} {languageCode} {cardResolver} />
{:else}
	<div class="rounded bg-red-50 p-4 text-red-900 dark:bg-red-900/30 dark:text-red-200">
		<h3 class="mb-2 text-lg font-bold">{m.form_import_failed()}</h3>
		<p class="text-sm">{result.error}</p>
	</div>
{/if}
