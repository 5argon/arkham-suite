<script lang="ts">
	import { ChaosTokenIcon } from '@5argon/arkham-icon';
	import { ChaosToken } from '@5argon/arkham-kohaku';
	import { chaosTokenTrail, fileTitle, optionText, type ChaosTokenEvent, type PlanTrajectory } from '@5argon/arkham-tsk-solver';

	// The ordered list of chaos-bag shifts the plan makes (Trust/Deception acts + chosen-token adds), each
	// with the bag contents it leaves behind. This is the CHAOS BAG only — unrelated to the Foundation
	// Trust / Cell Deception epilogue tallies, which are counted from specific recorded logs instead.
	let { trajectory }: { trajectory: PlanTrajectory } = $props();
	const trail = $derived(chaosTokenTrail(trajectory));
	const actLabel = (e: ChaosTokenEvent) => optionText(e.fileCode, e.decisionId, e.optionId)?.dropdownText ?? e.optionId;
	const tk = 'text-primary-700 dark:text-primary-300';
</script>

{#if trail.length}
	<ol class="flex flex-col gap-1">
		{#each trail as e, i (i)}
			<li class="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-primary-600 dark:text-primary-300">
				<span class="text-primary-400">{i + 1}.</span>
				<span class="font-medium text-primary-700 dark:text-primary-200">{fileTitle(e.fileCode)}</span>
				<span class="text-primary-400">·</span>
				<span>{actLabel(e)}</span>
				{#if e.overflowXp > 0}
					<span class="text-secondary-600 dark:text-secondary-400"
						>bag already full — +{e.overflowXp} XP instead of {e.kind === 'trust' ? 'a Tablet' : 'an Elder Thing'}</span
					>
				{:else}
					<span class="flex items-center gap-1">
						{#if e.tabletDelta}<span class="flex text-sm"><ChaosTokenIcon chaosToken={ChaosToken.TokenTablet} circular fillColor={tk} /></span>{e.tabletDelta > 0 ? '+' : ''}{e.tabletDelta}{/if}
						{#if e.elderThingDelta}<span class="flex text-sm"><ChaosTokenIcon chaosToken={ChaosToken.TokenElderThing} circular fillColor={tk} /></span>{e.elderThingDelta > 0 ? '+' : ''}{e.elderThingDelta}{/if}
					</span>
				{/if}
				<span class="text-primary-400">→</span>
				<span class="flex items-center gap-1 text-primary-700 dark:text-primary-200">
					<span class="flex text-sm"><ChaosTokenIcon chaosToken={ChaosToken.TokenTablet} circular fillColor={tk} /></span>{e.tablet}
					<span class="flex text-sm"><ChaosTokenIcon chaosToken={ChaosToken.TokenElderThing} circular fillColor={tk} /></span>{e.elderThing}
				</span>
			</li>
		{/each}
	</ol>
{:else}
	<p class="text-xs italic text-primary-400">No Trust or Deception acts in this plan yet — the bag stays at its starting 1 Tablet / 1 Elder Thing.</p>
{/if}
