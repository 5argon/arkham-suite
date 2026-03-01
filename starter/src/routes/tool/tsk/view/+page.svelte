<script lang="ts">
	import { afterNavigate, goto } from '$app/navigation';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { Button, MarginFull, MarginText, PageLead, SectionSeparator, TextParagraph } from '@5argon/arkham-life-ui';
	import { COTERIE_ATTEMPT_PREFIX, simulatePlan, type PlanStep } from '@5argon/arkham-tsk-solver';
	import OpenGraph from '$lib/components/OpenGraph.svelte';
	import AchievementsEarned from '../AchievementsEarned.svelte';
	import ChaosTrail from '../ChaosTrail.svelte';
	import FinaleInsights from '../FinaleInsights.svelte';
	import PlanSummary from '../PlanSummary.svelte';
	import StepDisplay from '../StepDisplay.svelte';
	import StrategyLinks from '../StrategyLinks.svelte';
	import TskMap from '../TskMap.svelte';
	import { encodeState, decodeState } from '../codec';

	let revealed = $state(false);
	let plan = $state<PlanStep[]>([]);
	let assertions = $state<string[]>([]);
	let routeName = $state('');
	let routeDescription = $state('');
	let pending: string | null = null;
	let copied = $state(false);
	let valid = $state(true);

	const trajectory = $derived(simulatePlan({ steps: $state.snapshot(plan) as PlanStep[], assertions: $state.snapshot(assertions) as string[] }));
	const coterieAttempt = $derived(assertions.find((a) => a.startsWith(COTERIE_ATTEMPT_PREFIX))?.slice(COTERIE_ATTEMPT_PREFIX.length) ?? '');
	const encoded = $derived(encodeState({ plan: $state.snapshot(plan) as PlanStep[], assertions: $state.snapshot(assertions) as string[], name: routeName || undefined, description: routeDescription || undefined }));

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
		assertions = st.assertions ?? [];
		routeName = st.name ?? '';
		routeDescription = st.description ?? '';
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
	description="A shared Scarlet Keys campaign plan — view the route, the state at each step, the achievements it earns, and how the Congress of the Keys ends."
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

			{#if routeName || routeDescription}
				<div class="mb-4 rounded-lg border border-primary-200 dark:border-primary-800 p-3">
					{#if routeName}<div class="font-heading text-lg text-primary-900 dark:text-primary-100">{routeName}</div>{/if}
					{#if routeDescription}<p class="mt-1 whitespace-pre-wrap text-sm text-primary-700 dark:text-primary-300">{routeDescription}</p>{/if}
				</div>
			{/if}

			<PlanSummary {trajectory} />

			<div class="mt-3"><TskMap {trajectory} /></div>

			<ol class="my-4 flex flex-col">
				{#each trajectory.steps as step, i (i)}
					<StepDisplay {step} finalState={trajectory.finalState} />
				{/each}
			</ol>

			<SectionSeparator title="Chaos Bag Trail" />
			<p class="mb-2 text-xs italic text-primary-400">Every Trust / Deception act that tips the chaos bag, in play order — separate from the Foundation Trust / Cell Deception epilogue tallies.</p>
			<div class="mb-4"><ChaosTrail {trajectory} /></div>

			<SectionSeparator title="Achievements" />
			<div class="mb-4"><AchievementsEarned {trajectory} /></div>

			<SectionSeparator title="The Congress of the Keys" />
			<div class="mb-4"><FinaleInsights {trajectory} attempt={coterieAttempt} /></div>
		{/if}
	</MarginText>
{/if}
