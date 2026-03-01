<!--
@component
TSK-only editor heads-up (info, not an error). The Scarlet Keys leans on play
order and per-scenario resolutions far more than other campaigns, so the Logs
and Extra tabs each surface a campaign-specific note: Logs asks for entries in
play order, Extra explains why its resolutions are unusually load-bearing here.
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

	// TSK's campaign-data code (the kohaku `tsk` enum aliases to `tskc`).
	const isTsk = $derived(log?.db.code === 'tskc');
</script>

{#if isTsk}
	<div
		class="border-secondary-300 dark:border-secondary-700 bg-secondary-500/5 text-primary-700 dark:text-primary-300 mb-4 flex gap-2.5 rounded-lg border p-3 text-sm"
	>
		<span class="text-secondary-600 dark:text-secondary-400 mt-px shrink-0 leading-none">
			<FaIcon icon={FaIconType.NoticeInfo} />
		</span>
		<div class="space-y-2">
			{#if tab === 'logs'}
				<p>
					Especially for this campaign, please enter the logs in the exact order as recorded. Many
					widgets implies the sequence of scenario played from these ordering. It is also highly
					recommended to take a bit more effort to fill out the forms in Extra tab. Thank you!
				</p>
			{:else}
				<p>
					In other campaigns Extra are really extra, because recording them requires looking at
					something outside of a campaign logs and I try as much as possible to look at only the
					logs. However TSK is so ambitious that it isn't enough unless I ask you the exact
					resolution you got in each scenario.
				</p>
				<p>
					Many resolutions produces "haven't seen the last of" equally for both winning and losing
					it, the keys obtained can't even be checked because it could be stolen without leaving any
					log behind by the very enemy you just fought against, effectively erasing your history
					from being tracable. (How thematic is that?)
				</p>
				<p>
					Widgets will do its best with just logs, but there will be many holes in TSK than other
					campaigns if you didn't provide resolutions and other choices here.
				</p>
			{/if}
		</div>
	</div>
{/if}
