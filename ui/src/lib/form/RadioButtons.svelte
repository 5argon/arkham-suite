<!--
@component
Single line radio buttons styled as buttons.
-->
<script lang="ts" generics="T">
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
		 * Bindable.
		 */
		selectedValue: T;

		choices: {
			value: T;
			label: string;
			icon?: FaIconType;
		}[];
	}
	let { label, help, selectedValue = $bindable(), choices, size }: Prop<T> = $props();
	const sizeClass = $derived(size === 'icon' ? 'w-2' : size === 'text' ? 'w-16' : '');
</script>

{#snippet eachButton(value: T, label: string, icon: FaIconType | undefined, index: number)}
	<FormHelp direction="top" passThrough={size !== 'icon'} help={label}>
		<button
			type="button"
			class={clsx(
				'border-primary-800 dark:border-primary-300 border px-3 py-1 focus:outline-none cursor-pointer',
				index === 0 ? 'rounded-l-md' : '',
				index === choices.length - 1 ? 'rounded-r-md' : '',
				selectedValue === value
					? 'bg-primary-600 dark:bg-primary-200  text-white dark:text-black'
					: 'dark:bg-primary-800 hover:bg-primary-200 dark:hover:bg-primary-600 dark:text-white'
			)}
			onclick={(v) => {
				selectedValue = value;
			}}
		>
			<span class="flex items-center gap-2">
				{#if icon}
					<FaIcon duotone {icon} invertColor={selectedValue === value} />
				{/if}
				{#if size !== 'icon'}
					<span class={clsx('inline-block', sizeClass)}>
						{label}
					</span>
				{/if}
			</span>
		</button>
	</FormHelp>
{/snippet}

<FormLabelWithHelp disableClick {label} {help}>
	<div class="flex">
		{#each choices as { value, label, icon }, index (index)}
			{@render eachButton(value, label, icon, index)}
		{/each}
	</div>
</FormLabelWithHelp>
