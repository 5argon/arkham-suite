<!--
@component
TCU bespoke widget — "The Missing Persons". The four who vanish at the Twilight Estate (Gavriella,
Jerome, Valentino, Penny) as card portraits, lit by how often you picked up their trail. Each tile's
hover tells their whole arc: how they were lost at the estate (Taken by the Watcher / Claimed by
specters / …), whose trail you found at Death's Doorstep, and whether they were alive or dead when
the veil parted at Union and Disillusion. Built on LitTileGrid, inside the prologue passport.
-->
<script lang="ts">
	import { getCardImagePath } from '@5argon/arkham-life-ui';
	import { TCU_MISSING, TCU_FATES, type CampaignTcu } from '$lib/campaign/campaigns/tcu';
	import type { CampaignScenarios } from '$lib/campaign/stats/scenario-stats';
	import type { ProfileFamilyAchievement } from '$lib/campaign/achievements/achievement-aggregate';
	import ScenarioInfo from '$lib/components/profile/campaigns/campaign/ScenarioInfo.svelte';
	import { times } from '$lib/profile/plural';
	import LitTileGrid, { type LitTile } from '$lib/components/profile/_primitives/LitTileGrid.svelte';
	import * as m from '$lib/paraglide/messages.js';

	let {
		tcu,
		family = null,
		achievements = [],
		scenarios = null,
		logOnly = false
	}: {
		tcu: CampaignTcu | null;
		family?: string | null;
		achievements?: ProfileFamilyAchievement[];
		scenarios?: CampaignScenarios | null;
		logOnly?: boolean;
	} = $props();

	const NAME: Record<string, () => string> = {
		'05046': m.campaign_tcu_person_05046,
		'05047': m.campaign_tcu_person_05047,
		'05048': m.campaign_tcu_person_05048,
		'05049': m.campaign_tcu_person_05049
	};
	const FATE: Record<string, () => string> = {
		taken_by_the_watcher: m.campaign_tcu_fate_taken_by_the_watcher,
		claimed_by_specters: m.campaign_tcu_fate_claimed_by_specters,
		disappeared_into_the_mist: m.campaign_tcu_fate_disappeared_into_the_mist,
		pulled_into_the_spectral_realm: m.campaign_tcu_fate_pulled_into_the_spectral_realm
	};

	const tiles = $derived<LitTile[]>(
		tcu
			? TCU_MISSING.map((p): LitTile => {
					const t = tcu.missingPersons[p.id] ?? { trail: 0, fates: {}, union: { alive: 0, dead: 0 } };
					const parts: string[] = [];
					for (const f of TCU_FATES)
						if ((t.fates[f] ?? 0) > 0) parts.push(`${FATE[f]()} ×${t.fates[f]}`);
					if (t.trail > 0) parts.push(m.campaign_tcu_person_trail({ times: times(t.trail) }));
					if (t.union.alive > 0) parts.push(`${m.campaign_tcu_person_alive()} ×${t.union.alive}`);
					if (t.union.dead > 0) parts.push(`${m.campaign_tcu_person_dead()} ×${t.union.dead}`);
					return {
						id: p.id,
						image: getCardImagePath(p.id, 'square'),
						label: (NAME[p.id] ?? (() => p.name))(),
						count: t.trail,
						detail: parts.length ? parts.join(' · ') : m.campaign_tcu_person_none()
					};
				})
			: []
	);
	const hasData = $derived(
		tiles.some((t) => t.count > 0 || t.detail !== m.campaign_tcu_person_none())
	);
</script>

<ScenarioInfo
	scenarioId="disappearance_at_the_twilight_estate"
	{family}
	{achievements}
	{scenarios}
	{logOnly}
>
	{#snippet children()}
		{#if hasData}
			<LitTileGrid {tiles} colsClass="grid-cols-2 @3xl:grid-cols-4" countPosition="below" />
		{:else}
			<p class="text-primary-500 text-sm">{m.campaign_tcu_persons_empty()}</p>
		{/if}
	{/snippet}
</ScenarioInfo>
