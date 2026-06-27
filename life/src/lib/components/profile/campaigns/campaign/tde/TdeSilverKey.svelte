<!--
@component
TDE shared widget — "The Silver Key". Times obtained, and (interconnected) times it ended
in the Dream-Quest after passing across at The Great Ones. Built on StatNumbers.
-->
<script lang="ts">
	import type { CampaignTdeShared } from '$lib/campaign/campaigns/tde-shared';
	import StatNumbers, { type Stat } from '$lib/components/profile/_primitives/StatNumbers.svelte';
	import * as m from '$lib/paraglide/messages.js';

	let { shared }: { shared: CampaignTdeShared | null } = $props();
	const s = $derived(shared?.silverKey);
	const hasData = $derived(!!s && s.obtained > 0);
	const rows = $derived<Stat[][]>(
		hasData && s
			? [
					[
						{ value: s.obtained, label: m.campaign_tde_key_obtained() },
						{ value: s.withDreamQuest, label: m.campaign_tde_key_passed() }
					]
				]
			: []
	);
</script>

{#if hasData}
	<StatNumbers {rows} />
{:else}
	<p class="text-primary-500 text-sm">{m.campaign_tde_key_empty()}</p>
{/if}
