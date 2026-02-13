<script lang="ts">
	import type { ResultItem } from './result';

	let { item }: { item: ResultItem } = $props();

	const multipleCopies = $derived(item.members.length > 0 && item.members[0].quantity > 1);
	const quantityFirstCopy = $derived(item.members.length === 0 ? 0 : item.members[0].quantity);
</script>

<div class="px-4 py-4">
	<div class="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-1">
		{item.name}
	</div>
	{#if multipleCopies}
		<div class="text-xs text-secondary-600 dark:text-secondary-400 mb-2">
			Recommended Copies: {quantityFirstCopy}
		</div>
	{/if}
	<div class="text-sm text-secondary-700 dark:text-secondary-300 mb-3">
		{item.description}
	</div>
	<div class="flex flex-row flex-wrap gap-4">
		{#each item.members as member, i (i)}
			<div class="flex flex-row shadow-md">
				<img
					alt="front"
					class="rounded-l-xl"
					src={'image/custom/utility-mini-card/' +
						member.frontName.replace(/\.[^/.]+$/, '') +
						'.webp'}
				/>
				<img
					alt="back"
					class="rounded-r-xl"
					src={'image/custom/utility-mini-card/' +
						member.backName.replace(/\.[^/.]+$/, '') +
						'.webp'}
				/>
			</div>
		{/each}
	</div>
</div>
