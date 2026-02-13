<!--
@component
A tooltip that displays a CardLine with hideStrip and no quantity inside a rounded frame.
Uses Floating UI for robust positioning that works correctly with browser zoom.
-->
<script lang="ts">
	import type { Card, LocalizationResolver } from '@5argon/arkham-kohaku';
	import CardLine from './CardLine.svelte';
	import { HoverTooltip } from '../container';

	interface Prop {
		card: Card;
		quantity?: number;
		localizationResolver?: LocalizationResolver;
		languageCode?: string;
		visible?: boolean;
		referenceElement?: HTMLElement | null;
	}

	const { card, quantity, localizationResolver, languageCode, visible = false, referenceElement }: Prop = $props();
</script>

<HoverTooltip {visible} {referenceElement}>
	<CardLine {card} {localizationResolver} {languageCode} {quantity} hideStrip noReserveCardTypeIcon />
</HoverTooltip>
