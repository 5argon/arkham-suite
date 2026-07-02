<!--
@component
NotZ bespoke spine widget — "Threats Carried Below". How the first two scenarios' loose ends stalk
the finale: the Ghoul Priest left alive in The Gathering (shuffled into the Devourer Below encounter
deck) and the cultists who escaped The Midnight Masks (each adds doom to the finale's Agenda 1a).
Both numbers hover to their per-difficulty split; the Ghoul Priest heads the block. Log-derived.
-->
<script lang="ts">
	import { NOTZ_GHOUL_PRIEST_CODE, type CampaignNotz } from '$lib/campaign/campaigns/notz';
	import CardThumb from '$lib/components/profile/_primitives/CardThumb.svelte';
	import StatNumbers, { type StatGroup } from '$lib/components/profile/_primitives/StatNumbers.svelte';
	import * as m from '$lib/paraglide/messages.js';

	let { notz }: { notz: CampaignNotz | null } = $props();

	const ghoul = $derived(notz?.gathering.ghoulPriestSurvived ?? null);
	const mm = $derived(notz?.midnightMasks ?? null);
	const hasData = $derived((ghoul?.total ?? 0) > 0 || (mm?.totalEscaped ?? 0) > 0);
	const rows = $derived<StatGroup[]>([
		{
			stats: [
				{ value: ghoul?.total ?? 0, label: m.campaign_notz_threat_ghoul(), byTier: ghoul?.byTier },
				{ value: mm?.totalEscaped ?? 0, label: m.campaign_notz_threat_cultists() }
			]
		}
	]);
</script>

{#if hasData}
	<div class="space-y-3">
		<div class="flex justify-center">
			<CardThumb
				code={NOTZ_GHOUL_PRIEST_CODE}
				alt={m.campaign_notz_ghoul_heading()}
				title={m.campaign_notz_ghoul_heading()}
				tone="danger"
				objectTop
			/>
		</div>
		<StatNumbers {rows} />
		<p class="text-primary-500 text-center text-xs">{m.campaign_notz_threats_note()}</p>
	</div>
{:else}
	<p class="text-primary-500 text-sm">{m.campaign_notz_threats_empty()}</p>
{/if}
