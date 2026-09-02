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
		logText,
		markerLabel,
		optionText,
		resolveLocalized,
		type CampaignState,
		type Condition,
		type FinalePrediction,
		type NumBound,
		type SimStep,
	} from '@5argon/arkham-tsk-solver';
	import { epilogueLabel, judgmentLabel } from './helpers';

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
	// Prose for an option's firing condition (e.g. "Fewer than 20 time AND the cell told the truth to Taylor").
	const cond = (fileCode: string, decisionId: string, optionId: string) => optionText(fileCode, decisionId, optionId)?.condition ?? null;


	const SYMBOL_TO_ID: Record<string, string> = { 'α': 'alpha', 'β': 'beta', 'γ': 'gamma', 'δ': 'delta', 'ε': 'epsilon', 'ζ': 'zeta', 'Θ': 'theta', 'ψ': 'psi', 'ω': 'omega' };
	const markerId = (symbol: string): string => SYMBOL_TO_ID[symbol] ?? symbol;

	// A "count N of these logs" outcome (e.g. Tuwile allies at Nairobi if 3+ Coterie standings are recorded;
	// turns hostile at Bermuda if 2+ distrust notes are). Pull the shared `anyOf` list + threshold from a
	// branch's condition so we can itemize which entries are recorded — straight from the simulator's data,
	// so the checklist can never drift from the rule. Works for any such conditional_outcome, not just Tuwile.
	type CountList = NumBound & { anyOf: string[] };
	const countList = (c: Condition | null | undefined): CountList | null => {
		if (!c) return null;
		if (c.countRecorded) return c.countRecorded;
		for (const k of [...(c.all ?? []), ...(c.any ?? []), ...(c.not ? [c.not] : [])]) {
			const f = countList(k);
			if (f) return f;
		}
		return null;
	};
	// Human label for the threshold a count must clear (e.g. `gte:3` => "3+", `lt:2` => "fewer than 2").
	const boundLabel = (b: NumBound): string => {
		if (b.gte !== undefined) return `${b.gte}+`;
		if (b.min !== undefined) return `${b.min}+`;
		if (b.gt !== undefined) return `more than ${b.gt}`;
		if (b.lt !== undefined) return `fewer than ${b.lt}`;
		if (b.lte !== undefined) return `${b.lte} or fewer`;
		if (b.max !== undefined) return `${b.max} or fewer`;
		if (b.eq !== undefined) return `exactly ${b.eq}`;
		return '';
	};
</script>

{#each autoBranches as c (c.decisionId)}
	{@const list = countList(c.option.conditionLogic)}
	<div class="mt-0.5 text-xs font-medium text-primary-500 dark:text-primary-400">{text(step.fileCode, c.decisionId, c.option.id)}</div>

	<!-- For a count-of-logs outcome, itemize which entries are recorded so the player sees why this branch fired. -->
	{#if list}
		{@const recorded = list.anyOf.filter((id) => s.recorded.has(id))}
		<div class="mt-1 rounded bg-primary-50 dark:bg-primary-900/40 p-2 text-xs">
			<div class="font-medium text-primary-700 dark:text-primary-200">{recorded.length} of {list.anyOf.length} recorded ({boundLabel(list)} → {text(step.fileCode, c.decisionId, c.option.id)}):</div>
			<ul class="mt-0.5 flex flex-col gap-0.5">
				{#each list.anyOf as id (id)}
					<li class={s.recorded.has(id) ? 'text-survivor-700 dark:text-survivor-300' : 'text-primary-400'}>
						<i class="fa-solid {s.recorded.has(id) ? 'fa-square-check' : 'fa-square'} mr-1"></i>{logText(id)}
					</li>
				{/each}
			</ul>
		</div>
	{/if}

	<!-- The branches that did NOT fire — what else could have happened here, and under what condition. -->
	{#if c.alternatives?.length}
		<div class="mt-1 rounded bg-primary-50 dark:bg-primary-900/40 p-2 text-xs">
			<div class="font-medium text-primary-700 dark:text-primary-200">Otherwise possible here:</div>
			<ul class="mt-0.5 flex flex-col gap-0.5">
				{#each c.alternatives as a (a.option.id)}
					{@const why = cond(step.fileCode, c.decisionId, a.option.id)}
					<li class={a.conditionHolds ? 'text-survivor-700 dark:text-survivor-300' : 'text-primary-400'}>
						<i class="fa-solid {a.conditionHolds ? 'fa-square-check' : 'fa-arrow-right'} mr-1"></i>{text(step.fileCode, c.decisionId, a.option.id)}{#if why}<span class="text-primary-400"> — if {why}</span>{/if}
					</li>
				{/each}
			</ul>
		</div>
	{/if}
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
		<div><b>Predicted judgment:</b> {judgmentLabel(step.finale.judgment)} (votes {step.finale.yea} yea / {step.finale.nay} nay / {step.finale.silent} silent)</div>
		<div><b>Epilogue:</b> {epilogueLabel(step.finale.epilogue)} — Foundation Trust {step.finale.trust} vs Cell Deception {step.finale.deception}</div>
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
			<span class="flex text-sm"><ChaosTokenIcon chaosToken={ChaosToken.TokenTablet} noColor /></span>{trust} trust{#if step.trustDelta > 0}<span class="text-secondary-600 dark:text-secondary-400">&nbsp;+{step.trustDelta}</span>{/if}
		</span>
		<span class="flex items-center gap-1" title="Cell Deception (feeds the epilogue)">
			<span class="flex text-sm"><ChaosTokenIcon chaosToken={ChaosToken.TokenElderThing} noColor /></span>{deception} dec{#if step.deceptionDelta > 0}<span class="text-survivor-600 dark:text-survivor-400">&nbsp;+{step.deceptionDelta}</span>{/if}
		</span>
		<span class="flex items-center gap-1" title="chaos bag">
			bag
			<span class="flex text-sm"><ChaosTokenIcon chaosToken={ChaosToken.TokenTablet} sealed noColor /></span>{s.tablet}
			<span class="flex text-sm"><ChaosTokenIcon chaosToken={ChaosToken.TokenElderThing} sealed noColor /></span>{s.elderThing}
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
