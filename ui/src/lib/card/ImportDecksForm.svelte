<!--
@component
Individual form for entering a deck URL or ID for import.
Shows predicted deck source and allows removal.
-->
<script lang="ts">
	import { service, DeckSource } from '@5argon/arkham-kohaku';
	import * as m from '../paraglide/messages.js';
	import TextInput from '../form/TextInput.svelte';
	import Button from '../button/Button.svelte';

	interface Prop {
		value: string;
		onChange: (value: string) => void;
		onRemove: () => void;
		showRemove: boolean;
		deckNumber: number;
	}

	let { value = $bindable(), onChange, onRemove, showRemove, deckNumber }: Prop = $props();

	const predicted = $derived(value.trim() ? service.predictDeckInput(value) : null);
	const sourceLabel = $derived.by(() => {
		if (!predicted) return '';
		switch (predicted.source) {
			case DeckSource.ArkhamDbPublic:
				return 'ArkhamDB (Public)';
			case DeckSource.ArkhamDbPublished:
				return 'ArkhamDB (Published)';
			case DeckSource.ArkhamBuildShared:
				return 'Arkham.build';
			default:
				return m.form_unknown();
		}
	});

	const feedbackMessage = $derived.by(() => {
		if (!predicted) return undefined;
		if (predicted.source === DeckSource.Unknown) {
			return m.form_unknown_source();
		}
		return `${m.form_source()}: ${sourceLabel}`;
	});

	const feedbackType = $derived.by(() => {
		if (!predicted) return 'info' as const;
		return predicted.source === DeckSource.Unknown ? ('error' as const) : ('info' as const);
	});
</script>

<div class="flex gap-2">
	<div class="flex-1">
		<TextInput
			bind:value
			label={`${m.form_deck()} ${deckNumber}: ${m.form_deck_url_or_id()}`}
			placeholder={m.form_deck_url_or_id()}
			oninput={() => onChange(value)}
			feedback={{
				type: feedbackType,
				message: feedbackMessage
			}}
		/>
	</div>
	{#if showRemove}
		<div class="flex items-center">
			<Button label={m.button_remove()} onClick={onRemove} danger />
		</div>
	{/if}
</div>
