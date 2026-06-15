<script lang="ts">
	import { afterNavigate, goto } from '$app/navigation';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { Button, MarginFull, MarginText, PageLead, SectionSeparator, TextParagraph } from '@5argon/arkham-life-ui';
	import { evaluatePlan, simulatePlan, type Constraint, type PlanStep } from '@5argon/arkham-tsk-solver';
	import OpenGraph from '$lib/components/OpenGraph.svelte';
	import AchievementsEarned from '../AchievementsEarned.svelte';
	import GoalsChecklist from '../GoalsChecklist.svelte';
	import PlanSummary from '../PlanSummary.svelte';
	import StepDisplay from '../StepDisplay.svelte';
	import StrategyLinks from '../StrategyLinks.svelte';
	import TskMap from '../TskMap.svelte';
	import { encodeState, decodeState } from '../codec';

	let revealed = $state(false);
	let plan = $state<PlanStep[]>([]);
	let constraints = $state<Constraint[]>([]);
	let assertions = $state<string[]>([]);
	let pending: string | null = null;
	let copied = $state(false);
	let valid = $state(true);

	const trajectory = $derived(simulatePlan({ steps: $state.snapshot(plan) as PlanStep[], assertions: $state.snapshot(assertions) as string[] }));
	const checks = $derived(evaluatePlan(trajectory, constraints));
	const encoded = $derived(encodeState({ plan: $state.snapshot(plan) as PlanStep[], constraints, assertions: $state.snapshot(assertions) as string[] }));

	afterNavigate(() => {
		const enc = new URLSearchParams(page.url.search).get('p');
		if (!enc) {
			valid = false;
			return;
		}
		if (!revealed) {
			pending = enc;
			return;
		}
		load(enc);
	});

	function load(enc: string) {
		const st = decodeState(enc);
		if (!st) {
			valid = false;
			return;
		}
		plan = st.plan;
		constraints = st.constraints ?? [];
		assertions = st.assertions ?? [];
		valid = true;
	}
	function reveal() {
		revealed = true;
		const e = pending;
		pending = null;
		if (e) load(e);
	}
	function edit() {
		goto(resolve(`/tool/tsk?p=${encoded}`, {}));
	}
</script>

<OpenGraph
	description="A shared Scarlet Keys campaign plan — view the route, state at each step, and which goals it meets."
	image="image/resource/tskdoc.webp"
	title="The Scarlet Keys : Shared Plan"
	url="/tool/tsk/view"
/>

{#if !revealed}
	<MarginText>
		<div class="mx-auto mt-10 max-w-2xl rounded-lg border-2 border-survivor-400 dark:border-survivor-700 p-8 text-center">
			<div class="font-heading text-3xl text-survivor-700 dark:text-survivor-300 mb-4">⚠ Heavy Spoiler Warning</div>
			<TextParagraph>
				This is a shared plan for <i>The Scarlet Keys</i>. Viewing it reveals scenarios, resolutions, keys,
				allies, and the ending. Please play the campaign normally at least once first.
			</TextParagraph>
			<div class="mt-6">
				<Button label="I understand — view the plan" onClick={reveal} highlighted />
			</div>
		</div>
	</MarginText>
{:else}
	<MarginFull>
		<PageLead title="The Scarlet Keys : Shared Plan" description="A read-only campaign plan. Open it in the editor to change it." />
	</MarginFull>

	<MarginText>
		{#if !valid}
			<p class="text-survivor-700 dark:text-survivor-300">This link doesn't contain a valid plan.</p>
		{:else}
			<div class="mb-3 flex justify-end gap-2">
				<Button label="Edit this plan" onClick={edit} highlighted />
				<Button label={copied ? 'Link copied!' : 'Copy link'} onClick={async () => { try { await navigator.clipboard.writeText(`https://arkham-starter.com/tool/tsk/view?p=${encoded}`); copied = true; setTimeout(() => (copied = false), 1800); } catch { copied = false; } }} />
			</div>

			<div class="mb-3"><StrategyLinks /></div>

			<PlanSummary {trajectory} />

			<div class="mt-3"><TskMap {trajectory} /></div>

			<ol class="my-4 flex flex-col">
				{#each trajectory.steps as step, i (i)}
					<StepDisplay {step} finalState={trajectory.finalState} />
				{/each}
			</ol>

			<SectionSeparator title="Achievements" />
			<div class="mb-4"><AchievementsEarned {trajectory} {constraints} /></div>

			{#if checks.length}
				<SectionSeparator title="Goals" />
				<GoalsChecklist {checks} {constraints} />
			{/if}
		{/if}
	</MarginText>
{/if}
