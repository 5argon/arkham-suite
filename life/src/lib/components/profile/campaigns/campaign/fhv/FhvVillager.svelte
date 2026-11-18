<!-- @component One villager: the best relationship level and every milestone of theirs, lit once reached. -->
<script lang="ts">
	import { FHV_VILLAGERS, type CampaignFhv } from '$lib/campaign/campaigns/fhv';
	import { logText, scenarioName } from '$lib/campaign/records/campaign-log-source';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import { OutcomeList, WidgetEmpty, type OutcomeItem } from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';
	import FhvPortrait from './FhvPortrait.svelte';

	let { blob: fhv, villager }: CampaignWidgetProps<CampaignFhv> & { villager: string } = $props();

	const def = $derived(FHV_VILLAGERS.find((v) => v.id === villager));
	const t = $derived(fhv?.villagers[villager]);

	const note = (label: string, n: number | undefined, scenario: string): OutcomeItem => ({
		label,
		hit: (n ?? 0) > 0,
		count: n,
		note: scenarioName('fhv', scenario)
	});
	const milestones = $derived(
		(def?.milestones ?? []).map((ms) =>
			note(logText('fhv', `${villager}.${ms.id}`), t?.milestones[ms.id], ms.scenario)
		)
	);
	/** Notes about Mother Rachel and Simeon that sit outside their own log section. */
	const storyNotes = $derived.by((): OutcomeItem[] => {
		const hollow = fhv?.scenarios.the_twisted_hollow ?? {};
		const evening = fhv?.finalEvening;
		const fromLog = (key: string, n: number | undefined, scenario: string) =>
			note(logText('fhv', key), n, scenario);
		if (villager === 'rachel')
			return [
				fromLog(
					'mother_rachel_showed_the_way',
					hollow['campaign_notes.mother_rachel_showed_the_way'],
					'the_twisted_hollow'
				),
				fromLog('lost_the_path', hollow['campaign_notes.lost_the_path'], 'the_twisted_hollow'),
				fromLog('believed', evening?.believed, 'the_final_evening'),
				fromLog('lied_to_mother_rachel', evening?.lied, 'the_final_evening')
			];
		if (villager === 'simeon')
			return [
				note(m.campaign_fhv_simeon_plan(), fhv?.simeonPlanUnderway, 'written_in_rock'),
				fromLog('the_vale_is_full_of_fireworks', evening?.fireworks, 'dawn_of_the_final_day')
			];
		return [];
	});

	const recorded = $derived(
		!!t && (t.maxScore !== null || milestones.some((ms) => ms.hit) || t.saved.total > 0)
	);
</script>

{#if def && t && recorded}
	<div class="flex gap-3">
		<FhvPortrait {villager} size="h-24 w-20" />
		<div class="flex-1">
			<div class="mb-2 flex flex-wrap items-baseline gap-x-1.5 gap-y-1">
				<span class="text-2xl font-bold text-black tabular-nums dark:text-white"
					>{t.maxScore ?? 0}</span
				>
				<span class="text-primary-400 text-sm">/ {def.max} · {m.campaign_fhv_relationship()}</span>
				{#if t.saved.total > 0}
					<span class="text-rogue-600 dark:text-rogue-400 ml-1 text-xs font-medium"
						>{m.campaign_fhv_saved()}</span
					>
				{/if}
			</div>
			<OutcomeList items={milestones} size="text-xs" />
			{#if storyNotes.length}
				<div class="border-primary-200 dark:border-primary-700 mt-2 border-t pt-1.5">
					<OutcomeList items={storyNotes} size="text-xs" />
				</div>
			{/if}
		</div>
	</div>
{:else}
	<WidgetEmpty>{m.campaign_fhv_villager_empty()}</WidgetEmpty>
{/if}
