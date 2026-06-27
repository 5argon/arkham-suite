<!--
@component
Shared section label — the small muted heading/caption that titles a widget's sub-block. Two tiers:
`heading` (a prominent group title, sm semibold) and `label` (a quiet field / table caption, xs
medium); `align` overrides left vs centre. Replaces the hand-rolled `<p class="text-primary-500 …">`
and StatNumbers-style headings scattered across the campaign widgets so they all read the same.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		variant = 'label',
		align = 'left',
		children
	}: {
		/** `heading` = prominent group title (sm, semibold, primary-600); `label` = quiet caption. */
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
