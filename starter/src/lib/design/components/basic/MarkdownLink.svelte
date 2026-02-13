<script lang="ts">
	let { href = '' }: { href?: string } = $props();

	// Check if it's an external link
	const isExternal = href.startsWith('http://') || href.startsWith('https://');
</script>

<a
	class="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 underline"
	{href}
	rel={isExternal ? 'noreferrer' : undefined}
	target={isExternal ? '_blank' : undefined}
>
	<slot />
</a>
