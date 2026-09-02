<script lang="ts">
	import type { Snippet } from 'svelte';
	import FormHelp from './FormHelp.svelte';
	import HelpIcon from './HelpIcon.svelte';
	import HelpButton from './HelpButton.svelte';

	interface Prop {
		label: string;
		help?: string;
		/**
		 * Longer help text as raw markdown. When provided, renders a clickable
		 * button instead of a hover tooltip. Clicking it opens a MarkdownModal —
		 * better for mobile and for multi-paragraph explanations.
		 */
		helpMd?: string;
		children: Snippet;

		/**
		 * Stop using `<label>` tag and use `<div>` instead, used to
		 * label radio buttons where you don't want the click to transfer.
		 */
		disableClick?: boolean;
	}
	const { label, help, helpMd, children, disableClick }: Prop = $props();
</script>

{#snippet inside()}
	<div class="flex items-center text-primary-900 dark:text-primary-100 mt-2 min-h-4">
		<span class="text-xs">{label || '\u00A0'}</span>
		{#if help}
			<FormHelp {help}>
				<span class="text-primary-500/50 ml-2"><HelpIcon /></span>
			</FormHelp>
		{/if}
		{#if helpMd}
			<HelpButton {label} {helpMd} class="ml-2" />
		{/if}
	</div>
	<div class="relative flex w-full max-w-xl items-center">
		{@render children()}
	</div>
{/snippet}

{#if disableClick}
	<div>
		{@render inside()}
	</div>
{:else}
	<label>
		{@render inside()}
	</label>
{/if}

