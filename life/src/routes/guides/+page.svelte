<script lang="ts">
	import { onMount } from 'svelte';
	import { BackButton, MarginFull, PageLead, Tabs } from '@5argon/arkham-life-ui';
	import * as m from '$lib/paraglide/messages.js';
	// Static imports (not the lazy <Doc>) so the active tab is server-rendered and switches instantly.
	import Database from '$lib/docs/guide/database/en.md';
	import FileTypes from '$lib/docs/guide/file-types/en.md';
	import Players from '$lib/docs/guide/players/en.md';

	const TABS = [
		{ key: 'database', label: 'Database', Body: Database },
		{ key: 'file-types', label: 'Exporting File Types', Body: FileTypes },
		{ key: 'players', label: 'You, Players & Play Groups', Body: Players }
	];

	let active = $state(0);
	const Body = $derived(TABS[active].Body);

	// Open the tab named by the URL hash (/guides#file-types); client-only to avoid a hydration mismatch.
	onMount(() => {
		const key = location.hash.replace(/^#/, '');
		const i = TABS.findIndex((t) => t.key === key);
		if (i >= 0) active = i;
	});
</script>

<svelte:head>
	<title>{m.guides_page_title()}</title>
</svelte:head>

<MarginFull>
	<div class="mb-4">
		<BackButton label="Home" onClick="/" />
	</div>

	<PageLead title={m.guides_title()} description={m.guides_description()} />

	<Tabs
		direction="horizontal"
		activeTabIndex={active}
		onTabChange={(i) => (active = i)}
		tabs={TABS.map((t) => ({ label: t.label }))}
	/>

	<div class="mt-4 max-w-2xl">
		<Body />
	</div>
</MarginFull>
