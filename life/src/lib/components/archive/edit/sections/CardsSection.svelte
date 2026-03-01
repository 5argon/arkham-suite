<!--
@component
A `cards` section — earned story assets / sacrificed allies / VIPs (notz, dwl,
ptc). Cards are chosen via the shared `CardFormMultiple` picker; each selected
card is recorded keyed `"<section>.<code>"`. When the section declares specific
item codes (e.g. PTC VIPs), the picker is restricted to those; otherwise it
offers the full searchable card list.
-->
<script lang="ts">
	import type { Card, CardCode } from '@5argon/arkham-kohaku';
	import type { CampaignLog, LogSectionDef } from '@5argon/arkham-campaign-data';
	import { CardFormMultiple } from '@5argon/arkham-life-ui';
	import * as m from '$lib/paraglide/messages.js';
	import { makeEntry, type LocalLog } from '$lib/campaign/recorded-state';

	interface Props {
		log: CampaignLog;
		section: LogSectionDef;
		entries: LocalLog[];
		cards: Card[];
		canEdit: boolean;
		onChange: (next: LocalLog[]) => void;
	}

	let { section, entries, cards, canEdit, onChange }: Props = $props();

	/**
	 * Narrow the pickable pool, most-specific first:
	 *  1. declared item codes (e.g. PTC VIPs) — an exact whitelist;
	 *  2. a `cardFilter` (trait/code query mirroring ArkhamCards' `card_choice`,
	 *     e.g. dwl "Sacrificed to Yog-Sothoth" → Ally-trait cards);
	 *  3. otherwise the whole searchable card pool.
	 */
	const itemCodes = $derived(
		new Set(
			(section.items ?? [])
				.map((it) => it.code)
				.filter((c): c is string => typeof c === 'string'),
		),
	);
	const pickable = $derived.by(() => {
		if (itemCodes.size) return cards.filter((c) => itemCodes.has(c.code));
		const filter = section.cardFilter;
		if (filter) {
			const traits = filter.traits?.map((t) => t.toLowerCase());
			const codes = filter.codes ? new Set(filter.codes) : undefined;
			return cards.filter(
				(c) =>
					codes?.has(c.code) ||
					(traits && c.traits?.some((t) => traits.includes(t.toLowerCase()))),
			);
		}
		return cards;
	});

	function codeOf(entry: LocalLog): string {
		const prefix = section.id + '.';
		return entry.key.startsWith(prefix) ? entry.key.slice(prefix.length) : entry.key;
	}
	const selected = $derived(entries.map(codeOf) as CardCode[]);

	function onSelectionChange(codes: CardCode[]) {
		onChange(codes.map((code) => makeEntry(section.id, `${section.id}.${code}`)));
	}
</script>

{#if canEdit}
	<CardFormMultiple
		label={m.archive_logs_card_code_label()}
		cards={pickable}
		selectedCodes={selected}
		{onSelectionChange}
		allowDuplicates={false}
	/>
{:else if selected.length === 0}
	<p class="text-primary-400 dark:text-primary-500 text-sm">{m.archive_logs_empty()}</p>
{:else}
	<p class="text-sm text-black dark:text-white">{selected.join(', ')}</p>
{/if}
