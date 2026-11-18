<!-- @component A TSK route: its scenarios' icons in play order with tier badges, or a dash when there is none. -->
<script lang="ts">
	import type { TskRoute } from '$lib/campaign/campaigns/tsk/profile';
	import { routeStepInfo, type RouteStepInfo } from '$lib/campaign/campaigns/tsk/solver';
	import { IconTrack, ScenarioSetIcon, type IconTrackItem } from '$lib/components/profile/_primitives';

	let {
		route,
		highlight,
		size = '1.4rem',
		nowrap = false
	}: {
		route: TskRoute | null;
		/** The scenario to emphasise; the others dim. */
		highlight?: string;
		size?: string;
		nowrap?: boolean;
	} = $props();

	// A stop with no encounter icon shows the initials of its significant words.
	const initials = (name: string) =>
		name
			.split(/\s+/)
			.filter((w) => !/^(the|of|a|and|in)$/i.test(w))
			.map((w) => w[0]?.toUpperCase() ?? '')
			.join('')
			.slice(0, 3);

	interface RouteItem extends IconTrackItem, RouteStepInfo {}
	const items = $derived<RouteItem[]>(
		(route?.steps ?? []).map((s) => {
			const on = s.scenarioId === highlight;
			return {
				...routeStepInfo(s),
				dim: !!highlight && !on,
				tint: on ? 'text-secondary-600 dark:text-secondary-400' : 'text-primary-800 dark:text-primary-100'
			};
		})
	);
</script>

{#if route}
	<IconTrack {items} {size} cellWidth="1em" gap="0.4em" wrap={!nowrap}>
		{#snippet icon(it)}
			<ScenarioSetIcon iconSet={it.iconSet} fallback={initials(it.name)} />
		{/snippet}
		{#snippet sub(it)}
			<span class="text-secondary-600 dark:text-secondary-400 font-semibold" style="font-size:0.42em"
				>{it.badge ?? ' '}</span
			>
		{/snippet}
	</IconTrack>
{:else}
	<span class="text-primary-400">—</span>
{/if}
