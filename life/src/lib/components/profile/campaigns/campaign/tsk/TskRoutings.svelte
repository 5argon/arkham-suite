<!-- @component Notable winning routes: the latest of each length, the most and least time passed, and the latest to earn each route achievement. -->
<script lang="ts">
	import { getCampaignLog } from '@5argon/arkham-campaign-data';
	import type { CampaignTsk } from '$lib/campaign/campaigns/tsk/profile';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import { WidgetEmpty } from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';
	import RouteHighlightTable, { type RouteHighlightRow } from './RouteHighlightTable.svelte';

	let { blob: tsk, ctx }: CampaignWidgetProps<CampaignTsk> = $props();

	const withTime = (label: string, time: number | null | undefined) => (time != null ? `${label} (${time})` : label);

	const rows = $derived.by((): RouteHighlightRow[] => {
		const h = tsk?.routeHighlights;
		if (!h) return [];
		const achievements = getCampaignLog(ctx.family ?? 'tskc')?.en.achievements ?? {};
		return [
			...h.byLength.map(({ length, route }) => ({
				id: `len-${length}`,
				label: m.campaign_tsk_routes_scenarios_played({ count: length }),
				route
			})),
			{ id: 'most', label: withTime(m.campaign_tsk_routes_most_time(), h.mostTime?.time), route: h.mostTime },
			{ id: 'least', label: withTime(m.campaign_tsk_routes_least_time(), h.leastTime?.time), route: h.leastTime },
			...(ctx.config.hideAchievements === true
				? []
				: h.achievements.map(({ id, route }) => {
						const title = achievements[id]?.title ?? id;
						return {
							id: `ach-${id}`,
							label: id === 'speed_demon' ? withTime(title, route?.time) : title,
							route,
							description: achievements[id]?.text ?? ''
						};
					}))
		].map((r) => ({ ...r, lit: !!r.route }));
	});
</script>

{#if tsk?.routeHighlights.byLength.length}
	<RouteHighlightTable
		{rows}
		columns={[{ label: m.campaign_tsk_routes_col_highlight() }, { label: m.campaign_tsk_routes_col_route() }]}
	/>
{:else}
	<WidgetEmpty>{m.campaign_tsk_routes_empty()}</WidgetEmpty>
{/if}
