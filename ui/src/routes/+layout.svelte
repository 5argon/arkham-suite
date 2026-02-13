<script lang="ts">
	import '../app.css';
	import Body from '$lib/layout/Body.svelte';
	import SbToolbar from '$lib/sb/SbToolbar.svelte';
	import SbWorkArea from '$lib/sb/SbWorkArea.svelte';
	let { children } = $props();
	let theme: 'light' | 'dark' = $state('dark');
	let language: 'en' | 'th' = $state('en');
</script>

<Body {theme}>
	<SbToolbar bind:language bind:theme />
	<SbWorkArea>
		{@render children()}
	</SbWorkArea>
</Body>
