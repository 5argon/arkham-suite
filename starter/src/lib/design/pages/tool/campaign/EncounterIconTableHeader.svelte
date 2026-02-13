<script lang="ts">
	import type { EncounterSet } from '$lib/core/campaign';
	import { getEncounterSetFlag } from '$lib/utility/encounter-set-flag';
	import type { Campaign } from '@5argon/arkham-kohaku';
	import { EncounterSetDisplay } from '@5argon/arkham-life-ui';

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
		<EncounterSetDisplay
			encounterSet={encounterSet.kohakuEncounterSet}
			flag={getEncounterSetFlag(encounterSet.kohakuEncounterSet, kohakuCampaign)}
		/>
	{/if}
</div>
