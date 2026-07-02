<!--
@component
FHV bespoke widget — "The Longest Night" (Night Two), the tower-defense siege of Atwood Farm.
The captives' fate (saved / many lost / all lost) and whether you faced the night alone; the
residents who stood by you and, in the darkest agenda, those who sacrificed themselves; plus two
Extra picks — how you handled Mother Rachel at the farm, and the damage left on the Captives at
the end (0 = a flawless defense). The Extra rows hide under Log-only mode. Full-width. Built on
FhvScenarioInfo + StatNumbers + LitTileGrid.
-->
<script lang="ts">
	import { FHV_DANCERS, fhvVillagerName, type CampaignFhv } from '$lib/campaign/campaigns/fhv';
	import { portraitUrl } from '$lib/campaign/records/campaign-log-source';
	import type { CampaignScenarios } from '$lib/campaign/stats/scenario-stats';
	import type { ProfileFamilyAchievement } from '$lib/campaign/achievements/achievement-aggregate';
	import FhvScenarioInfo from './FhvScenarioInfo.svelte';
	import StatNumbers, { type Stat, type StatGroup } from '$lib/components/profile/_primitives/StatNumbers.svelte';
	import LitTileGrid, { type LitTile } from '$lib/components/profile/_primitives/LitTileGrid.svelte';
	import SectionLabel from '$lib/components/profile/_primitives/SectionLabel.svelte';
	import { times } from '$lib/profile/plural';
	import * as m from '$lib/paraglide/messages.js';

	let {
		fhv,
		family = null,
		achievements = [],
		scenarios = null,
		logOnly = false
	}: {
		fhv: CampaignFhv | null;
		family?: string | null;
		achievements?: ProfileFamilyAchievement[];
		scenarios?: CampaignScenarios | null;
		logOnly?: boolean;
	} = $props();

	const n = $derived(fhv?.longestNight ?? null);
	const villagers = $derived(fhv?.villagers ?? {});

	const captivesGroup = $derived<StatGroup | null>(
		n && (n.captivesSaved || n.captivesManyLost || n.captivesAllLost)
			? {
					heading: m.campaign_fhv_ln_captives_heading(),
					stats: [
						{ value: n.captivesSaved, label: m.campaign_fhv_ln_saved() },
						{ value: n.captivesManyLost, label: m.campaign_fhv_ln_many() },
						{ value: n.captivesAllLost, label: m.campaign_fhv_ln_all() }
					]
				}
			: null
	);
	// Faced-alone + Dr. Marquez's plan (log), and — unless Log-only — Rachel's stance + best defense (Extra).
	const secondRow = $derived<Stat[]>(
		n
			? [
					{ value: n.facedAlone, label: m.campaign_fhv_ln_faced_alone() },
					{ value: n.drMarquezPlan, label: m.campaign_fhv_ln_marquez() },
					...(!logOnly && (n.rachel.confront || n.rachel.hide)
						? [
								{ value: n.rachel.confront, label: m.campaign_fhv_ln_confront() },
								{ value: n.rachel.hide, label: m.campaign_fhv_ln_hide() }
							]
						: []),
					...(!logOnly && n.damagePlays > 0 ? [{ value: n.damageBest ?? 0, label: m.campaign_fhv_ln_damage_best() }] : [])
				]
			: []
	);
	const rows = $derived<(Stat[] | StatGroup)[]>([...(captivesGroup ? [captivesGroup] : []), ...(secondRow.length ? [secondRow] : [])]);

	const roster = (metric: 'stood' | 'sacrificed', lit: (name: string, times: string) => string, none: string) =>
		FHV_DANCERS.map((v): LitTile => {
			const c = villagers[v]?.[metric] ?? 0;
			const name = fhvVillagerName(v);
			return {
				id: `${metric}-${v}`,
				image: portraitUrl('fhv', v),
				label: name,
				count: c,
				detail: c > 0 ? lit(name, times(c)) : none
			};
		});
	const stoodTiles = $derived<LitTile[]>(
		roster('stood', (name, t) => m.campaign_fhv_ln_stood_tile({ name, times: t }), m.campaign_fhv_ln_stood_none())
	);
	const sacrificedTiles = $derived<LitTile[]>(
		roster('sacrificed', (name, t) => m.campaign_fhv_ln_sacrificed_tile({ name, times: t }), m.campaign_fhv_ln_sacrificed_none())
	);
	const anyStood = $derived(stoodTiles.some((t) => t.count > 0));
	const anySacrificed = $derived(sacrificedTiles.some((t) => t.count > 0));
	const hasData = $derived(rows.length > 0 || anyStood || anySacrificed);
</script>

<FhvScenarioInfo scenarioId="the_longest_night" {family} {achievements} {scenarios} {logOnly} showPlays>
	{#snippet children()}
		{#if hasData}
			<div class="space-y-4">
				{#if rows.length}
					<StatNumbers {rows} />
				{/if}
				{#if anyStood}
					<div>
						<SectionLabel variant="heading" align="center">{m.campaign_fhv_ln_stood_heading()}</SectionLabel>
						<LitTileGrid tiles={stoodTiles} layout="flex" objectTop />
					</div>
				{/if}
				{#if anySacrificed}
					<div>
						<SectionLabel variant="heading" align="center">{m.campaign_fhv_ln_sacrificed_heading()}</SectionLabel>
						<LitTileGrid tiles={sacrificedTiles} layout="flex" objectTop />
					</div>
				{/if}
			</div>
		{:else}
			<p class="text-primary-500 text-sm">{m.campaign_fhv_ln_empty()}</p>
		{/if}
	{/snippet}
</FhvScenarioInfo>
