<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { BackButton, Button, FaIconType, MarginFull, PageLead } from '@5argon/arkham-life-ui';
	import * as m from '$lib/paraglide/messages.js';
	import { databaseStore } from '$lib/database/database.svelte';
	import { preloader } from '$lib/preload/preloader.svelte';
	import ArchivedCampaignListItem from '$lib/components/archive/ArchivedCampaignListItem.svelte';
	import ArchiveListView from '$lib/components/archive/ArchiveListView.svelte';
	import FilterModal, {
		CAMPAIGN_FACETS,
		type CampaignFacet
	} from '$lib/components/archive/FilterModal.svelte';
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

	onMount(() => preloader.warmSection('archive'));

	const sortOptions = [
		{ value: 'date', label: m.archive_sort_date() },
		{ value: 'campaign', label: m.archive_sort_campaign() },
		{ value: 'difficulty', label: m.archive_sort_difficulty() }
	];

	let filterOpen = $state(false);
	let drafts = $state<FilterDrafts<CampaignFacet>>(draftsFromUrl(page.url, CAMPAIGN_FACETS));
	const go = (query: string) => goto(`/archive?${query}`, { keepFocus: true });
	function apply() {
		go(withFilters(page.url, drafts));
		filterOpen = false;
	}
	function clear() {
		go(withoutFilters(page.url, CAMPAIGN_FACETS));
		filterOpen = false;
	}
</script>

<svelte:head>
	<title>{m.archive_page_title()}</title>
</svelte:head>

<MarginFull>
	<div class="mb-4">
		<BackButton label={m.archive_home()} onClick="/" />
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
			label={m.archive_go_standalone()}
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
		currentPage={pageOf(page.url)}
		name={page.url.searchParams.get('name') ?? ''}
		namePlaceholder={m.archive_filter_name_placeholder()}
		sort={page.url.searchParams.get('sort') ?? 'date'}
		{sortOptions}
		activeFilters={activeFilterCount(page.url, CAMPAIGN_FACETS)}
		onOpenFilters={() => {
			drafts = draftsFromUrl(page.url, CAMPAIGN_FACETS);
			filterOpen = true;
		}}
		onClearFilters={clear}
		exportSuffix="-campaigns"
		exportDescription="arkham.life campaigns (zip)"
		exportSelectedLabel={m.archive_export_selected()}
		emptyText={m.archive_no_campaigns()}
	>
		{#snippet item(campaign, sel)}
			<ArchivedCampaignListItem
				{campaign}
				selectable={sel.selectionMode}
				selected={sel.selected}
				onToggle={sel.toggle}
			/>
		{/snippet}
	</ArchiveListView>

	<FilterModal
		isOpen={filterOpen}
		options={data.filterOptions}
		playGroups={databaseStore.doc?.playGroups ?? []}
		{drafts}
		onToggle={(facet, value) => (drafts = toggleDraft(drafts, facet, value))}
		onSet={(facet, values) => (drafts = { ...drafts, [facet]: new Set(values) })}
		onClear={clear}
		onApply={apply}
		onClose={() => (filterOpen = false)}
	/>
</MarginFull>
