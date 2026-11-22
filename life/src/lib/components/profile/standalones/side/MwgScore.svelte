<!-- @component The Midwinter Gala's score to beat: the best score and each play's bonus-experience band. -->
<script lang="ts">
	import type { StandaloneBlobs } from '$lib/campaign/standalones/registry';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import {
		ScoreTrack,
		StatNumbers,
		WidgetEmpty,
		WidgetNote
	} from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';

	type Blob = NonNullable<StandaloneBlobs['side.the_midwinter_gala']>;
	let { blob }: CampaignWidgetProps<Blob> = $props();

	const band = (v: number) => (v === 0 ? '<10' : `${v * 10}+`);
</script>

{#if blob?.bestScore != null}
	<div class="space-y-4">
		<StatNumbers rows={[[{ value: blob.bestScore, label: m.standalone_mwg_best_score() }]]} />
		<ScoreTrack max={5} scores={blob.bands} cellLabel={band} />
		<WidgetNote>{m.standalone_mwg_score_note()}</WidgetNote>
	</div>
{:else}
	<WidgetEmpty>{m.standalone_mwg_score_empty()}</WidgetEmpty>
{/if}
