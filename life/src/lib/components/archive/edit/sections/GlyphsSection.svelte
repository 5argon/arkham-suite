<!--
@component
TDC "Alien Glyphs": the 26 runes as toggle tiles (rune art + meaning); a learned rune is recorded.
-->
<script lang="ts">
	import { sectionEntries } from '@5argon/arkham-campaign-data';
	import { makeEntry } from '$lib/campaign/records/recorded-state';
	import type { SectionProps } from './types';

	let { log, section, entries, onChange }: SectionProps = $props();

	const glyphs = $derived(sectionEntries(log, section.id).filter((e) => !e.def.hidden));
	const recorded = $derived(new Set(entries.map((e) => e.key)));
	/** Glyphs whose art failed to load; they show a symbol instead. */
	let artFailed = $state(new Set<string>());

	function itemId(key: string) {
		const dot = key.indexOf('.');
		return dot >= 0 ? key.slice(dot + 1) : key;
	}
	function glyphUrl(key: string) {
		return `/image/campaign/glyph/${itemId(key)}.png`;
	}

	function toggle(key: string) {
		if (recorded.has(key)) onChange(entries.filter((e) => e.key !== key));
		else onChange([...entries, makeEntry(section.id, key)]);
	}
</script>

<div class="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
	{#each glyphs as g (g.key)}
		{@const on = recorded.has(g.key)}
		<button
			type="button"
			onclick={() => toggle(g.key)}
			aria-pressed={on}
			class={[
				'flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border p-2 text-center transition',
				on
					? 'border-secondary-400 bg-secondary-500/20 text-black shadow-[0_0_10px] shadow-secondary-500/40 dark:text-white'
					: 'border-primary-300 dark:border-primary-700 text-primary-500 dark:text-primary-400 hover:border-secondary-400 hover:text-black dark:hover:text-white',
			]}
		>
			{#if !artFailed.has(g.key)}
				<img
					src={glyphUrl(g.key)}
					alt={g.en.text}
					class={['h-12 w-12 object-contain', on ? '' : 'opacity-60 grayscale']}
					onerror={() => (artFailed = new Set([...artFailed, g.key]))}
				/>
			{:else}
				<span class="text-2xl leading-none opacity-70">{on ? '✦' : '◇'}</span>
			{/if}
			<span class="text-[0.7rem] leading-tight font-medium">{g.en.text}</span>
		</button>
	{/each}
</div>
