<!-- 
 @component
 Block level text area (multi-line input) field.
 -->
<script lang="ts">
	import FormLabelWithHelp from './FormLabelWithHelp.svelte';

	interface Prop {
		/**
		 * Bindable.
		 */
		value: string;

		/**
		 * Text over the input.
		 */
		label: string;

		/**
		 * Placeholder text for the textarea.
		 */
		placeholder?: string;

		/**
		 * Number of rows to display.
		 */
		rows?: number;

		/**
		 * Disable the textarea and show a loading spinner.
		 */
		loading?: boolean;

		/**
		 * Define to reserve space for message below the box.
		 * It will stay hidden until a message is set.
		 */
		feedback?: {
			type: 'info' | 'error' | 'success';

			/**
			 * `undefined` will hide the box, but still keep the space reserved.
			 */
			message?: string;
		};

		/**
		 * Define to display an icon next to the label, shows a tooltip on hover.
		 */
		help?: string;

		/**
		 * Callback when input changes.
		 */
		oninput?: () => void;

		/**
		 * Callback when input loses focus.
		 */
		onblur?: () => void;
	}
	let {
		label,
		value = $bindable(),
		placeholder,
		rows = 5,
		loading,
		feedback,
		help,
		oninput,
		onblur
	}: Prop = $props();
	let textareaElement: HTMLTextAreaElement;

	let disabled = $derived(loading || false);
</script>

{#snippet errorIcon()}
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"
		><!--! Font Awesome Pro 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path
			d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zm0-384c13.3 0 24 10.7 24 24V264c0 13.3-10.7 24-24 24s-24-10.7-24-24V152c0-13.3 10.7-24 24-24zM224 352a32 32 0 1 1 64 0 32 32 0 1 1 -64 0z"
		/></svg
	>
{/snippet}

{#snippet successIcon()}
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"
		><!--! Font Awesome Pro 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path
			d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z"
		/></svg
	>
{/snippet}

<div class="mb-2">
	<FormLabelWithHelp {label} {help}>
		<textarea
			bind:value
			{disabled}
			{placeholder}
			{rows}
			{oninput}
			{onblur}
			class="border-primary-600 disabled:bg-primary-400 dark:disabled:bg-primary-600 bg-primary-200 disabled:text-primary-500 w-full rounded border-2 p-2 font-mono text-sm"
			bind:this={textareaElement}
		></textarea>
		{#if loading}
			<div class="absolute right-2 top-8">
				<div class="spinner border-primary-200 border-l-primary-800 border-4"></div>
			</div>
		{/if}
	</FormLabelWithHelp>
	{#if feedback}
		<div
			class="bg-primary-950/80 dark:bg-primary-950/70 mt-1 flex h-6 w-full items-center rounded p-2 text-xs {feedback.type ===
			'info'
				? 'text-white'
				: feedback.type === 'error'
					? 'text-red-300'
					: 'text-green-300'}"
		>
			{#if feedback.type !== 'info'}
				<i class="w-3 fill-current">
					{#if feedback.type === 'error'}
						{@render errorIcon()}
					{:else if feedback.type === 'success'}
						{@render successIcon()}
					{/if}
				</i>
			{/if}
			<span class="ml-1">{feedback.message}</span>
		</div>
	{/if}
</div>

<style>
	.spinner {
		border-radius: 50%;
		width: 24px;
		height: 24px;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
