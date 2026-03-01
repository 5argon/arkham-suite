<!--
@component
An `investigatorCount` section — a per-investigator tally (TDC "Task progress",
FHV hidden curse count). One stepper per investigator, keyed
`"<section>.<investigatorCode>"`. With no investigator roster available it falls
back to a single shared counter.
-->
<script lang="ts">
	import type { CampaignLog, LogSectionDef } from '@5argon/arkham-campaign-data';
	import { Button } from '@5argon/arkham-life-ui';
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

	let { section, entries, investigators, canEdit, onChange }: Props = $props();

	const min = $derived(section.min ?? 0);
	const max = $derived(section.max ?? Number.POSITIVE_INFINITY);
	const slots = $derived(
		investigators.length ? investigators : [{ code: 'all', name: 'All Investigators' }],
	);

	function key(code: string) {
		return `${section.id}.${code}`;
	}
	function count(code: string): number {
		const e = entries.find((x) => x.key === key(code));
		return Number(e?.args.find((a) => a.type === 'number')?.value ?? min) || min;
	}
	function set(code: string, v: number) {
		const clamped = Math.max(min, Math.min(max, v));
		const counts = new Map(slots.map((s) => [s.code, count(s.code)]));
		counts.set(code, clamped);
		const next: LocalLog[] = [];
		for (const [c, n] of counts) {
			if (n > 0) next.push(makeEntry(section.id, key(c), [{ type: 'number', value: String(n) }]));
		}
		onChange(next);
	}
</script>

<div class="flex flex-col gap-2">
	{#each slots as inv (inv.code)}
		{@const c = count(inv.code)}
		<div class="flex items-center gap-3">
			<span class="w-40 shrink-0 truncate text-sm text-black dark:text-white">{inv.name}</span>
			{#if canEdit}
				<Button label="−" onClick={() => set(inv.code, c - 1)} />
			{/if}
			<span class="min-w-8 text-center text-lg font-bold tabular-nums">{c}</span>
			{#if canEdit}
				<Button label="+" onClick={() => set(inv.code, c + 1)} />
			{/if}
		</div>
	{/each}
</div>
