<!--
@component
Recording conflicts from `findValidatorConflicts`: mutually exclusive story branches recorded
together, or one card recorded in two sections that must stay disjoint (a cultist both Interrogated
and Got Away), with the scenario the decision belongs to.
-->
<script lang="ts">
	import type { CampaignLog, ValidatorConflict } from '@5argon/arkham-campaign-data';
	import * as m from '$lib/paraglide/messages.js';
	import { resolveCardOrNull } from '$lib/card-data';
	import { deslugScenario } from '$lib/campaign/stats/extra-imports';
	import { scenarioTitle } from './scenario-title';

	let { log, conflicts }: { log: CampaignLog; conflicts: ValidatorConflict[] } = $props();

	const knownKeys = $derived(new Set(log.db.entries.map((e) => `${e.section}.${e.id}`)));

	const entryText = (key: string) =>
		(log.en.entries[key]?.text ?? key).replace(/<\/?[ib]>/g, '').replace(/\[[a-z_]+\]/g, '');
	const sectionLabel = (id: string) => log.en.sections?.[id] ?? deslugScenario(id);
	const cardName = (code: string) => resolveCardOrNull(code)?.name ?? code;
</script>

{#if conflicts.length}
	<div class="space-y-2">
		{#each conflicts as conflict, i (i)}
			<div class="rounded border border-red-400 bg-red-50 p-3 dark:bg-red-950/40">
				<p class="text-sm font-semibold text-red-700 dark:text-red-300">
					{m.archive_conflict_title()}{#if conflict.scenario}
						<span class="font-normal"> — {scenarioTitle(log, conflict.scenario)}</span>{/if}
				</p>
				{#if conflict.type === 'disjointSections'}
					<p class="mt-1 text-xs text-red-600 dark:text-red-400">
						{m.archive_conflict_disjoint({ sections: conflict.sections.map(sectionLabel).join(' and ') })}
					</p>
					<ul class="mt-1 list-disc pl-5 text-sm text-black dark:text-white">
						{#each conflict.cards as code (code)}
							<li>{cardName(code)}</li>
						{/each}
					</ul>
				{:else}
					<p class="mt-1 text-xs text-red-600 dark:text-red-400">{m.archive_conflict_exclusive()}</p>
					<ul class="mt-1 list-disc pl-5 text-sm text-black dark:text-white">
						{#each conflict.entries.filter((k) => knownKeys.has(k)) as key (key)}
							<li>{entryText(key)}</li>
						{/each}
					</ul>
				{/if}
			</div>
		{/each}
	</div>
{/if}
