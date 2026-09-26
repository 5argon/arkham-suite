<!--
@component
A `cards` section (earned story assets, sacrificed allies, VIPs): each picked card is recorded as
`"<section>.<code>"`. The pool is the section's item codes when it declares them (PtC VIPs), else
its `cardFilter`, else every card.
-->
<script lang="ts">
	import type { Card, CardCode } from '@5argon/arkham-kohaku';
	import { CardFormMultiple } from '@5argon/arkham-life-ui';
	import * as m from '$lib/paraglide/messages.js';
	import { makeEntry } from '$lib/campaign/records/recorded-state';
	import { cardPoolFor } from '../card-pool';
	import type { SectionProps } from './types';

	let { section, entries, cards, onChange }: SectionProps & { cards: Card[] } = $props();

	const itemCodes = $derived(
		(section.items ?? []).map((it) => it.code).filter((c): c is string => typeof c === 'string')
	);
	const pickable = $derived(
		cardPoolFor(itemCodes.length ? { codes: itemCodes } : section.cardFilter, cards, new Set())
	);

	const prefix = $derived(section.id + '.');
	const selected = $derived(
		entries.map((e) => (e.key.startsWith(prefix) ? e.key.slice(prefix.length) : e.key)) as CardCode[]
	);

	function onSelectionChange(codes: CardCode[]) {
		onChange(codes.map((code) => makeEntry(section.id, prefix + code)));
	}
</script>

<CardFormMultiple
	label={m.archive_logs_card_code_label()}
	cards={pickable}
	selectedCodes={selected}
	{onSelectionChange}
	allowDuplicates={false}
/>
