<!--
@component
Reusable TSK "Routing" — a campaign's scenarios drawn left-to-right in play order (derived from
the recorded-log sequence), each as its encounter-set icon with a small tier badge (the
level/version played, from the Extra inputs) and a hover tooltip carrying the solver's English
description. Rendered through the shared IconTrack. A scenario with no kohaku icon (e.g. an
interlude location) falls back to a lettered chip.
-->
<script lang="ts">
	import { routeStepInfo, type RouteStepInfo } from '$lib/campaign/campaigns/tsk-solver';
	import IconTrack, {
		type IconTrackItem
	} from '$lib/components/profile/_primitives/IconTrack.svelte';
	import ScenarioSetIcon from '$lib/components/profile/_primitives/ScenarioSetIcon.svelte';

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

	// First two letters of each significant word → a compact fallback chip label.
	const initials = (name: string) =>
		name
			.split(/\s+/)
			.filter((w) => !/^(the|of|a|and|in)$/i.test(w))
			.map((w) => w[0]?.toUpperCase() ?? '')
			.join('')
			.slice(0, 3);

	interface RouteItem extends IconTrackItem, RouteStepInfo {}
	const items = $derived<RouteItem[]>(
		steps.map((s) => {
			const on = s.scenarioId === highlight;
			return {
				...routeStepInfo(family, s),
				dim: !!highlight && !on,
				tint: on
					? 'text-secondary-600 dark:text-secondary-400'
					: 'text-primary-800 dark:text-primary-100'
			};
		})
	);
</script>

<IconTrack {items} {size} cellWidth="1em" gap="0.4em" wrap={!nowrap}>
	{#snippet icon(it)}
		<ScenarioSetIcon iconSet={it.iconSet} fallback={initials(it.name)} />
	{/snippet}
	{#snippet sub(it)}
		<!-- The badge is always the secondary accent (its own colour wins over the cell tint). -->
		<span class="text-secondary-600 dark:text-secondary-400 font-semibold" style="font-size:0.42em"
			>{it.badge ?? ' '}</span
		>
	{/snippet}
</IconTrack>
