<!-- @component The 26 alien glyphs by the scenario that decrypts them, lit once decrypted. -->
<script lang="ts">
	import { getCampaignLog } from '@5argon/arkham-campaign-data';
	import {
		TDC_GLYPH_IDS,
		TDC_GLYPHS_BY_SCENARIO,
		type CampaignTdc
	} from '$lib/campaign/campaigns/tdc';
	import { scenarioName } from '$lib/campaign/records/campaign-log-source';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import {
		IconTrack,
		SectionLabel,
		StatNumbers,
		WidgetEmpty,
		type IconTrackItem
	} from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';

	let { blob: tdc }: CampaignWidgetProps<CampaignTdc> = $props();

	const entries = getCampaignLog('tdc')?.en.entries ?? {};
	/** The glyph's slot letter: tdc_rune_a → A. */
	const letter = (id: string) => id.slice(-1).toUpperCase();

	const rows = $derived(
		TDC_GLYPHS_BY_SCENARIO.map(({ scenario, ids }) => ({
			scenario,
			label: `${scenarioName('tdc', scenario)} · ${tdc?.glyphs.byScenario[scenario] ?? 0}/${ids.length}`,
			glyphs: ids.map((id): IconTrackItem & { letter: string; lit: boolean } => {
				const lit = (tdc?.glyphs.collected[id] ?? 0) > 0;
				const meaning = entries[`glyphs.${id}`]?.text;
				return { letter: letter(id), lit, tooltip: lit && meaning ? meaning : letter(id) };
			})
		}))
	);
</script>

{#if tdc?.glyphs.everCollected}
	<div class="space-y-2.5">
		{#each rows as r (r.scenario)}
			<div>
				<SectionLabel>{r.label}</SectionLabel>
				<IconTrack items={r.glyphs} size="0.75rem" cellWidth="2em" gap="0.25rem" wrap>
					{#snippet icon(g)}
						<span
							class="flex h-[2em] w-[2em] items-center justify-center rounded border font-semibold {g.lit
								? 'border-secondary-400 bg-secondary-100 text-secondary-700 dark:bg-secondary-900 dark:text-secondary-300'
								: 'border-primary-200 text-primary-400 dark:border-primary-700'}">{g.letter}</span
						>
					{/snippet}
				</IconTrack>
			</div>
		{/each}
	</div>
	<StatNumbers
		rows={[
			[
				{
					value: tdc.glyphs.allTwentySix,
					label: m.campaign_tdc_glyphs_all({ total: TDC_GLYPH_IDS.length })
				}
			]
		]}
	/>
{:else}
	<WidgetEmpty>{m.campaign_tdc_glyphs_empty()}</WidgetEmpty>
{/if}
