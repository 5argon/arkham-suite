<!--
@component
PtC Doubt/Conviction per-source breakdown — one row per the 7 decision points (book order, each
with its scenario icon), columns = how many plays earned Conviction / Doubt / Neutral there. Each
count hovers to a per-difficulty breakdown. Neutral = the play reached that decision but took no
mark. Built on WidgetTable + HoverTooltip.
-->
<script lang="ts">
	import { getScenarioData, Scenario } from '@5argon/arkham-kohaku';
	import { getCampaignLog } from '@5argon/arkham-campaign-data';
	import { EncounterSetIcon, HoverTooltip } from '@5argon/arkham-life-ui';
	import WidgetTable, {
		widgetTableCell
	} from '$lib/components/profile/_primitives/WidgetTable.svelte';
	import type { DcSourceTally } from '$lib/campaign/campaigns/ptc';
	import * as m from '$lib/paraglide/messages.js';

	let { sources }: { sources: DcSourceTally[] } = $props();

	// Scenario icon (interludes borrow their parent) + name.
	const ICON_SCENARIO: Record<string, string> = {
		reality_s_shadow: 'the_last_king',
		lost_soul: 'the_unspeakable_oath'
	};
	const KOHAKU = new Set<string>(Object.values(Scenario));
	function iconSet(scenario: string) {
		const id = ICON_SCENARIO[scenario] ?? scenario;
		if (!KOHAKU.has(id)) return null;
		try {
			return getScenarioData(id as Scenario)?.representativeSet ?? null;
		} catch {
			return null;
		}
	}
	const log = getCampaignLog('ptc');
	const INTERLUDE: Record<string, () => string> = {
		reality_s_shadow: m.campaign_ptc_dc_scen_reality,
		lost_soul: m.campaign_ptc_dc_scen_lost_soul
	};
	const scenName = (id: string) => log?.en.scenarioNames?.[id] ?? INTERLUDE[id]?.() ?? id;

	const total = (r: Record<string, number>) => Object.values(r).reduce((s, n) => s + n, 0);
	const DIFF_ORDER = ['easy', 'standard', 'hard', 'expert'];
	const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
	const breakdown = (r: Record<string, number>) =>
		Object.entries(r)
			.sort((a, b) => DIFF_ORDER.indexOf(a[0]) - DIFF_ORDER.indexOf(b[0]))
			.map(([d, n]) => `${cap(d)} ×${n}`)
			.join(' · ');

	const rows = $derived(
		sources.filter((s) => total(s.conviction) + total(s.doubt) + total(s.neutral) > 0)
	);
	const columns = [
		{ label: m.campaign_ptc_dc_src_col_change() },
		{ label: m.campaign_ptc_dc_conviction_full(), align: 'right' as const },
		{ label: m.campaign_ptc_dc_doubt_full(), align: 'right' as const },
		{ label: m.campaign_ptc_dc_neutral_short(), align: 'right' as const }
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

	const cellClass = (n: number, color: string) =>
		`${widgetTableCell} text-right tabular-nums cursor-default ${n > 0 ? color : 'text-primary-300 dark:text-primary-700'}`;
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
			<td
				class={cellClass(total(s.conviction), 'text-amber-600 dark:text-amber-400 font-semibold')}
				onmouseenter={(e) => showTip(breakdown(s.conviction), e)}
				onmouseleave={hideTip}>{total(s.conviction)}</td
			>
			<td
				class={cellClass(total(s.doubt), 'text-violet-600 dark:text-violet-400 font-semibold')}
				onmouseenter={(e) => showTip(breakdown(s.doubt), e)}
				onmouseleave={hideTip}>{total(s.doubt)}</td
			>
			{#if s.canNeutral}
				<td
					class={cellClass(total(s.neutral), 'text-primary-500')}
					onmouseenter={(e) => showTip(breakdown(s.neutral), e)}
					onmouseleave={hideTip}>{total(s.neutral)}</td
				>
			{:else}
				<td
					class="{widgetTableCell} text-primary-300 dark:text-primary-700 cursor-default text-right"
					title={m.campaign_ptc_dc_neutral_na()}
					aria-label={m.campaign_ptc_dc_neutral_na()}>—</td
				>
			{/if}
		{/snippet}
	</WidgetTable>
	<HoverTooltip visible={tipVisible} referenceElement={tipRef}>
		<span class="block max-w-xs py-1 text-xs text-neutral-900 dark:text-neutral-100">{tipText}</span>
	</HoverTooltip>
{/if}
