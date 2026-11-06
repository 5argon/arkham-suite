<script lang="ts">
	import { replaceState } from '$app/navigation';
	import { browser } from '$app/env';
	import { page } from '$app/state';
	import {
		buildUrlForSettings,
		type CardItem,
		FlexibleCardDisplay,
		type GroupingSortingSettings,
		MarginFull,
		PageLead,
		productImageUrl,
		ReviewCounts,
		searchParamsToSettings
	} from '@5argon/arkham-life-ui';
	import { u as stringUtils } from '@5argon/arkham-string';

	import OpenGraph from '$lib/components/OpenGraph.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { chapterOneCardHref, chapterOneProductHref } from '$lib/review/paths';
	import { productToExploreRoute } from '$lib/utility/product';

	import type { PageProps } from './$types';

	const { data }: PageProps = $props();
	const product = $derived(data.product);
	const title = $derived(m.review_chapter_one_title({ name: stringUtils.productName(product) }));

	// Wanted to still prerender this page, so we read URL parameters now and accept 1 frame late update.
	const initialSettings: GroupingSortingSettings = browser
		? searchParamsToSettings(new URLSearchParams(window.location.search))
		: { grouping: [], sortingOrder: [] };

	function handleSettingsApply(settings: GroupingSortingSettings) {
		if (!browser) return;
		// eslint-disable-next-line svelte/no-navigation-without-resolve
		replaceState(buildUrlForSettings(settings, window.location), page.state);
	}

	const cardItems: CardItem[] = $derived(
		data.cards.map(({ card }) => ({ card, quantity: card.quantity, id: card.code }))
	);
	const countsOf = $derived(new Map(data.cards.map(({ card, counts }) => [card.code, counts])));
	const cardHref = (item: CardItem) => chapterOneCardHref(item.card.code);
</script>

<OpenGraph
	description={m.review_chapter_one_description()}
	image={productImageUrl(product)}
	noindex
	{title}
	url={chapterOneProductHref(productToExploreRoute(product))}
/>

<PageLead description={m.review_chapter_one_description()} image={productImageUrl(product)} {title} />

{#snippet cardFooter(item: CardItem)}
	{@const counts = countsOf.get(item.card.code)}
	{#if counts}
		<ReviewCounts {counts} />
	{/if}
{/snippet}

<MarginFull>
	<FlexibleCardDisplay
		cards={cardItems}
		hideChecklistMode
		hideQuantity
		{initialSettings}
		{cardHref}
		{cardFooter}
		onSettingsApply={handleSettingsApply}
	/>
</MarginFull>
