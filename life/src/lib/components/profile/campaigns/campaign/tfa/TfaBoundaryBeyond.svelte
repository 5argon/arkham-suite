<!-- @component The Boundary Beyond: paths known, the plays that knew all six and skipped Heart of the Elders, Part 1, and Ichtaca's confidence. -->
<script lang="ts">
	import type { CampaignTfa } from '$lib/campaign/campaigns/tfa';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import { StatNumbers } from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';
	import ScenarioInfo from '../ScenarioInfo.svelte';
	import { TFA_CARD } from './tfa-shared';

	let { blob: tfa, ctx }: CampaignWidgetProps<CampaignTfa> = $props();

	const b = $derived(tfa?.boundaryBeyond);
</script>

<ScenarioInfo {ctx} showPlays headerCards={[TFA_CARD.ichtaca]}>
	{#snippet stats()}
		<StatNumbers
			empty={m.campaign_tfa_boundary_empty()}
			rows={[
				[
					{ value: b?.pathsKnownMax, label: m.campaign_tfa_boundary_paths() },
					{ value: b?.part1Skipped, label: m.campaign_tfa_boundary_skip() },
					{ value: b?.ichtacaConfidence, label: m.campaign_tfa_boundary_confidence() }
				]
			]}
		/>
	{/snippet}
</ScenarioInfo>
