<!--
@component
Name + portrait picker with a live preview, for adding or editing a player or guest.
-->
<script lang="ts">
	import { Button, TextInput, UserDisplay } from '@5argon/arkham-life-ui';
	import { card as cardUtils, type Card } from '@5argon/arkham-kohaku';
	import * as m from '$lib/paraglide/messages.js';
	import { getAllCards } from '$lib/card-data';
	import PlayerIconSelector from '$lib/components/PlayerIconSelector.svelte';

	interface Props {
		name: string;
		card: Card | null;
		nameLabel?: string;
		namePlaceholder?: string;
		/** Shown in the preview while the name is empty. */
		previewFallback?: string;
		submitLabel: string;
		/** Extra requirement beyond a non-empty name. */
		canSubmit?: boolean;
		onSubmit: (fields: { name: string; card: Card | null }) => void;
	}
	let {
		name = $bindable(),
		card = $bindable(),
		nameLabel = m.players_name(),
		namePlaceholder,
		previewFallback = m.players_name(),
		submitLabel,
		canSubmit = true,
		onSubmit
	}: Props = $props();

	const playerCards = getAllCards().filter(cardUtils.playerCardsNonCampaignFilter);
</script>

<div class="flex flex-col gap-3">
	<TextInput label={nameLabel} bind:value={name} placeholder={namePlaceholder} />
	<PlayerIconSelector
		bind:selectedCard={card}
		cards={playerCards}
		placeholder={m.players_icon_search_placeholder()}
	/>
	<div>
		<p class="text-primary-900 dark:text-primary-100 mb-1 text-sm font-semibold">
			{m.players_preview()}
		</p>
		<UserDisplay username={name || previewFallback} {card} />
	</div>
	<Button
		highlighted
		label={submitLabel}
		disabled={!canSubmit || name.trim().length === 0}
		onClick={() => onSubmit({ name: name.trim(), card })}
	/>
</div>
