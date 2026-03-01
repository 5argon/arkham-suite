<!--
@component
TSK "Successful Routes" — a table of the player's most notable WINNING runs, each
drawn as an ordered track of scenario icons (see RoutingTrack). Rows:
  • one per distinct run LENGTH (the most recent winning run of that many scenarios),
  • the runs with the Most / Least time passed,
  • and, per tracked achievement (Red Looks Good on Me, Bloody Red Revolution, Speed
    Demon, Trust Nobody/Everybody, Here is Your Badge), the most recent winning run
    that earned it — Speed Demon also showing that run's time passed. Hovering an
    achievement row reveals that achievement's description (package-sourced). The
    achievement rows can be hidden via the widget's config.
Only WINNING campaigns count (a thrown game shouldn't mint a route). Em dash until a
qualifying route exists.
-->
<script lang="ts">
	import { getCampaignLog } from '@5argon/arkham-campaign-data';
	import { HoverTooltip, parseArkhamMarkup } from '@5argon/arkham-life-ui';
	import { TSK_ROUTE_ACHIEVEMENTS, type CampaignTsk, type TskRoute } from '$lib/campaign/tsk-profile';
	import * as m from '$lib/paraglide/messages.js';
	import RoutingTrack from '$lib/components/profile/campaigns/campaign/tsk/RoutingTrack.svelte';
	import WidgetTable, { widgetTableCell } from '$lib/components/profile/_primitives/WidgetTable.svelte';

	let {
		tsk,
		family,
		hideAchievements = false
	}: { tsk: CampaignTsk | null; family: string | null; hideAchievements?: boolean } = $props();

	// WINNING routes only, most-recent first (the per-scenario widgets use the rest).
	const byRecent = $derived(
		[...(tsk?.routes ?? [])].filter((r) => r.won).sort((a, b) => (b.finishDate ?? 0) - (a.finishDate ?? 0))
	);

	// One row per distinct length: the most recent winning run of that many scenarios.
	const lengthRows = $derived.by(() => {
		const byLen = new Map<number, TskRoute>();
		for (const r of byRecent) if (!byLen.has(r.length)) byLen.set(r.length, r);
		return [...byLen.entries()]
			.sort((a, b) => a[0] - b[0])
			.map(([len, route]) => ({
				key: `len-${len}`,
				label: m.campaign_tsk_routes_scenarios_played({ count: len }),
				route
			}));
	});

	const timed = $derived(byRecent.filter((r) => r.time != null));
	const mostTime = $derived<TskRoute | null>(
		timed.length ? timed.reduce((b, r) => (r.time! > b.time! ? r : b)) : null
	);
	const leastTime = $derived<TskRoute | null>(
		timed.length ? timed.reduce((b, r) => (r.time! < b.time! ? r : b)) : null
	);

	// Achievement title + description are package-sourced (campaign-data English).
	const achLog = $derived(getCampaignLog(family ?? 'tskc'));
	const achTitle = (id: string): string => achLog?.en.achievements?.[id]?.title ?? id; // i18n: package-sourced
	const achDescription = (id: string): string => achLog?.en.achievements?.[id]?.text ?? ''; // i18n: package-sourced
	const routeForAch = (id: string): TskRoute | null =>
		byRecent.find((r) => r.achievements.includes(id)) ?? null;

	interface RouteRow {
		key: string;
		label: string;
		route: TskRoute | null;
		/** Present on achievement rows — its hover shows the achievement explanation. */
		description?: string;
	}
	const rows = $derived.by((): RouteRow[] => {
		const out: RouteRow[] = [...lengthRows];
		out.push({
			key: 'most',
			label: m.campaign_tsk_routes_most_time() + (mostTime ? ` (${mostTime.time})` : ''),
			route: mostTime
		});
		out.push({
			key: 'least',
			label: m.campaign_tsk_routes_least_time() + (leastTime ? ` (${leastTime.time})` : ''),
			route: leastTime
		});
		if (!hideAchievements) {
			for (const id of TSK_ROUTE_ACHIEVEMENTS) {
				const route = routeForAch(id);
				const suffix = id === 'speed_demon' && route?.time != null ? ` (${route.time})` : '';
				out.push({ key: `ach-${id}`, label: achTitle(id) + suffix, route, description: achDescription(id) });
			}
		}
		return out;
	});

	// One shared tooltip for the achievement-description hovers.
	let tipVisible = $state(false);
	let tipRef = $state<HTMLElement | null>(null);
	let tipDesc = $state('');
	function showDesc(desc: string, e: MouseEvent) {
		tipDesc = desc;
		tipRef = e.currentTarget as HTMLElement;
		tipVisible = true;
	}
	const hideDesc = () => (tipVisible = false);
</script>

{#if byRecent.length}
	<WidgetTable
		columns={[{ label: m.campaign_tsk_routes_col_highlight() }, { label: m.campaign_tsk_routes_col_route() }]}
		{rows}
		key={(r) => r.key}
	>
		{#snippet row(r)}
			<td class="{widgetTableCell} whitespace-nowrap {r.route ? 'font-semibold text-black dark:text-white' : 'text-primary-400'}">
				{#if r.description}
					{@const desc = r.description}
					<span
						role="note"
						class="cursor-help decoration-dotted underline-offset-2 hover:underline"
						onmouseenter={(e) => showDesc(desc, e)}
						onmouseleave={hideDesc}>{r.label}</span
					>
				{:else}
					{r.label}
				{/if}
			</td>
			<td class={widgetTableCell}>
				{#if r.route}
					<RoutingTrack steps={r.route.steps} {family} size="1.4rem" />
				{:else}
					<span class="text-primary-400">—</span>
				{/if}
			</td>
		{/snippet}
	</WidgetTable>
{:else}
	<p class="text-primary-400 text-sm italic">{m.campaign_tsk_routes_empty()}</p>
{/if}

<HoverTooltip visible={tipVisible} referenceElement={tipRef}>
	<span class="block max-w-xs py-1 text-xs text-neutral-700 dark:text-neutral-200"
		>{@html parseArkhamMarkup(tipDesc)}</span
	>
</HoverTooltip>
