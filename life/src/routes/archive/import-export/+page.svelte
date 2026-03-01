<script lang="ts">
	import { goto } from '$app/navigation';
	import {
		BackButton,
		BorderedContainer,
		HelpParagraph,
		MarginFull,
		PageLead,
	} from '@5argon/arkham-life-ui';
	import * as m from '$lib/paraglide/messages.js';
	import { databaseStore } from '$lib/database/database.svelte';
	import { ensureDatabaseLoaded } from '$lib/database/bootstrap';
	import { readBackupFile } from '$lib/database/backup-file';
	import FilePickerButton from '$lib/components/FilePickerButton.svelte';

	// ─── Local build: single-campaign import (one campaign at a time — the whole
	// database lives on its own page at /database) ───────────────────────
	let sharedError = $state<string | null>(null);
	let busy = $state(false);

	async function handleImportSharedCampaign(file: File) {
		sharedError = null;
		busy = true;
		try {
			await ensureDatabaseLoaded();
			const parsed: unknown = await readBackupFile(file);
			const rec = databaseStore.importSharedCampaign(parsed);
			if (rec) goto(`/archive/edit?id=${rec.id}`);
			else sharedError = 'No campaign database is open to import into.';
		} catch (err) {
			sharedError = err instanceof Error ? err.message : 'That file could not be read.';
		} finally {
			busy = false;
		}
	}
</script>

<svelte:head>
	<title>{m.archive_import_export_page_title()}</title>
</svelte:head>

<MarginFull>
	<div class="mb-4">
		<BackButton label={m.common_back()} onClick="/archive" />
	</div>

	<PageLead
		title="Import a Campaign"
		description="Bring in a single campaign — an .ahlifecam file another player shared with you. To export one of your own, open it and press “Export .ahlifecam”."
	/>

	<BorderedContainer>
		<div class="max-w-lg p-6">
			<h2 class="text-primary-900 dark:text-primary-100 mb-2 text-lg font-semibold">
				Import a shared campaign
			</h2>
			<HelpParagraph>
				Got an <code>.ahlifecam</code> file another player exported for you? This adds it to your database
				as a new campaign — it doesn't replace anything. You can edit it (including who played) before
				keeping it. Players you manage resolve to your records; everyone else is a guest. (Older
				<code>.arkhamlife</code> campaign files and plain <code>.json</code> still import too.)
			</HelpParagraph>
			<div class="mt-3">
				<FilePickerButton
					label="Choose campaign file…"
					disabled={busy || !databaseStore.hasDatabase}
					onFile={handleImportSharedCampaign}
				/>
			</div>
			{#if sharedError}
				<div
					class="mt-3 rounded border border-red-400 bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-300"
				>
					{sharedError}
				</div>
			{/if}
		</div>
	</BorderedContainer>

	<p class="text-primary-500 dark:text-primary-400 mt-4 text-sm">
		Saving, loading, or deleting your <strong>whole database</strong> (all campaigns at once) is on
		the <a class="underline" href="/database">Save / Load Database</a> page.
	</p>
</MarginFull>
