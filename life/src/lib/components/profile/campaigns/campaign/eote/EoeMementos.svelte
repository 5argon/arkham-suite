<!-- @component The nine Memorials of the Lost as card scans, lit when any of the subject's decks earned them. -->
<script lang="ts">
	import type { CardCode } from '@5argon/arkham-kohaku';
	import { cardByCode } from '$lib/card-data';
	import { EOE_MEMENTO_CODES } from '$lib/campaign/campaigns/eoe';
	import { CardScanWall } from '$lib/components/profile/_primitives';

	let { cardUsage }: { cardUsage: Record<CardCode, number> } = $props();

	const items = $derived(
		EOE_MEMENTO_CODES.flatMap((code) => {
			const card = cardByCode(code);
			return card ? [{ card, count: cardUsage[code] ?? 0 }] : [];
		})
	);
</script>

<CardScanWall {items} dimUnused />
