<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { onMount, untrack } from 'svelte';
	import {
		BackButton,
		Button,
		Checkbox,
		FaIconType,
		MarginFull,
		PageLead,
		RadioButtons,
		TextInput
	} from '@5argon/arkham-life-ui';
	import * as m from '$lib/paraglide/messages.js';
	import { databaseStore } from '$lib/database/database.svelte';
	import { preloader } from '$lib/preload/preloader.svelte';
	import type { PageProps } from './$types';
	import ArchivedCampaignListItem from '$lib/components/archive/ArchivedCampaignListItem.svelte';
	import FilterModal from '$lib/components/archive/FilterModal.svelte';
	import { campaignShareEntryName, serializeCampaignShare } from '$lib/database/campaign-share';
	import { gzipJsonText } from '$lib/database/backup-file';
	import { fileStem } from '$lib/database/export';
	import { saveBinaryFile } from '$lib/save-file';
	import { zipSync } from 'fflate';

	const { data }: PageProps = $props();

	// Landing here, the editor is almost certainly the next stop — warm its (single,
	// shared) route chunk plus the new/import screens so opening any campaign is instant.
	onMount(() => preloader.warmSection('archive'));

	// The "your campaign" badge keys off the database owner.
	const currentUserId = $derived(databaseStore.doc?.owner.uid ?? '');

	const PAGE_SIZE = 20;

	// URL-derived truth
	const sortBy = $derived(
		(page.url.searchParams.get('sort') ?? 'date') as 'date' | 'campaign' | 'difficulty'
	);
	const currentPage = $derived(Number(page.url.searchParams.get('page') ?? '1'));

	// Local state for controlled inputs
	let nameInput = $state(page.url.searchParams.get('name') ?? '');
	let sortInput = $state<'date' | 'campaign' | 'difficulty'>(untrack(() => sortBy));

	// Keep RadioButtons in sync when URL changes (browser back/forward)
	$effect(() => {
		sortInput = sortBy;
	});

	// Navigate when user changes sort (Svelte 5 batches the above write and this
	// read in the same flush, so the effect won't fire on back/forward navigations)
	$effect(() => {
		const s = sortInput;
		if (s !== sortBy) {
			navigate({ sort: s });
		}
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
		goto(`/archive?${sp.toString()}`, { keepFocus: true });
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

	// ─── Filters (multi-select; URL-driven so filtering happens before pagination) ─
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
			memberUids: g.memberUids
		}))
	);

	let filterOpen = $state(false);
	let dCampaigns = $state(new Set<string>());
	let dPlayers = $state(new Set<string>());
	let dInvestigators = $state(new Set<string>());
	let dOutcomes = $state(new Set<string>());
	let dPlayerCounts = $state(new Set<number>());
	let dSolo = $state(new Set<string>());

	// Seed the draft from the applied URL filters when opening (event handler, not $effect).
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
	// Picker-driven categories replace the whole draft set with the new selection.
	function setCampaigns(codes: string[]) {
		dCampaigns = new Set(codes);
	}
	function setPlayers(uids: string[]) {
		dPlayers = new Set(uids);
	}
	function setInvestigators(codes: string[]) {
		dInvestigators = new Set(codes);
	}
	// Play-group shortcut: toggle all the group's members that are actually filterable.
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

	// ─── Multi-select export ─────────────────────────────────────────────────────
	// Selection is keyed by campaign id, so it survives sort/filter/pagination. Off-page
	// picks stay selected (the count + Clear make that visible).
	let selected = $state(new Set<string>());
	let selectionMode = $state(false);
	const selectedCount = $derived(selected.size);
	const visibleIds = $derived(data.campaigns.map((c) => c.id));
	const allVisibleSelected = $derived(
		visibleIds.length > 0 && visibleIds.every((id) => selected.has(id))
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
	// Leaving selection mode clears any picks so the next entry starts fresh.
	function onSelectionModeChange() {
		if (!selectionMode) clearSelection();
	}

	// Bundle each given campaign as its own gzipped `.ahlifecam` inside one outer `.zip`.
	// The doc holds every campaign, so off-page ids export fine too.
	async function exportCampaignIds(ids: Iterable<string>) {
		const doc = databaseStore.doc;
		if (!doc) return;
		const files: Record<string, Uint8Array> = {};
		const used = new Set<string>();
		for (const id of ids) {
			const json = serializeCampaignShare(doc, id);
			if (!json) continue; // campaign vanished — skip
			const base = campaignShareEntryName(doc, id);
			let name = base;
			let i = 2;
			while (used.has(name)) name = base.replace(/\.ahlifecam$/, `-${i++}.ahlifecam`);
			used.add(name);
			files[name] = gzipJsonText(json);
		}
		if (Object.keys(files).length === 0) return;
		// Entries are already gzipped, so store them uncompressed (level 0) in the zip.
		const zipped = zipSync(files, { level: 0 });
		await saveBinaryFile({
			suggestedName: `${fileStem(doc.owner.name, '-campaigns')}.zip`,
			data: new Blob([zipped], { type: 'application/zip' }),
			mime: 'application/zip',
			extension: '.zip',
			description: 'arkham.life campaigns (zip)'
		});
	}

	async function exportSelected() {
		if (selected.size === 0) return;
		await exportCampaignIds(selected);
	}

	// Export every campaign matching the current filters (across all pages) — powers the
	// "filter to solo → export → import into a second, solo-only ID" workflow.
	async function exportAllFiltered() {
		await exportCampaignIds(data.filteredIds);
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
			label={m.archive_import_export_button()}
			onClick="/archive/import-export"
			icon={FaIconType.Import}
		/>
	</div>

	<!-- Filter & Sort bar -->
	<div class="mb-4 flex flex-wrap items-end gap-4">
		<div class="flex items-end gap-2">
			<TextInput
				label={m.archive_filter_name_label()}
				bind:value={nameInput}
				oninput={handleNameInput}
				placeholder={m.archive_filter_name_placeholder()}
			/>
			{#if nameInput}
				<div class="mb-2">
					<Button
						label={m.common_clear()}
						icon={FaIconType.Clear}
						hideLabel
						onClick={handleClearName}
					/>
				</div>
			{/if}
		</div>

		<div class="mb-2">
			<RadioButtons
				label={m.archive_sort_label()}
				bind:selectedValue={sortInput}
				choices={[
					{ value: 'date', label: m.archive_sort_date() },
					{ value: 'campaign', label: m.archive_sort_campaign() },
					{ value: 'difficulty', label: m.archive_sort_difficulty() }
				]}
			/>
		</div>

		<div class="mb-2 flex items-end gap-2">
			<Button label={m.archive_filter_button()} onClick={openFilters} />
			{#if activeFilters > 0}
				<span class="text-secondary-600 dark:text-secondary-400 text-sm font-semibold"
					>{m.archive_filter_active_count({ count: activeFilters })}</span
				>
				<Button label={m.common_clear()} icon={FaIconType.Clear} hideLabel onClick={clearFilters} />
			{/if}
		</div>
	</div>

	{#if data.campaigns.length === 0}
		<p class="text-primary-500 dark:text-primary-400 py-8 text-center">
			{m.archive_no_campaigns()}
		</p>
	{:else}
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
							? m.archive_export_all_filtered({ count: data.totalCount })
							: m.archive_export_all({ count: data.totalCount })}
						icon={FaIconType.Export}
						disabled={data.totalCount === 0}
						onClick={exportAllFiltered}
					/>
				</div>
			{/if}
			{#if selectionMode}
				<Checkbox
					label={m.archive_select_all_visible()}
					checked={allVisibleSelected}
					onChange={() => toggleAllVisible(!allVisibleSelected)}
				/>
				{#if selectedCount > 0}
					<span class="text-primary-500 dark:text-primary-400 text-sm"
						>{m.archive_selected_count({ count: selectedCount })}</span
					>
					<Button label={m.common_clear()} icon={FaIconType.Clear} onClick={clearSelection} />
				{/if}
				<div class="ml-auto">
					<Button
						label={m.archive_export_selected()}
						icon={FaIconType.Export}
						highlighted
						disabled={selectedCount === 0}
						onClick={exportSelected}
					/>
				</div>
			{/if}
		</div>

		<div class="flex flex-col gap-3">
			{#each data.campaigns as campaign (campaign.id)}
				<ArchivedCampaignListItem
					{campaign}
					cardsByCode={data.cardsByCode}
					{currentUserId}
					selectable={selectionMode}
					selected={selected.has(campaign.id)}
					onToggle={(on) => toggleOne(campaign.id, on)}
				/>
			{/each}
		</div>

		<!-- Pagination -->
		{#if data.totalCount > PAGE_SIZE}
			<div class="mt-6 flex justify-center gap-2">
				<Button
					label="Previous"
					onClick={() => navigate({ page: currentPage - 1 })}
					disabled={currentPage <= 1}
					icon={FaIconType.LeftSingle}
					hideLabel
				/>
				<span class="flex items-center px-3 text-sm text-black dark:text-white">
					{currentPage} / {Math.ceil(data.totalCount / PAGE_SIZE)}
				</span>
				<Button
					label="Next"
					onClick={() => navigate({ page: currentPage + 1 })}
					disabled={currentPage >= Math.ceil(data.totalCount / PAGE_SIZE)}
					icon={FaIconType.RightSingle}
					hideLabel
				/>
			</div>
		{/if}
	{/if}

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
