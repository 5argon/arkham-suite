<script lang="ts">
	import {
		GraphicButton,
		PageLead,
		productImageUrl,
		SectionSeparator
	} from '@5argon/arkham-life-ui';
	import {
		color,
		productChapterOneInvestigatorExpansions,
		productCoreSets,
		productInvestigatorStarterDeck,
		productReturnTo
	} from '@5argon/arkham-kohaku';
	import { m, u } from '@5argon/arkham-string';
	import { productToExploreRoute } from '$lib/utility/product';
	import { ProductIcon } from '@5argon/arkham-icon';
	import { slide } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';

	let innerWidth = $state(0);
	let isLargeScreen = $derived(innerWidth >= 1024); // lg breakpoint

	function getSlideAxis() {
		return isLargeScreen ? 'x' : 'y';
	}
</script>

<svelte:window bind:innerWidth />

<PageLead
	description="View cards inside a particular product to help with purchasing decisions."
	title="Player Cards"
/>

<div class="flex gap-1">
	{#each productCoreSets as product (product)}
		<div in:slide|global={{ duration: 200, axis: getSlideAxis(), easing: cubicOut }}>
			<GraphicButton
				text={u.productName(product)}
				graphic={productImageUrl(product)}
				accentColor={color.getColor(color.productToColors(product), 950, false)}
				small
				onClick={'/player/' + productToExploreRoute(product)}
			>
				<ProductIcon {product} />
			</GraphicButton>
		</div>
	{/each}
</div>

<SectionSeparator title={m.productTypeInvestigatorExpansion()} />

<div class="flex gap-1">
	{#each productChapterOneInvestigatorExpansions as product (product)}
		<div in:slide|global={{ duration: 200, delay: 50, easing: cubicOut }}>
			<GraphicButton
				text={u.productName(product, true)}
				subtext={m.productTypeInvestigatorExpansion()}
				graphic={productImageUrl(product)}
				accentColor={color.getColor(color.productToColors(product), 950, false)}
				small
				onClick={'/player/' + productToExploreRoute(product)}
			>
				<ProductIcon {product} />
			</GraphicButton>
		</div>
	{/each}
</div>

<SectionSeparator title={m.productTypeInvestigatorStarterDeck()} />

<div class="flex gap-1">
	{#each productInvestigatorStarterDeck as product (product)}
		<div in:slide|global={{ duration: 250, delay: 150, easing: cubicOut }}>
			<GraphicButton
				small
				text={u.productName(product)}
				subtext={m.productTypeInvestigatorStarterDeck()}
				graphic={productImageUrl(product)}
				accentColor={color.getColor(color.productToColors(product), 950, false)}
				onClick={'/player/' + productToExploreRoute(product)}
			>
				<ProductIcon {product} />
			</GraphicButton>
		</div>
	{/each}
</div>

<SectionSeparator title="Return To" />

<div class="flex gap-1">
	{#each productReturnTo as product (product)}
		<div in:slide|global={{ duration: 250, delay: 200, easing: cubicOut }}>
			<GraphicButton
				text={u.productName(product, true)}
				graphic={productImageUrl(product)}
				accentColor={color.getColor(color.productToColors(product), 950, false)}
				small
				onClick={'/player/' + productToExploreRoute(product)}
			>
				<ProductIcon {product} />
			</GraphicButton>
		</div>
	{/each}
</div>

<style>
	.flex {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		margin: 8px 0px;
	}
</style>
