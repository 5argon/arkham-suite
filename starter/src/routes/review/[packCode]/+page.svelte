<script lang="ts">
	import { replaceState, snapshot } from '$app/navigation';
	import { browser } from '$app/env';
	import { page } from '$app/state';
	import {
		buildUrlForSettings,
		type CardItem,
		Checkbox,
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
	import RecentReviews from '$lib/design/pages/review/RecentReviews.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { reviewCardHref, reviewProductHref } from '$lib/review/paths';
	import { productToExploreRoute } from '$lib/utility/product';

	import type { PageProps } from './$types';

	const { data }: PageProps = $props();
	const product = $derived(data.product);
	const title = $derived(stringUtils.productName(product));

	let onlyInternal = $state(false);
	snapshot({
		id: 'review-product-only-internal',
		capture: () => onlyInternal,
		restore: (value) => (onlyInternal = value)
	});

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
		data.cards
			.filter(({ counts }) => !onlyInternal || counts.written > 0)
			.map(({ card }) => ({ card, quantity: card.quantity, id: card.code }))
	);
	const countsOf = $derived(new Map(data.cards.map(({ card, counts }) => [card.code, counts])));
	const pageCodes = $derived(new Map(data.cards.map(({ card, code }) => [card.code, code])));

	const cardHref = (item: CardItem) =>
		reviewCardHref(pageCodes.get(item.card.code) ?? item.card.code);
</script>

<OpenGraph
	description={m.review_product_seo_description({ name: title })}
	image={productImageUrl(product)}
	title={m.review_product_seo_title({ name: title })}
	url={reviewProductHref(productToExploreRoute(product))}
	canonical
/>

<PageLead description={m.review_product_description()} image={productImageUrl(product)} {title} />

{#snippet cardFooter(item: CardItem)}
	{@const counts = countsOf.get(item.card.code)}
	{#if counts}
		<ReviewCounts {counts} />
	{/if}
{/snippet}

<MarginFull>
	<RecentReviews productName={data.backName} rows={data.recents} />
	<div class="mb-4">
		<Checkbox bind:checked={onlyInternal} label={m.review_only_internal()} />
	</div>
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
