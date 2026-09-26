<!-- @component A Thousand Shapes of Horror: whether Randolph survived the descent and the Silver Key was found. -->
<script lang="ts">
	import type { CampaignTdeb } from '$lib/campaign/campaigns/tdeb';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import { CardThumb, StatNumbers } from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';
	import ScenarioInfo from '../ScenarioInfo.svelte';
	import { SILVER_KEY_CODE } from '../tde/tde-cards';

	let { blob: tdeb, ctx }: CampaignWidgetProps<CampaignTdeb> = $props();

	const r = $derived(tdeb?.shared.randolph);
	const keys = $derived(tdeb?.shared.silverKey.obtained ?? 0);
</script>

<ScenarioInfo {ctx}>
	{#snippet stats()}
		<div class="flex items-start justify-center gap-4">
			{#if keys}
				<CardThumb code={SILVER_KEY_CODE} />
			{/if}
			<StatNumbers
				empty={m.campaign_tdeb_shapes_empty()}
				rows={[
					{
						heading: m.campaign_tdeb_shapes_descent_heading(),
						stats: [
							{ value: r?.survivedDescent, label: m.campaign_tdeb_shapes_survived() },
							{ value: r?.diedDescent, label: m.campaign_tdeb_shapes_died() }
						]
					},
					{
						heading: m.campaign_tdeb_shapes_key_heading(),
						stats: [{ value: keys, label: m.campaign_tdeb_shapes_key() }]
					}
				]}
			/>
		</div>
	{/snippet}
</ScenarioInfo>
