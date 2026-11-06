<script lang="ts">
	import { PageLead } from '@5argon/arkham-life-ui';

	import HomeReviews from '$lib/design/pages/review/HomeReviews.svelte';
	import * as m from '$lib/paraglide/messages.js';

	import type { PageProps } from './$types';
	import ResourcePage from './resource/ResourcePage.svelte';

	const { data }: PageProps = $props();
</script>

<svelte:head>
	<title>{m.common_home_page_title()}</title>
</svelte:head>

<PageLead description={m.common_home_description()} title={m.common_arkham_starter()}></PageLead>

<ResourcePage>
	{#snippet afterStarterContents()}
		<HomeReviews rows={data.reviews} />
	{/snippet}
</ResourcePage>
