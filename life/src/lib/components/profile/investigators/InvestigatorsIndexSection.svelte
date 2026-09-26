<script lang="ts">
	import { SectionSeparator } from '@5argon/arkham-life-ui';
	import { CardClass } from '@5argon/arkham-kohaku';
	import { classDisplayName } from '$lib/campaign/profile/profile-slugs';
	import ProfileWidgets from '$lib/components/profile/_framework/ProfileWidgets.svelte';
	import { NavTile, ProfilePane } from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';
</script>

<ProfilePane title={m.investigators_index_title()} deckDerived>
	{#snippet children(data, base)}
		<div class="mt-6">
			<SectionSeparator title={m.investigators_index_by_class()} />
			<div class="grid grid-cols-2 gap-2 sm:grid-cols-3">
				{#each Object.values(CardClass) as cls (cls)}
					<NavTile href="{base}/investigators/{cls}" label={classDisplayName(cls)} />
				{/each}
			</div>
		</div>
		<ProfileWidgets rows={data.settings.panes.investigatorsHome} payload={data} />
	{/snippet}
</ProfilePane>
