<script lang="ts">
	import SvelteMarkdown from 'svelte-marked';

	import mdText from '$lib/md/about.md?raw';
	import * as m from '$lib/paraglide/messages.js';
</script>

<svelte:head>
	<title>{m.about_page_title()}</title>
</svelte:head>

<h1>{m.about_title()}</h1>
<SvelteMarkdown source={mdText} />
