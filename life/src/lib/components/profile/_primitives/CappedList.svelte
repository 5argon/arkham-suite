<!-- @component The first `limit` items through `list`, and a button opening every item in a modal. -->
<script lang="ts" generics="T">
	import type { Snippet } from 'svelte';
	import { Button, Modal } from '@5argon/arkham-life-ui';
	import * as m from '$lib/paraglide/messages.js';

	let {
		items,
		limit = 10,
		modalTitle,
		list
	}: { items: T[]; limit?: number; modalTitle: string; list: Snippet<[T[]]> } = $props();

	let open = $state(false);
</script>

{@render list(items.slice(0, limit))}
{#if items.length > limit}
	<div class="mt-2 flex justify-end">
		<Button label={m.framework_show_all({ count: items.length })} onClick={() => (open = true)} />
	</div>
	<Modal isOpen={open} onClose={() => (open = false)} title={modalTitle}>
		{@render list(items)}
	</Modal>
{/if}
