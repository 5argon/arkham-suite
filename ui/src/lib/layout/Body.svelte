<script lang="ts">
	import type { Snippet } from 'svelte';
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
</script>

<div
	class:light={theme === 'light'}
	class="h-screen overflow-scroll bg-primary-100 dark:bg-primary-900"
>
	<div class="more-bg bg-primary-100 dark:bg-primary-900 flex flex-col">
		{@render children()}
	</div>
</div>

<style>
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
