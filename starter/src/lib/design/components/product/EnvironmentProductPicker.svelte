<!--
@component
What to build from on top of Core Set 2026: an environment selector presets the products, and every
product can still be toggled individually below it, sectioned into Evergreen products and Rotating expansions.
Only the latest Current environment is shown up front, a smaller button opens the previous ones.
Core Set 2026 is always shown in Evergreen Products, checked and locked, so it is clear what every
choice includes. It is all that shows on Core Set 2026 Only, and Rotating Expansions only shows once
something rotating has been released. Shared by the Team Builder setup and the starter library
filter. `withChapterTwo` adds a choice of everything across all the Current environments so far, and
starts on it. It has no page of its own to view its cards on.
-->
<script lang="ts">
	import { Button, FaIconType, RadioButtons, SectionSeparator } from '@5argon/arkham-life-ui';
	import { Product, productEvergreen } from '@5argon/arkham-kohaku';
	import { u as stringUtils } from '@5argon/arkham-string';
	import { untrack } from 'svelte';

	import { getAllCards } from '$lib/card-data';
	import * as m from '$lib/paraglide/messages.js';
	import {
		chapterTwoChoice,
		type EnvironmentChoice,
		environmentChoicePath,
		environmentChoices,
		matchingChoice,
		rotatingProducts
	} from '$lib/tool/environment-choices';

	import ProductTiles from './ProductTiles.svelte';

	interface Prop {
		/**
		 * Excludes Core Set 2026, which is always in.
		 */
		selected: Product[];
		onChange: (products: Product[]) => void;
		withChapterTwo?: boolean;
		/**
		 * Stay checked whatever is picked, on top of Core Set 2026.
		 */
		lockedProducts?: Product[];
	}
	const { selected, onChange, withChapterTwo = false, lockedProducts = [] }: Prop = $props();

	const today = new Date();
	const allCards = getAllCards();
	const chapterTwo = chapterTwoChoice(today, allCards);
	const choices = [
		...environmentChoices(today, allCards),
		...(untrack(() => withChapterTwo) ? [chapterTwo] : [])
	];
	const rotating = rotatingProducts(today, allCards);
	const currentChoices = choices.filter((choice) => choice.kind === 'current');
	const mainChoices = choices.filter(
		(choice) => choice.kind !== 'current' || choice === currentChoices.at(-1)
	);
	const previousChoices = currentChoices.slice(0, -1).reverse();
	// Chapter 2 and an environment can have the same products, so the one clicked stays lit.
	let picked = $state.raw<EnvironmentChoice | undefined>(
		untrack(() => withChapterTwo) ? chapterTwo : undefined
	);
	const selectedChoice = $derived(
		picked !== undefined && matchingChoice([picked], selected) !== undefined
			? picked
			: matchingChoice(choices, selected)
	);
	function pick(choice: EnvironmentChoice | undefined) {
		if (choice === undefined) return;
		picked = choice;
		onChange([...new Set([...choice.products, ...lockedProducts])]);
	}
	const coreOnly = $derived(selectedChoice?.kind === 'core');
	let previousOpen = $state(false);
	const previousVisible = $derived(
		previousOpen || (selectedChoice !== undefined && previousChoices.includes(selectedChoice))
	);

	function productNameOf(choice: EnvironmentChoice): string {
		return choice.product === undefined ? '' : stringUtils.productName(choice.product);
	}

	function choiceLabel(choice: EnvironmentChoice): string {
		switch (choice.kind) {
			case 'core':
				return m.common_environment_core_only({
					core: stringUtils.productName(Product.CoreSet2026)
				});
			case 'evergreen':
				return m.common_evergreen_products();
			case 'current':
				return m.common_environment_current({ name: productNameOf(choice) });
			case 'chapter-two':
				return m.common_environment_chapter_two();
		}
	}

	function toggle(product: Product) {
		if (isLocked(product)) return;
		onChange(
			selected.includes(product)
				? selected.filter((p) => p !== product)
				: [...selected, product]
		);
	}

	const isLocked = (product: Product) =>
		product === Product.CoreSet2026 || lockedProducts.includes(product);
	const tileProps = {
		onClick: (product: Product) => () => toggle(product),
		active: (product: Product) => isLocked(product) || selected.includes(product),
		locked: isLocked
	};
</script>

<RadioButtons
	choices={mainChoices.map((choice) => ({
		value: choice as EnvironmentChoice | undefined,
		label: choiceLabel(choice)
	}))}
	label={m.common_environment()}
	bind:selectedValue={() => selectedChoice, pick}
/>
{#if previousChoices.length > 0}
	{#if previousVisible}
		<RadioButtons
			choices={previousChoices.map((choice) => ({
				value: choice as EnvironmentChoice | undefined,
				label: productNameOf(choice)
			}))}
			label={m.common_environment_previous()}
			bind:selectedValue={() => selectedChoice, pick}
		/>
	{/if}
{/if}
<div class="my-2 flex flex-wrap items-center gap-3">
	{#if selectedChoice === undefined || selectedChoice.kind === 'chapter-two'}
		<Button disabled icon={FaIconType.ExternalLink} label={m.explore_view_all_cards()} onClick={() => {}} />
	{:else}
		<Button
			icon={FaIconType.ExternalLink}
			label={m.explore_view_all_cards()}
			newTab
			onClick={environmentChoicePath(selectedChoice)}
		/>
	{/if}
	{#if previousChoices.length > 0 && !previousVisible}
		<button
			type="button"
			class="text-primary-700 dark:text-primary-300 cursor-pointer text-sm underline"
			onclick={() => (previousOpen = true)}
		>
			{m.common_environment_previous()}
		</button>
	{/if}
</div>

<SectionSeparator inner title={m.common_evergreen_products()} />
<ProductTiles products={coreOnly ? [Product.CoreSet2026] : productEvergreen} {...tileProps} />

{#if !coreOnly && rotating.length > 0}
	<SectionSeparator inner title={m.common_rotating_expansions()} />
	<ProductTiles products={rotating} {...tileProps} />
{/if}
