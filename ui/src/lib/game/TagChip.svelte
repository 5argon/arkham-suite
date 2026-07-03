<!--
@component
A richly-styled, clickable chip for a game-effect tag or compound archetype: an icon, the
tag name, any arguments rendered as distinct key/value pills (so the argument is easy to
read apart from the name), and an optional card-count badge. Presentational only — pass
already-resolved strings; this has no dependency on the tags package.

Pass a URL string as `onClick` to render a real <a> anchor (so open-in-new-tab / middle-click
work); pass a function to render a <button>. Mirrors the Button component's onClick contract.
-->
<script lang="ts" module>
	export interface TagChipArg {
		/** The argument name, e.g. "value" or "action". */
		key: string;
		/** The already-formatted argument value, e.g. "1" or "fight". */
		value: string;
	}
</script>

<script lang="ts">
	import clsx from 'clsx';
	import FaIcon from '../icon/FaIcon.svelte';
	import type { FaIconType } from '../icon/fa-icon-type.js';

	interface Prop {
		label: string;
		args?: TagChipArg[];
		icon?: FaIconType;
		/** Use the secondary (purple) palette — e.g. compound archetypes / conditioned members. */
		highlighted?: boolean;
		/** Card count shown as a trailing badge. Omit to hide. */
		count?: number;
		/** Draw attention with a ring — e.g. this base tag drives a hovered compound. */
		emphasized?: boolean;
		/**
		 * A URL string → renders a real <a> anchor (so open-in-new-tab / middle-click work); a
		 * function → renders a <button>. In-app URLs get client-side SPA navigation without a
		 * scroll reset, matching the previous button behavior.
		 */
		onClick?: string | (() => void);
		onMouseEnter?: () => void;
		onMouseLeave?: () => void;
		/** Optional tooltip. */
		title?: string;
	}

	const {
		label,
		args = [],
		icon,
		highlighted = false,
		count,
		emphasized = false,
		onClick,
		onMouseEnter,
		onMouseLeave,
		title
	}: Prop = $props();

	const href = $derived(typeof onClick === 'string' ? onClick : undefined);
	const clickHandler = $derived(typeof onClick === 'function' ? onClick : undefined);

	const chipClass = $derived(
		clsx(
			'inline-flex cursor-pointer items-center gap-1.5 rounded border py-1 pr-1.5 pl-2 text-sm shadow-sm transition hover:brightness-105 active:brightness-100 dark:hover:brightness-110',
			highlighted
				? 'border-secondary-300 bg-secondary-50 dark:border-secondary-600 dark:bg-secondary-900'
				: 'border-primary-300 bg-primary-50 dark:border-primary-600 dark:bg-primary-800',
			emphasized && 'ring-secondary-400 dark:ring-secondary-400 ring-2 ring-offset-1 brightness-105'
		)
	);
</script>

{#snippet chipInner()}
	{#if icon !== undefined}
		<FaIcon duotone {icon} />
	{/if}
	<span
		class={clsx(
			'font-medium',
			highlighted
				? 'text-secondary-800 dark:text-secondary-100'
				: 'text-primary-800 dark:text-primary-100'
		)}
	>
		{label}
	</span>

	{#each args as arg, i (arg.key + i)}
		<span
			class={clsx(
				'inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs',
				highlighted
					? 'bg-secondary-200/70 dark:bg-secondary-700/60'
					: 'bg-primary-200/70 dark:bg-primary-700/60'
			)}
		>
			<span
				class={clsx(
					'tracking-wide uppercase opacity-60',
					highlighted
						? 'text-secondary-900 dark:text-secondary-200'
						: 'text-primary-900 dark:text-primary-200'
				)}>{arg.key}</span
			>
			<span
				class={clsx(
					'font-semibold tabular-nums',
					highlighted
						? 'text-secondary-950 dark:text-secondary-50'
						: 'text-primary-950 dark:text-primary-50'
				)}>{arg.value}</span
			>
		</span>
	{/each}

	{#if count !== undefined}
		<span
			class={clsx(
				'ml-0.5 inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-xs font-semibold tabular-nums',
				highlighted
					? 'bg-secondary-500/15 text-secondary-700 dark:bg-secondary-400/20 dark:text-secondary-200'
					: 'bg-primary-500/15 text-primary-600 dark:bg-primary-400/20 dark:text-primary-200'
			)}>{count}</span
		>
	{/if}
{/snippet}

{#if href !== undefined}
	<a
		{href}
		{title}
		data-sveltekit-noscroll
		onmouseenter={onMouseEnter}
		onmouseleave={onMouseLeave}
		class={chipClass}
	>
		{@render chipInner()}
	</a>
{:else}
	<button
		type="button"
		{title}
		onclick={clickHandler}
		onmouseenter={onMouseEnter}
		onmouseleave={onMouseLeave}
		class={chipClass}
	>
		{@render chipInner()}
	</button>
{/if}
