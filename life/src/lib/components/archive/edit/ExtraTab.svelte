<!--
@component
The Extra tab: per-scenario facts the final campaign log does not keep (victory display, resolution,
campaign-data's curated choices), and the side stories played inside the campaign.
-->
<script lang="ts">
	import type { CampaignLog } from '@5argon/arkham-campaign-data';
	import { HelpButton } from '@5argon/arkham-life-ui';
	import * as m from '$lib/paraglide/messages.js';
	import Doc from '$lib/docs/Doc.svelte';
	import { campaignScenarios } from '$lib/campaign/records/campaign-log-source';
	import type { LocalLog } from '$lib/campaign/records/recorded-state';
	import type { InvestigatorRef } from '$lib/campaign/utils/investigators';
	import CampaignEditNote from './CampaignEditNote.svelte';
	import ScenarioExtraCard from './ScenarioExtraCard.svelte';
	import SideStoryList from './SideStoryList.svelte';

	interface Props {
		log: CampaignLog;
		localLogs: LocalLog[];
		/** The campaign's investigators; card pickers for investigators offer only these. */
		investigators: InvestigatorRef[];
		/** Standalone archive: only this scenario, no side stories, and an experience-earned box. */
		onlyScenario?: string;
		onLogsChange: (next: LocalLog[]) => void;
	}
	let { log, localLogs, investigators, onlyScenario, onLogsChange }: Props = $props();

	const scenarios = $derived(
		onlyScenario ? campaignScenarios(log).filter((s) => s === onlyScenario) : campaignScenarios(log)
	);
</script>

{#snippet help()}<Doc path="archive/extra" />{/snippet}

<div class="mt-4 max-w-xl space-y-2">
	<div class="text-primary-500 flex items-center justify-end gap-1 text-sm">
		{m.archive_extra_help()}
		<HelpButton label={m.archive_extra_help_title()} helpContent={help} />
	</div>
	<CampaignEditNote {log} tab="extra" />
	<p class="text-primary-500 mb-2 text-sm">{m.archive_extra_intro()}</p>
	{#each scenarios as scenario (scenario)}
		<ScenarioExtraCard
			{log}
			{scenario}
			logs={localLogs}
			{investigators}
			showEarnedXp={!!onlyScenario}
			{onLogsChange}
		/>
	{/each}

	{#if !onlyScenario}
		<SideStoryList logs={localLogs} {investigators} {onLogsChange} />
	{/if}
</div>
