<!--
@component
A page-section heading for sub-pages (h2 level). Combines a title and optional description
in a compact layout, suited for inner settings/feature pages that don't need a full PageLead.
-->
<script module lang="ts">
	interface Props {
		title: string;
		description?: string;
	}
</script>

<script lang="ts">
	import { MarginFull } from '../layout/index.js';

	const { title, description }: Props = $props();
</script>

<MarginFull>
	<hgroup class="mt-2 mb-4">
		<h2 class="text-secondary-900 dark:text-secondary-100 text-xl sm:text-3xl">{title}</h2>
		{#if description}
			<p class="text-secondary-700 dark:text-secondary-300 mt-2 text-sm">{description}</p>
		{/if}
	</hgroup>
</MarginFull>

<style>
	h2 {
		font-family: 'Heading';
	}
</style>
