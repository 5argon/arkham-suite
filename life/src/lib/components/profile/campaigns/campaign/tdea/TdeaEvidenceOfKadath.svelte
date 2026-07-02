<!--
@component
tdea bespoke widget — "Evidence of Kadath". The running count toward the Onyx Castle, shown as the
ten Signs of the Gods lit up to your best run (all ten = the "Losing My Religion" achievement, and
each tally removes one clue from the Onyx Gates at Where the Gods Dwell). With the most / average /
all-ten stats. Its finale impact is LINEAR, not tiered.
-->
<script lang="ts">
	import type { CampaignTdea } from '$lib/campaign/campaigns/tdea';
	import IconTrack, {
		type IconTrackItem
	} from '$lib/components/profile/_primitives/IconTrack.svelte';
	import SectionLabel from '$lib/components/profile/_primitives/SectionLabel.svelte';
	import StatNumbers, { type Stat } from '$lib/components/profile/_primitives/StatNumbers.svelte';
	import * as m from '$lib/paraglide/messages.js';

	const ALL_SIGNS = 10;
	let { tdea }: { tdea: CampaignTdea | null } = $props();
	const e = $derived(tdea?.evidenceOfKadath);
	const hasData = $derived(!!e && e.plays > 0);
	const best = $derived(Math.min(e?.max ?? 0, ALL_SIGNS));

	interface SignItem extends IconTrackItem {
		lit: boolean;
	}
	const signs = $derived<SignItem[]>(
		Array.from({ length: ALL_SIGNS }, (_, i) => ({
			lit: i < best,
			dim: i >= best,
			tint: i < best ? 'text-amber-500 dark:text-amber-400' : '',
			tooltip: m.campaign_tdea_evidence_sign_tip({ n: i + 1 })
		}))
	);

	const rows = $derived<Stat[][]>(
		hasData && e
			? [
					[
						{ value: e.max, label: m.campaign_tdea_evidence_max() },
						{ value: e.avg, label: m.campaign_tdea_evidence_avg() },
						{ value: e.allSigns, label: m.campaign_tdea_evidence_all_signs() }
					]
				]
			: []
	);
</script>

{#if hasData}
	<div class="space-y-4">
		<div>
			<SectionLabel variant="heading" align="center"
				>{m.campaign_tdea_evidence_signs_heading()}</SectionLabel
			>
			<div class="flex justify-center">
				<IconTrack items={signs} size="1.1rem" cellWidth="1.2em" gap="0.15em" wrap>
					{#snippet icon(it)}<span>{it.lit ? '★' : '☆'}</span>{/snippet}
				</IconTrack>
			</div>
		</div>
		<StatNumbers {rows} />
	</div>
	<p class="text-primary-500 mt-3 text-center text-xs">{m.campaign_tdea_evidence_note()}</p>
{:else}
	<p class="text-primary-500 text-sm">{m.campaign_tdea_evidence_empty()}</p>
{/if}
