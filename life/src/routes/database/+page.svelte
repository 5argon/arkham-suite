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
		PageLead,
		TextParagraph,
	} from '@5argon/arkham-life-ui';
	import * as m from '$lib/paraglide/messages.js';
	import { databaseStore } from '$lib/database/database.svelte';
	import { ensureDatabaseLoaded, storageEstimate } from '$lib/database/bootstrap';
	import { readBackupFile } from '$lib/database/backup-file';
	import { backupStatus, lastBackupLabel, type BackupStatus } from '$lib/database/backup-status';
	import FilePickerButton from '$lib/components/FilePickerButton.svelte';

	let importError = $state<string | null>(null);
	let busy = $state(false);
	let storage = $state<{ usage: number; quota: number; persisted: boolean } | null>(null);
	let backup = $state<BackupStatus | null>(null);

	onMount(async () => {
		storage = await storageEstimate();
		backup = backupStatus();
	});

	const usageLabel = $derived(
		storage ? `≈ ${(storage.usage / 1_048_576).toFixed(0)} MB of browser storage used by this site` : '',
	);

	async function handleExport() {
		await databaseStore.exportDatabaseNow();
		backup = backupStatus();
	}

	async function handleExportJson() {
		await databaseStore.exportDatabaseJsonNow();
	}

	async function handleImport(file: File) {
		if (
			!confirm(
				'Loading replaces the ENTIRE campaign database currently in this browser — every campaign and player. Continue?',
			)
		)
			return;
		importError = null;
		busy = true;
		try {
			await ensureDatabaseLoaded();
			const parsed: unknown = await readBackupFile(file);
			await databaseStore.importDocument(parsed);
			goto('/archive');
		} catch (err) {
			importError = err instanceof Error ? err.message : 'That file could not be read.';
			busy = false;
		}
	}

	let deleting = $state(false);

	async function handleDelete() {
		if (
			!confirm(
				'Permanently delete the campaign database in this browser? Every campaign and player here will be erased. If you haven’t saved your database to a file, this cannot be undone.',
			)
		)
			return;
		deleting = true;
		await databaseStore.deleteDatabase();
		goto('/');
	}
</script>

<svelte:head>
	<title>{m.database_page_title()}</title>
</svelte:head>

<MarginFull>
	<div class="mb-4">
		<BackButton label="Home" onClick="/" />
	</div>

	<PageLead title={m.database_title()} description={m.database_description()} />

	<BorderedContainer>
		<div class="max-w-lg p-6">
			<h2 class="text-primary-900 dark:text-primary-100 mb-2 text-lg font-semibold">Save database</h2>
			<TextParagraph>
				Save your entire campaign database — every campaign and every player — as one compressed
				<code>.ahlifedb</code> file. This is your work's only copy outside this browser, so keep it somewhere
				safe (cloud drive, USB stick…). Bring it back anytime with <strong>Load</strong> below — on this
				device or a new one.
			</TextParagraph>
			<Button
				highlighted
				label="Save database"
				icon={FaIconType.Export}
				disabled={!databaseStore.hasDatabase}
				onClick={handleExport}
			/>
			{#if backup}
				<p class="text-primary-500 dark:text-primary-400 mt-3 text-xs">
					Last saved: {lastBackupLabel()}{backup.unexportedChanges > 0
						? ` · ${backup.unexportedChanges} change${backup.unexportedChanges === 1 ? '' : 's'} since`
						: ''}
				</p>
			{/if}
			{#if storage}
				<p class="text-primary-500 dark:text-primary-400 mt-1 text-xs">
					{usageLabel}{storage.persisted ? ' · protected from automatic cleanup' : ''}
				</p>
				<p class="text-primary-500 dark:text-primary-400 mt-1 text-xs">
					An origin-wide estimate that includes internal working copies and reclaimable space — not the
					size of your data. Your <code>.ahlifedb</code> save file is far smaller.
				</p>
			{/if}
		</div>
	</BorderedContainer>

	<div class="mt-6">
		<BorderedContainer>
			<div class="max-w-lg p-6">
				<h2 class="text-primary-900 dark:text-primary-100 mb-2 text-lg font-semibold">Load database (replace)</h2>
				<HelpParagraph>
					Loading an <code>.ahlifedb</code> file <strong>replaces the entire database</strong> currently in
					this browser — every campaign and player. Save first if you want to keep what's here. (Older
					<code>.arkhamlife</code> files and plain <code>.json</code> versions still load too.)
				</HelpParagraph>
				<div class="mt-3">
					<FilePickerButton label="Choose database file…" disabled={busy} onFile={handleImport} />
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

	<div class="mt-6">
		<BorderedContainer>
			<div class="max-w-lg p-6">
				<h2 class="text-primary-900 dark:text-primary-100 mb-1 text-lg font-semibold">Advanced</h2>
				<HelpParagraph>
					Plain, uncompressed <code>.json</code> exports — for peeking at the data or reusing it elsewhere.
					These are <strong>not your save file</strong>; use “Save database” above for an
					<code>.ahlifedb</code> save.
				</HelpParagraph>

				<div class="mt-4">
					<h3 class="text-primary-800 dark:text-primary-200 mb-1 font-medium">Database (JSON)</h3>
					<TextParagraph>
						The same contents as your <code>.ahlifedb</code> save file, but as plain, uncompressed
						<code>.json</code> — human-readable for inspecting the raw campaign and player records, or
						loading them into your own script or dev project.
					</TextParagraph>
					<Button
						label="Export database as JSON"
						icon={FaIconType.Export}
						disabled={!databaseStore.hasDatabase}
						onClick={handleExportJson}
					/>
				</div>
			</div>
		</BorderedContainer>
	</div>

	<div class="mt-6">
		<BorderedContainer>
			<div class="max-w-lg p-6">
				<h2 class="mb-2 text-lg font-semibold text-red-700 dark:text-red-400">Delete database</h2>
				<HelpParagraph>
					Permanently erase every campaign and player stored in this browser. Your saved file, if you
					made one, is the only copy that survives — there's no undo.
				</HelpParagraph>
				<Button
					danger
					label="Delete database from this browser"
					icon={FaIconType.Delete}
					disabled={!databaseStore.hasDatabase || deleting}
					onClick={handleDelete}
				/>
			</div>
		</BorderedContainer>
	</div>
</MarginFull>
