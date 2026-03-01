<script lang="ts">
	// A slim, determinate top bar that shows predicted route preloading happening in
	// the background (see `$lib/preload/preloader.svelte`). It never blocks the user.
	// Wording is intentionally honest: "Pages ready", NOT "offline ready" — without a
	// service worker this only readies pages for the current session.
	let {
		active,
		done,
		total,
		ready,
	}: { active: boolean; done: number; total: number; ready: boolean } = $props();

	const pct = $derived(total > 0 ? Math.min(100, Math.round((done / total) * 100)) : 0);
	const caption = $derived(
		ready ? 'Pages ready ✓' : total > 0 ? `Preparing pages… ${done}/${total}` : 'Preparing pages…',
	);
</script>

{#if active}
	<div class="border-primary-100 dark:border-primary-800 border-b" role="status" aria-live="polite">
		<div class="bg-primary-100 dark:bg-primary-800 relative h-1 w-full overflow-hidden">
			{#if total > 0}
				<div
					class="bg-secondary-500 dark:bg-secondary-400 h-full transition-[width] duration-300 ease-out"
					style="width: {pct}%"
				></div>
			{:else}
				<div class="bg-secondary-500 dark:bg-secondary-400 h-full w-1/3 animate-pulse"></div>
			{/if}
		</div>
		<div
			class="text-primary-400 mx-auto flex max-w-5xl justify-end px-4 py-0.5 text-[11px] leading-none"
		>
			{caption}
		</div>
	</div>
{/if}
