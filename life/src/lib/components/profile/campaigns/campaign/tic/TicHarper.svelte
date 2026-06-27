<!--
@component
TIC bespoke widget — "The Vanishing of Elina Harper". The deduction: which suspect + hideout
you accused (`hidden.accuse_*`), and whether the rescue succeeded. Guessing both correctly is
the "Elementary, Dear Dawson" achievement. Suspects/hideouts are labelled tiles (no art).
-->
<script lang="ts">
	import { TIC_SUSPECTS, TIC_HIDEOUTS, type CampaignTic } from '$lib/campaign/campaigns/tic';
	import type { CampaignScenarios } from '$lib/campaign/stats/scenario-stats';
	import type { ProfileFamilyAchievement } from '$lib/campaign/achievements/achievement-aggregate';
	import ScenarioInfo from '$lib/components/profile/campaigns/campaign/ScenarioInfo.svelte';
	import LitTileGrid, { type LitTile } from '$lib/components/profile/_primitives/LitTileGrid.svelte';
	import StatNumbers, { type Stat } from '$lib/components/profile/_primitives/StatNumbers.svelte';
	import { times } from '$lib/profile/plural';
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
		h && h.missionSucceeded + h.missionFailed > 0
			? [
					[
						{ value: h.missionSucceeded, label: m.campaign_tic_harper_succeeded() },
						{ value: h.missionFailed, label: m.campaign_tic_harper_failed() }
					]
				]
			: []
	);
	const tileOf = (id: string, label: string, c: number): LitTile => ({
		id,
		image: '',
		label,
		count: c,
		detail: c > 0 ? m.campaign_tic_harper_accused({ times: times(c) }) : m.campaign_tic_harper_not_accused()
	});
	const suspects = $derived<LitTile[]>(
		h ? TIC_SUSPECTS.map((s) => tileOf(s, (SUSPECT[s] ?? (() => s))(), h.suspect[s] ?? 0)) : []
	);
	const hideouts = $derived<LitTile[]>(
		h ? TIC_HIDEOUTS.map((x) => tileOf(x.id, (HIDEOUT[x.id] ?? (() => x.id))(), h.hideout[x.id] ?? 0)) : []
	);
	const accusedAny = $derived(
		!!h && (suspects.some((t) => t.count > 0) || hideouts.some((t) => t.count > 0))
	);
	const hasData = $derived(!!h && (h.missionSucceeded + h.missionFailed > 0 || accusedAny));
</script>

<ScenarioInfo scenarioId="the_vanishing_of_elina_harper" {family} {achievements} {scenarios} {logOnly}>
	{#snippet children()}
		{#if hasData}
			{#if missionRows.length}<StatNumbers rows={missionRows} />{/if}
			{#if accusedAny}
				<p class="text-primary-500 mt-3 mb-1.5 text-center text-xs font-semibold tracking-wide uppercase">
					{m.campaign_tic_harper_suspect_heading()}
				</p>
				<LitTileGrid tiles={suspects} colsClass="grid-cols-3 @3xl:grid-cols-6" />
				<p class="text-primary-500 mt-3 mb-1.5 text-center text-xs font-semibold tracking-wide uppercase">
					{m.campaign_tic_harper_hideout_heading()}
				</p>
				<LitTileGrid tiles={hideouts} colsClass="grid-cols-3 @3xl:grid-cols-6" />
			{/if}
		{:else}
			<p class="text-primary-500 text-sm">{m.campaign_tic_harper_empty()}</p>
		{/if}
	{/snippet}
</ScenarioInfo>
