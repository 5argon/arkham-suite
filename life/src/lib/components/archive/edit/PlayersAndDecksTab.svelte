<!--
@component
The Players & Decks tab: who played, the player count it counts as, and the decks. Edits save at
once.
-->
<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
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
</script>

<p class="text-primary-500 dark:text-primary-400 mt-4 mb-2 text-sm italic">
	{m.archive_players_auto_save_help()}
</p>

<ParticipantsPanel recordId={record.id} players={resolved.players} {isStandalone} />
<PlayerCountPanel {record} {playerCount} />
<DecksPanel
	recordId={record.id}
	decks={resolved.decks}
	players={resolved.players}
	singleDeck={isStandalone}
	showHands={playerCount === 1 && record.multiHanded === true}
/>
