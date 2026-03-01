<!--
@component
TDC bespoke widget — the Alien Glyph decryption wall. A grid of every alien
glyph; the ones you've ever decrypted across your plays are lit. Reads the
campaign's `glyphs` collection (already unioned across plays).
-->
<script lang="ts">
	import type { CampaignCollections } from '$lib/campaign/collections';

	let { collections }: { collections: CampaignCollections[] } = $props();

	const glyphs = $derived(
		collections
			.flatMap((c) => c.collections)
			.find((col) => col.sectionId === 'glyphs' || /glyph/i.test(col.title)),
	);
</script>

{#if glyphs}
	<div class="grid grid-cols-6 gap-1.5 sm:grid-cols-9">
		{#each glyphs.items as it (it.id)}
			<div
				class="flex aspect-square items-center justify-center rounded border text-center text-xs leading-tight
					{it.collected
					? 'border-secondary-400 bg-secondary-100 dark:bg-secondary-900 text-secondary-700 dark:text-secondary-300 font-semibold'
					: 'border-primary-200 dark:border-primary-700 text-primary-400'}"
				title={it.label}
			>
				<!-- i18n: package-sourced (glyph collection item label) -->
				{it.label}
			</div>
		{/each}
	</div>
{/if}
