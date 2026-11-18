<!-- @component Hemlock House: Little Sylvie, and whose side was taken in The Argument. -->
<script lang="ts">
	import type { CampaignFhv } from '$lib/campaign/campaigns/fhv';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import { StatNumbers } from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';
	import FhvOutcomeScenario from './FhvOutcomeScenario.svelte';
	import { fhvOptionLabel } from './fhv-labels';

	let { blob: fhv, ctx }: CampaignWidgetProps<CampaignFhv> = $props();

	const stats = $derived(
		(['william', 'judith', 'neither'] as const).map((side) => ({
			tally: fhv?.argument[side],
			label: fhvOptionLabel('hemlock_house.the_argument', side)
		}))
	);
	const argued = $derived(!ctx.logOnly && stats.some((s) => s.tally?.total));
</script>

<FhvOutcomeScenario blob={fhv} {ctx} hasMore={argued}>
	<StatNumbers
		logOnly={ctx.logOnly}
		rows={[{ heading: m.campaign_fhv_house_argument_heading(), nonLog: true, stats }]}
	/>
</FhvOutcomeScenario>
