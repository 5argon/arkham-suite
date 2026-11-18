<!-- @component The ten most recent unique cards erased from existence (Dancing Mad / On Thin Ice), with the campaign's finish date. -->
<script lang="ts">
	import type { CampaignTsk } from '$lib/campaign/campaigns/tsk/profile';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import { CardLineList, FinishDate, WidgetEmpty } from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';

	let { blob: tsk }: CampaignWidgetProps<CampaignTsk> = $props();

	const erased = $derived(tsk?.erasedFromExistence ?? []);
</script>

{#if erased.length}
	<div class="overflow-x-auto">
		<CardLineList items={erased}>
			{#snippet trailing(it)}<FinishDate ms={it.finishDate} />{/snippet}
		</CardLineList>
	</div>
{:else}
	<WidgetEmpty>{m.campaign_tsk_erased_empty()}</WidgetEmpty>
{/if}
