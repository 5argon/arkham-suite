<!--
@component
The campaign-log recording surface. Controlled component: the flat editor model
(`localLogs`) is owned by the page (so the achievements tab + validation gate
share the same live state) and bound in here. Renders each campaign-data section
through SectionDispatch; section headings are the verbatim physical-sheet titles.
(The chaos bag — also reserved, not a data section — is edited in the General tab.)
-->
<script lang="ts">
	import type { Card } from '@5argon/arkham-kohaku';
	import * as m from '$lib/paraglide/messages.js';
	import type { CampaignLog } from '$lib/campaign/campaign-log-source';
	import { sectionTitle, visibleSections } from '$lib/campaign/campaign-log-source';
	import type { LogSectionDef, ResolvedLogEntry } from '@5argon/arkham-campaign-data';
	import { standaloneScenarios } from '@5argon/arkham-campaign-data';
	import {
		entriesInSection,
		replaceSection,
		standalonesFromLogs,
		type LocalLog
	} from '$lib/campaign/recorded-state';
	import { standaloneResolvedEntries } from '$lib/campaign/standalone-logs';
	import type { InvestigatorRef } from '$lib/campaign/investigators';
	import SectionDispatch from './sections/SectionDispatch.svelte';
	import TskEditNote from './TskEditNote.svelte';

	interface Props {
		log: CampaignLog | undefined;
		canEdit: boolean;
		cards: Card[];
		investigators: InvestigatorRef[];
		localLogs: LocalLog[];
		/** Autosave callback: receives the next logs after each edit. */
		onLogsChange: (next: LocalLog[]) => void;
	}

	let { log, canEdit, cards, investigators, localLogs, onLogsChange }: Props = $props();

	const sections = $derived(log ? visibleSections(log) : []);

	// campaign-data `header` sections (e.g. EotE's "The Ice and Death") are group
	// titles, not data: each one opens a group whose following sections belong
	// under it (Locations Revealed, Supplies Recovered…). Render those nested
	// under the header instead of flat at the same level. A `major` section breaks
	// back out to the top level even when it trails a header (e.g. EotE's campaign-
	// wide "Expedition Team", which the source lists after "The Heart of Madness").
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

	// Standalones recorded in the Extra tab make their own loggable entries available
	// in the matching section's dropdown here (Campaign Notes), so the player adds
	// them into the ordered log stream — a standalone is a stop on the route. Each
	// carries its source standalone's name (for the "from a standalone" marker).
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
	<TskEditNote {log} tab="logs" />
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
						{canEdit}
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
