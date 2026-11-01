<script lang="ts">
	import { InnerHeading, SectionSeparator } from '@5argon/arkham-life-ui';

	let { depth = 1, text = '' }: { depth?: number; text?: string } = $props();
</script>

{#if depth === 1}
	<SectionSeparator title={text} />
{:else}
	<InnerHeading title={text} />
{/if}
