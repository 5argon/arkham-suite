<!--
@component
The card frame of an archive list row: a link to the editor, or in selection mode a toggle with a
selection dot.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		href: string;
		selectable: boolean;
		selected: boolean;
		onToggle?: (on: boolean) => void;
		/** Extra classes on the card (e.g. a fixed height). */
		class?: string;
		children: Snippet;
	}
	let { href, selectable, selected, onToggle, class: klass = '', children }: Props = $props();

	const cardClass = $derived(
		`bg-primary-50 dark:bg-primary-900 border-primary-200 dark:border-primary-700 hover:bg-primary-100 dark:hover:bg-primary-800 flex items-stretch gap-3 overflow-hidden rounded-lg border shadow-sm transition ${klass}`
	);
</script>

{#if selectable}
	<button
		type="button"
		onclick={() => onToggle?.(!selected)}
		aria-pressed={selected}
		class="{cardClass} relative w-full cursor-pointer text-left {selected ? 'ring-secondary-500 ring-2' : ''}"
	>
		<span
			class="absolute top-2 right-2 z-10 h-5 w-5 rounded-full border-2 {selected
				? 'border-secondary-500 bg-secondary-500'
				: 'border-primary-400 dark:border-primary-500 bg-white/70 dark:bg-black/40'}"
		></span>
		{@render children()}
	</button>
{:else}
	<a {href} class="{cardClass} no-underline">
		{@render children()}
	</a>
{/if}
