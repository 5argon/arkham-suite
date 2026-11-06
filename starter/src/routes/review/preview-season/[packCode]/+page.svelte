<script lang="ts">
	import { resolve } from '$app/paths';
	import {
		CardLine,
		MarginFull,
		PageLead,
		productImageUrl,
		ReviewList,
		ReviewRow,
		SectionSeparator,
		TemporaryCardLine
	} from '@5argon/arkham-life-ui';
	import { u as stringUtils } from '@5argon/arkham-string';

	import OpenGraph from '$lib/components/OpenGraph.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { previewSeasonProductHref } from '$lib/review/paths';
	import { productToExploreRoute } from '$lib/utility/product';

	import type { PageProps } from './$types';

	const { data }: PageProps = $props();
	const product = $derived(data.product);
	const title = $derived(m.review_preview_season_of({ name: stringUtils.productName(product) }));
</script>

<OpenGraph
	description={m.review_preview_season_of_description({ name: stringUtils.productName(product) })}
	image={productImageUrl(product)}
	{title}
	url={previewSeasonProductHref(productToExploreRoute(product))}
	canonical
/>

<PageLead
	description={m.review_preview_season_description()}
	image={productImageUrl(product)}
	{title}
/>

<MarginFull>
	{#each data.groups as group (group.title)}
		<SectionSeparator title={group.title} />
		<ReviewList>
			{#each group.rows as row, i (i)}
				<div>
					<ReviewRow entry={row.entry} />
					{#if row.cards.length > 0}
						<div class="mb-1 ml-8 flex flex-col px-2">
							{#each row.cards as line, j (j)}
								{#if line.card}
									<a
										class="hover:bg-primary-300 dark:hover:bg-primary-800 block rounded-sm"
										href={resolve('/review/card/[code]', { code: line.card.code })}
									>
										<CardLine card={line.card} hideQuantity />
									</a>
								{:else if line.temporary}
									<TemporaryCardLine card={line.temporary} />
								{/if}
							{/each}
						</div>
					{/if}
				</div>
			{/each}
		</ReviewList>
	{/each}
</MarginFull>
