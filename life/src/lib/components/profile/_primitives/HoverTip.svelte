<!--
@component
The tooltip body for a shared {@link HoverTipState}: plain text, or a bold title with a muted
detail line. `markup` renders the text / title as Arkham markup (chaos-token glyphs etc.).
-->
<script lang="ts">
	import { HoverTooltip, parseArkhamMarkup } from '@5argon/arkham-life-ui';
	import type { HoverTipState } from './hover-tip.svelte';

	let { tip, markup = false }: { tip: HoverTipState; markup?: boolean } = $props();
</script>

<HoverTooltip visible={tip.visible} referenceElement={tip.ref}>
	<span class="block max-w-xs py-1 text-xs text-neutral-900 dark:text-neutral-100">
		{#if tip.text}
			{#if markup}{@html parseArkhamMarkup(tip.text)}{:else}{tip.text}{/if}
		{:else}
			{#if tip.title}
				<span class="font-semibold"
					>{#if markup}{@html parseArkhamMarkup(tip.title)}{:else}{tip.title}{/if}</span
				>
			{/if}
			{#if tip.detail}
				{#if tip.title}<br />{/if}
				<span class="text-neutral-600 dark:text-neutral-300">{tip.detail}</span>
			{/if}
		{/if}
	</span>
</HoverTooltip>
