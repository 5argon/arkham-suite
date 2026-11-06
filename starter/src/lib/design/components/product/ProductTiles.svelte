<!--
@component
A centered row of product graphic buttons, wrapping as needed.
-->
<script lang="ts">
	import { ProductButton } from '@5argon/arkham-life-ui';
	import type { Product } from '@5argon/arkham-kohaku';
	import type { Snippet } from 'svelte';

	interface Prop {
		products: Product[];
		/**
		 * A function runs on click, a string is a link.
		 */
		onClick: (product: Product) => (() => void) | string;
		/**
		 * Makes them toggles. Omit for plain buttons.
		 */
		active?: (product: Product) => boolean;
		locked?: (product: Product) => boolean;
		/**
		 * Shown under each tile.
		 */
		caption?: Snippet<[Product]>;
	}
	const { products, onClick, active, locked, caption }: Prop = $props();
</script>

<div class="product-tiles">
	{#each products as product (product)}
		<div class="tile">
			<ProductButton
				active={active?.(product)}
				locked={locked?.(product)}
				onClick={onClick(product)}
				{product}
			/>
			{#if caption}
				{@render caption(product)}
			{/if}
		</div>
	{/each}
</div>

<style>
	/* Wide enough for exactly 3 GraphicButtons (250px each) per row, centered:
	   the core and 5 decks wrap as 3 + 3, and on narrower screens as 2 + 2 + 2. */
	.product-tiles {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem;
		justify-content: center;
		max-width: 764px;
		margin-inline: auto;
	}

	.tile {
		display: flex;
		flex-direction: column;
		align-items: center;
	}
</style>
