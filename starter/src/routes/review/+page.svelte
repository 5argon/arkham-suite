<script lang="ts">
	import { Button, FaIconType, PageLead } from '@5argon/arkham-life-ui';
	import type { Product } from '@5argon/arkham-kohaku';

	import OpenGraph from '$lib/components/OpenGraph.svelte';
	import ReviewProductSelector from '$lib/design/pages/review/ReviewProductSelector.svelte';
	import ReviewSubmissionModal from '$lib/design/pages/review/ReviewSubmissionModal.svelte';
	import WhatsCardReviewModal from '$lib/design/pages/review/WhatsCardReviewModal.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { reviewProductHref } from '$lib/review/paths';
	import { productToExploreRoute } from '$lib/utility/product';
	import { rewardRoute } from '$lib/utility/reward';

	import type { PageProps } from './$types';

	const { data }: PageProps = $props();

	const href = (product: Product) => reviewProductHref(productToExploreRoute(product));
	let showWhatsCardReview = $state(false);
	let showSubmission = $state(false);
</script>

<OpenGraph
	description={m.review_description()}
	image="image/resource/review.webp"
	title={m.review_title()}
	url="/review"
	canonical
/>

<PageLead description={m.review_description()} title={m.review_title()} />

<ReviewProductSelector
	{href}
	recents={data.recents}
	reward={data.reward}
	rewardHref={reviewProductHref(rewardRoute)}
	snapshotId="review-environment"
	summaries={data.summaries}
>
	<div class="mt-2 flex flex-wrap justify-center gap-2">
		<Button
			icon={FaIconType.NoticeInfo}
			label={m.review_whats_button()}
			onClick={() => (showWhatsCardReview = true)}
		/>
		<Button label={m.review_submission_button()} onClick={() => (showSubmission = true)} />
		<Button label={m.review_preview_season_button()} onClick="/review/preview-season" />
		<Button label={m.review_reviewers_button()} onClick="/review/reviewers" />
	</div>
</ReviewProductSelector>

<WhatsCardReviewModal isOpen={showWhatsCardReview} onClose={() => (showWhatsCardReview = false)} />
<ReviewSubmissionModal isOpen={showSubmission} onClose={() => (showSubmission = false)} />
