<!--
@component
The Campaign Archive and Standalone Archive list: search, sort, filters, selection and export, and
paging, all kept in the URL. The page supplies the rows, the row card and its filter modal.
-->
<script lang="ts" generics="T extends { id: string }">
	import { afterNavigate, goto } from '$app/navigation';
	import { page } from '$app/state';
	import { untrack, type Snippet } from 'svelte';
	import {
		Button,
		Checkbox,
		FaIconType,
		Pagination,
		RadioButtons,
		TextInput
	} from '@5argon/arkham-life-ui';
	import * as m from '$lib/paraglide/messages.js';
	import { databaseStore } from '$lib/database/database.svelte';
	import { downloadSharesZip } from '$lib/database/archive-share-export';
	import { PAGE_SIZE } from './list-url';

	let {
		basePath,
		items,
		totalCount,
		filteredIds,
		currentPage,
		name,
		namePlaceholder,
		sort,
		sortOptions,
		activeFilters = 0,
		onOpenFilters,
		onClearFilters,
		exportSuffix,
		exportDescription,
		exportSelectedLabel,
		emptyText,
		item
	}: {
		/** e.g. `/archive` or `/archive/standalone`. */
		basePath: string;
		/** This page's items, already filtered, sorted and paginated. */
		items: T[];
		/** Matches across all pages. */
		totalCount: number;
		/** Every matching id across pages, for Export All. */
		filteredIds: string[];
		currentPage: number;
		/** The search text in the URL. */
		name: string;
		namePlaceholder: string;
		sort: string;
		sortOptions: { value: string; label: string }[];
		/** Applied facet filters; a Filters button shows when `onOpenFilters` is given. */
		activeFilters?: number;
		onOpenFilters?: () => void;
		onClearFilters?: () => void;
		/** Export zip filename suffix and save-dialog description. */
		exportSuffix: string;
		exportDescription: string;
		exportSelectedLabel: string;
		emptyText: string;
		item: Snippet<[T, { selectionMode: boolean; selected: boolean; toggle: (on: boolean) => void }]>;
	} = $props();

	function navigate(params: { name?: string; sort?: string; page?: number }) {
		const sp = new URLSearchParams(page.url.searchParams);
		if (params.name !== undefined) {
			if (params.name) sp.set('name', params.name);
			else sp.delete('name');
		}
		if (params.sort !== undefined) sp.set('sort', params.sort);
		sp.set('page', String(params.page ?? 1));
		goto(`${basePath}?${sp.toString()}`, { keepFocus: true });
	}

	// The search box is the source of truth while typing; the URL only re-seeds it on back/forward.
	let nameInput = $state(untrack(() => name));
	afterNavigate(({ type }) => {
		if (type === 'popstate') nameInput = name;
	});
	let nameDebounce: ReturnType<typeof setTimeout> | null = null;
	function handleNameInput(value: string) {
		nameInput = value;
		if (nameDebounce) clearTimeout(nameDebounce);
		nameDebounce = setTimeout(() => navigate({ name: value }), 350);
	}
	function clearName() {
		nameInput = '';
		if (nameDebounce) clearTimeout(nameDebounce);
		navigate({ name: '' });
	}

	// ─── Multi-select export (by id; survives sort, filter and paging) ───────────
	let selected = $state(new Set<string>());
	let selectionMode = $state(false);
	const visibleIds = $derived(items.map((i) => i.id));
	const allVisibleSelected = $derived(
		visibleIds.length > 0 && visibleIds.every((id) => selected.has(id))
	);
	function setSelected(ids: string[], on: boolean) {
		const next = new Set(selected);
		for (const id of ids) {
			if (on) next.add(id);
			else next.delete(id);
		}
		selected = next;
	}
	async function exportIds(ids: Iterable<string>) {
		if (databaseStore.doc)
			await downloadSharesZip(databaseStore.doc, ids, exportSuffix, exportDescription);
	}
</script>

<!-- Search & Sort & Filters -->
<div class="mb-4 flex flex-wrap items-end gap-4">
	<div class="flex items-end gap-2">
		<TextInput
			label={m.archive_filter_name_label()}
			value={nameInput}
			oninput={handleNameInput}
			placeholder={namePlaceholder}
		/>
		{#if nameInput}
			<div class="mb-2">
				<Button label={m.common_clear()} icon={FaIconType.Clear} hideLabel onClick={clearName} />
			</div>
		{/if}
	</div>

	<div class="mb-2">
		<RadioButtons
			label={m.archive_sort_label()}
			selectedValue={sort}
			onChange={(v) => navigate({ sort: v })}
			choices={sortOptions}
		/>
	</div>

	{#if onOpenFilters}
		<div class="mb-2 flex items-end gap-2">
			<Button label={m.archive_filter_button()} onClick={onOpenFilters} />
			{#if activeFilters > 0}
				<span class="text-secondary-600 dark:text-secondary-400 text-sm font-semibold">
					{m.archive_filter_active_count({ count: activeFilters })}
				</span>
				<Button
					label={m.common_clear()}
					icon={FaIconType.Clear}
					hideLabel
					onClick={() => onClearFilters?.()}
				/>
			{/if}
		</div>
	{/if}
</div>

{#if items.length === 0}
	<p class="text-primary-500 dark:text-primary-400 py-8 text-center">{emptyText}</p>
{:else}
	<!-- Selection / export bar -->
	<div class="mb-3 flex flex-wrap items-center gap-3">
		<Checkbox
			label={m.archive_enable_selection()}
			checked={selectionMode}
			onChange={() => {
				selectionMode = !selectionMode;
				if (!selectionMode) selected = new Set();
			}}
		/>
		{#if !selectionMode}
			<div class="ml-auto">
				<Button
					label={activeFilters > 0
						? m.archive_export_all_filtered({ count: totalCount })
						: m.archive_export_all({ count: totalCount })}
					icon={FaIconType.Export}
					disabled={totalCount === 0}
					onClick={() => exportIds(filteredIds)}
				/>
			</div>
		{:else}
			<Checkbox
				label={m.archive_select_all_visible()}
				checked={allVisibleSelected}
				onChange={() => setSelected(visibleIds, !allVisibleSelected)}
			/>
			{#if selected.size > 0}
				<span class="text-primary-500 dark:text-primary-400 text-sm">
					{m.archive_selected_count({ count: selected.size })}
				</span>
				<Button label={m.common_clear()} icon={FaIconType.Clear} onClick={() => (selected = new Set())} />
			{/if}
			<div class="ml-auto">
				<Button
					label={exportSelectedLabel}
					icon={FaIconType.Export}
					highlighted
					disabled={selected.size === 0}
					onClick={() => exportIds(selected)}
				/>
			</div>
		{/if}
	</div>

	<div class="flex flex-col gap-3">
		{#each items as it (it.id)}
			{@render item(it, {
				selectionMode,
				selected: selected.has(it.id),
				toggle: (on: boolean) => setSelected([it.id], on)
			})}
		{/each}
	</div>

	<div class="mt-6 flex justify-center">
		<Pagination
			page={currentPage}
			pageCount={Math.max(1, Math.ceil(totalCount / PAGE_SIZE))}
			onChange={(p) => navigate({ page: p })}
		/>
	</div>
{/if}
