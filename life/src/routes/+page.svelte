<script lang="ts">
	import { onMount } from 'svelte';
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
	import DatabaseGate from '$lib/components/DatabaseGate.svelte';
	import OpenDatabaseFile from '$lib/components/OpenDatabaseFile.svelte';
	import { preloader } from '$lib/preload/preloader.svelte';

	onMount(async () => {
		await ensureDatabaseLoaded();
		if (databaseStore.hasDatabase) preloader.warmSection('home');
	});
</script>

<svelte:head>
	<title>{m.common_home_page_title()}</title>
</svelte:head>

<PageLead description={m.home_tagline()} title={m.common_arkham_life()}></PageLead>

<DatabaseGate>
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

	{#snippet empty()}
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
					<Button
						highlighted
						label={m.home_create_database()}
						icon={FaIconType.Add}
						onClick="/new"
					/>
				</div>
			</BorderedContainer>

			<BorderedContainer>
				<div class="flex h-full flex-col items-center gap-3 p-6 text-center">
					<h2 class="text-primary-900 dark:text-primary-100 text-lg font-semibold">
						{m.home_open_title()}
					</h2>
					<OpenDatabaseFile then="/archive" />
				</div>
			</BorderedContainer>
		</div>
	{/snippet}
</DatabaseGate>
