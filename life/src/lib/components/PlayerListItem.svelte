<!--
@component
Reusable list item for displaying a player (user/sub-user) in a list.
Shows their icon, username, UID, and optional public description.
Slots for action buttons on the right.
-->
<script lang="ts">
	import { UserDisplay } from '@5argon/arkham-life-ui';
	import type { createCardResolver } from '$lib/card-data.js';
	import type { Snippet } from 'svelte';

	interface Props {
		username: string;
		iconCardCode: string;
		uid?: string | null;
		publicDescription?: string | null;
		cardResolver: ReturnType<typeof createCardResolver>;
		/** Optional slot for action buttons placed on the right side. */
		actions?: Snippet;
	}

	const { username, iconCardCode, uid, publicDescription, cardResolver, actions }: Props = $props();

	const card = $derived(cardResolver.resolve(iconCardCode));
</script>

<div class="flex items-center gap-3 px-4 py-3">
	<div class="min-w-0 flex-1">
		<UserDisplay {username} {card} size="md" />
		{#if publicDescription}
			<p class="text-primary-700 dark:text-primary-300 mt-1 text-xs">
				{publicDescription}
			</p>
		{/if}
		{#if uid}
			<p class="text-primary-400 dark:text-primary-500 mt-1 font-mono text-xs">
				UID: {uid}
			</p>
		{/if}
	</div>
	{#if actions}
		<div class="flex shrink-0 gap-2">
			{@render actions()}
		</div>
	{/if}
</div>
