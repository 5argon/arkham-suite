<!--
@component
TDC bespoke widget — the Alien Glyph decryption wall (consolidated). All 26 alien glyphs grouped by
the scenario they're decrypted in; each glyph is a lit/greyed cell, its decoded meaning on hover.
Decrypting all 26 is one half of the better-ending gate (`alien_grad`). Reads the precomputed
`tdc.glyphs`. Full width.
-->
<script lang="ts">
	import { TDC_GLYPHS_BY_SCENARIO, tdcText, type CampaignTdc } from '$lib/campaign/campaigns/tdc';
	import * as m from '$lib/paraglide/messages.js';

	let { tdc }: { tdc: CampaignTdc | null } = $props();

	const SCEN: Record<string, () => string> = {
		one_last_job: m.campaign_tdc_sc_one_last_job,
		the_western_wall: m.campaign_tdc_sc_western_wall,
		the_drowned_quarter: m.campaign_tdc_sc_drowned_quarter,
		the_apiary: m.campaign_tdc_sc_apiary,
		the_grand_vault: m.campaign_tdc_sc_grand_vault,
		court_of_the_ancients: m.campaign_tdc_sc_court_of_the_ancients,
		obsidian_canyons: m.campaign_tdc_sc_obsidian_canyons
	};
	const scenName = (s: string) => (SCEN[s] ?? (() => s))();
	// The glyph's slot marker (tdc_rune_a → A).
	const letter = (id: string) => id.slice(-1).toUpperCase();
	// The glyph's decoded meaning (campaign-data), when translated; blank when it's just the key.
	const meaning = (id: string) => {
		const t = tdcText(`glyphs.${id}`);
		return t === `glyphs.${id}` ? '' : t;
	};
	const collected = $derived(tdc?.glyphs.collected ?? {});
	const isLit = (id: string) => (collected[id] ?? 0) > 0;

	const groups = $derived(
		TDC_GLYPHS_BY_SCENARIO.map((g) => ({
			scenario: g.scenario,
			ids: g.ids,
			done: g.ids.filter(isLit).length
		}))
	);
	const hasData = $derived(!!tdc && tdc.glyphs.everCollected > 0);
</script>

{#if hasData && tdc}
	<div class="space-y-2.5">
		{#each groups as g (g.scenario)}
			<div class="flex flex-wrap items-center gap-x-3 gap-y-1">
				<span class="text-primary-600 dark:text-primary-300 min-w-40 text-sm font-medium">
					{scenName(g.scenario)}
					<span class="text-primary-400 tabular-nums">· {g.done}/{g.ids.length}</span>
				</span>
				<div class="flex flex-wrap gap-1">
					{#each g.ids as id (id)}
						{@const lit = isLit(id)}
						{@const decoded = meaning(id)}
						<span
							class="flex h-6 w-6 items-center justify-center rounded border text-center text-xs font-semibold {lit
								? 'border-secondary-400 bg-secondary-100 text-secondary-700 dark:bg-secondary-900 dark:text-secondary-300'
								: 'border-primary-200 text-primary-400 dark:border-primary-700'}"
							title={lit && decoded ? decoded : letter(id)}>{letter(id)}</span
						>
					{/each}
				</div>
			</div>
		{/each}
	</div>
	<p class="text-primary-500 mt-3 text-xs">
		{#if tdc.glyphs.allTwentySix > 0}
			{m.campaign_tdc_glyphs_all26({ count: tdc.glyphs.allTwentySix })}
		{:else}
			{m.campaign_tdc_glyphs_progress({ done: tdc.glyphs.everCollected, total: 26 })}
		{/if}
	</p>
{:else}
	<p class="text-primary-500 text-sm">{m.campaign_tdc_glyphs_empty()}</p>
{/if}
