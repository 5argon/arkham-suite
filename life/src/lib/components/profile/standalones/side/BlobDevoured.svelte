<!-- @component The Blob as a side story: how many campaigns it ended by devouring the universe, and which. -->
<script lang="ts">
	import { getCampaignLog } from '@5argon/arkham-campaign-data';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import { StatNumbers, WidgetEmpty } from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';

	let { ctx }: CampaignWidgetProps<unknown> = $props();

	const inside = $derived((ctx.standalone?.history ?? []).filter((h) => h.hostFamily));
	const ended = $derived(inside.filter((h) => h.verdict === 'lost'));
	const names = $derived([
		...new Set(ended.map((h) => getCampaignLog(h.hostFamily ?? '')?.db.name ?? h.hostFamily ?? ''))
	]);
</script>

{#if inside.length}
	<StatNumbers
		rows={[
			[
				{ value: inside.length, label: m.standalone_blob_inside() },
				{ value: ended.length, label: m.standalone_blob_devoured_campaigns() }
			]
		]}
	/>
	{#if names.length}
		<p class="text-primary-500 mt-2 text-center text-xs">{names.join(' · ')}</p>
	{/if}
{:else}
	<WidgetEmpty>{m.standalone_blob_inside_empty()}</WidgetEmpty>
{/if}
