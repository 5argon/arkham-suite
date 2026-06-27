<!--
@component
tdea bespoke widget — "The Search for Kadath". The Dreamlands route taken (Oriab / Mnar /
the Forbidden Lands / the Timeless Realm), and who was captured at the temple (Virgil /
Randolph / someone escaped vs everyone captured). Built on StatNumbers.
-->
<script lang="ts">
	import type { CampaignTdea } from '$lib/campaign/campaigns/tdea';
	import type { CampaignScenarios } from '$lib/campaign/stats/scenario-stats';
	import type { ProfileFamilyAchievement } from '$lib/campaign/achievements/achievement-aggregate';
	import ScenarioInfo from '$lib/components/profile/campaigns/campaign/ScenarioInfo.svelte';
	import StatNumbers, {
		type StatGroup
	} from '$lib/components/profile/_primitives/StatNumbers.svelte';
	import * as m from '$lib/paraglide/messages.js';

	let {
		tdea,
		family = null,
		achievements = [],
		scenarios = null,
		logOnly = false
	}: {
		tdea: CampaignTdea | null;
		family?: string | null;
		achievements?: ProfileFamilyAchievement[];
		scenarios?: CampaignScenarios | null;
		logOnly?: boolean;
	} = $props();
	const s = $derived(tdea?.searchForKadath);
	const routeTotal = $derived(s ? Object.values(s.route).reduce((a, b) => a + b, 0) : 0);
	const capTotal = $derived(
		s ? s.captures.virgil + s.captures.randolph + s.captures.someoneEscaped + s.captures.everyoneCaptured : 0
	);
	const hasData = $derived(!!s && routeTotal + capTotal + s.forcedIntoTemple + s.brokeLawOfUlthar > 0);
	const ROUTE: { id: string; label: () => string }[] = [
		{ id: 'oriab', label: m.campaign_tdea_search_oriab },
		{ id: 'minar', label: m.campaign_tdea_search_minar },
		{ id: 'forbidden_lands', label: m.campaign_tdea_search_forbidden },
		{ id: 'timeless_realm', label: m.campaign_tdea_search_timeless }
	];
	const rows = $derived<StatGroup[]>(
		hasData && s
			? [
					{
						heading: m.campaign_tdea_search_route_heading(),
						stats: ROUTE.map((r) => ({ value: s.route[r.id] ?? 0, label: r.label() }))
					},
					{
						heading: m.campaign_tdea_search_temple_heading(),
						stats: [
							{ value: s.captures.someoneEscaped, label: m.campaign_tdea_search_escaped() },
							{ value: s.captures.everyoneCaptured, label: m.campaign_tdea_search_all_captured() },
							{ value: s.brokeLawOfUlthar, label: m.campaign_tdea_search_ulthar() }
						]
					}
				]
			: []
	);
</script>

<ScenarioInfo scenarioId="the_search_for_kadath" {family} {achievements} {scenarios} {logOnly}>
	{#snippet stats()}
		{#if hasData}
			<StatNumbers {rows} />
		{:else}
			<p class="text-primary-500 text-sm">{m.campaign_tdea_search_empty()}</p>
		{/if}
	{/snippet}
</ScenarioInfo>
