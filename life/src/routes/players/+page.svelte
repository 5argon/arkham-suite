<script lang="ts">
	import { onMount } from 'svelte';
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
		UserDisplay,
		getToastContext
	} from '@5argon/arkham-life-ui';
	import { card as cardUtils, type Card } from '@5argon/arkham-kohaku';
	import * as m from '$lib/paraglide/messages.js';
	import { getAllCards, resolveCardOrNull } from '$lib/card-data';
	import { databaseStore } from '$lib/database/database.svelte';
	import { ensureDatabaseLoaded } from '$lib/database/bootstrap';
	import { allPlayers, type LocalPlayer } from '$lib/database/document';
	import ConfirmModal from '$lib/components/archive/ConfirmModal.svelte';
	import PlayerIdentityForm from '$lib/components/archive/PlayerIdentityForm.svelte';
	import PlayGroupModal, { type PlayGroupDraft } from './PlayGroupModal.svelte';

	const toast = getToastContext();
	const playerCards = getAllCards().filter(cardUtils.playerCardsNonCampaignFilter);
	const randomCard = () => playerCards[Math.floor(Math.random() * playerCards.length)] ?? null;

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
	const memberName = (uid: string) => roster.find((p) => p.uid === uid)?.name ?? uid;

	async function copyUid(uid: string) {
		try {
			await navigator.clipboard.writeText(uid);
			toast.success(m.players_uid_copied());
		} catch {
			toast.error(m.players_uid_copy_failed());
		}
	}

	/** The roster member being edited, or a new player (uid null). */
	let identity = $state<{ uid: string | null; name: string; card: Card | null } | null>(null);
	function saveIdentity({ name, card }: { name: string; card: Card | null }) {
		if (!identity) return;
		if (identity.uid) {
			databaseStore.updatePlayer(identity.uid, { name, ...(card ? { iconCardCode: card.code } : {}) });
		} else {
			databaseStore.addPlayer({ name, iconCardCode: card?.code });
		}
		identity = null;
	}
	const editPlayer = (p: LocalPlayer) =>
		(identity = { uid: p.uid, name: p.name, card: resolveCardOrNull(p.iconCardCode) });

	let removeTarget = $state<LocalPlayer | null>(null);
	let groupDraft = $state<PlayGroupDraft | null>(null);
	let removeGroupTarget = $state<{ uid: string; name: string } | null>(null);

	function submitGroup({ uid, name, memberUids }: PlayGroupDraft) {
		if (uid) databaseStore.updatePlayGroup(uid, { name, memberUids });
		else databaseStore.createPlayGroup({ name, memberUids });
		groupDraft = null;
	}
</script>

<svelte:head>
	<title>{m.players_page_title()}</title>
</svelte:head>

{#snippet rowActions(uid: string, onEdit: () => void, onRemove?: () => void)}
	<div class="ml-auto flex gap-1">
		<Button
			label={m.players_view_profile()}
			icon={FaIconType.ExternalLink}
			hideLabel
			onClick={`/p/private/${uid}`}
		/>
		<Button label={m.players_copy_uid()} icon={FaIconType.Export} hideLabel onClick={() => copyUid(uid)} />
		<Button label={m.players_edit()} icon={FaIconType.Edit} hideLabel onClick={onEdit} />
		{#if onRemove}
			<Button label={m.players_remove()} icon={FaIconType.Delete} danger hideLabel onClick={onRemove} />
		{/if}
	</div>
{/snippet}

<MarginFull>
	<div class="mb-4">
		<BackButton label={m.players_home()} onClick="/" />
	</div>

	<PageLead title={m.players_title()} description={m.players_description()} />

	{#if ready && owner}
		<SectionSeparator title={m.players_you()} />
		<BorderedContainer>
			<div class="flex flex-wrap items-center gap-4 p-4">
				<UserDisplay username={owner.name} card={resolveCardOrNull(owner.iconCardCode)} />
				<div class="flex flex-col">
					<span class="text-primary-500 dark:text-primary-400 text-xs">{m.players_your_uid()}</span>
					<span class="font-mono text-lg text-black dark:text-white">{owner.uid}</span>
				</div>
				<div class="ml-auto flex gap-2">
					<Button
						label={m.players_view_profile()}
						icon={FaIconType.ExternalLink}
						onClick={`/p/private/${owner.uid}`}
					/>
					<Button label={m.players_copy_uid()} icon={FaIconType.Export} onClick={() => copyUid(owner.uid)} />
					<Button label={m.players_edit()} icon={FaIconType.Edit} onClick={() => editPlayer(owner)} />
				</div>
			</div>
		</BorderedContainer>
		<HelpParagraph>{m.players_you_help()}</HelpParagraph>

		<SectionSeparator title={m.players_others()} />
		<HelpParagraph>{m.players_others_help()}</HelpParagraph>

		<div class="mb-4 flex flex-col gap-2">
			{#each subPlayers as p (p.uid)}
				<div class="bg-primary-100 dark:bg-primary-800 flex flex-wrap items-center gap-3 rounded p-3">
					<UserDisplay username={p.name} card={resolveCardOrNull(p.iconCardCode)} size="sm" />
					<span class="font-mono text-sm text-black dark:text-white">{p.uid}</span>
					{@render rowActions(p.uid, () => editPlayer(p), () => (removeTarget = p))}
				</div>
			{:else}
				<p class="text-primary-500 dark:text-primary-400 text-sm">{m.players_others_empty()}</p>
			{/each}
		</div>

		<Button
			label={m.players_add()}
			icon={FaIconType.Add}
			onClick={() => (identity = { uid: null, name: '', card: randomCard() })}
		/>

		<SectionSeparator title={m.players_groups()} />
		<HelpParagraph>{m.players_groups_help()}</HelpParagraph>

		<div class="mb-4 flex flex-col gap-2">
			{#each playGroups as g (g.uid)}
				<div class="bg-primary-100 dark:bg-primary-800 flex flex-wrap items-center gap-3 rounded p-3">
					<div class="flex flex-col">
						<span class="text-base font-semibold text-black dark:text-white">{g.name}</span>
						<span class="font-mono text-sm text-black dark:text-white">{g.uid}</span>
						<span class="text-primary-500 dark:text-primary-400 text-xs">
							{g.memberUids.length ? g.memberUids.map(memberName).join(', ') : m.players_group_no_members()}
						</span>
					</div>
					{@render rowActions(
						g.uid,
						() => (groupDraft = { uid: g.uid, name: g.name, memberUids: [...g.memberUids] }),
						() => (removeGroupTarget = g)
					)}
				</div>
			{:else}
				<p class="text-primary-500 dark:text-primary-400 text-sm">{m.players_groups_empty()}</p>
			{/each}
		</div>

		<Button
			label={m.players_group_create()}
			icon={FaIconType.Add}
			onClick={() => (groupDraft = { uid: null, name: '', memberUids: [] })}
		/>
	{/if}
</MarginFull>

<Modal
	isOpen={identity !== null}
	onClose={() => (identity = null)}
	title={identity?.uid ? m.players_edit() : m.players_add()}
	maxWidth="md"
>
	{#if identity}
		<div class="py-2">
			<PlayerIdentityForm
				bind:name={identity.name}
				bind:card={identity.card}
				namePlaceholder={identity.uid ? undefined : m.players_name_placeholder()}
				submitLabel={identity.uid ? m.players_save() : m.players_add_submit()}
				onSubmit={saveIdentity}
			/>
		</div>
	{/if}
</Modal>

<ConfirmModal
	isOpen={removeTarget !== null}
	title={m.players_remove_title()}
	confirmLabel={m.players_remove()}
	danger
	onConfirm={() => {
		if (removeTarget) databaseStore.removePlayer(removeTarget.uid);
		removeTarget = null;
	}}
	onCancel={() => (removeTarget = null)}
>
	{m.players_remove_confirm({ name: removeTarget?.name ?? '' })}
</ConfirmModal>

<PlayGroupModal
	bind:draft={groupDraft}
	{roster}
	onClose={() => (groupDraft = null)}
	onSubmit={submitGroup}
/>

<ConfirmModal
	isOpen={removeGroupTarget !== null}
	title={m.players_group_remove_title()}
	confirmLabel={m.players_remove()}
	danger
	onConfirm={() => {
		if (removeGroupTarget) databaseStore.removePlayGroup(removeGroupTarget.uid);
		removeGroupTarget = null;
	}}
	onCancel={() => (removeGroupTarget = null)}
>
	{m.players_group_remove_confirm({ name: removeGroupTarget?.name ?? '' })}
</ConfirmModal>
