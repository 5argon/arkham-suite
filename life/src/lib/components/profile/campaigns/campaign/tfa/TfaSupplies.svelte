<!--
@component
TFA bespoke widget — "Provisions". What the profile subject packs on the expedition:
per provision, how many times the subject's own investigators took it (the supply log
keys by investigator, so this is the player's kit, not the team's). Built on StatNumbers.
-->
<script lang="ts">
	import { getCampaignLog } from '@5argon/arkham-campaign-data';
	import { itemLabel } from '$lib/campaign/records/campaign-log-source';
	import { TFA_PROVISIONS, type CampaignTfa } from '$lib/campaign/campaigns/tfa';
	import StatNumbers, { type Stat } from '$lib/components/profile/_primitives/StatNumbers.svelte';
	import * as m from '$lib/paraglide/messages.js';

	let { tfa }: { tfa: CampaignTfa | null } = $props();
	const log = getCampaignLog('tfa');
	const taken = $derived<Stat[]>(
		tfa
			? TFA_PROVISIONS.filter((id) => (tfa.supplies[id] ?? 0) > 0).map((id) => ({
					value: tfa.supplies[id],
					label: log ? itemLabel(log, id) : id
				}))
			: []
	);
	const hasData = $derived(taken.length > 0);
</script>

{#if hasData}
	<StatNumbers rows={[taken]} />
{:else}
	<p class="text-primary-500 text-sm">{m.campaign_tfa_supplies_empty()}</p>
{/if}
