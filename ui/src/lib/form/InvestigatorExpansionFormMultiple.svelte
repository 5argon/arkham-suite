<!-- 
 @component
 A form for selecting multiple investigator expansions with a dropdown.
 Displays selected expansions as a list with delete buttons.
 -->
<script lang="ts">
	import { Product, productReturnTo, productInvestigatorDeck } from '@5argon/arkham-kohaku';
	import { ProductIcon } from '@5argon/arkham-icon';
	import { u as stringUtils } from '@5argon/arkham-string';

	import SearchableDropdown from './SearchableDropdown.svelte';
	import Button from '../button/Button.svelte';
	import { FaIconType } from '../icon/index.js';
	import * as m from '../paraglide/messages.js';

	interface Prop {
		/**
		 * Label for the search input.
		 */
		label: string;

		/**
		 * All available products to search from.
		 */
		products: Product[];

		/**
		 * Array of selected products.
		 */
		selectedProducts: Product[];

		/**
		 * Callback when selection changes.
		 */
		onSelectionChange: (products: Product[]) => void;

		/**
		 * Placeholder text for search input.
		 */
		placeholder?: string;
	}

	let { label, products, selectedProducts, onSelectionChange, placeholder }: Prop = $props();

	// Create product objects with name for searching
	interface SearchableProduct {
		product: Product;
		name: string;
	}

	const searchableProducts = $derived.by((): SearchableProduct[] => {
		return products.map((product) => ({
			product,
			name: stringUtils.productName(product)
		}));
	});

	function handleSelect(item: SearchableProduct) {
		if (!selectedProducts.includes(item.product)) {
			onSelectionChange([...selectedProducts, item.product]);
		}
	}

	function handleRemove(product: Product) {
		onSelectionChange(selectedProducts.filter((p) => p !== product));
	}

	function getProductColorClasses(product: Product): string {
		if (productReturnTo.includes(product)) {
			return 'text-survivor-600 dark:text-survivor-400';
		} else if (productInvestigatorDeck.includes(product)) {
			return 'text-guardian-600 dark:text-guardian-400';
		} else {
			return 'text-primary-600 dark:text-primary-400';
		}
	}

	function handleClearAll() {
		onSelectionChange([]);
	}
</script>

<div class="flex items-start gap-2">
	<div class="w-[460px]">
		<SearchableDropdown
			{label}
			{placeholder}
			items={searchableProducts}
			searchKeys={['name']}
			onSelect={handleSelect}
			fuzzyThreshold={0.3}
			width="460px"
		>
			{#snippet renderItem(item: SearchableProduct)}
				<span class={getProductColorClasses(item.product)}>
					<ProductIcon product={item.product} />
				</span>
				<span class="text-primary-900 dark:text-primary-100">{item.name}</span>
			{/snippet}

			{#snippet selectedItems()}
				{#if selectedProducts.length > 0}
					<div class="space-y-1">
						{#each selectedProducts as product (product)}
							<div
								class="hover:bg-primary-100 dark:hover:bg-primary-800 flex items-center gap-2 rounded p-2 transition-colors"
							>
								<Button
									label={m.button_remove()}
									onClick={() => handleRemove(product)}
									hideLabel
									icon={FaIconType.Delete}
								/>
								<span class={getProductColorClasses(product)}>
									<ProductIcon {product} />
								</span>
								<span class="text-primary-900 dark:text-primary-100"
									>{stringUtils.productName(product)}</span
								>
							</div>
						{/each}
					</div>
				{/if}
			{/snippet}
		</SearchableDropdown>
	</div>
	{#if selectedProducts.length > 0}
		<div class="pt-6">
			<Button
				label={m.button_clear_all()}
				onClick={handleClearAll}
				icon={FaIconType.DeleteList}
				hideLabel
			/>
		</div>
	{/if}
</div>
