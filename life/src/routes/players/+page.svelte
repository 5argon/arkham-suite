<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import { goto } from '$app/navigation';
	import {
		BackButton,
		BorderedContainer,
		Button,
		FaIconType,
		HelpParagraph,
		MarginFull,
		Modal,
		PageLead,
		SectionSeparator,
		TextInput,
		UserDisplay,
		getToastContext,
	} from '@5argon/arkham-life-ui';
	import * as m from '$lib/paraglide/messages.js';
	import { card, type Card } from '@5argon/arkham-kohaku';

	import { getAllCards, createCardResolver } from '$lib/card-data';
	import { databaseStore } from '$lib/database/database.svelte';
	import { ensureDatabaseLoaded } from '$lib/database/bootstrap';
	import { allPlayers } from '$lib/database/document';
	import PlayerIconSelector from '$lib/components/PlayerIconSelector.svelte';
	import PlayGroupModal from './PlayGroupModal.svelte';

	const cardResolver = createCardResolver();
	const playerCards = getAllCards().filter(card.playerCardsNonCampaignFilter);
	const toast = getToastContext();

	let ready = $state(false);
	onMount(async () => {
		await ensureDatabaseLoaded();
		if (!databaseStore.hasDatabase) {
			goto('/new');
			return;
		}
		ready = true;
	});

	const owner = $derived(databaseStore.doc?.owner ?? null);
	const subPlayers = $derived(databaseStore.doc?.players ?? []);
	const roster = $derived(databaseStore.doc ? allPlayers(databaseStore.doc) : []);
	const playGroups = $derived(databaseStore.doc?.playGroups ?? []);

	function safeResolveCard(code: string): Card | null {
		try {
			return cardResolver.resolve(code);
		} catch {
			return null;
		}
	}
	function memberName(uid: string): string {
		return roster.find((p) => p.uid === uid)?.name ?? uid;
	}

	async function copyUid(uid: string) {
		try {
			await navigator.clipboard.writeText(uid);
			toast.success?.('Copied UID');
		} catch {
			toast.error?.('Could not copy — select and copy it manually.');
		}
	}

	// ── Edit a roster member (owner or sub-player) ──────────────────────────────
	let editTarget = $state<{ uid: string; name: string; card: Card | null } | null>(null);
	function openEdit(member: { uid: string; name: string; iconCardCode: string }) {
		let resolved: Card | null = null;
		try {
			resolved = cardResolver.resolve(member.iconCardCode);
		} catch {
			resolved = null;
		}
		editTarget = { uid: member.uid, name: member.name, card: resolved };
	}
	function saveEdit() {
		if (!editTarget || editTarget.name.trim().length === 0) return;
		databaseStore.updatePlayer(editTarget.uid, {
			name: editTarget.name.trim(),
			...(editTarget.card ? { iconCardCode: editTarget.card.code } : {}),
		});
		editTarget = null;
	}

	// ── Add a sub-player ────────────────────────────────────────────────────────
	let addOpen = $state(false);
	let newName = $state('');
	let newCard = $state<Card | null>(untrack(() => playerCards[Math.floor(Math.random() * playerCards.length)] ?? null));
	function addSubPlayer() {
		if (newName.trim().length === 0) return;
		databaseStore.addPlayer({ name: newName.trim(), iconCardCode: newCard?.code });
		newName = '';
		newCard = playerCards[Math.floor(Math.random() * playerCards.length)] ?? null;
		addOpen = false;
	}

	// ── Remove a sub-player ─────────────────────────────────────────────────────
	let removeTarget = $state<{ uid: string; name: string } | null>(null);
	function confirmRemove() {
		if (!removeTarget) return;
		databaseStore.removePlayer(removeTarget.uid);
		removeTarget = null;
	}

	// ── Play groups: create / edit ──────────────────────────────────────────────
	let groupModalOpen = $state(false);
	let groupEditUid = $state<string | null>(null);
	let groupInitialName = $state('');
	let groupInitialMembers = $state<string[]>([]);

	function openCreateGroup() {
		groupEditUid = null;
		groupInitialName = '';
		groupInitialMembers = [];
		groupModalOpen = true;
	}
	function openEditGroup(group: { uid: string; name: string; memberUids: string[] }) {
		groupEditUid = group.uid;
		groupInitialName = group.name;
		groupInitialMembers = [...group.memberUids];
		groupModalOpen = true;
	}
	function submitGroup(fields: { name: string; memberUids: string[] }) {
		if (groupEditUid) {
			databaseStore.updatePlayGroup(groupEditUid, fields);
		} else {
			databaseStore.createPlayGroup(fields);
		}
		groupModalOpen = false;
	}

	// ── Remove a play group ──────────────────────────────────────────────────────
	let removeGroupTarget = $state<{ uid: string; name: string } | null>(null);
	function confirmRemoveGroup() {
		if (!removeGroupTarget) return;
		databaseStore.removePlayGroup(removeGroupTarget.uid);
		removeGroupTarget = null;
	}
</script>

<svelte:head>
	<title>{m.players_page_title()}</title>
</svelte:head>

<MarginFull>
	<div class="mb-4">
		<BackButton label="Home" onClick="/" />
	</div>

	<PageLead title={m.players_title()} description={m.players_description()} />

	{#if ready && owner}
		<!-- ── You (owner) ─────────────────────────────────────────── -->
		<SectionSeparator title="You" />
		<BorderedContainer>
			<div class="flex flex-wrap items-center gap-4 p-4">
				<UserDisplay username={owner.name} card={safeResolveCard(owner.iconCardCode)} />
				<div class="flex flex-col">
					<span class="text-primary-500 dark:text-primary-400 text-xs">Your UID</span>
					<span class="font-mono text-lg text-black dark:text-white">{owner.uid}</span>
				</div>
				<div class="ml-auto flex gap-2">
					<Button label="View Profile" icon={FaIconType.ExternalLink} onClick={`/p/private/${owner.uid}`} />
					<Button label="Copy UID" icon={FaIconType.Export} onClick={() => copyUid(owner.uid)} />
					<Button label="Edit" icon={FaIconType.Edit} onClick={() => openEdit(owner)} />
				</div>
			</div>
		</BorderedContainer>
		<HelpParagraph>
			Read your UID aloud to a friend so they can add you as a guest in a campaign they record. When they
			share that campaign back to you, your entry resolves to your current name and portrait automatically.
		</HelpParagraph>

		<!-- ── Other players ─────────────────────────────────────────── -->
		<SectionSeparator title="Other Players" />
		<HelpParagraph>
			Other players are people you record on behalf of (e.g. family at your table). They get their own UID
			and their own campaign history inside your database.
		</HelpParagraph>

		<div class="mb-4 flex flex-col gap-2">
			{#each subPlayers as p (p.uid)}
				<div class="bg-primary-100 dark:bg-primary-800 flex flex-wrap items-center gap-3 rounded p-3">
					<UserDisplay username={p.name} card={safeResolveCard(p.iconCardCode)} size="sm" />
					<span class="font-mono text-sm text-black dark:text-white">{p.uid}</span>
					<div class="ml-auto flex gap-1">
						<Button
							label="View Profile"
							icon={FaIconType.ExternalLink}
							hideLabel
							onClick={`/p/private/${p.uid}`}
						/>
						<Button label="Copy UID" icon={FaIconType.Export} hideLabel onClick={() => copyUid(p.uid)} />
						<Button label="Edit" icon={FaIconType.Edit} hideLabel onClick={() => openEdit(p)} />
						<Button
							label="Remove"
							icon={FaIconType.Delete}
							danger
							hideLabel
							onClick={() => (removeTarget = { uid: p.uid, name: p.name })}
						/>
					</div>
				</div>
			{/each}
			{#if subPlayers.length === 0}
				<p class="text-primary-500 dark:text-primary-400 text-sm">No other players yet.</p>
			{/if}
		</div>

		<Button label="Add player" icon={FaIconType.Add} onClick={() => (addOpen = true)} />

		<!-- ── Play groups ─────────────────────────────────────────── -->
		<SectionSeparator title="Play Groups" />
		<HelpParagraph>
			Play groups bundle several players together so you can view a shared profile across everyone's
			campaigns. A player can belong to any number of groups.
		</HelpParagraph>

		<div class="mb-4 flex flex-col gap-2">
			{#each playGroups as g (g.uid)}
				<div class="bg-primary-100 dark:bg-primary-800 flex flex-wrap items-center gap-3 rounded p-3">
					<div class="flex flex-col">
						<span class="text-base font-semibold text-black dark:text-white">{g.name}</span>
						<span class="font-mono text-sm text-black dark:text-white">{g.uid}</span>
						<span class="text-primary-500 dark:text-primary-400 text-xs">
							{#if g.memberUids.length > 0}
								{g.memberUids.map(memberName).join(', ')}
							{:else}
								No members
							{/if}
						</span>
					</div>
					<div class="ml-auto flex gap-1">
						<Button
							label="View Profile"
							icon={FaIconType.ExternalLink}
							hideLabel
							onClick={`/p/private/${g.uid}`}
						/>
						<Button label="Copy UID" icon={FaIconType.Export} hideLabel onClick={() => copyUid(g.uid)} />
						<Button label="Edit" icon={FaIconType.Edit} hideLabel onClick={() => openEditGroup(g)} />
						<Button
							label="Remove"
							icon={FaIconType.Delete}
							danger
							hideLabel
							onClick={() => (removeGroupTarget = { uid: g.uid, name: g.name })}
						/>
					</div>
				</div>
			{/each}
			{#if playGroups.length === 0}
				<p class="text-primary-500 dark:text-primary-400 text-sm">No play groups yet.</p>
			{/if}
		</div>

		<Button label="Create play group" icon={FaIconType.Add} onClick={openCreateGroup} />
	{/if}
</MarginFull>

<!-- Edit member modal -->
<Modal isOpen={editTarget !== null} onClose={() => (editTarget = null)} title="Edit" maxWidth="md">
	{#if editTarget}
		<div class="flex flex-col gap-3 py-2">
			<TextInput label="Name" bind:value={editTarget.name} />
			<PlayerIconSelector bind:selectedCard={editTarget.card} cards={playerCards} placeholder="Search with a player card's name" />
			<div>
				<p class="text-primary-900 dark:text-primary-100 mb-1 text-sm font-semibold">Preview</p>
				<UserDisplay username={editTarget.name || 'Name'} card={editTarget.card} />
			</div>
			<Button highlighted label="Save" disabled={editTarget.name.trim().length === 0} onClick={saveEdit} />
		</div>
	{/if}
</Modal>

<!-- Add player modal -->
<Modal isOpen={addOpen} onClose={() => (addOpen = false)} title="Add player" maxWidth="md">
	<div class="flex flex-col gap-3 py-2">
		<TextInput label="Name" bind:value={newName} placeholder="e.g. Bryn" />
		<PlayerIconSelector bind:selectedCard={newCard} cards={playerCards} placeholder="Search with a player card's name" />
		<div>
			<p class="text-primary-900 dark:text-primary-100 mb-1 text-sm font-semibold">Preview</p>
			<UserDisplay username={newName || 'Name'} card={newCard} />
		</div>
		<Button highlighted label="Add" disabled={newName.trim().length === 0} onClick={addSubPlayer} />
	</div>
</Modal>

<!-- Remove confirm modal -->
<Modal isOpen={removeTarget !== null} onClose={() => (removeTarget = null)} title="Remove player" maxWidth="sm">
	{#if removeTarget}
		<div class="flex flex-col gap-3 py-2">
			<p class="text-sm text-black dark:text-white">
				Stop managing <strong>{removeTarget.name}</strong>? Their past campaigns are kept — they simply
				become a frozen guest there. This can't be undone from here.
			</p>
			<div class="flex justify-end gap-2">
				<Button label="Cancel" onClick={() => (removeTarget = null)} />
				<Button label="Remove" icon={FaIconType.Delete} danger onClick={confirmRemove} />
			</div>
		</div>
	{/if}
</Modal>

<!-- Create / edit play group modal -->
<PlayGroupModal
	isOpen={groupModalOpen}
	title={groupEditUid ? 'Edit play group' : 'Create play group'}
	submitLabel={groupEditUid ? 'Save' : 'Create'}
	roster={roster}
	resolveCard={safeResolveCard}
	initialName={groupInitialName}
	initialMemberUids={groupInitialMembers}
	onClose={() => (groupModalOpen = false)}
	onSubmit={submitGroup}
/>

<!-- Remove play group confirm modal -->
<Modal
	isOpen={removeGroupTarget !== null}
	onClose={() => (removeGroupTarget = null)}
	title="Remove play group"
	maxWidth="sm"
>
	{#if removeGroupTarget}
		<div class="flex flex-col gap-3 py-2">
			<p class="text-sm text-black dark:text-white">
				Remove the play group <strong>{removeGroupTarget.name}</strong>? The players in it are not
				affected — only the group is deleted. This can't be undone from here.
			</p>
			<div class="flex justify-end gap-2">
				<Button label="Cancel" onClick={() => (removeGroupTarget = null)} />
				<Button label="Remove" icon={FaIconType.Delete} danger onClick={confirmRemoveGroup} />
			</div>
		</div>
	{/if}
</Modal>
