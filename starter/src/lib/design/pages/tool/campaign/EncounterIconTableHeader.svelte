<script lang="ts">
	import type { EncounterSet } from '$lib/core/campaign';
	import { getEncounterSetFlag } from '$lib/utility/encounter-set-flag';
	import type { Campaign } from '@5argon/arkham-kohaku';
	import EncounterSetDisplayWithTooltip from './EncounterSetDisplayWithTooltip.svelte';

	let {
		encounterSet,
		kohakuCampaign
	}: {
		encounterSet: EncounterSet;
		kohakuCampaign: Campaign;
	} = $props();
</script>

<div class="fade">
	{#if encounterSet.kohakuEncounterSet}
		<EncounterSetDisplayWithTooltip
			encounterSet={encounterSet.kohakuEncounterSet}
			flag={getEncounterSetFlag(encounterSet.kohakuEncounterSet, kohakuCampaign)}
		/>
	{/if}
</div>
