<!-- @component Murder at the Excelsior Hotel's interlude: telling Sergeant Monroe the truth or lying, and whether the police ended up on your side. -->
<script lang="ts">
	import type { StandaloneBlobs } from '$lib/campaign/standalones/registry';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import { StatNumbers } from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';

	type Blob = NonNullable<StandaloneBlobs['side.murder_at_the_excelsior_hotel']>;
	let { blob }: CampaignWidgetProps<Blob> = $props();

	const mo = $derived(blob?.monroe);
</script>

<StatNumbers
	empty={m.standalone_meh_monroe_empty()}
	rows={[
		{
			heading: m.standalone_meh_told_truth(),
			stats: [
				{ tally: mo?.truthBelieved, label: m.standalone_meh_on_your_side() },
				{ tally: mo?.truthDoubted, label: m.standalone_meh_not_believed() }
			]
		},
		{
			heading: m.standalone_meh_lied(),
			stats: [
				{ tally: mo?.lieBelieved, label: m.standalone_meh_on_your_side() },
				{ tally: mo?.lieDoubted, label: m.standalone_meh_not_believed() }
			]
		}
	]}
/>
