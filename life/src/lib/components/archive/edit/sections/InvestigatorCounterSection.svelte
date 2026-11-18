<!--
@component
An `investigatorCount` section (TDC Task Progress, FHV curse count): one counter per investigator,
keyed `"<section>.<investigatorCode>"`, or one shared counter without a roster.
-->
<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import { firstNumber, makeEntry, type LocalLog } from '$lib/campaign/records/recorded-state';
	import Stepper from '../Stepper.svelte';
	import type { RosterSectionProps } from './types';

	let { section, entries, investigators, onChange }: RosterSectionProps = $props();

	const min = $derived(section.min ?? 0);
	const max = $derived(section.max);
	const slots = $derived(
		investigators.length ? investigators : [{ code: 'all', name: m.archive_all_investigators() }]
	);

	const key = (code: string) => `${section.id}.${code}`;
	function count(code: string): number {
		const e = entries.find((x) => x.key === key(code));
		return (e && firstNumber(e.args)) || min;
	}
	function set(code: string, v: number) {
		const next: LocalLog[] = [];
		for (const s of slots) {
			const n = s.code === code ? Math.max(min, Math.min(max ?? Infinity, v)) : count(s.code);
			if (n > 0) next.push(makeEntry(section.id, key(s.code), [{ type: 'number', value: String(n) }]));
		}
		onChange(next);
	}
</script>

<div class="flex flex-col gap-2">
	{#each slots as inv (inv.code)}
		<div class="flex items-center gap-3">
			<span class="w-40 shrink-0 truncate text-sm text-black dark:text-white">{inv.name}</span>
			<Stepper value={count(inv.code)} {min} {max} onChange={(v) => set(inv.code, v)} />
		</div>
	{/each}
</div>
