<!-- @component A challenge scenario's own score (Tomes in play, memories, Cultists caught…) as a track lit to the best play. -->
<script lang="ts">
	import type { Challenge } from '$lib/campaign/standalones/side/challenges';
	import type { Tally } from '$lib/campaign/utils/tally';
	import { ScoreTrack, WidgetEmpty, WidgetNote } from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';
	import { standaloneText } from './text';

	let { challenge, scores }: { challenge: Challenge | null; scores: Record<string, Tally> | null } =
		$props();

	const score = $derived(challenge?.score);
	const best = $derived(
		Math.max(
			-1,
			...Object.entries(scores ?? {})
				.filter(([, t]) => t.total > 0)
				.map(([v]) => Number(v))
		)
	);
	const max = $derived(
		!score ? 0 : score.kind === 'options' ? score.options.length - 1 : Math.max(score.max, best)
	);
	const cellLabel = $derived((v: number) =>
		score?.kind === 'options'
			? standaloneText(`standalone_${challenge?.prefix}_score_${score.options[v]}`)
			: String(v)
	);
</script>

{#if score && best >= 0}
	<ScoreTrack {max} scores={scores ?? {}} {cellLabel} />
	<WidgetNote>{standaloneText(`standalone_${challenge?.prefix}_score_note`)}</WidgetNote>
{:else}
	<WidgetEmpty>{m.standalones_challenge_score_empty()}</WidgetEmpty>
{/if}
