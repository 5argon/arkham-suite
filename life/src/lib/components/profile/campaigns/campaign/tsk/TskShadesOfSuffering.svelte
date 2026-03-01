<!--
@component
TSK — Shades of Suffering. The shared scenario passport, with a bespoke stat row folded into the
passport (beside Succeed/Failed): Tzu San Niang's sway — plays where she fell under your sway vs
plays where she has you under hers. Each number hovers to its per-difficulty breakdown.
-->
<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import TskScenarioInfo from '$lib/components/profile/campaigns/campaign/tsk/TskScenarioInfo.svelte';
	import StatNumbers, { type Stat } from '$lib/components/profile/_primitives/StatNumbers.svelte';
	import type { TskScenarioWidgetProps } from '$lib/components/profile/campaigns/campaign/tsk/tsk-scenario';

	let props: TskScenarioWidgetProps = $props();

	const shades = $derived(props.tsk?.shadesOfSuffering ?? null);
	// Both numbers carry their per-difficulty `byTier`, so StatNumbers shows the difficulty breakdown
	// on hover (the shared "see this number by difficulty" feature).
	const statRow = $derived<Stat[]>(
		shades
			? [
					{
						value: shades.tzuUnderYourSway.total,
						label: m.campaign_tsk_shades_tzu_yours(),
						byTier: shades.tzuUnderYourSway.byTier
					},
					{
						value: shades.tzuHasYouUnderHerSway.total,
						label: m.campaign_tsk_shades_tzu_hers(),
						byTier: shades.tzuHasYouUnderHerSway.byTier
					}
				]
			: []
	);
	// Always show once there's TSK data — seeing 0 / 0 nudges the player to go sway Tzu San Niang.
	const hasData = $derived(!!shades);
</script>

<TskScenarioInfo scenarioId="shades_of_suffering" {...props}>
	{#snippet extraStats()}
		<!-- Tzu San Niang's sway (who swayed whom), grouped with the passport's Succeed/Failed numbers. -->
		{#if hasData}
			<StatNumbers rows={[statRow]} />
		{/if}
	{/snippet}
</TskScenarioInfo>
