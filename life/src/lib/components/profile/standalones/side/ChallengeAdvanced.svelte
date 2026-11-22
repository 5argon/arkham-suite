<!-- @component A parallel investigator's challenge: how often its signature card and signature weakness were upgraded to their advanced versions, or downgraded back. -->
<script lang="ts">
	import type { Challenge, ChallengeBlob } from '$lib/campaign/standalones/side/challenges';
	import { cardByCode } from '$lib/card-data';
	import { CardThumb, CountWithBreakdown, StatNumbers } from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';

	let { challenge, blob }: { challenge: Challenge | null; blob: ChallengeBlob | null } = $props();

	const s = $derived(blob?.swaps);
	const rows = $derived(
		challenge
			? [
					{
						key: 'signature',
						codes: challenge.signature,
						up: s?.signatureUpgraded,
						down: s?.signatureDowngraded,
						upLabel: m.standalones_challenge_upgraded(),
						downLabel: m.standalones_challenge_downgraded_forced()
					},
					{
						key: 'weakness',
						codes: challenge.weakness,
						up: s?.weaknessUpgraded,
						down: s?.weaknessDowngraded,
						upLabel: m.standalones_challenge_upgraded_forced(),
						downLabel: m.standalones_challenge_downgraded()
					}
				]
			: []
	);
</script>

<div class="space-y-4">
	{#each rows as r (r.key)}
		<div class="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
			<div class="flex items-center gap-2">
				<CardThumb code={r.codes[0]} size="h-12 w-12" />
				<span class="text-primary-400">→</span>
				<CardThumb code={r.codes[1]} size="h-12 w-12" />
			</div>
			<div class="min-w-0">
				<p class="text-sm font-medium text-black dark:text-white">{cardByCode(r.codes[1])?.name}</p>
				<p class="text-primary-500 text-xs">
					{r.upLabel}
					<CountWithBreakdown
						value="×{r.up?.total ?? 0}"
						tally={r.up}
						class="text-secondary-600 dark:text-secondary-400 font-semibold"
					/>
					· {r.downLabel}
					<CountWithBreakdown value="×{r.down?.total ?? 0}" tally={r.down} class="font-semibold" />
				</p>
			</div>
		</div>
	{/each}
	<StatNumbers rows={[[{ tally: s?.unchanged, label: m.standalones_challenge_unchanged() }]]} />
</div>
