<!-- @component A one-line row of equal-width icon cells with sublabels, each tinted or dimmed, sharing one tooltip. -->
<script lang="ts" module>
	import HoverTip from './HoverTip.svelte';
	import { HoverTipState } from './hover-tip.svelte';
	export interface IconTrackItem {
		tooltip: string;
		dim?: boolean;
		/** A text colour class for the icon and sublabel. */
		tint?: string;
	}
</script>

<script lang="ts" generics="T extends IconTrackItem">
	import type { Snippet } from 'svelte';
	
	let {
		items,
		icon,
		sub,
		size = '1.4rem',
		cellWidth = '2em',
		gap = '0.5em',
		wrap = false
	}: {
		items: T[];
		/** The cell's main glyph/icon (rendered at 1em of `size`). */
		icon: Snippet<[T]>;
		/** Optional content under the icon (text / token glyphs / a letter). */
		sub?: Snippet<[T]>;
		/** Base font size — the icon is 1em; `cellWidth` / `gap` are em-relative. */
		size?: string;
		/** The fixed, equal width of every cell. */
		cellWidth?: string;
		/** Gap between cells. */
		gap?: string;
		/** Allow the track to wrap onto multiple lines (default: stays on one line). */
		wrap?: boolean;
	} = $props();

	const tip = new HoverTipState();
</script>

<div
	class="inline-flex items-start {wrap ? 'flex-wrap' : 'flex-nowrap'}"
	style="font-size:{size};gap:{gap}"
>
	{#each items as it, i (i)}
		<div
			role="img"
			aria-label={it.tooltip}
			class="flex shrink-0 cursor-default flex-col items-center {it.dim ? 'opacity-40' : ''}"
			style="width:{cellWidth}"
			onmouseenter={(e) => tip.showText(it.tooltip, e)}
			onmouseleave={tip.hide}
		>
			<span class="leading-none {it.tint ?? ''}">{@render icon(it)}</span>
			{#if sub}
				<span
					class="mt-1 flex items-center justify-center leading-none whitespace-nowrap {it.tint ??
						''}">{@render sub(it)}</span
				>
			{/if}
		</div>
	{/each}
</div>

<HoverTip {tip} />
