<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { BackButton, Button, FaIconType, MarginFull, PageLead } from '@5argon/arkham-life-ui';
	import * as m from '$lib/paraglide/messages.js';
	import { databaseStore } from '$lib/database/database.svelte';
	import { preloader } from '$lib/preload/preloader.svelte';
	import type { PageProps } from './$types';
	import ArchivedCampaignListItem from '$lib/components/archive/ArchivedCampaignListItem.svelte';
	import ArchiveListView from '$lib/components/archive/ArchiveListView.svelte';
	import FilterModal from '$lib/components/archive/FilterModal.svelte';

	const { data }: PageProps = $props();

	onMount(() => preloader.warmSection('archive'));

	const currentUserId = $derived(databaseStore.doc?.owner.uid ?? '');
	const PAGE_SIZE = 20;

	// URL-derived truth (the shared view owns the controlled inputs + their navigation).
	const sortBy = $derived(
		(page.url.searchParams.get('sort') ?? 'date') as 'date' | 'campaign' | 'difficulty',
	);
	const nameParam = $derived(page.url.searchParams.get('name') ?? '');
	const currentPage = $derived(Number(page.url.searchParams.get('page') ?? '1'));

	const sortOptions = $derived([
		{ value: 'date', label: m.archive_sort_date() },
		{ value: 'campaign', label: m.archive_sort_campaign() },
		{ value: 'difficulty', label: m.archive_sort_difficulty() },
	]);

	// ─── Filters (campaign facets; multi-select; URL-driven, before pagination) ───
	const FILTER_KEYS = ['camp', 'who', 'inv', 'outcome', 'pc', 'solo'] as const;
	function listParam(key: string): string[] {
		const raw = page.url.searchParams.get(key);
		return raw ? raw.split(',').filter(Boolean) : [];
	}
	const activeFilters = $derived(FILTER_KEYS.reduce((n, k) => n + listParam(k).length, 0));
	const playGroups = $derived(
		(databaseStore.doc?.playGroups ?? []).map((g) => ({
			uid: g.uid,
			name: g.name,
			memberUids: g.memberUids,
		})),
	);

	let filterOpen = $state(false);
	let dCampaigns = $state(new Set<string>());
	let dPlayers = $state(new Set<string>());
	let dInvestigators = $state(new Set<string>());
	let dOutcomes = $state(new Set<string>());
	let dPlayerCounts = $state(new Set<number>());
	let dSolo = $state(new Set<string>());

	function openFilters() {
		dCampaigns = new Set(listParam('camp'));
		dPlayers = new Set(listParam('who'));
		dInvestigators = new Set(listParam('inv'));
		dOutcomes = new Set(listParam('outcome'));
		dPlayerCounts = new Set(listParam('pc').map(Number));
		dSolo = new Set(listParam('solo'));
		filterOpen = true;
	}

	function toggleSet<T>(s: Set<T>, v: T): Set<T> {
		const n = new Set(s);
		if (n.has(v)) n.delete(v);
		else n.add(v);
		return n;
	}
	function toggleFilter(cat: 'outcome' | 'pc' | 'solo', value: string | number) {
		if (cat === 'outcome') dOutcomes = toggleSet(dOutcomes, String(value));
		else if (cat === 'pc') dPlayerCounts = toggleSet(dPlayerCounts, Number(value));
		else dSolo = toggleSet(dSolo, String(value));
	}
	function setCampaigns(codes: string[]) {
		dCampaigns = new Set(codes);
	}
	function setPlayers(uids: string[]) {
		dPlayers = new Set(uids);
	}
	function setInvestigators(codes: string[]) {
		dInvestigators = new Set(codes);
	}
	function toggleGroup(memberUids: string[]) {
		const avail = new Set(data.filterOptions.players.map((p) => p.uid));
		const members = memberUids.filter((u) => avail.has(u));
		const allOn = members.length > 0 && members.every((u) => dPlayers.has(u));
		const n = new Set(dPlayers);
		for (const u of members) {
			if (allOn) n.delete(u);
			else n.add(u);
		}
		dPlayers = n;
	}

	function applyFilters() {
		const sp = new URLSearchParams(page.url.searchParams);
		const setParam = (key: string, vals: Set<string> | Set<number>) => {
			const joined = [...vals].join(',');
			if (joined) sp.set(key, joined);
			else sp.delete(key);
		};
		setParam('camp', dCampaigns);
		setParam('who', dPlayers);
		setParam('inv', dInvestigators);
		setParam('outcome', dOutcomes);
		setParam('pc', dPlayerCounts);
		setParam('solo', dSolo);
		sp.set('page', '1');
		goto(`/archive?${sp.toString()}`, { keepFocus: true });
		filterOpen = false;
	}
	function clearFilters() {
		const sp = new URLSearchParams(page.url.searchParams);
		for (const k of FILTER_KEYS) sp.delete(k);
		sp.set('page', '1');
		goto(`/archive?${sp.toString()}`, { keepFocus: true });
		dCampaigns = new Set();
		dPlayers = new Set();
		dInvestigators = new Set();
		dOutcomes = new Set();
		dPlayerCounts = new Set();
		dSolo = new Set();
		filterOpen = false;
	}
</script>

<svelte:head>
	<title>{m.archive_page_title()}</title>
</svelte:head>

<MarginFull>
	<div class="mb-4">
		<BackButton label="Home" onClick="/" />
	</div>
	<PageLead description={m.archive_description()} title={m.archive_title()} />

	<div class="mb-6 flex justify-center gap-3">
		<Button
			label={m.archive_new_campaign()}
			onClick="/archive/new"
			icon={FaIconType.Add}
			highlighted
		/>
		<Button
			label="Go to Standalone Archive"
			onClick="/archive/standalone"
			icon={FaIconType.StandaloneSource}
		/>
		<Button
			label={m.archive_import_export_button()}
			onClick="/archive/import-export"
			icon={FaIconType.Import}
		/>
	</div>

	<ArchiveListView
		basePath="/archive"
		items={data.campaigns}
		totalCount={data.totalCount}
		filteredIds={data.filteredIds}
		pageSize={PAGE_SIZE}
		{currentPage}
		name={nameParam}
		namePlaceholder={m.archive_filter_name_placeholder()}
		sort={sortBy}
		{sortOptions}
		{activeFilters}
		onOpenFilters={openFilters}
		onClearFilters={clearFilters}
		exportSuffix="-campaigns"
		exportDescription="arkham.life campaigns (zip)"
		exportSelectedLabel={m.archive_export_selected()}
		emptyText={m.archive_no_campaigns()}
	>
		{#snippet item(campaign, sel)}
			<ArchivedCampaignListItem
				{campaign}
				cardsByCode={data.cardsByCode}
				{currentUserId}
				selectable={sel.selectionMode}
				selected={sel.selected}
				onToggle={sel.toggle}
			/>
		{/snippet}
	</ArchiveListView>

	<FilterModal
		isOpen={filterOpen}
		options={data.filterOptions}
		{playGroups}
		campaigns={dCampaigns}
		players={dPlayers}
		investigators={dInvestigators}
		outcomes={dOutcomes}
		playerCounts={dPlayerCounts}
		soloTypes={dSolo}
		onToggle={toggleFilter}
		onSetCampaigns={setCampaigns}
		onSetPlayers={setPlayers}
		onSetInvestigators={setInvestigators}
		onToggleGroup={toggleGroup}
		onClear={clearFilters}
		onApply={applyFilters}
		onClose={() => (filterOpen = false)}
	/>
</MarginFull>
