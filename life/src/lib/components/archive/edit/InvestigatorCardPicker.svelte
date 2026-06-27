<!--
@component
Per-investigator card assignment for the Extra tab — replaces a pair of position-matched card
pickers (e.g. PtC's random-weakness list + "investigator who drew each") with one roster-driven
control: a row per campaign investigator, each a single-card browse box. Picking a card for an
investigator adds that pairing; clearing removes it. The two underlying choice values stay
index-paired (card[i] ↔ investigator[i]) so the precompute is unchanged. Any pairing already
recorded against a non-roster investigator is preserved untouched.
-->
<script lang="ts">
	import type { Card } from '@5argon/arkham-kohaku';
	import { CardFormSingle, CardLine } from '@5argon/arkham-life-ui';
	import type { InvestigatorRef } from '$lib/campaign/utils/investigators';

	let {
		investigators,
		cards,
		cardCsv,
		investigatorCsv,
		canEdit,
		placeholder = '—',
		onChange
	}: {
		investigators: InvestigatorRef[];
		/** The pickable pool (already filtered to the choice's cardFilter). */
		cards: Card[];
		/** Current card codes (comma-joined), paired by index with `investigatorCsv`. */
		cardCsv: string;
		investigatorCsv: string;
		canEdit: boolean;
		placeholder?: string;
		onChange: (cardCsv: string, investigatorCsv: string) => void;
	} = $props();

	const byCode = $derived(new Map(cards.map((c) => [c.code, c])));
	const rosterCodes = $derived(new Set(investigators.map((i) => i.code)));

	// Current pairings: investigator code → card code (paired by index; last write wins if an
	// investigator somehow appears twice — one draw per investigator is the norm).
	const assigned = $derived.by(() => {
		const cs = cardCsv.split(',').filter(Boolean);
		const is = investigatorCsv.split(',').filter(Boolean);
		const m = new Map<string, string>();
		is.forEach((inv, i) => {
			if (cs[i]) m.set(inv, cs[i]);
		});
		return m;
	});

	function write(next: Map<string, string>) {
		const inv: string[] = [];
		const card: string[] = [];
		for (const [i, c] of next) {
			inv.push(i);
			card.push(c);
		}
		onChange(card.join(','), inv.join(','));
	}
	function set(inv: string, cardCode: string) {
		write(new Map(assigned).set(inv, cardCode));
	}
	function clear(inv: string) {
		const next = new Map(assigned);
		next.delete(inv);
		write(next);
	}

	// Pairings recorded against investigators NOT in the roster — shown read-only so they aren't lost
	// (e.g. recorded before the deck was added, or a guest investigator).
	const orphans = $derived(
		[...assigned].filter(([inv]) => !rosterCodes.has(inv)).map(([inv, card]) => ({ inv, card }))
	);
</script>

{#if investigators.length}
	<div class="space-y-2">
		{#each investigators as inv (inv.code)}
			{@const code = assigned.get(inv.code)}
			{@const card = code ? byCode.get(code) : null}
			<div class="border-primary-100 dark:border-primary-800 rounded border p-2">
				{#if canEdit && !card}
					<!-- Empty: the search box. Once a card is picked it collapses to the CardLine below
					     (re-appearing only after Remove), so a filled list stays compact. -->
					<CardFormSingle
						label={inv.name}
						{cards}
						{placeholder}
						selectedCard={null}
						onSelect={(c) => set(inv.code, c.code)}
					/>
				{:else}
					<p class="text-primary-500 text-xs">{inv.name}</p>
					{#if card}
						<div class="mt-1 flex items-center justify-between gap-2">
							<CardLine {card} hideQuantity />
							{#if canEdit}
								<button
									type="button"
									class="text-primary-400 hover:text-error-500 shrink-0 text-xs"
									onclick={() => clear(inv.code)}>× Remove</button
								>
							{/if}
						</div>
					{:else}
						<p class="text-primary-700 dark:text-primary-300">—</p>
					{/if}
				{/if}
			</div>
		{/each}
	</div>
{:else}
	<p class="text-primary-500 text-sm italic">
		Record this campaign's investigator decks to assign each drawn card to who drew it.
	</p>
{/if}

{#if orphans.length}
	<div class="text-primary-500 mt-2 space-y-0.5 text-xs">
		{#each orphans as o (o.inv)}
			<p>{byCode.get(o.card)?.name ?? o.card} <span class="text-primary-400">(not in roster)</span></p>
		{/each}
	</div>
{/if}
