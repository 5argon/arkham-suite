<!--
@component
TDC "Alien Glyphs": a fancy clickable toggle grid mirroring the physical glyph
rubbing-sheet. Each of the 26 runes (`glyphs.tdc_rune_a..z`) is a tile showing
its translated meaning (e.g. "Depths"); clicking toggles it "learned" (recorded
as the entry's presence). No rune art exists in the repo yet, so the meaning
label is the tile content — when art lands, drop it behind the label here.
-->
<script lang="ts">
	import { sectionEntries, type CampaignLog, type LogSectionDef } from '@5argon/arkham-campaign-data';
	import { makeEntry, type LocalLog } from '$lib/campaign/recorded-state';

	interface Props {
		log: CampaignLog;
		section: LogSectionDef;
		entries: LocalLog[];
		canEdit: boolean;
		onChange: (next: LocalLog[]) => void;
	}

	let { log, section, entries, canEdit, onChange }: Props = $props();

	const glyphs = $derived(sectionEntries(log, section.id).filter((e) => !e.def.hidden));
	const recorded = $derived(new Set(entries.map((e) => e.key)));
	/** Glyph item ids whose placeholder art failed to load → fall back to a symbol. */
	let artFailed = $state(new Set<string>());

	function itemId(key: string) {
		const dot = key.indexOf('.');
		return dot >= 0 ? key.slice(dot + 1) : key;
	}
	function glyphUrl(key: string) {
		return `/image/campaign/glyph/${itemId(key)}.png`;
	}

	function toggle(key: string) {
		if (!canEdit) return;
		if (recorded.has(key)) onChange(entries.filter((e) => e.key !== key));
		else onChange([...entries, makeEntry(section.id, key)]);
	}
</script>

<div class="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
	{#each glyphs as g (g.key)}
		{@const on = recorded.has(g.key)}
		<button
			type="button"
			disabled={!canEdit}
			onclick={() => toggle(g.key)}
			aria-pressed={on}
			class={[
				'flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border p-2 text-center transition',
				on
					? 'border-secondary-400 bg-secondary-500/20 text-black shadow-[0_0_10px] shadow-secondary-500/40 dark:text-white'
					: 'border-primary-300 dark:border-primary-700 text-primary-500 dark:text-primary-400 hover:border-secondary-400 hover:text-black dark:hover:text-white',
				!canEdit && 'cursor-default opacity-80',
			]}
		>
			{#if !artFailed.has(g.key)}
				<!-- Placeholder glyph cropped from the official TDC rubbing sheet. -->
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
