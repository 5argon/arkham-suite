<!--
@component
Toast notification that slides down from the top of the screen.
Rendered by <ToastHost> – do not use directly.
-->
<script lang="ts">
	import clsx from 'clsx';
	import type { ToastType } from './toast-context.svelte.js';

	interface Props {
		message: string;
		type: ToastType;
		visible: boolean;
		onDismiss: () => void;
	}

	const { message, type, visible, onDismiss }: Props = $props();

	const colorClass = $derived(
		type === 'success'
			? 'bg-green-600 text-white border-green-700'
			: type === 'error'
				? 'bg-red-600 text-white border-red-700'
				: 'bg-primary-700 dark:bg-primary-200 text-white dark:text-black border-primary-800 dark:border-primary-300',
	);

	const iconChar = $derived(type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ');
</script>

<div
	class={clsx(
		'fixed left-1/2 z-[200] flex -translate-x-1/2 items-center gap-3 rounded-lg border px-5 py-3 shadow-xl transition-all duration-300',
		colorClass,
		visible ? 'top-5 opacity-100' : '-top-20 opacity-0 pointer-events-none',
	)}
	role="status"
	aria-live="polite"
>
	<span class="text-lg font-bold leading-none">{iconChar}</span>
	<span class="text-sm font-medium">{message}</span>
	<button
		type="button"
		class="ml-2 rounded p-0.5 opacity-75 hover:opacity-100 focus:outline-none"
		onclick={onDismiss}
		aria-label="Dismiss"
	>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="14"
			height="14"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="3"
			stroke-linecap="round"
			stroke-linejoin="round"
		>
			<line x1="18" y1="6" x2="6" y2="18"></line>
			<line x1="6" y1="6" x2="18" y2="18"></line>
		</svg>
	</button>
</div>
