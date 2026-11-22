<!-- @component A scenario's endings, one line each: its face, its card when it has one, its name, the resolution it is and how many plays reached it. Unreached endings are dimmed. -->
<script lang="ts" module>
	import type { EndingKind } from '$lib/campaign/outcomes/clear-status';
	import type { Tally } from '$lib/campaign/utils/tally';

	export interface Ending {
		kind: EndingKind;
		label: string;
		resolution: string;
		tally: Tally;
		/** Card art beside the name. */
		code?: string;
	}
</script>

<script lang="ts">
	import {
		CardThumb,
		CountWithBreakdown,
		OutcomeFace,
		SectionLabel
	} from '$lib/components/profile/_primitives';
	import ResolutionChips from './ResolutionChips.svelte';

	let { endings, heading }: { endings: Ending[]; heading?: string } = $props();
</script>

<div>
	{#if heading}<SectionLabel variant="heading" align="center">{heading}</SectionLabel>{/if}
	<div class="@container">
		<div class="mx-auto grid max-w-2xl grid-cols-1 gap-x-6 gap-y-2 @2xl:grid-cols-2">
			{#each endings as e (e.label)}
				<div class="flex items-center gap-2 {e.tally.total > 0 ? '' : 'opacity-45'}">
					<OutcomeFace kind={e.kind} label={e.label} reached={e.tally.total > 0} />
					{#if e.code}<CardThumb code={e.code} size="h-8 w-8" objectTop />{/if}
					<span class="min-w-0 flex-1 truncate text-sm text-black dark:text-white">{e.label}</span>
					<ResolutionChips
						ids={[e.resolution]}
						visited={new Set(e.tally.total > 0 ? [e.resolution] : [])}
						tallies={{ [e.resolution]: e.tally }}
					/>
					<CountWithBreakdown
						value="×{e.tally.total}"
						tally={e.tally}
						class="text-secondary-600 dark:text-secondary-400 shrink-0 font-semibold tabular-nums"
					/>
				</div>
			{/each}
		</div>
	</div>
</div>
