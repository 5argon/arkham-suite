<script lang="ts">
	import type { Snippet } from 'svelte';
	import { onMount } from 'svelte';
	import { Body, HeaderBar, Main } from '@5argon/arkham-life-ui';
	import '../app.css';
	import Footer from '$lib/design/components/layout/Footer.svelte';
	import { themeStorage } from '$lib/storage';

	interface Props {
		children: Snippet;
	}

	const { children }: Props = $props();

	let theme = $state<'light' | 'dark'>('light');

	onMount(() => {
		// Load theme from storage on mount
		theme = themeStorage.get();
	});

	function handleThemeChange(newTheme: 'light' | 'dark') {
		theme = newTheme;
		themeStorage.set(newTheme);
	}
</script>

<Body {theme}>
	<HeaderBar
		iconUrl="/image/icon/stat/intellect.png"
		onThemeChange={handleThemeChange}
		siteName="arkham-starter.com"
		{theme}
	/>
	<Main {children} />
	<Footer />
</Body>
