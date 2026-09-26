<!-- @component The four missing persons, lit by how often their trail was picked up; each hover tells how they were lost and how they stood at Union and Disillusion. -->
<script lang="ts">
	import type { CampaignTcu } from '$lib/campaign/campaigns/tcu';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import { LitTileGrid, type LitTile } from '$lib/components/profile/_primitives';
	import { times } from '$lib/profile/plural';
	import * as m from '$lib/paraglide/messages.js';
	import ScenarioInfo from '../ScenarioInfo.svelte';

	let { blob: tcu, ctx }: CampaignWidgetProps<CampaignTcu> = $props();

	const FATE: Record<string, () => string> = {
		taken_by_the_watcher: m.campaign_tcu_fate_taken_by_the_watcher,
		claimed_by_specters: m.campaign_tcu_fate_claimed_by_specters,
		disappeared_into_the_mist: m.campaign_tcu_fate_disappeared_into_the_mist,
		pulled_into_the_spectral_realm: m.campaign_tcu_fate_pulled_into_the_spectral_realm
	};

	const persons = $derived(tcu?.missingPersons ?? []);
	const tiles = $derived<LitTile[]>(
		persons.map((p) => {
			const parts = [
				...p.fates.map((f) => `${FATE[f.fate]?.() ?? f.fate} ×${f.plays}`),
				...(p.trail ? [m.campaign_tcu_person_trail({ times: times(p.trail) })] : []),
				...(p.union.alive ? [`${m.campaign_tcu_person_alive()} ×${p.union.alive}`] : []),
				...(p.union.dead ? [`${m.campaign_tcu_person_dead()} ×${p.union.dead}`] : [])
			];
			return {
				id: p.code,
				code: p.code,
				count: p.trail,
				detail: parts.join(' · ') || m.campaign_tcu_person_none()
			};
		})
	);
</script>

<ScenarioInfo {ctx} empty={persons.some((p) => p.any) ? null : m.campaign_tcu_persons_empty()}>
	{#snippet children()}
		{#if persons.some((p) => p.any)}
			<LitTileGrid {tiles} colsClass="grid-cols-2 @3xl:grid-cols-4" countPosition="below" />
		{/if}
	{/snippet}
</ScenarioInfo>
