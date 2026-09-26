<!-- @component The most-played investigators, as scans with how many decks ran them. -->
<script lang="ts">
	import { BorderedContainer } from '@5argon/arkham-life-ui';
	import { inCardClass, withCards } from '$lib/campaign/utils/card-filters';
	import type { InvestigatorStat } from '$lib/profile/profile-types';
	import { CardScanWall } from '$lib/components/profile/_primitives';

	let {
		investigators,
		classFilter = null,
		count = 5
	}: {
		investigators: InvestigatorStat[];
		classFilter?: string | null;
		count?: number;
	} = $props();

	const top = $derived(
		withCards(investigators)
			.filter((i) => !classFilter || inCardClass(i.card, classFilter))
			.sort((a, b) => b.count - a.count || a.card.name.localeCompare(b.card.name))
			.slice(0, count)
	);
</script>

{#if top.length}
	<BorderedContainer>
		<CardScanWall items={top} cols={5} />
	</BorderedContainer>
{/if}
