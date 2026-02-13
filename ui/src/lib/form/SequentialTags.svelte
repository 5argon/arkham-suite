<!--
@component
Form component for managing a sequential list of items. Items can be added from choices and removed from the sequence.
-->
<script lang="ts" generics="T extends string">
	import { Button } from '../button/index.js';
	import FormLabelWithHelp from './FormLabelWithHelp.svelte';
	import * as m from '../paraglide/messages.js';

	interface Prop {
		label: string;
		help?: string;
		/**
		 * Bindable array of selected items in sequence.
		 */
		sequence: T[];
		/**
		 * Available choices that can be added to the sequence.
		 */
		choices: { value: T; label: string }[];
		/**
		 * Function to get display label for a value.
		 */
		getLabel: (value: T) => string;
		/**
		 * Placeholder text when sequence is empty.
		 */
		emptyPlaceholder?: string;
	}

	let { label, help, sequence = $bindable(), choices, getLabel, emptyPlaceholder = m.form_sorting_placeholder() }: Prop = $props();

	function addToSequence(value: T) {
		if (!sequence.includes(value)) {
			sequence = [...sequence, value];
		}
	}

	function removeFromSequence(value: T) {
		sequence = sequence.filter((v) => v !== value);
	}

	const availableChoices = $derived(choices.filter((c) => !sequence.includes(c.value)));
</script>

<FormLabelWithHelp {label} {help} disableClick>
	<div class="space-y-3">
		<!-- Sequence Display -->
		{#if sequence.length > 0}
			<div class="flex flex-wrap gap-2">
				{#each sequence as item, i (item + i)}
					<div
						class="bg-primary-600 dark:bg-primary-200 flex items-center gap-2 rounded-full px-3 py-1 text-sm text-white dark:text-black"
					>
						{#if i > 0}
							<span class="text-xs opacity-70">→</span>
						{/if}
						<span>{getLabel(item)}</span>
						<button
							type="button"
							onclick={() => removeFromSequence(item)}
							class="hover:bg-primary-700 dark:hover:bg-primary-300 ml-1 rounded-full transition-colors"
							aria-label={`Remove ${getLabel(item)}`}
						>
							<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M6 18L18 6M6 6l12 12"
								/>
							</svg>
						</button>
					</div>
				{/each}
			</div>
		{:else}
			<div class="text-primary-500 dark:text-primary-400 text-sm italic">{emptyPlaceholder}</div>
		{/if}

		<!-- Available Choices -->
		{#if availableChoices.length > 0}
			<div class="flex flex-wrap gap-2">
				{#each availableChoices as choice (choice.value)}
					<Button label={choice.label} onClick={() => addToSequence(choice.value)} />
				{/each}
			</div>
		{/if}
	</div>
</FormLabelWithHelp>
