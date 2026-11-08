<!--
@component
One of the Grimoire's timing diagrams in a compact form, with steps or player windows highlighted
to point at the moment being talked about. Player windows always stand out from the steps.
-->
<script lang="ts">
	import clsx from 'clsx';

	import FaIcon from '../icon/FaIcon.svelte';
	import { FaIconType } from '../icon/fa-icon-type.js';
	import * as m from '../paraglide/messages.js';
	import {
		timingDiagram,
		timingDiagramHref,
		type TimingDiagramId,
		type TimingSpec
	} from './timing.js';

	interface Prop {
		timing: TimingSpec;
	}
	const { timing }: Prop = $props();

	const titles: Record<TimingDiagramId, () => string> = {
		mythos: m.rule_timing_mythos,
		investigation: m.rule_timing_investigation,
		enemy: m.rule_timing_enemy,
		upkeep: m.rule_timing_upkeep,
		'skill-test': m.rule_timing_skill_test
	};
	const nextPhase: Partial<Record<TimingDiagramId, () => string>> = {
		mythos: m.rule_timing_mythos_next,
		investigation: m.rule_timing_investigation_next,
		enemy: m.rule_timing_enemy_next,
		upkeep: m.rule_timing_upkeep_next
	};
	const labels: Record<string, () => string> = {
		'3.110': m.rule_timing_3_110,
		'3.120': m.rule_timing_3_120,
		'3.130': m.rule_timing_3_130,
		'3.140': m.rule_timing_3_140,
		'3.150': m.rule_timing_3_150,
		'3.210': m.rule_timing_3_210,
		'3.220': m.rule_timing_3_220,
		'3.221': m.rule_timing_3_221,
		'3.222': m.rule_timing_3_222,
		'3.230': m.rule_timing_3_230,
		'3.310': m.rule_timing_3_310,
		'3.320': m.rule_timing_3_320,
		'3.330': m.rule_timing_3_330,
		'3.340': m.rule_timing_3_340,
		'3.410': m.rule_timing_3_410,
		'3.420': m.rule_timing_3_420,
		'3.430': m.rule_timing_3_430,
		'3.440': m.rule_timing_3_440,
		'3.450': m.rule_timing_3_450,
		'3.460': m.rule_timing_3_460,
		'4.001': m.rule_timing_4_001,
		'4.002': m.rule_timing_4_002,
		'4.003': m.rule_timing_4_003,
		'4.004': m.rule_timing_4_004,
		'4.005': m.rule_timing_4_005,
		'4.006': m.rule_timing_4_006,
		'4.007': m.rule_timing_4_007,
		'4.008': m.rule_timing_4_008
	};
	// Where the diagram loops back, as the diagram itself says under the step.
	const flows: Record<string, () => string> = {
		'3.221': m.rule_timing_3_221_flow,
		'3.222': m.rule_timing_3_222_flow,
		'3.330': m.rule_timing_3_330_flow
	};

	const diagram = $derived(timingDiagram(timing.diagram));
	const next = $derived(nextPhase[timing.diagram]);
	const anyHighlighted = $derived(timing.highlighted.length > 0);
</script>

<figure
	class="border-primary-300 bg-primary-100/40 dark:border-primary-700 dark:bg-primary-900/30 my-4 w-full max-w-md rounded-md border p-3"
>
	<figcaption class="mb-2 text-sm font-bold">
		<!-- eslint-disable svelte/no-navigation-without-resolve -->
		<a
			class="text-primary-900 dark:text-primary-100 hover:underline"
			href={timingDiagramHref(diagram)}
			rel="noopener"
			target="_blank"
		>
			<FaIcon class="text-primary-500 dark:text-primary-400 mr-1" icon={FaIconType.RuleReference} />
			{titles[timing.diagram]()}
		</a>
		<!-- eslint-enable svelte/no-navigation-without-resolve -->
	</figcaption>
	<div class="relative">
		<!-- The flow from one row to the next, behind them all. -->
		<span
			aria-hidden="true"
			class="bg-primary-300 dark:bg-primary-700 absolute top-2 bottom-2 left-5 w-0.5"
		></span>
		<ol class="relative flex flex-col gap-1">
			{#each diagram.rows as row, i (i)}
				{@const highlighted = timing.highlighted.includes(i)}
				{#if row.kind === 'step'}
					{@const flow = flows[row.id]}
					<li
						class={clsx(
							'relative flex items-baseline gap-2 rounded-md border px-2 py-1 text-xs',
							highlighted
								? 'border-secondary-500 bg-secondary-100 text-primary-950 ring-secondary-500 dark:bg-secondary-900 dark:text-primary-50 font-semibold shadow-sm ring-1'
								: anyHighlighted
									? // Faded by color, not opacity, so the flow line behind stays hidden.
										'border-primary-200 bg-primary-50 text-primary-500 dark:border-primary-800 dark:bg-primary-900 dark:text-primary-400'
									: 'border-primary-300 bg-primary-50 text-primary-800 dark:border-primary-700 dark:bg-primary-900 dark:text-primary-200'
						)}
					>
						<span class="w-8 shrink-0 font-bold tabular-nums">{row.number}</span>
						<span class="min-w-0">
							{labels[row.id]()}
							{#if flow}
								<span class="block text-[0.7rem] font-normal opacity-80">{flow()}</span>
							{/if}
						</span>
					</li>
				{:else}
					<li
						class={clsx(
							'relative ml-3 flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold',
							highlighted
								? 'border-red-800 bg-red-800 text-white shadow-sm ring-2 ring-red-300 dark:border-red-500 dark:bg-red-700 dark:ring-red-900'
								: 'border-red-800/60 bg-red-50 text-red-800 dark:border-red-400/60 dark:bg-red-950 dark:text-red-300'
						)}
					>
						<span aria-hidden="true" class="icon-free"></span>
						{m.rule_timing_player_window()}
					</li>
				{/if}
			{/each}
		</ol>
	</div>
	{#if next}
		<p class="text-primary-600 dark:text-primary-400 mt-1 pl-2 text-[0.7rem] italic">{next()}</p>
	{/if}
</figure>
