<!-- @component The City of Archives: how the Yithian process went, worst to best, then captivity and the body-swap aftermath. -->
<script lang="ts">
	import type { CampaignTfa } from '$lib/campaign/campaigns/tfa';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import {
		IconTrack,
		SectionLabel,
		StatNumbers,
		type IconTrackItem
	} from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';
	import ScenarioInfo from '../ScenarioInfo.svelte';
	import { TFA_CARD } from './tfa-shared';

	let { blob: tfa, ctx }: CampaignWidgetProps<CampaignTfa> = $props();

	interface Rung extends IconTrackItem {
		count: number;
		label: string;
	}

	const c = $derived(tfa?.cityOfArchives);
	const rungs = $derived<Rung[]>(
		[
			{
				count: c?.backfiredSpectacularly ?? 0,
				label: m.campaign_tfa_archives_tier_spectacular(),
				tip: m.campaign_tfa_archives_tip_spectacular,
				tint: 'text-error-600 dark:text-error-400'
			},
			{
				count: c?.backfired ?? 0,
				label: m.campaign_tfa_archives_tier_backfired(),
				tip: m.campaign_tfa_archives_tip_backfired,
				tint: 'text-amber-600 dark:text-amber-400'
			},
			{
				count: c?.successful ?? 0,
				label: m.campaign_tfa_archives_tier_successful(),
				tip: m.campaign_tfa_archives_tip_successful,
				tint: 'text-lime-600 dark:text-lime-400'
			},
			{
				count: c?.perfected ?? 0,
				label: m.campaign_tfa_archives_tier_perfected(),
				tip: m.campaign_tfa_archives_tip_perfected,
				tint: 'text-emerald-600 dark:text-emerald-400'
			}
		].map((r) => ({
			count: r.count,
			label: r.label,
			tooltip: r.tip({ n: r.count }),
			dim: r.count === 0,
			tint: r.count === 0 ? 'text-primary-300 dark:text-primary-600' : r.tint
		}))
	);
	const processed = $derived(rungs.some((r) => r.count > 0));
</script>

<ScenarioInfo {ctx} showPlays headerCards={[TFA_CARD.alejandro]}>
	{#snippet stats()}
		{#if processed}
			<div>
				<SectionLabel align="center">{m.campaign_tfa_archives_ladder_label()}</SectionLabel>
				<div class="flex justify-center">
					<IconTrack items={rungs} size="1.4rem" cellWidth="5em" wrap>
						{#snippet icon(it)}
							<span class="text-2xl leading-none font-bold tabular-nums">{it.count}</span>
						{/snippet}
						{#snippet sub(it)}
							<span class="text-[0.7rem]">{it.label}</span>
						{/snippet}
					</IconTrack>
				</div>
			</div>
		{/if}
		<StatNumbers
			logOnly={ctx.logOnly}
			empty={processed ? undefined : m.campaign_tfa_archives_empty()}
			rows={[
				{
					heading: m.campaign_tfa_archives_captivity_heading(),
					stats: [
						{ value: c?.cooperated, label: m.campaign_tfa_archives_cooperated() },
						{ value: c?.resisted, label: m.campaign_tfa_archives_resisted() },
						{ value: c?.memoriesExpunged, label: m.campaign_tfa_archives_expunged() }
					]
				},
				{
					nonLog: true,
					stats: [{ value: c?.yithianAftermath, label: m.campaign_tfa_archives_aftermath() }]
				}
			]}
		/>
	{/snippet}
</ScenarioInfo>
