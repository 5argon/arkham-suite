<!--
@component
A styled unordered list for displaying links, commonly used for download links or external resources.
-->
<script module lang="ts">
	export interface LinkItem {
		href: string;
		label: string;
		target?: string;
		rel?: string;
	}

	interface Props {
		items: LinkItem[];
	}
</script>

<script lang="ts">
	const { items }: Props = $props();
</script>

<ul class="my-4 space-y-2">
	{#each items as item}
		<li>
			<a
				href={item.href}
				target={item.target ?? '_blank'}
				rel={item.rel ?? 'noreferrer'}
				class="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 underline"
			>
				{item.label}
			</a>
		</li>
	{/each}
</ul>
