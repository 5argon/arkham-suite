<!--
@component
One destination row of the click picker: the member, an adjustable copy
count (starting from the current pick mode, capped by what actually fits),
and the confirm button - or the reason the member cannot take the card.
-->
<script lang="ts">
	import { Button, CardStrip, FaIconType } from '@5argon/arkham-life-ui';
	import type { Card } from '@5argon/arkham-kohaku';

	import * as m from '$lib/paraglide/messages.js';

	interface Prop {
		investigator: Card;
		/**
		 * Main-deck count and size for the small n/size hint; omitted for rows
		 * that are not a deck destination.
		 */
		count?: number;
		size?: number;
		defaultQuantity: number;
		maxQuantity: number;
		reason: string | null;
		label: (quantity: number) => string;
		toSide?: boolean;
		onConfirm: (quantity: number) => void;
	}
	const {
		investigator,
		count,
		size,
		defaultQuantity,
		maxQuantity,
		reason,
		label,
		toSide,
		onConfirm
	}: Prop = $props();

	const getInitial = () => Math.min(Math.max(defaultQuantity, 1), Math.max(maxQuantity, 1));
	let quantity = $state(getInitial());
</script>

<div class="bg-primary-100/50 dark:bg-primary-900/50 flex items-center gap-2 rounded p-1.5">
	<CardStrip card={investigator} />
	<span class="text-primary-900 dark:text-primary-100 hidden min-w-0 flex-1 truncate sm:inline">
		{investigator.name}
		{#if count !== undefined && size !== undefined}
			<span class="text-primary-600 dark:text-primary-400 text-xs">{count}/{size}</span>
		{/if}
	</span>
	<span class="flex-1 sm:hidden"></span>
	{#if reason !== null}
		<span class="text-primary-500 dark:text-primary-400 text-xs">{reason}</span>
	{:else}
		<span class="flex items-center gap-1">
			<Button
				hideLabel
				disabled={quantity <= 1}
				icon={FaIconType.Minus}
				label={m.tool_evergreen_team_fewer_copies()}
				onClick={() => (quantity = Math.max(1, quantity - 1))}
			/>
			<span class="text-primary-900 dark:text-primary-100 w-4 text-center font-bold"
				>{quantity}</span
			>
			<Button
				hideLabel
				disabled={quantity >= maxQuantity}
				icon={FaIconType.Plus}
				label={m.tool_evergreen_team_more_copies()}
				onClick={() => (quantity = Math.min(maxQuantity, quantity + 1))}
			/>
		</span>
		<Button highlighted label={label(quantity)} onClick={() => onConfirm(quantity)} />
		{#if toSide}
			<span class="text-primary-500 dark:text-primary-400 hidden text-xs sm:inline">
				{m.tool_evergreen_team_to_side_deck()}
			</span>
		{/if}
	{/if}
</div>
