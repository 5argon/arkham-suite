<!--
@component
When something came out, which is not the same as the point in time it speaks about, and when it was
last changed if it has been.
-->
<script lang="ts">
	import FaIcon from '../icon/FaIcon.svelte';
	import { FaIconType } from '../icon/fa-icon-type.js';
	import * as m from '../paraglide/messages.js';

	interface Prop {
		date: string;
		updated?: string;
	}
	const { date, updated }: Prop = $props();
</script>

<span
	class="text-primary-800 dark:text-primary-200 inline-flex items-center gap-1 text-xs whitespace-nowrap"
	title={m.card_review_date({ date })}
>
	<FaIcon icon={FaIconType.Calendar} />
	{date}
	{#if updated}{m.card_review_updated({ date: updated })}{/if}
</span>
