<!-- @component A TSK scenario passport with the scenario's stats from `tsk-stat-scenarios.ts`. -->
<script lang="ts">
	import type { CampaignTsk } from '$lib/campaign/campaigns/tsk/profile';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import { SectionLabel, StatNumbers } from '$lib/components/profile/_primitives';
	import TskScenarioInfo from './TskScenarioInfo.svelte';
	import { TSK_SCENARIO_STATS } from './tsk-stat-scenarios';

	let { blob: tsk, ctx }: CampaignWidgetProps<CampaignTsk> = $props();

	const spec = $derived(TSK_SCENARIO_STATS[ctx.scenario ?? '']);
	const content = $derived(tsk && spec ? spec(tsk, ctx.logOnly) : null);
</script>

<TskScenarioInfo blob={tsk} {ctx}>
	{#snippet stats()}
		{#if content}
			<StatNumbers rows={content.rows} />
			{#each content.sections ?? [] as s (s.heading)}
				<div class="mt-3 flex flex-col gap-2">
					<SectionLabel>{s.heading}</SectionLabel>
					<StatNumbers rows={s.rows} />
				</div>
			{/each}
		{/if}
	{/snippet}
</TskScenarioInfo>
