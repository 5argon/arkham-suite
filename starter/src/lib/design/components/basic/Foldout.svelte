<script lang="ts">
	import { FaIcon, FaIconType } from '@5argon/arkham-life-ui';

	let {
		title,
		expanded,
		onToggle
	}: {
		title: string;
		expanded: boolean;
		onToggle: () => void;
	} = $props();

	let element: HTMLDivElement;
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	bind:this={element}
	class="my-1 border border-secondary-300 dark:border-secondary-600 rounded-lg overflow-hidden bg-white dark:bg-secondary-800"
>
	<div
		class="px-4 py-3 cursor-pointer select-none flex items-center justify-between hover:bg-secondary-50 dark:hover:bg-secondary-700 transition-colors"
		onclick={() => {
			onToggle();
		}}
	>
		<span
			class="flex items-center gap-3 text-lg text-secondary-900 dark:text-secondary-100"
			class:font-semibold={expanded}
		>
			<span class="text-primary-600 dark:text-primary-400 w-4 flex-shrink-0">
				<FaIcon icon={expanded ? FaIconType.FoldoutDown : FaIconType.FoldoutRight} />
			</span>
			{title}
		</span>
		<slot name="right" />
	</div>
	{#if expanded}
		<div
			class="border-t border-secondary-200 dark:border-secondary-600 bg-secondary-50/50 dark:bg-secondary-800/50"
		>
			<slot />
		</div>
	{/if}
</div>
