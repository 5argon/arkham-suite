<!--
@component
tdea bespoke widget — "The Search for Kadath". The regions of the Dreamlands you searched (Oriab /
Mnar / the Forbidden Lands / the Timeless Realm), lit by how often each was visited, and what
happened at the temple (Virgil captured, someone escaped vs everyone captured, forced your way in,
broke the law of Ulthar → the "Cat Killer" achievement).
-->
<script lang="ts">
	import type { CampaignTdea } from '$lib/campaign/campaigns/tdea';
	import type { CampaignScenarios } from '$lib/campaign/stats/scenario-stats';
	import type { ProfileFamilyAchievement } from '$lib/campaign/achievements/achievement-aggregate';
	import ScenarioInfo from '$lib/components/profile/campaigns/campaign/ScenarioInfo.svelte';
	import LitTileGrid, { type LitTile } from '$lib/components/profile/_primitives/LitTileGrid.svelte';
	import SectionLabel from '$lib/components/profile/_primitives/SectionLabel.svelte';
	import StatNumbers, { type Stat } from '$lib/components/profile/_primitives/StatNumbers.svelte';
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
		s
			? s.captures.virgil + s.captures.randolph + s.captures.someoneEscaped +
					s.captures.everyoneCaptured + s.forcedIntoTemple + s.brokeLawOfUlthar
			: 0
	);
	const hasData = $derived(!!s && routeTotal + capTotal > 0);

	const REGIONS: { id: string; label: () => string }[] = [
		{ id: 'oriab', label: m.campaign_tdea_search_oriab },
		{ id: 'minar', label: m.campaign_tdea_search_minar },
		{ id: 'forbidden_lands', label: m.campaign_tdea_search_forbidden },
		{ id: 'timeless_realm', label: m.campaign_tdea_search_timeless }
	];
	const regionTiles = $derived<LitTile[]>(
		REGIONS.map((r) => ({
			id: r.id,
			image: '',
			label: r.label(),
			count: s?.route[r.id] ?? 0,
			detail: ''
		}))
	);
	const templeStats = $derived<Stat[]>(
		s
			? [
					{ value: s.captures.virgil, label: m.campaign_tdea_search_virgil() },
					{ value: s.captures.someoneEscaped, label: m.campaign_tdea_search_escaped() },
					{ value: s.captures.everyoneCaptured, label: m.campaign_tdea_search_all_captured() },
					{ value: s.forcedIntoTemple, label: m.campaign_tdea_search_forced() },
					{ value: s.brokeLawOfUlthar, label: m.campaign_tdea_search_ulthar() }
				]
			: []
	);
</script>

<ScenarioInfo scenarioId="the_search_for_kadath" {family} {achievements} {scenarios} {logOnly}>
	{#snippet stats()}
		{#if hasData}
			<div class="space-y-4">
				{#if routeTotal > 0}
					<div>
						<SectionLabel variant="heading" align="center"
							>{m.campaign_tdea_search_route_heading()}</SectionLabel
						>
						<LitTileGrid tiles={regionTiles} layout="flex" showLabel={false} />
					</div>
				{/if}
				{#if capTotal > 0}
					<StatNumbers rows={[{ heading: m.campaign_tdea_search_temple_heading(), stats: templeStats }]} />
				{/if}
			</div>
		{:else}
			<p class="text-primary-500 text-sm">{m.campaign_tdea_search_empty()}</p>
		{/if}
	{/snippet}
</ScenarioInfo>
