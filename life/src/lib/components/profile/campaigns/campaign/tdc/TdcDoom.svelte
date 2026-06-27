<!--
@component
TDC bespoke widget — "The Doom of Arkham". The two-part finale: Part I interludes (the crew
stands together / the allies' plan) and the four Part-II endings — drove Cthulhu off (the
"fight" approach, taken without enough artifacts), banished him (the "repel" approach), banished
him at the cost of Arkham, or annihilation (the loss). The secret better ending (halting his
awakening at the Sepulchre) is tracked separately. StatNumbers (grouped), labels from log text.
-->
<script lang="ts">
	import { tdcText, type CampaignTdc } from '$lib/campaign/campaigns/tdc';
	import StatNumbers, { type StatGroup } from '$lib/components/profile/_primitives/StatNumbers.svelte';
	import * as m from '$lib/paraglide/messages.js';

	let { tdc }: { tdc: CampaignTdc | null } = $props();
	const d = $derived(tdc?.doom ?? null);
	const interludeTotal = $derived(d ? d.stoodTogether + d.alliesPlan : 0);
	const endingTotal = $derived(d ? d.drivenAway + d.banished + d.banishedButDestroyed + d.annihilated : 0);
	const hasData = $derived(!!d && interludeTotal + endingTotal > 0);
	const rows = $derived<StatGroup[]>(
		hasData && d
			? [
					...(interludeTotal > 0
						? [
								{
									heading: m.campaign_tdc_doom_interludes_heading(),
									stats: [
										{ value: d.stoodTogether, label: tdcText('campaign_notes.stood_together') },
										{ value: d.alliesPlan, label: tdcText('campaign_notes.your_allies_have_a_plan') }
									]
								}
							]
						: []),
					...(endingTotal > 0
						? [
								{
									heading: m.campaign_tdc_doom_endings_heading(),
									stats: [
										{ value: d.drivenAway, label: tdcText('campaign_notes.cthulhu_was_driven_away') },
										{ value: d.banished, label: tdcText('campaign_notes.cthulhu_was_banished') },
										{ value: d.banishedButDestroyed, label: tdcText('campaign_notes.cthulhu_was_banished_but_arkham_was_destroyed') },
										{ value: d.annihilated, label: tdcText('campaign_notes.cthulhu_annihilated_the_city_of_arkham') }
									]
								}
							]
						: [])
				]
			: []
	);
</script>

{#if hasData}
	<StatNumbers {rows} />
	<p class="text-primary-500 mt-3 text-center text-xs">{m.campaign_tdc_doom_note()}</p>
{:else}
	<p class="text-primary-500 text-sm">{m.campaign_tdc_doom_empty()}</p>
{/if}
