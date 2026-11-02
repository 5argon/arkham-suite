<!--
@component
A small tag. Plain by default; `onClick` makes it a button and `onRemove` adds a
remove button after the label, for showing a tag that is in effect.
-->
<script lang="ts">
	import clsx from 'clsx';

	import * as m from '../paraglide/messages.js';

	interface Prop {
		label: string;
		/**
		 * Shown after the label, such as how many things have this tag.
		 */
		count?: number;
		onClick?: () => void;
		onRemove?: () => void;
	}
	const { label, count, onClick, onRemove }: Prop = $props();

	const chipClass =
		'border-primary-300 dark:border-primary-700 text-primary-800 dark:text-primary-200 inline-flex items-center gap-1 rounded-full border bg-white/50 px-2 py-0.5 text-xs whitespace-nowrap dark:bg-black/30';
</script>

{#snippet content()}
	<span>{label}</span>
	{#if count !== undefined}
		<span class="opacity-70">({count})</span>
	{/if}
{/snippet}

{#if onClick}
	<button
		type="button"
		class={clsx(chipClass, 'hover:bg-primary-200 dark:hover:bg-primary-800 cursor-pointer')}
		onclick={onClick}
	>
		{@render content()}
	</button>
{:else}
	<span class={chipClass}>
		{@render content()}
		{#if onRemove}
			<button
				type="button"
				class="hover:bg-primary-300 dark:hover:bg-primary-700 cursor-pointer rounded-full px-0.5"
				aria-label={m.form_tag_remove({ tag: label })}
				title={m.form_tag_remove({ tag: label })}
				onclick={onRemove}
			>
				✕
			</button>
		{/if}
	</span>
{/if}
