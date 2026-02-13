<script module lang="ts">
	interface Props {
		siteName: string;
		iconUrl?: string;
		theme?: 'light' | 'dark';
		onThemeChange?: (theme: 'light' | 'dark') => void;
	}
</script>

<script lang="ts">
	import { resolve } from "$app/paths";

	const { siteName, iconUrl, theme = 'light', onThemeChange }: Props = $props();

	function toggleTheme() {
		const newTheme = theme === 'light' ? 'dark' : 'light';
		onThemeChange?.(newTheme);
	}
</script>

<div
	class="header-bg bg-primary-300/20 dark:bg-primary-950/20 text-primary-700 dark:text-secondary-100
	border-secondary-400 dark:border-secondary-600 flex flex-row items-center justify-between
	border-b-2 px-2 py-2 md:px-8 lg:px-16 mb-4"
>
	<a href={resolve("/", {})} class="flex flex-row items-center gap-2">
		{#if iconUrl}
			<img src={iconUrl} alt="Site icon" class="icon" />
		{/if}
		<div class="site-name text-sm font-bold">
			{siteName.toUpperCase()}
		</div>
	</a>

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
