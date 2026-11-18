<!--
@component
The Players & Decks tab: who played, the player count it counts as, and the decks. Edits save at
once.
-->
<script lang="ts">
	import { databaseStore } from '$lib/database/database.svelte';
	import { resolvePlayerCount, type CampaignRecord } from '$lib/database/document';
	import { resolvedParticipants } from '$lib/database/repository';
	import DecksPanel from './DecksPanel.svelte';
	import ParticipantsPanel from './ParticipantsPanel.svelte';
	import PlayerCountPanel from './PlayerCountPanel.svelte';

	interface Props {
		record: CampaignRecord;
		/** Standalone archive: one deck without upgrades, and standalone wording. */
		isStandalone: boolean;
	}
	let { record, isStandalone }: Props = $props();

	const resolved = $derived(
		databaseStore.doc ? resolvedParticipants(databaseStore.doc, record) : { players: [], decks: [] }
	);
	const playerCount = $derived(resolvePlayerCount(record.playerCount, record.participants.length));

	// Decks keep the order they had when the tab opened, so a deck doesn't jump away while its owner
	// is being changed; they sort by owner on the next visit. A deck added meanwhile goes last.
	// svelte-ignore state_referenced_locally
	const openingOrder = new Map(resolved.decks.map((d, i) => [d.id, i]));
	const decks = $derived(
		[...resolved.decks].sort(
			(a, b) =>
				(openingOrder.get(a.id) ?? Number.MAX_SAFE_INTEGER) -
				(openingOrder.get(b.id) ?? Number.MAX_SAFE_INTEGER)
		)
	);
</script>

<div class="mt-4"></div>

<ParticipantsPanel recordId={record.id} players={resolved.players} {isStandalone} />
<PlayerCountPanel {record} {playerCount} />
<DecksPanel
	recordId={record.id}
	{decks}
	players={resolved.players}
	singleDeck={isStandalone}
	showHands={playerCount === 1 && record.multiHanded === true}
/>
