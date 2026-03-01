<script>
	import { PageLead } from '@5argon/arkham-life-ui';
	import * as m from '$lib/paraglide/messages.js';
</script>

<svelte:head>
	<title>{m.export_page_title()}</title>
</svelte:head>

<PageLead description={m.export_description()} title={m.export_title()}></PageLead>
