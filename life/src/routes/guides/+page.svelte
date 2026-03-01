<script lang="ts">
	import { onMount } from 'svelte';
	import { BackButton, MarginFull, PageLead, Tabs } from '@5argon/arkham-life-ui';
	import * as m from '$lib/paraglide/messages.js';
	// Eager static imports (not the lazy <Doc>) so the active tab is server-rendered + present at
	// hydration, and switching tabs is instant. Each topic is its own doc folder under
	// src/lib/docs/guide/. Hardcodes the base locale (only `en` today); revisit if docs go multi-locale.
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

	// Open the tab named by the URL hash, e.g. /guides#file-types (linked from the profile page).
	// Done in onMount (client only) so SSR/hydration render the default tab without a mismatch.
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
