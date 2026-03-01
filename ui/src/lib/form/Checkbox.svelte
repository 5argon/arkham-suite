<script lang="ts">
	import clsx from 'clsx';
	import type { Snippet } from 'svelte';
	import FaIcon from '../icon/FaIcon.svelte';
	import { FaIconType } from '../icon/fa-icon-type.js';
	import SvgIcon from '../basic/SvgIcon.svelte';
	import MarkdownModal from '../layout/MarkdownModal.svelte';
	import Modal from '../layout/Modal.svelte';

	interface Prop {
		label: string;
		checked: boolean;
		onChange?: () => void;
		icon?: FaIconType;
		/**
		 * The label remains required for accessibility, but can be visually hidden.
		 */
		hideLabel?: boolean;
		/**
		 * Compact, low-emphasis variant for dense lists (e.g. long owned-product grids).
		 * Drops the gradient pill for a quiet chip that still reads as a custom control,
		 * so prominent and secondary options can share one page.
		 */
		small?: boolean;
		/**
		 * Longer help text as raw markdown. When provided, renders a clickable
		 * button next to the pill that opens a MarkdownModal.
		 */
		helpMd?: string;
		/**
		 * Rich modal help as a snippet (takes precedence over `helpMd`) — e.g. an mdsvex doc
		 * with images. The same `?` button opens it in a Modal.
		 */
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
		helpContent,
	}: Prop = $props();

	let helpMdOpen = $state(false);

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
	<button
		type="button"
		class="text-primary-500/50 hover:text-primary-500 ml-1 cursor-pointer focus:outline-none"
		onclick={() => (helpMdOpen = true)}
		aria-label="Learn more about {label}"
	>
		<SvgIcon>
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"
				><path
					d="M64 80c-8.8 0-16 7.2-16 16V416c0 8.8 7.2 16 16 16H384c8.8 0 16-7.2 16-16V96c0-8.8-7.2-16-16-16H64zM0 96C0 60.7 28.7 32 64 32H384c35.3 0 64 28.7 64 64V416c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V96zm137.8 69.3c7.9-22.3 29.1-37.3 52.8-37.3h58.3c34.9 0 63.1 28.3 63.1 63.1c0 22.6-12.1 43.5-31.7 54.8L248 264.4c-.2 13-10.9 23.6-24 23.6c-13.3 0-24-10.7-24-24V250.5c0-8.6 4.6-16.5 12.1-20.8l44.3-25.4c4.7-2.7 7.6-7.7 7.6-13.1c0-8.4-6.8-15.1-15.1-15.1H190.6c-3.4 0-6.4 2.1-7.5 5.3l-.4 1.2c-4.4 12.5-18.2 19-30.6 14.6s-19-18.2-14.6-30.6l.4-1.2zM192 352a32 32 0 1 1 64 0 32 32 0 1 1 -64 0z"
				/></svg
			>
		</SvgIcon>
	</button>
	{#if helpContent}
		<Modal isOpen={helpMdOpen} onClose={() => (helpMdOpen = false)} title={label}>
			{@render helpContent()}
		</Modal>
	{:else if helpMd}
		<MarkdownModal
			source={helpMd}
			isOpen={helpMdOpen}
			onClose={() => (helpMdOpen = false)}
			title={label}
		/>
	{/if}
{/if}
