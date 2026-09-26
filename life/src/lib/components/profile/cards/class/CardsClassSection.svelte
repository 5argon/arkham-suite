<script lang="ts">
	import { page } from '$app/state';
	import { classDisplayName, resolveClassSlug } from '$lib/campaign/profile/profile-slugs';
	import ProfileWidgets from '$lib/components/profile/_framework/ProfileWidgets.svelte';
	import { ProfilePane } from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';

	const cardClass = $derived(resolveClassSlug(page.params.section ?? ''));
</script>

<ProfilePane
	title={cardClass
		? m.cards_class_title({ cardClass: classDisplayName(cardClass) })
		: m.cards_class_title_fallback()}
	deckDerived
	unknown={cardClass ? null : m.cards_class_unknown()}
>
	{#snippet children(data)}
		<ProfileWidgets rows={data.settings.panes.cardClassDetail} payload={data} classFilter={cardClass} />
	{/snippet}
</ProfilePane>
