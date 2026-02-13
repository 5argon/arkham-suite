<script lang="ts">
	import { InnerHeading, SectionSeparator } from '@5argon/arkham-life-ui';

	let { depth = 1 }: { depth?: number } = $props();
</script>

{#if depth === 1}
	<SectionSeparator title="">
		<slot />
	</SectionSeparator>
{:else}
	<InnerHeading title="">
		<slot />
	</InnerHeading>
{/if}
