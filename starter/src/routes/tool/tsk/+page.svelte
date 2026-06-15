<script lang="ts">
	import { afterNavigate, goto } from '$app/navigation';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { Button, MarginFull, MarginText, PageLead, SectionSeparator, TextParagraph } from '@5argon/arkham-life-ui';
	import { evaluatePlan, initialState, simulatePlan, type Constraint, type PlanStep } from '@5argon/arkham-tsk-solver';
	import OpenGraph from '$lib/components/OpenGraph.svelte';
	import AchievementsEarned from './AchievementsEarned.svelte';
	import ConstraintForm from './ConstraintForm.svelte';
	import GoalsChecklist from './GoalsChecklist.svelte';
	import PlanSummary from './PlanSummary.svelte';
	import StepForm from './StepForm.svelte';
	import { defaultFinaleStep, defaultMiddleStep, defaultPrologueStep, rowFromConstraint, toConstraint, type RowModel } from './helpers';
	import { decodeState, encodeState } from './codec';

	interface Entry {
		id: number;
		step: PlanStep;
	}
	let nextId = 1;
	const seed = (): Entry[] => [
		{ id: nextId++, step: defaultPrologueStep() },
		{ id: nextId++, step: defaultFinaleStep() },
	];

	let revealed = $state(false);
	// The plan always opens with Riddles and Rain (pinned first) and ends with Congress (pinned last).
	let entries = $state<Entry[]>(seed());
	let rows = $state<RowModel[]>([]);
	let pending: string | null = null;
	let copied = $state(false);

	const plan = $derived<PlanStep[]>(entries.map((e) => e.step));
	const constraints = $derived<Constraint[]>(rows.map(toConstraint).filter((c): c is Constraint => c !== null));
	const trajectory = $derived(simulatePlan({ steps: $state.snapshot(plan) as PlanStep[] }));
	const checks = $derived(evaluatePlan(trajectory, constraints));

	const lastIndex = $derived(entries.length - 1);
	const roleOf = (i: number): 'prologue' | 'middle' | 'finale' => (i === 0 ? 'prologue' : i === lastIndex ? 'finale' : 'middle');
	const fromStateAt = (i: number) => (i === 0 ? initialState() : trajectory.steps[i - 1]!.stateAfter);
	const encodedNow = $derived(encodeState({ plan: $state.snapshot(plan) as PlanStep[], constraints }));

	afterNavigate(() => {
		const enc = new URLSearchParams(page.url.search).get('p');
		if (!enc) return;
		if (!revealed) {
			pending = enc;
			return;
		}
		load(enc);
	});

	function load(enc: string) {
		const st = decodeState(enc);
		if (!st) return;
		const steps = st.plan.length ? st.plan : [defaultPrologueStep(), defaultFinaleStep()];
		entries = steps.map((step) => ({ id: nextId++, step }));
		rows = (st.constraints ?? []).map(rowFromConstraint);
	}
	function reveal() {
		revealed = true;
		const e = pending;
		pending = null;
		if (e) load(e);
	}

	function addStep() {
		// Insert a new middle just before the pinned finale, departing from the last middle's state.
		const before = trajectory.steps[entries.length - 2]?.stateAfter ?? initialState();
		const mid: Entry = { id: nextId++, step: defaultMiddleStep(before) };
		entries = [...entries.slice(0, lastIndex), mid, ...entries.slice(lastIndex)];
	}
	function updateStep(id: number, step: PlanStep) {
		entries = entries.map((e) => (e.id === id ? { ...e, step } : e));
	}
	function removeStep(id: number) {
		entries = entries.filter((e) => e.id !== id);
	}
	function moveStep(id: number, dir: -1 | 1) {
		const i = entries.findIndex((e) => e.id === id);
		const j = i + dir;
		// Middles only; the prologue (0) and finale (lastIndex) stay pinned.
		if (i <= 0 || i >= lastIndex || j < 1 || j > lastIndex - 1) return;
		const next = [...entries];
		[next[i], next[j]] = [next[j]!, next[i]!];
		entries = next;
	}

	async function share() {
		try {
			await navigator.clipboard.writeText(`https://arkham-starter.com/tool/tsk/view?p=${encodedNow}`);
			copied = true;
			setTimeout(() => (copied = false), 1800);
		} catch {
			copied = false;
		}
	}
	function preview() {
		goto(resolve(`/tool/tsk/view?p=${encodedNow}`, {}));
	}
</script>

<OpenGraph
	description="Hand-plan The Scarlet Keys campaign step by step — the app tracks time, trust, keys, allies, and your goals at every decision."
	image="image/resource/tskdoc.webp"
	title="The Scarlet Keys : Campaign Planner"
	url="/tool/tsk"
/>

{#if !revealed}
	<MarginText>
		<div class="mx-auto mt-10 max-w-2xl rounded-lg border-2 border-survivor-400 dark:border-survivor-700 p-8 text-center">
			<div class="font-heading text-3xl text-survivor-700 dark:text-survivor-300 mb-4">⚠ Heavy Spoiler Warning</div>
			<TextParagraph>
				The TSK Campaign Planner lets you build a route through <i>The Scarlet Keys</i> by hand — choosing
				where to go and what to do at each stop — while it tracks the full campaign state for you.
			</TextParagraph>
			<TextParagraph>
				Seeing the scenarios, resolutions, keys, allies, and endings laid out reveals much of the campaign's
				structure and many surprises. This is for <b>replays</b>, achievement runs, and custom "gauntlet"
				planning. Please play the campaign normally at least once first.
			</TextParagraph>
			<div class="mt-6">
				<Button label="I understand — reveal the planner" onClick={reveal} highlighted />
			</div>
		</div>
	</MarginText>
{:else}
	<MarginFull>
		<PageLead
			title="The Scarlet Keys : Campaign Planner"
			description="Edit any step at any time; the app computes travel time, campaign state, and which of your goals each plan meets. Riddles and Rain opens and Congress closes the run."
		/>
	</MarginFull>

	<MarginText>
		<div class="mb-3 flex justify-end gap-2">
			<Button label="Preview (read-only)" onClick={preview} />
			<Button label={copied ? 'Link copied!' : 'Share plan link'} onClick={share} highlighted />
		</div>

		<PlanSummary {trajectory} />

		<ol class="my-4 flex flex-col">
			{#each entries as e, i (e.id)}
				<StepForm
					id={e.id}
					role={roleOf(i)}
					fromState={fromStateAt(i)}
					sim={trajectory.steps[i]!}
					finalState={trajectory.finalState}
					step={e.step}
					canMoveUp={i > 1}
					canMoveDown={i < lastIndex - 1}
					onUpdate={updateStep}
					onRemove={removeStep}
					onMove={moveStep}
				/>
				{#if i === lastIndex - 1}
					<li class="mb-4 ml-4 list-none"><Button label="+ Add step" onClick={addStep} /></li>
				{/if}
			{/each}
		</ol>

		<SectionSeparator title="Achievements" />
		<div class="mb-4"><AchievementsEarned {trajectory} {constraints} /></div>

		<SectionSeparator title="Goals" />
		{#if checks.length}
			<div class="mb-4"><GoalsChecklist {checks} {constraints} /></div>
		{/if}
		<ConstraintForm bind:rows />
	</MarginText>
{/if}
