<!--
@component
A campaign's heads-up for the Logs or Extra tab, from the doc `archive/note/<campaign>-<tab>`
(e.g. TSK asks for logs in play order). Renders nothing when the campaign has no such note.
-->
<script lang="ts">
	import type { CampaignLog } from '@5argon/arkham-campaign-data';
	import { FaIcon, FaIconType } from '@5argon/arkham-life-ui';
	import Doc from '$lib/docs/Doc.svelte';
	import { resolveDoc } from '$lib/docs';

	let { log, tab }: { log: CampaignLog | undefined; tab: 'logs' | 'extra' } = $props();

	const path = $derived(log ? `archive/note/${log.db.code}-${tab}` : '');
	const exists = $derived(!!path && resolveDoc(path) !== null);
</script>

{#if exists}
	<div
		class="border-secondary-300 dark:border-secondary-700 bg-secondary-500/5 text-primary-700 dark:text-primary-300 mb-4 flex gap-2.5 rounded-lg border p-3 text-sm"
	>
		<span class="text-secondary-600 dark:text-secondary-400 mt-px shrink-0 leading-none">
			<FaIcon icon={FaIconType.NoticeInfo} />
		</span>
		<div class="space-y-2"><Doc {path} /></div>
	</div>
{/if}
