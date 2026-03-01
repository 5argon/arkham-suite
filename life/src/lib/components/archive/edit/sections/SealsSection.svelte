<!--
@component
EotE "Seals Placed" / "Seals Recovered": the five Act-glyph seals (seal_a..seal_e)
shown as their token art and toggled on/off by clicking — far friendlier than the
generic notes dropdown, whose entries are unsearchable glyph icons. Each lit seal
is a recorded entry keyed `"<section>.<sealId>"`. The same component drives both
the placed and recovered sections (each an independent set of toggles).
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

	const seals = $derived(sectionEntries(log, section.id).filter((e) => !e.def.hidden));
	const recorded = $derived(new Set(entries.map((e) => e.key)));
	/** Seal item ids whose art failed to load → fall back to the letter. */
	let artFailed = $state(new Set<string>());

	/** entry key `seals_placed.seal_c` → seal id `seal_c`. */
	function sealId(key: string): string {
		return key.slice(key.indexOf('.') + 1);
	}
	/** `seal_a`..`seal_e` → 1..5 (the bespoke seal images the user supplied). */
	function sealNumber(key: string): number {
		return (sealId(key).split('_').pop() ?? 'a').charCodeAt(0) - 96;
	}
	function sealImg(key: string): string {
		return `/campaign/eote/seal${sealNumber(key)}.png`;
	}
	function sealLetter(key: string): string {
		return (sealId(key).split('_').pop() ?? 'a').toUpperCase();
	}
	const sealLabel = (key: string) => `Seal ${sealLetter(key)}`;

	function toggle(key: string) {
		if (!canEdit) return;
		if (recorded.has(key)) onChange(entries.filter((e) => e.key !== key));
		else onChange([...entries, makeEntry(section.id, key)]);
	}
</script>

<div class="flex flex-wrap gap-3">
	{#each seals as s (s.key)}
		{@const on = recorded.has(s.key)}
		<button
			type="button"
			disabled={!canEdit}
			onclick={() => toggle(s.key)}
			aria-pressed={on}
			aria-label={sealLabel(s.key)}
			title={sealLabel(s.key)}
			class={[
				'flex h-24 w-20 items-center justify-center rounded-lg border p-1 transition',
				canEdit ? 'cursor-pointer' : 'cursor-default opacity-80',
				on
					? 'border-secondary-400 bg-secondary-500/15 shadow-[0_0_12px] shadow-secondary-500/40'
					: 'border-primary-300 dark:border-primary-700 hover:border-secondary-400',
			]}
		>
			{#if !artFailed.has(s.key)}
				<img
					src={sealImg(s.key)}
					alt={sealLabel(s.key)}
					class={['h-20 w-16 object-contain transition', on ? '' : 'opacity-30 grayscale']}
					onerror={() => (artFailed = new Set([...artFailed, s.key]))}
				/>
			{:else}
				<span class={['text-2xl font-bold', on ? 'text-secondary-500' : 'text-primary-400']}
					>{sealLetter(s.key)}</span
				>
			{/if}
		</button>
	{/each}
</div>
