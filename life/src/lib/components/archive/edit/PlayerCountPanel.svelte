<!--
@component
The player count a record counts as (Auto = participants, capped at 4) and, for one player, True
Solo vs Multi-Handed, which the decks alone cannot tell apart.
-->
<script lang="ts">
	import { RadioButtons } from '@5argon/arkham-life-ui';
	import * as m from '$lib/paraglide/messages.js';
	import Doc from '$lib/docs/Doc.svelte';
	import { databaseStore } from '$lib/database/database.svelte';
	import {
		distinctHands,
		resolveSoloType,
		type CampaignRecord,
		type PlayerCount
	} from '$lib/database/document';
	import { soloLabel } from '../solo-label';

	interface Props {
		record: CampaignRecord;
		/** The resolved count. */
		playerCount: number | null;
	}
	let { record, playerCount }: Props = $props();

	const setting = $derived<PlayerCount>(record.playerCount ?? 'auto');
	const multiHanded = $derived(record.multiHanded ?? false);
	const soloTag = $derived(
		soloLabel(
			resolveSoloType(record.playerCount, record.participants.length, record.multiHanded),
			distinctHands(record.decks)
		)
	);
	const choices: { value: PlayerCount; label: string }[] = [
		{ value: 'auto', label: m.archive_player_count_auto() },
		{ value: 1, label: '1' },
		{ value: 2, label: '2' },
		{ value: 3, label: '3' },
		{ value: 4, label: '4' },
		{ value: 'unspecified', label: m.archive_player_count_unspecified() }
	];
</script>

{#snippet playerCountHelp()}<Doc path="archive/edit/player-count" />{/snippet}

<div class="mt-4 max-w-xl">
	<RadioButtons
		label={m.archive_player_count()}
		helpContent={playerCountHelp}
		selectedValue={setting}
		onChange={(v) => databaseStore.updateCampaignGeneral(record.id, { playerCount: v })}
		{choices}
	/>
	{#if setting === 'auto'}
		<p class="text-primary-500 dark:text-primary-400 mt-1 text-xs">
			{m.archive_player_count_auto_note({
				count: playerCount ?? '—',
				added: record.participants.length
			})}
		</p>
	{/if}
</div>

{#if playerCount === 1}
	<div class="mt-4 flex max-w-xl flex-wrap items-center gap-3">
		<RadioButtons
			label={m.archive_solo_style()}
			selectedValue={multiHanded ? 'multi' : 'true'}
			onChange={(v) => databaseStore.updateCampaignGeneral(record.id, { multiHanded: v === 'multi' })}
			choices={[
				{ value: 'true', label: m.archive_filter_solo_true() },
				{ value: 'multi', label: m.archive_solo_multi_handed() }
			]}
		/>
		{#if soloTag}
			<span
				class="bg-secondary-200 dark:bg-secondary-700 text-secondary-800 dark:text-secondary-200 mt-5 rounded px-2 py-0.5 text-xs font-semibold"
			>
				{soloTag}
			</span>
		{/if}
	</div>
	{#if multiHanded}
		<p class="text-primary-500 dark:text-primary-400 mt-1 text-xs">{m.archive_solo_hands_help()}</p>
	{/if}
{/if}
