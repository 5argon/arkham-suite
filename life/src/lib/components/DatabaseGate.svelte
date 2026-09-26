<!-- @component Renders `children` with the loaded document: a spinner until storage has been read, `empty` when there is no database. -->
<script lang="ts">
	import type { Snippet } from 'svelte';

	import { databaseStore } from '$lib/database/database.svelte';
	import type { DatabaseDocument } from '$lib/database/document';
	import * as m from '$lib/paraglide/messages.js';

	interface Props {
		children: Snippet<[DatabaseDocument]>;
		empty?: Snippet;
	}

	const { children, empty }: Props = $props();
</script>

{#if databaseStore.status === 'loading'}
	<div class="text-primary-400 flex items-center justify-center gap-2 py-16 text-sm">
		<span
			class="border-primary-300 dark:border-primary-600 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"
		></span>
		{m.database_loading()}
	</div>
{:else if databaseStore.doc}
	{@render children(databaseStore.doc)}
{:else}
	{@render empty?.()}
{/if}
