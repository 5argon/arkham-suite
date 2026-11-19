<!--
@component
The card frame of an archive list row: a link to the editor, or in selection mode a toggle with a
check box in its own column at the left edge.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { FaIcon, FaIconType } from '@5argon/arkham-life-ui';

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
		`bg-primary-50 dark:bg-primary-900 border-primary-200 dark:border-primary-700 hover:bg-primary-100 dark:hover:bg-primary-800 flex items-stretch gap-3 overflow-hidden rounded-lg border shadow-sm ${klass}`
	);
</script>

{#if selectable}
	<button
		type="button"
		onclick={() => onToggle?.(!selected)}
		aria-pressed={selected}
		class="{cardClass} w-full cursor-pointer text-left {selected ? 'ring-secondary-500 ring-2' : ''}"
	>
		<span
			class="-mr-3 flex w-9 shrink-0 items-center justify-center self-stretch text-lg {selected
				? 'bg-secondary-500/15 text-secondary-600 dark:text-secondary-400'
				: 'text-primary-400 dark:text-primary-500'}"
		>
			<FaIcon icon={selected ? FaIconType.CheckBoxChecked : FaIconType.CheckBox} duotone={!selected} />
		</span>
		{@render children()}
	</button>
{:else}
	<a {href} class="{cardClass} no-underline">
		{@render children()}
	</a>
{/if}
