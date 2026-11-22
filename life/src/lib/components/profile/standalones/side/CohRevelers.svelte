<!-- @component Carnevale of Horrors: how many Innocent Revelers each play brought to safety, and how often they were sacrificed. -->
<script lang="ts">
	import type { StandaloneBlobs } from '$lib/campaign/standalones/registry';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import { StatNumbers } from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';

	type Blob = NonNullable<StandaloneBlobs['side.carnevale_of_horrors']>;
	let { blob }: CampaignWidgetProps<Blob> = $props();

	const r = $derived(blob?.revelers);
</script>

<StatNumbers
	empty={m.standalone_coh_revelers_empty()}
	rows={[
		{
			heading: m.standalone_coh_revelers_saved_heading(),
			stats: [
				{ tally: r?.three, label: m.standalone_coh_revelers_three() },
				{ tally: r?.oneOrTwo, label: m.standalone_coh_revelers_one_or_two() }
			]
		},
		{
			heading: m.standalone_coh_revelers_none_heading(),
			stats: [
				{ tally: r?.noneLost, label: m.standalone_coh_revelers_none_lost() },
				{ tally: r?.sacrificed, label: m.standalone_coh_revelers_sacrificed() }
			]
		}
	]}
/>
