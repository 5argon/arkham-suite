<!--
@component
A `supplies` section (TFA / RTTFA) per investigator: checkboxes for single supplies, counters for
repeatable ones (Provisions, Medicine). Keyed `"<section>.<investigatorCode>.<supplyId>"`; one
shared list without a roster.
-->
<script lang="ts">
	import { CardLine, Checkbox } from '@5argon/arkham-life-ui';
	import * as m from '$lib/paraglide/messages.js';
	import { cardByCode } from '$lib/card-data';
	import { itemLabel } from '$lib/campaign/records/campaign-log-source';
	import { firstNumber, makeEntry } from '$lib/campaign/records/recorded-state';
	import Stepper from '../Stepper.svelte';
	import type { RosterSectionProps } from './types';

	let { log, section, entries, investigators, onChange }: RosterSectionProps = $props();

	const supplies = $derived(section.items ?? []);
	const slots = $derived(
		investigators.length ? investigators : [{ code: 'shared', name: m.archive_supplies_shared() }]
	);

	const key = (invCode: string, supplyId: string) => `${section.id}.${invCode}.${supplyId}`;
	function qty(invCode: string, supplyId: string): number {
		const e = entries.find((x) => x.key === key(invCode, supplyId));
		if (!e) return 0;
		// A single supply records presence only.
		return firstNumber(e.args) ?? 1;
	}

	function setQty(invCode: string, supplyId: string, q: number) {
		const next = entries.filter((e) => e.key !== key(invCode, supplyId));
		const repeatable = supplies.find((s) => s.id === supplyId)?.repeatable;
		if (q > 0) {
			next.push(
				makeEntry(
					section.id,
					key(invCode, supplyId),
					repeatable ? [{ type: 'number', value: String(q) }] : []
				)
			);
		}
		onChange(next);
	}
</script>

<div class="flex flex-col gap-4">
	{#each slots as inv (inv.code)}
		<div>
			{#if slots.length > 1}
				{@const invCard = cardByCode(inv.code)}
				{#if invCard}
					<div class="mb-1"><CardLine card={invCard} hideQuantity /></div>
				{:else}
					<p class="text-primary-600 dark:text-primary-300 mb-1 text-xs font-semibold uppercase">
						{inv.name}
					</p>
				{/if}
			{/if}
			<div class="flex flex-wrap items-center gap-2">
				{#each supplies as s (s.id)}
					{@const q = qty(inv.code, s.id)}
					{@const label = s.cost != null ? `${itemLabel(log, s.id)} (${s.cost})` : itemLabel(log, s.id)}
					{#if s.repeatable}
						<div
							class={[
								'flex items-center gap-1 rounded-full border px-2 py-0.5',
								q > 0 ? 'border-secondary-400' : 'border-primary-300 dark:border-primary-700'
							]}
						>
							<span class="text-sm text-black dark:text-white">{label}</span>
							<Stepper value={q} onChange={(v) => setQty(inv.code, s.id, v)} />
						</div>
					{:else}
						<Checkbox
							{label}
							checked={q > 0}
							onChange={() => setQty(inv.code, s.id, q > 0 ? 0 : 1)}
						/>
					{/if}
				{/each}
			</div>
		</div>
	{/each}
</div>
