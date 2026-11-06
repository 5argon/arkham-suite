<script lang="ts">
	import { PageLead } from '@5argon/arkham-life-ui';
	import type { Product } from '@5argon/arkham-kohaku';

	import OpenGraph from '$lib/components/OpenGraph.svelte';
	import ReviewProductSelector from '$lib/design/pages/review/ReviewProductSelector.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { previewSeasonProductHref } from '$lib/review/paths';
	import { productToExploreRoute } from '$lib/utility/product';

	import type { PageProps } from './$types';

	const { data }: PageProps = $props();

	const href = (product: Product) => previewSeasonProductHref(productToExploreRoute(product));
</script>

<OpenGraph
	description={m.review_preview_season_description()}
	image="image/resource/review.webp"
	title={m.review_preview_season_title()}
	url="/review/preview-season"
	canonical
/>

<PageLead
	description={m.review_preview_season_description()}
	title={m.review_preview_season_title()}
/>

<ReviewProductSelector {href} snapshotId="preview-season-environment" summaries={data.summaries} />
