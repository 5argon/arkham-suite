<script lang="ts">
	import { ChaosTokenIcon } from '@5argon/arkham-icon';
	import { ChaosToken } from '@5argon/arkham-kohaku';
	import { bearerIsInvestigator, catalog, type PlanTrajectory } from '@5argon/arkham-tsk-solver';
	import ScenarioIcons from './ScenarioIcons.svelte';
	import { scenarioIconItems } from './helpers';

	let { trajectory }: { trajectory: PlanTrajectory } = $props();
	const fs = $derived(trajectory.finalState);
	const finale = $derived(trajectory.finale);
	const keyCount = $derived([...fs.keys.entries()].filter(([, b]) => bearerIsInvestigator(b)).length);
	const judgmentLabel = $derived(catalog().judgments.find((j) => j.id === finale.judgment)?.label ?? finale.judgment);
	const epilogueLabel = $derived(catalog().epilogues.find((e) => e.id === finale.epilogue)?.label ?? finale.epilogue);
	const tk = 'text-primary-700 dark:text-primary-200';
</script>

<div class="flex flex-col gap-3 rounded-lg border border-primary-200 dark:border-primary-800 p-4">
	<div class="flex flex-wrap items-center justify-between gap-3">
		<div class="font-heading text-xl text-primary-900 dark:text-primary-100">
			{trajectory.scenarioCount} scenario{trajectory.scenarioCount === 1 ? '' : 's'} · {fs.timePassed} time
		</div>
		{#if trajectory.steps.length}<ScenarioIcons items={scenarioIconItems(trajectory.steps)} size="1.6rem" />{/if}
	</div>

	<div class="flex flex-wrap gap-2 text-sm text-primary-800 dark:text-primary-200">
		<span class="flex items-center gap-1.5 rounded border border-primary-100 dark:border-primary-800 px-2.5 py-1" title="time spent">
			<i class="fa-solid fa-clock text-primary-400"></i>{fs.timePassed}
		</span>
		<span class="flex items-center gap-1.5 rounded border border-primary-100 dark:border-primary-800 px-2.5 py-1" title="Keys held">
			<i class="fa-solid fa-key text-secondary-500"></i>{keyCount}
		</span>
		<span class="flex items-center gap-1.5 rounded border border-primary-100 dark:border-primary-800 px-2.5 py-1" title="minimum guaranteed XP">
			<i class="fa-solid fa-star text-secondary-500"></i>{fs.xpBonus} min XP
		</span>
		<span class="flex items-center gap-1.5 rounded border border-primary-100 dark:border-primary-800 px-2.5 py-1" title="Foundation Trust (feeds the epilogue)">
			<span class="flex text-base"><ChaosTokenIcon chaosToken={ChaosToken.TokenTablet} circular={false} fillColor={tk} /></span>{finale.trust} trust
		</span>
		<span class="flex items-center gap-1.5 rounded border border-primary-100 dark:border-primary-800 px-2.5 py-1" title="Cell Deception (feeds the epilogue)">
			<span class="flex text-base"><ChaosTokenIcon chaosToken={ChaosToken.TokenElderThing} circular={false} fillColor={tk} /></span>{finale.deception} dec
		</span>
		<span class="flex items-center gap-1.5 rounded border border-primary-100 dark:border-primary-800 px-2.5 py-1" title="predicted Coterie judgment">
			<i class="fa-solid fa-gavel text-primary-400"></i>{judgmentLabel}
		</span>
		<span class="flex items-center gap-1.5 rounded border border-primary-100 dark:border-primary-800 px-2.5 py-1" title="predicted epilogue">
			<i class="fa-solid fa-flag-checkered text-primary-400"></i>{epilogueLabel}
		</span>
		<span class="flex items-center gap-1.5 rounded border border-primary-100 dark:border-primary-800 px-2.5 py-1" title="chaos bag">
			bag
			<span class="flex text-base"><ChaosTokenIcon chaosToken={ChaosToken.TokenTablet} circular fillColor={tk} /></span>{fs.tablet}
			<span class="flex text-base"><ChaosTokenIcon chaosToken={ChaosToken.TokenElderThing} circular fillColor={tk} /></span>{fs.elderThing}
		</span>
	</div>

	{#if trajectory.keyTheftRisk}
		<div class="flex items-start gap-2 rounded bg-survivor-50 dark:bg-survivor-950/30 p-2 text-xs text-survivor-700 dark:text-survivor-300">
			<i class="fa-solid fa-triangle-exclamation mt-0.5"></i>
			<span>This plan crosses the Zeta (ζ) time box still holding a Key — one held Key will be randomly stolen.
				{#if trajectory.keyRecoveryAvailable}<b>You play a Ruses &amp; Reclamation search afterwards, so it may be recovered.</b>{:else}It is <b>not</b> recovered (no take-back after the crossing).{/if}</span>
		</div>
	{/if}
</div>
