<!--
@component
This will be in &lt;h2&gt;.
-->
<script module lang="ts">
	interface Props {
		title: string;
		accentColor?: string;
	}
</script>

<script lang="ts">
	const { title, accentColor }: Props = $props();
</script>

<h2 class="text-secondary-900 dark:text-secondary-100 my-4 text-xl sm:text-3xl">
	{title}
</h2>

<style>
	h2 {
		font-family: 'Heading';
	}
</style>
