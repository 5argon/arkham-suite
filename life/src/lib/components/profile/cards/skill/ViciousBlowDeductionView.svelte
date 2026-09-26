<!-- @component Vicious Blow and Deduction (every reprint, Level 0 and 2): lifetime use and how eligible decks treated them. -->
<script lang="ts">
	import type { CardCode } from '@5argon/arkham-kohaku';
	import { cardByCode } from '$lib/card-data';
	import {
		viciousBlowDeductionCards,
		viciousBlowDeductionEligibility,
		type InsightRow
	} from '$lib/campaign/utils/card-filters';
	import type { EligibilityInsight } from '$lib/profile/profile-types';
	import * as m from '$lib/paraglide/messages.js';
	import CardSpotlightView from '../CardSpotlightView.svelte';

	let {
		cardUsage,
		eligibilityInsights
	}: {
		cardUsage: Record<CardCode, number>;
		eligibilityInsights: Record<string, EligibilityInsight>;
	} = $props();

	const NONE: EligibilityInsight = {
		canUse: 0,
		used: 0,
		usedInvestigators: [],
		notUsed: 0,
		notUsedInvestigators: [],
		removed: 0,
		removedInvestigators: [],
		neverRemovedInvestigators: []
	};

	const targets = viciousBlowDeductionEligibility().map((t) => ({
		id: t.id,
		name: cardByCode(t.eligibilityCodes[0] ?? '')?.name ?? t.id
	}));

	// Used / not using split the eligible decks; removed / never removed split the decks that used
	// it, where removed means neither level is left in the final version. Not every deck can take
	// these class cards, so each row prints its denominator.
	const rows = $derived.by((): InsightRow[] => {
		const lens = (
			label: (name: string) => string,
			pick: (e: EligibilityInsight) => Pick<InsightRow, 'count' | 'total' | 'investigators'>
		) =>
			targets.map(({ id, name }) => ({
				label: label(name),
				showTotal: true,
				...pick(eligibilityInsights[id] ?? NONE)
			}));
		return [
			...lens(
				(name) => m.cards_insight_used({ name }),
				(e) => ({ count: e.used, total: e.canUse, investigators: e.usedInvestigators })
			),
			...lens(
				(name) => m.cards_skill_not_using({ name }),
				(e) => ({ count: e.notUsed, total: e.canUse, investigators: e.notUsedInvestigators })
			),
			...lens(
				(name) => m.cards_skill_removed({ name }),
				(e) => ({ count: e.removed, total: e.used, investigators: e.removedInvestigators })
			),
			...lens(
				(name) => m.cards_skill_never_removed({ name }),
				(e) => ({ count: e.used - e.removed, total: e.used, investigators: e.neverRemovedInvestigators })
			)
		];
	});
</script>

<CardSpotlightView spotlights={viciousBlowDeductionCards()} {cardUsage} {rows} />
