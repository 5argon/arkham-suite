<!-- @component An ending-kind icon (better win / win / special / loss) with its name on hover; null shows a dash. -->
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
		kind: EndingKind | null;
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
