<!--
@component
TSK bespoke widget — Foundation Trust & Cell Deception (the EPILOGUE TALLY). At the finale each
recorded entry on the Foundation Trust list, and each on the Cell Deception list, adds 1 to that
side; the two totals steer the epilogue. This is a SEPARATE axis from the chaos-bag Tablet/Elder
Thing acts (see TskTokenBalance) — e.g. aiding the Claret Knight is a chaos-bag Trust act but a Cell
Deception tally entry. Lists every entry (exhaustive, from tsk-solver's epilogueTally) and how many
of the player's plays recorded it. Fully inferred from the campaign log.
-->
<script lang="ts">
	import {
		TSK_FOUNDATION_TRUST,
		TSK_CELL_DECEPTION,
		tskTallyLabel,
		type CampaignTsk
	} from '$lib/campaign/tsk-profile';
	import StatNumbers, { type Stat } from '$lib/components/profile/_primitives/StatNumbers.svelte';
	import * as m from '$lib/paraglide/messages.js';

	let { tsk }: { tsk: CampaignTsk | null } = $props();

	const highest = $derived<Stat[]>([
		...(tsk?.foundationTrustMax != null
			? [{ value: tsk.foundationTrustMax, label: m.campaign_tsk_ft_highest() }]
			: []),
		...(tsk?.cellDeceptionMax != null
			? [{ value: tsk.cellDeceptionMax, label: m.campaign_tsk_cd_highest() }]
			: [])
	]);
	// High-score: the biggest lead each side took in a single run. A lead only counts when it's strictly
	// positive; if a side never came out ahead, show a long dash rather than a 0 / negative.
	const margins = $derived<Stat[]>([
		...(tsk?.maxTrustMargin != null
			? [{ value: tsk.maxTrustMargin > 0 ? tsk.maxTrustMargin : null, label: m.campaign_tsk_trust_margin() }]
			: []),
		...(tsk?.maxDeceptionMargin != null
			? [{ value: tsk.maxDeceptionMargin > 0 ? tsk.maxDeceptionMargin : null, label: m.campaign_tsk_deception_margin() }]
			: [])
	]);
	// The direct epilogue consequence of the balance: Trust ≥ Deception → a permanent position, else dismantled.
	const permanent = $derived(tsk?.logCounts['cell_was_given_a_permanent_position'] ?? 0);
	const dismantled = $derived(tsk?.logCounts['cell_was_dismantled'] ?? 0);
	const outcomes = $derived<Stat[]>([
		{ value: permanent, label: m.campaign_tsk_outcome_permanent() },
		{ value: dismantled, label: m.campaign_tsk_outcome_dismantled() }
	]);

	const trustRows = $derived(
		TSK_FOUNDATION_TRUST.map((e) => ({
			id: e.id,
			label: tskTallyLabel(e),
			count: tsk?.foundationTrustTally[e.id] ?? 0
		}))
	);
	const deceptionRows = $derived(
		TSK_CELL_DECEPTION.map((e) => ({
			id: e.id,
			label: tskTallyLabel(e),
			count: tsk?.cellDeceptionTally[e.id] ?? 0
		}))
	);
	const anyData = $derived(
		!!tsk &&
			(trustRows.some((r) => r.count > 0) ||
				deceptionRows.some((r) => r.count > 0) ||
				tsk.foundationTrustMax != null ||
				tsk.cellDeceptionMax != null ||
				permanent > 0 ||
				dismantled > 0)
	);
</script>

{#if tsk && anyData}
	<div class="flex flex-col gap-3">
		<!-- High-scores (recorded counters + biggest lead each way) + the direct epilogue consequence. -->
		<StatNumbers rows={[[...highest, ...margins], outcomes]} />

		<!-- Per-entry breakdown: every tally entry, with how many plays recorded it. -->
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
			<div>
				<p class="text-primary-700 dark:text-primary-300 mb-1 text-xs font-semibold">
					{m.campaign_tsk_ft_heading()}
				</p>
				<ul class="space-y-0.5 text-xs">
					{#each trustRows as r (r.id)}
						<li
							class="flex justify-between gap-2 {r.count > 0
								? 'text-black dark:text-white'
								: 'text-primary-400'}"
						>
							<span class="truncate">{r.label}</span>
							<span class="shrink-0 tabular-nums">{r.count > 0 ? `×${r.count}` : '—'}</span>
						</li>
					{/each}
				</ul>
			</div>
			<div>
				<p class="text-primary-700 dark:text-primary-300 mb-1 text-xs font-semibold">{m.campaign_tsk_cd_heading()}</p>
				<ul class="space-y-0.5 text-xs">
					{#each deceptionRows as r (r.id)}
						<li
							class="flex justify-between gap-2 {r.count > 0
								? 'text-black dark:text-white'
								: 'text-primary-400'}"
						>
							<span class="truncate">{r.label}</span>
							<span class="shrink-0 tabular-nums">{r.count > 0 ? `×${r.count}` : '—'}</span>
						</li>
					{/each}
				</ul>
			</div>
		</div>
	</div>
{:else}
	<p class="text-primary-500 text-sm">{m.campaign_tsk_ftcd_empty()}</p>
{/if}
