<script lang="ts">
	import { gotoKeepingFocus } from '$lib/components/archive/list-navigation';
	import { page } from '$app/state';
	import { BackButton, Button, FaIconType, MarginFull, PageLead } from '@5argon/arkham-life-ui';
	import * as m from '$lib/paraglide/messages.js';
	import ArchiveListView from '$lib/components/archive/ArchiveListView.svelte';
	import StandaloneArchiveListItem from '$lib/components/archive/StandaloneArchiveListItem.svelte';
	import StandaloneFilterModal, {
		STANDALONE_FACETS,
		type StandaloneFacet
	} from '$lib/components/archive/StandaloneFilterModal.svelte';
	import {
		activeFilterCount,
		draftsFromUrl,
		pageOf,
		toggleDraft,
		withFilters,
		withoutFilters,
		type FilterDrafts
	} from '$lib/components/archive/list-url';
	import type { PageProps } from './$types';

	const { data }: PageProps = $props();

	const sortOptions = [
		{ value: 'date', label: m.archive_sort_date() },
		{ value: 'name', label: m.archive_sort_name() },
		{ value: 'difficulty', label: m.archive_sort_difficulty() }
	];

	let filterOpen = $state(false);
	let drafts = $state<FilterDrafts<StandaloneFacet>>(draftsFromUrl(page.url, STANDALONE_FACETS));
	const go = (query: string) => gotoKeepingFocus(`/archive/standalone?${query}`);
	function apply() {
		go(withFilters(page.url, drafts));
		filterOpen = false;
	}
	function clear() {
		go(withoutFilters(page.url, STANDALONE_FACETS));
		filterOpen = false;
	}
</script>

<svelte:head>
	<title>{m.archive_standalone_page_title()}</title>
</svelte:head>

<MarginFull>
	<div class="mb-4">
		<BackButton label={m.archive_title()} onClick="/archive" />
	</div>

	<PageLead title={m.archive_standalone_list_title()} description={m.archive_standalone_list_description()} />

	<div class="mb-6 flex flex-wrap justify-center gap-3">
		<Button
			label={m.archive_new_standalone()}
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
		currentPage={pageOf(page.url)}
		name={page.url.searchParams.get('name') ?? ''}
		namePlaceholder={m.archive_standalone_search_placeholder()}
		sort={page.url.searchParams.get('sort') ?? 'date'}
		{sortOptions}
		activeFilters={activeFilterCount(page.url, STANDALONE_FACETS)}
		onOpenFilters={() => {
			drafts = draftsFromUrl(page.url, STANDALONE_FACETS);
			filterOpen = true;
		}}
		onClearFilters={clear}
		exportSuffix="-standalones"
		exportDescription="arkham.life standalones (zip)"
		exportSelectedLabel={m.archive_export_selected_standalone()}
		emptyText={m.archive_no_standalones()}
	>
		{#snippet item(s, sel)}
			<StandaloneArchiveListItem
				standalone={s}
				selectable={sel.selectionMode}
				selected={sel.selected}
				onToggle={sel.toggle}
			/>
		{/snippet}
	</ArchiveListView>

	<StandaloneFilterModal
		isOpen={filterOpen}
		options={data.filterOptions}
		{drafts}
		onToggle={(facet, value) => (drafts = toggleDraft(drafts, facet, value))}
		onClear={clear}
		onApply={apply}
		onClose={() => (filterOpen = false)}
	/>
</MarginFull>
