<!--
@component
A campaign-wide `count` section (Yig's Fury, Time Passed, Doubt, …): one entry keyed by the
section id. Sitting at a zero minimum records nothing.
-->
<script lang="ts">
	import { firstNumber, makeEntry } from '$lib/campaign/records/recorded-state';
	import NumberField from '../NumberField.svelte';
	import type { SectionProps } from './types';

	let { section, entries, onChange }: SectionProps = $props();

	const min = $derived(section.min ?? 0);
	const max = $derived(section.max ?? Number.POSITIVE_INFINITY);
	const value = $derived(entries[0] ? (firstNumber(entries[0].args) ?? min) : null);

	function commit(n: number | null) {
		const v = n ?? min;
		onChange(
			v === 0 && min === 0 ? [] : [makeEntry(section.id, section.id, [{ type: 'number', value: String(v) }])]
		);
	}
</script>

<div class="max-w-28">
	<NumberField
		label={Number.isFinite(max) ? `${min}–${max}` : `min ${min}`}
		{value}
		{min}
		{max}
		placeholder={String(min)}
		onCommit={commit}
	/>
</div>
