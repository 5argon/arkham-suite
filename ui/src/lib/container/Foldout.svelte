<!--
@component
A titled panel whose content folds away behind its header.
`expanded` can be bound, or driven by the parent through `onToggle` (e.g. an
accordion where opening one closes the others). The content area has no
padding of its own.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import clsx from 'clsx';
	import FaIcon from '../icon/FaIcon.svelte';
	import { FaIconType } from '../icon/fa-icon-type.js';

	interface Prop {
		title: string;
		expanded?: boolean;
		/**
		 * Called after the header is clicked, with the new state.
		 */
		onToggle?: (expanded: boolean) => void;
		/**
		 * Hide the content while folded instead of unmounting it, so components
		 * inside keep their state (e.g. a filter's choices).
		 */
		keepMounted?: boolean;
		/**
		 * Rendered at the right end of the header.
		 */
		right?: Snippet;
		children: Snippet;
	}

	let {
		title,
		expanded = $bindable(false),
		onToggle,
		keepMounted = false,
		right,
		children
	}: Prop = $props();
</script>

<div
	class="border-primary-300 dark:border-primary-700 my-1 overflow-hidden rounded-lg border bg-white/50 dark:bg-black/30"
>
	<button
		type="button"
		class="text-primary-900 dark:text-primary-100 hover:bg-primary-100 dark:hover:bg-primary-800 flex w-full cursor-pointer items-center justify-between gap-2 px-3 py-2 text-left"
		aria-expanded={expanded}
		onclick={() => {
			expanded = !expanded;
			onToggle?.(expanded);
		}}
	>
		<span class="flex items-center gap-2">
			<span class="text-primary-600 dark:text-primary-400 w-4 shrink-0">
				<FaIcon icon={expanded ? FaIconType.FoldoutDown : FaIconType.FoldoutRight} />
			</span>
			<span class="font-semibold">{title}</span>
		</span>
		{#if right}
			{@render right()}
		{/if}
	</button>
	{#if expanded || keepMounted}
		<div class={clsx('border-primary-200 dark:border-primary-700 border-t', !expanded && 'hidden')}>
			{@render children()}
		</div>
	{/if}
</div>
