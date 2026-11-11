<!--
@component
Picks a Chapter 2 product, narrowed down by the environment selector, showing how much there is to
see in each. A product still in preview season has no environment yet, so only Entire Chapter 2
shows it. The Reward cards tile, when given, shows whatever is picked. Recent reviews follow the
same choice, by the products of the cards they speak about. A page with this gives it its own
`snapshotId`.
-->
<script lang="ts">
	import { snapshot } from '$app/navigation';
	import { ReviewCounts, type ReviewCountsData, SectionSeparator } from '@5argon/arkham-life-ui';
	import {
		Product,
		productCoreSetsChapterTwo,
		productInvestigatorDeck
	} from '@5argon/arkham-kohaku';
	import { m as stringMessages } from '@5argon/arkham-string';
	import { type Snippet, untrack } from 'svelte';

	import EnvironmentChoiceSelector from '$lib/design/components/product/EnvironmentChoiceSelector.svelte';
	import RecentReviews from '$lib/design/pages/review/RecentReviews.svelte';
	import ProductTiles from '$lib/design/components/product/ProductTiles.svelte';
	import RewardSetButton from '$lib/design/components/product/RewardSetButton.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import type { RecentReviewRow, RewardReviewSummary } from '$lib/server/reviews';
	import {
		chapterTwoChoice,
		type EnvironmentChoice,
		environmentChoices
	} from '$lib/tool/environment-choices';

	interface Prop {
		summaries: { product: Product; counts: ReviewCountsData }[];
		href: (product: Product) => string;
		snapshotId: string;
		recents?: RecentReviewRow[];
		/**
		 * Every Reward card as one more tile, linking to `rewardHref`.
		 */
		reward?: RewardReviewSummary;
		rewardHref?: string;
		/**
		 * Between the selector and the products.
		 */
		children?: Snippet;
	}
	const {
		summaries,
		href,
		snapshotId,
		recents = [],
		reward,
		rewardHref,
		children
	}: Prop = $props();

	const initial = untrack(() => summaries);
	const cards = initial.map(({ product }) => ({ product }));
	const today = new Date();
	const chapterTwo = chapterTwoChoice(today, cards);
	const choices = [...environmentChoices(today, cards), chapterTwo];
	const countsOf = new Map(initial.map(({ product, counts }) => [product, counts]));

	let picked = $state.raw<EnvironmentChoice>(chapterTwo);
	snapshot({
		id: untrack(() => snapshotId),
		capture: () => choices.indexOf(picked),
		restore: (index) => (picked = choices[index] ?? chapterTwo)
	});

	const inPicked = (product: Product) =>
		picked === chapterTwo || product === Product.CoreSet2026 || picked.products.includes(product);
	const available = (products: readonly Product[]) =>
		products.filter((product) => countsOf.has(product) && inPicked(product));
	const shownRecents = $derived(
		recents
			.map((row) => ({
				...row,
				cards: row.cards.filter((card) => card.reward || card.products.some(inPicked))
			}))
			.filter((row) => row.cards.length > 0)
	);
	const core = $derived(available(productCoreSetsChapterTwo));
	const decks = $derived(available(productInvestigatorDeck));
	const rotating = $derived(
		available(
			initial
				.map(({ product }) => product)
				.filter(
					(product) =>
						!productCoreSetsChapterTwo.includes(product) &&
						!productInvestigatorDeck.includes(product)
				)
		)
	);
</script>

{#snippet caption(product: Product)}
	<span class="min-h-5">
		<ReviewCounts counts={countsOf.get(product)!} />
	</span>
{/snippet}

<div class="flex flex-col items-center">
	<EnvironmentChoiceSelector {choices} onPick={(choice) => (picked = choice)} selected={picked} />
</div>

{@render children?.()}

<RecentReviews rows={shownRecents} />

{#if core.length > 0}
	<SectionSeparator title={m.review_section_chapter_two()} />
	<ProductTiles {caption} onClick={href} products={core} />
{/if}

{#if decks.length > 0}
	<SectionSeparator inner title={stringMessages.productTypeInvestigatorDeck()} />
	<ProductTiles {caption} onClick={href} products={decks} />
{/if}

{#if rotating.length > 0}
	<SectionSeparator inner title={m.common_rotating_expansions()} />
	<ProductTiles {caption} onClick={href} products={rotating} />
{/if}

{#if reward !== undefined && rewardHref !== undefined}
	<SectionSeparator inner title={stringMessages.playerCategoryReward()} />
	<div class="flex flex-col items-center">
		<RewardSetButton onClick={rewardHref} />
		<span class="min-h-5">
			<ReviewCounts counts={reward.counts} />
		</span>
	</div>
{/if}
