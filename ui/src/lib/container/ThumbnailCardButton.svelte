<!--
@component
A thumbnail card button using BorderedContainer with responsive image/text layout.
-->
<script lang="ts">
	import BorderedContainer from './BorderedContainer.svelte';
	import { resolve } from '$app/paths';

	interface Props {
		imageUrl: string;
		title: string;
		description: string;
		onClick: string | (() => void);
	}

	const { imageUrl, title, description, onClick }: Props = $props();

	const isLink = typeof onClick === 'string';
	const handleClick = () => {
		if (typeof onClick === 'function') {
			onClick();
		}
	};
	const isExternalLink = $derived(
		typeof onClick === 'string' &&
			(onClick.startsWith('http://') || onClick.startsWith('https://') || onClick.startsWith('//'))
	);
	const target = $derived(isExternalLink ? '_blank' : undefined);
</script>

{#snippet content()}
	<div class="flex w-full flex-col gap-4 md:flex-row">
		<div class="mx-auto h-40 w-full flex-shrink-0 md:mx-0 md:h-32 md:w-62.5">
			<img src={imageUrl} alt={title} class="h-full w-full rounded object-cover" />
		</div>
		<div class="flex flex-1 flex-col justify-center px-4 md:h-32 md:overflow-hidden">
			<div
				class="text-secondary-700 dark:text-secondary-400 font-heading mb-2 text-xl font-semibold md:line-clamp-2"
			>
				{title}
			</div>
			<p class="text-sm text-black md:line-clamp-3 dark:text-white">{description}</p>
		</div>
	</div>
{/snippet}

<BorderedContainer>
	{#if isLink}
		<a
			href={onClick}
			{target}
			class="hover:bg-primary-300/10 dark:hover:bg-primary-800/10 block w-full rounded no-underline transition-colors duration-200"
		>
			{@render content()}
		</a>
	{:else}
		<button
			onclick={handleClick}
			class="hover:bg-primary-300/10 dark:hover:bg-primary-800/10 w-full cursor-pointer rounded border-none bg-transparent p-0 text-left transition-colors duration-200"
		>
			{@render content()}
		</button>
	{/if}
</BorderedContainer>
