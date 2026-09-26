<!--
@component
The body of one tab of the Campaign Archive editor. The logs are seeded once from the record; the
page re-keys this component when the record is replaced (campaign change, restored autosave).
-->
<script module lang="ts">
	export type EditorTab = 'general' | 'decks' | 'logs' | 'achievements' | 'extra';
</script>

<script lang="ts">
	import { untrack } from 'svelte';
	import {
		findValidatorConflicts,
		standaloneSetup,
		type AchievementDef
	} from '@5argon/arkham-campaign-data';
	import * as m from '$lib/paraglide/messages.js';
	import { getAllCards, resolveCardOrNull } from '$lib/card-data';
	import { baseFamilyOf } from '$lib/campaign/records/campaign-family';
	import { loadCampaignLog } from '$lib/campaign/records/campaign-log-source';
	import {
		RESERVED,
		chaosBagEntries,
		entriesInSection,
		hydrate,
		isInterconnected,
		manualTickKey,
		recordedLogKeys,
		replaceSection,
		toRecordedState,
		toSavePayload,
		withInterconnected,
		type LocalLog
	} from '$lib/campaign/records/recorded-state';
	import { investigatorCodesFromDecks } from '$lib/campaign/utils/investigators';
	import { databaseStore } from '$lib/database/database.svelte';
	import { isStandaloneRecord, type CampaignRecord, type Difficulty } from '$lib/database/document';
	import ConfirmModal from '../ConfirmModal.svelte';
	import AchievementsTab from './achievements/AchievementsTab.svelte';
	import ExtraTab from './ExtraTab.svelte';
	import GeneralTab from './GeneralTab.svelte';
	import LogsTab from './LogsTab.svelte';
	import PlayersAndDecksTab from './PlayersAndDecksTab.svelte';
	import TdeLinkedLog from './TdeLinkedLog.svelte';
	import ValidationBanner from './ValidationBanner.svelte';

	let { record, tab }: { record: CampaignRecord; tab: EditorTab } = $props();

	const allCards = getAllCards();
	const standalone = $derived(isStandaloneRecord(record) ? record : null);
	const campaignLog = $derived(loadCampaignLog(record.campaignCode));
	const setup = $derived(standalone ? standaloneSetup(standalone.campaignCode, standalone.scenario) : undefined);
	const investigators = $derived(
		investigatorCodesFromDecks(
			record.decks.map((d) => ({ investigatorCode: d.investigator.investigatorCode, versions: d.versions }))
		).map((code) => ({ code, name: resolveCardOrNull(code)?.name ?? code }))
	);

	let localLogs = $state<LocalLog[]>(untrack(() => hydrate(record.logs)));
	let linkedLogs = $state<LocalLog[]>(untrack(() => hydrate(record.linkedLog ?? [])));

	function setLogs(next: LocalLog[]) {
		localLogs = next;
		databaseStore.setCampaignLogs(record.id, toSavePayload(next));
	}
	function setLinkedLogs(next: LocalLog[]) {
		linkedLogs = next;
		databaseStore.setCampaignLinkedLogs(record.id, toSavePayload(next));
	}

	const recorded = $derived(
		campaignLog ? toRecordedState(campaignLog, localLogs, { difficulty: record.difficulty }) : undefined
	);
	const conflicts = $derived(
		campaignLog ? findValidatorConflicts(campaignLog, recordedLogKeys(localLogs)) : []
	);
	const manual = $derived(
		new Set(record.manualAchievements.map((a) => manualTickKey(a.achievementId, a.itemId)))
	);
	function toggleAchievement(def: AchievementDef, itemId: string | undefined, earned: boolean) {
		databaseStore.setManualAchievement(
			record.id,
			{ family: def.family ?? campaignLog?.db.code ?? '', achievementId: def.id, itemId: itemId ?? null },
			earned
		);
	}

	const tdeFamily = $derived(campaignLog ? baseFamilyOf(campaignLog) : '');

	// ─── Chaos bag ───────────────────────────────────────────────────────────────
	const startingBags = $derived(
		(standalone ? setup?.chaosBag : campaignLog?.db.startingChaosBag) ?? null
	);
	const setChaosBag = (next: LocalLog[]) => setLogs(replaceSection(localLogs, RESERVED.chaosBag, next));
	function useStartingBag(difficulty: Difficulty) {
		const bag = startingBags?.[difficulty];
		if (bag) setChaosBag(chaosBagEntries(bag));
	}

	/** A difficulty change asks before replacing the bag with the new starting bag. */
	let reseedAsk = $state<{ next: Difficulty; previous: Difficulty } | null>(null);
	function onDifficultyChange(next: Difficulty, previous: Difficulty) {
		if (startingBags?.[next]) reseedAsk = { next, previous };
	}
	function answerReseed(yes: boolean) {
		if (!reseedAsk) return;
		const { next, previous } = reseedAsk;
		reseedAsk = null;
		if (yes) useStartingBag(next);
		// An unrecorded bag only previews the starting bag; keep the one it was showing.
		else if (entriesInSection(localLogs, RESERVED.chaosBag).length === 0) useStartingBag(previous);
	}
</script>

{#if tab === 'general'}
	<GeneralTab
		{record}
		isStandalone={!!standalone}
		difficultyOptions={setup?.difficulties}
		showChaosBag={!!campaignLog}
		{startingBags}
		chaosBagEntries={entriesInSection(localLogs, RESERVED.chaosBag)}
		onChaosBagChange={setChaosBag}
		{onDifficultyChange}
	/>
{:else if tab === 'decks'}
	<PlayersAndDecksTab {record} isStandalone={!!standalone} />
{:else if !campaignLog}
	<p class="text-primary-400 dark:text-primary-500 mt-4 text-sm">
		{record.campaignCode && tab === 'logs' ? m.archive_logs_no_data() : m.archive_logs_no_campaign()}
	</p>
{:else if tab === 'logs'}
	{#if conflicts.length}
		<div class="mt-3 max-w-xl">
			<ValidationBanner log={campaignLog} {conflicts} />
		</div>
	{/if}
	{#if standalone}
		<p class="text-primary-500 mt-3 mb-1 text-sm">{m.archive_standalone_logs_hint()}</p>
	{/if}
	<LogsTab
		log={campaignLog}
		cards={allCards}
		{investigators}
		{localLogs}
		onlyScenario={standalone?.scenario}
		onLogsChange={setLogs}
	/>
	{#if (tdeFamily === 'tdea' || tdeFamily === 'tdeb') && !standalone}
		<TdeLinkedLog
			family={tdeFamily}
			interconnected={isInterconnected(localLogs)}
			{linkedLogs}
			onInterconnectedChange={(on) => setLogs(withInterconnected(localLogs, on))}
			onLinkedChange={setLinkedLogs}
		/>
	{/if}
{:else if tab === 'achievements' && recorded}
	<AchievementsTab log={campaignLog} {recorded} {manual} onToggle={toggleAchievement} />
{:else if tab === 'extra'}
	<ExtraTab
		log={campaignLog}
		{localLogs}
		{investigators}
		onlyScenario={standalone?.scenario}
		onLogsChange={setLogs}
	/>
{/if}

<ConfirmModal
	isOpen={reseedAsk !== null}
	title={m.archive_chaos_bag()}
	confirmLabel={m.archive_chaos_reinit()}
	onConfirm={() => answerReseed(true)}
	onCancel={() => answerReseed(false)}
>
	{m.archive_chaos_reinit_confirm()}
</ConfirmModal>
