<script lang="ts">
	import { EncounterSetIcon } from '@5argon/arkham-icon';
	import { Checkbox, Dropdown, type Option } from '@5argon/arkham-life-ui';
	import { getLocation, isAutoInterlude, optionsAt, preChoicesAt, reachableDestinations, type CampaignState, type PlanStep, type SimStep } from '@5argon/arkham-tsk-solver';
	import StepState from './StepState.svelte';
	import { describeOption, optionName, scenarioEncounterSet, stepIcon, stepTitle } from './helpers';

	interface Props {
		id: number;
		role: 'prologue' | 'middle' | 'finale';
		/** State before this step (drives the pickers' reachable/legal annotations). */
		fromState: CampaignState;
		/** Simulated result for this step (state, validity, finale). */
		sim: SimStep;
		/** The table state at the finale (for a finale step's summary). */
		finalState: CampaignState;
		step: PlanStep;
		canMoveUp: boolean;
		canMoveDown: boolean;
		onUpdate: (id: number, step: PlanStep) => void;
		onRemove: (id: number) => void;
		onMove: (id: number, dir: -1 | 1) => void;
	}
	let { id, role, fromState, sim, finalState, step, canMoveUp, canMoveDown, onUpdate, onRemove, onMove }: Props = $props();

	// Local edit state — initialized once from `step`. This form is keyed by a stable id in the parent,
	// so the values persist across re-simulation and reorder; the parent only mutates this step via emit().
	// svelte-ignore state_referenced_locally
	let node = $state(step.node);
	// svelte-ignore state_referenced_locally
	let optionId = $state(step.optionId);
	// A pre-scenario choice is mandatory in play, so default to the first one (never "none").
	// svelte-ignore state_referenced_locally
	let introChoiceId = $state(step.introChoiceIds?.[0] ?? preChoicesAt(step.node)[0]?.id ?? '');
	// svelte-ignore state_referenced_locally
	let useTicket = $state(step.useTicket === true);
	// svelte-ignore state_referenced_locally
	let travelOnly = $state(step.travelOnly === true);

	const isScenario = $derived(sim.option.kind === 'scenario' || sim.option.kind === 'finale');
	const set = $derived(isScenario ? scenarioEncounterSet(getLocation(sim.option.node).scenario_id ?? '') : null);
	const bad = $derived(sim.problems.length > 0);

	const destinations = $derived(reachableDestinations(fromState));
	const allOptions = $derived(node ? optionsAt(fromState, node) : []);
	const options = $derived(role === 'prologue' ? allOptions.filter((o) => o.option.isPrologue) : allOptions);
	const preChoices = $derived(node ? preChoicesAt(node) : []);
	// Auto-evaluated "check log → outcome" interludes: the game resolves the result, the player doesn't pick.
	const auto = $derived(node ? isAutoInterlude(node) : false);

	const destOptions = $derived<Option<string>[]>(
		destinations.map((d) => ({
			value: d.node,
			label: `${d.name}${d.story ? ` — ${d.story}` : ''}${d.file ? ` (#${d.file})` : ''}${d.locked ? ' 🔒' : ''} · ${d.travel != null ? `+${d.travel}` : 'unreachable'}`,
		})),
	);
	const optionOptions = $derived<Option<string>[]>(
		options.map((o) => ({ value: o.option.optionId, label: `${optionName(o.option)} · ${describeOption(o.option)}${o.problems.length ? ' ⚠' : ''}` })),
	);
	const preChoiceOptions = $derived<Option<string>[]>(
		preChoices.map((c) => ({ value: c.id, label: c.note ? `${c.id.replace(/_/g, ' ')} — ${c.note}` : c.id.replace(/_/g, ' ') })),
	);

	function emit() {
		onUpdate(id, {
			node,
			optionId,
			...(introChoiceId ? { introChoiceIds: [introChoiceId] } : {}),
			...(useTicket ? { useTicket: true } : {}),
			...(travelOnly ? { travelOnly: true } : {}),
		});
	}
	function onNodeChange() {
		optionId = options[0]?.option.optionId ?? '';
		introChoiceId = preChoices[0]?.id ?? '';
		useTicket = false;
		emit();
	}
</script>

<li class="relative flex gap-3 border-l-2 pl-4 pb-4 {bad ? 'border-survivor-300 dark:border-survivor-800' : 'border-primary-200 dark:border-primary-800'}">
	<span class="absolute -left-3 top-0 flex h-6 w-6 items-center justify-center rounded-full text-[0.7rem] {bad ? 'bg-survivor-200 text-survivor-800 dark:bg-survivor-900 dark:text-survivor-200' : 'bg-primary-200 text-primary-700 dark:bg-primary-800 dark:text-primary-200'}">
		{#if set}<EncounterSetIcon encounterSet={set} />{:else}<i class={stepIcon(sim)}></i>{/if}
	</span>

	<div class="flex-1">
		<div class="flex flex-wrap items-baseline justify-between gap-2">
			<span class="text-primary-900 dark:text-primary-100 {role === 'finale' ? 'font-bold' : ''}">{stepTitle(sim)}</span>
			<span class="shrink-0 text-xs text-primary-400">
				{#if sim.usedTicket}🎟 ticket{:else if sim.travelCost > 0}+{sim.travelCost} travel{/if} · t={sim.timeAfter}
			</span>
		</div>

		{#if role === 'finale'}
			<div class="mt-1 text-xs italic text-primary-400">Always the final step — win the Congress of the Keys.</div>
		{:else}
			<div class="mt-2 flex flex-wrap items-end gap-2">
				{#if role === 'middle'}
					<div class="min-w-56 grow"><Dropdown bind:value={node} label="Go to" options={destOptions} onchange={onNodeChange} /></div>
					<div class="pb-1"><Checkbox bind:checked={travelOnly} label="Do nothing here" onChange={emit} /></div>
				{/if}
				{#if auto && !travelOnly}
					<div class="pb-1 text-xs italic text-primary-400">The game resolves this from your log automatically — reorder this step to change the outcome.</div>
				{:else if !travelOnly}
					<div class="min-w-64 grow"><Dropdown bind:value={optionId} label={role === 'prologue' ? 'Resolution' : 'Do what'} options={optionOptions} onchange={emit} /></div>
					{#if preChoices.length}
						<div class="min-w-64"><Dropdown bind:value={introChoiceId} label="Pre-scenario choice" options={preChoiceOptions} onchange={emit} /></div>
					{/if}
				{/if}
				{#if role === 'middle'}
					<div class="pb-1"><Checkbox bind:checked={useTicket} label="Ticket jump" onChange={emit} /></div>
				{/if}
			</div>
		{/if}

		<StepState step={sim} {finalState} />
	</div>

	{#if role === 'middle'}
		<div class="flex shrink-0 flex-col gap-1">
			<button class="px-1 text-primary-400 hover:text-primary-700 disabled:opacity-30" disabled={!canMoveUp} onclick={() => onMove(id, -1)} aria-label="Move up"><i class="fa-solid fa-chevron-up"></i></button>
			<button class="px-1 text-primary-400 hover:text-primary-700 disabled:opacity-30" disabled={!canMoveDown} onclick={() => onMove(id, 1)} aria-label="Move down"><i class="fa-solid fa-chevron-down"></i></button>
			<button class="px-1 text-survivor-500 hover:text-survivor-700" onclick={() => onRemove(id)} aria-label="Remove step"><i class="fa-solid fa-trash"></i></button>
		</div>
	{/if}
</li>
