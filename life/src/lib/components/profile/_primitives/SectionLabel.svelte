<!-- @component A small heading (`heading`) or muted caption (`label`) over a widget's sub-block. -->
<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		variant = 'label',
		align = 'left',
		children
	}: {
		variant?: 'heading' | 'label';
		align?: 'left' | 'center';
		children: Snippet;
	} = $props();

	const cls = $derived(
		[
			variant === 'heading'
				? 'text-primary-600 dark:text-primary-300 mb-2 text-sm font-semibold'
				: 'text-primary-500 mb-1 text-xs font-medium',
			align === 'center' ? 'text-center' : ''
		]
			.filter(Boolean)
			.join(' ')
	);
</script>

<p class={cls}>{@render children()}</p>
