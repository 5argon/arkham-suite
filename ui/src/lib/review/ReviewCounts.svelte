<!--
@component
How much there is to see, written here and elsewhere, so nobody has to go in to find out there is
nothing.
-->
<script lang="ts">
	import FaIcon from '../icon/FaIcon.svelte';
	import { FaIconType } from '../icon/fa-icon-type.js';
	import * as m from '../paraglide/messages.js';
	import type { ReviewCountsData } from './review-entry.js';

	interface Prop {
		counts: ReviewCountsData;
	}
	const { counts }: Prop = $props();
	const kinds = $derived(
		[
			{
				id: 'written',
				icon: FaIconType.Written,
				count: counts.written,
				title: m.card_review_count_written({ count: counts.written })
			},
			{
				id: 'external',
				icon: FaIconType.ExternalLink,
				count: counts.external,
				title: m.card_review_count_external({ count: counts.external })
			}
		].filter((kind) => kind.count > 0)
	);
</script>

{#if kinds.length > 0}
	<span class="text-primary-800 dark:text-primary-200 inline-flex items-center gap-2 text-xs">
		{#each kinds as kind (kind.id)}
			<span class="inline-flex items-center gap-1" title={kind.title}>
				<FaIcon icon={kind.icon} />
				{kind.count}
			</span>
		{/each}
	</span>
{/if}
