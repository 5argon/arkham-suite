<!--
@component
Reusable TSK "Routing" — a campaign's scenarios drawn left-to-right in play order
(derived from the recorded-log sequence), each as its encounter-set icon with a
small tier badge (the level/version played, from the Extra inputs) and a hover
tooltip carrying the solver's English description. Used across the Routings
widgets. A scenario with no kohaku icon (e.g. an interlude location) falls back to
a lettered chip.
-->
<script lang="ts">
	import { EncounterSetIcon, HoverTooltip } from '@5argon/arkham-life-ui';
	import { routeStepInfo, type RouteStepInfo } from '$lib/campaign/tsk-solver';

	let {
		steps,
		family,
		size = '1.8rem',
		highlight,
		nowrap = false
	}: {
		steps: { scenarioId: string; level?: string; version?: string; finaleVersion?: string }[];
		family: string | null;
		size?: string;
		/** Scenario id to emphasise (e.g. the scenario whose widget this route is in). */
		highlight?: string;
		/** Keep the track on ONE line (no wrapping) — for tight table cells that scroll instead. */
		nowrap?: boolean;
	} = $props();

	const items = $derived(
		steps.map((s) => ({ ...routeStepInfo(family, s), on: s.scenarioId === highlight }))
	);

	let tipVisible = $state(false);
	let tipRef = $state<HTMLElement | null>(null);
	let tipText = $state('');
	function showTip(it: RouteStepInfo, e: MouseEvent) {
		tipText = it.tooltip;
		tipRef = e.currentTarget as HTMLElement;
		tipVisible = true;
	}
	const hideTip = () => (tipVisible = false);

	// First two letters of each significant word → a compact fallback chip label.
	const initials = (name: string) =>
		name
			.split(/\s+/)
			.filter((w) => !/^(the|of|a|and|in)$/i.test(w))
			.map((w) => w[0]?.toUpperCase() ?? '')
			.join('')
			.slice(0, 3);
</script>

<div class="inline-flex {nowrap ? 'flex-nowrap' : 'flex-wrap'} items-start gap-2.5" style="font-size:{size}">
	{#each items as it, i (i)}
		<div
			role="img"
			aria-label={it.tooltip}
			class="flex cursor-default flex-col items-center {it.on ? '' : highlight ? 'opacity-40' : ''}"
			onmouseenter={(e) => showTip(it, e)}
			onmouseleave={hideTip}
		>
			{#if it.iconSet}
				<span
					class="leading-none {it.on
						? 'text-secondary-600 dark:text-secondary-400'
						: 'text-primary-800 dark:text-primary-100'}"
				>
					<EncounterSetIcon encounterSet={it.iconSet} />
				</span>
			{:else}
				<span
					class="bg-primary-200 dark:bg-primary-700 text-primary-600 dark:text-primary-200 flex items-center justify-center rounded-full font-semibold"
					style="width:1em;height:1em;font-size:0.5em"
				>
					{initials(it.name)}
				</span>
			{/if}
			<span
				class="text-secondary-600 dark:text-secondary-400 mt-0.5 font-semibold"
				style="font-size:0.42em"
			>
				{it.badge ?? ' '}
			</span>
		</div>
	{/each}
</div>

<HoverTooltip visible={tipVisible} referenceElement={tipRef}>
	<span class="block max-w-xs py-1 text-xs text-neutral-900 dark:text-neutral-100">{tipText}</span>
</HoverTooltip>
