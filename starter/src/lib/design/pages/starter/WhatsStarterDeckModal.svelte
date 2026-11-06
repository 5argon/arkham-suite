<script lang="ts">
	import MarkdownExplainerModal from '$lib/design/components/basic/MarkdownExplainerModal.svelte';
	import rulesMd from '$lib/md/starter-deck.md?raw';
	import * as m from '$lib/paraglide/messages.js';

	interface Prop {
		isOpen: boolean;
		onClose: () => void;
	}
	const { isOpen, onClose }: Prop = $props();
</script>

<MarkdownExplainerModal
	image="/image/resource/starter.webp"
	{isOpen}
	{onClose}
	source={rulesMd}
	title={m.starter_decks_whats()}
/>
