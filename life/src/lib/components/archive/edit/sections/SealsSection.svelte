<!--
@component
EotE "Seals Placed" / "Seals Recovered": the five seals as toggleable token art (their notes entries
are glyph-only text, unsearchable in a dropdown).
-->
<script lang="ts">
	import { sectionEntries } from '@5argon/arkham-campaign-data';
	import * as m from '$lib/paraglide/messages.js';
	import { makeEntry } from '$lib/campaign/records/recorded-state';
	import type { SectionProps } from './types';

	let { log, section, entries, onChange }: SectionProps = $props();

	const seals = $derived(sectionEntries(log, section.id).filter((e) => !e.def.hidden));
	const recorded = $derived(new Set(entries.map((e) => e.key)));
	/** Seals whose art failed to load; they show their letter instead. */
	let artFailed = $state(new Set<string>());

	/** `seals_placed.seal_c` → `c`. */
	const sealLetter = (key: string) => key.slice(key.lastIndexOf('_') + 1);
	/** Seal art is numbered 1–5 for a–e. */
	const sealImg = (key: string) => `/campaign/eote/seal${sealLetter(key).charCodeAt(0) - 96}.png`;
	const sealLabel = (key: string) => m.archive_seal({ letter: sealLetter(key).toUpperCase() });

	function toggle(key: string) {
		if (recorded.has(key)) onChange(entries.filter((e) => e.key !== key));
		else onChange([...entries, makeEntry(section.id, key)]);
	}
</script>

<div class="flex flex-wrap gap-3">
	{#each seals as s (s.key)}
		{@const on = recorded.has(s.key)}
		<button
			type="button"
			onclick={() => toggle(s.key)}
			aria-pressed={on}
			aria-label={sealLabel(s.key)}
			title={sealLabel(s.key)}
			class={[
				'flex h-24 w-20 cursor-pointer items-center justify-center rounded-lg border p-1 transition',
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
					>{sealLetter(s.key).toUpperCase()}</span
				>
			{/if}
		</button>
	{/each}
</div>
