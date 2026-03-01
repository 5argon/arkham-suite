<script lang="ts">
	import { onMount } from 'svelte';
	import { dev } from '$app/environment';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { Body, HeaderBar, Main, Toast, createToastContext } from '@5argon/arkham-life-ui';
	import '../app.css';
	import { themeStorage } from '$lib/storage';
	import { getAllCards } from '$lib/card-data';
	import { databaseStore } from '$lib/database/database.svelte';
	import { ensureDatabaseLoaded, requestPersistentStorage, BOOTSTRAP_ROUTES } from '$lib/database/bootstrap';
	import { backupStatus, isEscalated, lastBackupLabel, needsBackup } from '$lib/database/backup-status';
	import { preloader } from '$lib/preload/preloader.svelte';
	import PreloadProgressBar from '$lib/components/PreloadProgressBar.svelte';

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

	// ─── Backup reminder (local build) ───────────────────────────────────────────
	// IndexedDB can be evicted by the browser without warning; the exported file is
	// the user's only real backup. Nag (clearly) when there are un-exported changes.
	let bannerTick = $state(0);
	let dismissedAt = $state<number | null>(null);

	const backupBanner = $derived.by(() => {
		// Only nag on the home page — elsewhere it's noise on top of every screen.
		if (page.url.pathname !== '/') return null;
		bannerTick; // lets `exportFromBanner` force a recompute
		const doc = databaseStore.doc;
		if (!doc || !needsBackup(doc)) return null;
		if (dismissedAt === doc.updatedAt) return null;
		const s = backupStatus();
		return { escalated: isEscalated(), changes: s.unexportedChanges, last: lastBackupLabel() };
	});

	async function exportFromBanner() {
		await databaseStore.exportDatabaseNow();
		bannerTick++;
	}
	function dismissBanner() {
		if (databaseStore.doc) dismissedAt = databaseStore.doc.updatedAt;
	}
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
	/>

	<!-- Dev-only: a debugging readout of background preloading. `dev` is statically
	     false in production builds, so this (and the component) is tree-shaken out. -->
	{#if dev}
		<PreloadProgressBar
			active={preloader.progress.active}
			done={preloader.progress.done}
			total={preloader.progress.total}
			ready={preloader.progress.ready}
		/>
	{/if}

	{#if backupBanner}
		<div
			class="px-4 py-3 text-sm {backupBanner.escalated
				? 'bg-red-100 text-red-900 dark:bg-red-900/40 dark:text-red-100'
				: 'bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-100'}"
			role="alert"
		>
			<div class="mx-auto flex max-w-5xl flex-wrap items-center gap-x-3 gap-y-2">
				<span>
					<strong>Your changes live only in this browser.</strong>
					They are not a file on your computer, and the browser can delete them without warning (clearing
					site data, private browsing, low disk space).
					{#if backupBanner.changes > 0}
						{backupBanner.changes} change{backupBanner.changes === 1 ? '' : 's'} since you last saved ({backupBanner.last}).
					{:else}
						Last saved: {backupBanner.last}.
					{/if}
					Save your campaign database to a file to keep it safe.
				</span>
				<span class="ml-auto flex items-center gap-3">
					<button
						class="cursor-pointer rounded bg-black/10 px-3 py-1 font-semibold hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20"
						onclick={exportFromBanner}
					>
						Save now
					</button>
					<a class="cursor-pointer underline" href="/guides">Why?</a>
					<button class="cursor-pointer opacity-70 hover:opacity-100" aria-label="Dismiss" onclick={dismissBanner}>✕</button>
				</span>
			</div>
		</div>
	{/if}

	<Main {children} />
</Body>
