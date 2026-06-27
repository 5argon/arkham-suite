<!--
@component
Shared PtC helper — a list of cards (by code), each a CardLine, with a trailing column. Used by every
PtC "cards collected across plays" stat: Black Stars Rise / Pallid Mask random weaknesses, Dim Carcosa
possessed investigators, Last King slain VIPs, Unspeakable Oath insanity. The caller owns ordering +
capping. Built on the shared CardLineList.

The trailing column composes (left → right): a `×count` (when > 1), the card's traits (when
`showTrait`), the play's finish `date` (when `showDate` — the weakness lists are a chronological
newest-first log, so each row shows when it was drawn), and the `bearer` — the investigator who drew
it — as a CardStrip. The bearer is already scoped to the viewed subject in the precompute, so a
single-player profile shows only its own and a play-group profile merges every member's. A row's
`code` may repeat across a date list (one weakness drawn in several plays); CardLineList keys by index.
-->
<script lang="ts">
	import { CardStrip } from '@5argon/arkham-life-ui';
	import { getAllCards } from '$lib/card-data';
	import CardLineList from '$lib/components/profile/_primitives/CardLineList.svelte';
	import FinishDate from '$lib/components/profile/_primitives/FinishDate.svelte';

	let {
		items,
		/** Show each card's traits (before the date / bearer) — the random-weakness lists are drawn from a
		 *  fixed trait pool, so the trait says which pool it came from. Filtered to `traitFilter` when given. */
		showTrait = false,
		/** Restrict the shown traits to this set — the scenario's random-weakness pool (e.g. Madness / Pact /
		 *  Cultist / Detective). A drawn weakness keeps its unrelated traits (Humanoid, Silver Twilight…), so
		 *  without this the column is noisy; filtering leaves only the pool membership that made it drawable. */
		traitFilter,
		/** Show each row's play finish `date` — for the chronological (newest-first) weakness lists. */
		showDate = false
	}: {
		items: { code: string; count?: number; bearer?: string; date?: number | null }[];
		showTrait?: boolean;
		traitFilter?: string[];
		showDate?: boolean;
	} = $props();

	const byCode = new Map(getAllCards().map((c) => [c.code, c]));
</script>

<CardLineList {items} align="right">
	{#snippet trailing(it)}
		{@const bearerCard = it.bearer ? byCode.get(it.bearer) : undefined}
		{@const cardTraits = showTrait ? (byCode.get(it.code)?.traits ?? []) : []}
		{@const traits = traitFilter ? cardTraits.filter((t) => traitFilter.includes(t)) : cardTraits}
		{@const count = it.count ?? 0}
		{#if count > 1 || traits.length || showDate || bearerCard}
			<span class="inline-flex items-center justify-end gap-2">
				{#if count > 1}<span class="tabular-nums">×{count}</span>{/if}
				{#if traits.length}
					<span class="text-primary-500 text-xs whitespace-nowrap">{traits.join(' · ')}</span>
				{/if}
				{#if showDate}<FinishDate ms={it.date ?? null} />{/if}
				{#if bearerCard}<CardStrip card={bearerCard} />{/if}
			</span>
		{/if}
	{/snippet}
</CardLineList>
