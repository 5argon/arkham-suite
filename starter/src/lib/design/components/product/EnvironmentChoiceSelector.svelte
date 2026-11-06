<!--
@component
The environment selector: the choices up front are the latest Current environment and what's around
it, and a smaller button opens the previous ones. Shared by whatever narrows down products by it.
-->
<script lang="ts">
	import { Button, FaIconType, RadioButtons } from '@5argon/arkham-life-ui';
	import { Product } from '@5argon/arkham-kohaku';
	import { u as stringUtils } from '@5argon/arkham-string';

	import * as m from '$lib/paraglide/messages.js';
	import { type EnvironmentChoice, environmentChoicePath } from '$lib/tool/environment-choices';

	interface Prop {
		choices: EnvironmentChoice[];
		selected: EnvironmentChoice | undefined;
		onPick: (choice: EnvironmentChoice) => void;
		/**
		 * Offers a button to see the cards of what's selected all together.
		 */
		showViewAll?: boolean;
	}
	const { choices, selected, onPick, showViewAll = false }: Prop = $props();

	const currentChoices = $derived(choices.filter((choice) => choice.kind === 'current'));
	const mainChoices = $derived(
		choices.filter((choice) => choice.kind !== 'current' || choice === currentChoices.at(-1))
	);
	const previousChoices = $derived(currentChoices.slice(0, -1).reverse());
	let previousOpen = $state(false);
	const previousVisible = $derived(
		previousOpen || (selected !== undefined && previousChoices.includes(selected))
	);

	function pick(choice: EnvironmentChoice | undefined) {
		if (choice !== undefined) onPick(choice);
	}

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
</script>

<RadioButtons
	choices={mainChoices.map((choice) => ({
		value: choice as EnvironmentChoice | undefined,
		label: choiceLabel(choice)
	}))}
	label={m.common_environment()}
	bind:selectedValue={() => selected, pick}
/>
{#if previousChoices.length > 0}
	{#if previousVisible}
		<RadioButtons
			choices={previousChoices.map((choice) => ({
				value: choice as EnvironmentChoice | undefined,
				label: productNameOf(choice)
			}))}
			label={m.common_environment_previous()}
			bind:selectedValue={() => selected, pick}
		/>
	{/if}
{/if}
<div class="my-2 flex flex-wrap items-center gap-3">
	{#if showViewAll}
		{#if selected === undefined || selected.kind === 'chapter-two'}
			<Button
				disabled
				icon={FaIconType.ExternalLink}
				label={m.explore_view_all_cards()}
				onClick={() => {}}
			/>
		{:else}
			<Button
				icon={FaIconType.ExternalLink}
				label={m.explore_view_all_cards()}
				newTab
				onClick={environmentChoicePath(selected)}
			/>
		{/if}
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
