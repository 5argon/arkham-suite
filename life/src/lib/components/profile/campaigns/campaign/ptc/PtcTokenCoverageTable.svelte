<!-- @component Per receiving scenario, every special-token mix it can be played with and how many finished plays did. -->
<script lang="ts">
	import { ChaosTokenDisplay } from '@5argon/arkham-life-ui';
	import type { TokenScenarioTally } from '$lib/campaign/campaigns/ptc';
	import { CountWithBreakdown, WidgetTable } from '$lib/components/profile/_primitives';
	import { widgetTableCell } from '$lib/components/profile/_primitives/WidgetTable.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import ScenarioNameCell from '../ScenarioNameCell.svelte';
	import { PTC_TOKEN, ptcScenarioName } from './ptc-spine';

	let { scenarios }: { scenarios: TokenScenarioTally[] } = $props();

	const columns = [
		{ label: m.campaign_ptc_tokens_col_scenario() },
		{ label: m.campaign_ptc_tokens_col_mixes() }
	];
</script>

{#if scenarios.length}
	<WidgetTable {columns} rows={scenarios} key={(s) => s.scenario}>
		{#snippet row(s)}
			<ScenarioNameCell scenarioId={s.scenario} name={ptcScenarioName(s.scenario)} />
			<td class={widgetTableCell}>
				<div class="flex flex-wrap gap-2">
					{#each s.mixes as mix (mix.mix.join(','))}
						<span
							class="flex items-center gap-1 rounded border px-1.5 py-0.5 {mix.plays.total
								? 'border-primary-300 dark:border-primary-600'
								: 'border-primary-100 dark:border-primary-800 opacity-50'}"
						>
							<span class="flex items-center gap-0.5">
								{#each mix.mix as tok, t (t)}
									<ChaosTokenDisplay
										token={PTC_TOKEN[tok]}
										sealed={false}
										size="text-[0.95rem]"
										hideLabel
									/>
								{/each}
							</span>
							<CountWithBreakdown
								value="×{mix.plays.total}"
								tally={mix.plays}
								format={(n) => `×${n}`}
								class="text-xs tabular-nums {mix.plays.total
									? 'text-primary-600 dark:text-primary-300 font-semibold'
									: 'text-primary-300 dark:text-primary-600'}"
							/>
						</span>
					{/each}
				</div>
			</td>
		{/snippet}
	</WidgetTable>
{/if}
