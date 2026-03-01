<!--
@component
Shows mutually-exclusive log conflicts (from findValidatorConflicts) as error
cards, resolving each entry key to its sheet text and hinting the scenario the
decision belongs to. While any conflict exists the page disables Save.
-->
<script lang="ts">
	import type { CampaignLog, LogValidator } from '@5argon/arkham-campaign-data';

	interface Props {
		log: CampaignLog;
		conflicts: LogValidator[];
	}

	let { log, conflicts }: Props = $props();

	const entryText = $derived(new Map(log.db.entries.map((e) => [`${e.section}.${e.id}`, e])));

	function text(key: string): string {
		const def = entryText.get(key);
		if (!def) return key;
		return (log.en.entries[key]?.text ?? key).replace(/<\/?[ib]>/g, '').replace(/\[[a-z_]+\]/g, '');
	}
	function humanize(code: string): string {
		return code.replace(/^\d+[a-z]?_/, '').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
	}
</script>

{#if conflicts.length}
	<div class="space-y-2">
		{#each conflicts as conflict, i (i)}
			<div class="rounded border border-red-400 bg-red-50 p-3 dark:bg-red-950/40">
				<p class="text-sm font-semibold text-red-700 dark:text-red-300">
					Conflicting choices recorded{#if conflict.scenario}
						<span class="font-normal"> — {humanize(conflict.scenario)}</span>{/if}
				</p>
				<p class="mt-1 text-xs text-red-600 dark:text-red-400">
					These are mutually exclusive; keep only one:
				</p>
				<ul class="mt-1 list-disc pl-5 text-sm text-black dark:text-white">
					{#each conflict.entries.filter((k) => entryText.has(k)) as key (key)}
						<li>{text(key)}</li>
					{/each}
				</ul>
			</div>
		{/each}
	</div>
{/if}
