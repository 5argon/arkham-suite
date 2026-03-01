<script lang="ts">
	import clsx from 'clsx';
	import FaIcon from '../icon/FaIcon.svelte';
	import { FaIconType } from '../icon/fa-icon-type.js';
	import { resolve } from '$app/paths';

	interface Prop {
		label: string;
		/** URL to navigate to (renders an `<a>`) or a click handler (renders a `<button>`). Mirrors {@link Button}. */
		onClick: string | (() => void);
		icon?: FaIconType;
		/**
		 * Colour tone. `default` uses the secondary accent (e.g. "Select all"); `warning`
		 * is amber for mildly destructive actions like resets.
		 */
		tone?: 'default' | 'warning';
		/** Text size. Defaults to `sm`. */
		size?: 'xs' | 'sm';
		disabled?: boolean;
		/** HTML button type. Defaults to "button" to avoid accidental form submission. */
		type?: 'button' | 'submit' | 'reset';
		/** When {@link onClick} is a URL, open it in a new tab. External (http) links always do. */
		newTab?: boolean;
	}
	const { label, onClick, icon, tone = 'default', size = 'sm', disabled, type = 'button', newTab }: Prop = $props();

	const isLink = $derived(typeof onClick === 'string');
	const clickHandler = $derived(typeof onClick === 'function' ? onClick : undefined);
	const isExternalLink = $derived(
		typeof onClick === 'string' &&
			(onClick.startsWith('http://') || onClick.startsWith('https://') || onClick.startsWith('//'))
	);
	const href = $derived.by(() => {
		if (isLink && typeof onClick === 'string') {
			return isExternalLink ? (onClick as string) : resolve(onClick as any);
		}
		return undefined;
	});
	const target = $derived(isExternalLink || (isLink && newTab) ? '_blank' : undefined);
	const rel = $derived(isExternalLink || (isLink && newTab) ? 'noreferrer' : undefined);

	const toneClass = $derived(
		tone === 'warning'
			? 'text-amber-600 hover:text-amber-700 active:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300 dark:active:text-amber-200'
			: 'text-secondary-600 hover:text-secondary-700 active:text-secondary-800 dark:text-secondary-400 dark:hover:text-secondary-300 dark:active:text-secondary-200'
	);
	const classes = $derived(
		clsx(
			'inline-flex cursor-pointer items-center gap-1 rounded hover:underline disabled:cursor-not-allowed disabled:opacity-50',
			size === 'xs' ? 'text-xs' : 'text-sm',
			toneClass
		)
	);
</script>

{#if isLink}
	<a {href} {target} {rel} class={classes}>
		{#if icon !== undefined}<FaIcon duotone {icon} />{/if}
		{label}
	</a>
{:else}
	<button {type} {disabled} onclick={() => clickHandler?.()} class={classes}>
		{#if icon !== undefined}<FaIcon duotone {icon} />{/if}
		{label}
	</button>
{/if}
