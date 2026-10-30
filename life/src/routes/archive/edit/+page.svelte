<script lang="ts">
	import { beforeNavigate, goto, replaceState } from '$app/navigation';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import {
		BackButton,
		Button,
		FaIconType,
		MarginFull,
		Modal,
		Tabs,
		getToastContext
	} from '@5argon/arkham-life-ui';
	import type { Campaign } from '@5argon/arkham-kohaku';
	import * as m from '$lib/paraglide/messages.js';
	import CampaignSelector from '$lib/components/archive/CampaignSelector.svelte';
	import ConfirmModal from '$lib/components/archive/ConfirmModal.svelte';
	import SnapshotHistoryModal from '$lib/components/archive/SnapshotHistoryModal.svelte';
	import ArchiveEditor, { type EditorTab } from '$lib/components/archive/edit/ArchiveEditor.svelte';
	import { campaignDisplayName } from '$lib/database/archive-list';
	import { downloadCampaignShare } from '$lib/database/campaign-share';
	import { databaseStore } from '$lib/database/database.svelte';
	import { findRecord, isStandaloneRecord } from '$lib/database/document';
	import { listSnapshotsFor, type SnapshotMeta } from '$lib/database/snapshots';
	import type { PageProps } from './$types';

	const { data }: PageProps = $props();
	const toast = getToastContext();

	const record = $derived(databaseStore.doc ? findRecord(databaseStore.doc, data.id) : undefined);
	const isStandalone = $derived(!!record && isStandaloneRecord(record));
	/** Bumped when the record is replaced, to re-seed the editor. */
	let seed = $state(0);

	const snapshot = () => databaseStore.snapshotCampaign(data.id);

	onMount(() => {
		if (page.url.searchParams.get('created') === '1') {
			toast.success(m.archive_created());
			const url = new URL(page.url.href);
			url.searchParams.delete('created');
			replaceState(url, {});
		}
		// Hiding the tab is the last reliable async point before it may be closed.
		const onHide = () => {
			if (document.visibilityState === 'hidden') void snapshot();
		};
		document.addEventListener('visibilitychange', onHide);
		return () => document.removeEventListener('visibilitychange', onHide);
	});
	beforeNavigate(() => void snapshot());

	// ─── Tabs ────────────────────────────────────────────────────────────────────
	const tabs = $derived<{ key: EditorTab; label: string }[]>([
		{ key: 'general', label: m.archive_tab_general() },
		{ key: 'decks', label: m.archive_tab_players_and_decks() },
		{ key: 'logs', label: m.archive_tab_logs() },
		...(isStandalone ? [] : [{ key: 'achievements' as const, label: m.archive_tab_achievements() }]),
		{ key: 'extra', label: m.archive_tab_extra() }
	]);
	let activeTab = $state<EditorTab>('general');
	const activeIndex = $derived(Math.max(0, tabs.findIndex((t) => t.key === activeTab)));

	const headerName = $derived(
		isStandalone
			? record?.title || m.archive_standalone()
			: record?.campaignCode
				? campaignDisplayName(record.campaignCode)
				: m.archive_campaign_unspecified()
	);

	// ─── Destructive actions snapshot first, so autosave history can undo them ──
	let changeCampaignOpen = $state(false);
	let pendingCampaign = $state<Campaign | null | undefined>(undefined);
	async function changeCampaign() {
		const code = pendingCampaign;
		pendingCampaign = undefined;
		if (code === undefined) return;
		await snapshot();
		databaseStore.changeCampaignCode(data.id, code ?? '');
		seed++;
	}

	let historyOpen = $state(false);
	let snapshots = $state<SnapshotMeta[]>([]);
	let restoreId = $state<string | null>(null);
	async function openHistory() {
		snapshots = await listSnapshotsFor(data.id);
		historyOpen = true;
	}
	async function restore() {
		const id = restoreId;
		restoreId = null;
		if (!id) return;
		await snapshot();
		if (await databaseStore.restoreCampaignSnapshot(id)) seed++;
	}

	let confirmDeleteOpen = $state(false);
	async function deleteRecord() {
		confirmDeleteOpen = false;
		await snapshot();
		if (isStandalone) databaseStore.removeStandalone(data.id);
		else databaseStore.removeCampaign(data.id);
		await databaseStore.saveNow();
		goto(isStandalone ? '/archive/standalone' : '/archive');
	}

	let exportModalOpen = $state(false);
	async function exportRecord(format: 'gzip' | 'json') {
		exportModalOpen = false;
		if (!databaseStore.doc) return;
		const saved = await downloadCampaignShare(databaseStore.doc, data.id, format);
		if (saved && format === 'gzip') toast.success(m.archive_export_done());
	}
</script>

<svelte:head>
	<title>{m.archive_edit_page_title()}</title>
</svelte:head>

<MarginFull>
	<div class="mb-4">
		<BackButton label={m.common_back()} onClick={isStandalone ? '/archive/standalone' : '/archive'} />
	</div>

	{#if record}
		<div class="mb-4 flex items-center justify-between gap-4">
			<div>
				<p class="text-primary-500 dark:text-primary-400 text-xs tracking-wider uppercase">
					{isStandalone ? m.archive_standalone() : m.archive_campaign_label()}
				</p>
				<p class="text-base font-semibold text-black dark:text-white">
					{headerName}{record.title && record.title !== headerName ? ` — ${record.title}` : ''}
				</p>
			</div>
			<div class="flex gap-2">
				<Button
					label={m.archive_export_campaign()}
					icon={FaIconType.Export}
					hideLabel
					onClick={() => (exportModalOpen = true)}
				/>
				<Button label={m.archive_history_button()} icon={FaIconType.Reset} hideLabel onClick={openHistory} />
				{#if !isStandalone}
					<Button
						label={m.archive_change_campaign()}
						icon={FaIconType.Edit}
						hideLabel
						onClick={() => (changeCampaignOpen = true)}
					/>
				{/if}
				<Button
					label={m.archive_delete()}
					icon={FaIconType.Delete}
					hideLabel
					danger
					onClick={() => (confirmDeleteOpen = true)}
				/>
			</div>
		</div>

		<Tabs
			direction="horizontal"
			activeTabIndex={activeIndex}
			onTabChange={(i) => (activeTab = tabs[i]?.key ?? 'general')}
			tabs={tabs.map((t) => ({ label: t.label }))}
		/>

		{#key `${data.id}:${seed}`}
			<ArchiveEditor {record} tab={activeTab} />
		{/key}
	{/if}
</MarginFull>

<Modal
	isOpen={changeCampaignOpen}
	onClose={() => (changeCampaignOpen = false)}
	title={m.archive_change_campaign()}
	maxWidth="lg"
>
	<CampaignSelector
		selected={record?.campaignCode ? (record.campaignCode as Campaign) : null}
		onSelect={(campaign) => {
			changeCampaignOpen = false;
			pendingCampaign = campaign;
		}}
	/>
</Modal>

<ConfirmModal
	isOpen={pendingCampaign !== undefined}
	title={m.archive_change_campaign()}
	confirmLabel={m.archive_change_campaign()}
	danger
	onConfirm={changeCampaign}
	onCancel={() => (pendingCampaign = undefined)}
>
	{m.archive_change_campaign_confirm()}
</ConfirmModal>

<ConfirmModal
	isOpen={confirmDeleteOpen}
	title={m.archive_delete()}
	confirmLabel={m.archive_delete()}
	danger
	onConfirm={deleteRecord}
	onCancel={() => (confirmDeleteOpen = false)}
>
	{m.archive_delete_confirm()}
</ConfirmModal>

<ConfirmModal
	isOpen={restoreId !== null}
	title={m.archive_history_title()}
	confirmLabel={m.archive_history_restore()}
	onConfirm={restore}
	onCancel={() => (restoreId = null)}
>
	{m.archive_history_restore_confirm()}
</ConfirmModal>

<Modal
	isOpen={exportModalOpen}
	onClose={() => (exportModalOpen = false)}
	title={m.archive_export_campaign()}
	maxWidth="sm"
>
	<p class="mb-4 text-black dark:text-white">{m.archive_export_help()}</p>
	{#snippet footer()}
		<div class="flex justify-end gap-2">
			<Button label={m.archive_export_json()} onClick={() => exportRecord('json')} />
			<Button
				label={m.archive_export_ahlifecam()}
				icon={FaIconType.Export}
				highlighted
				onClick={() => exportRecord('gzip')}
			/>
		</div>
	{/snippet}
</Modal>

<SnapshotHistoryModal
	isOpen={historyOpen}
	{snapshots}
	onRestore={(id) => {
		historyOpen = false;
		restoreId = id;
	}}
	onClose={() => (historyOpen = false)}
/>
