<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { Body, HeaderBar, Main, Toast, createToastContext } from '@5argon/arkham-life-ui';
	import '../app.css';
	import * as m from '$lib/paraglide/messages.js';
	import { themeStorage } from '$lib/storage';
	import { cardByCode } from '$lib/card-data';
	import DatabaseLoadError from '$lib/components/DatabaseLoadError.svelte';
	import { databaseStore } from '$lib/database/database.svelte';
	import {
		BOOTSTRAP_ROUTES,
		ensureDatabaseLoaded,
		requestPersistentStorage
	} from '$lib/database/bootstrap';
	import { saveStatus } from '$lib/database/save-status.svelte';
	import { preloader } from '$lib/preload/preloader.svelte';

	import type { LayoutProps } from './$types';

	const { children }: LayoutProps = $props();

	let theme = $state<'light' | 'dark'>('light');

	onMount(async () => {
		theme = themeStorage.get();
		await ensureDatabaseLoaded();
		const path = window.location.pathname;
		// Home shows its own empty state; other routes need a database.
		const gated = path !== '/' && !BOOTSTRAP_ROUTES.some((r) => path.startsWith(r));
		if (databaseStore.status === 'empty' && gated) goto('/new');
		else if (databaseStore.hasDatabase) void requestPersistentStorage();
	});

	function handleThemeChange(newTheme: 'light' | 'dark') {
		theme = newTheme;
		themeStorage.set(newTheme);
	}

	const userInfo = $derived.by(() => {
		const owner = databaseStore.doc?.owner;
		const iconCard = owner && cardByCode(owner.iconCardCode);
		return owner && iconCard ? { name: owner.name, iconCard } : undefined;
	});

	const toast = createToastContext();

	let exporting = $state(false);

	async function saveToFile() {
		exporting = true;
		try {
			await databaseStore.exportDatabaseNow();
		} finally {
			exporting = false;
		}
	}

	const save = $derived.by(() => {
		const doc = databaseStore.doc;
		if (!doc) return undefined;
		if (exporting) return { state: 'saving' as const };
		const detail = saveStatus.summary() ?? undefined;
		if (!saveStatus.needsSave(doc)) return { state: 'saved' as const, detail };
		return {
			state: 'unsaved' as const,
			escalated: saveStatus.escalated,
			detail,
			onSave: saveToFile,
			help: { href: '/guides' }
		};
	});

	const loading = $derived({
		active: preloader.progress.active,
		progress:
			preloader.progress.total > 0 ? preloader.progress.done / preloader.progress.total : undefined
	});
</script>

<Body {theme}>
	{#if toast.state}
		{#key toast.state.key}
			<Toast
				message={toast.state.message}
				type={toast.state.type}
				visible={toast.state.visible}
				onDismiss={() => toast.dismiss()}
			/>
		{/key}
	{/if}

	<HeaderBar
		iconUrl="/image/icon/stat/agility.png"
		onThemeChange={handleThemeChange}
		siteName="arkham.life"
		{theme}
		user={userInfo}
		{save}
		{loading}
	/>

	<Main>
		{#if databaseStore.status === 'error'}
			<DatabaseLoadError />
		{:else}
			{#if databaseStore.lastError}
				<div
					role="alert"
					class="mb-4 rounded border border-red-400 bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-300"
				>
					{m.database_save_error({ error: databaseStore.lastError })}
				</div>
			{/if}
			{@render children()}
		{/if}
	</Main>
</Body>
