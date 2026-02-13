<script lang="ts">
	import FaIcon from '../icon/FaIcon.svelte';
	import { FaIconType } from '../icon/fa-icon-type.js';

	interface Prop {
		label: string;
		checked: boolean;
		onChange?: () => void;
		icon?: FaIconType;
		/**
		 * The label remains required for accessibility, but can be visually hidden.
		 */
		hideLabel?: boolean;
	}
	let { label, checked = $bindable(), onChange, icon, hideLabel = false }: Prop = $props();

	function handleChange() {
		checked = !checked;
		onChange?.();
	}
</script>

<label
	class="from-primary-300 to-primary-200 dark:from-primary-800 dark:to-primary-600 dark:border-primary-200 border-primary-500 inline-flex cursor-pointer items-center rounded-full border bg-gradient-to-r px-3 py-0.5 text-black hover:brightness-110 active:brightness-125 dark:bg-gradient-to-r dark:text-white dark:hover:brightness-110 dark:active:brightness-125"
>
	<input
		type="checkbox"
		checked={checked}
		onchange={handleChange}
		aria-label={label}
		class="form-checkbox text-secondary-700 dark:text-secondary-400 h-4 w-4 cursor-pointer transition duration-100 ease-in-out"
	/>
	{#if icon}
		<FaIcon duotone {icon} class={hideLabel ? 'ml-2' : 'ml-2 mr-2'} />
	{/if}
	{#if hideLabel}
		<span class="sr-only">{label}</span>
	{:else}
		<span class={icon ? 'select-none' : 'ml-2 select-none'}>{label}</span>
	{/if}
</label>
