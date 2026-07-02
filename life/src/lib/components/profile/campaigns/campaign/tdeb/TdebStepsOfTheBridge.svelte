<!--
@component
tdeb bespoke widget — "Steps of the Bridge". The running count toward Atlach-Nacha's web, shown as
the five Weaver-of-the-Cosmos doom bands (0–2 → 0 doom · 3–5 → 1 · 6–8 → 2 · 9–11 → 3 · 12+ → 4),
lit by how many plays landed in each — the higher your Steps, the harder the finale. With the most
and average accrued. Its threshold is TIERED (unlike the linear Evidence of Kadath).
-->
<script lang="ts">
	import type { CampaignTdeb } from '$lib/campaign/campaigns/tdeb';
	import IconTrack, {
		type IconTrackItem
	} from '$lib/components/profile/_primitives/IconTrack.svelte';
	import SectionLabel from '$lib/components/profile/_primitives/SectionLabel.svelte';
	import StatNumbers, { type Stat } from '$lib/components/profile/_primitives/StatNumbers.svelte';
	import * as m from '$lib/paraglide/messages.js';

	let { tdeb }: { tdeb: CampaignTdeb | null } = $props();
	const s = $derived(tdeb?.stepsOfTheBridge);
	const hasData = $derived(!!s && s.plays > 0);

	const TIER_LABEL = [
		m.campaign_tdeb_steps_tier0,
		m.campaign_tdeb_steps_tier1,
		m.campaign_tdeb_steps_tier2,
		m.campaign_tdeb_steps_tier3,
		m.campaign_tdeb_steps_tier4
	];
	// Escalating severity, safest (0 doom) to direst (4 doom).
	const TINT = [
		'text-green-600 dark:text-green-400',
		'text-lime-600 dark:text-lime-400',
		'text-amber-600 dark:text-amber-400',
		'text-orange-600 dark:text-orange-400',
		'text-red-600 dark:text-red-400'
	];
	interface BandItem extends IconTrackItem {
		doom: number;
		plays: number;
	}
	const bands = $derived<BandItem[]>(
		[0, 1, 2, 3, 4].map((t) => {
			const plays = s?.tiers[t] ?? 0;
			return { doom: t, plays, tooltip: TIER_LABEL[t](), dim: plays === 0, tint: TINT[t] };
		})
	);

	const rows = $derived<Stat[][]>(
		hasData && s
			? [
					[
						{ value: s.max, label: m.campaign_tdeb_steps_max() },
						{ value: s.avg, label: m.campaign_tdeb_steps_avg() }
					]
				]
			: []
	);
</script>

{#if hasData}
	<div class="space-y-4">
		<div>
			<SectionLabel variant="heading" align="center"
				>{m.campaign_tdeb_steps_band_heading()}</SectionLabel
			>
			<div class="flex justify-center">
				<IconTrack items={bands} size="1.3rem" cellWidth="2.6em" gap="0.4em">
					{#snippet icon(it)}<span class="font-bold tabular-nums">{it.doom}</span>{/snippet}
					{#snippet sub(it)}<span class="text-[0.55em] tabular-nums"
							>{it.plays > 0 ? `×${it.plays}` : '—'}</span
						>{/snippet}
				</IconTrack>
			</div>
		</div>
		<StatNumbers {rows} />
	</div>
	<p class="text-primary-500 mt-3 text-center text-xs">{m.campaign_tdeb_steps_note()}</p>
{:else}
	<p class="text-primary-500 text-sm">{m.campaign_tdeb_steps_empty()}</p>
{/if}
