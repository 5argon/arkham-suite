<!--
@component
This will be in &lt;h3&gt;, or &lt;h4&gt; when `inner`, unless `level` says otherwise.
-->
<script module lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title?: string;
		inner?: boolean;
		accentColor?: string;
		level?: 1 | 2 | 3 | 4 | 5 | 6;
		id?: string;
		/**
		 * Something richer than words to head it with, after the title if there's also one.
		 */
		children?: Snippet;
	}
</script>

<script lang="ts">
	import { FaIconType } from '../icon';

	import FaIcon from '../icon/FaIcon.svelte';

	const { title, inner, accentColor, level, id, children }: Props = $props();
</script>

<div {id}>
	{#if !inner}
		<svelte:element
			this={`h${level ?? 3}`}
			class="text-secondary-900 dark:text-secondary-100 mt-2 text-xl"
		>
			<span class="text-[1rem]"><FaIcon duotone icon={FaIconType.SectionSeparator} /></span>
			{#if title}<span>{title}</span>{/if}
			{@render children?.()}
		</svelte:element>
		<hr class="dark:border-secondary-400/20 border-secondary-800/40 mb-1" />
	{:else}
		<svelte:element
			this={`h${level ?? 4}`}
			class="text-secondary-700 dark:text-secondary-300 text-base"
		>
			{#if title}<span>{title}</span>{/if}
			{@render children?.()}
		</svelte:element>
		<hr
			class="dark:border-secondary-400/40 border-secondary-400/40 mb-1 border-dashed"
		/>
	{/if}
</div>
