<script lang="ts">
	let { ordered = false }: { ordered?: boolean } = $props();
</script>

{#if ordered}
	<ol class="list-decimal space-y-2 pl-6 text-secondary-900 dark:text-secondary-100">
		<slot />
	</ol>
{:else}
	<ul class="list-disc space-y-1 pl-6 text-secondary-900 dark:text-secondary-100">
		<slot />
	</ul>
{/if}
