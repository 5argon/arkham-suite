<!--
@component
One card box per campaign investigator for a `cards` choice with a bearer list (e.g. PtC's random
weakness and who drew it). Pairs recorded against an investigator outside the roster are kept and
listed.
-->
<script lang="ts">
	import type { Card } from '@5argon/arkham-kohaku';
	import { CardFormSingle, CardLine } from '@5argon/arkham-life-ui';
	import * as m from '$lib/paraglide/messages.js';
	import { decodeCardPairs, encodeCardPairs } from '$lib/campaign/records/extra-fields';
	import type { InvestigatorRef } from '$lib/campaign/utils/investigators';

	interface Props {
		investigators: InvestigatorRef[];
		/** The pickable pool. */
		cards: Card[];
		cardCsv: string;
		investigatorCsv: string;
		onChange: (cardCsv: string, investigatorCsv: string) => void;
	}
	let { investigators, cards, cardCsv, investigatorCsv, onChange }: Props = $props();

	const byCode = $derived(new Map(cards.map((c) => [c.code, c])));
	const rosterCodes = $derived(new Set(investigators.map((i) => i.code)));
	/** Investigator → card. */
	const assigned = $derived(decodeCardPairs(cardCsv, investigatorCsv));
	const orphans = $derived([...assigned].filter(([inv]) => !rosterCodes.has(inv)));

	function write(next: Map<string, string>) {
		const { cards, investigators } = encodeCardPairs(next);
		onChange(cards, investigators);
	}
	function clear(inv: string) {
		const next = new Map(assigned);
		next.delete(inv);
		write(next);
	}
</script>

{#if investigators.length}
	<div class="space-y-2">
		{#each investigators as inv (inv.code)}
			{@const code = assigned.get(inv.code)}
			{@const card = code ? byCode.get(code) : null}
			<div class="border-primary-100 dark:border-primary-800 rounded border p-2">
				{#if !card}
					<CardFormSingle
						label={inv.name}
						{cards}
						placeholder="—"
						selectedCard={null}
						onSelect={(c) => write(new Map(assigned).set(inv.code, c.code))}
					/>
				{:else}
					<p class="text-primary-500 text-xs">{inv.name}</p>
					<div class="mt-1 flex items-center justify-between gap-2">
						<CardLine {card} hideQuantity />
						<button
							type="button"
							class="text-primary-400 hover:text-error-500 shrink-0 text-xs"
							onclick={() => clear(inv.code)}>× {m.archive_logs_remove()}</button
						>
					</div>
				{/if}
			</div>
		{/each}
	</div>
{:else}
	<p class="text-primary-500 text-sm italic">{m.archive_extra_picker_no_decks()}</p>
{/if}

{#if orphans.length}
	<div class="text-primary-500 mt-2 space-y-0.5 text-xs">
		{#each orphans as [inv, code] (inv)}
			<p>
				{byCode.get(code)?.name ?? code}
				<span class="text-primary-400">{m.archive_extra_picker_not_in_roster()}</span>
			</p>
		{/each}
	</div>
{/if}
