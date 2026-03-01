<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import { goto } from '$app/navigation';
	import {
		BorderedContainer,
		Button,
		Checkbox,
		HelpParagraph,
		MarginFull,
		PageLead,
		TextInput,
		TextParagraph,
		UserDisplay,
	} from '@5argon/arkham-life-ui';
	import { card, type Card } from '@5argon/arkham-kohaku';
	import { ALL_TIERS, type DifficultyTier } from '$lib/campaign/profile-settings';
	import { difficultyLabel } from '$lib/campaign/difficulty';
	import PlayerIconSelector from '$lib/components/PlayerIconSelector.svelte';
	import FilePickerButton from '$lib/components/FilePickerButton.svelte';
	import { getAllCards } from '$lib/card-data';
	import { databaseStore } from '$lib/database/database.svelte';
	import { ensureDatabaseLoaded } from '$lib/database/bootstrap';
	import { readBackupFile } from '$lib/database/backup-file';

	const playerCards = getAllCards().filter(card.playerCardsNonCampaignFilter);
	const randomCard = () => playerCards[Math.floor(Math.random() * playerCards.length)] ?? null;

	let ready = $state(false);
	let name = $state('');
	let selectedCard = $state<Card | null>(untrack(randomCard));
	let importError = $state<string | null>(null);
	let busy = $state(false);
	// Onboarding: which difficulties the player cares about → seeds ProfileSettings.trackedTiers, so
	// only campaigns played on these count toward their stats (dabbling in a harder level they drop
	// won't skew their numbers). Pre-set to the app default; changeable later in Settings.
	let trackedTiers = $state<Set<DifficultyTier>>(new Set<DifficultyTier>(['standard', 'hard']));
	function toggleTier(t: DifficultyTier) {
		const next = new Set(trackedTiers);
		next.has(t) ? next.delete(t) : next.add(t);
		trackedTiers = next;
	}

	// Wait for the (idempotent) IndexedDB load to finish before any mutation, so a
	// late-resolving load can't clobber a just-created/just-opened database.
	onMount(async () => {
		await ensureDatabaseLoaded();
		ready = true;
	});

	const canCreate = $derived(
		ready && !busy && name.trim().length > 0 && selectedCard !== null && trackedTiers.size > 0,
	);
	const hasExisting = $derived(databaseStore.hasDatabase);

	async function handleCreate() {
		if (!canCreate) return;
		busy = true;
		await databaseStore.createNew(
			{ name: name.trim(), iconCardCode: selectedCard?.code },
			{ trackedTiers: ALL_TIERS.filter((t) => trackedTiers.has(t)) },
		);
		goto('/');
	}

	async function handleFile(file: File) {
		importError = null;
		busy = true;
		try {
			await ensureDatabaseLoaded();
			const parsed: unknown = await readBackupFile(file);
			await databaseStore.importDocument(parsed);
			goto('/');
		} catch (err) {
			importError = err instanceof Error ? err.message : 'That file could not be read.';
			busy = false;
		}
	}
</script>

<svelte:head>
	<title>Campaign Database – arkham.life</title>
</svelte:head>

<PageLead
	title="Campaign Database"
	description="arkham.life keeps all your campaigns in a single database stored in this browser. Create a new one, or open a database file you exported before. Your data never leaves this device unless you export it."
/>

<MarginFull>
	{#if hasExisting}
		<HelpParagraph>
			A campaign database is already open in this browser. Creating a new one or opening another file
			replaces it here — export it first from the Campaign Archive if you want to keep it.
		</HelpParagraph>
	{/if}

	<BorderedContainer>
		<div class="max-w-lg p-6">
			<h2 class="text-primary-900 dark:text-primary-100 mb-4 text-lg font-semibold">
				Create a new in-browser campaign database
			</h2>

			<TextInput label="Your name" bind:value={name} placeholder="e.g. The Keeper" />

			<div class="mb-6">
				<PlayerIconSelector bind:selectedCard cards={playerCards} placeholder="Search with a player card's name" />
				<input type="hidden" value={selectedCard?.code ?? ''} />
			</div>

			<div class="mb-6">
				<p class="text-primary-900 dark:text-primary-100 mb-1 text-sm font-semibold">
					Difficulty levels you care about
				</p>
				<p class="text-primary-500 dark:text-primary-400 mb-2 text-xs">
					Only campaigns you play on these difficulties count toward your profile's stats — so trying a
					harder level you don't stick with won't skew your numbers. You can change this any time in Settings.
				</p>
				<div class="flex flex-wrap gap-4">
					{#each ALL_TIERS as t (t)}
						<Checkbox label={difficultyLabel(t)} checked={trackedTiers.has(t)} onChange={() => toggleTier(t)} />
					{/each}
				</div>
			</div>

			<div class="mb-6">
				<p class="text-primary-900 dark:text-primary-100 mb-2 text-sm font-semibold">Preview</p>
				<UserDisplay username={name || 'Your name'} card={selectedCard} />
			</div>

			<Button highlighted disabled={!canCreate} label="Create database" onClick={handleCreate} />
		</div>
	</BorderedContainer>

	<div class="mt-6">
		<BorderedContainer>
			<div class="max-w-lg p-6">
				<h2 class="text-primary-900 dark:text-primary-100 mb-2 text-lg font-semibold">
					Open an existing database file
				</h2>
				<TextParagraph>Choose a database backup file you exported before.</TextParagraph>
				<div class="mt-3">
					<FilePickerButton label="Choose database file…" disabled={!ready || busy} onFile={handleFile} />
				</div>
				{#if importError}
					<div
						class="mt-3 rounded border border-red-400 bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-300"
					>
						{importError}
					</div>
				{/if}
			</div>
		</BorderedContainer>
	</div>
</MarginFull>
