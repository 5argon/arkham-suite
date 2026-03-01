<!--
@component
A `supplies` section (TFA / RTTFA), recorded per investigator. Each investigator
gets the supply list: non-repeatable supplies are checkboxes, repeatable ones
(Provisions, Medicine) are steppers. Items are keyed
`"<section>.<investigatorCode>.<supplyId>"`; repeatable counts ride in the param.
Cost is shown for reference. Falls back to a single shared list with no roster.
-->
<script lang="ts">
	import type { CampaignLog, LogSectionDef } from '@5argon/arkham-campaign-data';
	import { Button, Checkbox } from '@5argon/arkham-life-ui';
	import { itemLabel } from '$lib/campaign/campaign-log-source';
	import { makeEntry, type LocalLog } from '$lib/campaign/recorded-state';
	import type { InvestigatorRef } from '$lib/campaign/investigators';

	interface Props {
		log: CampaignLog;
		section: LogSectionDef;
		entries: LocalLog[];
		investigators: InvestigatorRef[];
		canEdit: boolean;
		onChange: (next: LocalLog[]) => void;
	}

	let { log, section, entries, investigators, canEdit, onChange }: Props = $props();

	const supplies = $derived(section.items ?? []);
	const slots = $derived(investigators.length ? investigators : [{ code: 'shared', name: 'Supplies' }]);

	function key(invCode: string, supplyId: string) {
		return `${section.id}.${invCode}.${supplyId}`;
	}
	function qty(invCode: string, supplyId: string): number {
		const e = entries.find((x) => x.key === key(invCode, supplyId));
		if (!e) return 0;
		const n = e.args.find((a) => a.type === 'number')?.value;
		return n !== undefined ? Number(n) || 0 : 1; // present-but-no-count = checked (1)
	}

	/** Rebuild the whole section slice from a single (inv, supply) -> qty change. */
	function setQty(invCode: string, supplyId: string, q: number) {
		const next: LocalLog[] = entries.filter((e) => e.key !== key(invCode, supplyId));
		const repeatable = supplies.find((s) => s.id === supplyId)?.repeatable;
		if (q > 0) {
			next.push(
				makeEntry(
					section.id,
					key(invCode, supplyId),
					repeatable ? [{ type: 'number', value: String(q) }] : [],
				),
			);
		}
		onChange(next);
	}
</script>

<div class="flex flex-col gap-4">
	{#each slots as inv (inv.code)}
		<div>
			{#if slots.length > 1}
				<p class="text-primary-600 dark:text-primary-300 mb-1 text-xs font-semibold uppercase">
					{inv.name}
				</p>
			{/if}
			<div class="flex flex-wrap items-center gap-2">
				{#each supplies as s (s.id)}
					{@const q = qty(inv.code, s.id)}
					{@const costLabel = s.cost != null ? ` (${s.cost})` : ''}
					{#if s.repeatable}
						<div
							class={[
								'flex items-center gap-1 rounded-full border px-2 py-0.5',
								q > 0 ? 'border-secondary-400' : 'border-primary-300 dark:border-primary-700',
							]}
						>
							<span class="text-sm">{itemLabel(log, s.id)}{costLabel}</span>
							{#if canEdit}
								<Button label="−" onClick={() => setQty(inv.code, s.id, q - 1)} />
							{/if}
							<span class="min-w-5 text-center text-sm font-bold tabular-nums">{q}</span>
							{#if canEdit}
								<Button label="+" onClick={() => setQty(inv.code, s.id, q + 1)} />
							{/if}
						</div>
					{:else}
						<Checkbox
							label={`${itemLabel(log, s.id)}${costLabel}`}
							checked={q > 0}
							onChange={() => setQty(inv.code, s.id, q > 0 ? 0 : 1)}
						/>
					{/if}
				{/each}
			</div>
		</div>
	{/each}
</div>
