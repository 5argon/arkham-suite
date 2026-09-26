<script lang="ts">
	import { page } from '$app/state';
	import * as m from '$lib/paraglide/messages.js';
	import { classDisplayName } from '$lib/campaign/profile/profile-slugs';
	import CustomizePane from '$lib/components/profile/_framework/CustomizePane.svelte';

	const slug = $derived((page.params as { class: string }).class);
</script>

<CustomizePane
	pane="investigatorClassDetail"
	title={m.framework_customize_subpage({
		section: m.framework_page_crumb_investigators(),
		page: classDisplayName(slug)
	})}
/>
