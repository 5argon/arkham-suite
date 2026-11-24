<!--
@component
Radio buttons styled as a segmented control. Horizontal by default; pass `vertical` to stack them as
full-width left-aligned rows (for long / wrapping labels). On a phone, choices with words are plain
radios in a column instead, since a joined bar only reads as one when it fits on one line.
-->
<script lang="ts" generics="T">
	import type { Snippet } from 'svelte';
	import FormLabelWithHelp from './FormLabelWithHelp.svelte';
	import clsx from 'clsx';
	import FormHelp from './FormHelp.svelte';
	import FaIcon from '../icon/FaIcon.svelte';
	import { FaIconType } from '../icon/fa-icon-type.js';

	interface Prop<T> {
		label: string;
		/**
		 * Non `flexible` size will make all buttons the same size.
		 * `text` and `flexible` shows both the icon and the label with no hover.
		 * `icon` is the smallest and show the label on hover.
		 * `undefined` is equal to `flexible`.
		 */
		size?: 'icon' | 'text' | 'flexible';
		help?: string;
		/**
		 * Longer help text as raw markdown. When provided, renders a clickable button
		 * that opens a modal — better for mobile and multi-paragraph explanations.
		 */
		helpMd?: string;
		/** Rich modal help as a snippet (e.g. an mdsvex doc); see FormLabelWithHelp. */
		helpContent?: Snippet;

		/**
		 * Bindable.
		 */
		selectedValue: T;

		choices: {
			value: T;
			label: string;
			icon?: FaIconType;
		}[];

		/** Fired with the chosen value on click. */
		onChange?: (value: T) => void;

		/** Custom renderer for a choice's label (e.g. Arkham icon glyphs from `[skull]` markup). */
		renderLabel?: Snippet<[string]>;

		/** Stack the choices vertically as full-width, left-aligned rows (for long / wrapping labels). */
		vertical?: boolean;
	}
	let {
		label,
		help,
		helpMd,
		helpContent,
		selectedValue = $bindable(),
		choices,
		size,
		onChange,
		renderLabel,
		vertical = false,
	}: Prop<T> = $props();
	// The same width for each only matters in the bar.
	const sizeClass = $derived(size === 'text' ? 'sm:w-16' : '');
</script>

{#snippet eachButton(value: T, label: string, icon: FaIconType | undefined, index: number)}
	{@const selected = selectedValue === value}
	{@const first = index === 0}
	{@const last = index === choices.length - 1}
	<FormHelp direction="top" passThrough={size !== 'icon'} help={label}>
		<button
			type="button"
			role="radio"
			aria-checked={selected}
			class={clsx(
				'cursor-pointer focus:outline-none',
				size === 'icon'
					? clsx(
							'border-primary-800 dark:border-primary-300 border px-3 py-1',
							first && 'rounded-l-md',
							last && 'rounded-r-md',
							selected
								? 'bg-primary-600 dark:bg-primary-200 text-white dark:text-black'
								: 'dark:bg-primary-800 hover:bg-primary-200 dark:hover:bg-primary-600 dark:text-white'
						)
					: clsx(
							// A plain radio on a phone, joined into one bar from sm up.
							'flex items-center py-1 text-left dark:text-white',
							'sm:border-primary-800 sm:dark:border-primary-300 sm:border sm:px-3',
							vertical
								? clsx('w-full', first && 'sm:rounded-t-md', last && 'sm:rounded-b-md', !first && 'sm:-mt-px')
								: clsx(first && 'sm:rounded-l-md', last && 'sm:rounded-r-md'),
							selected
								? 'sm:bg-primary-600 sm:dark:bg-primary-200 sm:text-white sm:dark:text-black'
								: 'sm:dark:bg-primary-800 sm:hover:bg-primary-200 sm:dark:hover:bg-primary-600'
						)
			)}
			onclick={() => {
				selectedValue = value;
				onChange?.(value);
			}}
		>
			<span class="flex items-center gap-2">
				{#if size !== 'icon'}
					<span
						class="border-primary-700 dark:border-primary-300 flex size-4 shrink-0 items-center justify-center rounded-full border-2 sm:hidden"
						aria-hidden="true"
					>
						{#if selected}
							<span class="bg-primary-700 dark:bg-primary-300 size-2 rounded-full"></span>
						{/if}
					</span>
				{/if}
				{#if icon}
					{#if size === 'icon' || !selected}
						<FaIcon duotone {icon} invertColor={selected} />
					{:else}
						<!-- Only the bar fills in the chosen one, so only the bar inverts its icon. -->
						<span class="sm:hidden"><FaIcon duotone {icon} /></span>
						<span class="hidden sm:inline"><FaIcon duotone {icon} invertColor /></span>
					{/if}
				{/if}
				{#if size !== 'icon'}
					<span class={clsx('inline-block', vertical ? '' : sizeClass)}>
						{#if renderLabel}{@render renderLabel(label)}{:else}{label}{/if}
					</span>
				{/if}
			</span>
		</button>
	</FormHelp>
{/snippet}

<FormLabelWithHelp disableClick {label} {help} {helpMd} {helpContent}>
	<div
		role="radiogroup"
		aria-label={label}
		class={size === 'icon'
			? 'flex flex-wrap'
			: vertical
				? 'flex flex-col items-stretch'
				: 'flex flex-col sm:flex-row sm:flex-wrap'}
	>
		{#each choices as { value, label, icon }, index (index)}
			{@render eachButton(value, label, icon, index)}
		{/each}
	</div>
</FormLabelWithHelp>
