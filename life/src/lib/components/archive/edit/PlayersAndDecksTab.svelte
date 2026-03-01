<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { untrack } from 'svelte';
	import {
		Button,
		CardFormMultiple,
		DeckBanner,
		DeckDisplay,
		FaIconType,
		FormLabelWithHelp,
		ImportDecksModal,
		Modal,
		RadioButtons,
		SectionSeparator,
		TextInput,
		UserDisplay,
		type SelectedCardEntry
	} from '@5argon/arkham-life-ui';
	import type { Deck } from '@5argon/arkham-kohaku';
	import {
		linearizeDeck,
		linkedAhdbDeckToDeck,
		type AhdbDeck,
		card,
		type Card,
		deck as deckUtility,
		service
	} from '@5argon/arkham-kohaku';
	import * as m from '$lib/paraglide/messages.js';
	import { databaseStore } from '$lib/database/database.svelte';
	import { distinctHands, findPlayer, resolvePlayerCount, type PlayerCount } from '$lib/database/document';
	import { investigatorFromAhdbDeck } from '$lib/database/repository';
	import { getAllCards, type createCardResolver, type loadAllTabooLists } from '$lib/card-data.js';
	import PlayerIconSelector from '$lib/components/PlayerIconSelector.svelte';
	import AddParticipantModal from './AddParticipantModal.svelte';
	import Doc from '$lib/docs/Doc.svelte';

	interface Player {
		id: string;
		userId: string;
		username: string;
		iconCardCode: string;
		/** Stable uid (local build). */
		uid?: string | null;
		/** True when this participant isn't in the local roster. */
		isGuest?: boolean;
		canEdit: boolean;
		canDelete: boolean;
	}

	interface DeckRow {
		id: string;
		investigatorCode: string;
		versions: { sequenceIndex: number; ahdbJson: string }[];
		owner: { username: string; iconCardCode: string } | null;
	}

	interface Props {
		campaignId: string;
		canEdit: boolean;
		players: Player[];
		decks: DeckRow[];
		cardResolver: ReturnType<typeof createCardResolver>;
		tabooLists: ReturnType<typeof loadAllTabooLists>;
	}

	let { campaignId, canEdit, players, decks, cardResolver, tabooLists }: Props = $props();

	// ─── Players ──────────────────────────────────────────────────────────────
	let localPlayers = $state(untrack(() => players.map((p) => ({ ...p }))));

	$effect(() => {
		localPlayers = players.map((p) => ({ ...p }));
	});

	// ─── Considered player count (auto-saved like the other participant edits) ───
	// Read straight from the reactive doc so the radio reflects the persisted value.
	const campaign = $derived(databaseStore.doc?.campaigns.find((c) => c.id === campaignId));
	const playerCountSetting: PlayerCount = $derived(campaign?.playerCount ?? 'auto');
	const participantCount = $derived(campaign?.participants.length ?? localPlayers.length);
	const playerCountResolved = $derived(resolvePlayerCount(playerCountSetting, participantCount));
	function setPlayerCount(value: PlayerCount) {
		databaseStore.updateCampaignGeneral(campaignId, { playerCount: value });
	}

	// ─── Solo style (only when the resolved player count is 1) ───────────────────
	// True Solo vs Multi-Handed can't be told apart from deck count alone (a lone
	// player may swap investigators mid-campaign), so it's an explicit marker; when
	// multi-handed, each deck gets a "hand" number (1–4) and the distinct count is X.
	const multiHanded = $derived(campaign?.multiHanded ?? false);
	function setMultiHanded(value: boolean) {
		databaseStore.updateCampaignGeneral(campaignId, { multiHanded: value });
	}
	const soloTag = $derived.by(() => {
		if (playerCountResolved !== 1) return null;
		if (!multiHanded) return 'True Solo';
		const x = distinctHands(campaign?.decks ?? []);
		return x >= 2 ? `Solo ${x}-Handed` : 'Solo (Multi-Handed)';
	});
	function deckHand(deckId: string): number | null {
		return campaign?.decks.find((d) => d.id === deckId)?.hand ?? null;
	}
	function setDeckHand(deckId: string, raw: string) {
		const n = Math.floor(Number(raw));
		const hand = Number.isFinite(n) && n >= 1 ? Math.min(n, 4) : null;
		databaseStore.assignDeckHand(campaignId, deckId, hand);
	}

	// ─── Local build: roster, guests, participants ──────────────────────────────
	const playerCards = getAllCards().filter(card.playerCardsNonCampaignFilter);

	/** Roster members (owner + sub-players) not already on this campaign. */
	const rosterCandidates = $derived.by(() => {
		const doc = databaseStore.doc;
		if (!doc) return [];
		const present = new Set(localPlayers.map((p) => p.uid ?? p.id));
		return [doc.owner, ...doc.players]
			.filter((r) => !present.has(r.uid))
			.map((r) => ({ uid: r.uid, name: r.name, iconCardCode: r.iconCardCode }));
	});

	let addParticipantOpen = $state(false);

	// ─── Play groups: bulk-add every member as a participant ─────────────────────
	const playGroups = $derived(databaseStore.doc?.playGroups ?? []);
	let addPlayGroupOpen = $state(false);

	async function handleAddPlayGroup(groupUid: string) {
		const doc = databaseStore.doc;
		if (!doc) return;
		const group = doc.playGroups.find((g) => g.uid === groupUid);
		if (group) {
			for (const uid of group.memberUids) {
				const member = findPlayer(doc, uid);
				if (!member) continue;
				databaseStore.addParticipant(campaignId, {
					uid: member.uid,
					name: member.name,
					iconCardCode: member.iconCardCode
				});
			}
		}
		addPlayGroupOpen = false;
		await invalidateAll();
	}

	async function handleAddRoster(uid: string) {
		databaseStore.addParticipant(campaignId, { uid, name: '', iconCardCode: '' });
		await invalidateAll();
	}
	async function handleAddGuest(fields: {
		uid: string | null;
		name: string;
		iconCardCode: string;
	}) {
		if (fields.uid) {
			databaseStore.addParticipant(campaignId, {
				uid: fields.uid,
				name: fields.name,
				iconCardCode: fields.iconCardCode
			});
		} else {
			// One-off guest: no uid of their own — mint a frozen local label.
			databaseStore.addOneOffGuest(campaignId, {
				name: fields.name,
				iconCardCode: fields.iconCardCode
			});
		}
		await invalidateAll();
	}
	async function handleRemoveParticipant(uid: string) {
		databaseStore.removeParticipant(campaignId, uid);
		await invalidateAll();
	}

	let editGuest = $state<{ uid: string; name: string; card: Card | null } | null>(null);
	function openEditGuest(player: Player) {
		let resolved: Card | null = null;
		try {
			resolved = cardResolver.resolve(player.iconCardCode);
		} catch {
			resolved = null;
		}
		editGuest = { uid: player.uid ?? player.id, name: player.username, card: resolved };
	}
	async function saveEditGuest() {
		if (!editGuest) return;
		databaseStore.updateParticipant(campaignId, editGuest.uid, {
			name: editGuest.name.trim(),
			...(editGuest.card ? { iconCardCode: editGuest.card.code } : {})
		});
		editGuest = null;
		await invalidateAll();
	}

	// ─── Decks ────────────────────────────────────────────────────────────────
	let showImportModal = $state(false);
	let importingDecks = $state(false);
	// Bumped to remount the import modal FRESH (clearing leftover deck inputs/results).
	// We bump AFTER closing — not on open — so the pre-mounted modal plays its open
	// fade; remounting on open would skip the transition.
	let importModalKey = $state(0);

	function openImportModal() {
		showImportModal = true;
	}
	// Reset to a fresh modal once the close transition has finished.
	function resetImportModalSoon() {
		setTimeout(() => importModalKey++, 250);
	}

	function buildDeckFromVersions(
		versions: { sequenceIndex: number; ahdbJson: string }[]
	): Deck | null {
		if (versions.length === 0) return null;
		try {
			const sorted = [...versions].sort((a, b) => a.sequenceIndex - b.sequenceIndex);
			const ahdbDecks: AhdbDeck[] = sorted.map((v) => JSON.parse(v.ahdbJson) as AhdbDeck);
			const nodes: service.LinkedAhdbDeck[] = ahdbDecks.map((d) => ({ deck: d }));
			for (let i = 0; i < nodes.length - 1; i++) {
				nodes[i].next = nodes[i + 1];
				nodes[i + 1].previous = nodes[i];
			}
			return linkedAhdbDeckToDeck(nodes[0], cardResolver, tabooLists);
		} catch {
			return null;
		}
	}

	/** Synthesize a blank AHDB deck (no cards) so a deck-less investigator entry
	 *  renders through the same `DeckBanner` as a real deck — just empty. */
	function blankDeckJson(investigatorCode: string): string {
		let name = investigatorCode;
		try {
			name = cardResolver.resolve(investigatorCode).name;
		} catch {
			// unknown code — fall back to the raw code as the deck name
		}
		const blank: AhdbDeck = {
			id: `deckless-${investigatorCode}`,
			name,
			date_creation: '1970-01-01T00:00:00Z',
			date_update: '1970-01-01T00:00:00Z',
			description_md: '',
			user_id: null,
			investigator_code: investigatorCode,
			investigator_name: name,
			slots: null,
			sideSlots: null,
			ignoreDeckLimitSlots: null,
			version: '0',
			xp: null,
			xp_spent: null,
			xp_adjustment: null,
			exile_string: null,
			taboo_id: 0,
			meta: '{}',
			tags: '',
			previous_deck: null,
			next_deck: null
		};
		return JSON.stringify(blank);
	}

	/** A renderable deck for a row: the real deck when versions exist, otherwise a
	 *  blank deck built from just the investigator code (deck-less entry). */
	function deckPreview(deckRow: DeckRow): Deck | null {
		if (deckRow.versions.length > 0) return buildDeckFromVersions(deckRow.versions);
		return buildDeckFromVersions([
			{ sequenceIndex: 0, ahdbJson: blankDeckJson(deckRow.investigatorCode) }
		]);
	}

	async function handleImportDecks(importedDecks: Deck[]) {
		showImportModal = false;
		resetImportModalSoon();
		importingDecks = true;
		for (const deck of importedDecks) {
			// Linearise the full upgrade chain (oldest → newest)
			const chain = linearizeDeck(deck);
			// Recover the raw AhdbDeck for each version from the stored compressed JSON
			const versions: AhdbDeck[] = chain.map((d) => {
				if (!d.compressedJson) throw new Error('Missing compressedJson on deck version');
				return deckUtility.decompressDeck(d.compressedJson);
			});
			databaseStore.addDeck(campaignId, {
				investigator: investigatorFromAhdbDeck(versions[0]),
				versions: versions.map((v, i) => ({ sequenceIndex: i, ahdbJson: JSON.stringify(v) }))
			});
		}
		importingDecks = false;
		await invalidateAll();
	}

	// ─── Add Investigator (deck-less) ────────────────────────────────────────────
	const allInvestigatorCards = $derived(
		getAllCards().filter(card.deckbuildingInvestigatorCardsFilter)
	);
	let showAddInvestigatorModal = $state(false);
	let addInvestigatorEntries = $state<SelectedCardEntry[]>([]);

	async function handleAddInvestigatorOnly() {
		for (const entry of addInvestigatorEntries) {
			databaseStore.addDeck(campaignId, { investigator: entry.code, versions: [] });
		}
		addInvestigatorEntries = [];
		showAddInvestigatorModal = false;
		await invalidateAll();
	}

	const assignOwnerChoices = $derived(
		players.map((p) => ({
			id: p.userId,
			username: p.username,
			iconCardCode: p.iconCardCode,
			isGuest: !!p.isGuest
		}))
	);

	let assignOwnerDeckId = $state<string | null>(null);
	const assignOwnerDeckLess = $derived(
		decks.find((d) => d.id === assignOwnerDeckId)?.versions.length === 0
	);
	// The deck whose full contents are shown in the deck modal (null = closed).
	let deckModalDeck = $state<Deck | null>(null);

	async function handleAssignOwner(deckId: string, ownerUserId: string | null) {
		databaseStore.assignDeckOwner(campaignId, deckId, ownerUserId);
		assignOwnerDeckId = null;
		await invalidateAll();
	}

	async function handleRemoveDeck(deckId: string) {
		databaseStore.removeDeck(campaignId, deckId);
		await invalidateAll();
	}
</script>

<!-- Auto-save notice -->
<p class="text-primary-500 dark:text-primary-400 mt-4 mb-2 text-sm italic">
	{m.archive_players_auto_save_help()}
</p>

<!-- ── Players ──────────────────────────────────────────────── -->
<SectionSeparator title={m.archive_players()} />

<div class="mb-4 flex flex-col gap-2">
	{#each localPlayers as player (player.id)}
		<div class="bg-primary-100 dark:bg-primary-800 flex items-center gap-3 rounded p-3">
			<UserDisplay
				username={player.username}
				card={cardResolver.resolve(player.iconCardCode)}
				size="sm"
			/>
			{#if player.isGuest}
				<span
					class="bg-primary-200 dark:bg-primary-700 text-primary-700 dark:text-primary-200 rounded px-2 py-0.5 text-xs font-semibold"
					title="A guest keeps their own arkham.life. Their name and portrait here are frozen labels you chose."
				>
					Guest
				</span>
			{/if}
			<div class="ml-auto flex items-center gap-1">
				{#if player.isGuest}
					<Button
						label="Edit"
						icon={FaIconType.Edit}
						hideLabel
						onClick={() => openEditGuest(player)}
					/>
				{/if}
				{#if player.canDelete}
					<Button
						label="Remove"
						icon={FaIconType.Delete}
						danger
						hideLabel
						onClick={() => handleRemoveParticipant(player.uid ?? player.id)}
					/>
				{/if}
			</div>
		</div>
	{/each}
</div>

<div class="flex flex-wrap gap-2">
	<Button
		label="Add player or guest"
		icon={FaIconType.Add}
		onClick={() => (addParticipantOpen = true)}
	/>
	{#if playGroups.length > 0}
		<Button
			label="Add from Play Group"
			icon={FaIconType.Add}
			onClick={() => (addPlayGroupOpen = true)}
		/>
	{/if}
</div>

{#snippet playerCountHelp()}<Doc path="archive/edit/player-count" />{/snippet}

<!-- ── Considered player count ─────────────────────────────────────────────── -->
<div class="mt-4 max-w-xl">
	{#if canEdit}
		<RadioButtons
			label="Player count"
			helpContent={playerCountHelp}
			selectedValue={playerCountSetting}
			onChange={setPlayerCount}
			choices={[
				{ value: 'auto', label: 'Auto' },
				{ value: 1, label: '1' },
				{ value: 2, label: '2' },
				{ value: 3, label: '3' },
				{ value: 4, label: '4' },
				{ value: 'unspecified', label: 'Unspecified' }
			]}
		/>
		{#if playerCountSetting === 'auto'}
			<p class="text-primary-500 dark:text-primary-400 mt-1 text-xs">
				Counts as {playerCountResolved ?? '—'} ({participantCount} added, capped at 4).
			</p>
		{/if}
	{:else}
		<p class="text-primary-500 dark:text-primary-400 text-sm">
			Player count: {playerCountResolved ?? 'Unspecified'}
		</p>
	{/if}
</div>

<!-- ── Solo style (shown only for a 1-player campaign) ──────────────────────── -->
{#if playerCountResolved === 1}
	<div class="mt-4 flex max-w-xl flex-wrap items-center gap-3">
		{#if canEdit}
			<RadioButtons
				label="Solo style"
				selectedValue={multiHanded ? 'multi' : 'true'}
				onChange={(v) => setMultiHanded(v === 'multi')}
				choices={[
					{ value: 'true', label: 'True Solo' },
					{ value: 'multi', label: 'Multi-Handed' }
				]}
			/>
		{/if}
		{#if soloTag}
			<span
				class="bg-secondary-200 dark:bg-secondary-700 text-secondary-800 dark:text-secondary-200 mt-5 rounded px-2 py-0.5 text-xs font-semibold"
			>
				{soloTag}
			</span>
		{/if}
	</div>
	{#if canEdit && multiHanded}
		<p class="text-primary-500 dark:text-primary-400 mt-1 text-xs">
			Give each deck a hand number (1–4) below — distinct hands make it "Solo X-Handed".
		</p>
	{/if}
{/if}

<!-- ── Decks ───────────────────────────────────────────────────────────────── -->
<SectionSeparator title={m.archive_tab_decks()} />

<div class="mt-4">
	<div class="mb-4 flex flex-wrap gap-3">
		{#each decks as deckRow (deckRow.id)}
			{@const deck = deckPreview(deckRow)}
			{@const deckLess = deckRow.versions.length === 0}
			<div class="flex flex-col items-center gap-2">
				{#if deck}
					<DeckBanner
						{deck}
						{cardResolver}
						mode="campaign"
						onClick={deckLess ? undefined : () => (deckModalDeck = deck)}
					/>
				{:else}
					{@const invCard = (() => {
						try {
							return cardResolver.resolve(deckRow.investigatorCode);
						} catch {
							return null;
						}
					})()}
					<div
						class="border-primary-300 dark:border-primary-600 flex h-20 w-32 items-center justify-center rounded border p-2 text-center text-xs font-semibold text-black dark:text-white"
					>
						{invCard?.name ?? deckRow.investigatorCode}
					</div>
				{/if}

				{#if deckRow.owner}
					<UserDisplay
						username={deckRow.owner.username}
						card={cardResolver.resolve(deckRow.owner.iconCardCode)}
						size="sm"
					/>
				{:else}
					<span
						class="inline-flex items-center gap-1 rounded bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-900/40 dark:text-amber-200"
					>
						⚠ {m.archive_deck_no_owner()}
					</span>
				{/if}

				{#if canEdit && playerCountResolved === 1 && multiHanded}
					<label
						class="text-primary-700 dark:text-primary-300 flex items-center gap-1 text-xs font-semibold"
					>
						Hand
						<input
							type="number"
							min="1"
							max="4"
							value={deckHand(deckRow.id) ?? ''}
							onchange={(e) => setDeckHand(deckRow.id, e.currentTarget.value)}
							class="border-primary-300 dark:border-primary-600 bg-primary-50 dark:bg-primary-800 w-12 rounded border px-1.5 py-0.5 text-center text-black dark:text-white"
						/>
					</label>
				{/if}

				{#if canEdit}
					<div class="flex gap-1">
						<Button
							label={deckLess ? 'Assign Player' : m.archive_assign_owner()}
							icon={FaIconType.Investigator}
							onClick={() => (assignOwnerDeckId = deckRow.id)}
						/>
						<Button
							label="Remove"
							icon={FaIconType.Delete}
							danger
							hideLabel
							onClick={() => handleRemoveDeck(deckRow.id)}
						/>
					</div>
				{/if}
			</div>
		{/each}
	</div>

	{#if canEdit}
		<div class="flex flex-wrap gap-2">
			<FormLabelWithHelp label={m.archive_import_decks()} disableClick>
				<Button
					label={m.archive_import_decks()}
					icon={FaIconType.Import}
					onClick={openImportModal}
					disabled={importingDecks}
				/>
			</FormLabelWithHelp>
			<FormLabelWithHelp label="Add Investigator" disableClick>
				<Button
					label="Add Investigator"
					icon={FaIconType.Investigator}
					onClick={() => (showAddInvestigatorModal = true)}
				/>
			</FormLabelWithHelp>
		</div>
	{/if}
</div>

<!-- Import Decks Modal — pre-mounted so it fades on open; remounts fresh after close. -->
{#key importModalKey}
	<ImportDecksModal
		{cardResolver}
		taboos={tabooLists}
		confirmButtonText={m.archive_import_decks()}
		isOpen={showImportModal}
		onClose={() => {
			showImportModal = false;
			resetImportModalSoon();
		}}
		onConfirm={handleImportDecks}
		previewMode="campaign"
	/>
{/key}

<!-- Assign Owner Modal -->
<Modal
	isOpen={assignOwnerDeckId !== null}
	onClose={() => (assignOwnerDeckId = null)}
	title={assignOwnerDeckLess ? 'Assign Player' : m.archive_assign_owner()}
	maxWidth="sm"
>
	<div class="flex flex-col gap-2 py-2">
		<button
			class="hover:bg-primary-100 dark:hover:bg-primary-800 rounded p-2 text-left text-sm text-black dark:text-white"
			onclick={() => assignOwnerDeckId && handleAssignOwner(assignOwnerDeckId, null)}
		>
			{m.archive_deck_no_owner()}
		</button>
		{#each assignOwnerChoices as choice (choice.id)}
			<button
				class="hover:bg-primary-100 dark:hover:bg-primary-800 flex items-center gap-2 rounded p-2 text-left"
				onclick={() => assignOwnerDeckId && handleAssignOwner(assignOwnerDeckId, choice.id)}
			>
				<UserDisplay
					username={choice.username}
					card={cardResolver.resolve(choice.iconCardCode)}
					size="sm"
				/>
				{#if choice.isGuest}
					<span
						class="bg-primary-200 dark:bg-primary-700 text-primary-700 dark:text-primary-200 rounded px-2 py-0.5 text-xs font-semibold"
					>
						Guest
					</span>
				{/if}
			</button>
		{/each}
	</div>
</Modal>

<!-- Local build: bulk-add every member of a play group as a participant -->
<Modal
	isOpen={addPlayGroupOpen}
	onClose={() => (addPlayGroupOpen = false)}
	title="Add from Play Group"
	maxWidth="sm"
>
	<div class="flex flex-col gap-2 py-2">
		{#each playGroups as group (group.uid)}
			<button
				class="hover:bg-primary-100 dark:hover:bg-primary-800 flex flex-col gap-2 rounded p-2 text-left"
				onclick={() => handleAddPlayGroup(group.uid)}
			>
				<span class="text-primary-900 dark:text-primary-100 text-sm font-semibold"
					>{group.name}</span
				>
				<div class="flex flex-wrap items-center gap-2">
					{#each group.memberUids as memberUid (memberUid)}
						{@const member = databaseStore.doc
							? findPlayer(databaseStore.doc, memberUid)
							: undefined}
						{#if member}
							<UserDisplay
								username={member.name}
								card={cardResolver.resolve(member.iconCardCode)}
								size="sm"
							/>
						{/if}
					{/each}
				</div>
			</button>
		{/each}
	</div>
</Modal>

<!-- Local build: add a roster member or a guest, and edit a guest's label -->
<AddParticipantModal
	isOpen={addParticipantOpen}
	onClose={() => (addParticipantOpen = false)}
	{rosterCandidates}
	{cardResolver}
	onAddRoster={handleAddRoster}
	onAddGuest={handleAddGuest}
/>

<Modal
	isOpen={editGuest !== null}
	onClose={() => (editGuest = null)}
	title="Edit guest"
	maxWidth="md"
>
	{#if editGuest}
		<div class="flex flex-col gap-3 py-2">
			<TextInput label="Name" bind:value={editGuest.name} />
			<PlayerIconSelector
				bind:selectedCard={editGuest.card}
				cards={playerCards}
				placeholder="Search with a player card's name"
			/>
			<div>
				<p class="text-primary-900 dark:text-primary-100 mb-1 text-sm font-semibold">Preview</p>
				<UserDisplay username={editGuest.name || 'Guest'} card={editGuest.card} />
			</div>
			<Button
				highlighted
				label="Save"
				disabled={editGuest.name.trim().length === 0}
				onClick={saveEditGuest}
			/>
		</div>
	{/if}
</Modal>

<!-- Add Investigator (deck-less) Modal -->
<Modal
	isOpen={showAddInvestigatorModal}
	onClose={() => {
		showAddInvestigatorModal = false;
		addInvestigatorEntries = [];
	}}
	title="Add Investigator"
	maxWidth="lg"
>
	<div class="flex flex-col gap-4 pb-4">
		<p class="text-primary-500 dark:text-primary-400 text-sm">
			Add an investigator without a full deck — useful when deck data is unavailable.
		</p>
		<CardFormMultiple
			allowDuplicates={false}
			cards={allInvestigatorCards}
			filter={card.deckbuildingInvestigatorCardsFilter}
			label="Search Investigator"
			onEntriesChange={(entries) => (addInvestigatorEntries = entries)}
			selectedEntries={addInvestigatorEntries}
		/>
		<Button
			label="Add"
			highlighted
			disabled={addInvestigatorEntries.length === 0}
			onClick={handleAddInvestigatorOnly}
		/>
	</div>
</Modal>

<!-- Deck Details Modal — click a deck banner's title to view its full contents. -->
<Modal
	isOpen={deckModalDeck !== null}
	onClose={() => (deckModalDeck = null)}
	title={m.archive_tab_decks()}
	maxWidth="full"
>
	{#if deckModalDeck}
		<DeckDisplay deck={deckModalDeck} {cardResolver} mode="campaign" />
	{/if}
</Modal>
