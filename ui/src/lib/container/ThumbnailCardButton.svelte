<!--
@component
A thumbnail card button with responsive image/text layout. The whole box, drawn like a
BorderedContainer, is what's pressed.
-->
<script lang="ts">
	import clsx from 'clsx';
	import { resolve } from '$app/paths';

	interface Props {
		imageUrl: string;
		title: string;
		description: string;
		onClick: string | (() => void);
	}

	const { imageUrl, title, description, onClick }: Props = $props();

	const isLink = $derived(typeof onClick === 'string');
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
	const boxClass = clsx(
		'group block w-full cursor-pointer rounded border p-2 lg:p-4 [--page-text-inset:0px]',
		'border-primary-900/10 bg-primary-50/50 dark:border-primary-200/10 dark:bg-primary-950/10',
		'hover:border-primary-400 hover:bg-primary-100 dark:hover:border-primary-500 dark:hover:bg-primary-900/60',
		'active:bg-primary-200 dark:active:bg-primary-800/60',
		'focus-visible:outline-secondary-500 focus-visible:outline-2 focus-visible:outline-offset-2'
	);
</script>

{#snippet content()}
	<div class="flex w-full flex-col gap-2 md:flex-row md:gap-4">
		<!-- A thin strip of the picture, so a list of these stays short. -->
		<div class="mx-auto h-20 w-full shrink-0 md:mx-0 md:w-48">
			<img
				src={imageUrl}
				alt={title}
				class="h-full w-full rounded object-cover group-hover:brightness-110 group-active:brightness-95"
			/>
		</div>
		<div class="flex flex-1 flex-col justify-center px-2 md:h-20 md:overflow-hidden md:px-0">
			<div
				class="text-secondary-700 dark:text-secondary-400 font-heading mb-0.5 text-lg font-semibold md:line-clamp-1 md:text-base"
			>
				{title}
			</div>
			<p class="text-sm text-black md:line-clamp-3 md:text-xs dark:text-white">{description}</p>
		</div>
	</div>
{/snippet}

{#if isLink && typeof onClick === 'string'}
	<a href={onClick} {target} class={clsx(boxClass, 'no-underline')}>
		{@render content()}
	</a>
{:else}
	<button type="button" onclick={handleClick} class={clsx(boxClass, 'text-left')}>
		{@render content()}
	</button>
{/if}
