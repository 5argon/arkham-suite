<!--
@component
One campaign-data log section under its sheet title, recorded by the component for its `type`.
-->
<script lang="ts">
	import type { ResolvedLogEntry } from '@5argon/arkham-campaign-data';
	import type { Card } from '@5argon/arkham-kohaku';
	import { SectionSeparator } from '@5argon/arkham-life-ui';
	import { sectionTitle } from '$lib/campaign/records/campaign-log-source';
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
	import type { RosterSectionProps } from './types';

	interface Props extends RosterSectionProps {
		cards: Card[];
		/** Side-story entries offered in notes sections. */
		extraEntries?: ResolvedLogEntry[];
		extraSource?: Map<string, string>;
		/** A standalone archive drops the "Campaign " prefix from section titles. */
		standalone?: boolean;
	}
	let { cards, extraEntries = [], extraSource, standalone = false, ...props }: Props = $props();

	const title = $derived.by(() => {
		const t = sectionTitle(props.log, props.section.id);
		return standalone ? t.replace(/^Campaign /, '') : t;
	});
</script>

<div class="space-y-3">
	<SectionSeparator {title} />

	{#if props.section.type === 'header'}
		<!-- divider only -->
	{:else if props.section.type === 'count'}
		<CounterSection {...props} />
	{:else if props.section.type === 'investigatorCount'}
		<InvestigatorCounterSection {...props} />
	{:else if props.section.type === 'cards'}
		<CardsSection {...props} {cards} />
	{:else if props.section.type === 'checklist' || props.section.type === 'investigatorChecklist'}
		<ChecklistSection {...props} />
	{:else if props.section.type === 'relationship'}
		<RelationshipSection {...props} />
	{:else if props.section.type === 'supplies'}
		<SuppliesSection {...props} />
	{:else if props.section.type === 'scarletKeys'}
		<KeysSection {...props} />
	{:else if props.section.type === 'partner'}
		<PartnerSection {...props} />
	{:else if props.section.type === 'glyphs'}
		<GlyphsSection {...props} />
	{:else if props.section.type === 'seals'}
		<SealsSection {...props} />
	{:else}
		<!-- notes, and any other type as notes -->
		<NotesSection {...props} {extraEntries} {extraSource} />
	{/if}
</div>
