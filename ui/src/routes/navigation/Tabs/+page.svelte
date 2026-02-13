<script lang="ts">
	import Tabs, { type TabItem } from '$lib/navigation/Tabs.svelte';
	import { createRawSnippet } from 'svelte';
	const beforeSnippet = createRawSnippet(() => {
		return {
			render: () => {
				return 'B';
			}
		};
	});
	const afterSnippet = createRawSnippet(() => {
		return {
			render: () => {
				return 'A';
			}
		};
	});
	const tabItems: TabItem[] = [
		{
			label: 'Players & Decks'
		},
		{
			label: 'Campaign Log',
			before: beforeSnippet
		},
		{
			label: 'Details',
			after: afterSnippet
		}
	];
	let activeTabIndex = $state(0);
</script>

<Tabs
	{activeTabIndex}
	onTabChange={(i) => {
		activeTabIndex = i;
	}}
	direction="horizontal"
	tabs={tabItems}
/>

<div class="my-4"></div>

<Tabs
	{activeTabIndex}
	onTabChange={(i) => {
		activeTabIndex = i;
	}}
	direction="vertical"
	tabs={tabItems}
/>

<div class="my-4"></div>

<Tabs
	{activeTabIndex}
	onTabChange={(i) => {
		activeTabIndex = i;
	}}
	direction="horizontal"
	tabs={tabItems}
	accentColor="#4CAF50"
/>

<div class="my-4"></div>

<Tabs
	{activeTabIndex}
	onTabChange={(i) => {
		activeTabIndex = i;
	}}
	direction="vertical"
	tabs={tabItems}
	accentColor="#4CAF50"
/>
