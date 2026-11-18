<!--
@component
Cards of a tag browser page, each linking to its card page. Grouping and sorting live in the URL.
-->
<script lang="ts">
	import {
		buildUrlForSettings,
		FlexibleCardDisplay,
		searchParamsToSettings,
		type CardItem,
		type GroupingSortingSettings
	} from '@5argon/arkham-life-ui';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { cardHref } from '$lib/tag-browser';

	let { items }: { items: CardItem[] } = $props();

	function applySettings(settings: GroupingSortingSettings) {
		goto(buildUrlForSettings(settings, page.url), { replace: true, reset: false });
	}
</script>

{#if items.length > 0}
	<FlexibleCardDisplay
		cards={items}
		defaultViewMode="scans"
		initialSettings={searchParamsToSettings(page.url.searchParams)}
		onSettingsApply={applySettings}
		cardHref={(item) => cardHref(item.card.code)}
	/>
{/if}
