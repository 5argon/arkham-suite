<script lang="ts">
	import MarkdownExplainerModal from '$lib/design/components/basic/MarkdownExplainerModal.svelte';
	import submissionMd from '$lib/md/card-review-submission.md?raw';
	import * as m from '$lib/paraglide/messages.js';

	interface Prop {
		isOpen: boolean;
		onClose: () => void;
	}
	const { isOpen, onClose }: Prop = $props();
</script>

<MarkdownExplainerModal
	{isOpen}
	{onClose}
	source={submissionMd}
	title={m.review_submission_title()}
/>
