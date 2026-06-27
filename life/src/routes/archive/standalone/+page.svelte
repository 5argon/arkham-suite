<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { BackButton, Button, FaIconType, MarginFull, PageLead } from '@5argon/arkham-life-ui';
	import * as m from '$lib/paraglide/messages.js';
	import ArchiveListView from '$lib/components/archive/ArchiveListView.svelte';
	import StandaloneArchiveListItem from '$lib/components/archive/StandaloneArchiveListItem.svelte';
	import StandaloneFilterModal from '$lib/components/archive/StandaloneFilterModal.svelte';
	import type { PageProps } from './$types';

	const { data }: PageProps = $props();

	const PAGE_SIZE = 20;
	const sortBy = $derived(
		(page.url.searchParams.get('sort') ?? 'date') as 'date' | 'name' | 'difficulty',
	);
	const nameParam = $derived(page.url.searchParams.get('name') ?? '');
	const currentPage = $derived(Number(page.url.searchParams.get('page') ?? '1'));

	const sortOptions = [
		{ value: 'date', label: m.archive_sort_date() },
		{ value: 'name', label: 'Name' },
		{ value: 'difficulty', label: m.archive_sort_difficulty() },
	];

	// ─── Filters (standalone facets; URL-driven, before pagination) ──────────────
	const FILTER_KEYS = ['src', 'diff', 'verdict'] as const;
	function listParam(key: string): string[] {
		const raw = page.url.searchParams.get(key);
		return raw ? raw.split(',').filter(Boolean) : [];
	}
	const activeFilters = $derived(FILTER_KEYS.reduce((n, k) => n + listParam(k).length, 0));

	let filterOpen = $state(false);
	let dSources = $state(new Set<string>());
	let dDifficulties = $state(new Set<string>());
	let dVerdicts = $state(new Set<string>());

	function openFilters() {
		dSources = new Set(listParam('src'));
		dDifficulties = new Set(listParam('diff'));
		dVerdicts = new Set(listParam('verdict'));
		filterOpen = true;
	}
	function toggleSet<T>(s: Set<T>, v: T): Set<T> {
		const n = new Set(s);
		if (n.has(v)) n.delete(v);
		else n.add(v);
		return n;
	}
	function toggleFilter(cat: 'source' | 'difficulty' | 'verdict', value: string) {
		if (cat === 'source') dSources = toggleSet(dSources, value);
		else if (cat === 'difficulty') dDifficulties = toggleSet(dDifficulties, value);
		else dVerdicts = toggleSet(dVerdicts, value);
	}
	function applyFilters() {
		const sp = new URLSearchParams(page.url.searchParams);
		const setParam = (key: string, vals: Set<string>) => {
			const joined = [...vals].join(',');
			if (joined) sp.set(key, joined);
			else sp.delete(key);
		};
		setParam('src', dSources);
		setParam('diff', dDifficulties);
		setParam('verdict', dVerdicts);
		sp.set('page', '1');
		goto(`/archive/standalone?${sp.toString()}`, { keepFocus: true });
		filterOpen = false;
	}
	function clearFilters() {
		const sp = new URLSearchParams(page.url.searchParams);
		for (const k of FILTER_KEYS) sp.delete(k);
		sp.set('page', '1');
		goto(`/archive/standalone?${sp.toString()}`, { keepFocus: true });
		dSources = new Set();
		dDifficulties = new Set();
		dVerdicts = new Set();
		filterOpen = false;
	}
</script>

<svelte:head>
	<title>Standalone Archives</title>
</svelte:head>

<MarginFull>
	<div class="mb-4">
		<BackButton label="Campaign Archive" onClick="/archive" />
	</div>

	<PageLead
		title="Standalone Archives"
		description="One-off scenarios played in Standalone Mode — Scenario Packs and campaign scenarios played outside their campaign."
	/>

	<div class="mb-6 flex flex-wrap justify-center gap-3">
		<Button
			label="New Standalone Archive"
			onClick="/archive/new-standalone"
			icon={FaIconType.Add}
			highlighted
		/>
		<Button
			label={m.archive_import_export_button()}
			onClick="/archive/import-export"
			icon={FaIconType.Import}
		/>
	</div>

	<ArchiveListView
		basePath="/archive/standalone"
		items={data.items}
		totalCount={data.totalCount}
		filteredIds={data.filteredIds}
		pageSize={PAGE_SIZE}
		{currentPage}
		name={nameParam}
		namePlaceholder="Title or scenario…"
		sort={sortBy}
		{sortOptions}
		{activeFilters}
		onOpenFilters={openFilters}
		onClearFilters={clearFilters}
		exportSuffix="-standalones"
		exportDescription="arkham.life standalones (zip)"
		exportSelectedLabel="Export selected"
		emptyText="No standalone archives yet. Create one with “New Standalone Archive”."
	>
		{#snippet item(s, sel)}
			<StandaloneArchiveListItem
				standalone={s}
				cardsByCode={data.cardsByCode}
				selectable={sel.selectionMode}
				selected={sel.selected}
				onToggle={sel.toggle}
			/>
		{/snippet}
	</ArchiveListView>

	<StandaloneFilterModal
		isOpen={filterOpen}
		options={data.filterOptions}
		sources={dSources}
		difficulties={dDifficulties}
		verdicts={dVerdicts}
		onToggle={toggleFilter}
		onClear={clearFilters}
		onApply={applyFilters}
		onClose={() => (filterOpen = false)}
	/>
</MarginFull>
