<!--
@component
Add a roster member, or a guest: with the UID they read out from their own arkham.life (so shared
files recognise them), or with none for a one-off guest.
-->
<script lang="ts">
	import { HelpParagraph, Modal, TextInput, UserDisplay } from '@5argon/arkham-life-ui';
	import type { Card } from '@5argon/arkham-kohaku';
	import * as m from '$lib/paraglide/messages.js';
	import { resolveCardOrNull } from '$lib/card-data';
	import type { LocalPlayer } from '$lib/database/document';
	import { normalizeUid } from '$lib/database/uid';
	import PlayerIdentityForm from '../PlayerIdentityForm.svelte';

	interface Props {
		isOpen: boolean;
		onClose: () => void;
		/** Roster members not in this record yet. */
		rosterCandidates: LocalPlayer[];
		onAddRoster: (uid: string) => void;
		/** `uid` is null for a one-off guest. */
		onAddGuest: (fields: { uid: string | null; name: string; iconCardCode: string }) => void;
	}
	let { isOpen, onClose, rosterCandidates, onAddRoster, onAddGuest }: Props = $props();

	let guestUid = $state('');
	let guestName = $state('');
	let guestCard = $state<Card | null>(null);

	const normalizedUid = $derived(normalizeUid(guestUid));
	const uidInvalid = $derived(guestUid.trim().length > 0 && normalizedUid === null);

	function close() {
		guestUid = '';
		guestName = '';
		guestCard = null;
		onClose();
	}
</script>

<Modal {isOpen} onClose={close} title={m.archive_add_participant_title()} maxWidth="md">
	<div class="flex flex-col gap-4 py-2">
		<div>
			<p class="text-primary-900 dark:text-primary-100 mb-2 text-sm font-semibold">
				{m.archive_add_participant_roster()}
			</p>
			{#if rosterCandidates.length > 0}
				<div class="flex flex-col gap-1">
					{#each rosterCandidates as r (r.uid)}
						<button
							class="hover:bg-primary-100 dark:hover:bg-primary-800 flex items-center gap-2 rounded p-2 text-left"
							onclick={() => {
								onAddRoster(r.uid);
								close();
							}}
						>
							<UserDisplay username={r.name} card={resolveCardOrNull(r.iconCardCode)} size="sm" />
						</button>
					{/each}
				</div>
			{:else}
				<p class="text-primary-500 dark:text-primary-400 text-sm">
					{m.archive_add_participant_no_roster()}
					<a href="/players" class="text-secondary-600 dark:text-secondary-400 underline"
						>{m.archive_add_participant_manage_players()}</a
					>
				</p>
			{/if}
		</div>

		<div>
			<p class="text-primary-900 dark:text-primary-100 mb-1 text-sm font-semibold">
				{m.archive_add_guest()}
			</p>
			<HelpParagraph>{m.archive_add_guest_help()}</HelpParagraph>
			<TextInput
				label={m.archive_guest_uid()}
				bind:value={guestUid}
				placeholder={m.archive_guest_uid_placeholder()}
			/>
			{#if uidInvalid}
				<p class="mt-1 text-xs text-red-600 dark:text-red-400">{m.archive_guest_uid_invalid()}</p>
			{/if}
			<div class="mt-3">
				<PlayerIdentityForm
					bind:name={guestName}
					bind:card={guestCard}
					nameLabel={m.archive_guest_name()}
					namePlaceholder={m.archive_guest_name_placeholder()}
					previewFallback={m.archive_guest()}
					submitLabel={m.archive_add_guest()}
					canSubmit={!uidInvalid && guestCard !== null}
					onSubmit={({ name, card }) => {
						if (!card) return;
						onAddGuest({ uid: normalizedUid, name, iconCardCode: card.code });
						close();
					}}
				/>
			</div>
		</div>
	</div>
</Modal>
