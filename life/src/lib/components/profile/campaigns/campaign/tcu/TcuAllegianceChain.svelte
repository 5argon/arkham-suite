<!--
@component
The TCU Lodge/Coven allegiance chain: the five decision points in book order (The Price of
Progress · The Secret Name · The Inner Circle · Union and Disillusion · In the Clutches of Chaos),
each its scenario icon with a blue "L" (Silver Twilight Lodge) or green "C" (Coven) beneath — a
superscript ² for the ×2 weight at Union — dimmed where the run took no side. Hover names the
decision.
-->
<script lang="ts">
	import { TCU_ALLEGIANCE_SOURCES, type AllegianceBead } from '$lib/campaign/campaigns/tcu';
	import TwoSidedChain from '$lib/components/profile/campaigns/campaign/TwoSidedChain.svelte';
	import { ALLEGIANCE_TINT, allegianceIconSet, allegianceScenName } from './tcu-allegiance-labels';
	import * as m from '$lib/paraglide/messages.js';

	let { beads, size = '1.4rem' }: { beads: AllegianceBead[]; size?: string } = $props();

	const sides = {
		lodge: { abbr: m.campaign_tcu_alleg_lodge_abbr(), tint: ALLEGIANCE_TINT.lodge },
		coven: { abbr: m.campaign_tcu_alleg_coven_abbr(), tint: ALLEGIANCE_TINT.coven }
	};

	/** The decision that produced a lean, per decision point and side. */
	const SOURCE: Record<string, { lodge: () => string; coven: () => string }> = {
		the_price_of_progress: {
			lodge: m.campaign_tcu_alleg_src_price_lodge,
			coven: m.campaign_tcu_alleg_src_price_coven
		},
		the_secret_name: {
			lodge: m.campaign_tcu_alleg_src_secret_lodge,
			coven: m.campaign_tcu_alleg_src_secret_coven
		},
		the_inner_circle: {
			lodge: m.campaign_tcu_alleg_src_inner_lodge,
			coven: m.campaign_tcu_alleg_src_inner_coven
		},
		union_and_disillusion: {
			lodge: m.campaign_tcu_alleg_src_union_lodge,
			coven: m.campaign_tcu_alleg_src_union_coven
		},
		in_the_clutches_of_chaos: {
			lodge: m.campaign_tcu_alleg_src_clutches_lodge,
			coven: m.campaign_tcu_alleg_src_clutches_coven
		}
	};
	function earnedTitle(b: AllegianceBead): string {
		const decision = SOURCE[b.scenario]?.[b.side]() ?? b.scenario;
		const deceiving = b.deceiving ? ` ${m.campaign_tcu_alleg_deceiving_tip()}` : '';
		return `${decision}${deceiving}`;
	}
</script>

<TwoSidedChain
	{beads}
	sources={TCU_ALLEGIANCE_SOURCES}
	{sides}
	iconSet={allegianceIconSet}
	scenarioName={allegianceScenName}
	{earnedTitle}
	neutralLabel={m.campaign_tcu_alleg_neutral()}
	{size}
/>
