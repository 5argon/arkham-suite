<!--
@component
The Logs tab: every campaign-data log section, grouped under the sheet's header sections. The chaos
bag is in the General tab.
-->
<script lang="ts">
	import type { Card } from '@5argon/arkham-kohaku';
	import * as m from '$lib/paraglide/messages.js';
	import type { CampaignLog } from '$lib/campaign/records/campaign-log-source';
	import { sectionTitle, visibleSections } from '$lib/campaign/records/campaign-log-source';
	import type { LogSectionDef, ResolvedLogEntry } from '@5argon/arkham-campaign-data';
	import { standaloneScenarios } from '@5argon/arkham-campaign-data';
	import {
		entriesInSection,
		replaceSection,
		standalonesFromLogs,
		type LocalLog
	} from '$lib/campaign/records/recorded-state';
	import { standaloneResolvedEntries } from '$lib/campaign/outcomes/standalone-logs';
	import type { InvestigatorRef } from '$lib/campaign/utils/investigators';
	import SectionDispatch from './sections/SectionDispatch.svelte';
	import CampaignEditNote from './CampaignEditNote.svelte';

	interface Props {
		log: CampaignLog | undefined;
		cards: Card[];
		investigators: InvestigatorRef[];
		localLogs: LocalLog[];
		/** Standalone archive: only the sections holding this scenario's entries. */
		onlyScenario?: string;
		onLogsChange: (next: LocalLog[]) => void;
	}

	let { log, cards, investigators, localLogs, onlyScenario, onLogsChange }: Props = $props();

	const allSections = $derived(log ? visibleSections(log) : []);
	const scenarioSectionIds = $derived.by(() => {
		if (!onlyScenario || !log) return null;
		const ids = new Set<string>();
		for (const e of log.db.entries) if (e.scenario === onlyScenario) ids.add(e.section);
		return ids;
	});
	// Headers pass the scenario filter so their grouping survives.
	const sections = $derived(
		scenarioSectionIds
			? allSections.filter((s) => s.type === 'header' || scenarioSectionIds!.has(s.id))
			: allSections
	);

	// A `header` section (EotE's "The Ice and Death") titles the sections after it; a `major` section
	// (EotE's Expedition Team) starts its own top-level group even when it trails a header.
	interface SectionGroup {
		key: string;
		header: LogSectionDef | null;
		sections: LogSectionDef[];
	}
	const groups = $derived.by((): SectionGroup[] => {
		const out: SectionGroup[] = [];
		let current: SectionGroup = { key: '__top', header: null, sections: [] };
		out.push(current);
		for (const s of sections) {
			if (s.type === 'header') {
				current = { key: s.id, header: s, sections: [] };
				out.push(current);
			} else if (s.major) {
				current = { key: s.id, header: null, sections: [s] };
				out.push(current);
			} else {
				current.sections.push(s);
			}
		}
		return out.filter((g) => g.sections.length > 0);
	});

	function handleSectionChange(sectionId: string, next: LocalLog[]) {
		onLogsChange(replaceSection(localLogs, sectionId, next));
	}

	// Side stories recorded in the Extra tab offer their own entries in the matching section, so they
	// join the ordered log like any stop on the route.
	const standaloneMeta = new Map(standaloneScenarios().map((s) => [s.scenario, s]));
	const standaloneExtra = $derived.by(() => {
		const entriesBySection = new Map<string, ResolvedLogEntry[]>();
		const sourceByKey = new Map<string, string>();
		for (const st of standalonesFromLogs(localLogs)) {
			const meta = standaloneMeta.get(st.standalone);
			if (!meta) continue;
			for (const e of standaloneResolvedEntries(meta.code, st.standalone)) {
				const arr = entriesBySection.get(e.def.section) ?? [];
				if (!arr.some((x) => x.key === e.key)) arr.push(e);
				entriesBySection.set(e.def.section, arr);
				sourceByKey.set(e.key, meta.name);
			}
		}
		return { entriesBySection, sourceByKey };
	});
</script>

<div class="mt-2 max-w-xl space-y-4">
	<CampaignEditNote {log} tab="logs" />
	{#if !log || sections.length === 0}
		<p class="text-primary-400 dark:text-primary-500 text-sm">{m.archive_logs_no_data()}</p>
	{:else}
		{#each groups as group (group.key)}
			{#if group.header}
				<h3
					class="text-primary-900 dark:text-primary-100 border-primary-300 dark:border-primary-600 mt-2 border-b pb-1 text-lg font-bold"
				>
					{sectionTitle(log, group.header.id)}
				</h3>
			{/if}
			<div
				class={group.header
					? 'border-primary-200 dark:border-primary-700 space-y-4 border-l-2 pl-3'
					: 'space-y-4'}
			>
				{#each group.sections as section (section.id)}
					<SectionDispatch
						{log}
						{section}
						{cards}
						{investigators}
						standalone={!!onlyScenario}
						entries={entriesInSection(localLogs, section.id)}
						extraEntries={standaloneExtra.entriesBySection.get(section.id) ?? []}
						extraSource={standaloneExtra.sourceByKey}
						onChange={(next) => handleSectionChange(section.id, next)}
					/>
				{/each}
			</div>
		{/each}
	{/if}
</div>
