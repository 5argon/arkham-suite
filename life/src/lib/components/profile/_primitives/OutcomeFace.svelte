<!--
@component
Shared win/loss "outcome face" — the ending-kind FaIcon (better-win / win / special / loss)
with a hover tooltip naming it. `kind = null` renders a muted dash (e.g. an abandoned / unfinished
run). `reached = false` greys it (an ending you haven't hit yet).
-->
<script lang="ts">
	import { FaIcon, FaIconType } from '@5argon/arkham-life-ui';
	import type { EndingKind } from '$lib/campaign/outcomes/clear-status';
	import HoverTip from './HoverTip.svelte';
	import { HoverTipState } from './hover-tip.svelte';

	let {
		kind,
		label,
		reached = true,
		size = 'text-lg'
	}: {
		/** null → a muted dash (abandoned / no outcome). */
		kind: EndingKind | null;
		/** Tooltip text + aria-label (what this face means). */
		label: string;
		reached?: boolean;
		size?: string;
	} = $props();

	const ICON: Record<EndingKind, FaIconType> = {
		best: FaIconType.EndingBetterWin,
		win: FaIconType.EndingWin,
		special: FaIconType.EndingSpecial,
		loss: FaIconType.EndingLoss
	};

	const tip = new HoverTipState();
</script>

<span
	role="img"
	aria-label={label}
	class="inline-flex cursor-default"
	onmouseenter={(e) => tip.showText(label, e)}
	onmouseleave={tip.hide}
>
	{#if kind}
		<FaIcon
			icon={ICON[kind]}
			class="{size} shrink-0 {reached
				? 'text-primary-700 dark:text-primary-200'
				: 'text-primary-300 dark:text-primary-700'}"
		/>
	{:else}
		<span class="{size} text-primary-300 dark:text-primary-600 leading-none">—</span>
	{/if}
</span>

<HoverTip {tip} />
