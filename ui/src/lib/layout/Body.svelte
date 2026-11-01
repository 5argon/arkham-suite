<script lang="ts">
	import { snapshot } from '$app/navigation';
	import { tick, type Snippet } from 'svelte';
	interface Prop {
		theme: 'light' | 'dark';
		children: Snippet;
	}
	const { theme, children }: Prop = $props();

	$effect(() => {
		// Apply dark class to document element for Tailwind's dark mode
		if (theme === 'dark') {
			document.documentElement.classList.add('dark');
			document.documentElement.classList.remove('light');
		} else {
			document.documentElement.classList.add('light');
			document.documentElement.classList.remove('dark');
		}
	});

	// SvelteKit restores the scroll position on back / forward before pages
	// restore their own snapshots (filters, tabs...), while the page may still
	// be too short to reach it. Scroll again once that content is back.
	snapshot({
		id: 'body-scroll',
		capture: () => window.scrollY,
		restore: async (top: number) => {
			await tick();
			requestAnimationFrame(() => window.scrollTo(0, top));
		}
	});
</script>

<div class:light={theme === 'light'} class="bg-primary-100 dark:bg-primary-900">
	<div class="more-bg bg-primary-100 dark:bg-primary-900 flex flex-col">
		{@render children()}
	</div>
</div>

<style>
	/* The window scrolls, so the root carries the theme color for overscroll
	   bounce, and keeps the scrollbar's space so short and long pages line up. */
	:global(html) {
		background-color: var(--color-primary-100);
		scrollbar-gutter: stable;
	}
	:global(html.dark) {
		background-color: var(--color-primary-900);
	}

	.more-bg {
		min-height: 100vh;
	}
	:global(.light) .more-bg {
		background-image: url('/life-ui/subtle-light.webp');
		background-repeat: repeat;
	}

	:global(.dark) .more-bg {
		background-image: url('/life-ui/subtle-dark.webp');
		background-repeat: repeat;
	}
</style>
