<script lang="ts">
	import { ChaosTokenIcon } from '@5argon/arkham-icon';
	import { ChaosToken } from '@5argon/arkham-kohaku';
	import {
		bearerIsInvestigator,
		catalog,
		characterName,
		computeDeception,
		computeTrust,
		keyName,
		markerLabel,
		optionText,
		resolveLocalized,
		type CampaignState,
		type FinalePrediction,
		type SimStep,
	} from '@5argon/arkham-tsk-solver';

	// `step` carries the post-step state; `finalState` is the table state for a finale step's summary.
	// `showChoices` lists the player's picks (used in the read-only view; the editor shows them as dropdowns).
	let { step, finalState, showChoices = false }: { step: SimStep; finalState: CampaignState; showChoices?: boolean } = $props();

	const s = $derived(step.stateAfter);
	const trust = $derived(computeTrust(s.recorded));
	const deception = $derived(computeDeception(s.recorded));
	const heldKeys = $derived([...s.keys.entries()].filter(([, b]) => bearerIsInvestigator(b)).map(([k]) => k));
	const otherKeys = $derived([...s.keys.entries()].filter(([, b]) => !bearerIsInvestigator(b)));
	const finalHeld = $derived([...finalState.keys.entries()].filter(([, b]) => bearerIsInvestigator(b)).map(([k]) => k));

	// Auto-resolved branches (the game decided these): time tier, scenario version, conditional outcome.
	const autoBranches = $derived(step.chosen.filter((c) => !c.selectable && (c.decisionType === 'time_scaling' || c.decisionType === 'scenario_version' || c.decisionType === 'conditional_outcome')));
	const picks = $derived(step.chosen.filter((c) => c.selectable));
	const text = (fileCode: string, decisionId: string, optionId: string) => optionText(fileCode, decisionId, optionId)?.dropdownText ?? optionId;

	const judgmentLabel = (f: FinalePrediction) => catalog().judgments.find((j) => j.id === f.judgment)?.label ?? f.judgment;
	const epilogueLabel = (f: FinalePrediction) => catalog().epilogues.find((e) => e.id === f.epilogue)?.label ?? f.epilogue;
	const tk = 'text-primary-700 dark:text-primary-300';

	const SYMBOL_TO_ID: Record<string, string> = { 'α': 'alpha', 'β': 'beta', 'γ': 'gamma', 'δ': 'delta', 'ε': 'epsilon', 'ζ': 'zeta', 'Θ': 'theta', 'ψ': 'psi', 'ω': 'omega' };
	const markerId = (symbol: string): string => SYMBOL_TO_ID[symbol] ?? symbol;
</script>

{#each autoBranches as c (c.decisionId)}
	<div class="mt-0.5 text-xs font-medium text-primary-500 dark:text-primary-400">{text(step.fileCode, c.decisionId, c.option.id)}</div>
{/each}
{#if showChoices && picks.length}
	<div class="mt-0.5 text-xs text-primary-500 dark:text-primary-400">{picks.map((c) => text(step.fileCode, c.decisionId, c.option.id)).join(' · ')}</div>
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
		<div><b>Predicted judgment:</b> {judgmentLabel(step.finale)} (votes {step.finale.yea} yea / {step.finale.nay} nay / {step.finale.silent} silent)</div>
		<div><b>Epilogue:</b> {epilogueLabel(step.finale)} — Foundation Trust {step.finale.trust} vs Cell Deception {step.finale.deception}</div>
		<div>
			<b>At the table:</b>
			{finalHeld.length} Key(s){finalHeld.length ? ` (${finalHeld.map((k) => keyName(k)).join(', ')})` : ''}, {finalState.tablet} Tablet / {finalState.elderThing} Elder Thing{finalState.cultist ? ` / ${finalState.cultist} Cultist` : ''}.
		</div>
	</div>
{/if}

<!-- state after this step (always shown) -->
<div class="mt-1 flex flex-col gap-0.5 text-xs text-primary-600 dark:text-primary-300">
	<div class="flex flex-wrap items-center gap-x-3 gap-y-1">
		<span class="flex items-center gap-1" title="time spent"><i class="fa-solid fa-clock text-primary-400"></i>{s.timePassed}</span>
		<span class="flex items-center gap-1" title="Foundation Trust (feeds the epilogue)">
			<span class="flex text-sm"><ChaosTokenIcon chaosToken={ChaosToken.TokenTablet} circular={false} fillColor={tk} /></span>{trust} trust{#if step.trustDelta > 0}<span class="text-secondary-600 dark:text-secondary-400">&nbsp;+{step.trustDelta}</span>{/if}
		</span>
		<span class="flex items-center gap-1" title="Cell Deception (feeds the epilogue)">
			<span class="flex text-sm"><ChaosTokenIcon chaosToken={ChaosToken.TokenElderThing} circular={false} fillColor={tk} /></span>{deception} dec{#if step.deceptionDelta > 0}<span class="text-survivor-600 dark:text-survivor-400">&nbsp;+{step.deceptionDelta}</span>{/if}
		</span>
		<span class="flex items-center gap-1" title="chaos bag">
			bag
			<span class="flex text-sm"><ChaosTokenIcon chaosToken={ChaosToken.TokenTablet} circular fillColor={tk} /></span>{s.tablet}
			<span class="flex text-sm"><ChaosTokenIcon chaosToken={ChaosToken.TokenElderThing} circular fillColor={tk} /></span>{s.elderThing}
		</span>
		{#if s.hasTicket}<span class="flex items-center gap-1 text-secondary-600 dark:text-secondary-400"><i class="fa-solid fa-ticket"></i>ticket</span>{/if}
	</div>
	{#if heldKeys.length}
		<div class="flex items-center gap-1"><i class="fa-solid fa-key text-secondary-500"></i>{heldKeys.map((k) => keyName(k)).join(', ')}</div>
	{/if}
	{#each otherKeys as [k, b] (k)}
		<div class="flex items-center gap-1 text-primary-400"><i class="fa-solid fa-key"></i>{keyName(k)} → {characterName(b)}</div>
	{/each}
	{#if s.assets.size}
		<div class="flex items-center gap-1"><i class="fa-solid fa-user-group text-primary-400"></i>{[...s.assets].join(', ')}</div>
	{/if}
	{#each step.firedReports as f (f)}
		<div class="text-secondary-600 dark:text-secondary-400"><i class="fa-solid fa-flag mr-1"></i>{f} — {markerLabel(markerId(f))}</div>
	{/each}
</div>
