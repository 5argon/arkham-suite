<script lang="ts">
	import { EncounterSetIcon } from '@5argon/arkham-icon';
	import { getLocation, type CampaignState, type SimStep } from '@5argon/arkham-tsk-solver';
	import StepState from './StepState.svelte';
	import { scenarioEncounterSet, stepIcon, stepTitle } from './helpers';

	let { step, finalState }: { step: SimStep; finalState: CampaignState } = $props();
	const isScenario = $derived(step.option.kind === 'scenario' || step.option.kind === 'finale');
	const set = $derived(isScenario ? scenarioEncounterSet(getLocation(step.option.node).scenario_id ?? '') : null);
	const bad = $derived(step.problems.length > 0);
</script>

<li class="relative flex gap-3 border-l-2 pl-4 pb-4 {bad ? 'border-survivor-300 dark:border-survivor-800' : 'border-primary-200 dark:border-primary-800'}">
	<span class="absolute -left-3 top-0 flex h-6 w-6 items-center justify-center rounded-full text-[0.7rem] {bad ? 'bg-survivor-200 text-survivor-800 dark:bg-survivor-900 dark:text-survivor-200' : 'bg-primary-200 text-primary-700 dark:bg-primary-800 dark:text-primary-200'}">
		{#if set}<EncounterSetIcon encounterSet={set} />{:else}<i class={stepIcon(step)}></i>{/if}
	</span>
	<div class="flex-1">
		<div class="flex flex-wrap items-baseline justify-between gap-2">
			<span class="text-primary-900 dark:text-primary-100 {step.option.kind === 'finale' ? 'font-bold' : ''}">{stepTitle(step)}</span>
			<span class="shrink-0 text-xs text-primary-400">
				{#if step.usedTicket}🎟 ticket (saves {step.usedTicket.saved}){:else if step.travelCost > 0}+{step.travelCost} travel{/if}
				· t={step.timeAfter}
			</span>
		</div>
		<StepState {step} {finalState} />
	</div>
</li>
