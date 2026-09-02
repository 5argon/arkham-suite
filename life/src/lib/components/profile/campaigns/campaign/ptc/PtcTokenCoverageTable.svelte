<!--
@component
PtC chaos-token coverage — one row per receiving story scenario, with a chip for every
special-token mix the previous scenario could feed it: the tokens plus how many plays played it
with that mix (× plays, hover for the per-difficulty split). Mixes never played are greyed. Dim
Carcosa always anchors the table; other scenarios appear once played.
-->
<script lang="ts">
	import { ChaosTokenDisplay } from '@5argon/arkham-life-ui';
	import type { TokenScenarioTally } from '$lib/campaign/campaigns/ptc';
	import { difficultyBreakdown } from '$lib/campaign/utils/difficulty';
	import { scenarioRepresentativeSet } from '$lib/campaign/utils/standalone-scenarios';
	import WidgetTable, {
		widgetTableCell
	} from '$lib/components/profile/_primitives/WidgetTable.svelte';
	import HoverTip from '$lib/components/profile/_primitives/HoverTip.svelte';
	import { HoverTipState } from '$lib/components/profile/_primitives/hover-tip.svelte';
	import ScenarioNameCell from '$lib/components/profile/campaigns/campaign/ScenarioNameCell.svelte';
	import { PTC_TOKEN, ptcScenarioName } from './ptc-dc-labels';
	import * as m from '$lib/paraglide/messages.js';

	let { scenarios }: { scenarios: TokenScenarioTally[] } = $props();

	const breakdown = (r: Record<string, number>) => difficultyBreakdown(r, (n) => `×${n}`, ' · ');
	const rows = $derived(
		scenarios.filter((s) => s.scenario === 'dim_carcosa' || s.mixes.some((mm) => mm.total > 0))
	);
	const columns = [
		{ label: m.campaign_ptc_tokens_col_scenario() },
		{ label: m.campaign_ptc_tokens_col_mixes() }
	];
	const tip = new HoverTipState();
</script>

{#if rows.length}
	<WidgetTable {columns} {rows} key={(s) => s.scenario}>
		{#snippet row(s)}
			<ScenarioNameCell
				iconSet={scenarioRepresentativeSet(s.scenario)}
				fallback={s.scenario.slice(0, 2).toUpperCase()}
				name={ptcScenarioName(s.scenario)}
			/>
			<td class={widgetTableCell}>
				<div class="flex flex-wrap gap-2">
					{#each s.mixes as mm, k (k)}
						<span
							class="flex cursor-default items-center gap-1 rounded border px-1.5 py-0.5 {mm.total > 0
								? 'border-primary-300 dark:border-primary-600'
								: 'border-primary-100 opacity-50 dark:border-primary-800'}"
							onmouseenter={(e) => tip.showText(mm.total > 0 ? breakdown(mm.byDifficulty) : '', e)}
							onmouseleave={tip.hide}
						>
							{#if mm.mix.length}
								<span class="flex items-center gap-0.5">
									{#each mm.mix as tok, t (t)}
										<ChaosTokenDisplay token={PTC_TOKEN[tok]} sealed={false} size="text-[0.95rem]" hideLabel />
									{/each}
								</span>
							{:else}
								<span class="text-primary-400 text-[0.65rem]"
									>{m.campaign_ptc_tokens_base_short()}</span
								>
							{/if}
							<span
								class="text-xs tabular-nums {mm.total > 0
									? 'text-primary-600 dark:text-primary-300 font-semibold'
									: 'text-primary-300 dark:text-primary-600'}">×{mm.total}</span
							>
						</span>
					{/each}
				</div>
			</td>
		{/snippet}
	</WidgetTable>
	<HoverTip {tip} />
{/if}
