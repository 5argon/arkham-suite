<!--
@component
A record's participants: roster members resolve live, guests are frozen labels (editable here). Add
one at a time or a whole play group.
-->
<script lang="ts">
	import { Button, FaIconType, Modal, SectionSeparator, UserDisplay } from '@5argon/arkham-life-ui';
	import type { Card } from '@5argon/arkham-kohaku';
	import * as m from '$lib/paraglide/messages.js';
	import { resolveCardOrNull } from '$lib/card-data';
	import { databaseStore } from '$lib/database/database.svelte';
	import { allPlayers, findPlayer } from '$lib/database/document';
	import type { ResolvedPlayer } from '$lib/database/repository';
	import PlayerIdentityForm from '../PlayerIdentityForm.svelte';
	import AddParticipantModal from './AddParticipantModal.svelte';

	interface Props {
		recordId: string;
		players: ResolvedPlayer[];
		isStandalone: boolean;
	}
	let { recordId, players, isStandalone }: Props = $props();

	const doc = $derived(databaseStore.doc);
	const ownerUid = $derived(doc?.owner.uid);
	const playGroups = $derived(doc?.playGroups ?? []);
	const rosterCandidates = $derived.by(() => {
		const present = new Set(players.map((p) => p.uid));
		return doc ? allPlayers(doc).filter((r) => !present.has(r.uid)) : [];
	});

	let addParticipantOpen = $state(false);
	let addPlayGroupOpen = $state(false);
	let editGuest = $state<{ uid: string; name: string; card: Card | null } | null>(null);

	function addPlayGroup(memberUids: string[]) {
		for (const uid of memberUids) {
			const member = doc && findPlayer(doc, uid);
			if (member) databaseStore.addParticipant(recordId, member);
		}
		addPlayGroupOpen = false;
	}

	function addGuest(fields: { uid: string | null; name: string; iconCardCode: string }) {
		if (fields.uid) databaseStore.addParticipant(recordId, { ...fields, uid: fields.uid });
		else databaseStore.addOneOffGuest(recordId, fields);
	}

	function saveGuest({ name, card }: { name: string; card: Card | null }) {
		if (!editGuest) return;
		databaseStore.updateParticipant(recordId, editGuest.uid, {
			name,
			...(card ? { iconCardCode: card.code } : {})
		});
		editGuest = null;
	}
</script>

{#snippet guestChip(title?: string)}
	<span
		class="bg-primary-200 dark:bg-primary-700 text-primary-700 dark:text-primary-200 rounded px-2 py-0.5 text-xs font-semibold"
		{title}
	>
		{m.archive_guest()}
	</span>
{/snippet}

<SectionSeparator title={isStandalone ? m.archive_players_standalone() : m.archive_players()} />

<div class="mb-4 flex flex-col gap-2">
	{#each players as player (player.uid)}
		<div class="bg-primary-100 dark:bg-primary-800 flex items-center gap-3 rounded p-3">
			<UserDisplay username={player.name} card={resolveCardOrNull(player.iconCardCode)} size="sm" />
			{#if player.isGuest}
				{@render guestChip(m.archive_guest_help())}
			{/if}
			<div class="ml-auto flex items-center gap-1">
				{#if player.isGuest}
					<Button
						label={m.archive_edit()}
						icon={FaIconType.Edit}
						hideLabel
						onClick={() =>
							(editGuest = {
								uid: player.uid,
								name: player.name,
								card: resolveCardOrNull(player.iconCardCode)
							})}
					/>
				{/if}
				{#if player.uid !== ownerUid}
					<Button
						label={m.archive_logs_remove()}
						icon={FaIconType.Delete}
						danger
						hideLabel
						onClick={() => databaseStore.removeParticipant(recordId, player.uid)}
					/>
				{/if}
			</div>
		</div>
	{/each}
</div>

<div class="flex flex-wrap gap-2">
	<Button
		label={m.archive_add_participant()}
		icon={FaIconType.Add}
		onClick={() => (addParticipantOpen = true)}
	/>
	{#if playGroups.length > 0}
		<Button
			label={m.archive_add_play_group()}
			icon={FaIconType.Add}
			onClick={() => (addPlayGroupOpen = true)}
		/>
	{/if}
</div>

<Modal
	isOpen={addPlayGroupOpen}
	onClose={() => (addPlayGroupOpen = false)}
	title={m.archive_add_play_group()}
	maxWidth="sm"
>
	<div class="flex flex-col gap-2 py-2">
		{#each playGroups as group (group.uid)}
			<button
				class="hover:bg-primary-100 dark:hover:bg-primary-800 flex flex-col gap-2 rounded p-2 text-left"
				onclick={() => addPlayGroup(group.memberUids)}
			>
				<span class="text-primary-900 dark:text-primary-100 text-sm font-semibold">{group.name}</span>
				<div class="flex flex-wrap items-center gap-2">
					{#each group.memberUids as memberUid (memberUid)}
						{@const member = doc && findPlayer(doc, memberUid)}
						{#if member}
							<UserDisplay
								username={member.name}
								card={resolveCardOrNull(member.iconCardCode)}
								size="sm"
							/>
						{/if}
					{/each}
				</div>
			</button>
		{/each}
	</div>
</Modal>

<AddParticipantModal
	isOpen={addParticipantOpen}
	onClose={() => (addParticipantOpen = false)}
	{rosterCandidates}
	onAddRoster={(uid) => databaseStore.addParticipant(recordId, { uid, name: '', iconCardCode: '' })}
	onAddGuest={addGuest}
/>

<Modal
	isOpen={editGuest !== null}
	onClose={() => (editGuest = null)}
	title={m.archive_edit_guest()}
	maxWidth="md"
>
	{#if editGuest}
		<div class="py-2">
			<PlayerIdentityForm
				bind:name={editGuest.name}
				bind:card={editGuest.card}
				previewFallback={m.archive_guest()}
				submitLabel={m.archive_save()}
				onSubmit={saveGuest}
			/>
		</div>
	{/if}
</Modal>
