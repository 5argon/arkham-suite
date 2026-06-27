<!--
@component
The Dream-Eaters "Linked Campaign Log" editor. TDE is two separate, unlinked campaign
records; for interconnected play the shared widgets (the Black Cat, the Silver Key, Randolph,
and the epilogue matrix) need the OTHER campaign's final results. Rather than auto-join the
records, the player ticks an "interconnected" box and transcribes the handful of needed
sibling-log entries here — genuine log data (in the Logs tab, not Extra), so it survives
Log-only mode. Grouped by topic; display text comes from the sibling campaign's own log.
-->
<script lang="ts">
	import { getCampaignLog } from '@5argon/arkham-campaign-data';
	import { TDE_SIBLING, linkedTopicsFor } from '$lib/campaign/campaigns/tde-shared';
	import { makeEntry, type LocalLog } from '$lib/campaign/records/recorded-state';
	import * as m from '$lib/paraglide/messages.js';

	let {
		family,
		interconnected,
		linkedLogs,
		canEdit,
		onInterconnectedChange,
		onLinkedChange
	}: {
		/** This campaign's family (tdea or tdeb). */
		family: string;
		/** Whether `hidden.interconnected_campaign` is recorded on this campaign. */
		interconnected: boolean;
		/** The transcribed sibling entries (flat LocalLog list). */
		linkedLogs: LocalLog[];
		canEdit: boolean;
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
		if (!canEdit) return;
		const next = has(key)
			? linkedLogs.filter((l) => l.key !== key)
			: [...linkedLogs, makeEntry(key.slice(0, key.indexOf('.')), key, [])];
		onLinkedChange(next);
	}
</script>

<div class="border-primary-200 dark:border-primary-700 mt-6 rounded-lg border p-4">
	<label class="flex cursor-pointer items-start gap-2">
		<input
			type="checkbox"
			class="mt-0.5"
			checked={interconnected}
			disabled={!canEdit}
			onchange={(e) => onInterconnectedChange((e.currentTarget as HTMLInputElement).checked)}
		/>
		<span>
			<span class="font-semibold text-black dark:text-white"
				>{m.campaign_tde_link_interconnected_label()}</span
			>
			<span class="text-primary-500 mt-0.5 block text-xs">{m.campaign_tde_link_interconnected_help()}</span>
		</span>
	</label>

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
					<div class="space-y-1">
						{#each topic.keys as key (key)}
							<label class="flex cursor-pointer items-center gap-2 text-sm">
								<input
									type="checkbox"
									checked={has(key)}
									disabled={!canEdit}
									onchange={() => toggle(key)}
								/>
								<span class="text-black dark:text-white">{entryText(key)}</span>
							</label>
						{/each}
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
