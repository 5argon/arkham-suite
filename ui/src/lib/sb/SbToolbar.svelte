<script lang="ts">
	interface Props {
		theme: 'light' | 'dark';
		language: string;
	}

	let { theme = $bindable('light'), language = $bindable('en') }: Props = $props();

	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { localizeHref, deLocalizeUrl, locales } from '../paraglide/runtime';

	type AvailableLanguageTag = (typeof locales)[number];

	function switchToLanguage(newLanguage: AvailableLanguageTag) {
		const canonicalPath = deLocalizeUrl($page.url).pathname;
		const localisedPath = localizeHref(canonicalPath, { locale: newLanguage });
		goto(localisedPath);
	}
</script>

<nav class="flex items-center px-8 py-2">
	<a href="/"><h1 class="mx-4 hidden font-bold text-black sm:block dark:text-white">UI Development</h1></a>
	<button
		class="hover:bg-secondary-300 dark:hover:bg-secondary-700 mx-2 w-24 border border-black px-4 py-1 text-black dark:border-white dark:text-white"
		onclick={() => {
			if (theme === 'dark') {
				theme = 'light';
			} else {
				theme = 'dark';
			}
		}}>{theme === 'light' ? 'Light' : 'Dark'}</button
	>
	<button
		class="hover:bg-secondary-300 dark:hover:bg-secondary-700 mx-2 w-24 border border-black px-4 py-1 text-black dark:border-white dark:text-white"
		onclick={() => {
			if (language === 'en') {
				language = 'th';
				switchToLanguage('th');
			} else {
				language = 'en';
				switchToLanguage('en');
			}
		}}>{language === 'en' ? 'English' : 'Thai'}</button
	>
</nav>
