<!--
@component
When something came out, which is not the same as the point in time it speaks about.
-->
<script lang="ts">
	import FaIcon from '../icon/FaIcon.svelte';
	import { FaIconType } from '../icon/fa-icon-type.js';
	import * as m from '../paraglide/messages.js';

	interface Prop {
		date: string;
	}
	const { date }: Prop = $props();
</script>

<span
	class="text-primary-800 dark:text-primary-200 inline-flex items-center gap-1 text-xs whitespace-nowrap"
	title={m.card_review_date({ date })}
>
	<FaIcon icon={FaIconType.Calendar} />
	{date}
</span>
