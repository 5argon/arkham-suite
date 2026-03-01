<script lang="ts">
	import { afterNavigate, goto } from '$app/navigation';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { Button, MarginFull, MarginText, PageLead, SectionSeparator, TextParagraph } from '@5argon/arkham-life-ui';
	import { COTERIE_ATTEMPT_PREFIX, coterieAttemptAssertion, initialState, simulatePlan, type CoterieAttempt, type PlanStep } from '@5argon/arkham-tsk-solver';
	import OpenGraph from '$lib/components/OpenGraph.svelte';
	import AchievementsEarned from './AchievementsEarned.svelte';
	import ChaosTrail from './ChaosTrail.svelte';
	import FinaleInsights from './FinaleInsights.svelte';
	import PlanSummary from './PlanSummary.svelte';
	import StepForm from './StepForm.svelte';
	import StrategyLinks from './StrategyLinks.svelte';
	import TskMap from './TskMap.svelte';
	import { defaultFinaleStep, defaultFoundationStep, defaultMiddleStep, defaultPrologueStep, FOUNDATION_FILE, withOpening } from './helpers';
	import { decodeState, encodeState } from './codec';

	interface Entry {
		id: number;
		step: PlanStep;
	}
	let nextId = 1;
	// The opening is fixed: Riddles and Rain → The Foundation interlude (both pinned), and Congress closes.
	const seed = (): Entry[] => [
		{ id: nextId++, step: defaultPrologueStep() },
		{ id: nextId++, step: defaultFoundationStep() },
		{ id: nextId++, step: defaultFinaleStep() },
	];

	let revealed = $state(false);
	// The plan always opens with Riddles and Rain (pinned first) and ends with Congress (pinned last).
	let entries = $state<Entry[]>(seed());
	// Author-supplied title + description for the route, carried in the share link.
	let routeName = $state('');
	let routeDescription = $state('');
	// Whether Desi turned out real or an impostor — a board outcome the plan can't derive, but it
	// decides her finale vote. '' = leave to the default (she votes against you unless in your debt + real).
	let desi = $state('');
	// The "you may overthrow / join" choice at the Congress (only matters when the coalition is in place).
	let coterieAttempt = $state('');
	let pending: string | null = null;
	let copied = $state(false);

	const plan = $derived<PlanStep[]>(entries.map((e) => e.step));
	const assertions = $derived<string[]>([...(desi ? [desi] : []), ...(coterieAttempt ? [coterieAttemptAssertion(coterieAttempt as CoterieAttempt)] : [])]);
	const trajectory = $derived(simulatePlan({ steps: $state.snapshot(plan) as PlanStep[], assertions: $state.snapshot(assertions) as string[] }));

	const lastIndex = $derived(entries.length - 1);
	// Index 0 = Riddles and Rain, index 1 = the pinned Foundation interlude (rendered fixed, no picker), last = finale.
	const roleOf = (i: number): 'prologue' | 'middle' | 'finale' => (i === 0 ? 'prologue' : i === lastIndex ? 'finale' : entries[i]!.step.fileCode === FOUNDATION_FILE ? 'prologue' : 'middle');
	const fromStateAt = (i: number) => (i === 0 ? initialState() : trajectory.steps[i - 1]!.stateAfter);
	const encodedNow = $derived(encodeState({ plan: $state.snapshot(plan) as PlanStep[], assertions: $state.snapshot(assertions) as string[], name: routeName.trim() || undefined, description: routeDescription.trim() || undefined }));

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
		// Normalize so the fixed opening (prologue + Foundation) is always present and pinned at the front.
		const steps = withOpening(st.plan.length ? st.plan : [defaultFinaleStep()]);
		entries = steps.map((step) => ({ id: nextId++, step }));
		desi = (st.assertions ?? []).find((a) => a === 'desiReal' || a === 'desiImpostor') ?? '';
		const att = (st.assertions ?? []).find((a) => a.startsWith(COTERIE_ATTEMPT_PREFIX));
		coterieAttempt = att ? att.slice(COTERIE_ATTEMPT_PREFIX.length) : '';
		routeName = st.name ?? '';
		routeDescription = st.description ?? '';
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
		// Middles only; the prologue (0), Foundation (1), and finale (lastIndex) stay pinned.
		if (i <= 1 || i >= lastIndex || j < 2 || j > lastIndex - 1) return;
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
	description="Hand-plan The Scarlet Keys campaign step by step — the app tracks time, trust, keys, allies, achievements, and the Congress of the Keys ending at every decision."
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
			description="Edit any step at any time; the app computes travel time, campaign state, the achievements you earn, and how the Congress of the Keys ends. Riddles and Rain opens and Congress closes the run."
		/>
	</MarginFull>

	<MarginText>
		<div class="mb-3 flex justify-end gap-2">
			<Button label="Preview (read-only)" onClick={preview} />
			<Button label={copied ? 'Link copied!' : 'Share plan link'} onClick={share} highlighted />
		</div>

		<div class="mb-3"><StrategyLinks /></div>

		<div class="mb-4 flex flex-col gap-2 rounded-lg border border-primary-200 dark:border-primary-800 p-3">
			<input
				class="w-full bg-transparent text-lg font-heading text-primary-900 dark:text-primary-100 placeholder:text-primary-400 focus:outline-none"
				placeholder="Name this route (e.g. “All Keys, no Coterie deals”)"
				bind:value={routeName}
				maxlength="120"
			/>
			<textarea
				class="w-full resize-y bg-transparent text-sm text-primary-700 dark:text-primary-300 placeholder:text-primary-400 focus:outline-none"
				placeholder="Describe the route's purpose — shared with anyone who opens the link."
				bind:value={routeDescription}
				rows="2"
				maxlength="600"
			></textarea>
		</div>

		<PlanSummary {trajectory} />

		<div class="mt-3"><TskMap {trajectory} /></div>
		<p class="mt-1 text-xs italic text-primary-400">The full planned course, start to finish. Use “Pick on map” on a step to choose its destination.</p>

		<ol class="my-4 flex flex-col">
			{#each entries as e, i (e.id)}
				<StepForm
					id={e.id}
					role={roleOf(i)}
					fromState={fromStateAt(i)}
					sim={trajectory.steps[i]!}
					finalState={trajectory.finalState}
					step={e.step}
					canMoveUp={i > 2}
					canMoveDown={i < lastIndex - 1}
					onUpdate={updateStep}
					onRemove={removeStep}
					onMove={moveStep}
					{trajectory}
					index={i}
					desi={i === lastIndex ? desi : ''}
					onDesi={i === lastIndex ? (v) => (desi = v) : undefined}
				/>
				{#if i === lastIndex - 1}
					<li class="mb-4 ml-4 list-none"><Button label="+ Add step" onClick={addStep} /></li>
				{/if}
			{/each}
		</ol>

		<SectionSeparator title="Chaos Bag Trail" />
		<p class="mb-2 text-xs italic text-primary-400">Every Trust / Deception act that tips the chaos bag, in play order — separate from the Foundation Trust / Cell Deception epilogue tallies.</p>
		<div class="mb-4"><ChaosTrail {trajectory} /></div>

		<SectionSeparator title="Achievements" />
		<div class="mb-4"><AchievementsEarned {trajectory} /></div>

		<SectionSeparator title="The Congress of the Keys" />
		<p class="mb-3 text-xs italic text-primary-400">How the Coterie votes on the cell, the endings the plan opens, and the Foundation Trust / Cell Deception tally read from the campaign log.</p>
		<div class="mb-4"><FinaleInsights {trajectory} attempt={coterieAttempt} onAttempt={(v) => (coterieAttempt = v)} /></div>
	</MarginText>
{/if}
