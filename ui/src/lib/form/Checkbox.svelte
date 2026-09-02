<script lang="ts">
	import clsx from 'clsx';
	import type { Snippet } from 'svelte';
	import FaIcon from '../icon/FaIcon.svelte';
	import { FaIconType } from '../icon/fa-icon-type.js';
	import HelpButton from './HelpButton.svelte';

	interface Prop {
		label: string;
		checked: boolean;
		onChange?: () => void;
		icon?: FaIconType;
		/**
		 * The label remains required for accessibility, but can be visually hidden.
		 */
		hideLabel?: boolean;
		/** Compact, low-emphasis chip for dense lists (e.g. long owned-product grids). */
		small?: boolean;
		/**
		 * Longer help text as raw markdown. When provided, renders a clickable
		 * button next to the pill that opens a MarkdownModal.
		 */
		helpMd?: string;
		/** Rich modal help as a snippet (takes precedence over `helpMd`). */
		helpContent?: Snippet;
	}
	let {
		label,
		checked = $bindable(),
		onChange,
		icon,
		hideLabel = false,
		small = false,
		helpMd,
		helpContent
	}: Prop = $props();

	function handleChange() {
		checked = !checked;
		onChange?.();
	}
</script>

<label
	class={clsx(
		'inline-flex cursor-pointer items-center',
		small
			? 'text-primary-800 dark:text-primary-200 gap-1.5 rounded px-1.5 py-0.5 text-sm hover:bg-primary-200/60 active:bg-primary-300/60 dark:hover:bg-primary-700/50 dark:active:bg-primary-600/50'
			: 'from-primary-300 to-primary-200 dark:from-primary-800 dark:to-primary-600 dark:border-primary-200 border-primary-500 gap-2 rounded-full border bg-gradient-to-r px-3 py-0.5 text-black hover:brightness-110 active:brightness-125 dark:bg-gradient-to-r dark:text-white dark:hover:brightness-110 dark:active:brightness-125'
	)}
>
	<input
		type="checkbox"
		checked={checked}
		onchange={handleChange}
		aria-label={label}
		class={clsx(
			'cursor-pointer transition duration-100 ease-in-out',
			small ? 'accent-primary-600 h-3.5 w-3.5 rounded' : 'form-checkbox text-secondary-700 dark:text-secondary-400 h-4 w-4'
		)}
	/>
	{#if icon}
		<FaIcon duotone {icon} />
	{/if}
	{#if hideLabel}
		<span class="sr-only">{label}</span>
	{:else}
		<span class="select-none">{label}</span>
	{/if}
</label>
{#if helpMd || helpContent}
	<HelpButton {label} {helpMd} {helpContent} class="ml-1" />
{/if}
