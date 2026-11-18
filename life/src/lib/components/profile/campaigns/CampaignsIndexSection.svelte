<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import ProfileWidgets from '$lib/components/profile/_framework/ProfileWidgets.svelte';
	import { ProfilePane } from '$lib/components/profile/_primitives';
</script>

<ProfilePane title={m.campaigns_index_page_title()}>
	{#snippet children(data)}
		<ProfileWidgets rows={data.settings.panes.campaignsHome} payload={data} />
	{/snippet}
</ProfilePane>
