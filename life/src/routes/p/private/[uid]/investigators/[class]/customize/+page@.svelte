<script lang="ts">
	import { page } from '$app/state';
	import { u as stringUtils } from '@5argon/arkham-string';
	import { CardClass } from '@5argon/arkham-kohaku';
	import CustomizePane from '$lib/components/profile/_framework/CustomizePane.svelte';

	const slug = $derived((page.params as { class: string }).class);
	const title = $derived(
		(Object.values(CardClass) as string[]).includes(slug) ? stringUtils.cardClass(slug as CardClass) : slug,
	);
</script>

<CustomizePane pane="investigatorClassDetail" title={`Investigators — ${title}`} />
