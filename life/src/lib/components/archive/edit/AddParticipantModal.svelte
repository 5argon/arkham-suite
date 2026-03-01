<script lang="ts">
	import { Button, HelpParagraph, Modal, TextInput, UserDisplay } from '@5argon/arkham-life-ui';
	import { card, type Card } from '@5argon/arkham-kohaku';

	import { getAllCards, type createCardResolver } from '$lib/card-data';
	import { normalizeUid } from '$lib/database/uid';
	import PlayerIconSelector from '$lib/components/PlayerIconSelector.svelte';

	interface RosterCandidate {
		uid: string;
		name: string;
		iconCardCode: string;
	}

	interface Props {
		isOpen: boolean;
		onClose: () => void;
		/** Roster members (owner + sub-players) not already in this campaign. */
		rosterCandidates: RosterCandidate[];
		cardResolver: ReturnType<typeof createCardResolver>;
		onAddRoster: (uid: string) => void;
		/** `uid` is null for a one-off guest with no arkham.life of their own. */
		onAddGuest: (fields: { uid: string | null; name: string; iconCardCode: string }) => void;
	}

	let { isOpen, onClose, rosterCandidates, cardResolver, onAddRoster, onAddGuest }: Props = $props();

	const playerCards = getAllCards().filter(card.playerCardsNonCampaignFilter);

	let guestUid = $state('');
	let guestName = $state('');
	let guestCard = $state<Card | null>(null);

	const normalizedUid = $derived(normalizeUid(guestUid));
	const uidInvalid = $derived(guestUid.trim().length > 0 && normalizedUid === null);
	// UID is optional: a blank one means a one-off guest (a uid is minted for them).
	const canAddGuest = $derived(!uidInvalid && guestName.trim().length > 0 && guestCard !== null);

	function reset() {
		guestUid = '';
		guestName = '';
		guestCard = null;
	}

	function close() {
		reset();
		onClose();
	}

	function pickRoster(uid: string) {
		onAddRoster(uid);
		close();
	}

	function addGuest() {
		if (!canAddGuest || !guestCard) return;
		// normalizedUid is null when the field is blank → a one-off guest.
		onAddGuest({ uid: normalizedUid, name: guestName.trim(), iconCardCode: guestCard.code });
		close();
	}
</script>

<Modal {isOpen} onClose={close} title="Add a player" maxWidth="md">
	<div class="flex flex-col gap-4 py-2">
		<div>
			<p class="text-primary-900 dark:text-primary-100 mb-2 text-sm font-semibold">Players you manage</p>
			{#if rosterCandidates.length > 0}
				<div class="flex flex-col gap-1">
					{#each rosterCandidates as r (r.uid)}
						<button
							class="hover:bg-primary-100 dark:hover:bg-primary-800 flex items-center gap-2 rounded p-2 text-left"
							onclick={() => pickRoster(r.uid)}
						>
							<UserDisplay username={r.name} card={cardResolver.resolve(r.iconCardCode)} size="sm" />
						</button>
					{/each}
				</div>
			{:else}
				<p class="text-primary-500 dark:text-primary-400 text-sm">
					No other players yet. <a href="/players" class="text-secondary-600 dark:text-secondary-400 underline">Create players to manage</a>, then they'll show up here to add.
				</p>
			{/if}
		</div>

		<div>
			<p class="text-primary-900 dark:text-primary-100 mb-1 text-sm font-semibold">Add a guest</p>
			<HelpParagraph>
				If they keep their own arkham.life, ask them to read out their UID (it's on their Manage
				Players page) so their results can be recognised across files. For a one-off guest — someone
				without the app whom you may never record again — just leave the UID blank. Either way, the
				name and portrait you pick are labels for your own records.
			</HelpParagraph>

			<TextInput label="Their UID (optional)" bind:value={guestUid} placeholder="ABC-2DE-FGH — or leave blank" />
			{#if uidInvalid}
				<p class="mt-1 text-xs text-red-600 dark:text-red-400">
					A UID looks like <span class="font-mono">ABC-2DE-FGH</span> (no O, 0, I, or 1).
				</p>
			{/if}

			<div class="mt-3">
				<TextInput label="Name (your label for them)" bind:value={guestName} placeholder="e.g. Cassidy" />
			</div>

			<div class="mt-3">
				<PlayerIconSelector bind:selectedCard={guestCard} cards={playerCards} placeholder="Search with a player card's name" />
			</div>

			{#if guestName.trim() || guestCard}
				<div class="mt-2 mb-3">
					<p class="text-primary-900 dark:text-primary-100 mb-1 text-sm font-semibold">Preview</p>
					<UserDisplay username={guestName || 'Guest'} card={guestCard} />
				</div>
			{/if}

			<Button highlighted disabled={!canAddGuest} label="Add guest" onClick={addGuest} />
		</div>
	</div>
</Modal>
