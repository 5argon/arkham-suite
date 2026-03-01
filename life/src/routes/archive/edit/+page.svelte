<script lang="ts">
	import { beforeNavigate, goto, replaceState } from '$app/navigation';
	import { page } from '$app/state';
	import { onMount, untrack } from 'svelte';
	import {
		BackButton,
		Button,
		FaIconType,
		MarginFull,
		Modal,
		Tabs,
		getToastContext
	} from '@5argon/arkham-life-ui';
	import { type Campaign } from '@5argon/arkham-kohaku';
	import { u } from '@5argon/arkham-string';
	import * as m from '$lib/paraglide/messages.js';
	import { createCardResolver, getAllCards, loadAllTabooLists } from '$lib/card-data';
	import type { PageProps } from './$types';
	import CampaignSelector from '$lib/components/archive/CampaignSelector.svelte';
	import SnapshotHistoryModal from '$lib/components/archive/SnapshotHistoryModal.svelte';
	import GeneralTab from '$lib/components/archive/edit/GeneralTab.svelte';
	import PlayersAndDecksTab from '$lib/components/archive/edit/PlayersAndDecksTab.svelte';
	import LogsTab from '$lib/components/archive/edit/LogsTab.svelte';
	import AchievementsTab from '$lib/components/archive/edit/achievements/AchievementsTab.svelte';
	import ExtraTab from '$lib/components/archive/edit/ExtraTab.svelte';
	import ValidationBanner from '$lib/components/archive/edit/ValidationBanner.svelte';
	import { investigatorCodesFromDecks, type InvestigatorRef } from '$lib/campaign/investigators';
	import { loadCampaignLog } from '$lib/campaign/campaign-log-source';
	import {
		RESERVED,
		entriesInSection,
		hydrate,
		makeEntry,
		recordedLogKeys,
		replaceSection,
		toRecordedState,
		toSavePayload,
		type LocalLog
	} from '$lib/campaign/recorded-state';
	import {
		findValidatorConflicts,
		type AchievementDef,
		type RecordedCampaignState
	} from '@5argon/arkham-campaign-data';
	import { databaseStore } from '$lib/database/database.svelte';
	import { downloadCampaignShare } from '$lib/database/campaign-share';
	import { listSnapshotsFor, type SnapshotMeta } from '$lib/database/snapshots';

	const { data }: PageProps = $props();
	const toast = getToastContext();

	// Arriving straight from "New Campaign Archive": the campaign record already exists
	// (it's not an unsaved draft you must Save to create), so confirm that on arrival.
	onMount(() => {
		if (page.url.searchParams.get('created') === '1') {
			toast.success(m.archive_created());
			const url = new URL(page.url);
			url.searchParams.delete('created');
			replaceState(url, {});
		}
		// Snapshot when the tab is hidden/closed — the reliable async point (unlike
		// `beforeunload`, where an IndexedDB write may not finish).
		const onHide = () => {
			if (document.visibilityState === 'hidden') {
				void databaseStore.snapshotCampaign(data.campaign.id);
			}
		};
		document.addEventListener('visibilitychange', onHide);
		return () => document.removeEventListener('visibilitychange', onHide);
	});

	const cardResolver = createCardResolver();
	const tabooLists = loadAllTabooLists();
	const allCards = getAllCards();

	// Investigator roster (for per-investigator log sections), resolved from decks.
	const investigators = $derived<InvestigatorRef[]>(
		investigatorCodesFromDecks(data.decks).map((code) => ({
			code,
			name: allCards.find((c) => c.code === code)?.name ?? code
		}))
	);

	// ─── General form state ─────────────────────────────────────────────────────
	const initialCampaign = untrack(() => data.campaign);
	let title = $state(initialCampaign.title);
	let difficulty = $state<'easy' | 'standard' | 'hard' | 'expert'>(
		initialCampaign.difficulty as 'easy' | 'standard' | 'hard' | 'expert'
	);
	let draft = $state(initialCampaign.draft);
	let displayInProfile = $state<'default' | 'visible' | 'hidden'>(
		(initialCampaign.displayInProfile as 'default' | 'visible' | 'hidden') ?? 'default'
	);
	let startDate = $state(
		initialCampaign.startDate instanceof Date
			? initialCampaign.startDate.toISOString().slice(0, 10)
			: ''
	);
	let finishDate = $state(
		initialCampaign.finishDate instanceof Date
			? initialCampaign.finishDate.toISOString().slice(0, 10)
			: ''
	);

	// ─── Campaign log + lifted editor state (shared by Logs + Achievements) ──────
	const campaignLog = $derived(loadCampaignLog(data.campaign.campaignCode));

	// Working copy of the logs (chaos bag, scenario XP/resolutions, standalones…),
	// seeded once from the loaded campaign; edits autosave straight to the document.
	let localLogs = $state<LocalLog[]>(untrack(() => hydrate(data.logs)));

	const recorded = $derived(
		campaignLog ? toRecordedState(campaignLog, localLogs, { difficulty }) : undefined
	);
	const logConflicts = $derived(
		campaignLog ? findValidatorConflicts(campaignLog, recordedLogKeys(localLogs)) : []
	);

	// Manual achievement ticks (keys: `def.id` and `def.id::itemId`).
	let manualAchievements = $state<Set<string>>(
		untrack(
			() =>
				new Set(
					data.achievements.map((a) =>
						a.itemId ? `${a.achievementId}::${a.itemId}` : a.achievementId
					)
				)
		)
	);

	// ─── Autosave (debounced by the store; no manual Save/Discard) ───────────────
	function persistGeneral() {
		databaseStore.updateCampaignGeneral(data.campaign.id, {
			title,
			difficulty,
			draft,
			displayInProfile,
			startDate: startDate ? new Date(startDate).getTime() : null,
			finishDate: finishDate ? new Date(finishDate).getTime() : null
		});
	}
	function handleLogsChange(next: LocalLog[]) {
		localLogs = next;
		databaseStore.setCampaignLogs(data.campaign.id, toSavePayload(localLogs));
	}

	// Leaving the editor → stash an invisible autosave snapshot of this campaign.
	beforeNavigate(() => {
		void databaseStore.snapshotCampaign(data.campaign.id);
	});

	// ─── Tabs ──────────────────────────────────────────────────────────────────
	// Autosave means switching tabs is free — no unsaved-changes prompt.
	let activeTab = $state(0);
	function requestTabChange(newTab: number) {
		activeTab = newTab;
	}

	// Chaos bag rides in the reserved `__chaos_bag` log section, edited in General;
	// route it through the logs autosave like any other section edit.
	function handleChaosBagChange(next: LocalLog[]) {
		handleLogsChange(replaceSection(localLogs, RESERVED.chaosBag, next));
	}

	// Write a difficulty's starting chaos bag into the reserved section (materialises it).
	function applyStartingChaosBag(diff: string) {
		const starting = campaignLog?.db.startingChaosBag?.[diff];
		if (!starting) return;
		handleChaosBagChange(
			Object.entries(starting).map(([code, cnt]) =>
				makeEntry(RESERVED.chaosBag, code, [{ type: 'number', value: String(cnt) }])
			)
		);
	}

	// On every difficulty change, ask before (re)initializing the chaos bag to that
	// difficulty's starting tokens. The difficulty value itself already changed (bind).
	let prevDifficulty: 'easy' | 'standard' | 'hard' | 'expert' = initialCampaign.difficulty as
		| 'easy'
		| 'standard'
		| 'hard'
		| 'expert';
	function handleDifficultyChange(newValue: 'easy' | 'standard' | 'hard' | 'expert') {
		const old = prevDifficulty;
		prevDifficulty = newValue;
		if (newValue === old) return;
		if (campaignLog?.db.startingChaosBag) {
			if (confirm(m.archive_chaos_reinit_confirm())) {
				applyStartingChaosBag(newValue);
			} else if (entriesInSection(localLogs, RESERVED.chaosBag).length === 0) {
				// Declined while the bag was still just a preview: freeze the previous
				// difficulty's composition so it doesn't silently follow the new difficulty.
				applyStartingChaosBag(old);
			}
		}
		persistGeneral(); // the difficulty itself changed — autosave it
	}

	// ─── Achievements (incremental, per-tick) ────────────────────────────────────
	async function toggleAchievement(
		def: AchievementDef,
		itemId: string | undefined,
		earned: boolean
	) {
		const key = itemId ? `${def.id}::${itemId}` : def.id;
		// Optimistic local update.
		const next = new Set(manualAchievements);
		if (earned) next.add(key);
		else next.delete(key);
		manualAchievements = next;

		databaseStore.setManualAchievement(
			data.campaign.id,
			{
				family: def.family ?? campaignLog?.db.code ?? '',
				achievementId: def.id,
				itemId: itemId ?? null
			},
			earned
		);
	}

	// ─── Campaign display ──────────────────────────────────────────────────────
	const campaignDisplayName = $derived(
		data.campaign.campaignCode
			? u.campaignName(data.campaign.campaignCode as Campaign)
			: m.archive_campaign_unspecified()
	);

	// ─── Change campaign modal ─────────────────────────────────────────────────
	let changeCampaignOpen = $state(false);
	let changingCampaign = $state(false);

	async function handleChangeCampaign(campaign: Campaign | null) {
		if (!confirm(m.archive_change_campaign_confirm())) return;
		changingCampaign = true;
		changeCampaignOpen = false;

		// Switch scenario set in the database store (clears logs + achievements),
		// then reload to re-hydrate everything.
		databaseStore.changeCampaignCode(data.campaign.id, campaign ?? '');
		await databaseStore.saveNow();
		window.location.reload();
	}

	// ─── Delete ────────────────────────────────────────────────────────────────
	let confirmDeleteOpen = $state(false);
	// ─── Export (format chosen in a modal — a rare action) ───────────────────────
	let exportModalOpen = $state(false);

	// ─── Autosave history (per-campaign snapshots) ───────────────────────────────
	let historyOpen = $state(false);
	let snapshots = $state<SnapshotMeta[]>([]);
	async function openHistory() {
		snapshots = await listSnapshotsFor(data.campaign.id);
		historyOpen = true;
	}
	async function restoreSnapshot(id: string) {
		if (!confirm(m.archive_history_restore_confirm())) return;
		const ok = await databaseStore.restoreCampaignSnapshot(id);
		historyOpen = false;
		// Reload so the editor re-initializes from the restored campaign.
		if (ok) window.location.reload();
	}

	async function handleDelete() {
		confirmDeleteOpen = false;
		databaseStore.removeCampaign(data.campaign.id);
		await databaseStore.saveNow();
		goto('/archive');
	}

	// Export just this campaign as a file to hand to another player. `.ahlifecam` is
	// the shareable file; `.json` is an uncompressed copy for inspection/debugging.
	async function exportThisCampaign(format: 'gzip' | 'json') {
		if (!databaseStore.doc) return;
		const saved = await downloadCampaignShare(databaseStore.doc, data.campaign.id, format);
		if (saved && format === 'gzip') {
			toast.success('Campaign exported — give the file to another player to import.');
		}
	}
</script>

<svelte:head>
	<title>{m.archive_edit_page_title()}</title>
</svelte:head>

<MarginFull>
	<div class="mb-4">
		<BackButton label={m.common_back()} onClick="/archive" />
	</div>

	<!-- Campaign header + actions (icon-only with tooltips to save space) -->
	<div class="mb-4 flex items-center justify-between gap-4">
		<div>
			<p class="text-primary-500 dark:text-primary-400 text-xs tracking-wider uppercase">
				{m.archive_campaign_label()}
			</p>
			<p class="text-base font-semibold text-black dark:text-white">
				{campaignDisplayName}{title && title !== campaignDisplayName ? ` — ${title}` : ''}
			</p>
		</div>
		<div class="flex gap-2">
			<Button
				label={m.archive_export_campaign()}
				icon={FaIconType.Export}
				hideLabel
				onClick={() => (exportModalOpen = true)}
			/>
			{#if data.canEdit}
				<Button
					label={m.archive_history_button()}
					icon={FaIconType.Reset}
					hideLabel
					onClick={openHistory}
				/>
			{/if}
			{#if data.isOwner}
				<Button
					label={m.archive_change_campaign()}
					icon={FaIconType.Edit}
					hideLabel
					onClick={() => (changeCampaignOpen = true)}
					disabled={changingCampaign}
				/>
			{/if}
			{#if data.canDelete}
				<Button
					label={m.archive_delete()}
					icon={FaIconType.Delete}
					hideLabel
					danger
					onClick={() => (confirmDeleteOpen = true)}
				/>
			{/if}
		</div>
	</div>

	<!-- Tabs -->
	<Tabs
		direction="horizontal"
		activeTabIndex={activeTab}
		onTabChange={requestTabChange}
		tabs={[
			{ label: m.archive_tab_general() },
			{ label: m.archive_tab_players_and_decks() },
			{ label: m.archive_tab_logs() },
			{ label: m.archive_tab_achievements() },
			{ label: 'Extra' }
		]}
	/>

	<!-- ── General tab ──────────────────────────────────────────────────────── -->
	{#if activeTab === 0}
		<GeneralTab
			canEdit={data.canEdit}
			log={campaignLog}
			bind:title
			bind:difficulty
			bind:draft
			bind:displayInProfile
			bind:startDate
			bind:finishDate
			chaosBagEntries={entriesInSection(localLogs, RESERVED.chaosBag)}
			onChaosBagChange={handleChaosBagChange}
			onDifficultyChange={handleDifficultyChange}
			onGeneralChange={persistGeneral}
		/>

		<!-- ── Players & Decks tab ──────────────────────────────────────────────────── -->
	{:else if activeTab === 1}
		<PlayersAndDecksTab
			campaignId={data.campaign.id}
			canEdit={data.canEdit}
			players={data.players}
			decks={data.decks}
			{cardResolver}
			{tabooLists}
		/>

		<!-- ── Logs tab ──────────────────────────────────────────────────────────────────── -->
	{:else if activeTab === 2}
		{#if !data.campaign.campaignCode}
			<p class="text-primary-400 dark:text-primary-500 mt-4 text-sm">
				{m.archive_logs_no_campaign()}
			</p>
		{:else}
			{#if campaignLog && logConflicts.length}
				<div class="mt-3 max-w-xl">
					<ValidationBanner log={campaignLog} conflicts={logConflicts} />
				</div>
			{/if}
			<LogsTab
				log={campaignLog}
				canEdit={data.canEdit}
				cards={allCards}
				{investigators}
				{localLogs}
				onLogsChange={handleLogsChange}
			/>
		{/if}

		<!-- ── Achievements tab ──────────────────────────────────────────────────────── -->
	{:else if activeTab === 3}
		{#if campaignLog && recorded}
			<AchievementsTab
				log={campaignLog}
				{recorded}
				manual={manualAchievements}
				canEdit={data.canEdit}
				onToggle={toggleAchievement}
			/>
		{:else}
			<p class="text-primary-400 dark:text-primary-500 mt-4 text-sm">
				{m.archive_logs_no_campaign()}
			</p>
		{/if}
	{:else if activeTab === 4}
		{#if campaignLog}
			<ExtraTab
				log={campaignLog}
				canEdit={data.canEdit}
				{localLogs}
				onLogsChange={handleLogsChange}
			/>
		{:else}
			<p class="text-primary-400 dark:text-primary-500 mt-4 text-sm">
				{m.archive_logs_no_campaign()}
			</p>
		{/if}
	{/if}
</MarginFull>

<!-- Change Campaign Modal -->
<Modal
	isOpen={changeCampaignOpen}
	onClose={() => (changeCampaignOpen = false)}
	title={m.archive_change_campaign()}
	maxWidth="lg"
>
	<CampaignSelector
		selected={data.campaign.campaignCode ? (data.campaign.campaignCode as Campaign) : null}
		onSelect={(campaign) => {
			changeCampaignOpen = false;
			handleChangeCampaign(campaign);
		}}
	/>
</Modal>

<!-- Confirm Delete Modal -->
<Modal
	isOpen={confirmDeleteOpen}
	onClose={() => (confirmDeleteOpen = false)}
	title={m.archive_delete()}
	maxWidth="sm"
>
	<p class="mb-4 text-black dark:text-white">{m.archive_delete_confirm()}</p>
	{#snippet footer()}
		<div class="flex justify-end gap-2">
			<Button label={m.common_back()} onClick={() => (confirmDeleteOpen = false)} />
			<Button label={m.archive_delete()} icon={FaIconType.Delete} danger onClick={handleDelete} />
		</div>
	{/snippet}
</Modal>

<!-- Export format chooser (rare action → modal instead of two header buttons) -->
<Modal
	isOpen={exportModalOpen}
	onClose={() => (exportModalOpen = false)}
	title={m.archive_export_campaign()}
	maxWidth="sm"
>
	<p class="mb-4 text-black dark:text-white">
		Share this campaign as a compressed <code>.ahlifecam</code> file, or export plain
		<code>.json</code> for inspection.
	</p>
	{#snippet footer()}
		<div class="flex justify-end gap-2">
			<Button
				label="Export .json"
				onClick={() => {
					exportThisCampaign('json');
					exportModalOpen = false;
				}}
			/>
			<Button
				label="Export .ahlifecam"
				icon={FaIconType.Export}
				highlighted
				onClick={() => {
					exportThisCampaign('gzip');
					exportModalOpen = false;
				}}
			/>
		</div>
	{/snippet}
</Modal>

<!-- Autosave history (per-campaign snapshots; restore replaces the campaign) -->
<SnapshotHistoryModal
	isOpen={historyOpen}
	{snapshots}
	onRestore={restoreSnapshot}
	onClose={() => (historyOpen = false)}
/>
