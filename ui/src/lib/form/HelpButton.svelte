<!--
@component
A "?" button that opens the control's long-form help in a modal. Shared by the form controls
that accept `helpMd` / `helpContent` (Checkbox, FormLabelWithHelp).
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import HelpIcon from './HelpIcon.svelte';
	import MarkdownModal from '../layout/MarkdownModal.svelte';
	import Modal from '../layout/Modal.svelte';

	interface Prop {
		/** The control's label — titles the modal and names the button for assistive tech. */
		label: string;
		/** Help text as raw markdown, rendered in a MarkdownModal. */
		helpMd?: string;
		/** Rich help as a snippet (takes precedence over `helpMd`), rendered in a plain Modal. */
		helpContent?: Snippet;
		/** Extra classes on the button (its spacing from the control). */
		class?: string;
	}
	const { label, helpMd, helpContent, class: klass = '' }: Prop = $props();

	let open = $state(false);
</script>

<button
	type="button"
	class="text-primary-500/50 hover:text-primary-500 cursor-pointer focus:outline-none {klass}"
	onclick={() => (open = true)}
	aria-label="Learn more about {label}"
>
	<HelpIcon />
</button>
{#if helpContent}
	<Modal isOpen={open} onClose={() => (open = false)} title={label}>
		{@render helpContent()}
	</Modal>
{:else if helpMd}
	<MarkdownModal source={helpMd} isOpen={open} onClose={() => (open = false)} title={label} />
{/if}
