<script lang="ts">
	import clsx from 'clsx';
	import FaIcon from '../icon/FaIcon.svelte';
	import { FaIconType } from '../icon/fa-icon-type.js';
	import { resolve } from '$app/paths';

	interface Prop {
		label: string;
		/** URL to navigate to (renders as <a> tag for SEO) or custom click handler (renders as <button>) */
		onClick: string | (() => void);

		icon?: FaIconType;

		/**
		 * Rely on only {@link icon} for the graphic.
		 * The {@link label} is always required, but it turns into a tooltip if {@link hideLabel} is true.
		 */
		hideLabel?: boolean;

		highlighted?: boolean;
		danger?: boolean;
		disabled?: boolean;
	}
	const { icon, label, onClick, hideLabel, highlighted, danger, disabled }: Prop = $props();
	const hasText = $derived(!hideLabel);
	const paddingClass = $derived(hasText ? 'px-3' : 'px-1');
	const isLink = $derived(typeof onClick === 'string');
	const clickHandler = $derived(typeof onClick === 'function' ? onClick : undefined);
	const isExternalLink = $derived(
		typeof onClick === 'string' &&
			(onClick.startsWith('http://') || onClick.startsWith('https://') || onClick.startsWith('//'))
	);
	const href = $derived.by(()=>{
		if (isLink && typeof onClick === 'string') {
			if (isExternalLink) {
				return onClick as string;
			} else {
				return resolve(onClick, {});
			}
		}
		return undefined;
	})
	const target = $derived(isExternalLink ? '_blank' : undefined);
	const rel = $derived(isExternalLink ? 'noreferrer' : undefined);
	const baseClasses =
		'inline-flex cursor-pointer items-center justify-center space-x-2 rounded border py-1 shadow-md hover:brightness-105 active:brightness-100 dark:text-white dark:hover:brightness-110 dark:active:brightness-125 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:brightness-100 disabled:active:brightness-100';
</script>

{#snippet insideButton()}
	<span class="flex items-center justify-center gap-1">
		{#if icon !== undefined}
			<FaIcon duotone {icon} />
		{/if}
		{#if !hideLabel}
			<span
				class={clsx(
					highlighted
						? 'text-secondary-800 dark:text-secondary-200'
						: 'text-primary-800 dark:text-primary-200'
				)}>{label}</span
			>
		{/if}
	</span>
{/snippet}

{#if highlighted}
	{#if isLink}
		<a
			{href}
			{target}
			{rel}
			class={clsx(
				baseClasses,
				paddingClass,
				'border-secondary-600 dark:border-secondary-500 bg-secondary-200 dark:bg-secondary-800'
			)}
		>
			{@render insideButton()}
		</a>
	{:else}
		<button
			{disabled}
			onclick={() => {
				clickHandler?.();
			}}
			class={clsx(
				baseClasses,
				paddingClass,
				'border-secondary-600 dark:border-secondary-500 bg-secondary-200 dark:bg-secondary-800'
			)}
		>
			{@render insideButton()}
		</button>
	{/if}
{:else if danger}
	{#if isLink}
		<a
			{href}
			{target}
			{rel}
			class={clsx(
				baseClasses,
				paddingClass,
				'border-red-400 bg-red-200 dark:border-red-500 dark:bg-red-900'
			)}
		>
			{@render insideButton()}
		</a>
	{:else}
		<button
			{disabled}
			onclick={() => {
				clickHandler?.();
			}}
			class={clsx(
				baseClasses,
				paddingClass,
				'border-red-400 bg-red-200 dark:border-red-500 dark:bg-red-900'
			)}
		>
			{@render insideButton()}
		</button>
	{/if}
{:else if isLink}
	<a
		{href}
		{target}
		{rel}
		class={clsx(
			baseClasses,
			paddingClass,
			'border-primary-400 dark:border-primary-500 bg-primary-100 dark:bg-primary-800'
		)}
	>
		{@render insideButton()}
	</a>
{:else}
	<button
		{disabled}
		onclick={() => {
			clickHandler?.();
		}}
		class={clsx(
			baseClasses,
			paddingClass,
			'border-primary-400 dark:border-primary-500 bg-primary-100 dark:bg-primary-800'
		)}
	>
		{@render insideButton()}
	</button>
{/if}
