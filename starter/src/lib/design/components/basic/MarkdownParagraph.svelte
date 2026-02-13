<script lang="ts">
	import { TextParagraph } from '@5argon/arkham-life-ui';
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
	}

	const { children }: Props = $props();
</script>

<TextParagraph {children} />
