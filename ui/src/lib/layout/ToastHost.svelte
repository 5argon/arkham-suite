<!--
@component
Place this once in your root layout. It creates the toast context and renders
the toast notification. Anywhere in the component tree you can call
`getToastContext()` to show messages.

Usage in layout:
  <ToastHost />
  <slot /> / {@render children()}

Usage anywhere:
  const toast = getToastContext();
  toast.success('Saved!');
  toast.error('Something went wrong.');
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import Toast from './Toast.svelte';
	import { createToastContext } from './toast-context.svelte.js';

	interface Props {
		children?: Snippet;
	}

	const { children }: Props = $props();

	const toast = createToastContext();
</script>

{#if toast.state}
	{#key toast.state.key}
		<Toast
			message={toast.state.message}
			type={toast.state.type}
			visible={toast.state.visible}
			onDismiss={() => toast.dismiss()}
		/>
	{/key}
{/if}

{#if children}
	{@render children()}
{/if}
