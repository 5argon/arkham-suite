<!-- @component The body of a shared HoverTipState tooltip; `markup` renders Arkham glyphs. -->
<script lang="ts">
	import { HoverTooltip, parseArkhamMarkup } from '@5argon/arkham-life-ui';
	import type { HoverTipState } from './hover-tip.svelte';

	let { tip, markup = false }: { tip: HoverTipState; markup?: boolean } = $props();
</script>

{#snippet text(s: string)}{#if markup}{@html parseArkhamMarkup(s)}{:else}{s}{/if}{/snippet}

<HoverTooltip visible={tip.visible} referenceElement={tip.ref}>
	<span class="block max-w-xs py-1 text-xs text-neutral-900 dark:text-neutral-100">
		{#if tip.text}
			{@render text(tip.text)}
		{:else}
			{#if tip.title}<span class="font-semibold">{@render text(tip.title)}</span>{/if}
			{#each tip.details as line, i (i)}
				{#if tip.title || i > 0}<br />{/if}
				<span class="text-neutral-600 dark:text-neutral-300">{line}</span>
			{/each}
		{/if}
	</span>
</HoverTooltip>
