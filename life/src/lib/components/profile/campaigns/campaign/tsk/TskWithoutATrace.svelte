<!--
@component
TSK — Without a Trace. The shared scenario passport, with bespoke content folded in beside
Succeed/Failed:
  • Outcome notes — the cell knowing the Coterie's true nature, Aliki on your side / not seen again,
    and the cell being hollowed. `cell_was_hollowed` is recorded at BOTH finales, so all four are
    scoped to the Without a Trace finale (no Congress vote-outcome) in the precompute.
  • Path to Without a Trace — the secret-scenario quest that unlocks it (take Aliki's whistle → go
    off-mission at Dead and Gone → enter the Bermuda Triangle), plus the setbacks that foreclose it
    (Quinn vanished too late, refused the whistle). Fully log-derived.
Each number hovers to its per-difficulty breakdown. See the widget's ⓘ doc.
-->
<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import TskScenarioInfo from '$lib/components/profile/campaigns/campaign/tsk/TskScenarioInfo.svelte';
	import StatNumbers, { type Stat } from '$lib/components/profile/_primitives/StatNumbers.svelte';
	import type { TskScenarioWidgetProps } from '$lib/components/profile/campaigns/campaign/tsk/tsk-scenario';

	let props: TskScenarioWidgetProps = $props();

	const wt = $derived(props.tsk?.withoutATrace ?? null);
	// Each number carries its per-difficulty `byTier`, so StatNumbers shows the difficulty breakdown
	// on hover (the shared "see this number by difficulty" feature).
	const statRow = $derived<Stat[]>(
		wt
			? [
					{ value: wt.knowsTrueNature.total, label: m.campaign_tsk_wat_knows(), byTier: wt.knowsTrueNature.byTier },
					{ value: wt.alikiOnYourSide.total, label: m.campaign_tsk_wat_aliki(), byTier: wt.alikiOnYourSide.byTier },
					{ value: wt.notSeenAliki.total, label: m.campaign_tsk_wat_not_seen(), byTier: wt.notSeenAliki.byTier },
					{ value: wt.cellHollowed.total, label: m.campaign_tsk_wat_hollowed(), byTier: wt.cellHollowed.byTier }
				]
			: []
	);
	// Always show once there's TSK data — seeing these numbers (even at 0) nudges the player to explore.
	const hasData = $derived(!!wt);

	// The secret-scenario quest funnel (Dead and Gone → here). Progress beats + setbacks; the true
	// nature payoff is already in the outcome row above, so it's not repeated here.
	const dag = $derived(props.tsk?.deadAndGone ?? null);
	const pathRows = $derived.by((): Stat[][] => {
		if (!dag) return [];
		const progress: Stat[] = [
			{ value: dag.whistle, label: m.campaign_tsk_dag_whistle() },
			{ value: dag.offMission, label: m.campaign_tsk_dag_offmission() },
			{ value: dag.enteredWaT.total, label: m.campaign_tsk_dag_entered(), byTier: dag.enteredWaT.byTier }
		];
		const out: Stat[][] = [progress];
		if (dag.quinnVanished > 0 || dag.refusedWhistle > 0)
			out.push([
				{ value: dag.quinnVanished, label: m.campaign_tsk_dag_quinn_vanished() },
				{ value: dag.refusedWhistle, label: m.campaign_tsk_dag_refused() }
			]);
		return out;
	});
	const anyPath = $derived(
		!!dag && dag.whistle + dag.offMission + dag.enteredWaT.total + dag.quinnVanished + dag.refusedWhistle > 0
	);
</script>

<TskScenarioInfo scenarioId="without_a_trace" {...props}>
	{#snippet extraStats()}
		<!-- Without a Trace outcome notes, grouped with the passport's Succeed/Failed numbers. -->
		{#if hasData}
			<StatNumbers rows={[statRow]} />
		{/if}
		<!-- The secret-scenario quest that unlocks & enters Without a Trace (Dead and Gone). -->
		{#if anyPath}
			<div class="mt-3 flex flex-col gap-2">
				<p class="text-primary-500 text-xs font-medium">{m.campaign_tsk_dag_heading()}</p>
				<StatNumbers rows={pathRows} />
			</div>
		{/if}
	{/snippet}
</TskScenarioInfo>
