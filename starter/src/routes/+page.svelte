<script>
	import ResourcePage from './resource/ResourcePage.svelte';
	import { PageLead } from '@5argon/arkham-life-ui';
	import * as m from '$lib/paraglide/messages.js';
</script>

<svelte:head>
	<title>{m.common_home_page_title()}</title>
</svelte:head>

<PageLead description={m.common_home_description()} title={m.common_arkham_starter()}></PageLead>

<ResourcePage />
