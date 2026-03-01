<!--
@component
"Skill Cards" — every owned Skill-type player card as a utilization grid. A thin wrapper
around the shared CardUtilizationView, fixed to the `isSkillCard` predicate.
-->
<script lang="ts">
	import type { CardCode, Product } from '@5argon/arkham-kohaku';
	import { isSkillCard } from '$lib/campaign/card-filters';
	import CardUtilizationView from '$lib/components/profile/cards/CardUtilizationView.svelte';

	let {
		cardUsage,
		ownedProducts,
		classFilter = null
	}: {
		cardUsage: Record<CardCode, number>;
		ownedProducts: Product[] | null;
		classFilter?: string | null;
	} = $props();
</script>

<CardUtilizationView predicate={isSkillCard} {cardUsage} {ownedProducts} {classFilter} />
