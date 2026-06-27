<!--
@component
The shared archive list view used by BOTH the Campaign Archive (`/archive`) and the
Standalone Archive (`/archive/standalone`): search + sort + a Filters button, the
selection/export bar (enable selection, export all / filtered / selected), the list
itself, and pagination. All of it is URL-param driven (so it round-trips on
back/forward), generic over `{ id }` items, and exports either kind via the
share-zip helper (which resolves campaigns and standalones alike).

Each page supplies its data (a uniform list result via its `load`), its card (the
`item` snippet, which receives selection state), and its own filter modal — the
facets differ, but every other tool is identical.
-->
<script lang="ts" generics="T extends { id: string }">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { untrack, type Snippet } from 'svelte';
	import { Button, Checkbox, FaIconType, RadioButtons, TextInput } from '@5argon/arkham-life-ui';
	import * as m from '$lib/paraglide/messages.js';
	import { databaseStore } from '$lib/database/database.svelte';
	import { downloadSharesZip } from '$lib/database/archive-share-export';

	let {
		basePath,
		items,
		totalCount,
		filteredIds,
		pageSize,
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
		item,
	}: {
		/** Route base for URL navigation, e.g. `/archive` or `/archive/standalone`. */
		basePath: string;
		/** The current page's items (already filtered/sorted/paginated by the load). */
		items: T[];
		/** Total matching count (across pages), for pagination + the Export-All count. */
		totalCount: number;
		/** Every matching id across all pages — the Export-All target. */
		filteredIds: string[];
		pageSize: number;
		currentPage: number;
		/** Applied search text (from the URL). */
		name: string;
		namePlaceholder: string;
		/** Current sort value + the options to offer (labels supplied by the page). */
		sort: string;
		sortOptions: { value: string; label: string }[];
		/** Count of applied facet filters; when `onOpenFilters` is set, a Filters button shows. */
		activeFilters?: number;
		onOpenFilters?: () => void;
		onClearFilters?: () => void;
		/** Filename suffix + save-dialog label for the export zip. */
		exportSuffix: string;
		exportDescription: string;
		exportSelectedLabel: string;
		/** Shown when there are no items on the current page. */
		emptyText: string;
		/** Renders one card; receives the live selection state for that row. */
		item: Snippet<[T, { selectionMode: boolean; selected: boolean; toggle: (on: boolean) => void }]>;
	} = $props();

	// ─── Controlled inputs, synced to the URL (round-trips on back/forward) ──────
	// Seed once from the props, then keep in sync via the effects below.
	let nameInput = $state(untrack(() => name));
	let sortInput = $state(untrack(() => sort));
	$effect(() => {
		nameInput = name;
	});
	$effect(() => {
		sortInput = sort;
	});
	$effect(() => {
		if (sortInput !== sort) navigate({ sort: sortInput });
	});

	function navigate(params: Partial<{ name: string; sort: string; page: number }>) {
		const sp = new URLSearchParams(page.url.searchParams);
		if (params.name !== undefined) {
			sp.set('name', params.name);
			sp.set('page', '1');
		}
		if (params.sort !== undefined) {
			sp.set('sort', params.sort);
			sp.set('page', '1');
		}
		if (params.page !== undefined) sp.set('page', String(params.page));
		if (sp.get('name') === '') sp.delete('name');
		goto(`${basePath}?${sp.toString()}`, { keepFocus: true });
	}

	let nameDebounce: ReturnType<typeof setTimeout> | null = null;
	function handleNameInput(value: string) {
		nameInput = value;
		if (nameDebounce) clearTimeout(nameDebounce);
		nameDebounce = setTimeout(() => navigate({ name: value }), 350);
	}
	function handleClearName() {
		nameInput = '';
		if (nameDebounce) clearTimeout(nameDebounce);
		navigate({ name: '' });
	}

	// ─── Multi-select export (keyed by id; survives sort/filter/pagination) ───────
	let selected = $state(new Set<string>());
	let selectionMode = $state(false);
	const selectedCount = $derived(selected.size);
	const visibleIds = $derived(items.map((i) => i.id));
	const allVisibleSelected = $derived(
		visibleIds.length > 0 && visibleIds.every((id) => selected.has(id)),
	);
	function toggleOne(id: string, on: boolean) {
		const next = new Set(selected);
		if (on) next.add(id);
		else next.delete(id);
		selected = next;
	}
	function toggleAllVisible(on: boolean) {
		const next = new Set(selected);
		for (const id of visibleIds) {
			if (on) next.add(id);
			else next.delete(id);
		}
		selected = next;
	}
	function clearSelection() {
		selected = new Set();
	}
	function onSelectionModeChange() {
		if (!selectionMode) clearSelection();
	}

	async function exportIds(ids: Iterable<string>) {
		const doc = databaseStore.doc;
		if (!doc) return;
		await downloadSharesZip(doc, ids, exportSuffix, exportDescription);
	}
	async function exportSelected() {
		if (selected.size > 0) await exportIds(selected);
	}
	async function exportAll() {
		await exportIds(filteredIds);
	}

	const pageCount = $derived(Math.max(1, Math.ceil(totalCount / pageSize)));
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
				<Button label={m.common_clear()} icon={FaIconType.Clear} hideLabel onClick={handleClearName} />
			</div>
		{/if}
	</div>

	<div class="mb-2">
		<RadioButtons label={m.archive_sort_label()} bind:selectedValue={sortInput} choices={sortOptions} />
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
			bind:checked={selectionMode}
			onChange={onSelectionModeChange}
		/>
		{#if !selectionMode}
			<div class="ml-auto">
				<Button
					label={activeFilters > 0
						? m.archive_export_all_filtered({ count: totalCount })
						: m.archive_export_all({ count: totalCount })}
					icon={FaIconType.Export}
					disabled={totalCount === 0}
					onClick={exportAll}
				/>
			</div>
		{:else}
			<Checkbox
				label={m.archive_select_all_visible()}
				checked={allVisibleSelected}
				onChange={() => toggleAllVisible(!allVisibleSelected)}
			/>
			{#if selectedCount > 0}
				<span class="text-primary-500 dark:text-primary-400 text-sm">
					{m.archive_selected_count({ count: selectedCount })}
				</span>
				<Button label={m.common_clear()} icon={FaIconType.Clear} onClick={clearSelection} />
			{/if}
			<div class="ml-auto">
				<Button
					label={exportSelectedLabel}
					icon={FaIconType.Export}
					highlighted
					disabled={selectedCount === 0}
					onClick={exportSelected}
				/>
			</div>
		{/if}
	</div>

	<div class="flex flex-col gap-3">
		{#each items as it (it.id)}
			{@render item(it, {
				selectionMode,
				selected: selected.has(it.id),
				toggle: (on: boolean) => toggleOne(it.id, on),
			})}
		{/each}
	</div>

	<!-- Pagination -->
	{#if totalCount > pageSize}
		<div class="mt-6 flex justify-center gap-2">
			<Button
				label="Previous"
				onClick={() => navigate({ page: currentPage - 1 })}
				disabled={currentPage <= 1}
				icon={FaIconType.LeftSingle}
				hideLabel
			/>
			<span class="flex items-center px-3 text-sm text-black dark:text-white">
				{currentPage} / {pageCount}
			</span>
			<Button
				label="Next"
				onClick={() => navigate({ page: currentPage + 1 })}
				disabled={currentPage >= pageCount}
				icon={FaIconType.RightSingle}
				hideLabel
			/>
		</div>
	{/if}
{/if}
