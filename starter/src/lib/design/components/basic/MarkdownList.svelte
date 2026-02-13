<script lang="ts">
	let { ordered = false }: { ordered?: boolean } = $props();
</script>

{#if ordered}
	<ol class="list-decimal list-inside space-y-2 text-secondary-900 dark:text-secondary-100">
		<slot />
	</ol>
{:else}
	<ul class="list-disc list-inside space-y-1 text-secondary-900 dark:text-secondary-100">
		<slot />
	</ul>
{/if}
