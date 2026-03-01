<!--
@component
Radio buttons styled as a segmented control. Horizontal by default; pass `vertical` to stack them as
full-width left-aligned rows (better for long / wrapping labels, e.g. the TSK Extra chaos-bag swaps).
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

		/** Fired with the chosen value on click — for callers that persist on change
		 *  (auto-save) rather than reading the bound value behind a separate Save. */
		onChange?: (value: T) => void;

		/** Optional custom renderer for a choice's label (receives the label string), so a
		 *  caller can render rich content — e.g. Arkham icon glyphs from `[skull]`-style
		 *  markup. When absent the label is shown as plain text. */
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
	const sizeClass = $derived(size === 'icon' ? 'w-2' : size === 'text' ? 'w-16' : '');
</script>

{#snippet eachButton(value: T, label: string, icon: FaIconType | undefined, index: number)}
	<FormHelp direction="top" passThrough={size !== 'icon'} help={label}>
		<button
			type="button"
			class={clsx(
				'border-primary-800 dark:border-primary-300 border px-3 py-1 focus:outline-none cursor-pointer',
				vertical
					? clsx('w-full text-left', index === 0 ? 'rounded-t-md' : '', index === choices.length - 1 ? 'rounded-b-md' : '', index > 0 ? '-mt-px' : '')
					: clsx(index === 0 ? 'rounded-l-md' : '', index === choices.length - 1 ? 'rounded-r-md' : ''),
				selectedValue === value
					? 'bg-primary-600 dark:bg-primary-200  text-white dark:text-black'
					: 'dark:bg-primary-800 hover:bg-primary-200 dark:hover:bg-primary-600 dark:text-white'
			)}
			onclick={() => {
				selectedValue = value;
				onChange?.(value);
			}}
		>
			<span class="flex items-center gap-2">
				{#if icon}
					<FaIcon duotone {icon} invertColor={selectedValue === value} />
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
	<div class={vertical ? 'flex flex-col items-stretch' : 'flex'}>
		{#each choices as { value, label, icon }, index (index)}
			{@render eachButton(value, label, icon, index)}
		{/each}
	</div>
</FormLabelWithHelp>
