<!--
@component
PtC Chaos Tokens coverage — one row per receiving story scenario (its icon + name), a cell of
chips for every special-token mix the previous scenario could feed it, each chip showing the
tokens + how many plays played that scenario with that mix (× plays). Mixes never played are
greyed (coverage). Each chip hovers to a per-difficulty breakdown. Built on WidgetTable + HoverTooltip.
-->
<script lang="ts">
	import { getScenarioData, Scenario, ChaosToken } from '@5argon/arkham-kohaku';
	import { getCampaignLog } from '@5argon/arkham-campaign-data';
	import { ChaosTokenDisplay, EncounterSetIcon, HoverTooltip } from '@5argon/arkham-life-ui';
	import WidgetTable, {
		widgetTableCell
	} from '$lib/components/profile/_primitives/WidgetTable.svelte';
	import type { PtcToken, TokenScenarioTally } from '$lib/campaign/campaigns/ptc';
	import * as m from '$lib/paraglide/messages.js';

	let { scenarios }: { scenarios: TokenScenarioTally[] } = $props();

	const KOHAKU = new Set<string>(Object.values(Scenario));
	function iconSet(id: string) {
		if (!KOHAKU.has(id)) return null;
		try {
			return getScenarioData(id as Scenario)?.representativeSet ?? null;
		} catch {
			return null;
		}
	}
	const log = getCampaignLog('ptc');
	const scenName = (id: string) => log?.en.scenarioNames?.[id] ?? id;
	const TOKEN: Record<PtcToken, ChaosToken> = {
		cultist: ChaosToken.TokenCultist,
		tablet: ChaosToken.TokenTablet,
		elder_thing: ChaosToken.TokenElderThing
	};

	const DIFF_ORDER = ['easy', 'standard', 'hard', 'expert'];
	const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
	const breakdown = (r: Record<string, number>) =>
		Object.entries(r)
			.sort((a, b) => DIFF_ORDER.indexOf(a[0]) - DIFF_ORDER.indexOf(b[0]))
			.map(([d, n]) => `${cap(d)} ×${n}`)
			.join(' · ');

	// Scenarios the player has actually played (some mix has plays), plus Dim Carcosa — the campaign
	// finale always anchors the table (its mixes show ×0 until a run reaches it).
	const rows = $derived(
		scenarios.filter((s) => s.scenario === 'dim_carcosa' || s.mixes.some((mm) => mm.total > 0))
	);
	const columns = [
		{ label: m.campaign_ptc_tokens_col_scenario() },
		{ label: m.campaign_ptc_tokens_col_mixes() }
	];

	let tipVisible = $state(false);
	let tipRef = $state<HTMLElement | null>(null);
	let tipText = $state('');
	function showTip(text: string, e: MouseEvent) {
		if (!text) return;
		tipText = text;
		tipRef = e.currentTarget as HTMLElement;
		tipVisible = true;
	}
	const hideTip = () => (tipVisible = false);
</script>

{#if rows.length}
	<WidgetTable {columns} {rows} key={(s) => s.scenario}>
		{#snippet row(s)}
			{@const set = iconSet(s.scenario)}
			<td class="{widgetTableCell} whitespace-nowrap">
				<span class="flex items-center gap-1.5">
					{#if set}
						<span class="text-primary-600 dark:text-primary-300" style="font-size:1.1rem">
							<EncounterSetIcon encounterSet={set} />
						</span>
					{/if}
					<span class="text-black dark:text-white">{scenName(s.scenario)}</span>
				</span>
			</td>
			<td class={widgetTableCell}>
				<div class="flex flex-wrap gap-2">
					{#each s.mixes as mm, k (k)}
						<span
							class="flex cursor-default items-center gap-1 rounded border px-1.5 py-0.5 {mm.total > 0
								? 'border-primary-300 dark:border-primary-600'
								: 'border-primary-100 opacity-50 dark:border-primary-800'}"
							onmouseenter={(e) => showTip(mm.total > 0 ? breakdown(mm.byDifficulty) : '', e)}
							onmouseleave={hideTip}
						>
							{#if mm.mix.length}
								<span class="flex items-center gap-0.5">
									{#each mm.mix as tok, t (t)}
										<ChaosTokenDisplay token={TOKEN[tok]} sealed={false} size="text-[0.95rem]" hideLabel />
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
	<HoverTooltip visible={tipVisible} referenceElement={tipRef}>
		<span class="block max-w-xs py-1 text-xs text-neutral-900 dark:text-neutral-100">{tipText}</span>
	</HoverTooltip>
{/if}
