<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import {
		Button,
		BorderedContainer,
		FaIconType,
		PageLead,
		ThumbnailCardButton
	} from '@5argon/arkham-life-ui';
	import * as m from '$lib/paraglide/messages.js';
	import { databaseStore } from '$lib/database/database.svelte';
	import { ensureDatabaseLoaded } from '$lib/database/bootstrap';
	import { readBackupFile } from '$lib/database/backup-file';
	import FilePickerButton from '$lib/components/FilePickerButton.svelte';
	import { preloader } from '$lib/preload/preloader.svelte';

	onMount(async () => {
		// Once we know a database exists, warm the home grid's destinations so the
		// first click into any section is instant (for this session).
		await ensureDatabaseLoaded();
		if (databaseStore.hasDatabase) preloader.warmSection('home');
	});

	// ─── Empty-state: open an exported database file directly from the home page ──
	let openError = $state<string | null>(null);
	let openBusy = $state(false);

	async function handleOpenFile(file: File) {
		openError = null;
		openBusy = true;
		try {
			await ensureDatabaseLoaded();
			const parsed: unknown = await readBackupFile(file);
			await databaseStore.importDocument(parsed);
			goto('/archive');
		} catch (err) {
			openError = err instanceof Error ? err.message : m.home_open_error_fallback();
			openBusy = false;
		}
	}
</script>

<svelte:head>
	<title>{m.common_home_page_title()}</title>
</svelte:head>

<PageLead description={m.home_tagline()} title={m.common_arkham_life()}></PageLead>

{#if databaseStore.status === 'loading'}
	<!-- IndexedDB not read yet: withhold the empty-vs-ready choice so the
	     "start fresh / open" state never flashes before we know it's empty. -->
	<div class="text-primary-400 flex items-center justify-center gap-2 py-16 text-sm">
		<span
			class="border-primary-300 dark:border-primary-600 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"
		></span>
		{m.framework_page_loading_database()}
	</div>
{:else if databaseStore.hasDatabase}
	<div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
		<ThumbnailCardButton
			description={m.archive_description()}
			imageUrl="/image/thumbnail/home-campaign-archive.webp"
			onClick="/archive"
			title={m.archive_title()}
		/>
		<ThumbnailCardButton
			description={m.framework_page_profiles_description()}
			imageUrl="/image/thumbnail/home-profiles.webp"
			onClick="/p"
			title={m.framework_page_profiles_title()}
		/>
		<ThumbnailCardButton
			description={m.players_description()}
			imageUrl="/image/thumbnail/home-players.webp"
			onClick="/players"
			title={m.players_title()}
		/>
		<ThumbnailCardButton
			description={m.database_description()}
			imageUrl="/image/thumbnail/home-database.webp"
			onClick="/database"
			title={m.database_title()}
		/>
		<ThumbnailCardButton
			description={m.settings_description()}
			imageUrl="/image/thumbnail/home-settings.webp"
			onClick="/settings"
			title={m.settings_title()}
		/>
		<ThumbnailCardButton
			description={m.guides_description()}
			imageUrl="/image/thumbnail/home-guides.webp"
			onClick="/guides"
			title={m.guides_title()}
		/>
	</div>
{:else}
	<p class="text-primary-700 dark:text-primary-300 mx-auto mb-6 max-w-2xl text-center">
		{m.home_empty_intro()}
	</p>
	<div class="grid gap-4 lg:grid-cols-2">
		<BorderedContainer>
			<div class="flex h-full flex-col items-center gap-3 p-6 text-center">
				<h2 class="text-primary-900 dark:text-primary-100 text-lg font-semibold">
					{m.home_start_fresh_title()}
				</h2>
				<p class="text-primary-500 dark:text-primary-400 text-sm">
					{m.home_start_fresh_description()}
				</p>
				<Button highlighted label={m.home_create_database()} icon={FaIconType.Add} onClick="/new" />
			</div>
		</BorderedContainer>

		<BorderedContainer>
			<div class="flex h-full flex-col items-center gap-3 p-6 text-center">
				<h2 class="text-primary-900 dark:text-primary-100 text-lg font-semibold">
					{m.home_open_title()}
				</h2>
				<FilePickerButton
					label={m.home_choose_file()}
					disabled={openBusy}
					onFile={handleOpenFile}
				/>
				{#if openError}
					<div
						class="mt-1 rounded border border-red-400 bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-300"
					>
						{openError}
					</div>
				{/if}
			</div>
		</BorderedContainer>
	</div>
{/if}
