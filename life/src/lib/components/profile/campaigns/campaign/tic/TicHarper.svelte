<!--
@component
TIC bespoke widget — "The Vanishing of Elina Harper". The deduction: which suspect + hideout
you accused (`hidden.accuse_*`), and whether the rescue succeeded. Guessing both correctly is
the "Elementary, Dear Dawson" achievement. Suspects (enemy cards) and hideouts (location cards)
render as real card art, lit by how often you accused each; Agent Harper is the passport header.
Built on ScenarioInfo + StatNumbers + LitTileGrid.
-->
<script lang="ts">
	import { getCardImagePath } from '@5argon/arkham-life-ui';
	import {
		TIC_SUSPECTS,
		TIC_HIDEOUTS,
		TIC_HARPER_CODE,
		type CampaignTic
	} from '$lib/campaign/campaigns/tic';
	import type { ResolutionTally } from '$lib/campaign/outcomes/resolution-coverage';
	import type { CampaignScenarios } from '$lib/campaign/stats/scenario-stats';
	import type { ProfileFamilyAchievement } from '$lib/campaign/achievements/achievement-aggregate';
	import { tallyDetail } from '$lib/campaign/utils/difficulty';
	import ScenarioInfo from '$lib/components/profile/campaigns/campaign/ScenarioInfo.svelte';
	import CardThumb from '$lib/components/profile/_primitives/CardThumb.svelte';
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
	const h = $derived(tic?.harper);

	const SUSPECT: Record<string, () => string> = {
		burnham: m.campaign_tic_suspect_burnham,
		gilman: m.campaign_tic_suspect_gilman,
		little: m.campaign_tic_suspect_little,
		marsh: m.campaign_tic_suspect_marsh,
		allen: m.campaign_tic_suspect_allen,
		friendly: m.campaign_tic_suspect_friendly
	};
	const HIDEOUT: Record<string, () => string> = {
		innsmouth_jail: m.campaign_tic_hideout_jail,
		shoreward_slums: m.campaign_tic_hideout_slums,
		sawbone_alley: m.campaign_tic_hideout_sawbone,
		house_on_water_street: m.campaign_tic_hideout_water_street,
		order_of_dagon: m.campaign_tic_hideout_order,
		new_church_green: m.campaign_tic_hideout_church
	};

	const missionRows = $derived<Stat[][]>(
		h && h.missionSucceeded.total + h.missionFailed.total > 0
			? [
					[
						{
							value: h.missionSucceeded.total,
							label: m.campaign_tic_harper_succeeded(),
							byTier: h.missionSucceeded.byTier
						},
						{
							value: h.missionFailed.total,
							label: m.campaign_tic_harper_failed(),
							byTier: h.missionFailed.byTier
						}
					]
				]
			: []
	);
	const detailOf = (t: ResolutionTally | undefined): string =>
		tallyDetail(t, m.campaign_tic_harper_not_accused, (times) =>
			m.campaign_tic_harper_accused({ times })
		);
	const suspects = $derived<LitTile[]>(
		h
			? TIC_SUSPECTS.map((s): LitTile => {
					const t = h.suspect[s.id];
					return {
						id: s.id,
						image: getCardImagePath(s.code, 'square'),
						label: (SUSPECT[s.id] ?? (() => s.id))(),
						count: t?.total ?? 0,
						detail: detailOf(t)
					};
				})
			: []
	);
	const hideouts = $derived<LitTile[]>(
		h
			? TIC_HIDEOUTS.map((x): LitTile => {
					const t = h.hideout[x.id];
					return {
						id: x.id,
						image: getCardImagePath(x.code, 'square'),
						label: (HIDEOUT[x.id] ?? (() => x.id))(),
						count: t?.total ?? 0,
						detail: detailOf(t)
					};
				})
			: []
	);
	const accusedAny = $derived(
		!!h && (suspects.some((t) => t.count > 0) || hideouts.some((t) => t.count > 0))
	);
	const hasData = $derived(
		!!h && (h.missionSucceeded.total + h.missionFailed.total > 0 || accusedAny)
	);
</script>

<ScenarioInfo
	scenarioId="the_vanishing_of_elina_harper"
	{family}
	{achievements}
	{scenarios}
	{logOnly}
>
	{#snippet headerArt()}
		<CardThumb
			code={TIC_HARPER_CODE}
			alt={m.campaign_tic_harper_agent()}
			title={m.campaign_tic_harper_agent()}
			objectTop
		/>
	{/snippet}
	{#snippet stats()}
		{#if missionRows.length}<StatNumbers rows={missionRows} />{/if}
	{/snippet}
	{#snippet children()}
		{#if accusedAny}
			<div class="space-y-3">
				<div>
					<SectionLabel variant="heading" align="center"
						>{m.campaign_tic_harper_suspect_heading()}</SectionLabel
					>
					<LitTileGrid tiles={suspects} colsClass="grid-cols-3 @3xl:grid-cols-6" objectTop />
				</div>
				<div>
					<SectionLabel variant="heading" align="center"
						>{m.campaign_tic_harper_hideout_heading()}</SectionLabel
					>
					<LitTileGrid tiles={hideouts} colsClass="grid-cols-3 @3xl:grid-cols-6" objectTop />
				</div>
			</div>
		{:else if !missionRows.length}
			<p class="text-primary-500 text-sm">{m.campaign_tic_harper_empty()}</p>
		{/if}
	{/snippet}
</ScenarioInfo>
