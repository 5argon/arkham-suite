<!-- @component Fortune and Folly's heist: completed tasks per play against the 5 that bring Isamara Ordoñez and the 6 that earn the Deck of Possibilities. -->
<script lang="ts">
	import {
		FOF_DECK_OF_POSSIBILITIES_CODE,
		FOF_DECK_TASKS,
		FOF_ISAMARA_CODE,
		FOF_ISAMARA_TASKS
	} from '$lib/campaign/standalones/side/fortune-and-folly';
	import type { StandaloneBlobs } from '$lib/campaign/standalones/registry';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import {
		ScoreTrack,
		StatNumbers,
		WidgetEmpty,
		WidgetNote
	} from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';

	type Blob = NonNullable<StandaloneBlobs['side.fortune_and_folly_part_1']>;
	let { blob }: CampaignWidgetProps<Blob> = $props();

	const values = $derived(
		Object.entries(blob?.tasks ?? {})
			.filter(([, t]) => t.total > 0)
			.map(([v]) => Number(v))
	);
	const best = $derived(values.length ? Math.max(...values) : null);
</script>

{#if best != null && blob}
	<div class="space-y-4">
		<StatNumbers
			rows={[
				[
					{ value: best, label: m.standalone_fof_best_tasks() },
					{ tally: blob.skippedStakeout, label: m.standalone_fof_skipped() }
				]
			]}
		/>
		<ScoreTrack
			max={Math.max(8, best)}
			scores={blob.tasks}
			marks={[
				{ at: FOF_ISAMARA_TASKS, label: m.standalone_fof_isamara_mark(), code: FOF_ISAMARA_CODE },
				{
					at: FOF_DECK_TASKS,
					label: m.standalone_fof_deck_mark(),
					code: FOF_DECK_OF_POSSIBILITIES_CODE
				}
			]}
		/>
		<WidgetNote>{m.standalone_fof_heist_note()}</WidgetNote>
	</div>
{:else}
	<WidgetEmpty>{m.standalone_fof_heist_empty()}</WidgetEmpty>
{/if}
