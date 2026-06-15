<script lang="ts">
	import { EncounterSetIcon } from '@5argon/arkham-icon';
	import { Button, Checkbox, Dropdown, FaIconType, type Option } from '@5argon/arkham-life-ui';
	import { decisionText, isAutoFile, optionsForDecision, optionText, playableFilesAt, reachableDestinations, resolutionOffers, selectableDecisions, type CampaignState, type PlanStep, type PlanTrajectory, type SimStep } from '@5argon/arkham-tsk-solver';
	import MapPickerModal from './MapPickerModal.svelte';
	import StepState from './StepState.svelte';
	import { defaultChoices, fileEncounterSet, fileLabel, stepIcon, stepTitle } from './helpers';

	interface Props {
		id: number;
		role: 'prologue' | 'middle' | 'finale';
		fromState: CampaignState;
		sim: SimStep;
		finalState: CampaignState;
		step: PlanStep;
		canMoveUp: boolean;
		canMoveDown: boolean;
		onUpdate: (id: number, step: PlanStep) => void;
		onRemove: (id: number) => void;
		onMove: (id: number, dir: -1 | 1) => void;
		/** The full trajectory + this step's index — for the per-step map picker (route up to here). */
		trajectory: PlanTrajectory;
		index: number;
		/** Finale only — the plan-level "was Desi real?" assertion (decides her Congress vote). */
		desi?: string;
		onDesi?: (v: string) => void;
	}
	let { id, role, fromState, sim, finalState, step, canMoveUp, canMoveDown, onUpdate, onRemove, onMove, trajectory, index, desi = '', onDesi }: Props = $props();

	const desiOptions = [
		{ value: '', label: 'Desi: default (unknown)' },
		{ value: 'desiReal', label: 'Desi was the real Desi' },
		{ value: 'desiImpostor', label: 'Desi was an impostor' },
	];

	// Local edit state — initialized once from `step`; the form is keyed by a stable id in the parent.
	// svelte-ignore state_referenced_locally
	let location = $state(step.location);
	// svelte-ignore state_referenced_locally
	let fileCode = $state(step.fileCode);
	// svelte-ignore state_referenced_locally
	let choices = $state<Record<string, string>>({ ...(step.choices ?? {}) });
	// svelte-ignore state_referenced_locally
	let useTicket = $state(step.useTicket === true);
	// svelte-ignore state_referenced_locally
	let travelOnly = $state(step.travelOnly === true);
	let mapOpen = $state(false);

	const set = $derived(fileEncounterSet(sim.fileCode));
	const bad = $derived(sim.problems.length > 0);

	const destinations = $derived(reachableDestinations(fromState));
	const filesHere = $derived(location ? playableFilesAt(location) : []);
	const decisions = $derived(fileCode && !travelOnly ? selectableDecisions(fileCode, location) : []);
	const auto = $derived(fileCode ? isAutoFile(fileCode) : false);

	const destOptions = $derived<Option<string>[]>(
		destinations.map((d) => ({
			value: d.node,
			label: `${d.name} · ${d.files.map((f) => fileLabel(f.fileCode, f.isSideStory)).join(' / ')} · ${d.travel != null ? `+${d.travel}` : 'unreachable'}${d.locked ? ' 🔒' : ''}`,
		})),
	);
	const fileOptions = $derived<Option<string>[]>(filesHere.map((f) => ({ value: f.fileCode, label: fileLabel(f.fileCode, f.isSideStory) })));
	// Resolutions reachable given the version played + the upstream choices/time (per logic.json `requires`).
	const resOffers = $derived(fileCode && !travelOnly ? resolutionOffers(fileCode, choices, fromState, sim.entryTime, location) : []);
	const decisionOptions = (d: { decisionId: string; decisionType: string }): Option<string>[] => {
		if (d.decisionType === 'resolution') {
			return resOffers
				.filter((r) => r.offerable)
				.map((r) => {
					const text = optionText(fileCode, d.decisionId, r.option.id)?.dropdownText ?? r.option.id;
					const tag = r.option.playOutcome && r.option.playOutcome !== 'win' ? ` · ${r.option.playOutcome}` : '';
					return { value: r.option.id, label: text + tag };
				});
		}
		return optionsForDecision(fileCode, d.decisionId).map((o) => ({ value: o.id, label: optionText(fileCode, d.decisionId, o.id)?.dropdownText ?? o.id }));
	};

	function emit() {
		onUpdate(id, {
			location,
			fileCode: travelOnly ? '' : fileCode,
			choices: { ...choices },
			...(useTicket ? { useTicket: true } : {}),
			...(travelOnly ? { travelOnly: true } : {}),
		});
	}
	function onLocationChange(v: string) {
		location = v;
		fileCode = playableFilesAt(v)[0]?.fileCode ?? '';
		choices = defaultChoices(fileCode, v);
		useTicket = false;
		travelOnly = false;
		emit();
	}
	function onFileChange(v: string) {
		fileCode = v;
		choices = defaultChoices(v, location);
		emit();
	}
	function onChoiceChange(decisionId: string, v: string) {
		choices = { ...choices, [decisionId]: v };
		emit();
	}
	function pickFromMap(v: string) {
		mapOpen = false;
		onLocationChange(v);
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

		<div class="mt-2 flex flex-col gap-2">
			{#if role === 'middle'}
				<div class="flex flex-wrap items-end gap-2">
					<div class="min-w-72 grow"><Dropdown value={location} label="Go to" options={destOptions} onchange={onLocationChange} /></div>
					<div class="shrink-0 pb-0.5"><Button label="Pick on map" icon={FaIconType.Map} onClick={() => (mapOpen = true)} /></div>
				</div>
				<div class="flex flex-wrap items-center gap-4">
					<Checkbox bind:checked={travelOnly} label="Do nothing here" onChange={emit} />
					<Checkbox bind:checked={useTicket} label="Ticket jump" onChange={emit} />
				</div>
			{/if}

			{#if !travelOnly}
				{#if role === 'middle' && filesHere.length > 1}
					<div class="max-w-lg"><Dropdown value={fileCode} label="Play" options={fileOptions} onchange={onFileChange} /></div>
				{/if}
				{#if auto}
					<div class="text-xs italic text-primary-400">The game resolves this from your log automatically — reorder this step to change the outcome.</div>
				{:else}
					{#each decisions as d (d.decisionId)}
						<div class="max-w-lg"><Dropdown value={choices[d.decisionId] ?? ''} label={decisionText(fileCode, d.decisionId)?.label ?? d.decisionId} options={decisionOptions(d)} onchange={(v) => onChoiceChange(d.decisionId, v)} /></div>
					{/each}
				{/if}
				{#if role === 'finale' && onDesi}
					<div class="max-w-lg"><Dropdown value={desi} label="Was Desi real?" options={desiOptions} onchange={(v) => onDesi(v)} /></div>
					<div class="text-xs italic text-primary-400">Dancing Mad doesn't record whether Desi was genuine — but it decides her vote here.</div>
				{/if}
			{/if}

			{#if role === 'finale'}
				<div class="text-xs italic text-primary-400">Always the final step — the Congress of the Keys. The vote is predicted from your campaign log.</div>
			{/if}
		</div>

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

{#if role === 'middle'}
	<MapPickerModal open={mapOpen} onClose={() => (mapOpen = false)} {trajectory} untilStep={index} {fromState} onPick={pickFromMap} />
{/if}
