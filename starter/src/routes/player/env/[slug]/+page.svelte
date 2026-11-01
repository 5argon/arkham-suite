<script lang="ts">
	import {
		buildUrlForSettings,
		type CardItem,
		FlexibleCardDisplay,
		type GroupingSortingSettings,
		MarginFull,
		PageLead,
		searchParamsToSettings
	} from '@5argon/arkham-life-ui';
	import { card as cardUtils, Product } from '@5argon/arkham-kohaku';

	import { browser } from '$app/env';
	import { replaceState } from '$app/navigation';
	import { page } from '$app/state';
	import { getAllCards } from '$lib/card-data';
	import OpenGraph from '$lib/components/OpenGraph.svelte';
	import ProductTiles from '$lib/design/components/product/ProductTiles.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { environmentPointPath, environmentPointTitle } from '$lib/tool/environment-choices';
	import { productToExploreRoute } from '$lib/utility/product';

	import type { PageProps } from './$types';

	const { data }: PageProps = $props();
	const point = $derived(data.point);
	const title = $derived(environmentPointTitle(point));

	// Wanted to still prerender this page, so we read URL parameters now and accept 1 frame late update.
	// Without any in the URL it stays undefined to fall back to the default settings.
	const urlSettings: GroupingSortingSettings | undefined = browser
		? searchParamsToSettings(new URLSearchParams(window.location.search))
		: undefined;
	const initialSettings =
		urlSettings !== undefined &&
		(urlSettings.grouping.length > 0 || urlSettings.sortingOrder.length > 0)
			? urlSettings
			: undefined;

	function handleSettingsApply(settings: GroupingSortingSettings) {
		if (!browser) return;
		// eslint-disable-next-line svelte/no-navigation-without-resolve
		replaceState(buildUrlForSettings(settings, window.location), page.state);
	}

	const allCards = getAllCards();
	const cardItems: CardItem[] = $derived(
		allCards
			.filter(
				(card) => cardUtils.playerCardsNonCampaignFilter(card) && point.products.includes(card.product)
			)
			.map((card) => ({ card, quantity: card.quantity, id: card.code }))
	);
</script>

<OpenGraph
	description={m.explore_env_point_description()}
	image="image/resource/player.webp"
	{title}
	url={environmentPointPath(point.id)}
/>

<PageLead description={m.explore_env_point_description()} {title} />

<ProductTiles
	products={point.products}
	onClick={(product: Product) => `/player/${productToExploreRoute(product)}`}
/>

<MarginFull>
	<FlexibleCardDisplay
		cards={cardItems}
		defaultSettings={{ grouping: [], sortingOrder: ['box-order'] }}
		{initialSettings}
		onSettingsApply={handleSettingsApply}
	/>
</MarginFull>
