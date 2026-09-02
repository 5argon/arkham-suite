<script module lang="ts">
	import type { Card } from '@5argon/arkham-kohaku';

	interface UserInfo {
		name: string;
		iconCard: Card;
		/** Optional. When omitted, the identity is shown but not clickable (no menu). */
		onSignOut?: () => void;
	}

	/** Save indicator; the consuming app owns what "save" means and feeds the state here. */
	interface SaveInfo {
		/** 'unsaved' shows the Save button; 'saving' shows progress; 'saved' shows a subtle confirmation (no button). */
		state: 'saved' | 'unsaved' | 'saving';
		onSave?: () => void;
		/** Heightened (data-loss) styling for the unsaved state. */
		escalated?: boolean;
		/** Extra context shown as a hover tooltip, e.g. "12 changes since last save". */
		detail?: string;
		/** Optional help link explaining why saving matters. */
		help?: { href: string };
	}

	/** A slim progress line pinned to the header's bottom edge — never shifts content. */
	interface LoadingInfo {
		active: boolean;
		/** Determinate progress 0..1; omit for an indeterminate animation. */
		progress?: number;
	}

	interface Props {
		siteName: string;
		iconUrl?: string;
		theme?: 'light' | 'dark';
		onThemeChange?: (theme: 'light' | 'dark') => void;
		user?: UserInfo;
		/** Optional save indicator + Save button (used by arkham.life). */
		save?: SaveInfo;
		/** Optional loading bar overlaid on the header's bottom edge. */
		loading?: LoadingInfo;
	}
</script>

<script lang="ts">
	import { resolve } from '$app/paths';
	import * as m from '../paraglide/messages.js';
	import UserDisplay from '../card/UserDisplay.svelte';
	import Button from '../button/Button.svelte';

	const { siteName, iconUrl, theme = 'light', onThemeChange, user, save, loading }: Props = $props();

	let userMenuOpen = $state(false);

	// Warning (amber) by default; danger (red) once the consumer flags it escalated.
	const saveAccent = $derived(
		save?.escalated
			? {
					text: 'text-red-700 dark:text-red-300',
					button:
						'bg-red-200 text-red-900 hover:bg-red-300 dark:bg-red-900/50 dark:text-red-100 dark:hover:bg-red-900/70',
				}
			: {
					text: 'text-amber-700 dark:text-amber-300',
					button:
						'bg-amber-200 text-amber-900 hover:bg-amber-300 dark:bg-amber-900/50 dark:text-amber-100 dark:hover:bg-amber-900/70',
				},
	);

	function toggleTheme() {
		const newTheme = theme === 'light' ? 'dark' : 'light';
		onThemeChange?.(newTheme);
	}

	function handleSignOut() {
		userMenuOpen = false;
		user?.onSignOut?.();
	}
</script>

<div
	class="header-bg bg-primary-300/20 dark:bg-primary-950/20 text-primary-700 dark:text-secondary-100
	border-secondary-400 dark:border-secondary-600 relative flex flex-row items-center justify-between
	border-b-2 px-2 py-2 md:px-8 lg:px-16 mb-4"
>
	<a href={resolve('')} class="flex flex-row items-center gap-2">
		{#if iconUrl}
			<img src={iconUrl} alt="Site icon" class="icon" />
		{/if}
		<div class="site-name text-sm font-bold">
			{siteName.toUpperCase()}
		</div>
	</a>

	<div class="flex items-center gap-2">
	{#if save}
		{#if save.state === 'saving'}
			<span
				class="text-primary-500 dark:text-primary-300 flex items-center gap-1.5 text-xs"
				role="status"
				aria-live="polite"
			>
				<span
					class="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent"
					aria-hidden="true"
				></span>
				<span class="hidden sm:inline">{m.layout_saving()}</span>
			</span>
		{:else if save.state === 'unsaved'}
			<span
				class="flex items-center gap-1.5 text-xs font-medium {saveAccent.text}"
				title={save.detail}
			>
				<span class="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true"></span>
				<span class="hidden sm:inline">{m.layout_unsaved_changes()}</span>
			</span>
			{#if save.onSave}
				<button
					onclick={save.onSave}
					class="cursor-pointer rounded px-2 py-1 text-xs font-semibold transition-colors {saveAccent.button}"
				>
					{m.layout_save()}
				</button>
			{/if}
			{#if save.help}
				<a
					href={save.help.href}
					class="hidden h-5 w-5 items-center justify-center rounded-full border border-current text-[10px] font-bold opacity-70 hover:opacity-100 sm:flex {saveAccent.text}"
					aria-label={m.layout_why_save_aria()}
				>
					?
				</a>
			{/if}
		{:else}
			<span
				class="text-primary-400 dark:text-primary-500 flex items-center gap-1 text-xs"
				title={save.detail}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="14"
					height="14"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2.5"
					stroke-linecap="round"
					stroke-linejoin="round"
					aria-hidden="true"
				>
					<polyline points="20 6 9 17 4 12"></polyline>
				</svg>
				<span class="hidden sm:inline">{m.layout_saved()}</span>
			</span>
		{/if}
	{/if}
	{#if onThemeChange}
		<button
			onclick={toggleTheme}
			class="theme-toggle p-2 rounded-lg hover:bg-primary-400/20 dark:hover:bg-primary-800/20 transition-colors"
			aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
		>
			{#if theme === 'light'}
				<!-- Moon icon for dark mode -->
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="20"
					height="20"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
				</svg>
			{:else}
				<!-- Sun icon for light mode -->
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="20"
					height="20"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<circle cx="12" cy="12" r="5"></circle>
					<line x1="12" y1="1" x2="12" y2="3"></line>
					<line x1="12" y1="21" x2="12" y2="23"></line>
					<line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
					<line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
					<line x1="1" y1="12" x2="3" y2="12"></line>
					<line x1="21" y1="12" x2="23" y2="12"></line>
					<line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
					<line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
				</svg>
			{/if}
		</button>
	{/if}

	{#if user}
		{#if user.onSignOut}
			<div class="relative">
				<button
					onclick={() => (userMenuOpen = !userMenuOpen)}
					class="flex cursor-pointer items-center gap-2 rounded-lg p-1 hover:bg-primary-400/20 dark:hover:bg-primary-800/20"
					aria-label="User menu"
				>
					<UserDisplay username={user.name} card={user.iconCard} size="sm" />
				</button>

				{#if userMenuOpen}
					<div
						class="border-primary-300 dark:border-primary-600 bg-primary-100 dark:bg-primary-900 absolute right-0 top-full z-50 mt-1 rounded border p-2 shadow-lg"
					>
						<Button danger label="Sign Out" onClick={handleSignOut} />
					</div>
				{/if}
			</div>
		{:else}
			<!-- Identity shown without account actions: not clickable. -->
			<div class="flex items-center gap-2 p-1">
				<UserDisplay username={user.name} card={user.iconCard} size="sm" />
			</div>
		{/if}
	{/if}
	</div>

	{#if loading?.active}
		<!-- Slim progress line on the header's bottom edge. Absolutely positioned so it
		     overlays the border instead of pushing page content down. -->
		<div
			class="pointer-events-none absolute inset-x-0 bottom-0 h-1 overflow-hidden"
			aria-hidden="true"
		>
			{#if loading.progress != null}
				<div
					class="bg-secondary-500 dark:bg-secondary-400 h-full transition-[width] duration-300 ease-out"
					style="width: {Math.min(100, Math.max(0, Math.round(loading.progress * 100)))}%"
				></div>
			{:else}
				<div class="bg-secondary-500 dark:bg-secondary-400 h-full w-1/3 animate-pulse"></div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.site-name {
		font-family: 'Heading';
	}
	.header-bg {
		backdrop-filter: blur(3px);
	}
	.icon {
		width: 20px;
		height: 20px;
	}
</style>
