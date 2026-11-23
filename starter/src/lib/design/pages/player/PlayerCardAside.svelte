<!--
@component
Beside a magnified player card: the way to its reviews, with how many there are, and its text.
-->
<script lang="ts">
	import { Button, CardTextBlock, FaIconType, ReviewCounts } from '@5argon/arkham-life-ui';

	import * as m from '$lib/paraglide/messages.js';
	import type { PlayerCardDetail } from '$lib/server/player-card-details';

	interface Prop {
		detail: PlayerCardDetail;
	}
	const { detail }: Prop = $props();
</script>

{#if detail.review}
	<div class="mb-3 flex flex-wrap items-center gap-2">
		<Button
			icon={FaIconType.Written}
			label={m.review_see_card_reviews()}
			onClick={detail.review.href}
		/>
		<ReviewCounts counts={detail.review.counts} />
	</div>
{/if}
{#if detail.text}
	<CardTextBlock side={detail.text.front} />
	{#if detail.text.back}
		<p class="text-primary-900 dark:text-primary-100 mt-3 mb-1 text-[0.8rem] font-semibold">
			{m.review_card_back()}
		</p>
		<CardTextBlock side={detail.text.back} />
	{/if}
{/if}
