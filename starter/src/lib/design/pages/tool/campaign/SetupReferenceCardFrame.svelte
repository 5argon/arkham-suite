<script lang="ts">
	import type { Scenario } from '$lib/core/campaign';
	import { Campaign, color, convert, strings } from '@5argon/arkham-kohaku';
	import { EncounterSetIcon, ProductIcon } from '@5argon/arkham-icon';
	import * as m from '$lib/paraglide/messages.js';
	import { u } from '@5argon/arkham-string';
	import type { Snippet } from 'svelte';
	import { fade } from 'svelte/transition';

	let {
		campaign,
		scenario,
		isBack = false,
		children
	}: {
		campaign: Campaign;
		scenario: Scenario;
		isBack?: boolean;
		children: Snippet;
	} = $props();

	const campaignAbbreviation = $derived(strings.campaignAbbreviation(campaign));

	const campaignProduct = $derived.by(() => {
		return convert.campaignToProduct(campaign);
	});

	const campaignColors = $derived.by(() => {
		const product = convert.campaignToProduct(campaign);
		const colors = color.productToColors(product);
		return {
			iconLight: color.getColor(colors, 700, false),
			iconDark: color.getColor(colors, 700, true),
			textLight: color.getColor(colors, 900, false),
			textDark: color.getColor(colors, 900, true),
			campaignNameLight: color.getColor(colors, 800, false),
			campaignNameDark: color.getColor(colors, 800, true),
			setupReferenceCardLight: color.getColor(colors, 700, false),
			setupReferenceCardDark: color.getColor(colors, 700, true)
		};
	});
</script>

<div
	class="setup-reference-card {isBack
		? 'setup-reference-card-back'
		: ''} bordered bg-white dark:bg-primary-800 mx-auto shadow-lg"
>
	<div
		class="content-area border border-primary-200 dark:border-primary-500 border-opacity-10"
		style="border-radius: 29px;"
	>
		{#key scenario}
			<div
				class="header-with-background inline-flex items-center"
				style="--bg-image: url('/image/expansion/campaign-background/{campaignAbbreviation}.webp'); border-radius: 20px 20px 0 0;"
				in:fade={{ duration: 200 }}
			>
				<div
					class="campaign-icon leading-none text-[2rem] pr-2"
					style="--campaign-color-light: {campaignColors.iconLight}; --campaign-color-dark: {campaignColors.iconDark};"
				>
					<EncounterSetIcon encounterSet={scenario.representativeSet} />
				</div>
				<div
					class="scenario-name text-secondary-900 dark:text-secondary-100 text-[1.5rem] leading-none flex items-center"
					style="--campaign-text-color-light: {campaignColors.textLight}; --campaign-text-color-dark: {campaignColors.textDark};"
				>
					<span class="relative top-[0.15em]"
						>{scenario.overrideName ?? u.encounterSetName(scenario.representativeSet)}</span
					>
				</div>
			</div>
		{/key}

		{@render children()}

		<div class="footer bg-white dark:bg-primary-800 px-2">
			<div class="flex flex-col items-end mr-1">
				<span
					class="leading-none campaign-name"
					style="--campaign-text-color-light: {campaignColors.campaignNameLight}; --campaign-text-color-dark: {campaignColors.campaignNameDark};"
					>{u.campaignName(campaign)}</span
				>
				<span
					class="setup-reference-text leading-none text-xs"
					style="--campaign-setup-reference-card-light: {campaignColors.setupReferenceCardLight}; --campaign-setup-reference-card-dark: {campaignColors.setupReferenceCardDark};"
					>{m.tool_setup_reference_card()}</span
				>
			</div>
			{#if campaignProduct}
				<div
					class="campaign-icon leading-none text-2xl"
					style="--campaign-color-light: {campaignColors.textLight}; --campaign-color-dark: {campaignColors.textDark};"
				>
					<ProductIcon product={campaignProduct} />
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	.setup-reference-card {
		width: 100%;
		padding: 1rem;
		overflow: visible;
	}

	@media (min-width: 640px) {
		.setup-reference-card {
			width: 600px;
			height: 832px;
			padding: 40px;
			overflow: hidden;
		}
	}

	.content-area {
		padding: 10px;
		position: relative;
		height: auto;
		display: flex;
		flex-direction: column;
	}

	@media (min-width: 640px) {
		.content-area {
			height: 100%;
		}
	}

	.header-with-background {
		position: relative;
		padding: 12px 16px;
		overflow: hidden;
		isolation: isolate;
	}

	.header-with-background::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-size: cover;
		background-position: center;
		background-repeat: no-repeat;
		background-image: var(--bg-image);
		z-index: 0;
	}

	.header-with-background::after {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(255, 255, 255, 0.65);
		z-index: 1;
	}

	.header-with-background > * {
		position: relative;
		z-index: 2;
	}

	:global(.dark) .header-with-background::before,
	:global(.dark) .header-with-background::after {
		display: none;
	}

	.scenario-name {
		font-family: 'Heading';
		color: var(--campaign-text-color-light);
	}

	:global(.dark) .scenario-name {
		color: var(--campaign-text-color-dark);
	}

	.campaign-name {
		font-family: 'Heading';
		font-size: 0.8rem;
		color: var(--campaign-text-color-light);
	}

	:global(.dark) .campaign-name {
		color: var(--campaign-text-color-dark);
	}

	.setup-reference-text {
		color: var(--campaign-setup-reference-card-light);
	}

	:global(.dark) .setup-reference-text {
		color: var(--campaign-setup-reference-card-dark);
	}

	.campaign-icon {
		color: var(--campaign-color-light);
	}

	:global(.dark) .campaign-icon {
		color: var(--campaign-color-dark);
	}

	.footer {
		position: relative;
		bottom: auto;
		right: auto;
		display: flex;
		align-items: end;
		justify-content: flex-end;
		gap: 8px;
		margin-top: 1rem;
	}

	@media (min-width: 640px) {
		.footer {
			position: absolute;
			bottom: -12px;
			right: 20px;
			margin-top: 0;
		}
	}
</style>
