<!--
@component
Routes a campaign-data section to its recording component by `type`. The heading
is always the verbatim physical-sheet title (`en.sections[id]`) so the on-screen
section lines up one-to-one with the paper sheet.
-->
<script lang="ts">
	import type { CampaignLog, LogSectionDef, ResolvedLogEntry } from '@5argon/arkham-campaign-data';
	import type { Card } from '@5argon/arkham-kohaku';
	import { SectionSeparator } from '@5argon/arkham-life-ui';
	import { sectionTitle } from '$lib/campaign/campaign-log-source';
	import type { LocalLog } from '$lib/campaign/recorded-state';
	import type { InvestigatorRef } from '$lib/campaign/investigators';
	import NotesSection from './NotesSection.svelte';
	import CounterSection from './CounterSection.svelte';
	import InvestigatorCounterSection from './InvestigatorCounterSection.svelte';
	import CardsSection from './CardsSection.svelte';
	import ChecklistSection from './ChecklistSection.svelte';
	import RelationshipSection from './RelationshipSection.svelte';
	import SuppliesSection from './SuppliesSection.svelte';
	import KeysSection from './KeysSection.svelte';
	import PartnerSection from './PartnerSection.svelte';
	import GlyphsSection from './GlyphsSection.svelte';
	import SealsSection from './SealsSection.svelte';

	interface Props {
		log: CampaignLog;
		section: LogSectionDef;
		entries: LocalLog[];
		cards: Card[];
		investigators: InvestigatorRef[];
		canEdit: boolean;
		onChange: (next: LocalLog[]) => void;
		/** Extra entries offered in the dropdown from recorded standalones (notes only). */
		extraEntries?: ResolvedLogEntry[];
		/** Standalone source name per extra-entry key (for the marker). */
		extraSource?: Map<string, string>;
	}

	let {
		log,
		section,
		entries,
		cards,
		investigators,
		canEdit,
		onChange,
		extraEntries = [],
		extraSource,
	}: Props = $props();

	const title = $derived(sectionTitle(log, section.id));
</script>

<div class="space-y-3">
	<SectionSeparator {title} />

	{#if section.type === 'header'}
		<!-- divider only -->
	{:else if section.type === 'notes'}
		<NotesSection {log} {section} {entries} {canEdit} {onChange} {extraEntries} {extraSource} />
	{:else if section.type === 'count'}
		<CounterSection {log} {section} {entries} {canEdit} {onChange} />
	{:else if section.type === 'investigatorCount'}
		<InvestigatorCounterSection {log} {section} {entries} {investigators} {canEdit} {onChange} />
	{:else if section.type === 'cards'}
		<CardsSection {log} {section} {entries} {cards} {canEdit} {onChange} />
	{:else if section.type === 'checklist' || section.type === 'investigatorChecklist'}
		<ChecklistSection {log} {section} {entries} {canEdit} {onChange} />
	{:else if section.type === 'relationship'}
		<RelationshipSection {log} {section} {entries} {canEdit} {onChange} />
	{:else if section.type === 'supplies'}
		<SuppliesSection {log} {section} {entries} {investigators} {canEdit} {onChange} />
	{:else if section.type === 'scarletKeys'}
		<KeysSection {log} {section} {entries} {investigators} {canEdit} {onChange} />
	{:else if section.type === 'partner'}
		<PartnerSection {log} {section} {entries} {cards} {canEdit} {onChange} />
	{:else if section.type === 'glyphs'}
		<GlyphsSection {log} {section} {entries} {canEdit} {onChange} />
	{:else if section.type === 'seals'}
		<SealsSection {log} {section} {entries} {canEdit} {onChange} />
	{:else}
		<!-- calendar or any future type: render valid entries as a notes-style fallback -->
		<NotesSection {log} {section} {entries} {canEdit} {onChange} />
	{/if}
</div>
