<script lang="ts">
	import { page } from '$app/state';
	import { classDisplayName, resolveClassSlug } from '$lib/campaign/profile/profile-slugs';
	import ProfileWidgets from '$lib/components/profile/_framework/ProfileWidgets.svelte';
	import { ProfilePane } from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';

	const cardClass = $derived(resolveClassSlug(page.params.class ?? ''));
</script>

<ProfilePane
	title={m.investigators_class_title({
		className: cardClass ? classDisplayName(cardClass) : m.investigators_class_fallback_name()
	})}
	deckDerived
	unknown={cardClass ? null : m.investigators_class_unknown()}
>
	{#snippet children(data)}
		<ProfileWidgets
			rows={data.settings.panes.investigatorClassDetail}
			payload={data}
			classFilter={cardClass}
		/>
	{/snippet}
</ProfilePane>
