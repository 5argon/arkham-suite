<!--
@component
The Dream-Eaters Linked Campaign Log: for interconnected play, the sibling campaign's entries the
shared widgets need (Black Cat, Silver Key, Randolph, the epilogue matrix), transcribed by topic.
It is log data, so it counts in Log-only mode.
-->
<script lang="ts">
	import { getCampaignLog } from '@5argon/arkham-campaign-data';
	import { Checkbox } from '@5argon/arkham-life-ui';
	import { TDE_SIBLING, linkedTopicsFor } from '$lib/campaign/campaigns/tde-shared';
	import { makeEntry, type LocalLog } from '$lib/campaign/records/recorded-state';
	import * as m from '$lib/paraglide/messages.js';

	let {
		family,
		interconnected,
		linkedLogs,
		onInterconnectedChange,
		onLinkedChange
	}: {
		/** tdea or tdeb. */
		family: string;
		interconnected: boolean;
		linkedLogs: LocalLog[];
		onInterconnectedChange: (next: boolean) => void;
		onLinkedChange: (next: LocalLog[]) => void;
	} = $props();

	const siblingFamily = $derived(TDE_SIBLING[family] ?? '');
	const siblingLog = $derived(getCampaignLog(siblingFamily));
	const siblingName = $derived(siblingLog?.db.name ?? siblingFamily);
	const topics = $derived(linkedTopicsFor(family));

	const TOPIC_LABEL: Record<string, () => string> = {
		matrix: m.campaign_tde_link_topic_matrix,
		blackCat: m.campaign_tde_link_topic_black_cat,
		silverKey: m.campaign_tde_link_topic_silver_key,
		randolph: m.campaign_tde_link_topic_randolph
	};

	const has = (key: string) => linkedLogs.some((l) => l.key === key);
	function entryText(key: string): string {
		return siblingLog?.en.entries[key]?.text ?? key;
	}
	function toggle(key: string) {
		const next = has(key)
			? linkedLogs.filter((l) => l.key !== key)
			: [...linkedLogs, makeEntry(key.slice(0, key.indexOf('.')), key, [])];
		onLinkedChange(next);
	}
</script>

<div class="border-primary-200 dark:border-primary-700 mt-6 rounded-lg border p-4">
	<Checkbox
		label={m.campaign_tde_link_interconnected_label()}
		checked={interconnected}
		onChange={() => onInterconnectedChange(!interconnected)}
	/>
	<p class="text-primary-500 mt-1 text-xs">{m.campaign_tde_link_interconnected_help()}</p>

	{#if interconnected}
		<div class="mt-4 space-y-4">
			<p class="text-primary-600 dark:text-primary-300 text-sm font-medium">
				{m.campaign_tde_link_heading({ campaign: siblingName })}
			</p>
			{#each topics as topic (topic.id)}
				<div>
					<p class="text-primary-500 mb-1.5 text-xs font-semibold tracking-wide uppercase">
						{(TOPIC_LABEL[topic.id] ?? (() => topic.id))()}
					</p>
					<div class="flex flex-col items-start gap-1">
						{#each topic.keys as key (key)}
							<Checkbox label={entryText(key)} checked={has(key)} onChange={() => toggle(key)} />
						{/each}
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
