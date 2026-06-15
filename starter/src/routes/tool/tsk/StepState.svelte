<script lang="ts">
	import { ChaosTokenIcon } from '@5argon/arkham-icon';
	import { ChaosToken } from '@5argon/arkham-kohaku';
	import { bearerIsInvestigator, catalog, labelFor, resolveLocalized, type CampaignState, type SimStep } from '@5argon/arkham-tsk-solver';
	import { MARKER_NAME } from './helpers';

	// `step` carries the post-step state; `finalState` is the table state for a finale step's summary.
	let { step, finalState }: { step: SimStep; finalState: CampaignState } = $props();

	const s = $derived(step.stateAfter);
	const heldKeys = $derived([...s.keys.entries()].filter(([, b]) => bearerIsInvestigator(b)).map(([k]) => k));
	const otherKeys = $derived([...s.keys.entries()].filter(([, b]) => !bearerIsInvestigator(b)));
	const finalHeld = $derived([...finalState.keys.entries()].filter(([, b]) => bearerIsInvestigator(b)).map(([k]) => k));
	const trialLabel = (branch: string) => catalog().trials.find((t) => t.id === branch)?.label ?? branch.replace(/_/g, ' ');
	const epilogueLabel = (e: string) =>
		e === 'agreed_to_work_together'
			? 'the Foundation & Red Coterie agreed to work together (joined)'
			: e === 'permanent_position'
				? 'Foundation keeps the cell on (permanent position)'
				: 'the cell is dismantled';
	const tk = 'text-primary-700 dark:text-primary-300';
</script>

{#if step.scenarioLevel}
	<div class="mt-0.5 text-xs font-medium text-primary-500 dark:text-primary-400">{resolveLocalized(step.scenarioLevel, 'en')}</div>
{/if}
{#if step.introChoices.length}
	<div class="mt-0.5 text-xs text-primary-500 dark:text-primary-400">Choice: {step.introChoices.map((c) => c.id.replace(/_/g, ' ')).join(', ')}</div>
{/if}

{#if step.problems.length}
	<ul class="mt-1 flex flex-col gap-0.5">
		{#each step.problems as p (p.kind + JSON.stringify(p.detail.params))}
			<li class="text-xs text-survivor-700 dark:text-survivor-300"><i class="fa-solid fa-ban mr-1"></i>{resolveLocalized(p.detail, 'en')}</li>
		{/each}
	</ul>
{/if}
{#each step.warnings as w, wi (wi)}
	<div class="mt-0.5 text-xs text-secondary-700 dark:text-secondary-300"><i class="fa-solid fa-clock mr-1"></i>{resolveLocalized(w, 'en')}</div>
{/each}

{#if step.finale}
	<div class="mt-1 rounded bg-primary-50 dark:bg-primary-900/40 p-2 text-xs text-primary-700 dark:text-primary-200">
		<div><b>Predicted ending:</b> {trialLabel(step.finale.branch)} (votes {step.finale.yea} yea / {step.finale.nay} nay / {step.finale.silent} silent)</div>
		<div><b>Epilogue:</b> {epilogueLabel(step.finale.epilogue)} — Foundation Trust {finalState.trust} vs Cell Deception {finalState.deception} (the only thing these tallies decide)</div>
		<div>
			<b>At the table:</b>
			{finalHeld.length} Key(s){finalHeld.length ? ` (${finalHeld.map((k) => labelFor(k)).join(', ')})` : ''}{finalState.allies.size ? `, allies ${[...finalState.allies].map((a) => labelFor(a)).join(', ')}` : ''}, {finalState.tablet} Tablet / {finalState.elderThing} Elder Thing.
		</div>
	</div>
{/if}

<!-- state after this step (always shown) -->
<div class="mt-1 flex flex-col gap-0.5 text-xs text-primary-600 dark:text-primary-300">
	<div class="flex flex-wrap items-center gap-x-3 gap-y-1">
		<span class="flex items-center gap-1" title="time spent"><i class="fa-solid fa-clock text-primary-400"></i>{s.timePassed}</span>
		<span class="flex items-center gap-1" title="Foundation Trust (feeds the epilogue)">
			<span class="flex text-sm"><ChaosTokenIcon chaosToken={ChaosToken.TokenTablet} circular={false} fillColor={tk} /></span>{s.trust} trust{#if step.trustDelta > 0}<span class="text-secondary-600 dark:text-secondary-400">&nbsp;+{step.trustDelta}</span>{/if}
		</span>
		<span class="flex items-center gap-1" title="Cell Deception (feeds the epilogue)">
			<span class="flex text-sm"><ChaosTokenIcon chaosToken={ChaosToken.TokenElderThing} circular={false} fillColor={tk} /></span>{s.deception} dec{#if step.deceptionDelta > 0}<span class="text-survivor-600 dark:text-survivor-400">&nbsp;+{step.deceptionDelta}</span>{/if}
		</span>
		<span class="flex items-center gap-1" title="chaos bag">
			bag
			<span class="flex text-sm"><ChaosTokenIcon chaosToken={ChaosToken.TokenTablet} circular fillColor={tk} /></span>{s.tablet}
			<span class="flex text-sm"><ChaosTokenIcon chaosToken={ChaosToken.TokenElderThing} circular fillColor={tk} /></span>{s.elderThing}
		</span>
		{#if s.hasTicket}<span class="flex items-center gap-1 text-secondary-600 dark:text-secondary-400"><i class="fa-solid fa-ticket"></i>ticket</span>{/if}
	</div>
	{#if heldKeys.length}
		<div class="flex items-center gap-1"><i class="fa-solid fa-key text-secondary-500"></i>{heldKeys.map((k) => labelFor(k)).join(', ')}</div>
	{/if}
	{#each otherKeys as [k, b] (k)}
		<div class="flex items-center gap-1 text-primary-400"><i class="fa-solid fa-key"></i>{labelFor(k)} → {b.replace(/_/g, ' ')}</div>
	{/each}
	{#if s.allies.size}
		<div class="flex items-center gap-1"><i class="fa-solid fa-user-group text-primary-400"></i>{[...s.allies].map((a) => labelFor(a)).join(', ')}</div>
	{/if}
	{#each step.fired as f (f)}
		<div class="text-secondary-600 dark:text-secondary-400"><i class="fa-solid fa-flag mr-1"></i>{MARKER_NAME[f] ?? f}</div>
	{/each}
</div>
