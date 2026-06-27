<!--
@component
TCU bespoke widget — "Lodge vs Coven", the campaign spine. Which side you committed to
(Union and Disillusion) and the leanings along the way (member/enemy/deceiver of the
Lodge; told vs hid the Coven). All discrete logged choices — no running-count problem.
Built on StatNumbers.
-->
<script lang="ts">
	import type { CampaignTcu } from '$lib/campaign/campaigns/tcu';
	import StatNumbers, { type Stat } from '$lib/components/profile/_primitives/StatNumbers.svelte';
	import * as m from '$lib/paraglide/messages.js';

	let { tcu }: { tcu: CampaignTcu | null } = $props();
	const a = $derived(tcu?.allegiance);
	const hasData = $derived(
		!!a &&
			a.sidedLodge + a.sidedCoven + a.membersOfLodge + a.enemiesOfLodge + a.deceivingLodge + a.toldLodgeAboutCoven + a.hidKnowledgeOfCoven >
				0
	);
	const rows = $derived<Stat[][]>(
		hasData && a
			? [
					[
						{ value: a.sidedLodge, label: m.campaign_tcu_alleg_lodge() },
						{ value: a.sidedCoven, label: m.campaign_tcu_alleg_coven() }
					],
					[
						{ value: a.membersOfLodge, label: m.campaign_tcu_alleg_members() },
						{ value: a.enemiesOfLodge, label: m.campaign_tcu_alleg_enemies() },
						{ value: a.deceivingLodge, label: m.campaign_tcu_alleg_deceiving() }
					],
					[
						{ value: a.toldLodgeAboutCoven, label: m.campaign_tcu_alleg_told() },
						{ value: a.hidKnowledgeOfCoven, label: m.campaign_tcu_alleg_hid() }
					]
				]
			: []
	);
</script>

{#if hasData}
	<StatNumbers {rows} />
{:else}
	<p class="text-primary-500 text-sm">{m.campaign_tcu_alleg_empty()}</p>
{/if}
