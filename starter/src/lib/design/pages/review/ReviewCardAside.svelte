<!--
@component
The card itself beside what's said about it: its name, where else to go, its picture and its text.
Stays in view while scrolling on a large screen.
-->
<script lang="ts">
	import { type Card, card as cardUtils } from '@5argon/arkham-kohaku';
	import {
		Button,
		CardTextBlock,
		type CardTextHtml,
		FaIconType,
		Foldout,
		getCardBackImagePath,
		getCardImagePath
	} from '@5argon/arkham-life-ui';

	import * as m from '$lib/paraglide/messages.js';

	interface Prop {
		card: Card;
		text: CardTextHtml;
		arkhamBuildUrl: string;
		arkhamdbReviewsUrl: string;
	}
	const { card, text, arkhamBuildUrl, arkhamdbReviewsUrl }: Prop = $props();

	// The text is right below it, so on a small screen the picture only needs to be recognizable.
	const scanClass = $derived(
		cardUtils.isHorizontalCard(card)
			? 'mx-auto w-full max-w-64 md:mx-0 md:max-w-none'
			: 'mx-auto w-full max-w-40 md:mx-0 md:max-w-60'
	);
	const backImage = $derived(getCardBackImagePath(card, 'full'));
</script>

<aside
	class="md:sticky md:top-2 md:max-h-[calc(100vh-1rem)] md:w-80 md:shrink-0 md:overflow-y-auto md:pr-2"
>
	<h1 class="text-primary-900 dark:text-primary-100 text-2xl leading-tight">{card.name}</h1>
	{#if card.subname}
		<p class="text-primary-800 dark:text-primary-200 text-sm italic">{card.subname}</p>
	{/if}
	<div class="mt-2 flex flex-col items-start gap-1">
		<Button
			icon={FaIconType.ExternalLink}
			label={m.review_open_arkham_build()}
			newTab
			onClick={arkhamBuildUrl}
		/>
		<Button
			icon={FaIconType.ExternalLink}
			label={m.review_open_arkhamdb()}
			newTab
			onClick={arkhamdbReviewsUrl}
		/>
	</div>
	<img
		alt={card.name}
		class="mt-2 mb-3 rounded-md {scanClass}"
		src={getCardImagePath(card.code, 'full')}
	/>
	<CardTextBlock side={text.front} />
	{#if backImage || text.back}
		<Foldout openOnDesktop title={m.review_card_back()}>
			<div class="p-2 md:p-0">
				{#if backImage}
					<img
						alt={`${card.name} (back)`}
						class="mb-3 rounded-md {scanClass}"
						loading="lazy"
						src={backImage}
					/>
				{/if}
				{#if text.back}
					<CardTextBlock side={text.back} />
				{/if}
			</div>
		</Foldout>
	{/if}
</aside>

<style>
	h1 {
		font-family: 'Heading';
	}
</style>
