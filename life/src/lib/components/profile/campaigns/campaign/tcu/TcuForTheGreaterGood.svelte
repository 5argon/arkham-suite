<!-- @component For the Greater Good: the puzzle box, then the Inner Circle interlude. -->
<script lang="ts">
	import type { CampaignTcu } from '$lib/campaign/campaigns/tcu';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import { StatNumbers } from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';
	import ScenarioInfo from '../ScenarioInfo.svelte';

	let { blob: tcu, ctx }: CampaignWidgetProps<CampaignTcu> = $props();
	const g = $derived(tcu?.forTheGreaterGood);
	const ic = $derived(tcu?.innerCircle);
</script>

<ScenarioInfo {ctx}>
	{#snippet stats()}
		<StatNumbers
			empty={m.campaign_tcu_greater_empty()}
			rows={[
				{
					heading: m.campaign_tcu_greater_heading(),
					stats: [
						{ value: g?.openedPuzzleBox, label: m.campaign_tcu_greater_box() },
						{ value: g?.guardianEmerged, label: m.campaign_tcu_greater_emerged() },
						{ value: g?.guardianDefeated, label: m.campaign_tcu_greater_defeated() }
					]
				},
				{
					heading: m.campaign_tcu_inner_heading(),
					stats: [
						{ value: ic?.inducted, label: m.campaign_tcu_inner_inducted() },
						{ value: ic?.keptHidden, label: m.campaign_tcu_inner_hidden() }
					]
				}
			]}
		/>
	{/snippet}
</ScenarioInfo>
