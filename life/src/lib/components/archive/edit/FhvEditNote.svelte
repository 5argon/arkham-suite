<!--
@component
FHV-only editor heads-up (info, not an error). The Feast of Hemlock Vale plays over three
Day/Night days, but which day and phase you played each flexible scenario on is NEVER written to
the campaign log — yet the Day/Night Schedule widget (and the replay-coverage view) come alive
only when it's recorded. So both tabs nudge the player to fill in the Extra "played on" picks.
Renders nothing for any other campaign.
-->
<script lang="ts">
	import type { CampaignLog } from '@5argon/arkham-campaign-data';
	import { FaIcon, FaIconType } from '@5argon/arkham-life-ui';

	interface Props {
		log: CampaignLog | undefined;
		/** Which tab is asking — selects the message shown. */
		tab: 'logs' | 'extra';
	}
	let { log, tab }: Props = $props();

	const isFhv = $derived(log?.db.code === 'fhv');
</script>

{#if isFhv}
	<div
		class="border-secondary-300 dark:border-secondary-700 bg-secondary-500/5 text-primary-700 dark:text-primary-300 mb-4 flex gap-2.5 rounded-lg border p-3 text-sm"
	>
		<span class="text-secondary-600 dark:text-secondary-400 mt-px shrink-0 leading-none">
			<FaIcon icon={FaIconType.NoticeInfo} />
		</span>
		<div class="space-y-2">
			{#if tab === 'logs'}
				<p>
					Hemlock Vale unfolds over three days, each with a Day and a Night phase. The campaign log
					never records <em>when</em> you played each scenario — so please take a moment in the Extra
					tab to set the day and phase for each one. It lights up the Day/Night Schedule and several
					villager widgets. Thank you!
				</p>
			{:else}
				<p>
					In this campaign you choose which scenarios to fit into three short days, and which day and
					phase to play them on. None of that timing survives in the campaign log, so widgets can't
					reconstruct your schedule from logs alone.
				</p>
				<p>
					Setting the “played on” day/phase for each scenario below fills the Day/Night Schedule
					matrix and enriches the per-character views. The two locked night scenarios — The Twisted
					Hollow (Day 1 Night) and The Longest Night (Day 2 Night) — are read from the log
					automatically, so you only need to place the flexible ones.
				</p>
			{/if}
		</div>
	</div>
{/if}
