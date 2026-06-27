<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { Body, HeaderBar, Main, Toast, createToastContext } from '@5argon/arkham-life-ui';
	import '../app.css';
	import { themeStorage } from '$lib/storage';
	import { getAllCards } from '$lib/card-data';
	import { databaseStore } from '$lib/database/database.svelte';
	import { ensureDatabaseLoaded, requestPersistentStorage, BOOTSTRAP_ROUTES } from '$lib/database/bootstrap';
	import { backupStatus, isEscalated, lastBackupLabel, needsBackup } from '$lib/database/backup-status';
	import { preloader } from '$lib/preload/preloader.svelte';

	import type { LayoutProps } from './$types';

	const { children }: LayoutProps = $props();

	let theme = $state<'light' | 'dark'>('light');

	onMount(async () => {
		theme = themeStorage.get();

		// Hydrate the database from IndexedDB, then send first-time visitors to the
		// bootstrap screen.
		await ensureDatabaseLoaded();
		const path = window.location.pathname;
		// The home page shows its own "Set up your database" card, so don't bounce
		// people off it on refresh — only force-redirect from gated routes.
		const isHome = path === '/';
		const onBootstrapRoute = BOOTSTRAP_ROUTES.some((r) => path.startsWith(r));
		if (!databaseStore.hasDatabase && !isHome && !onBootstrapRoute) {
			goto('/new');
		} else if (databaseStore.hasDatabase) {
			// Keep the local data durable against eviction (best-effort).
			void requestPersistentStorage();
		}
	});

	function handleThemeChange(newTheme: 'light' | 'dark') {
		theme = newTheme;
		console.log('Setting theme to', newTheme);
		themeStorage.set(newTheme);
	}

	const allCards = getAllCards();

	const userInfo = $derived.by(() => {
		const owner = databaseStore.doc?.owner;
		if (!owner) return undefined;
		const iconCard = allCards.find((c) => c.code === owner.iconCardCode);
		if (!iconCard) return undefined;
		// No account to sign out of; show the identity but make it inert for now.
		// Deleting the database lives on the Save / Load Database page instead.
		return { name: owner.name, iconCard };
	});

	// Create toast context so all child pages/components can call getToastContext()
	const toast = createToastContext();

	// ─── Save-to-file status (local build) ───────────────────────────────────────
	// Edits autosave to IndexedDB, but the browser can evict that without warning; the
	// exported .ahlifedb file is the user's durable copy. The header shows whether the
	// database has unsaved (un-exported) changes and offers a Save button — desktop
	// style, on every page, instead of an intrusive home-page banner.
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
		// `needsBackup` short-circuits on the change counter (localStorage, not reactive);
		// read `updatedAt` so this re-runs on every edit and keeps the count/escalation fresh.
		void doc.updatedAt;
		if (exporting) return { state: 'saving' as const };
		const last = backupStatus().lastExportAt;
		const lastLabel = last != null ? `Last saved ${lastBackupLabel()}` : undefined;
		if (!needsBackup(doc)) {
			return { state: 'saved' as const, detail: lastLabel };
		}
		const changes = backupStatus().unexportedChanges;
		const detail =
			changes > 0
				? `${changes} change${changes === 1 ? '' : 's'} since last save${last != null ? ` · last saved ${lastBackupLabel()}` : ''}`
				: lastLabel;
		return {
			state: 'unsaved' as const,
			escalated: isEscalated(),
			detail,
			onSave: saveToFile,
			help: { href: '/guides' },
		};
	});

	const loading = $derived({
		active: preloader.progress.active,
		progress:
			preloader.progress.total > 0 ? preloader.progress.done / preloader.progress.total : undefined,
	});
</script>

<Body {theme}>
	<!-- Toast overlay – floats above everything at z-index 200 -->
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

	<Main {children} />
</Body>
