<!-- @component The Eternal Slumber: the Strength of the Abyss each play ended with; lower means fewer dreamers trapped. -->
<script lang="ts">
	import type { StandaloneBlobs } from '$lib/campaign/standalones/registry';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import { StatNumbers, WidgetNote } from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';

	type Blob = NonNullable<StandaloneBlobs['side.the_eternal_slumber']>;
	let { blob }: CampaignWidgetProps<Blob> = $props();

	const values = $derived(
		Object.entries(blob?.dreamers ?? {})
			.filter(([, t]) => t.total > 0)
			.map(([v]) => Number(v))
	);
</script>

<StatNumbers
	empty={m.standalone_tes_dreamers_empty()}
	rows={values.length
		? [
				[
					{ value: Math.min(...values), label: m.standalone_tes_dreamers_lowest() },
					{ value: Math.max(...values), label: m.standalone_tes_dreamers_highest() }
				]
			]
		: []}
/>
{#if values.length}<WidgetNote>{m.standalone_tes_dreamers_note()}</WidgetNote>{/if}
