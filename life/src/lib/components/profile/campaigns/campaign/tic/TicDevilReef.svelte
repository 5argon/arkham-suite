<!--
@component
TIC bespoke widget — "Devil Reef". The terror of Devil Reef's fate + the rising tide (per
difficulty), and the 3 story-asset artifacts (Waveworn Idol / Awakened Mantle / Headdress)
brought to the lighthouse as real card art — securing all three is the `full_build` achievement.
Built on ScenarioInfo + StatNumbers + LitTileGrid.
-->
<script lang="ts">
	import { getCardImagePath } from '@5argon/arkham-life-ui';
	import { TIC_EQUIPMENT, type CampaignTic } from '$lib/campaign/campaigns/tic';
	import type { ResolutionTally } from '$lib/campaign/outcomes/resolution-coverage';
	import type { CampaignScenarios } from '$lib/campaign/stats/scenario-stats';
	import type { ProfileFamilyAchievement } from '$lib/campaign/achievements/achievement-aggregate';
	import { tallyDetail } from '$lib/campaign/utils/difficulty';
	import ScenarioInfo from '$lib/components/profile/campaigns/campaign/ScenarioInfo.svelte';
	import LitTileGrid, {
		type LitTile
	} from '$lib/components/profile/_primitives/LitTileGrid.svelte';
	import SectionLabel from '$lib/components/profile/_primitives/SectionLabel.svelte';
	import StatNumbers, { type Stat } from '$lib/components/profile/_primitives/StatNumbers.svelte';
	import * as m from '$lib/paraglide/messages.js';

	let {
		tic,
		family = null,
		achievements = [],
		scenarios = null,
		logOnly = false
	}: {
		tic: CampaignTic | null;
		family?: string | null;
		achievements?: ProfileFamilyAchievement[];
		scenarios?: CampaignScenarios | null;
		logOnly?: boolean;
	} = $props();

	const EQUIP_LABEL: Record<string, () => string> = {
		idol: m.campaign_tic_equip_idol,
		mantle: m.campaign_tic_equip_mantle,
		headdress: m.campaign_tic_equip_headdress
	};

	const d = $derived(tic?.devilReef);
	const e = $derived(tic?.equipment);
	const hasTerror = $derived(
		!!d && d.terrorAlive.total + d.terrorDead.total + d.tideGrown.total > 0
	);
	const hasEquip = $derived(!!e && TIC_EQUIPMENT.some((eq) => (e.secured[eq.id]?.total ?? 0) > 0));
	const hasData = $derived(hasTerror || hasEquip);

	const terrorRows = $derived<Stat[][]>(
		hasTerror && d
			? [
					[
						{
							value: d.terrorDead.total,
							label: m.campaign_tic_dr_terror_dead(),
							byTier: d.terrorDead.byTier
						},
						{
							value: d.terrorAlive.total,
							label: m.campaign_tic_dr_terror_alive(),
							byTier: d.terrorAlive.byTier
						},
						{
							value: d.tideGrown.total,
							label: m.campaign_tic_dr_tide(),
							byTier: d.tideGrown.byTier
						}
					]
				]
			: []
	);
	const detailOf = (t: ResolutionTally | undefined): string =>
		tallyDetail(t, m.campaign_tic_equip_not_secured, (times) =>
			m.campaign_tic_equip_secured({ times })
		);
	const artifactTiles = $derived<LitTile[]>(
		TIC_EQUIPMENT.map((eq): LitTile => {
			const t = e?.secured[eq.id];
			return {
				id: eq.id,
				image: getCardImagePath(eq.code, 'square'),
				label: (EQUIP_LABEL[eq.id] ?? (() => eq.id))(),
				count: t?.total ?? 0,
				detail: detailOf(t)
			};
		})
	);
	const fullBuildRow = $derived<Stat[][]>(
		tic && tic.equipment.allThree.total > 0
			? [
					[
						{
							value: tic.equipment.allThree.total,
							label: m.campaign_tic_equip_full_build_label(),
							byTier: tic.equipment.allThree.byTier
						}
					]
				]
			: []
	);
</script>

<ScenarioInfo scenarioId="devil_reef" {family} {achievements} {scenarios} {logOnly}>
	{#snippet stats()}
		{#if hasTerror}<StatNumbers rows={terrorRows} />{/if}
	{/snippet}
	{#snippet children()}
		{#if hasEquip}
			<div class="space-y-2">
				<SectionLabel variant="heading" align="center"
					>{m.campaign_tic_equip_heading()}</SectionLabel
				>
				<LitTileGrid tiles={artifactTiles} layout="flex" objectTop />
				{#if fullBuildRow.length}<StatNumbers rows={fullBuildRow} />{/if}
			</div>
		{:else if !hasTerror}
			<p class="text-primary-500 text-sm">{m.campaign_tic_dr_empty()}</p>
		{/if}
	{/snippet}
</ScenarioInfo>
