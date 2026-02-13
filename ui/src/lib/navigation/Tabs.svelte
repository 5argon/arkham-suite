<!--
@component
Just the tabs, it doesn't deal with showing or hiding the content.
-->
<script lang="ts" module>
	import type { Snippet } from 'svelte';
	import Color from 'color';
	interface Props {
		/**
		 * When `vertical` it spans the entire width.
		 * When `horizontal` each item gets a fixed width.
		 */
		direction: 'horizontal' | 'vertical';
		activeTabIndex: number;
		onTabChange: (index: number) => void;
		accentColor?: string;
		tabs: TabItem[];
	}

	export interface TabItem {
		label: string;
		before?: Snippet;

		/**
		 * In vertical layout this is right aligned.
		 */
		after?: Snippet;
	}
</script>

<script lang="ts">
	import { fly, scale } from 'svelte/transition';

	const { direction, accentColor, activeTabIndex, onTabChange, tabs }: Props = $props();
	const colorObject = $derived(Color(accentColor).saturate(1));
	const lightThemeColor = $derived(colorObject.value(50).hex());
	const darkThemeColor = $derived(colorObject.value(80).hex());
</script>

{#snippet centerLabel(label: string)}
	<div class="text text-primary-950 dark:text-primary-50">{label}</div>
{/snippet}

{#snippet singleTab(
	label: string,
	active: boolean,
	accentColor?: string,
	before?: Snippet,
	after?: Snippet
)}
	<div
		class:custom-hover-color={accentColor !== undefined}
		class="group-hover:bg-primary-50/20 dark:group-hover:bg-primary-500/10 group-active:bg-secondary-200/50 dark:group-active:bg-secondary-400/20 relative mx-4 my-2 rounded"
	>
		{#if active}
			<div
				class:custom-border-color={accentColor !== undefined}
				class="bg-primary-50/30 dark:bg-primary-500/20 absolute h-full w-full rounded"
				transition:scale={{
					start: 0.3,
					duration: 250
				}}
			></div>
			<div
				class:custom-border-color={accentColor !== undefined}
				class="border-secondary-500 dark:border-secondary-400 absolute h-full w-full rounded border opacity-50"
				transition:fly={{
					x: direction === 'vertical' ? -30 : 0,
					y: direction === 'horizontal' ? -20 : 0,
					duration: 150
				}}
			></div>
		{/if}
		{#if direction === 'horizontal'}
			<div class="relative mx-2 flex items-center justify-center py-1">
				{#if before}
					<div class="pr-2">
						{@render before()}
					</div>
				{/if}
				{@render centerLabel(label)}
				{#if after}
					<div class="pl-2">
						{@render after()}
					</div>
				{/if}
			</div>
		{:else}
			<div class="relative mx-6 flex items-center justify-between py-1">
				<div class="flex">
					{#if before}
						<div class="pr-2">
							{@render before()}
						</div>
					{/if}
					{@render centerLabel(label)}
				</div>
				{#if after}
					<div class="pl-2">
						{@render after()}
					</div>
				{/if}
			</div>
		{/if}
	</div>
{/snippet}

{#snippet insideFrame()}
	<div
		role="group"
		class="dark:bg-primary-950 dark:text-secondary-100 text-primary-700 bg-primary-200 flex items-center"
		class:vertical-flex={direction === 'vertical'}
		class:horizontal-flex={direction === 'horizontal'}
		style={`--light-accent-color: ${accentColor}`}
	>
		{#each tabs as tab, i (i)}
			<button
				role="radio"
				aria-checked={i === activeTabIndex}
				class="group"
				class:vertical={direction === 'vertical'}
				class:horizontal={direction === 'horizontal'}
				class:active={i === activeTabIndex}
				class:use-accent-color={accentColor !== undefined}
				onclick={() => onTabChange(i)}
			>
				{@render singleTab(tab.label, i === activeTabIndex, accentColor, tab.before, tab.after)}
			</button>
			<!-- Separator -->
			{#if i !== tabs.length - 1}
				{#if direction === 'horizontal'}
					<div class="bg-primary-500/20 h-4 w-0.5"></div>
				{:else}
					<div class="bg-primary-500/20 h-0.5 w-5/6"></div>
				{/if}
			{/if}
		{/each}
	</div>
{/snippet}

<div style={`--border-color-light: ${lightThemeColor}; --border-color-dark: ${darkThemeColor}`}>
	{#if direction === 'horizontal'}
		<div
			class:custom-border-color={accentColor !== undefined}
			class="border-secondary-500 dark:border-secondary-400 border-t-2"
		>
			{@render insideFrame()}
		</div>
	{:else}
		<div
			class:custom-border-color={accentColor !== undefined}
			class="border-secondary-500 dark:border-secondary-400 border-l-2"
		>
			{@render insideFrame()}
		</div>
	{/if}
</div>

<style>
	.custom-border-color {
		border-color: var(--border-color-light);
	}

	.dark .custom-border-color {
		border-color: var(--border-color-dark);
	}

	.vertical-flex {
		flex-direction: column;
	}

	.horizontal-flex {
		flex-direction: row;
	}

	.vertical {
		width: 100%;
	}

	.horizontal {
		flex: 1;
	}

	.horizontal:first-child {
		border-top-left-radius: 0.5rem;
	}

	.horizontal:last-child {
		border-top-right-radius: 0.5rem;
	}

	.use-accent-color {
		border-color: var(--accent-color);
	}

	.inactive-effect {
		opacity: 0.5;
	}
</style>
