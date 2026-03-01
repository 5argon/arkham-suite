<!--
@component
EotE bespoke widget — "Fatal Mirage". How many of your runs played Fatal Mirage
once / twice / thrice (from the count of recorded `fatal_mirage` / `_2` / `_3`
resolutions), plus the most / fewest memories banished in a single run. Built on
the shared StatNumbers (explicit rows: the play distribution, then the extremes).
-->
<script lang="ts">
	import type { CampaignEoe } from '$lib/campaign/eoe';
	import StatNumbers, { type Stat } from '$lib/components/profile/_primitives/StatNumbers.svelte';
	import * as m from '$lib/paraglide/messages.js';

	let { eoe }: { eoe: CampaignEoe | null } = $props();
	const plays = $derived(eoe?.fatalMiragePlays ?? []);
	// Play distribution is precomputed on the eoe blob (see compiled-profile.ts).
	const dist = $derived(eoe?.fatalMiragePlayCounts ?? { once: 0, twice: 0, thrice: 0 });
	const rows = $derived<Stat[][]>(
		plays.length
			? [
					[
						{ value: dist.once, label: m.campaign_eote_fatal_played_once() },
						{ value: dist.twice, label: m.campaign_eote_fatal_played_twice() },
						{ value: dist.thrice, label: m.campaign_eote_fatal_played_thrice() }
					],
					[
						{ value: eoe?.memBanishedMost ?? '—', label: m.campaign_eote_fatal_most_banished() },
						{ value: eoe?.memBanishedLeast ?? '—', label: m.campaign_eote_fatal_fewest_banished() }
					]
				]
			: []
	);
</script>

<StatNumbers {rows} />
