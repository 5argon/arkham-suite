<!--
@component
This will be in &lt;h3&gt;.
-->
<script module lang="ts">
	interface Props {
		title: string;
		inner?: boolean;
		accentColor?: string;
	}
</script>

<script lang="ts">
	import { FaIconType } from '../icon';

	import FaIcon from '../icon/FaIcon.svelte';

	const { title, inner, accentColor }: Props = $props();
</script>

<div>
	{#if !inner}
		<h3 class="text-secondary-900 dark:text-secondary-100 mt-2 text-xl">
			<span class="text-[1rem]"><FaIcon duotone icon={FaIconType.SectionSeparator} /></span>
			<span>{title}</span>
		</h3>
		<hr class="dark:border-secondary-400/20 border-secondary-800/40 mb-1" />
	{:else}
		<h4 class="text-secondary-700 dark:text-secondary-300 text-base">
			<span>{title}</span>
		</h4>
		<hr
			class="dark:border-secondary-400/40 border-secondary-400/40 mb-1 border-dashed"
		/>
	{/if}
</div>
