<!--
@component
A styled date input field using the same FormLabelWithHelp layout as other
form fields (TextInput, RadioButtons, etc.).
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import FormLabelWithHelp from './FormLabelWithHelp.svelte';

	interface Prop {
		/** Label displayed above the input. */
		label: string;
		/** Bindable ISO date string (YYYY-MM-DD). Empty string means no date set. */
		value: string;
		/** Short tooltip shown via hover icon. */
		help?: string;
		/**
		 * Longer help text as raw markdown. When provided, renders a clickable
		 * button that opens a MarkdownModal.
		 */
		helpMd?: string;
		/** Rich modal help as a snippet (e.g. an mdsvex doc); see FormLabelWithHelp. */
		helpContent?: Snippet;
		/** HTML form field name for native form submission. */
		name?: string;
		disabled?: boolean;
		/**
		 * When true, displays a clear button that resets the value to an empty
		 * string. Useful for optional date fields where the user may want to
		 * indicate "no date set".
		 */
		clearable?: boolean;
		/** Optional callback when the value changes. */
		onchange?: (value: string) => void;
	}

	let {
		label,
		value = $bindable(),
		help,
		helpMd,
		helpContent,
		name,
		disabled,
		clearable,
		onchange,
	}: Prop = $props();

	// When clearable and empty, we show a placeholder instead of the date input.
	// This avoids the browser always rendering today's date as a placeholder.
	let showInput = $state(!!value);

	// If a value arrives from outside (e.g. initial data load), ensure input is shown.
	$effect(() => {
		if (value) showInput = true;
	});

	let inputEl = $state<HTMLInputElement>();

	// Auto-focus the date picker when switching from placeholder to input.
	$effect(() => {
		if (showInput && inputEl && !value) {
			inputEl.focus();
			inputEl.showPicker?.();
		}
	});

	function handleChange(e: Event) {
		const target = e.target as HTMLInputElement;
		value = target.value;
		// If user dismissed the picker without choosing, go back to placeholder.
		if (!target.value) showInput = false;
		onchange?.(target.value);
	}

	function handleClear() {
		value = '';
		showInput = false;
		onchange?.('');
	}
</script>

<FormLabelWithHelp {label} {help} {helpMd} {helpContent} disableClick={true}>
	<div class="flex w-full items-center">
		<!-- Hidden input always present so form submission sends the empty value -->
		{#if name && !showInput}
			<input type="hidden" {name} value="" />
		{/if}

		{#if showInput || !clearable}
			<input
				bind:this={inputEl}
				type="date"
				{name}
				{disabled}
				value={value}
				onchange={handleChange}
				onblur={() => { if (!value) showInput = false; }}
				class="bg-primary-50 dark:bg-primary-950 text-primary-900 dark:text-primary-100 min-w-0 flex-1 border-0 py-1.5 pl-2 pr-2 text-sm focus:outline-none focus:ring-0 {clearable
					? 'rounded-l'
					: 'rounded'}"
			/>
			{#if clearable}
				<button
					type="button"
					onclick={handleClear}
					{disabled}
					aria-label="Clear date"
					class="bg-primary-50 dark:bg-primary-950 text-primary-400 hover:text-primary-700 dark:hover:text-primary-200 rounded-r border-0 px-2 py-1.5 text-sm transition-colors"
				>
					✕
				</button>
			{/if}
		{:else}
			<!-- Placeholder shown when clearable and no date is set -->
			<button
				type="button"
				onclick={() => (showInput = true)}
				{disabled}
				class="bg-primary-50 dark:bg-primary-950 text-primary-400 hover:text-primary-300 dark:hover:text-primary-500 w-full rounded border-0 py-1.5 pl-2 pr-2 text-left text-sm transition-colors"
			>
				Not set
			</button>
		{/if}
	</div>
</FormLabelWithHelp>
