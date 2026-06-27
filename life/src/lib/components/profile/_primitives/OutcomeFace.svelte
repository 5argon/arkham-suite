<!--
@component
Shared win/loss "outcome face" — the ending-kind FaIcon (better-win / win / special / loss)
with a hover tooltip naming it. One face, reused by the endings list, the Campaign Overview,
and any per-play outcome column. `kind = null` renders a muted dash (e.g. an abandoned /
unfinished run). `reached = false` greys it (an ending you haven't hit yet).
-->
<script lang="ts">
	import { FaIcon, FaIconType, HoverTooltip } from '@5argon/arkham-life-ui';
	import type { EndingKind } from '$lib/campaign/outcomes/clear-status';

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

	let tipVisible = $state(false);
	let tipRef = $state<HTMLElement | null>(null);
	const show = (e: MouseEvent) => {
		tipRef = e.currentTarget as HTMLElement;
		tipVisible = true;
	};
	const hide = () => (tipVisible = false);
</script>

<span
	role="img"
	aria-label={label}
	class="inline-flex cursor-default"
	onmouseenter={show}
	onmouseleave={hide}
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

<HoverTooltip visible={tipVisible} referenceElement={tipRef}>
	<span class="block max-w-xs py-1 text-xs text-neutral-900 dark:text-neutral-100">{label}</span>
</HoverTooltip>
