<!-- 
 @component
 Block level text input field.
 -->
<script lang="ts">
	import Button from '../button/Button.svelte';
	import FormLabelWithHelp from './FormLabelWithHelp.svelte';
	import TextBox from './TextBox.svelte';
	import { FaIconType } from '../icon/fa-icon-type.js';
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
		 * Placeholder text for the input.
		 */
		placeholder?: string;

		/**
		 * Define to capture Enter key press and call custom code.
		 * Also display a button to the right of the input that calls the submit code.
		 */
		submittable?: {
			submitText: string;
			onSubmit: () => void;
		};

		/**
		 * Disable the dialog box and show a loading spinner.
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
		 * Callback when input changes. Receives the new value.
		 */
		oninput?: (value: string) => void;

		/**
		 * Callback when input loses focus.
		 */
		onblur?: () => void;
	}
	let {
		label,
		value = $bindable(),
		placeholder,
		submittable,
		loading,
		feedback,
		help,
		oninput,
		onblur
	}: Prop = $props();

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
		<TextBox bind:value {disabled} {placeholder} {oninput} {onblur} />
		{#if loading}
			<div class="absolute right-2">
				<div class="spinner border-primary-200 border-l-primary-800 border-4"></div>
			</div>
		{:else if submittable}
			<span class="ml-1"
				><Button
					icon={FaIconType.RightSingle}
					hideLabel
					label={submittable.submitText}
					onClick={() => {
						submittable.onSubmit();
					}}
				/>
			</span>
		{/if}
	</FormLabelWithHelp>
	{#if feedback}
		<div
			class="bg-primary-950/80 dark:bg-primary-950/70 mt-1 flex h-6 w-full max-w-xl items-center rounded p-2 text-xs {feedback.type ===
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
