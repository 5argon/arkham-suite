<!--
@component
The title and the Tags / Cards tabs of the tag browser's two front pages.
-->
<script lang="ts">
	import { MarginFull, PageLead, Tabs } from '@5argon/arkham-life-ui';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import OpenGraph from '$lib/components/OpenGraph.svelte';
	import * as m from '$lib/paraglide/messages.js';

	let { active }: { active: 'tags' | 'cards' } = $props();

	const tabs = [
		{ label: m.tool_tag_browser_mode_tags() },
		{ label: m.tool_tag_browser_mode_card() }
	];

	function onTabChange(index: number) {
		goto(index === 0 ? resolve('/tool/tag-browser') : resolve('/tool/tag-browser/cards'));
	}
</script>

<OpenGraph
	description="Browse every game-effect tag and compound archetype, and see which cards carry them."
	image="image/resource/card.webp"
	title="Tag Browser"
	url="/tool/tag-browser"
/>

<svelte:head>
	<title>{m.tool_tag_browser_page_title()}</title>
</svelte:head>

<PageLead
	description="Browse every game-effect tag and compound archetype, and see which cards carry them."
	title={m.tool_tag_browser_title()}
/>

<MarginFull>
	<Tabs direction="horizontal" {tabs} activeTabIndex={active === 'tags' ? 0 : 1} {onTabChange} />
</MarginFull>
