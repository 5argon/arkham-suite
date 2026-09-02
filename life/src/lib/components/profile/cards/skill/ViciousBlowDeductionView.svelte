<!--
@component
"Vicious Blow & Deduction" — the Level-0 and Level-2 versions of Vicious Blow (Guardian) and
Deduction (Seeker), each merging every reprint across all products, as scans with a lifetime
use count. Its insight table reports four precomputed lenses per card, over every eligible
deck — used / not-using (complements over the eligible decks) and removed / never-removed
(complements over the decks that used it; removed = dropped from the final deck, no L0 and no
L2). Each lens surfaces its own investigators. All counting — including scanning each deck's
full upgrade chain — happens at the precompute step (`eligibilityInsights`); this just renders.
-->
<script lang="ts">
	import type { CardCode } from '@5argon/arkham-kohaku';
	import type { EligibilityInsight, InsightDeck } from '$lib/profile/profile-types';
	import { viciousBlowDeductionCards } from '$lib/campaign/utils/card-filters';
	import SkillSpotlightView from '$lib/components/profile/cards/skill/SkillSpotlightView.svelte';

	let {
		cardUsage,
		insightDecks,
		eligibilityInsights
	}: {
		cardUsage: Record<CardCode, number>;
		insightDecks: InsightDeck[];
		eligibilityInsights: Record<string, EligibilityInsight>;
	} = $props();

	const EMPTY: EligibilityInsight = {
		canUse: 0,
		used: 0,
		usedInvestigators: [],
		notUsed: 0,
		notUsedInvestigators: [],
		removed: 0,
		removedInvestigators: [],
		neverRemovedInvestigators: []
	};
	const insight = (id: string): EligibilityInsight => eligibilityInsights[id] ?? EMPTY;

	const NAMES: { id: string; name: string }[] = [
		{ id: 'viciousBlow', name: 'Vicious Blow' },
		{ id: 'deduction', name: 'Deduction' }
	];

	// Not every deck can use these cards, so each row prints its denominator inline (showTotal).
	const rows = $derived(
		[
			...NAMES.map(({ id, name }) => {
				const e = insight(id);
				return {
					label: `Used ${name}`,
					count: e.used,
					total: e.canUse,
					investigators: e.usedInvestigators
				};
			}),
			...NAMES.map(({ id, name }) => {
				const e = insight(id);
				return {
					label: `Not using ${name} in a deck that can use it`,
					count: e.notUsed,
					total: e.canUse,
					investigators: e.notUsedInvestigators
				};
			}),
			...NAMES.map(({ id, name }) => {
				const e = insight(id);
				return {
					label: `Removed ${name} from the deck (and not upgrading)`,
					count: e.removed,
					total: e.used,
					investigators: e.removedInvestigators
				};
			}),
			...NAMES.map(({ id, name }) => {
				const e = insight(id);
				return {
					label: `Never removed ${name}`,
					count: e.used - e.removed,
					total: e.used,
					investigators: e.neverRemovedInvestigators
				};
			})
		].map((r) => ({ ...r, showTotal: true }))
	);
</script>

<SkillSpotlightView spotlights={viciousBlowDeductionCards()} {cardUsage} {insightDecks} {rows} />
