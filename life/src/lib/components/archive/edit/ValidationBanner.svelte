<!--
@component
Shows recording conflicts (from findValidatorConflicts) as error cards: mutually-exclusive story
branches recorded together, and the same card recorded in two sections that must stay disjoint
(e.g. a cultist logged as both Interrogated and Got Away). Each is resolved to its sheet text /
card name and hints the scenario the decision belongs to. While any conflict exists Save is
disabled.
-->
<script lang="ts">
	import type { CampaignLog, ValidatorConflict } from '@5argon/arkham-campaign-data';
	import { createCardResolver } from '$lib/card-data';

	interface Props {
		log: CampaignLog;
		conflicts: ValidatorConflict[];
	}

	let { log, conflicts }: Props = $props();

	const entryText = $derived(new Map(log.db.entries.map((e) => [`${e.section}.${e.id}`, e])));
	const cardResolver = createCardResolver();

	function text(key: string): string {
		const def = entryText.get(key);
		if (!def) return key;
		return (log.en.entries[key]?.text ?? key).replace(/<\/?[ib]>/g, '').replace(/\[[a-z_]+\]/g, '');
	}
	function humanize(code: string): string {
		return code.replace(/^\d+[a-z]?_/, '').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
	}
	function sectionLabel(id: string): string {
		return log.en.sections?.[id] ?? humanize(id);
	}
	function cardName(code: string): string {
		try {
			return cardResolver.resolve(code)?.name ?? code;
		} catch {
			return code;
		}
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
				{#if conflict.type === 'disjointSections'}
					<p class="mt-1 text-xs text-red-600 dark:text-red-400">
						Recorded in both {conflict.sections.map(sectionLabel).join(' and ')} — keep each card in
						only one:
					</p>
					<ul class="mt-1 list-disc pl-5 text-sm text-black dark:text-white">
						{#each conflict.cards as code (code)}
							<li>{cardName(code)}</li>
						{/each}
					</ul>
				{:else}
					<p class="mt-1 text-xs text-red-600 dark:text-red-400">
						These are mutually exclusive; keep only one:
					</p>
					<ul class="mt-1 list-disc pl-5 text-sm text-black dark:text-white">
						{#each conflict.entries.filter((k) => entryText.has(k)) as key (key)}
							<li>{text(key)}</li>
						{/each}
					</ul>
				{/if}
			</div>
		{/each}
	</div>
{/if}
