<!--
@component
A "?" button that opens the control's long-form help in a MarkdownModal. Shared by the form
controls that accept `helpMd` (Checkbox, FormLabelWithHelp).
-->
<script lang="ts">
	import HelpIcon from './HelpIcon.svelte';
	import MarkdownModal from '../layout/MarkdownModal.svelte';

	interface Prop {
		/** The control's label — titles the modal and names the button for assistive tech. */
		label: string;
		/** Help text as raw markdown. */
		helpMd: string;
		/** Extra classes on the button (its spacing from the control). */
		class?: string;
	}
	const { label, helpMd, class: klass = '' }: Prop = $props();

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
<MarkdownModal source={helpMd} isOpen={open} onClose={() => (open = false)} title={label} />
