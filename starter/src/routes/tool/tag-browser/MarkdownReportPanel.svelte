<!--
@component
A "report a tagging error" panel: an intro line, optional caller controls, a reason box and a
button that copies the caller-built Markdown report to the clipboard.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Button, SectionSeparator } from '@5argon/arkham-life-ui';

	let {
		title,
		inner = false,
		intro,
		reasonLabel,
		placeholder = '',
		buildMarkdown,
		children,
		class: klass = 'mt-8'
	}: {
		title: string;
		inner?: boolean;
		intro: Snippet;
		reasonLabel?: string;
		placeholder?: string;
		/** The Markdown to copy, given the trimmed reason text. */
		buildMarkdown: (reason: string) => string;
		/** Extra controls above the reason box; call the given `touch()` when they change. */
		children?: Snippet<[() => void]>;
		class?: string;
	} = $props();

	let reason = $state('');
	let copied = $state(false);
	const touch = () => (copied = false);

	async function copy() {
		try {
			await navigator.clipboard.writeText(buildMarkdown(reason.trim()));
			copied = true;
		} catch {
			copied = false;
		}
	}
</script>

<div class={klass}>
	<SectionSeparator {title} {inner} />
	<p class="text-primary-600 dark:text-primary-300 mt-1 mb-3 text-sm">{@render intro()}</p>

	{@render children?.(touch)}

	<label class="mt-3 block">
		{#if reasonLabel}
			<span class="text-primary-600 dark:text-primary-300 text-sm">{reasonLabel}</span>
		{/if}
		<textarea
			bind:value={reason}
			oninput={touch}
			rows="3"
			{placeholder}
			class="border-primary-300 text-primary-900 dark:border-primary-600 dark:bg-primary-900 dark:text-primary-100 mt-1 w-full rounded border bg-white px-3 py-2 text-sm"
		></textarea>
	</label>

	<div class="mt-3">
		<Button label={copied ? 'Copied!' : 'Copy report as Markdown'} onClick={copy} />
	</div>
</div>
