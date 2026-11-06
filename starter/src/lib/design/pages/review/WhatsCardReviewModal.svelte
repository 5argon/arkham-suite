<script lang="ts">
	import MarkdownExplainerModal from '$lib/design/components/basic/MarkdownExplainerModal.svelte';
	import reviewMd from '$lib/md/card-review.md?raw';
	import * as m from '$lib/paraglide/messages.js';

	interface Prop {
		isOpen: boolean;
		onClose: () => void;
	}
	const { isOpen, onClose }: Prop = $props();
</script>

<MarkdownExplainerModal
	image="/image/resource/review.webp"
	{isOpen}
	{onClose}
	source={reviewMd}
	title={m.review_whats_title()}
/>
